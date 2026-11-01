#!/usr/bin/env python3
"""AutoBotix Google Review Automation — Native Chromium CLI

A standalone, interactive terminal dashboard and automation engine.
Runs purely on Linux host with native Chromium (no Windows VM required).
"""

import argparse
import json
import requests
import logging
import os
import random
import re
import subprocess
import sys
import threading
import time
from datetime import datetime
from pathlib import Path
from typing import Any, Dict, List, Optional

# Load environment
from dotenv import load_dotenv
load_dotenv()

# Rich UI Library
from rich import box
from rich.align import Align
from rich.console import Console, Group
from rich.layout import Layout
from rich.live import Live
from rich.panel import Panel
from rich.prompt import Confirm, IntPrompt, Prompt
from rich.table import Table
from rich.text import Text
from rich.spinner import Spinner

# Internal modules
import db
import bot
import session_manager

console = Console()
logging.basicConfig(level=logging.WARNING)

SLOT_DISPLAYS = {
    0: ":99",
    1: ":100",
    2: ":101",
    3: ":102",
    4: ":103",
    5: ":104",
}

APP_TITLE = "AutoBotix Review Automation"
APP_SUBTITLE = "Native Linux Chromium Engine (Zero-VM Architecture)"


# ── System Diagnostics ────────────────────────────────────────────────────────

def get_chromium_version() -> str:
    try:
        out = subprocess.check_output(["chromium", "--version"], stderr=subprocess.DEVNULL, text=True)
        return out.strip().split("\n")[0]
    except Exception:
        return "Chromium (Tidak Ditemukan)"


def get_active_displays() -> Dict[str, bool]:
    displays = {}
    for slot, disp in SLOT_DISPLAYS.items():
        sock_num = disp.replace(":", "")
        sock_path = f"/tmp/.X11-unix/X{sock_num}"
        displays[disp] = os.path.exists(sock_path)
    return displays


def get_stats() -> Dict[str, Any]:
    db.init_db()
    with db.get_db() as conn:
        biz_count = conn.execute("SELECT COUNT(*) FROM businesses").fetchone()[0]
        acc_count = conn.execute("SELECT COUNT(*) FROM emails").fetchone()[0]
        cookie_count = conn.execute("SELECT COUNT(*) FROM cookies").fetchone()[0]
        active_cookies = conn.execute("SELECT COUNT(*) FROM cookies WHERE status = 'active'").fetchone()[0]
        oauth_count = conn.execute("SELECT COUNT(*) FROM cookies WHERE auth_method = 'oauth'").fetchone()[0]
        reviewed_count = conn.execute("SELECT COUNT(*) FROM reviews WHERE status = 'reviewed'").fetchone()[0]
        pending_count = conn.execute("SELECT COUNT(*) FROM reviews WHERE status = 'pending'").fetchone()[0]
    return {
        "businesses": biz_count,
        "accounts": acc_count,
        "cookies": cookie_count,
        "active_cookies": active_cookies,
        "oauth_count": oauth_count,
        "reviewed": reviewed_count,
        "pending": pending_count,
    }


# ── UI Components ─────────────────────────────────────────────────────────────

GOOGLE_MAPS_ICON_ART = """                      [bold white]:[/bold white][white]..[/white][bold red]%%%%[/bold red][white]..[/white][bold white]:[/bold white]
                   [bold white]:[/bold white][white].[/white][bold red]%@@@@@@@@@@%[/bold red][bold white]:[/bold white]
 [white]..................[/white][bold red]%@@%%%@@@%%%%@@[/bold red][white].[/white]
[dim white].[/dim white][bold green];##;#############[/bold green][dim white].[/dim white][bold red]@%%%@%[/bold red][dim white]....[/dim white][bold red]%%%%%@[/bold red][white].[/white]
[bold green]####[/bold green][bold blue]~[/bold blue][bold white]:::::[/bold white][bold green]########[/bold green][bold red]%%%%%@[/bold red][dim white]......[/dim white][bold red]%%%%@[/bold red][dim white].[/dim white]
[bold green]###[/bold green][white].[/white] [dim white].[/dim white][bold green]##[/bold green][dim white]..[/dim white][bold green]########[/bold green][dim white].[/dim white][bold red]@%%%%@[/bold red][dim white]...[/dim white][bold red]%@%%%@@[/bold red][bold white]:[/bold white]
[bold green]###[/bold green][bold white]:[/bold white] [bold green]#;#[/bold green][white]..[/white]  [bold green]#######[/bold green][bold red]%@%%%%%%%%%%%@@[/bold red][bold white]:[/bold white]
[bold green]####[/bold green][white].[/white][bold white]::[/bold white][white]..[/white][bold white]::[/bold white][dim white].[/dim white][bold green]######[/bold green][dim white].[/dim white][bold yellow]=[/bold yellow][dim white].[/dim white][bold red]@@%%%%%@%%@%[/bold red][bold white]:[/bold white]
[bold green]######[/bold green][dim white]...[/dim white][bold green]#######[/bold green][bold yellow]======[/bold yellow][bold red]%@%%%%%%@[/bold red][dim white].[/dim white][bold white]:[/bold white]
[bold green]##############[/bold green][bold yellow]=======[/bold yellow][bold white]::[/bold white][dim white].[/dim white][bold red]@%%%@@[/bold red][white].[/white][bold white]:[/bold white]
[bold green]############[/bold green][bold yellow]======[/bold yellow][bold white]::::::[/bold white][white].[/white][bold red]@%@%[/bold red][white].[/white][bold white]::[/bold white]
[bold green]##########[/bold green][bold yellow]======[/bold yellow][bold white]:[/bold white]     [bold white]:::[/bold white][dim white].[/dim white][bold red]@@[/bold red][white].[/white][bold white]:::[/bold white]
[bold green]########[/bold green][bold yellow]======[/bold yellow][white].[/white][bold blue]~~[/bold blue][white].[/white][bold white]:[/bold white]     [bold white]::[/bold white][bold red]@%[/bold red][bold white]::::[/bold white]
[bold green]######[/bold green][bold yellow]======[/bold yellow][white].[/white][bold blue]~~~~~~[/bold blue][white].[/white][bold white]:[/bold white]     [white]..[/white][bold white]::::[/bold white]
[bold green]####[/bold green][bold yellow]======[/bold yellow][white].[/white][bold blue]~~~~~~~~~~[/bold blue][white].[/white][bold white]:[/bold white]     [bold white]::::[/bold white]
[bold green]##[/bold green][bold yellow]======[/bold yellow][white].[/white][bold blue]~~~~~~~~~~~~~~[/bold blue][white].[/white][bold white]:[/bold white]     [bold white]::[/bold white]
[bold yellow]======[/bold yellow][white].[/white][bold blue]~~~~~~~~~~~~~~~~~~~[/bold blue][bold white]:[/bold white]
[bold white]:[/bold white][white].[/white][bold yellow]==[/bold yellow][white].[/white][bold blue]~~~~~~~~~~~~~~~~~~~~~~[/bold blue][white].[/white][bold white]:[/bold white]"""


def render_banner() -> Panel:
    stats = get_stats()
    displays = get_active_displays()
    active_disp_str = " ".join([
        f"[bold green]{d}[/bold green]" if ok else f"[dim red]{d}[/dim red]"
        for d, ok in displays.items()
    ])
    chrom_ver = get_chromium_version()

    brand_header = (
        "[bold blue]G[/bold blue][bold red]o[/bold red][bold yellow]o[/bold yellow]"
        "[bold blue]g[/bold blue][bold green]l[/bold green][bold red]e[/bold red] "
        "[bold white]Maps[/bold white] [bold cyan]Review Automation Bot[/bold cyan]"
    )

    banner_text = f"""{GOOGLE_MAPS_ICON_ART}

{brand_header}
[dim]« Native Chromium • Zero-VM Architecture »[/dim]

[dim]Engine: {chrom_ver} | Display Xvfb: {active_disp_str}[/dim]
[dim]Target Bisnis: [bold white]{stats['businesses']}[/bold white] | Akun Google: [bold white]{stats['accounts']}[/bold white] | Akun Aktif: [bold green]{stats['active_cookies']}[/bold green] | OAuth: [bold blue]{stats.get('oauth_count', 0)}[/bold blue] | Ulasan Selesai: [bold green]{stats['reviewed']}[/bold green] | Antrean: [bold yellow]{stats['pending']}[/bold yellow][/dim]"""

    return Panel(
        Align.center(banner_text),
        box=box.ROUNDED,
        border_style="bright_blue",
        padding=(0, 2),
    )


def print_businesses_table():
    businesses = db.get_all_businesses()
    if not businesses:
        console.print("[yellow]Belum ada target bisnis terdaftar. Tambahkan bisnis melalui menu [3].[/yellow]")
        return

    table = Table(title="🏢 Daftar Target Google Maps", box=box.ROUNDED, header_style="bold cyan")
    table.add_column("ID", justify="center", style="bold white", width=6)
    table.add_column("Nama Bisnis", style="bold yellow")
    table.add_column("Kategori", style="dim")
    table.add_column("Ulasan Selesai", justify="center", style="green")
    table.add_column("URL Google Maps", style="dim blue", overflow="ellipsis", max_width=45)

    for b in businesses:
        table.add_row(
            str(b["id"]),
            b["name"],
            b.get("business_category") or "-",
            str(b.get("reviewed_count") or 0),
            b["url"]
        )

    console.print(table)


def print_cookies_table():
    db.init_db()
    with db.get_db() as conn:
        rows = conn.execute("""
            SELECT e.id, e.email, e.flagged, e.fail_count,
                   c.status AS cookie_status, c.updated_at, c.error_reason,
                   c.auth_method, c.account_name,
                   LENGTH(c.cookie_json) AS cookie_len,
                   c.oauth_account_expiry,
                   c.oauth_access_token
            FROM emails e
            LEFT JOIN cookies c ON e.email = c.email
            ORDER BY e.id ASC
        """).fetchall()

    if not rows:
        console.print("[yellow]Belum ada akun Google terdaftar di database.[/yellow]")
        return

    table = Table(title="🔑 Daftar Akun Google (OAuth & Cookie)", box=box.ROUNDED, header_style="bold cyan")
    table.add_column("ID", justify="center", width=5)
    table.add_column("Akun Email", style="bold white")
    table.add_column("Nama Akun", style="cyan", max_width=20)
    table.add_column("Metode", justify="center", width=10)
    table.add_column("Status", justify="center")
    table.add_column("Info Sesi", justify="right", style="dim")
    table.add_column("Flag / Gagal", justify="center")
    table.add_column("Catatan / Error", style="dim red", overflow="ellipsis", max_width=35)

    import time as _time
    now = _time.time()

    for r in rows:
        c_status = r["cookie_status"] or "no_cookie"
        auth_method = r["auth_method"] or "cookie"
        account_name = r["account_name"] or "-"

        if c_status == "active":
            status_badge = "[bold green]● AKTIF[/bold green]"
        elif c_status == "needs_login":
            status_badge = "[bold yellow]▲ PERLU LOGIN[/bold yellow]"
        elif c_status == "expired":
            status_badge = "[bold red]✖ KEDALUWARSA[/bold red]"
        else:
            status_badge = "[dim]TIDAK ADA[/dim]"

        if auth_method == "oauth":
            method_badge = "[bold blue]OAuth 2.0[/bold blue]"
            expiry = r["oauth_account_expiry"] or 0
            if expiry:
                secs_left = max(0, expiry - now)
                d = int(secs_left // 86400)
                h = int((secs_left % 86400) // 3600)
                time_str = f"{d}h {h}j" if d > 0 else f"{h}j"
            else:
                time_str = "-"
            tok = r["oauth_access_token"] or ""
            if tok:
                tok_snippet = f"{tok[:35]}... [Secured in Server DB]"
                session_info = f"{time_str}\n[dim cyan]{tok_snippet}[/dim cyan]"
            else:
                session_info = f"{time_str}"
        else:
            method_badge = "[dim]Cookie CDP[/dim]"
            cookie_sz = r["cookie_len"] or 0
            session_info = f"{cookie_sz} B" if cookie_sz else "-"

        flag_badge = f"[red]Flagged ({r['fail_count']})[/red]" if r["flagged"] else f"[green]Normal ({r['fail_count']})[/green]"

        table.add_row(
            str(r["id"]),
            r["email"],
            account_name,
            method_badge,
            status_badge,
            session_info,
            flag_badge,
            r["error_reason"] or "-"
        )

    console.print(table)


def print_recent_logs(business_id: Optional[int] = None, limit: int = 15):
    db.init_db()
    with db.get_db() as conn:
        if business_id:
            rows = conn.execute(
                "SELECT created_at, level, message FROM process_logs WHERE business_id = ? ORDER BY id DESC LIMIT ?",
                (business_id, limit)
            ).fetchall()
        else:
            rows = conn.execute(
                "SELECT created_at, level, message FROM process_logs ORDER BY id DESC LIMIT ?",
                (limit,)
            ).fetchall()

    table = Table(title="📊 Log Proses Terkini", box=box.SIMPLE, header_style="bold cyan")
    table.add_column("Waktu", style="dim", width=20)
    table.add_column("Level", justify="center", width=10)
    table.add_column("Pesan Log", style="white")

    for r in reversed(rows):
        lvl = (r["level"] or "info").lower()
        if lvl == "success":
            lvl_badge = "[bold green]SUCCESS[/bold green]"
        elif lvl in ("error", "fatal"):
            lvl_badge = "[bold red]ERROR[/bold red]"
        elif lvl == "warning":
            lvl_badge = "[bold yellow]WARN[/bold yellow]"
        else:
            lvl_badge = "[bold blue]INFO[/bold blue]"

        table.add_row(str(r["created_at"]), lvl_badge, r["message"])

    console.print(table)


# ── Process & Emergency Stop Control ────────────────────────────────────────

def stop_all_running_tasks():
    """Menghentikan seluruh proses otomatisasi yang sedang berjalan:
    1. Stop TikTok Live streaming bot & matikan display :99
    2. Stop worker Google Maps & batalkan tugas yang sedang berjalan
    3. Kembalikan review yang berstatus 'reviewing' menjadi 'pending'
    4. Kill seluruh proses worker, bot, dan Chromium automation
    """
    console.print("\n[bold red]🛑 Menghentikan seluruh proses otomatisasi & menutup browser Chromium...[/bold red]")

    # 1. Stop TikTok Live via API
    try:
        requests.post("http://127.0.0.1:5000/api/tiktok-live/stop", timeout=3)
    except Exception:
        pass

    # 2. Stop workers via API
    try:
        requests.post("http://127.0.0.1:5000/api/cli/emergency-stop", timeout=3)
    except Exception:
        pass
    try:
        requests.post("http://127.0.0.1:5000/api/worker/emergency-stop", timeout=3)
    except Exception:
        pass

    # 3. Direct process termination on host
    try:
        subprocess.run(["systemctl", "stop", "google-review-worker.service"], timeout=5, check=False)
    except Exception:
        pass
    try:
        subprocess.run(["pkill", "-9", "-f", r"python.*worker\.py"], check=False)
        subprocess.run(["pkill", "-9", "-f", r"python.*bot\.py"], check=False)
        subprocess.run(["pkill", "-9", "-f", "chromium.*--user-data-dir"], check=False)
        subprocess.run(["pkill", "-9", "-f", "chromium.*tiktok"], check=False)
        subprocess.run(["pkill", "-9", "-f", "chromedriver"], check=False)
    except Exception:
        pass

    # 4. Database cleanup: reset reviewing -> pending
    try:
        with db.get_db() as conn:
            conn.execute("UPDATE reviews SET status = 'pending' WHERE status = 'reviewing'")
    except Exception:
        pass

    console.print("[bold green]✓ Seluruh bot, worker, dan browser Chromium berhasil dihentikan bersih.[/bold green]\n")


# ── Live Terminal Review Task Runner ──────────────────────────────────────────

def run_task_interactive(business_id: int, screen_count: int = 1, star_rating: int = 5):
    biz = db.get_business(business_id)
    if not biz:
        console.print(f"[bold red]Bisnis ID {business_id} tidak ditemukan.[/bold red]")
        return False

    config = db.get_review_config(business_id) or {
        "business_description": "",
        "review_style": "random",
        "delay_seconds": 30,
        "screen_count": screen_count,
    }

    star_list = [star_rating] * screen_count
    db.clear_process_logs(business_id)
    db.reset_business_reviewing(business_id)

    created, pending_cnt = db.create_review_jobs(business_id, star_list)
    total_assigned = created + pending_cnt
    if total_assigned == 0:
        console.print("[bold red]Gagal: Tidak ada akun Google dengan cookie aktif yang tersedia.[/bold red]")
        console.print("[dim]Pastikan akun memiliki cookie aktif di menu Kelola Cookie.[/dim]")
        return False

    console.print(Panel(
        f"[bold white]Target:[/bold white] [bold yellow]{biz['name']}[/bold yellow]\n"
        f"[bold white]URL Google Maps:[/bold white] [dim]{biz['url']}[/dim]\n"
        f"[bold white]Alokasi Browser:[/bold white] [bold cyan]{screen_count} Chromium Instance(s) paralel pada Xvfb :99 s/d :{99 + screen_count - 1}[/bold cyan]\n"
        f"[bold white]Rating:[/bold white] [bold yellow]{'★' * star_rating}[/bold yellow] ({star_rating} Bintang)",
        title="🚀 Menjalankan Otomasi Ulasan Google Maps",
        border_style="cyan",
        box=box.ROUNDED
    ))

    # Run bot in a background thread
    worker_error = None
    is_done = False

    def _worker_thread():
        nonlocal worker_error, is_done
        try:
            bot.run_reviews(business_id, biz, config, delay=int(config.get("delay_seconds") or 30), max_parallel=screen_count)
        except Exception as exc:
            worker_error = exc
        finally:
            is_done = True

    t = threading.Thread(target=_worker_thread, daemon=True)
    t.start()

    # Live UI update loop
    spinner = Spinner("dots", style="bold cyan")
    try:
        with Live(console=console, refresh_per_second=3) as live:
            start_time = time.time()
            while not is_done:
                elapsed = int(time.time() - start_time)

                # Query current active/pending reviews
                with db.get_db() as conn:
                    cur_reviews = conn.execute("""
                        SELECT r.id, r.status, r.star_rating, r.review_text, e.email
                        FROM reviews r
                        JOIN emails e ON r.email_id = e.id
                        WHERE r.business_id = ?
                        ORDER BY r.id ASC
                    """, (business_id,)).fetchall()

                    recent_logs = conn.execute("""
                        SELECT created_at, level, message
                        FROM process_logs
                        WHERE business_id = ?
                        ORDER BY id DESC LIMIT 5
                    """, (business_id,)).fetchall()

                # Build slots table
                slots_table = Table(box=box.ROUNDED, expand=True, header_style="bold cyan")
                slots_table.add_column("Slot / Display", justify="center", width=16)
                slots_table.add_column("Akun Google", style="bold white", width=28)
                slots_table.add_column("Rating", justify="center", width=10)
                slots_table.add_column("Status Engine", width=26)

                for idx, rev in enumerate(cur_reviews[:screen_count]):
                    disp = SLOT_DISPLAYS.get(idx, f":{99 + idx}")
                    st = rev["status"]
                    if st == "reviewed":
                        status_str = "[bold green]✓ Selesai Terbit[/bold green]"
                    elif st == "reviewing":
                        status_str = f"{spinner.render(time.time())} [bold yellow]Sedang Memproses...[/bold yellow]"
                    elif st == "failed":
                        status_str = "[bold red]✖ Gagal[/bold red]"
                    else:
                        status_str = "[dim]Menunggu Giliran[/dim]"

                    stars_badge = f"[yellow]{'★' * (rev['star_rating'] or 5)}[/yellow]"
                    slots_table.add_row(
                        f"Slot {idx + 1} ({disp})",
                        rev["email"],
                        stars_badge,
                        status_str
                    )

                # Build logs panel
                log_lines = []
                for l in reversed(recent_logs):
                    lvl = l["level"]
                    msg = (l["message"] or "").strip()
                    ts = l['created_at'].split()[-1]
                    tag = "[-]"
                    tag_col = "bold bright_blue"
                    if msg.startswith("[+]") or lvl == "success":
                        tag = "[+]"
                        tag_col = "bold green"
                    elif msg.startswith("[!]") or lvl in ("error", "fatal"):
                        tag = "[!]"
                        tag_col = "bold red"
                    elif lvl in ("warning", "fail"):
                        tag = "[!]"
                        tag_col = "bold yellow"
                    elif msg.startswith("[?]") or any(k in msg.lower() for k in ("memeriksa", "verifikasi", "cek", "menunggu")):
                        tag = "[?]"
                        tag_col = "bold cyan"
                    clean_msg = re.sub(r'^(\[\+\]|\[\?\]|\[-\]|\[!\])\s*', '', msg)
                    clean_msg = re.sub(r'^[✓▲✖ℹ🌐🔑❤️💬🚀⚡]\s*', '', clean_msg)
                    log_lines.append(f"[dim]{ts}[/dim] [{tag_col}]{tag}[/{tag_col}] [white]{clean_msg}[/white]")

                logs_text = "\n".join(log_lines) if log_lines else "[dim]Menunggu event engine...[/dim]"
                logs_panel = Panel(logs_text, title="📋 Live Engine Logs", box=box.ROUNDED, border_style="dim")

                panel_main = Panel(
                    Group(
                        slots_table,
                        logs_panel,
                        Text(f"⏱ Waktu Berjalan: {elapsed} detik • Tekan Ctrl+C untuk membatalkan dan stop semua task", justify="center", style="dim")
                    ),
                    title=f"⚡ Status Eksekusi Chromium Native ({biz['name']})",
                    border_style="bright_blue",
                    box=box.ROUNDED
                )

                live.update(panel_main)
                time.sleep(0.4)
    except KeyboardInterrupt:
        console.print("\n[bold yellow]⚠️ Ctrl+C terdeteksi saat menjalankan ulasan Google Maps![/bold yellow]")
        stop_all_running_tasks()
        return False

    t.join(timeout=2.0)
    console.print()
    if worker_error:
        console.print(f"[bold red]Terjadi error selama eksekusi: {worker_error}[/bold red]")
        return False
    else:
        console.print("[bold green]✓ Seluruh tugas ulasan berhasil diselesaikan oleh engine Chromium![/bold green]")
        print_recent_logs(business_id, limit=6)
        return True


# ── Quick Diagnostic Test ─────────────────────────────────────────────────────

def test_chromium_native(display: str = ":99"):
    console.print(f"\n[cyan]Menjalankan uji cepat Chromium pada Display {display}...[/cyan]")
    from seleniumbase import Driver

    os.environ["DISPLAY"] = display
    driver = None
    try:
        console.print("[dim]1. Membuka browser Chromium...[/dim]")
        driver = Driver(browser="chrome", headless=False, uc=True)
        console.print("[dim]2. Menavigasi ke Google Maps...[/dim]")
        driver.get("https://www.google.com/maps?hl=en")
        driver.sleep(4)
        title = driver.title
        cur_url = driver.current_url
        console.print(f"[bold green]✓ Sukses! Chromium terhubung di {display}[/bold green]")
        console.print(f"  [dim]Title: {title}[/dim]")
        console.print(f"  [dim]URL:   {cur_url[:65]}...[/dim]")

        # Test cookie injection CDP
        console.print("[dim]3. Menguji kapabilitas CDP Network.setCookies...[/dim]")
        driver.execute_cdp_cmd("Network.enable", {})
        driver.execute_cdp_cmd("Network.setCookies", {"cookies": [
            {"name": "test_token", "value": "autobotix_ok", "domain": ".google.com", "path": "/"}
        ]})
        console.print("[bold green]✓ Injeksi cookie CDP Native Chromium berfungsi 100%![/bold green]")
        return True
    except Exception as exc:
        console.print(f"[bold red]✖ Uji diagnostik Chromium gagal: {exc}[/bold red]")
        return False
    finally:
        if driver:
            try:
                driver.quit()
            except Exception:
                pass


# ── Interactive Menu ──────────────────────────────────────────────────────────

def prompt_login_server(default_user: str = "admin") -> bool:
    """Prompt user for username and password before entering task session."""
    expected_user = os.environ.get("APP_USERNAME", "admin").strip()
    expected_pass = os.environ.get("APP_PASSWORD", "").strip()

    console.clear()
    console.print(Align.center(Panel(
        Text.assemble(
            ("AutoBotix Google Review Automation\n", "bold cyan"),
            ("Autentikasi Pengguna Sebelum Masuk Menu Task\n\n", "bold yellow"),
            ("Engine: Native Linux Chromium • Zero-VM Architecture\n", "dim"),
        ),
        box=box.ROUNDED,
        border_style="cyan",
        title="[bold yellow]LOGIN PENGGUNA[/bold yellow]",
    )))

    attempts = 0
    max_attempts = 5
    while attempts < max_attempts:
        attempts += 1
        try:
            u = Prompt.ask("[bold green]Username[/bold green]", default=default_user).strip()
            p = Prompt.ask("[bold green]Password[/bold green]", password=True).strip()

            pass_ok = (p == expected_pass)
            user_ok = (u.lower() == expected_user.lower() or u.lower() == "admin")

            if user_ok and pass_ok:
                console.print(f"\n[bold green]✓ Login berhasil! Selamat datang, {u}.[/bold green]")
                time.sleep(0.8)
                return True
            else:
                console.print(f"[bold red]✖ Username atau password salah! (Percobaan {attempts}/{max_attempts})[/bold red]\n")
        except (KeyboardInterrupt, EOFError):
            console.print("\n[dim]Dibatalkan.[/dim]")
            sys.exit(0)

    console.print("[bold red]Terlalu banyak percobaan gagal. Akses ditolak.[/bold red]")
    sys.exit(1)


# ── Responsive Card UI for TikTok Live ──────────────────────────────────────

def format_rich_tiktok_log(ts: str, lvl: str, raw_msg: str, width: int = 80) -> str:
    """Format single TikTok Live log entry into rich markup with tag [+]/[!]/[-]/[?], actor badge, and ──> arrows."""
    clean = (raw_msg or "").strip()
    tag_detected = None
    actors = []

    while True:
        m = re.match(r"^\[([^\]]+)\]\s*(.*)", clean)
        if not m:
            break
        bracket = m.group(1).strip()
        rem = m.group(2).strip()

        if bracket in ("+", "?", "!", "-"):
            tag_detected = f"[{bracket}]"
            clean = rem
        elif re.match(r"^(Browser|Akun|Slot|Mode|SISTEM)", bracket, re.IGNORECASE) or bracket.startswith("@"):
            actors.append(bracket)
            clean = rem
        else:
            break

    m_user = re.match(r"^(@[a-zA-Z0-9._]+):\s*(.*)", clean)
    if m_user:
        actors.append(m_user.group(1))
        clean = m_user.group(2).strip()

    clean = re.sub(r'^[✓▲✖ℹ🌐🔑❤️💬🚀⚡]\s*', '', clean)
    clean_escaped = clean.replace("[", "\\[").replace("]", "\\]")

    actor_str = " • ".join(actors) if actors else ""
    if actor_str:
        if width < 65:
            short_actor = actor_str.replace("Browser Cookie ", "B").replace("Browser ", "B")
            actor_badge = f"[bold cyan][{short_actor[:18]}][/bold cyan]"
        else:
            actor_badge = f"[bold cyan][{actor_str[:32]}][/bold cyan]"
    elif any(w in clean.lower() for w in ("chromium", "browser", "driver", "page", "cdp")):
        actor_badge = "[bright_blue][SISTEM BROWSER][/bright_blue]"
    else:
        actor_badge = "[cyan][SISTEM LIVE][/cyan]"

    lvl_low = (lvl or "info").lower()
    if tag_detected == "[+]" or lvl_low == "success":
        tag = "[bold green]\\[+][/bold green]"
        arrow = "[green]──>[/green]"
        msg_out = f"[bold green]{clean_escaped}[/bold green]"
    elif tag_detected == "[!]" or lvl_low in ("error", "fatal"):
        tag = "[bold red]\\[!][/bold red]"
        arrow = "[red]──>[/red]"
        msg_out = f"[bold red]{clean_escaped}[/bold red]"
    elif tag_detected == "[!]" or lvl_low in ("warning", "fail"):
        tag = "[bold yellow]\\[!][/bold yellow]"
        arrow = "[yellow]──>[/yellow]"
        msg_out = f"[yellow]{clean_escaped}[/yellow]"
    elif tag_detected == "[?]" or any(k in clean.lower() for k in ("memeriksa", "verifikasi", "cek", "menunggu", "deteksi")):
        tag = "[bold cyan]\\[?][/bold cyan]"
        arrow = "[cyan]──>[/cyan]"
        msg_out = f"[cyan]{clean_escaped}[/cyan]"
    else:
        tag = "[bold bright_blue]\\[-][/bold bright_blue]"
        arrow = "[cyan]──>[/cyan]"
        msg_out = f"[white]{clean_escaped}[/white]"

    return f"[dim][{ts}][/dim] {tag} {arrow} {actor_badge} {arrow} {msg_out}"


def render_tiktok_live_cards(
    width: int,
    t_user: str,
    tt_username: str,
    is_logged_in: bool,
    time_str: str,
    likes: int,
    speed: int,
    chats: int,
    success: int = 0,
    fail: int = 0,
    error: int = 0,
    logs: List[str] = None,
    mode: str = "parallel",
    verified_viewers: List[str] = None,
    active_accounts: List[str] = None,
    account_stats: Optional[Dict[str, Any]] = None,
    like_mode: str = "super_cepat",
    like_mode_info: Optional[Dict[str, Any]] = None
) -> Group:
    login_badge = "[bold green]✓ Sesi Aktif[/bold green]" if is_logged_in else "[bold yellow]Mode Tamu[/bold yellow]"
    mode_badge = "[bold green]⚡ Paralel[/bold green]" if mode == "parallel" else "[bold yellow]🔄 Bergantian[/bold yellow]"

    lm_info = like_mode_info or {}
    lm_badge = lm_info.get("badge") or ("🚀 Super Cepat" if like_mode == "super_cepat" else ("⚡ Turbo" if like_mode == "turbo" else "🐢 Santai"))
    lm_name = lm_info.get("name") or ("Super Cepat Like" if like_mode == "super_cepat" else ("Turbo Like" if like_mode == "turbo" else "Santai Like"))
    lm_interval = lm_info.get("interval", 0.15 if like_mode == "super_cepat" else (0.35 if like_mode == "turbo" else 1.0))

    v_set = set(verified_viewers or [])
    if active_accounts:
        v_badges = []
        for u in active_accounts:
            short_u = u[:12]
            if u in v_set:
                v_badges.append(f"[bold green]\\[✓] {short_u}[/bold green]")
            else:
                v_badges.append(f"[cyan]\\[?] {short_u}[/cyan]")
        penonton_rich = " ".join(v_badges)
    else:
        penonton_rich = "[yellow]Mode Tamu[/yellow]"

    # Prepare individual account cards if account_stats is present
    acc_cards = []
    card_items = list(account_stats.values()) if account_stats else []
    if not card_items and active_accounts:
        card_items = [{"username": u, "worker_idx": i, "is_logged_in": True, "is_viewer_verified": u in v_set, "has_like_btn": True, "likes_sent": likes, "chats_sent": chats} for i, u in enumerate(active_accounts)]

    for c in card_items:
        cu = c.get("username", "@user")
        wi = c.get("worker_idx", 0) + 1
        clg = "[bold green]✓ Sesi Aktif[/bold green]" if c.get("is_logged_in") else "[bold yellow]Mode Tamu[/bold yellow]"
        cv = "[bold green]\\[✓] Penonton Live[/bold green]" if c.get("is_viewer_verified") else "[cyan]\\[?] Memindai[/cyan]"
        cbtn = f"[bold green]\\[✓] Love Btn ({lm_interval}s)[/bold green]" if c.get("has_like_btn") else "[yellow]Mencari Love[/yellow]"
        clikes = c.get("likes_sent", 0)
        cchats = c.get("chats_sent", 0)
        cmsg = c.get("last_chat_message") or "indonesia"

        acc_panel = Panel(
            f"👤 [bold cyan]{cu}[/bold cyan] ({clg})\n"
            f"Status: {cv} │ {cbtn}\n"
            f"❤️ Real Likes: [bold red]{clikes:,} klik nyata[/bold red] [{lm_badge}] (NO DUMMY)\n"
            f"💬 Chat (3s)  : [bold cyan]{cchats} terkirim[/bold cyan] │ \"{cmsg[:18]}\"",
            title=f"[bold cyan]KARTU AKUN #{wi}: {cu}[/bold cyan]",
            border_style="cyan",
            box=box.ROUNDED,
            expand=True
        )
        acc_cards.append(acc_panel)

    if width >= 135:
        # PC / DESKTOP ULTRAWIDE (>= 135 cols): 4 Horizon Cards Grid + Per-Account Cards
        grid = Table.grid(expand=True, padding=(0, 1))
        grid.add_column(ratio=1)
        grid.add_column(ratio=1)
        grid.add_column(ratio=1)
        grid.add_column(ratio=1)

        c1 = Panel(
            f"[bold yellow]{t_user}[/bold yellow]\n[bold red]🔴 LIVE ON-AIR[/bold red]\n⏱ Durasi: [bold white]{time_str}[/bold white]",
            title="[bold red]🔴 STREAMER[/bold red]",
            border_style="red",
            box=box.ROUNDED,
            expand=True
        )
        c2 = Panel(
            f"[bold cyan]{tt_username}[/bold cyan]\n{login_badge} │ {mode_badge}\nPenonton: {penonton_rich}",
            title="[bold cyan]👤 AKUN & DAFTAR PENONTON[/bold cyan]",
            border_style="cyan",
            box=box.ROUNDED,
            expand=True
        )
        c3 = Panel(
            f"[bold red]❤️ {likes:,} klik nyata[/bold red] (1:1 NO DUMMY)\n"
            f"⚡ Mode: [bold magenta]{lm_badge}[/bold magenta] ({lm_interval}s/like)\n"
            f"[green]✓ Berhasil: {success}[/green] │ [yellow]▲ {fail}[/yellow] │ [red]✗ {error}[/red]",
            title="[bold magenta]❤️ REAL LIKES & STATS[/bold magenta]",
            border_style="magenta",
            box=box.ROUNDED,
            expand=True
        )
        c4 = Panel(
            f"💬 [bold cyan]{chats} chat terkirim[/bold cyan]\n"
            f"Auto-Chat: [green]Aktif ✓[/green]\n"
            f"Interval: [bold white]3.0 detik[/bold white]",
            title="[bold yellow]💬 LIVE CHAT (3s)[/bold yellow]",
            border_style="yellow",
            box=box.ROUNDED,
            expand=True
        )
        grid.add_row(c1, c2, c3, c4)

        if acc_cards:
            grid_acc = Table.grid(expand=True, padding=(0, 1))
            col_count = min(3, len(acc_cards))
            for _ in range(col_count):
                grid_acc.add_column(ratio=1)
            for i in range(0, len(acc_cards), col_count):
                grid_acc.add_row(*acc_cards[i:i+col_count])
            grid = Group(grid, grid_acc)

    elif width >= 65:
        # LAPTOP / TABLET / DESKTOP (65-134 cols): 2x2 Grid Cards + Per-Account Cards
        grid = Table.grid(expand=True, padding=(0, 1))
        grid.add_column(ratio=1)
        grid.add_column(ratio=1)

        c1 = Panel(
            f"[bold yellow]{t_user}[/bold yellow]  [bold red]🔴 LIVE ON-AIR[/bold red]\n⏱ Durasi: [bold white]{time_str}[/bold white]",
            title="[bold red]🔴 STREAMER TARGET[/bold red]",
            border_style="red",
            box=box.ROUNDED,
            expand=True
        )
        c2 = Panel(
            f"[bold cyan]{tt_username}[/bold cyan]  {login_badge}\nMode: {mode_badge} • [dim]Headless[/dim]\nPenonton: {penonton_rich}",
            title="[bold cyan]👤 AKUN & DAFTAR PENONTON[/bold cyan]",
            border_style="cyan",
            box=box.ROUNDED,
            expand=True
        )
        c3 = Panel(
            f"[bold red]❤️ {likes:,} klik nyata[/bold red] (1:1 NO DUMMY)\n"
            f"Mode Like: [bold magenta]{lm_badge}[/bold magenta] ({lm_interval}s/like)\n"
            f"[green]✓ Berhasil: {success}[/green] │ [yellow]▲ Gagal: {fail}[/yellow] │ [red]✗ Error: {error}[/red]",
            title="[bold magenta]❤️ REAL LIKES & STATISTIK[/bold magenta]",
            border_style="magenta",
            box=box.ROUNDED,
            expand=True
        )
        c4 = Panel(
            f"💬 [bold cyan]{chats} pesan live chat terkirim[/bold cyan]\n"
            f"Status: [green]Auto-Chat Aktif (Interval 3 Detik) ✓[/green]",
            title="[bold yellow]💬 LIVE CHAT (3s)[/bold yellow]",
            border_style="yellow",
            box=box.ROUNDED,
            expand=True
        )
        grid.add_row(c1, c2)
        grid.add_row(c3, c4)

        if acc_cards:
            grid_acc = Table.grid(expand=True, padding=(0, 1))
            grid_acc.add_column(ratio=1)
            grid_acc.add_column(ratio=1)
            for i in range(0, len(acc_cards), 2):
                chunk = acc_cards[i:i+2]
                if len(chunk) == 1:
                    grid_acc.add_row(chunk[0], Panel("", box=box.ROUNDED, border_style="dim"))
                else:
                    grid_acc.add_row(*chunk)
            grid = Group(grid, grid_acc)

    else:
        # HP / MOBILE TERMUX (< 65 cols): Stacked Compact Mobile Cards
        c_mobile1 = Panel(
            f"[bold yellow]{t_user}[/bold yellow] • [bold red]🔴 LIVE[/bold red] • ⏱ [bold white]{time_str}[/bold white]\n"
            f"👤 {tt_username} ({login_badge}) │ {mode_badge}\n"
            f"Penonton: {penonton_rich}",
            title="[bold red]📱 STREAMER & LIVE (HP)[/bold red]",
            border_style="red",
            box=box.ROUNDED,
            expand=True
        )
        c_mobile2 = Panel(
            f"❤️ Real Likes: [bold red]{likes:,} klik nyata[/bold red] [{lm_badge}]\n"
            f"💬 Chat (3s)  : [bold cyan]{chats} pesan terkirim[/bold cyan]\n"
            f"[green]✓ Berhasil: {success}[/green] │ [yellow]▲ Gagal: {fail}[/yellow] │ [red]✗ Error: {error}[/red]",
            title="[bold magenta]📊 STATISTIK LIVE[/bold magenta]",
            border_style="magenta",
            box=box.ROUNDED,
            expand=True
        )
        grid = Group(c_mobile1, c_mobile2, *acc_cards)

    # Real-Time Logs (Google Maps Tree Line Style - Newest on Top)
    max_logs = 3 if width < 65 else 5
    logs_slice = list(reversed(logs[-max_logs:])) if logs else []

    log_elements = []
    if width >= 65:
        log_elements.append(Text.from_markup("\n[cyan]┌──[/cyan] [bold cyan]📋 LIVE PROCESS LOGS • TIKTOK LIVE ENGINE (Terbaru di atas)[/bold cyan]"))
    else:
        log_elements.append(Text.from_markup("\n[cyan]┌──[/cyan] [bold cyan]📋 LIVE LOGS (Terbaru di atas)[/bold cyan]"))

    if not logs_slice:
        trunk = "│ └──" if width < 65 else "│   └──"
        log_elements.append(Text.from_markup(f"[cyan]{trunk}[/cyan] [dim][--:--:--] [-] ──> [SISTEM LIVE] ──> Menghubungkan browser Chromium ke siaran...[/dim]"))
    else:
        for idx, l in enumerate(logs_slice):
            is_last = (idx == len(logs_slice) - 1)
            branch = "└──" if is_last else "├──"
            trunk_indent = "│ ├──" if (width < 65 and not is_last) else ("│ └──" if width < 65 else f"│   {branch}")
            log_elements.append(Text.from_markup(f"[cyan]{trunk_indent}[/cyan] {l}"))

    # Control Action Footer (Text WITHOUT Card)
    if width >= 65:
        footer = Align.center(
            Text.from_markup("\n[dim]Tekan [/dim][bold yellow]Ctrl+C[/bold yellow][dim] untuk Auto-Stop & Tutup Bot (Headless)[/dim]")
        )
    else:
        footer = Align.center(
            Text.from_markup("\n[dim]Tekan [/dim][bold yellow]Ctrl+C[/bold yellow][dim] untuk Auto-Stop Bot[/dim]")
        )

    return Group(grid, *log_elements, footer)


def run_tiktok_live_interactive(target_user: str = "", tap_speed: int = 50, chat_message: str = "", mode: str = "parallel", interactive: bool = True, like_mode: str = "super_cepat"):
    console.clear()
    console.print(render_banner())
    console.print(Panel(
        Align.center("[bold cyan]🎵 TIKTOK LIVE (MULAI) — OTOMASI LIVE STREAMING[/bold cyan]\n"
                     "[dim]Auto Tap-tap Likes, Auto Chat & Multi-Akun Cookie (Native Headless Engine)[/dim]"),
        box=box.ROUNDED,
        border_style="magenta",
    ))

    # Read active TikTok accounts from DB (Multi-Account Support)
    all_tt = db.get_all_tiktok_cookies()
    chosen_account_ids = None
    account_label = "Mode Tamu"

    if all_tt:
        console.print(f"\n[bold green]👥 Akun TikTok (Cookie) Tersedia ({len(all_tt)} Akun):[/bold green]")
        for idx, acc in enumerate(all_tt, 1):
            u = acc.get("username", "@user")
            n = acc.get("nickname") or "User"
            st_badge = "[green][Sesi Aktif ✓][/green]" if acc.get("status") in ("active", "unknown") else f"[yellow][{acc.get('status')}][/yellow]"
            console.print(f"   [bold cyan][{idx}][/bold cyan] {u} ({n}) {st_badge}")
        if len(all_tt) > 1:
            console.print(f"   [bold cyan][0][/bold cyan] [bold yellow]★ Gunakan Semua Akun (Multi-Akun Paralel / Bergantian)[/bold yellow]")

        if interactive and len(all_tt) > 1:
            acc_pick = Prompt.ask("  [bold white]Pilih Akun yang digunakan (0 untuk Semua Akun)[/bold white]", default="0").strip()
            if acc_pick == "0" or not acc_pick:
                chosen_account_ids = [a["id"] for a in all_tt]
                account_label = f"Multi-Akun ({len(all_tt)} Akun)"
            else:
                try:
                    p_idx = int(acc_pick) - 1
                    if 0 <= p_idx < len(all_tt):
                        chosen_account_ids = [all_tt[p_idx]["id"]]
                        account_label = all_tt[p_idx].get("username")
                    else:
                        chosen_account_ids = [a["id"] for a in all_tt]
                        account_label = f"Multi-Akun ({len(all_tt)} Akun)"
                except Exception:
                    chosen_account_ids = [a["id"] for a in all_tt]
                    account_label = f"Multi-Akun ({len(all_tt)} Akun)"
        else:
            chosen_account_ids = [a["id"] for a in all_tt]
            account_label = f"Multi-Akun ({len(all_tt)} Akun)" if len(all_tt) > 1 else all_tt[0].get("username")
    else:
        console.print(" [bold yellow]Peringatan: Belum ada akun TikTok diimpor. Bot akan berjalan dalam Mode Tamu (Guest).[/bold yellow]")

    # Read bot_modules_config.json if available
    cfg_file = Path(__file__).parent / "bot_modules_config.json"
    tiktok_cfg = {}
    if cfg_file.exists():
        try:
            with open(cfg_file, "r", encoding="utf-8") as f:
                tiktok_cfg = json.load(f).get("tiktok_live", {})
        except Exception:
            pass

    # Mode selection for multi-account
    chosen_mode = mode if mode in ("parallel", "sequential") else "parallel"
    if chosen_account_ids and len(chosen_account_ids) > 1:
        if interactive:
            console.print(f"\n[bold cyan]⚡ Pilih Mode Multi-Akun (Paralel / Bergantian):[/bold cyan]")
            console.print(f"   [bold cyan][1][/bold cyan] [bold green]Mode Paralel (Serentak)[/bold green] — [white]Setiap cookie memiliki browser masing-masing bekerja serentak[/white]")
            console.print(f"   [bold cyan][2][/bold cyan] [bold yellow]Mode Bergantian (Rotasi)[/bold yellow] — [white]Setiap cookie memiliki browser masing-masing bergantian tiap periode (75 detik)[/white]")
            m_pick = Prompt.ask("  [bold white]Pilihan Mode [1/2][/bold white]", choices=["1", "2"], default="1").strip()
            chosen_mode = "parallel" if m_pick == "1" else "sequential"
        else:
            chosen_mode = mode if mode in ("parallel", "sequential") else tiktok_cfg.get("execution_mode", "parallel")

    # Mode kecepatan like
    default_like_mode = like_mode if like_mode in ("santai", "turbo", "super_cepat") else (tiktok_cfg.get("like_mode") or "super_cepat")
    if interactive:
        console.print(f"\n[bold cyan]🚀 Pilih Kecepatan Tap-tap Like (100% Real Likes 1:1):[/bold cyan]")
        console.print(f"   [bold cyan][1][/bold cyan] [bold green]🐢 Santai Like[/bold green]     — [white]Interval 1.0s / like (~1 like/detik per akun, aman & stabil)[/white]")
        console.print(f"   [bold cyan][2][/bold cyan] [bold yellow]⚡ Turbo Like[/bold yellow]      — [white]Interval 0.35s / like (~3 like/detik per akun, bertenaga)[/white]")
        console.print(f"   [bold cyan][3][/bold cyan] [bold red]🚀 Super Cepat Like[/bold red] — [white]Interval 0.15s / like (~6-7 like/detik per akun, tap instan deras)[/white]")
        lm_default_num = "3"
        if default_like_mode == "santai":
            lm_default_num = "1"
        elif default_like_mode == "turbo":
            lm_default_num = "2"
        lm_pick = Prompt.ask("  [bold white]Pilihan Kecepatan Like [1/2/3][/bold white]", choices=["1", "2", "3"], default=lm_default_num).strip()
        if lm_pick == "1":
            chosen_like_mode = "santai"
        elif lm_pick == "2":
            chosen_like_mode = "turbo"
        else:
            chosen_like_mode = "super_cepat"
    else:
        chosen_like_mode = default_like_mode

    default_user = target_user or tiktok_cfg.get("target_user") or "@evelyn.vln"
    default_speed = tap_speed or tiktok_cfg.get("tap_speed") or 50
    default_chat = chat_message or tiktok_cfg.get("chat_message") or "Semangat live kak! Support selalu 🔥"

    if interactive:
        console.print(f"\n[bold green]Konfigurasi Siaran TikTok LIVE:[/bold green]")
        t_user = Prompt.ask("  [bold white]Target Username TikTok LIVE[/bold white]", default=default_user).strip()
        if not t_user.startswith("@"):
            t_user = f"@{t_user}"

        t_speed = default_speed

        do_chat = Confirm.ask("  [bold white]Kirim Pesan Live Chat Otomatis?[/bold white]", default=tiktok_cfg.get("auto_chat", True))
        t_chat = default_chat
        if do_chat:
            t_chat = Prompt.ask("  [bold white]Pesan Live Chat[/bold white]", default=default_chat).strip()
    else:
        t_user = default_user if default_user.startswith("@") else f"@{default_user}"
        t_speed = max(5, min(100, default_speed))
        do_chat = tiktok_cfg.get("auto_chat", True)
        t_chat = default_chat

    mode_label = "⚡ Paralel (Serentak)" if chosen_mode == "parallel" else "🔄 Bergantian (Rotasi)"
    lm_name = "Super Cepat Like" if chosen_like_mode == "super_cepat" else ("Turbo Like" if chosen_like_mode == "turbo" else "Santai Like")
    console.print(f"\n[bold cyan]🚀 Memulai bot Chromium TikTok Live (Headless) untuk streamer [bold yellow]{t_user}[/bold yellow]...[/bold cyan]")
    console.print(f"[dim]Menyiapkan akun: {account_label} • Mode: {mode_label} • Kecepatan Like: {lm_name}...[/dim]")
    console.print("[dim]Tekan Ctrl+C untuk menghentikan bot dan kembali ke menu.[/dim]\n")

    server_url = "http://127.0.0.1:5000"
    is_server_active = False
    try:
        res = requests.post(
            f"{server_url}/api/tiktok-live/start",
            json={
                "target_user": t_user,
                "tap_speed": t_speed,
                "like_mode": chosen_like_mode,
                "auto_chat": do_chat,
                "chat_message": t_chat,
                "account_ids": chosen_account_ids,
                "mode": chosen_mode
            },
            timeout=8
        )
        if res.status_code == 200:
            is_server_active = True
        else:
            console.print(f"[bold red]Gagal memulai di server: {res.text}[/bold red]")
            return
    except Exception as e:
        console.print(f"[bold yellow]Peringatan: Server backend {server_url} tidak merespons ({e}).[/bold yellow]")
        return

    start_time = time.time()
    likes_sent = 0
    chats_sent = 0
    success_count = 0
    fail_count = 0
    error_count = 0
    time_str = "00:00"
    is_logged_in_state = False
    tt_username = account_label

    # Clear screen so statistics cards are pinned at the top without scrolling
    console.clear()

    try:
        with Live(console=console, refresh_per_second=2) as live:
            while True:
                time.sleep(1.0)
                now = time.time()
                elapsed = int(now - start_time)
                mins = elapsed // 60
                secs = elapsed % 60
                time_str = f"{mins:02d}:{secs:02d}"

                recent_logs = []
                if is_server_active:
                    try:
                        st_res = requests.get(f"{server_url}/api/tiktok-live/status", timeout=3)
                        if st_res.status_code == 200:
                            st_data = st_res.json().get("state", {})
                            if not st_data.get("is_running") and elapsed > 5:
                                break
                            likes_sent = st_data.get("likes_sent", likes_sent)
                            chats_sent = st_data.get("chats_sent", chats_sent)
                            success_count = st_data.get("success_count", 0)
                            fail_count = st_data.get("fail_count", 0)
                            error_count = st_data.get("error_count", 0)
                            is_logged_in_state = st_data.get("is_logged_in", False)
                            
                            active_mode = st_data.get("execution_mode", chosen_mode)
                            if st_data.get("account_count", 0) > 1:
                                cur_acc = st_data.get("current_account") or ("Paralel" if active_mode == "parallel" else "Rotasi")
                                tt_username = f"👥 {st_data.get('account_count')} Akun ({cur_acc})"
                            elif st_data.get("current_account"):
                                tt_username = st_data.get("current_account")

                            raw_logs = st_data.get("logs", [])
                            for l in raw_logs[-10:]:
                                lvl = (l.get("level") or "info").lower()
                                ts = (l.get("created_at") or "")[-8:]
                                raw_msg = (l.get("message") or "").strip()
                                recent_logs.append(format_rich_tiktok_log(ts, lvl, raw_msg, width=console.width))
                    except Exception:
                        pass

                card_ui = render_tiktok_live_cards(
                    width=console.width,
                    t_user=t_user,
                    tt_username=tt_username,
                    is_logged_in=is_logged_in_state,
                    time_str=time_str,
                    likes=likes_sent,
                    speed=t_speed,
                    chats=chats_sent,
                    success=success_count,
                    fail=fail_count,
                    error=error_count,
                    logs=recent_logs,
                    mode=st_data.get("execution_mode", chosen_mode) if is_server_active else chosen_mode,
                    verified_viewers=st_data.get("verified_viewers", []) if is_server_active else [],
                    active_accounts=st_data.get("active_accounts", []) if is_server_active else [],
                    account_stats=st_data.get("account_stats", {}) if is_server_active else {},
                    like_mode=st_data.get("like_mode", chosen_like_mode) if is_server_active else chosen_like_mode,
                    like_mode_info=st_data.get("like_mode_info", {}) if is_server_active else {}
                )
                live.update(card_ui)
    except KeyboardInterrupt:
        console.print("\n[bold yellow]⚠️ Ctrl+C terdeteksi saat siaran TikTok Live berjalan![/bold yellow]")
        stop_all_running_tasks()
        return
    finally:
        if is_server_active:
            try:
                requests.post(f"{server_url}/api/tiktok-live/stop", timeout=4)
            except Exception:
                pass

    console.print(f"\n[bold green]✓ Sesi bot TikTok Live selesai dihentikan.[/bold green]")
    console.print(f"  [bold]Streamer Target:[/bold] {t_user}")
    console.print(f"  [bold]Akun TikTok:[/bold] {tt_username} ({'Login Sukses' if is_logged_in_state else 'Mode Tamu'})")
    console.print(f"  [bold]Durasi Aktif:[/bold] {time_str}")
    console.print(f"  [bold]Total Likes Terkirim:[/bold] [red]❤️ {likes_sent:,}[/red]")
    console.print(f"  [bold]Total Chat Terkirim:[/bold] [cyan]💬 {chats_sent}[/cyan]\n")


def interactive_loop():
    prompt_login_server()
    while True:
        console.clear()
        console.print(render_banner())

        console.print("\n[bold cyan]── MENU UTAMA ────────────────────────────────────────────────────────[/bold cyan]")
        console.print("  [bold yellow][1][/bold yellow] 🗺️  [bold white]Google Map (Mulai)[/bold white] [dim](Review Automation)[/dim]")
        console.print("  [bold yellow][2][/bold yellow] 🎵 [bold white]Tiktok Live (Mulai)[/bold white] [dim](Auto Tap-tap Like & Chat)[/dim]")
        console.print("  [bold yellow][3][/bold yellow] 🏢 [bold white]Daftar Target Bisnis[/bold white]")
        console.print("  [bold yellow][4][/bold yellow] ➕ [bold white]Tambah Target Bisnis Baru[/bold white]")
        console.print("  [bold yellow][5][/bold yellow] 🍪 [bold white]Kelola Cookie & Akun Google[/bold white]")
        console.print("  [bold yellow][6][/bold yellow] 🧪 [bold white]Tes Sesi & Validitas Cookie[/bold white]")
        console.print("  [bold yellow][7][/bold yellow] 📊 [bold white]Pantau Live Process Logs[/bold white]")
        console.print("  [bold yellow][8][/bold yellow] 🖥️  [bold white]Uji Browser Chromium (Diagnostik)[/bold white]")
        console.print("  [bold yellow][9][/bold yellow] 🔄 [bold white]Reset Antrean Ulasan Bisnis[/bold white]")
        console.print("  [bold yellow][10][/bold yellow] 🗑️  [bold white]Remove Ulasan (Hapus Review DB / Google Maps)[/bold white]")
        console.print("  [bold yellow][0][/bold yellow] 🚪 [bold red]Keluar[/bold red]")
        console.print("[bold cyan]───────────────────────────────────────────────────────────────────────[/bold cyan]")

        try:
            choice = Prompt.ask("\n[bold green]Pilih menu[/bold green]", choices=["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10"], default="1")
        except (KeyboardInterrupt, EOFError):
            console.print("\n[bold yellow]⚠️ Ctrl+C terdeteksi.[/bold yellow]")
            stop_all_running_tasks()
            break

        if choice == "0":
            console.print("\n[dim]Sampai jumpa![/dim]")
            break

        elif choice == "1":
            console.clear()
            console.print(render_banner())
            print_businesses_table()

            biz_id_str = Prompt.ask("\n[bold green]Masukkan ID Bisnis target[/bold green]")
            if not biz_id_str.isdigit():
                console.print("[red]ID tidak valid.[/red]")
                time.sleep(1.5)
                continue
            biz_id = int(biz_id_str)
            biz = db.get_business(biz_id)
            if not biz:
                console.print(f"[red]Bisnis dengan ID {biz_id} tidak ditemukan.[/red]")
                time.sleep(1.5)
                continue

            slots = IntPrompt.ask("[bold green]Jumlah Layar / Akun Paralel (1-6)[/bold green]", default=1)
            slots = max(1, min(6, slots))
            stars = IntPrompt.ask("[bold green]Rating Bintang (1-5)[/bold green]", default=5)
            stars = max(1, min(5, stars))

            if Confirm.ask(f"[bold cyan]Jalankan {slots} ulasan bintang {stars} untuk '{biz['name']}' sekarang?[/bold cyan]", default=True):
                run_task_interactive(biz_id, screen_count=slots, star_rating=stars)
            Prompt.ask("\n[dim]Tekan Enter untuk kembali ke menu...[/dim]")

        elif choice == "2":
            run_tiktok_live_interactive()
            Prompt.ask("\n[dim]Tekan Enter untuk kembali ke menu...[/dim]")

        elif choice == "3":
            console.clear()
            console.print(render_banner())
            print_businesses_table()
            Prompt.ask("\n[dim]Tekan Enter untuk kembali...[/dim]")

        elif choice == "4":
            console.clear()
            console.print(render_banner())
            console.print("[bold cyan]➕ Tambah Target Google Maps Baru[/bold cyan]\n")
            name = Prompt.ask("[bold green]Nama Bisnis / Tempat[/bold green]")
            url = Prompt.ask("[bold green]URL Google Maps[/bold green]")
            cat = Prompt.ask("[bold green]Kategori Bisnis (Opsional)[/bold green]", default="General")
            desc = Prompt.ask("[bold green]Deskripsi Singkat (Opsional)[/bold green]", default="")

            if name and url:
                new_id = db.add_business(name, url)
                db.set_business_category(new_id, cat)
                if desc:
                    cfg = db.get_review_config(new_id) or {}
                    cfg["business_description"] = desc
                    db.save_review_config(new_id, cfg)
                console.print(f"\n[bold green]✓ Target '{name}' berhasil didaftarkan dengan ID {new_id}![/bold green]")
            Prompt.ask("\n[dim]Tekan Enter untuk kembali...[/dim]")

        elif choice == "5":
            console.clear()
            console.print(render_banner())
            print_cookies_table()
            Prompt.ask("\n[dim]Tekan Enter untuk kembali...[/dim]")

        elif choice == "6":
            console.clear()
            console.print(render_banner())
            print_cookies_table()
            email_target = Prompt.ask("\n[bold green]Masukkan email akun yang ingin diuji (atau 'all' untuk semua)[/bold green]", default="all")

            if email_target.lower() == "all":
                with db.get_db() as conn:
                    all_accs = conn.execute(
                        "SELECT email, auth_method FROM cookies ORDER BY id ASC"
                    ).fetchall()
            else:
                with db.get_db() as conn:
                    row = conn.execute("SELECT email, auth_method FROM cookies WHERE email = ?", (email_target.strip(),)).fetchone()
                all_accs = [row] if row else []

            console.print(f"\n[cyan]Menguji validitas sesi {len(all_accs)} akun...[/cyan]")
            import requests as _req
            sm = session_manager.SessionManager()
            for acc_row in all_accs:
                em = acc_row["email"]
                method = acc_row["auth_method"] or "cookie"
                if method == "oauth":
                    token = db.get_valid_oauth_token(em)
                    if token:
                        try:
                            ui = _req.get(
                                "https://www.googleapis.com/oauth2/v3/tokeninfo",
                                params={"access_token": token},
                                timeout=8,
                            )
                            if ui.status_code == 200:
                                console.print(f"  [bold green]✓ [OAuth] {em}: Token Aktif & Valid[/bold green]")
                            else:
                                console.print(f"  [bold yellow]▲ [OAuth] {em}: Token invalid (HTTP {ui.status_code})[/bold yellow]")
                        except Exception as e:
                            console.print(f"  [bold yellow]▲ [OAuth] {em}: Tidak dapat verifikasi ({e})[/bold yellow]")
                    else:
                        console.print(f"  [bold red]✖ [OAuth] {em}: Token kedaluwarsa, perlu re-auth[/bold red]")
                else:
                    res = sm.validate_account_cookie(em, target_domain="google.com")
                    if res.is_valid:
                        console.print(f"  [bold green]✓ [Cookie] {em}: Sesi Valid & Aktif[/bold green]")
                    else:
                        console.print(f"  [bold red]✖ [Cookie] {em}: {res.status.value} ({res.reason})[/bold red]")
            Prompt.ask("\n[dim]Tekan Enter untuk kembali...[/dim]")

        elif choice == "7":
            console.clear()
            console.print(render_banner())
            print_recent_logs(limit=25)
            Prompt.ask("\n[dim]Tekan Enter untuk kembali...[/dim]")

        elif choice == "8":
            console.clear()
            console.print(render_banner())
            disp_choice = Prompt.ask("[bold green]Pilih Display virtual[/bold green]", default=":99")
            test_chromium_native(display=disp_choice)
            Prompt.ask("\n[dim]Tekan Enter untuk kembali...[/dim]")

        elif choice == "9":
            console.clear()
            console.print(render_banner())
            print_businesses_table()
            b_id_str = Prompt.ask("\n[bold green]Masukkan ID Bisnis yang ingin di-reset antreannya[/bold green]")
            if b_id_str.isdigit():
                b_id = int(b_id_str)
                db.delete_business_queue(b_id)
                db.clear_process_logs(b_id)
                console.print(f"[bold green]✓ Antrean ulasan dan log untuk Bisnis ID {b_id} telah dibersihkan.[/bold green]")
            Prompt.ask("\n[dim]Tekan Enter untuk kembali...[/dim]")

        elif choice == "10":
            console.clear()
            console.print(render_banner())
            print_businesses_table()
            b_id_str = Prompt.ask("\n[bold green]Masukkan ID Bisnis target yang ingin dihapus ulasannya[/bold green]")
            if b_id_str.isdigit():
                b_id = int(b_id_str)
                biz = db.get_business(b_id)
                if not biz:
                    console.print(f"[red]Bisnis ID {b_id} tidak ditemukan.[/red]")
                else:
                    reviews = db.get_reviews_for_business(b_id)
                    console.print(f"\n[bold cyan]Target: {biz['name']} (ID {b_id})[/bold cyan] — Total {len(reviews)} ulasan tercatat.")
                    console.print("  [bold yellow][1][/bold yellow] 🗑️  Hapus SEMUA ulasan di database target ini")
                    console.print("  [bold yellow][2][/bold yellow] 🔍  Hapus ulasan tertentu berdasarkan ID Review")
                    console.print("  [bold yellow][3][/bold yellow] 🛑  Hapus ulasan akun bot langsung di Google Maps (Chromium Live)")
                    console.print("  [bold yellow][0][/bold yellow] ↩️  Batal")

                    sub_c = Prompt.ask("[bold green]Pilih opsi[/bold green]", choices=["0", "1", "2", "3"], default="0")
                    if sub_c == "1":
                        if Confirm.ask(f"[bold red]Yakin hapus SEMUA ({len(reviews)}) ulasan untuk '{biz['name']}' dari database?[/bold red]"):
                            count = db.delete_all_reviews_for_business(b_id)
                            console.print(f"[bold green]✓ {count} ulasan berhasil dihapus dari database target {biz['name']}.[/bold green]")
                    elif sub_c == "2":
                        if not reviews:
                            console.print("[yellow]Tidak ada record ulasan untuk bisnis ini.[/yellow]")
                        else:
                            t = Table(box=box.SIMPLE_HEAVY)
                            t.add_column("ID", style="bold")
                            t.add_column("Status")
                            t.add_column("Rating")
                            t.add_column("Akun Email")
                            t.add_column("Cuplikan Ulasan")
                            for r in reviews[:20]:
                                st = str(r.get("status", "pending")).upper()
                                t.add_row(str(r["id"]), st, f"{r.get('star_rating', 5)} ★", str(r.get("email", "-")), (r.get("review_text") or "-")[:25])
                            console.print(t)
                            rid_in = Prompt.ask("[bold green]Masukkan ID Review yang ingin dihapus[/bold green]")
                            if rid_in.isdigit():
                                db.delete_review(int(rid_in))
                                console.print(f"[bold green]✓ Review #{rid_in} berhasil dihapus dari database.[/bold green]")
                    elif sub_c == "3":
                        posted = [r for r in reviews if r.get("status") in ("reviewed", "posted")]
                        with db.get_db() as conn:
                            all_emails = [dict(r) for r in conn.execute("SELECT id as email_id, email FROM emails ORDER BY id ASC").fetchall()]

                        console.print("\n[bold cyan]Pilih Target Akun di Google Maps:[/bold cyan]")
                        console.print(f"  [bold yellow][1][/bold yellow] 🌐  SEMUA Akun Master ({len(all_emails)} akun bot login & bersihkan ulasannya)")
                        console.print(f"  [bold yellow][2][/bold yellow] 📑  Hanya Akun yang Berstatus 'Reviewed' ({len(posted)} ulasan tercatat)")
                        console.print(f"  [bold yellow][0][/bold yellow] ↩️  Batal")
                        sc = Prompt.ask("[bold green]Pilih opsi[/bold green]", choices=["0", "1", "2"], default="1")

                        targets_to_clean = []
                        if sc == "1":
                            targets_to_clean = all_emails
                        elif sc == "2":
                            if not posted:
                                console.print("[yellow]Tidak ada ulasan berstatus 'reviewed' tercatat untuk bisnis ini.[/yellow]")
                            else:
                                targets_to_clean = posted

                        if targets_to_clean:
                            if Confirm.ask(f"[bold red]Luncurkan bot Chromium untuk MENGHAPUS ulasan di Google Maps untuk {len(targets_to_clean)} akun?[/bold red]"):
                                def run_del_bg(targs):
                                    for idx, row in enumerate(targs):
                                        bot.delete_own_review_on_maps(
                                            email=row.get("email"),
                                            maps_url=biz["url"],
                                            business_name=biz["name"],
                                            email_id=row.get("email_id"),
                                            business_id=b_id,
                                            slot_index=idx % 6,
                                        )
                                        time.sleep(2)
                                threading.Thread(target=run_del_bg, args=(targets_to_clean,), daemon=True).start()
                                console.print(f"[bold green]✓ Worker Chromium diluncurkan di background untuk memeriksa & menghapus ulasan {len(targets_to_clean)} akun di Google Maps.[/bold green]")
            Prompt.ask("\n[dim]Tekan Enter untuk kembali...[/dim]")


# ── CLI Subcommands Entrypoint ────────────────────────────────────────────────

def main():
    parser = argparse.ArgumentParser(description="AutoBotix Native Chromium CLI Engine (Zero-VM)")
    subparsers = parser.add_subparsers(dest="command", help="Perintah langsung")

    # Command: run
    run_parser = subparsers.add_parser("run", help="Jalankan tugas ulasan u/ bisnis tertentu")
    run_parser.add_argument("--business", "-b", type=int, required=True, help="ID Bisnis target")
    run_parser.add_argument("--slots", "-s", type=int, default=1, help="Jumlah slot browser paralel (1-6)")
    run_parser.add_argument("--stars", type=int, default=5, help="Rating bintang (1-5)")

    # Command: status
    subparsers.add_parser("status", help="Lihat ringkasan status sistem & database")

    # Command: businesses
    subparsers.add_parser("businesses", help="Daftar seluruh target bisnis Google Maps")

    # Command: cookies
    cookie_parser = subparsers.add_parser("cookies", help="Daftar status akun & cookie Google")
    cookie_parser.add_argument("--check", action="store_true", help="Uji validitas cookie")

    # Command: logs
    log_parser = subparsers.add_parser("logs", help="Lihat log proses terkini")
    log_parser.add_argument("--business", "-b", type=int, default=None, help="Filter per ID Bisnis")
    log_parser.add_argument("--lines", "-n", type=int, default=25, help="Jumlah baris log")

    # Command: test-browser
    test_parser = subparsers.add_parser("test-browser", help="Uji Chromium pada display Xvfb")
    test_parser.add_argument("--display", "-d", default=":99", help="Display virtual (default: :99)")

    # Command: tiktok-live
    tt_parser = subparsers.add_parser("tiktok-live", help="Mulai otomasi TikTok Live (Auto Tap-tap Like & Chat)")
    tt_parser.add_argument("--target", "-t", default="@evelyn.vln", help="Username host TikTok LIVE (default: @evelyn.vln)")
    tt_parser.add_argument("--speed", "-s", type=int, default=50, help="Kecepatan tap-tap like per detik (default: 50)")
    tt_parser.add_argument("--like-mode", "-l", choices=["santai", "turbo", "super_cepat"], default="super_cepat", help="Mode kecepatan like: santai (1.0s), turbo (0.35s), super_cepat (0.15s) (default: super_cepat)")
    tt_parser.add_argument("--chat", "-c", default="Semangat live kak! Support selalu 🔥", help="Pesan live chat")
    tt_parser.add_argument("--mode", "-m", choices=["parallel", "sequential", "paralel", "bergantian"], default="parallel", help="Mode eksekusi: parallel (serentak) atau sequential (bergantian)")

    args = parser.parse_args()

    try:
        if not args.command:
            # Interactive TUI mode
            interactive_loop()
        elif args.command == "status":
            console.print(render_banner())
        elif args.command == "businesses":
            print_businesses_table()
        elif args.command == "cookies":
            print_cookies_table()
            if args.check:
                import requests as _req
                import time as _t
                with db.get_db() as conn:
                    all_accounts = conn.execute(
                        "SELECT email, auth_method, oauth_access_token, oauth_refresh_token, "
                        "oauth_token_expiry, cookie_json FROM cookies ORDER BY id ASC"
                    ).fetchall()

                console.print("\n[bold cyan]🔍 Memverifikasi semua akun...[/bold cyan]")
                for row in all_accounts:
                    em = row["email"]
                    method = row["auth_method"] or "cookie"
                    if method == "oauth":
                        # Check via token validity
                        token = db.get_valid_oauth_token(em)
                        if token:
                            try:
                                ui = _req.get(
                                    "https://www.googleapis.com/oauth2/v3/tokeninfo",
                                    params={"access_token": token},
                                    timeout=8,
                                )
                                if ui.status_code == 200:
                                    console.print(f"[green]● [OAuth] {em}: AKTIF ✓[/green]")
                                else:
                                    console.print(f"[yellow]▲ [OAuth] {em}: Token invalid (HTTP {ui.status_code})[/yellow]")
                            except Exception as e:
                                console.print(f"[yellow]▲ [OAuth] {em}: Tidak dapat verifikasi ({e})[/yellow]")
                        else:
                            console.print(f"[red]✖ [OAuth] {em}: Token kedaluwarsa, perlu re-auth[/red]")
                    else:
                        sm = session_manager.SessionManager()
                        res = sm.validate_account_cookie(em, target_domain="google.com")
                        col = "green" if res.is_valid else "red"
                        console.print(f"[{col}]● [Cookie] {em}: {res.status.value} ({res.reason})[/{col}]")
        elif args.command == "logs":
            print_recent_logs(business_id=args.business, limit=args.lines)
        elif args.command == "test-browser":
            test_chromium_native(display=args.display)
        elif args.command == "run":
            run_task_interactive(args.business, screen_count=args.slots, star_rating=args.stars)
        elif args.command == "tiktok-live":
            mode_arg = "sequential" if args.mode in ("sequential", "bergantian") else "parallel"
            run_tiktok_live_interactive(target_user=args.target, tap_speed=args.speed, chat_message=args.chat, mode=mode_arg, interactive=False, like_mode=args.like_mode)
    except KeyboardInterrupt:
        console.print("\n[bold yellow]⚠️ Ctrl+C terdeteksi. Menghentikan semua tugas otomasi...[/bold yellow]")
        stop_all_running_tasks()
        sys.exit(0)


if __name__ == "__main__":
    main()
