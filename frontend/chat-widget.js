const chatBox = document.getElementById('chat-box');
const userInput = document.getElementById('user-input');
const sendBtn = document.getElementById('send-btn');

async function sendMessage() {
    const message = userInput.value.trim();
    if (!message) return;

    // Append user message
    appendMessage('You', message, 'user-msg');
    userInput.value = '';

    // Typing indicator or placeholder
    const loadingId = appendMessage('Txchya', '...', 'txchya-msg');

    try {
        const response = await fetch('/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                message,
                site: window.location.hostname + ' (Standalone Terminal)'
            })
        });

        if (!response.ok) throw new Error('Network response was not ok');

        const data = await response.json();
        if (data.reply) {
            updateMessage(loadingId, 'Txchya', data.reply);
        } else {
            updateMessage(loadingId, 'Txchya', data.error || 'Error: Neural link failure.');
        }
    } catch (err) {
        console.error(err);
        updateMessage(loadingId, 'Txchya', 'Error: Connection lost. Systems failing.');
    }
}

function appendMessage(sender, text, className) {
    const id = 'msg-' + Date.now();
    const div = document.createElement('div');
    div.id = id;
    div.className = className;
    div.innerHTML = `<b>${sender}:</b> ${text}`;
    chatBox.appendChild(div);
    chatBox.scrollTop = chatBox.scrollHeight;
    return id;
}

function updateMessage(id, sender, text) {
    const div = document.getElementById(id);
    if (div) {
        div.innerHTML = `<b>${sender}:</b> ${text}`;
        chatBox.scrollTop = chatBox.scrollHeight;
    }
}

sendBtn.addEventListener('click', sendMessage);
userInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') sendMessage();
});
