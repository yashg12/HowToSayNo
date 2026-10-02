import os
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL", "https://cnaaipkltpqzqnadjjvz.supabase.co")
SUPABASE_KEY = os.getenv("SUPABASE_KEY", "sb_publishable_idvsAQaPQwUkM7GQVxdSCw_rS-PPrE-")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
