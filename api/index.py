# Vercel serverless function - imports the Flask app
from run_local_dashboard import app

# Vercel needs a handler
handler = app
