#!/usr/bin/env python3
"""Send a styled HTML email with a table to a fixed recipient."""

from __future__ import annotations

import smtplib
import ssl
import sys
from email.message import EmailMessage
from html import escape


# SMTP configuration (outgoing mail)
SMTP_CONFIG = {
    "host": os.getenv("EXEC_EMAIL_HOST", "smtp.exmail.qq.com"),
    "port": int(os.getenv("EXEC_EMAIL_SMTP_PORT", "465")),
    "user": os.getenv("EXEC_EMAIL_USER", ""),
    "password": os.getenv("EXEC_EMAIL_PASSWORD", ""),
    "recipient": os.getenv("INSTRUCTION_EMAIL_USER", ""),
}


#RECIPIENT = "magiccaptain510@gmail.com"
RECIPIENT = "2876254887@qq.com"
SUBJECT = "Kafang Algo HTML table test email"


TABLE_ROWS = [
        ("Status", "Success", "This email contains an HTML table"),
        ("Script", "send_simple_email.py", "Sent from the project root"),
        ("Recipient", RECIPIENT, "Fixed destination address"),
]


def build_html_body() -> str:
        rows_html = "\n".join(
                "<tr>"
                f"<td>{escape(label)}</td>"
                f"<td>{escape(value)}</td>"
                f"<td>{escape(note)}</td>"
                "</tr>"
                for label, value, note in TABLE_ROWS
        )

        return f"""<!doctype html>
<html lang=\"zh-CN\">
    <head>
        <meta charset=\"utf-8\" />
        <meta name=\"viewport\" content=\"width=device-width, initial-scale=1\" />
        <title>{escape(SUBJECT)}</title>
    </head>
    <body style=\"margin:0;padding:0;background:#f6f8fb;font-family:Arial,Helvetica,sans-serif;color:#1f2937;\">
        <div style=\"max-width:720px;margin:0 auto;padding:32px 20px;\">
            <div style=\"background:#ffffff;border:1px solid #e5e7eb;border-radius:14px;box-shadow:0 8px 24px rgba(15,23,42,.08);overflow:hidden;\">
                <div style=\"padding:22px 24px;background:linear-gradient(135deg,#0f766e,#134e4a);color:#ffffff;\">
                    <div style=\"font-size:20px;font-weight:700;line-height:1.3;\">Kafang Algo HTML Table Email</div>
                    <div style=\"margin-top:6px;font-size:13px;opacity:.9;\">A simple styled email with a table</div>
                </div>
                <div style=\"padding:24px;\">
                    <p style=\"margin:0 0 16px 0;font-size:14px;line-height:1.7;\">
                        下面是一封由脚本生成的 HTML 邮件。表格使用了内联样式，邮件客户端一般都能正常显示。
                    </p>
                    <table style=\"width:100%;border-collapse:collapse;font-size:14px;\">
                        <thead>
                            <tr>
                                <th style=\"text-align:left;padding:12px 14px;background:#1d4ed8;color:#ffffff;border:1px solid #1e40af;font-weight:700;\">Item</th>
                                <th style=\"text-align:left;padding:12px 14px;background:#1d4ed8;color:#ffffff;border:1px solid #1e40af;font-weight:700;\">Value</th>
                                <th style=\"text-align:left;padding:12px 14px;background:#1d4ed8;color:#ffffff;border:1px solid #1e40af;font-weight:700;\">Note</th>
                            </tr>
                        </thead>
                        <tbody>
                            {rows_html}
                        </tbody>
                    </table>
                    <p style=\"margin:18px 0 0 0;font-size:12px;line-height:1.6;color:#6b7280;\">
                        If you can see the colored header and bordered cells, the HTML email rendering works.
                    </p>
                </div>
            </div>
        </div>
    </body>
</html>"""


def build_plain_text_body() -> str:
    lines = ["Kafang Algo HTML Table Email", ""]
    for label, value, note in TABLE_ROWS:
        lines.append(f"{label}: {value} ({note})")
    return "\n".join(lines)


def build_message() -> EmailMessage:
    message = EmailMessage()
    message["From"] = SMTP_CONFIG["user"]
    message["To"] = RECIPIENT
    message["Subject"] = SUBJECT
    message.set_content(build_plain_text_body())
    message.add_alternative(build_html_body(), subtype="html")
    return message


def send_message(message: EmailMessage) -> None:
    context = ssl.create_default_context()
    host = SMTP_CONFIG["host"]
    port = SMTP_CONFIG["port"]

    if port == 465:
        with smtplib.SMTP_SSL(host, port, context=context) as smtp:
            smtp.login(SMTP_CONFIG["user"], SMTP_CONFIG["password"])
            smtp.send_message(message)
        return

    with smtplib.SMTP(host, port) as smtp:
        smtp.ehlo()
        smtp.starttls(context=context)
        smtp.ehlo()
        smtp.login(SMTP_CONFIG["user"], SMTP_CONFIG["password"])
        smtp.send_message(message)


def main() -> int:
    if not SMTP_CONFIG["user"] or not SMTP_CONFIG["password"]:
        print("Error: EXEC_EMAIL_USER or EXEC_EMAIL_PASSWORD is not configured.")
        return 1

    try:
        print(
            f"Connecting to {SMTP_CONFIG['host']}:{SMTP_CONFIG['port']} "
            f"as {SMTP_CONFIG['user']}"
        )
        message = build_message()
        send_message(message)

        print(f"Email sent successfully to {RECIPIENT}")
        return 0

    except Exception as exc:
        print(f"Error: {exc}")
        return 1


if __name__ == "__main__":
    raise SystemExit(main())