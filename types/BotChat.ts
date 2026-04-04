import { ChatGetPayload } from '../generated/prisma/models';

type BotChat = ChatGetPayload<{
    include: {
        chatParticipants: {
            where: {
                user: {
                    type: 'BOT';
                };
            };
            include: {
                user: {
                    select: {
                        userId: true;
                        username: true;
                        name: true;
                        type: true;
                    };
                };
            };
        };
    };
}>;

export default BotChat;
