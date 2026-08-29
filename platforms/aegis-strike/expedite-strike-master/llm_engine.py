# /opt/vuln_intel/app/llm_engine.py
# Unified LLM engine — tries OpenAI first, falls back to Claude (Anthropic)

import os


def _call_openai(prompt: str, max_tokens: int = 800) -> str:
    from openai import OpenAI
    key = os.getenv("OPENAI_API_KEY", "").strip()
    if not key:
        raise ValueError("OPENAI_API_KEY not set")
    client = OpenAI(api_key=key)
    resp = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[{"role": "user", "content": prompt}],
        max_tokens=max_tokens,
    )
    return resp.choices[0].message.content


def _call_claude(prompt: str, max_tokens: int = 800) -> str:
    import anthropic
    key = os.getenv("ANTHROPIC_API_KEY", "").strip()
    if not key:
        raise ValueError("ANTHROPIC_API_KEY not set")
    client = anthropic.Anthropic(api_key=key)
    msg = client.messages.create(
        model="claude-opus-4-5",
        max_tokens=max_tokens,
        messages=[{"role": "user", "content": prompt}],
    )
    return msg.content[0].text


def call_llm(prompt: str, max_tokens: int = 800) -> str:
    """
    Unified LLM call used across the platform.
    Tries OpenAI GPT-4o-mini first; falls back to Claude if unavailable.
    """
    openai_err = ""
    try:
        return _call_openai(prompt, max_tokens)
    except Exception as e:
        openai_err = str(e)

    try:
        return _call_claude(prompt, max_tokens)
    except Exception as e:
        return f"LLM Error — OpenAI: {openai_err} | Claude: {str(e)}"
