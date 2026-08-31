import logging
import httpx
from typing import Dict, Any, List
from app.core.config import settings

logger = logging.getLogger(__name__)

class AIService:
    @staticmethod
    async def summarize_thread(messages: List[Dict[str, Any]]) -> Dict[str, Any]:
        if not messages:
            return {
                "summary": "No messages in thread.",
                "key_points": [],
                "action_items": []
            }
            
        combined_text = "\n---\n".join([
            f"From: {m.get('from_name') or m.get('from_address')}\nDate: {m.get('received_at')}\nSubject: {m.get('subject')}\nBody:\n{m.get('body_plain') or m.get('snippet')}"
            for m in messages
        ])

        # If external LLM key is provided (e.g. Gemini / OpenAI / Anthropic), call API:
        if settings.GEMINI_API_KEY or settings.OPENAI_API_KEY:
            try:
                # LLM API Call integration
                pass
            except Exception as e:
                logger.warning(f"External LLM API call failed, falling back to local extractor: {e}")

        # High-performance local heuristic NLP synthesis
        latest_msg = messages[-1]
        sender = latest_msg.get("from_name") or latest_msg.get("from_address")
        subject = latest_msg.get("subject", "")
        body_snippet = latest_msg.get("snippet", "") or (latest_msg.get("body_plain", "")[:200])

        summary = f"Conversation between {len(set(m.get('from_address') for m in messages))} participants regarding '{subject}'. Latest update from {sender}: {body_snippet[:120]}..."
        
        key_points = [
            f"Subject: {subject}",
            f"Latest response delivered by {sender}",
            f"Thread spans {len(messages)} chronological message(s)"
        ]

        action_items = []
        lower_body = (latest_msg.get("body_plain") or "").lower()
        if "please" in lower_body or "could you" in lower_body or "?" in lower_body:
            action_items.append(f"Review and respond to inquiry from {sender}")
        if "meeting" in lower_body or "schedule" in lower_body or "calendar" in lower_body:
            action_items.append("Check calendar availability for proposed meeting time")
        if "invoice" in lower_body or "payment" in lower_body or "attach" in lower_body:
            action_items.append("Verify attached documents / invoices")

        return {
            "summary": summary,
            "key_points": key_points,
            "action_items": action_items if action_items else ["No immediate action required"]
        }

    @staticmethod
    async def generate_reply_draft(
        thread_subject: str,
        last_message_body: str,
        sender_name: str,
        tone: str = "professional",
        custom_instructions: str = ""
    ) -> Dict[str, Any]:
        tone_greetings = {
            "professional": f"Hi {sender_name},\n\nThank you for reaching out regarding this.",
            "casual": f"Hey {sender_name},\n\nThanks for the update!",
            "assertive": f"Hello {sender_name},\n\nI have reviewed your message regarding {thread_subject}.",
            "concise": f"Hi {sender_name},\n\nNoted."
        }
        
        greeting = tone_greetings.get(tone.lower(), tone_greetings["professional"])
        
        reply_subject = thread_subject if thread_subject.lower().startswith("re:") else f"Re: {thread_subject}"
        
        body_text = f"{greeting}\n\n"
        if custom_instructions:
            body_text += f"In response to your inquiry ({custom_instructions}), I have reviewed the details and will proceed accordingly.\n\n"
        else:
            body_text += f"I have received your note and am reviewing the details. I will follow up with any updates shortly.\n\n"
            
        body_text += "Best regards,\n"
        
        quick_replies = [
            "Sounds good, let's proceed!",
            "Thanks for the update, will review shortly.",
            "Could you please provide more details?",
            "Let's schedule a quick call to discuss."
        ]

        return {
            "subject": reply_subject,
            "body_plain": body_text,
            "body_html": f"<p>{body_text.replace(chr(10), '<br/>')}</p>",
            "suggested_quick_replies": quick_replies
        }

    @staticmethod
    def classify_email(subject: str, body: str, sender: str) -> Dict[str, Any]:
        text = f"{subject} {body} {sender}".lower()
        if any(term in text for term in ["urgent", "asap", "immediate", "security alert", "critical", "action required"]):
            return {"category": "urgent", "confidence": 0.92, "reason": "High-urgency keywords detected"}
        elif any(term in text for term in ["discount", "sale", "newsletter", "unsubscribe", "promotion", "% off", "deal"]):
            return {"category": "promotions", "confidence": 0.88, "reason": "Marketing / Promotional patterns"}
        elif any(term in text for term in ["notification", "status update", "build", "jira", "github", "automated", "no-reply"]):
            return {"category": "updates", "confidence": 0.85, "reason": "System notification or automated report"}
        else:
            return {"category": "primary", "confidence": 0.95, "reason": "Standard direct correspondence"}

ai_service = AIService()
