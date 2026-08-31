import re
from datetime import datetime
from typing import Dict, Any, List
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, or_, func, text
from app.db.models import Thread, Message, Mailbox, message_mailboxes

class SearchQueryParser:
    @staticmethod
    def parse_query(raw_query: str) -> Dict[str, Any]:
        filters: Dict[str, Any] = {
            "from": None,
            "to": None,
            "subject": None,
            "has_attachment": None,
            "is_read": None,
            "is_starred": None,
            "before": None,
            "after": None,
            "label": None,
            "free_text": []
        }
        
        # Regex tokens for key:value
        pattern = r'(\b(?:from|to|subject|has|is|before|after|label):[^\s]+)'
        tokens = re.split(r'\s+', raw_query.strip())
        
        for tok in tokens:
            if not tok:
                continue
            if tok.startswith("from:"):
                filters["from"] = tok[5:].strip()
            elif tok.startswith("to:"):
                filters["to"] = tok[3:].strip()
            elif tok.startswith("subject:"):
                filters["subject"] = tok[8:].strip()
            elif tok == "has:attachment":
                filters["has_attachment"] = True
            elif tok == "is:unread":
                filters["is_read"] = False
            elif tok == "is:read":
                filters["is_read"] = True
            elif tok == "is:starred":
                filters["is_starred"] = True
            elif tok.startswith("before:"):
                try:
                    filters["before"] = datetime.fromisoformat(tok[7:].strip())
                except ValueError:
                    pass
            elif tok.startswith("after:"):
                try:
                    filters["after"] = datetime.fromisoformat(tok[6:].strip())
                except ValueError:
                    pass
            elif tok.startswith("label:") or tok.startswith("in:"):
                filters["label"] = tok.split(":", 1)[1].strip()
            else:
                filters["free_text"].append(tok)
                
        filters["free_text_query"] = " ".join(filters["free_text"]).strip()
        return filters

class MailSearchEngine:
    @staticmethod
    async def search_threads(
        db: AsyncSession,
        user_id: Any,
        raw_query: str,
        limit: int = 50,
        offset: int = 0
    ) -> List[Thread]:
        parsed = SearchQueryParser.parse_query(raw_query)
        conditions = [Thread.user_id == user_id]

        if parsed["is_read"] is not None:
            conditions.append(Thread.is_read == parsed["is_read"])
        if parsed["is_starred"] is not None:
            conditions.append(Thread.is_starred == parsed["is_starred"])
        if parsed["has_attachment"] is not None:
            conditions.append(Thread.has_attachments == parsed["has_attachment"])
        if parsed["subject"]:
            conditions.append(Thread.subject.ilike(f"%{parsed['subject']}%"))
        if parsed["before"]:
            conditions.append(Thread.last_message_at <= parsed["before"])
        if parsed["after"]:
            conditions.append(Thread.last_message_at >= parsed["after"])

        # If free text or message-specific attributes are specified, join with Message
        if parsed["from"] or parsed["to"] or parsed["free_text_query"]:
            subquery = select(Message.thread_id).where(Message.user_id == user_id)
            if parsed["from"]:
                subquery = subquery.where(
                    or_(
                        Message.from_address.ilike(f"%{parsed['from']}%"),
                        Message.from_name.ilike(f"%{parsed['from']}%")
                    )
                )
            if parsed["to"]:
                subquery = subquery.where(
                    func.cast(Message.to_addresses, text("text")).ilike(f"%{parsed['to']}%")
                )
            if parsed["free_text_query"]:
                search_term = f"%{parsed['free_text_query']}%"
                subquery = subquery.where(
                    or_(
                        Message.subject.ilike(search_term),
                        Message.body_plain.ilike(search_term),
                        Message.from_name.ilike(search_term),
                        Message.from_address.ilike(search_term)
                    )
                )
            conditions.append(Thread.id.in_(subquery))

        query = (
            select(Thread)
            .where(and_(*conditions))
            .order_by(Thread.last_message_at.desc())
            .limit(limit)
            .offset(offset)
        )

        res = await db.execute(query)
        return list(res.scalars().all())

search_engine = MailSearchEngine()
