import email
from email import policy
from email.parser import BytesParser
from email.utils import parseaddr, getaddresses
import uuid
import re
from typing import Dict, Any, List
from bs4 import BeautifulSoup

def clean_html_to_snippet(html_content: str, max_chars: int = 140) -> str:
    if not html_content:
        return ""
    soup = BeautifulSoup(html_content, "html.parser")
    # Remove script and style tags
    for script in soup(["script", "style"]):
        script.extract()
    text = soup.get_text(separator=" ", strip=True)
    text = re.sub(r"\s+", " ", text).strip()
    return text[:max_chars]

def normalize_subject(subject: str) -> str:
    if not subject:
        return ""
    # Strip Re:, Fwd:, FW:, etc.
    cleaned = re.sub(r"^(re|fwd|fw):\s*", "", subject, flags=re.IGNORECASE).strip()
    return cleaned

class MimeEmailParser:
    @staticmethod
    def parse_raw_email(raw_bytes: bytes) -> Dict[str, Any]:
        msg = BytesParser(policy=policy.default).parsebytes(raw_bytes)
        
        # 1. Standard Headers
        message_id = msg.get("Message-ID", f"<{uuid.uuid4()}@local.axiommail>")
        in_reply_to = msg.get("In-Reply-To", None)
        references = msg.get("References", None)
        subject = msg.get("Subject", "(No Subject)")
        
        from_raw = msg.get("From", "")
        from_name, from_address = parseaddr(from_raw)
        if not from_name:
            from_name = from_address
            
        to_raw = msg.get_all("To", [])
        to_addresses = [addr for _, addr in getaddresses(to_raw)] if to_raw else []

        cc_raw = msg.get_all("Cc", [])
        cc_addresses = [addr for _, addr in getaddresses(cc_raw)] if cc_raw else []

        bcc_raw = msg.get_all("Bcc", [])
        bcc_addresses = [addr for _, addr in getaddresses(bcc_raw)] if bcc_raw else []

        # 2. Extract Body and Attachments
        body_plain = ""
        body_html = ""
        attachments: List[Dict[str, Any]] = []

        if msg.is_multipart():
            for part in msg.walk():
                content_type = part.get_content_type()
                content_disposition = str(part.get("Content-Disposition", ""))
                content_id = part.get("Content-ID", None)
                
                # Check for attachments or inline images
                if "attachment" in content_disposition or part.get_filename():
                    filename = part.get_filename() or f"attachment_{uuid.uuid4().hex[:8]}"
                    file_payload = part.get_payload(decode=True) or b""
                    attachments.append({
                        "filename": filename,
                        "content_type": content_type,
                        "size_bytes": len(file_payload),
                        "data": file_payload,
                        "content_id": content_id.strip("<>") if content_id else None,
                        "is_inline": "inline" in content_disposition
                    })
                elif content_type == "text/plain" and not body_plain:
                    try:
                        body_plain = part.get_payload(decode=True).decode(part.get_content_charset() or "utf-8", errors="replace")
                    except Exception:
                        body_plain = str(part.get_payload())
                elif content_type == "text/html" and not body_html:
                    try:
                        body_html = part.get_payload(decode=True).decode(part.get_content_charset() or "utf-8", errors="replace")
                    except Exception:
                        body_html = str(part.get_payload())
        else:
            content_type = msg.get_content_type()
            payload = msg.get_payload(decode=True) or b""
            charset = msg.get_content_charset() or "utf-8"
            decoded = payload.decode(charset, errors="replace") if isinstance(payload, bytes) else str(payload)
            if content_type == "text/html":
                body_html = decoded
            else:
                body_plain = decoded

        # Snippet generation
        snippet = clean_html_to_snippet(body_html) if body_html else (body_plain[:140] if body_plain else "")

        return {
            "message_id": message_id,
            "in_reply_to": in_reply_to,
            "references": references,
            "subject": subject,
            "normalized_subject": normalize_subject(subject),
            "from_address": from_address,
            "from_name": from_name,
            "to_addresses": to_addresses,
            "cc_addresses": cc_addresses,
            "bcc_addresses": bcc_addresses,
            "body_plain": body_plain,
            "body_html": body_html,
            "snippet": snippet,
            "attachments": attachments,
            "size_bytes": len(raw_bytes)
        }
