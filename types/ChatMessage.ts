import { MessageGetPayload } from '../generated/prisma/models';

type ChatMessage = MessageGetPayload<{
    include: {
        sender: {
            select: {
                username: true;
                name: true;
            };
        };
    };
}>;

export default ChatMessage;
