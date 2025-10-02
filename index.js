require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { Client, GatewayIntentBits, Collection } = require('discord.js');
const winston = require('winston');

// Logger setup
const logger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.printf(({ timestamp, level, message }) => `${timestamp} [${level.toUpperCase()}] ${message}`)
    ),
    transports: [new winston.transports.Console()]
});

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] });
client.commands = new Collection();

// Load commands
const commandsPath = path.join(__dirname, 'commands');
if (fs.existsSync(commandsPath)) {
    const commandFiles = fs.readdirSync(commandsPath).filter(f => f.endsWith('.js'));
    for (const file of commandFiles) {
        try {
            const cmd = require(path.join(commandsPath, file));
            if (cmd && cmd.name) client.commands.set(cmd.name, cmd);
        } catch (err) {
            logger.warn(`Failed to load command ${file}: ${err.message}`);
        }
    }
}

client.once('ready', () => {
    logger.info(`Logged in as ${client.user.tag}`);
});

client.on('messageCreate', async (message) => {
    try {
        if (message.author.bot) return;
        if (!message.content.startsWith('!')) return;

        const args = message.content.slice(1).trim().split(/\s+/);
        const commandName = args.shift().toLowerCase();

        const command = client.commands.get(commandName);
        if (!command) return;

        await command.execute(message, client.commands);
    } catch (err) {
        logger.error(`Error handling message: ${err.stack || err}`);
        try { message.reply('Verified an error while executing the command.'); } catch(e) { /* ignore */ }
    }
});

process.on('uncaughtException', (err) => {
    logger.error(`Uncaught Exception: ${err.stack || err}`);
    process.exit(1);
});

process.on('unhandledRejection', (reason) => {
    logger.error(`Unhandled Rejection: ${reason}`);
});

const token = process.env.BOT_TOKEN;
if (!token) {
    logger.error('No BOT_TOKEN found in environment. Exiting.');
    process.exit(1);
}

client.login(token).catch(err => {
    logger.error(`Failed to login: ${err.message}`);
    process.exit(1);
});
