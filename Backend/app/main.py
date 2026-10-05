import os
import json
import urllib.request
import urllib.error
from uuid import UUID, uuid4
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from dotenv import load_dotenv

from app.gemini_service import generate_refusal

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL", "")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY") or os.getenv("SUPABASE_SERVICE_KEY") or os.getenv("SUPABASE_KEY", "")

if not SUPABASE_URL or not SUPABASE_KEY:
    raise RuntimeError("SUPABASE_URL and SUPABASE_KEY (or SUPABASE_SERVICE_ROLE_KEY) must be set in backend/.env")

app = FastAPI(
    title="HowToSayNo API",
    description="Backend API for HowToSayNo MVP",
    version="0.1.0"
)

origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "https://*.vercel.app",
    "https://*.onrender.com",
    "*"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def supabase_request(endpoint: str, method: str = "GET", data: dict = None, prefer: str = None):
    url = f"{SUPABASE_URL}/rest/v1/{endpoint}"
    headers = {
        "apikey": SUPABASE_KEY,
        "Authorization": f"Bearer {SUPABASE_KEY}",
        "Content-Type": "application/json"
    }
    if prefer:
        headers["Prefer"] = prefer

    payload = json.dumps(data).encode("utf-8") if data is not None else None
    req = urllib.request.Request(url, data=payload, headers=headers, method=method)
    
    with urllib.request.urlopen(req, timeout=10) as resp:
        body = resp.read().decode("utf-8")
        if body:
            return json.loads(body)
        return None

class GenerateRequest(BaseModel):
    user_id: UUID
    situation: str = Field(..., min_length=1)
    recipient: str = Field(..., min_length=1)
    tone: str = Field(..., min_length=1)
    relationship: str | None = None
    medium: str | None = None
    words: str | None = None
    goal: str | None = None
    language: str | None = None
    mode: str | None = None
    is_authenticated: bool = False


@app.get("/api/health")
def health_check():
    return {
        "status": "ok",
        "message": "HowToSayNo API is running"
    }

def get_or_create_usage(user_id: UUID):
    data = supabase_request(f"usage?user_id=eq.{user_id}&select=user_id,generation_count")
    
    if not data or len(data) == 0:
        # Auto-create initial usage record for user if needed
        try:
            inserted_data = supabase_request(
                "usage",
                method="POST",
                data={"user_id": str(user_id), "generation_count": 0},
                prefer="resolution=merge-duplicates,return=representation"
            )
            if inserted_data and len(inserted_data) > 0:
                return inserted_data[0]
        except Exception:
            pass
        return {"user_id": str(user_id), "generation_count": 0}
        
    return data[0]

@app.get("/api/usage/{user_id}")
def get_user_usage(user_id: UUID, is_authenticated: bool = False):
    try:
        usage_row = get_or_create_usage(user_id)
        gen_count = usage_row.get("generation_count", 0)
        max_limit = 10 if is_authenticated else 3
        free_remaining = max(0, max_limit - gen_count)

        return {
            "user_id": str(user_id),
            "generation_count": gen_count,
            "max_limit": max_limit,
            "free_generations_remaining": free_remaining,
            "is_authenticated": is_authenticated
        }
    except HTTPException:
        raise
    except urllib.error.HTTPError as e:
        raise HTTPException(status_code=e.code, detail=e.reason)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/usage/{user_id}/increment")
def increment_user_usage(user_id: UUID, is_authenticated: bool = False):
    try:
        from datetime import datetime, timezone
        usage_row = get_or_create_usage(user_id)
        current_count = usage_row.get("generation_count", 0)
        new_count = current_count + 1
        
        now_iso = datetime.now(timezone.utc).isoformat()
        
        updated_data = supabase_request(
            f"usage?user_id=eq.{user_id}",
            method="PATCH",
            data={
                "generation_count": new_count,
                "updated_at": now_iso
            },
            prefer="return=representation"
        )
        
        if updated_data and len(updated_data) > 0:
            final_count = updated_data[0].get("generation_count", new_count)
        else:
            final_count = new_count

        print(f"Usage increment: {user_id} -> {final_count}")

        return {
            "user_id": str(user_id),
            "generation_count": final_count,
            "free_generations_remaining": max(0, 3 - final_count)
        }
    except HTTPException:
        raise
    except urllib.error.HTTPError as e:
        if e.code == 404:
            raise HTTPException(status_code=404, detail="User usage not found")
        raise HTTPException(status_code=e.code, detail=e.reason)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/generate")
def generate_refusal_endpoint(req_body: GenerateRequest):
    user_id = req_body.user_id
    is_auth = req_body.is_authenticated
    max_limit = 10 if is_auth else 3
    
    # 1. Check user row in public.usage (auto-create if missing)
    try:
        usage_data = supabase_request(f"usage?user_id=eq.{user_id}&select=user_id,generation_count")
        if not usage_data or len(usage_data) == 0:
            usage_row = get_or_create_usage(user_id)
        else:
            usage_row = usage_data[0]
    except urllib.error.HTTPError as e:
        raise HTTPException(status_code=e.code, detail=f"Database error: {e.reason}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

    current_count = usage_row.get("generation_count", 0)

    # 2. Check 403 limit
    if current_count >= max_limit:
        err_detail = "Member credit limit reached (10/10). Upgrade to Pro for unlimited AI access!" if is_auth else "Free guest limit reached (3/3). Please sign in to unlock 10 total credits!"
        raise HTTPException(status_code=403, detail=err_detail)

    # 3. Call Gemini (If Gemini fails, usage & generations are not modified)
    generated_text = generate_refusal(
        situation=req_body.situation,
        recipient=req_body.recipient,
        tone=req_body.tone,
        relationship=req_body.relationship,
        medium=req_body.medium,
        words=req_body.words,
        goal=req_body.goal,
        language=req_body.language,
        mode=req_body.mode
    )

    # 4. Save successful generation to public.generations (Non-blocking if RLS restricts table writes)
    generation_id = str(uuid4())
    generation_record = {
        "id": generation_id,
        "user_id": str(user_id),
        "situation": req_body.situation,
        "recipient": req_body.recipient,
        "tone": req_body.tone,
        "response": generated_text
    }

    try:
        supabase_request(
            "generations",
            method="POST",
            data=generation_record,
            prefer="return=representation"
        )
    except Exception:
        try:
            gen_data_no_id = {
                "user_id": str(user_id),
                "situation": req_body.situation,
                "recipient": req_body.recipient,
                "tone": req_body.tone,
                "response": generated_text
            }
            inserted_gen = supabase_request(
                "generations",
                method="POST",
                data=gen_data_no_id,
                prefer="return=representation"
            )
            if inserted_gen and len(inserted_gen) > 0 and "id" in inserted_gen[0]:
                generation_id = str(inserted_gen[0]["id"])
        except Exception as e:
            print(f"Warning: Failed to save to generations history table (RLS/Auth): {str(e)}")

    free_remaining = max(0, max_limit - current_count)

    return {
        "response": generated_text,
        "generation_id": generation_id,
        "generation_count": current_count,
        "max_limit": max_limit,
        "free_generations_remaining": free_remaining,
        "is_authenticated": is_auth
    }

