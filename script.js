document.addEventListener('DOMContentLoaded', () => {
    // --- LOGIN LOGIC ---
    const loginBtn = document.getElementById("login-btn");
    if(loginBtn) {
        // Only run this if we are on the Login Screen
        const loginScreen = document.getElementById("login-screen");
        const usernameInput = document.getElementById("username");
        const passwordInput = document.getElementById("password");
        const loginMsg = document.getElementById("login-msg");
        const loginBox = document.getElementById("login-box");
        const pricingBox = document.getElementById("pricing-box");

        document.getElementById("show-pricing-btn").onclick = () => { loginBox.classList.add("hidden"); pricingBox.classList.remove("hidden"); };
        document.getElementById("back-to-login-btn").onclick = () => { pricingBox.classList.add("hidden"); loginBox.classList.remove("hidden"); };

        loginBtn.onclick = async () => {
            const username = usernameInput.value;
            const password = passwordInput.value;
            loginBtn.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i> AUTHENTICATING...';
            
            try {
                const res = await fetch('/api/login', { 
                    method: 'POST', 
                    headers: { 'Content-Type': 'application/json' }, 
                    body: JSON.stringify({ username, password }) 
                });
                const data = await res.json();
                
                if (data.status === 'success') {
                    // 👇 SUCCESS: RELOAD PAGE TO GET MAIN UI
                    window.location.reload();
                } else {
                    loginMsg.innerText = "ACCESS DENIED"; 
                    loginBtn.innerText = "INITIALIZE LINK";
                }
            } catch (e) { 
                loginMsg.innerText = "SERVER ERROR"; 
                loginBtn.innerText = "RETRY"; 
            }
        };
    }

    // --- LOGOUT LOGIC ---
    window.logoutSystem = async function() {
        await fetch('/api/logout', { method: 'POST' });
        window.location.reload();
    }

    // --- CHAT LOGIC (Only runs if Main UI exists) ---
    const sendBtn = document.getElementById("send-btn");
    if(sendBtn) {
        const input = document.getElementById("user-input");
        const chatDisplay = document.getElementById("chat-display");
        const typingIndicator = document.getElementById("typing-indicator");
        
        document.getElementById("session-id").innerText = "CORE-" + Math.floor(Math.random()*0xFFFFFF).toString(16).toUpperCase();

        sendBtn.onclick = () => sendMessage();
        input.onkeydown = (e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } };

        async function sendMessage(customMsg = null) {
            const message = customMsg || input.value.trim();
            if (!message) return;

            if(!customMsg) { addMessage(message, "user"); input.value = ""; } 
            else { addMessage(`[CMD]: ${message}`, "user"); }
            
            typingIndicator.style.display = "flex";
            
            try {
                const res = await fetch("/api/chat", { 
                    method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ message }) 
                });
                const data = await res.json();
                typingIndicator.style.display = "none";
                
                if (data.status === 'success') { addMessage(data.response, "bot"); } 
                else { addMessage(data.response, "bot"); }
            } catch (error) { 
                typingIndicator.style.display = "none"; addMessage("❌ Connection Error.", "bot"); 
            }
        }

        function addMessage(text, sender) {
            const msgDiv = document.createElement("div");
            msgDiv.className = `message ${sender}-message`;
            let contentHtml = typeof marked !== 'undefined' ? marked.parse(text) : text;
            msgDiv.innerHTML = `<div class="avatar"><i class="fa-solid ${sender==="bot"?"fa-robot":"fa-user"}"></i></div>
                                <div class="msg-body"><div class="sender">${sender==="bot"?"SYNAPSE CORE":"YOU"}</div><div class="text">${contentHtml}</div></div>`;
            chatDisplay.appendChild(msgDiv);
            chatDisplay.scrollTop = chatDisplay.scrollHeight;
            
            if(sender === 'bot') {
                msgDiv.querySelectorAll('pre').forEach(pre => {
                    const code = pre.querySelector('code').innerText;
                    const lang = pre.querySelector('code').className; 
                    const actionDiv = document.createElement('div');
                    actionDiv.className = 'code-actions';
                    
                    const copyBtn = document.createElement('button');
                    copyBtn.className = 'action-btn';
                    copyBtn.innerHTML = '<i class="fa-solid fa-copy"></i> Copy';
                    copyBtn.onclick = () => navigator.clipboard.writeText(code);
                    actionDiv.appendChild(copyBtn);
                    
                    if(lang.includes('html')) {
                       const runBtn = document.createElement('button');
                       runBtn.className = 'action-btn';
                       runBtn.innerHTML = '<i class="fa-solid fa-play"></i> Run';
                       runBtn.onclick = () => openPreview(code);
                       actionDiv.appendChild(runBtn);
                    }
                    pre.appendChild(actionDiv);
                    hljs.highlightElement(pre.querySelector('code'));
                });
            }
        }
    }
});

// GLOBAL FUNCTIONS
function switchView(viewId) {
    document.querySelectorAll('.view-section').forEach(el => el.classList.add('hidden'));
    document.getElementById('view-' + viewId).classList.remove('hidden');
    document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
    event.currentTarget.classList.add('active');
}
function openPreview(code) {
    const modal = document.getElementById("code-preview-modal");
    const frame = document.getElementById("preview-frame");
    modal.classList.remove("hidden");
    const doc = frame.contentWindow.document; doc.open(); doc.write(code); doc.close();
}
function closePreview() { document.getElementById("code-preview-modal").classList.add("hidden"); }
function clearChat() { document.getElementById("chat-display").innerHTML = ''; }
// Mock File Loader
window.loadFile = function(name) { sendMessage("Load module: " + name); }