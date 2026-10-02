import os
import json
import urllib.request
import urllib.error
from fastapi import HTTPException

HOW_TO_SAY_NO_SYSTEM_INSTRUCTION = """
You are "HowToSayNo AI", a specialized communication assistant designed to help people politely, clearly, confidently, and diplomatically say "NO".

STRICT OUTPUT FORMAT RULES:
Generate exactly 2 short, natural, ready-to-send refusal messages based only on the user's situation, recipient, and selected tone.

Separate the two options with "###" on a single line between them.

Format example:
"Hi [Name], I really appreciate you thinking of me for this. Unfortunately, my plate is currently full with my family commitments this weekend, so I won't be able to take this on."
###
"I'd love to help out with this, but I'm completely booked up this weekend and need to protect that time for family."

Rules:
- Do NOT include any prefixes like "**AI:**", headings, labels, explanations, or numbers.
- Wrap each message draft in quotation marks if natural.
- Separate draft 1 and draft 2 strictly with "###".
"""

def generate_refusal(
    situation: str,
    recipient: str,
    tone: str,
    relationship: str = None,
    medium: str = None,
    words: str = None,
    goal: str = None,
    language: str = None,
    mode: str = None
) -> str:
    gemini_api_key = os.getenv("GEMINI_API_KEY")
    if not gemini_api_key:
        raise HTTPException(
            status_code=500,
            detail="GEMINI_API_KEY is not configured on the server"
        )

    model_name = os.getenv("GEMINI_MODEL", "gemini-3.5-flash-lite")

    prompt_details = [
        f"Situation: {situation}",
        f"Recipient: {recipient}",
        f"Tone: {tone}"
    ]
    if relationship:
        prompt_details.append(f"Relationship: {relationship}")
    if medium:
        prompt_details.append(f"Medium/Channel: {medium}")
    if words:
        prompt_details.append(f"Target Word Count / Length: {words}")
    if goal:
        prompt_details.append(f"Primary Goal: {goal}")
    if language:
        prompt_details.append(f"Language: {language}")
    if mode:
        prompt_details.append(f"Output Mode: {mode}")

    details_str = "\n".join(prompt_details)

    prompt = (
        f"{HOW_TO_SAY_NO_SYSTEM_INSTRUCTION}\n\n"
        f"INPUT PARAMETERS:\n"
        f"{details_str}\n\n"
        f"Generate the exact 2 short, ready-to-send refusal messages now, separated by '###'."
    )

    url = f"https://generativelanguage.googleapis.com/v1beta/models/{model_name}:generateContent?key={gemini_api_key}"
    headers = {"Content-Type": "application/json"}
    payload = json.dumps({
        "contents": [
            {
                "parts": [
                    {"text": prompt}
                ]
            }
        ]
    }).encode("utf-8")

    req = urllib.request.Request(url, data=payload, headers=headers, method="POST")

    try:
        with urllib.request.urlopen(req, timeout=15) as response:
            res_body = json.loads(response.read().decode("utf-8"))
            candidates = res_body.get("candidates", [])
            if not candidates:
                raise HTTPException(status_code=502, detail="No response candidate returned from Gemini API")
            
            parts = candidates[0].get("content", {}).get("parts", [])
            if not parts:
                raise HTTPException(status_code=502, detail="Empty content parts returned from Gemini API")
            
            text = parts[0].get("text", "").strip()
            if not text:
                raise HTTPException(status_code=502, detail="Blank response text returned from Gemini API")
            
            return text
    except urllib.error.HTTPError as e:
        error_detail = e.reason
        try:
            err_json = json.loads(e.read().decode("utf-8"))
            error_detail = err_json.get("error", {}).get("message", e.reason)
        except Exception:
            pass
        raise HTTPException(status_code=e.code if 400 <= e.code < 600 else 500, detail=f"Gemini API Error: {error_detail}")
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to communicate with Gemini API: {str(e)}")
