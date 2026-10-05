from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)
res = client.post("/api/usage/11111111-1111-1111-1111-111111111111/increment")
print("STATUS:", res.status_code)
print("JSON:", res.json())
