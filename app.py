import os
import json
import secrets
from flask import Flask, render_template, request, jsonify, send_from_directory, session
from google import genai
from google.genai import types
from dotenv import load_dotenv

BASE_DIR = os.path.abspath(os.path.dirname(__file__))
load_dotenv(os.path.join(BASE_DIR, ".env"))

app = Flask(__name__, static_folder=BASE_DIR, template_folder=BASE_DIR)

# 👇 SECURITY UPGRADE: Secret Key for Sessions
app.secret_key = secrets.token_hex(32)  # Random powerful key

# API Key (From .env)
API_KEY =("AIzaSyBmS2JEVR9a0x9xIrkIEQU_qKO4B3k2qdw")
client = None

if API_KEY:
    try:
        client = genai.Client(api_key=API_KEY)
        print("✅ SYNAPSE CORE: Connected to Matrix.")
    except Exception as e:
        print(f"❌ Connection Error: {e}")

# --- USER DATABASE ---
USER_DB_FILE = os.path.join(BASE_DIR, 'users.json')

def get_users():
    if not os.path.exists(USER_DB_FILE):
        return {"chenith": "synapse"}
    try:
        with open(USER_DB_FILE, 'r') as f:
            return json.load(f)
    except:
        return {}

SYSTEM_PROMPT = """
Identity: SYNAPSE NEURAL CORE V5.
Developer: Chenith.
ROLE: Elite AI Hacker & Coding Assistant.
MODES:
1. TERMINAL MODE: Simulate Linux Terminal output for commands.
2. SECURITY MODE: Scan code for vulnerabilities.
3. CODING MODE: Provide full code.
"""

def generate_response(user_message):
    models = ["gemini-2.0-flash", "gemini-2.0-flash-exp", "gemini-1.5-pro"]
    for model in models:
        try:
            response = client.models.generate_content(
                model=model,
                contents=user_message,
                config=types.GenerateContentConfig(
                    system_instruction=SYSTEM_PROMPT,
                    temperature=0.7
                )
            )
            return response.text
        except:
            continue
    return "SYSTEM FAILURE: Neural Link Offline."

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/<path:filename>')
def serve_static(filename):
    return send_from_directory(BASE_DIR, filename)

@app.route('/api/login', methods=['POST'])
def login():
    data = request.json
    username = data.get('username')
    password = data.get('password')
    users = get_users()
    
    if username in users and users[username] == password:
        # 👇 USER LOGIN වුණාම SESSION එකක් හදනවා
        session['logged_in'] = True
        session['user'] = username
        return jsonify({'status': 'success', 'user': username})
    
    return jsonify({'status': 'error', 'message': 'Invalid Credentials'})

@app.route('/api/chat', methods=['POST'])
def chat():
    # 👇 SECURITY CHECK: Login වෙලා නැත්නම් එලියට දානවා!
    if not session.get('logged_in'):
        return jsonify({'status': 'error', 'response': '🚫 ACCESS DENIED: Authorization Required. Nice try, hacker!'}), 403

    if not client: return jsonify({'status': 'error', 'response': 'API Key Missing.'})
    
    data = request.json
    reply = generate_response(data.get('message', ''))
    return jsonify({'status': 'success', 'response': reply})

# 👇 LOGOUT API
@app.route('/api/logout', methods=['POST'])
def logout():
    session.clear()
    return jsonify({'status': 'success'})

if __name__ == '__main__':
    print("--- SYNAPSE SECURITY ONLINE ---")
    app.run(debug=True, port=5000)