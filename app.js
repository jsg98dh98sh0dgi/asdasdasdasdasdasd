const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const { Client, GatewayIntentBits, ChannelType } = require('discord.js');
const { joinVoiceChannel, createAudioPlayer, createAudioResource, AudioPlayerStatus, VoiceConnectionStatus } = require('@discordjs/voice');
const { PassThrough } = require('stream');
const mic = require('mic');
const app = express();
const port = 3000;

const bot = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.GuildVoiceStates] });

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: true }));

let botLoggedIn = false;
let micInstance;
let micInputStream;
let audioStream;

app.get('/', (req, res) => {
  res.render('index', { botLoggedIn, servers: bot.guilds.cache });
});

app.post('/login', (req, res) => {
  const token = req.body.token;

  bot.login(token).then(() => {
    botLoggedIn = true;
    res.redirect('/');
  }).catch(err => {
    res.send('Failed to log in: ' + err.message);
  });
});

app.get('/server/:id', (req, res) => {
  const guild = bot.guilds.cache.get(req.params.id);
  if (guild) {
    const textChannels = guild.channels.cache.filter(channel => channel.type === ChannelType.GuildText);
    const voiceChannels = guild.channels.cache.filter(channel => channel.type === ChannelType.GuildVoice);
    res.render('server', { guild, textChannels, voiceChannels });
  } else {
    res.send('Server not found');
  }
});

app.post('/message', (req, res) => {
  const { channelId, message } = req.body;
  const channel = bot.channels.cache.get(channelId);
  if (channel) {
    channel.send(message).then(() => {
      res.redirect(`/server/${channel.guild.id}#${channelId}`);
    }).catch(err => {
      res.send('Failed to send message: ' + err.message);
    });
  } else {
    res.send('Channel not found');
  }
});

app.post('/join-voice', (req, res) => {
  const { channelId } = req.body;
  const channel = bot.channels.cache.get(channelId);
  if (channel && channel.type === ChannelType.GuildVoice) {
    const connection = joinVoiceChannel({
      channelId: channel.id,
      guildId: channel.guild.id,
      adapterCreator: channel.guild.voiceAdapterCreator,
    });

    connection.on(VoiceConnectionStatus.Ready, () => {
      console.log('The bot has connected to the channel!');

      micInstance = mic({
        rate: '16000',
        channels: '1',
        debug: true,
        exitOnSilence: 6
      });

      micInputStream = micInstance.getAudioStream();
      audioStream = new PassThrough();
      micInputStream.pipe(audioStream);

      const player = createAudioPlayer();
      const resource = createAudioResource(audioStream, {
        inputType: 'ogg/opus',
      });

      player.play(resource);
      connection.subscribe(player);

      micInstance.start();

      player.on(AudioPlayerStatus.Idle, () => {
        micInstance.stop();
        connection.destroy();
      });
    });

    res.redirect(`/server/${channel.guild.id}#${channelId}`);
  } else {
    res.send('Voice channel not found');
  }
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
