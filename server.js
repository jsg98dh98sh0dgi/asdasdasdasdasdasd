// server.js
const express = require('express');
const { Client, GatewayIntentBits } = require('discord.js');
const path = require('path');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

let botClient = null;

app.post('/api/token', (req, res) => {
    const token = req.body.token;

    if (botClient) {
        botClient.destroy();
    }

    botClient = new Client({
        intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent],
    });

    botClient.once('ready', () => {
        console.log('Bot is online');
    });

    botClient.on('messageCreate', message => {
        if (!message.author.bot) {
            console.log(`Message from ${message.author.username}: ${message.content}`);
        }
    });

    botClient.login(token)
        .then(() => res.status(200).send('Bot logged in successfully'))
        .catch(err => res.status(400).send('Invalid token'));
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
