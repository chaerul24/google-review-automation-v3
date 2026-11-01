"""
Unit and Integration Tests for ReportUIInspector (TEST 1 - DOM Inspection).
Executes Playwright in headless mode using the local HTML fixture.
"""

import json
import os
import sys
from pathlib import Path
from playwright.sync_api import sync_playwright

from report_ui_inspector import ReportUIInspector

FIXTURE_PATH = Path(__file__).parent / "fixtures" / "report_modal_fixture.html"
SYSTEM_CHROMIUM = "/usr/bin/chromium"


def run_dom_inspection_test():
    print("=" * 70)
    print("TEST 1: DOM INSPECTION DENGAN PLAYWRIGHT & HTML FIXTURE")
    print("=" * 70)

    if not FIXTURE_PATH.exists():
        print(f"[-] ERROR: Fixture tidak ditemukan di {FIXTURE_PATH}")
        sys.exit(1)

    fixture_url = f"file://{FIXTURE_PATH.resolve()}"
    print(f"[1] Memuat fixture: {fixture_url}")

    with sync_playwright() as p:
        # Launch Chromium using system executable if available
        launch_kwargs = {"headless": True, "args": ["--no-sandbox", "--disable-dev-shm-usage"]}
        if os.path.exists(SYSTEM_CHROMIUM):
            launch_kwargs["executable_path"] = SYSTEM_CHROMIUM

        browser = p.chromium.launch(**launch_kwargs)
        page = browser.new_page()

        try:
            page.goto(fixture_url)
            inspector = ReportUIInspector(page)

            print("[2] Melakukan inspeksi DOM dialog [data-e2e='report-modal']...")
            report = inspector.inspect_dialog()

            print("[3] Memverifikasi struktur data laporan:")
            # 1. Dialog presence & visibility
            assert report["status"] == "success", f"Status must be success: {report}"
            dialog = report["dialog"]
            assert dialog["is_visible"] is True, "Dialog should be visible"
            print("  [✓] Dialog terdeteksi dan visible")

            # 2. Dialog title
            assert dialog["title"] == "Laporkan", f"Title mismatch: {dialog['title']}"
            print(f"  [✓] Judul dialog terdeteksi: '{dialog['title']}'")

            # 3 & 4. Radio options count and attributes
            radio_grp = dialog["radio_group"]
            options = radio_grp["options"]
            assert len(options) == 12, f"Expected 12 options, got {len(options)}"
            print(f"  [✓] Total opsi radio button: {len(options)}")

            # Check individual options attributes
            sample = options[0]
            assert sample["name"] == "report-reason", f"Name attr mismatch: {sample['name']}"
            assert sample["value"] == "207", f"Value attr mismatch: {sample['value']}"
            assert sample["data_testid"] == "tux-web-radio", f"data-testid mismatch: {sample['data_testid']}"
            assert sample["label"] == "Kekerasan ekstrem", f"Label mismatch: {sample['label']}"
            print(f"  [✓] Opsi #1 diverifikasi: {sample['value']} - {sample['label']}")

            # Check checked option
            checked_opt = next((o for o in options if o["is_checked"]), None)
            assert checked_opt is not None, "Expected one option to be checked by default"
            assert checked_opt["value"] == "209"
            assert checked_opt["label"] == "Penipuan dan scam"
            print(f"  [✓] Default checked option diverifikasi: {checked_opt['value']} ({checked_opt['label']})")

            # 5. Buttons detection
            buttons_info = dialog["buttons"]
            buttons = buttons_info["items"]
            assert len(buttons) >= 2, f"Expected at least 2 buttons, got {len(buttons)}"
            btn_texts = [b["text"] for b in buttons]
            assert "Batal" in btn_texts, f"Cancel button missing: {btn_texts}"
            assert "Kirim" in btn_texts, f"Submit button missing: {btn_texts}"

            cancel_btn = next(b for b in buttons if b["text"] == "Batal")
            assert cancel_btn["data_e2e"] == "report-cancel-button", f"Cancel data-e2e mismatch: {cancel_btn}"
            print(f"  [✓] Tombol terdeteksi: {btn_texts} (data-e2e Batal: '{cancel_btn['data_e2e']}')")

            # 6. JSON output generation
            json_output = inspector.inspect_dialog_to_json(indent=2)
            assert len(json_output) > 100
            print("  [✓] Laporan JSON berhasil digenerate")

            # 7. Error handling test: invalid selector
            print("\n[4] Pengujian Error Handling (Dialog tidak ditemukan):")
            err_report = inspector.inspect_dialog(selector="[data-e2e='non-existent-modal']", timeout=1000)
            assert err_report["status"] == "error", f"Should return error status: {err_report}"
            assert err_report["error_code"] == "DIALOG_NOT_FOUND_OR_HIDDEN"
            print("  [✓] Error handling berhasil menangani elemen yang tidak ditemukan secara aman.")

            print("\n" + "=" * 70)
            print("HASIL INSPEKSI DOM (JSON OUTPUT):")
            print("=" * 70)
            print(json_output)
            print("=" * 70)
            print("[✓] SELURUH PENGUJIAN TEST 1 BERHASIL 100%!")
            print("=" * 70)

        finally:
            browser.close()


if __name__ == "__main__":
    run_dom_inspection_test()
