document.addEventListener('DOMContentLoaded', () => {
    const sendBtn = document.getElementById("send-btn");
    const input = document.getElementById("user-input");
    const chatDisplay = document.getElementById("chat-display");
    const typingIndicator = document.getElementById("typing-indicator");
    const sessionIdDisplay = document.getElementById("session-id");

    // Generate random Session ID
    sessionIdDisplay.innerText = "CORE-" + Math.floor(Math.random() * 9000 + 1000);

    // Auto-resize textarea
    input.addEventListener('input', function() {
        this.style.height = 'auto';
        this.style.height = (this.scrollHeight) + 'px';
        if(this.value === '') this.style.height = 'auto';
    });

    // Event Listeners
    sendBtn.addEventListener("click", sendMessage);
    input.addEventListener("keydown", (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });

    async function sendMessage() {
        const message = input.value.trim();
        if (!message) return;

        // User Message UI
        addMessage(message, "user");
        input.value = "";
        input.style.height = 'auto';

        // Show Loading
        typingIndicator.style.display = "flex";
        chatDisplay.scrollTop = chatDisplay.scrollHeight;

        try {
            const response = await fetch("/api/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ message })
            });

            const data = await response.json();
            
            // Hide Loading
            typingIndicator.style.display = "none";

            if (data.status === 'success') {
                addMessage(data.response, "bot");
            } else {
                addMessage("⚠️ CRITICAL ERROR: " + data.response, "bot");
            }

        } catch (error) {
            typingIndicator.style.display = "none";
            addMessage("❌ SERVER UNREACHABLE. Check Terminal Logs.", "bot");
        }
    }

    function addMessage(text, sender) {
        const msgDiv = document.createElement("div");
        msgDiv.className = `message ${sender}-message`;
        
        const avatarIcon = sender === "bot" ? "fa-robot" : "fa-user";
        const senderName = sender === "bot" ? "SYNAPSE CORE" : "YOU";

        // Markdown parsing
        const rawContent = sender === "bot" ? marked.parse(text) : text.replace(/\n/g, "<br>");

        msgDiv.innerHTML = `
            <div class="avatar"><i class="fa-solid ${avatarIcon}"></i></div>
            <div class="msg-body">
                <div class="sender">${senderName}</div>
                <div class="text">${rawContent}</div>
            </div>
        `;

        chatDisplay.appendChild(msgDiv);
        chatDisplay.scrollTop = chatDisplay.scrollHeight;

        // Apply Syntax Highlighting
        if (sender === "bot") {
            msgDiv.querySelectorAll('pre code').forEach((block) => {
                hljs.highlightElement(block);
            });
            logDebug(`Received ${text.length} bytes from Core.`);
        }
    }

    // Utility: Add log to debug console
    function logDebug(msg) {
        const consoleOutput = document.querySelector('.console-output');
        const log = document.createElement('div');
        log.className = 'log-line';
        log.innerText = ` > ${msg}`;
        consoleOutput.appendChild(log);
        consoleOutput.scrollTop = consoleOutput.scrollHeight;
    }
});

// Sidebar Tab Switching (Visual Only for now)
function switchTab(tab) {
    document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
    event.currentTarget.classList.add('active');
    console.log("Switched to tab:", tab);
}

function clearChat() {
    const display = document.getElementById("chat-display");
    display.innerHTML = '';
    // Restore init message
    display.innerHTML = `
        <div class="message bot-message">
            <div class="avatar"><i class="fa-solid fa-robot"></i></div>
            <div class="msg-body">
                <div class="sender">SYNAPSE CORE</div>
                <div class="text">Terminal Cleared. Ready for new input.</div>
            </div>
        </div>
    `;
}