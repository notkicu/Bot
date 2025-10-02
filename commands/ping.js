module.exports = {
    name: 'ping',
    description: 'REplices with Pong and latency',
    async execute(message) {
        const sent = await message.reply('Pinging...');
        const latency = sent.createdTimestamp - message.createdTimestamp;
        sent.edit(`Pong! Latency: ${latency}ms`);
    }
};
