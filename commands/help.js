module.exports = {
    name: 'help',
    description: 'Mostra la lista dei comandi disponibili',
    execute(message, commands) {
        const list = Array.from(commands.values()).map(cmd => `**${cmd.name}**: ${cmd.description}`).join('\n');
        message.reply({ content: `Comandi disponibili:\n${list}` });
    }
};
