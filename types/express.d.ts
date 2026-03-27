import {
    Message,
    Friendship,
    ChatParticipant,
} from '../generated/prisma/client';

declare global {
    namespace Express {
        interface User {
            userId: number;
            username: string;
            name: string;
            password: string;
            sentFriendships: Friendship[];
            receivedFriendships: Friendship[];
            sentMessages: Message[];
            chatParticipant: ChatParticipant[];
        }
    }
}

export {};
