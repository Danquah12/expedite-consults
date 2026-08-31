import aiosmtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from email.mime.base import MIMEBase
from email import encoders
from typing import List, Optional
import logging
from app.core.config import settings

logger = logging.getLogger(__name__)

class SmtpDispatcher:
    @staticmethod
    async def send_email(
        from_address: str,
        to_addresses: List[str],
        subject: str,
        body_html: str,
        body_plain: Optional[str] = None,
        cc_addresses: Optional[List[str]] = None,
        bcc_addresses: Optional[List[str]] = None,
        in_reply_to: Optional[str] = None,
        references: Optional[str] = None,
        attachments: Optional[List[dict]] = None
    ) -> str:
        msg = MIMEMultipart("mixed")
        msg["From"] = from_address
        msg["To"] = ", ".join(to_addresses)
        msg["Subject"] = subject
        
        if cc_addresses:
            msg["Cc"] = ", ".join(cc_addresses)
        if in_reply_to:
            msg["In-Reply-To"] = in_reply_to
        if references:
            msg["References"] = references

        # Alternative body container (HTML + Plain)
        alt_part = MIMEMultipart("alternative")
        if body_plain:
            alt_part.attach(MIMEText(body_plain, "plain", "utf-8"))
        if body_html:
            alt_part.attach(MIMEText(body_html, "html", "utf-8"))
        msg.attach(alt_part)

        # Attachments
        if attachments:
            for att in attachments:
                part = MIMEBase("application", "octet-stream")
                part.set_payload(att["data"])
                encoders.encode_base64(part)
                part.add_header(
                    "Content-Disposition",
                    f'attachment; filename="{att["filename"]}"'
                )
                msg.attach(part)

        all_recipients = list(set(to_addresses + (cc_addresses or []) + (bcc_addresses or [])))

        try:
            await aiosmtplib.send(
                msg,
                hostname=settings.SMTP_HOST,
                port=settings.SMTP_PORT,
                username=settings.SMTP_USER,
                password=settings.SMTP_PASSWORD,
                use_tls=settings.SMTP_USE_TLS,
                start_tls=False if not settings.SMTP_USE_TLS else True
            )
            logger.info(f"Successfully dispatched message from {from_address} to {all_recipients}")
            return msg.get("Message-ID", "")
        except Exception as e:
            logger.error(f"Failed to dispatch email via SMTP: {e}")
            raise RuntimeError(f"SMTP delivery failed: {e}")

smtp_dispatcher = SmtpDispatcher()
