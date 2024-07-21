// server.js
const express = require('express');
const { Client, GatewayIntentBits } = require('discord.js');
const bodyParser = require('body-parser');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

app.use(express.static('public'));
app.use(bodyParser.json());

let botClient = null;

app.post('/api/token', async (req, res) => {
    const token = req.body.token;

    if (botClient) {
        botClient.destroy();
    }

    botClient = new Client({
        intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent],
    });

    botClient.once('ready', async () => {
        console.log('Bot is online');
        const guilds = await botClient.guilds.fetch();
        const guildData = [];

        for (const guild of guilds.values()) {
            const channels = await guild.channels.fetch();
            guildData.push({
                id: guild.id,
                name: guild.name,
                channels: channels.map(channel => ({
                    id: channel.id,
                    name: channel.name,
                    type: channel.type
                })).filter(channel => channel.type === 0) // Filter for text channels only
            });
        }

        res.status(200).json({ message: 'Bot logged in successfully', guilds: guildData });
    });

    botClient.login(token)
        .catch(err => res.status(400).send('Invalid token'));
});

app.post('/api/message', (req, res) => {
    const { channelId, message } = req.body;

    if (!botClient) {
        return res.status(400).send('Bot is not logged in');
    }

    const channel = botClient.channels.cache.get(channelId);

    if (!channel) {
        return res.status(404).send('Channel not found');
    }

    channel.send(message)
        .then(() => res.status(200).send('Message sent'))
        .catch(err => res.status(500).send('Error sending message'));
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
