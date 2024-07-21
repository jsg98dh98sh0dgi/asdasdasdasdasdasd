document.getElementById('loginButton').addEventListener('click', () => {
    const token = document.getElementById('tokenInput').value;

    fetch('/api/token', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token }),
    })
    .then(response => response.json())
    .then(data => {
        if (data.message === 'Bot logged in successfully') {
            displayGuilds(data.guilds);
        } else {
            alert('Invalid token');
        }
    })
    .catch(error => console.error('Error:', error));
});

function displayGuilds(guilds) {
    const guildContainer = document.getElementById('guilds');
    guildContainer.innerHTML = '';
    guilds.forEach(guild => {
        const guildElement = document.createElement('div');
        guildElement.textContent = guild.name;
        guildElement.addEventListener('click', () => displayChannels(guild.channels));
        guildContainer.appendChild(guildElement);
    });
}

function displayChannels(channels) {
    const channelContainer = document.getElementById('channels');
    channelContainer.innerHTML = '';
    channels.forEach(channel => {
        const channelElement = document.createElement('div');
        channelElement.textContent = channel.name;
        channelElement.addEventListener('click', () => selectChannel(channel.id));
        channelContainer.appendChild(channelElement);
    });
}

let selectedChannelId = null;

function selectChannel(channelId) {
    selectedChannelId = channelId;
    document.getElementById('messages').innerHTML = '';
    fetchMessages(channelId);
}

function fetchMessages(channelId) {
    fetch('/api/messages', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ channelId }),
    })
    .then(response => response.json())
    .then(messages => {
        displayMessages(messages);
    })
    .catch(error => console.error('Error:', error));
}

function displayMessages(messages) {
    const messageContainer = document.getElementById('messages');
    messageContainer.innerHTML = '';
    messages.forEach(message => {
        const messageElement = document.createElement('div');
        messageElement.textContent = `${message.author}: ${message.content}`;
        messageContainer.appendChild(messageElement);
    });
}

document.getElementById('sendButton').addEventListener('click', () => {
    const message = document.getElementById('messageInput').value;
    if (selectedChannelId) {
        fetch('/api/message', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ channelId: selectedChannelId, message }),
        })
        .then(response => response.text())
        .then(data => {
            if (data === 'Message sent') {
                document.getElementById('messageInput').value = '';
                fetchMessages(selectedChannelId);
            } else {
                alert('Error sending message');
            }
        })
        .catch(error => console.error('Error:', error));
    } else {
        alert('Select a channel first');
    }
});

document.getElementById('reactButton').addEventListener('click', () => {
    const emoji = document.getElementById('emojiInput').value;
    const messageId = prompt('Enter the message ID to react to:');
    if (messageId && emoji) {
        fetch('/api/react', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ messageId, emoji }),
        })
        .then(response => response.text())
        .then(data => {
            if (data === 'Reaction added') {
                alert('Reaction added');
            } else {
                alert('Error adding reaction');
            }
        })
        .catch(error => console.error('Error:', error));
    } else {
        alert('Enter a valid message ID and emoji');
    }
});
