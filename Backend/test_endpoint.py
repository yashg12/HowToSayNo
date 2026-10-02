import os, sys, json, urllib.request

log_file = open("test.log", "w")
log_file.write("Starting test...\n")
log_file.flush()

from dotenv import load_dotenv
load_dotenv()

key = os.getenv("GEMINI_API_KEY")
log_file.write(f"Key loaded: {key[:10]}...\n")
log_file.flush()

from app.gemini_service import generate_refusal

try:
    log_file.write("Calling Gemini API...\n")
    log_file.flush()
    res = generate_refusal(
        situation="My senior asked me to complete the file today, but I already have a dinner planned with my family.",
        recipient="Senior / Manager",
        tone="Polite and diplomatic"
    )
    log_file.write("--- RESULT ---\n" + str(res) + "\n")
except Exception as e:
    log_file.write("--- ERROR ---\n" + str(e) + "\n")

log_file.flush()
log_file.close()
print("Done writing test.log")
