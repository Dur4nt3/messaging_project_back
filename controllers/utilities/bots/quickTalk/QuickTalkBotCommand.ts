import BotCommand from '../../../../types/BotCommand';

export default class QuickTalkCommand implements BotCommand {
    aliases: string[];
    execute: Function;

    
    constructor(aliases: string[], execute: Function) {
        this.aliases = aliases;
        this.execute = execute;
    }
}
