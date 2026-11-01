"""
ReportUIInspector - DOM Structure Inspector for Dialog Components using Playwright.
This module strictly performs read-only UI inspection and analysis on dialog DOM structures.
No form submission or state mutation on external services is performed.
"""

import json
import logging
from datetime import datetime
from typing import Any, Dict, List, Optional
from playwright.sync_api import Locator, Page, TimeoutError as PlaywrightTimeoutError

logger = logging.getLogger("ReportUIInspector")


class ReportUIInspector:
    """
    Inspector class to analyze and inspect DOM structures of web dialogs/modals
    using resilient, class-agnostic Playwright locators.
    """

    DEFAULT_MODAL_SELECTOR = '[data-e2e="report-modal"]'
    FALLBACK_MODAL_SELECTOR = '[role="dialog"], [id="login-modal"] > div'

    def __init__(self, page: Page):
        """
        Initialize inspector with an active Playwright Page instance.
        """
        self.page = page

    def find_dialog_locator(self, selector: Optional[str] = None, allow_fallback: bool = False, timeout: float = 5000) -> Optional[Locator]:
        """
        Locate the dialog element using primary stable attribute selector,
        with optional fallback to semantic dialog locators if needed.
        """
        primary_sel = selector or self.DEFAULT_MODAL_SELECTOR
        try:
            loc = self.page.locator(primary_sel).first
            loc.wait_for(state="attached", timeout=timeout)
            return loc
        except PlaywrightTimeoutError:
            if (not selector or allow_fallback):
                logger.warning("Primary dialog selector '%s' timed out. Attempting fallback.", primary_sel)
                try:
                    fallback_loc = self.page.locator(self.FALLBACK_MODAL_SELECTOR).first
                    fallback_loc.wait_for(state="attached", timeout=2000)
                    return fallback_loc
                except Exception as e:
                    logger.error("Failed to locate dialog container: %s", e)
                    return None
            return None
        except Exception as e:
            logger.error("Unexpected error locating dialog: %s", e)
            return None

    def get_dialog_title(self, dialog: Locator) -> str:
        """
        Extract dialog title without relying on CSS class hashes.
        Uses semantic heading tags (h1, h2, h3) or [role='heading'].
        """
        try:
            heading = dialog.locator("h1, h2, h3, [role='heading']").first
            if heading.count() > 0:
                return heading.inner_text().strip()
        except Exception as e:
            logger.warning("Could not extract dialog title: %s", e)
        return ""

    def get_dialog_notice(self, dialog: Locator) -> str:
        """
        Extract informational note / disclaimer text inside the dialog if present.
        """
        try:
            candidates = dialog.locator("div, p")
            count = candidates.count()
            for i in range(count):
                el = candidates.nth(i)
                # Skip container blocks that contain inputs or buttons
                if el.locator("input, button").count() == 0:
                    txt = el.inner_text().strip()
                    if "bahaya" in txt.lower() or "hukum" in txt.lower():
                        return txt
        except Exception:
            pass
        return ""

    def extract_radio_options(self, dialog: Locator) -> List[Dict[str, Any]]:
        """
        Extract all radio button options along with their attributes and associated labels.
        Class-name agnostic: identifies options by input[type='radio'] and adjacent text nodes.
        """
        options: List[Dict[str, Any]] = []
        try:
            radio_inputs = dialog.locator("input[type='radio']")
            total = radio_inputs.count()

            for idx in range(total):
                radio = radio_inputs.nth(idx)

                # Extract attributes
                name_attr = radio.get_attribute("name") or ""
                value_attr = radio.get_attribute("value") or ""
                testid_attr = radio.get_attribute("data-testid") or ""
                # Determine checked state (HTML input property or custom UI framework checked indicator)
                is_checked = radio.is_checked()
                if not is_checked:
                    is_checked = radio.evaluate("""
                        (el) => {
                            if (el.checked) return true;
                            // Check parent or sibling container for custom checked indicators (e.g. TUX UI)
                            let container = el.closest('[data-testid="tux-web-interaction-container"]') || el.parentElement;
                            if (container) {
                                if (container.querySelector('[class*="checked"]') || 
                                    container.getAttribute('aria-checked') === 'true' ||
                                    (container.className && container.className.includes('checked'))) {
                                    return true;
                                }
                            }
                            return false;
                        }
                    """)

                # Extract label text using DOM evaluation to avoid hashed CSS classes
                label_text = radio.evaluate("""
                    (el) => {
                        // 1. Check if enclosed inside or adjacent to a container row with text
                        let parentRow = el.closest('div');
                        while (parentRow && parentRow.parentElement && parentRow.parentElement.querySelector('input[type="radio"]') && parentRow.parentElement.children.length === 1) {
                            parentRow = parentRow.parentElement;
                        }
                        if (parentRow && parentRow.parentElement) {
                            let row = parentRow.parentElement;
                            // Search for text in siblings or label/span
                            let spans = row.querySelectorAll('span, label, p');
                            for (let s of spans) {
                                let t = (s.innerText || '').trim();
                                if (t.length > 0) return t;
                            }
                        }
                        return '';
                    }
                """)

                # Fallback label lookup if evaluate returned empty
                if not label_text:
                    try:
                        # Try adjacent sibling span
                        sibling_span = radio.locator("xpath=ancestor::div[1]/following-sibling::span").first
                        if sibling_span.count() > 0:
                            label_text = sibling_span.inner_text().strip()
                    except Exception:
                        label_text = ""

                options.append({
                    "index": idx,
                    "name": name_attr,
                    "value": value_attr,
                    "data_testid": testid_attr,
                    "label": label_text or f"Option {idx + 1}",
                    "is_checked": is_checked
                })

        except Exception as e:
            logger.error("Error extracting radio options: %s", e)

        return options

    def extract_buttons(self, dialog: Locator) -> List[Dict[str, Any]]:
        """
        Extract all available buttons inside dialog, their text, data-e2e, and states.
        """
        buttons: List[Dict[str, Any]] = []
        try:
            button_locators = dialog.locator("button")
            total = button_locators.count()

            for idx in range(total):
                btn = button_locators.nth(idx)
                btn_text = btn.inner_text().strip()
                data_e2e = btn.get_attribute("data-e2e")
                btn_type = btn.get_attribute("type") or "button"
                is_visible = btn.is_visible()
                is_enabled = btn.is_enabled()

                buttons.append({
                    "index": idx,
                    "text": btn_text,
                    "data_e2e": data_e2e,
                    "type": btn_type,
                    "is_visible": is_visible,
                    "is_enabled": is_enabled
                })
        except Exception as e:
            logger.error("Error extracting buttons: %s", e)

        return buttons

    def inspect_dialog(self, selector: Optional[str] = None, allow_fallback: bool = False, timeout: float = 5000) -> Dict[str, Any]:
        """
        Perform complete, non-mutating DOM inspection of the target dialog component.
        Returns a structured dictionary report.
        """
        target_selector = selector or self.DEFAULT_MODAL_SELECTOR
        timestamp = datetime.now().isoformat()

        dialog = self.find_dialog_locator(target_selector, allow_fallback=allow_fallback, timeout=timeout)

        if not dialog or not dialog.is_visible():
            return {
                "status": "error",
                "timestamp": timestamp,
                "error_code": "DIALOG_NOT_FOUND_OR_HIDDEN",
                "message": f"Dialog with selector '{target_selector}' was not found or is not visible.",
                "dialog": None
            }

        title = self.get_dialog_title(dialog)
        notice = self.get_dialog_notice(dialog)
        radio_options = self.extract_radio_options(dialog)
        buttons = self.extract_buttons(dialog)

        # Determine currently checked option
        selected_option = next((opt for opt in radio_options if opt["is_checked"]), None)

        report = {
            "status": "success",
            "timestamp": timestamp,
            "dialog": {
                "selector_used": target_selector,
                "is_visible": dialog.is_visible(),
                "title": title,
                "notice": notice,
                "radio_group": {
                    "total_count": len(radio_options),
                    "selected_value": selected_option["value"] if selected_option else None,
                    "selected_label": selected_option["label"] if selected_option else None,
                    "options": radio_options
                },
                "buttons": {
                    "total_count": len(buttons),
                    "items": buttons
                }
            }
        }

        return report

    def inspect_dialog_to_json(self, selector: Optional[str] = None, allow_fallback: bool = False, timeout: float = 5000, indent: int = 2) -> str:
        """
        Perform DOM inspection and return the report serialized to a JSON formatted string.
        """
        report = self.inspect_dialog(selector=selector, allow_fallback=allow_fallback, timeout=timeout)
        return json.dumps(report, indent=indent, ensure_ascii=False)
