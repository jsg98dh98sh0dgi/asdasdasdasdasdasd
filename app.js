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
                alert('Bot logged in successfully');
                displayGuilds(data.guilds);
            } else {
                alert('Invalid token');
            }
        });
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
                    alert('Message sent');
                    document.getElementById('messageInput').value = '';
                } else {
                    alert('Error sending message');
                }
            });
    } else {
        alert('Select a channel first');
    }
});
