interface BotCommand {
    aliases: string[];
    execute: Function;
}

export default BotCommand;
