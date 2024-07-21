document.getElementById('loginButton').addEventListener('click', () => {
    const token = document.getElementById('tokenInput').value;

    fetch('/api/token', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ token })
    })
    .then(response => response.text())
    .then(data => {
        console.log(data);
        if (data === 'Bot logged in successfully') {
            alert('Bot logged in successfully');
        } else {
            alert('Invalid token');
        }
    });
});

document.getElementById('sendButton').addEventListener('click', () => {
    const message = document.getElementById('messageInput').value;
    if (botClient) {
        botClient.channels.cache.get('YOUR_CHANNEL_ID').send(message);
        document.getElementById('messageInput').value = '';
    } else {
        alert('Bot is not logged in');
    }
});
