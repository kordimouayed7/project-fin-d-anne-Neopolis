import time
from typing import Dict, List, Tuple

import psutil
import requests

try:
    import win32evtlog
except ImportError as exc:
    raise SystemExit(
        "pywin32 is required for os_agent.py. Install it with: pip install pywin32"
    ) from exc


BACKEND_URL = "http://localhost:8000/api/logs/ingest"
POLL_INTERVAL_SECONDS = 10
HEADERS = {
    "Content-Type": "application/json",
    "X-API-Key": "super-secret-key-123",
}
TARGET_LOGS = ["Application", "System", "Security"]

EVENT_TYPE_MAP = {
    win32evtlog.EVENTLOG_ERROR_TYPE: "ERROR",
    win32evtlog.EVENTLOG_WARNING_TYPE: "WARNING",
    win32evtlog.EVENTLOG_INFORMATION_TYPE: "INFO",
    win32evtlog.EVENTLOG_AUDIT_SUCCESS: "INFO",
    win32evtlog.EVENTLOG_AUDIT_FAILURE: "WARNING",
}


def post_log(payload: Dict[str, object]) -> None:
    """Send one parsed Windows event to the FastAPI ingest endpoint."""
    try:
        response = requests.post(BACKEND_URL, json=payload, headers=HEADERS, timeout=5)
        if response.status_code == 200:
            print(f"[OK] Sent [{payload['level']}] log from Windows Event Viewer")
        else:
            print(
                f"[WARN] Backend response {response.status_code}: {response.text[:120]}"
            )
    except requests.exceptions.RequestException as exc:
        print(f"[WARN] Could not send log to backend: {exc}")


def get_latest_record_number(log_name: str) -> int:
    """Return the latest record number currently present in a Windows event log."""
    handle = win32evtlog.OpenEventLog(None, log_name)
    try:
        # pywin32 APIs are dynamically typed; cast to int to avoid linter/type issues.
        oldest = int(win32evtlog.GetOldestEventLogRecord(handle))
        total = int(win32evtlog.GetNumberOfEventLogRecords(handle))
        if total <= 0:
            return oldest
        return oldest + total - 1
    finally:
        win32evtlog.CloseEventLog(handle)


def read_new_events(log_name: str, last_record: int) -> Tuple[List[dict], int]:
    """
    Read only events newer than last_record from the given log.
    Returns (payloads_to_send, new_last_record).
    """
    handle = win32evtlog.OpenEventLog(None, log_name)
    payloads: List[dict] = []
    new_last_record = last_record

    try:
        flags = win32evtlog.EVENTLOG_FORWARDS_READ | win32evtlog.EVENTLOG_SEQUENTIAL_READ
        events = win32evtlog.ReadEventLog(handle, flags, last_record + 1)

        while events:
            for event in events:
                record_number = int(event.RecordNumber)
                if record_number <= new_last_record:
                    continue

                # Always move cursor forward so we never resend duplicates.
                new_last_record = record_number

                # Keep every event type. Unknown types are treated as INFO.
                level = EVENT_TYPE_MAP.get(event.EventType, "INFO")

                inserts = event.StringInserts or []
                message = " | ".join(str(part) for part in inserts).strip()
                if not message:
                    message = f"EventID={event.EventID} Source={event.SourceName}"

                payloads.append(
                    {
                        "timestamp": str(event.TimeGenerated),
                        "level": level,
                        "message": message,
                    }
                )

            events = win32evtlog.ReadEventLog(handle, flags, 0)

    finally:
        win32evtlog.CloseEventLog(handle)

    return payloads, new_last_record


def main() -> None:
    while True:
        try:
            # Initialize cursors at current tail so agent streams only future events.
            last_seen: Dict[str, int] = {}
            for log_name in TARGET_LOGS:
                try:
                    last_seen[log_name] = get_latest_record_number(log_name)
                    print(f"[INIT] {log_name} cursor at record {last_seen[log_name]}")
                except Exception as exc:
                    last_seen[log_name] = 0
                    print(f"[WARN] Could not initialize {log_name} log cursor: {exc}")

            print(
                "[AGENT] Monitoring Windows Application/System/Security logs for all levels..."
            )

            while True:
                for log_name in TARGET_LOGS:
                    try:
                        payloads, new_last = read_new_events(log_name, last_seen[log_name])
                        last_seen[log_name] = new_last

                        for payload in payloads:
                            payload["cpu_percent"] = psutil.cpu_percent()
                            payload["ram_percent"] = psutil.virtual_memory().percent
                            post_log(payload)

                    except Exception as exc:
                        print(f"[WARN] Failed to read {log_name} event log: {exc}")

                time.sleep(POLL_INTERVAL_SECONDS)

        except Exception as e:
            print(f"[CRITICAL] Agent crashed, rebooting in 5 seconds: {e}")
            time.sleep(5)


if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\n[AGENT] Stopped by user.")
