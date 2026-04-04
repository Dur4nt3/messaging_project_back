export default class BotManager {
    private bots = new Map();

    register(botUsername: string, botInstance: any) {
        this.bots.set(botUsername, botInstance);
    }

    get(botUsername: string) {
        return this.bots.get(botUsername);
    }
}
