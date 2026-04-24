import { getLatestActiveChats } from '../../../db/queries/chat/chatQueries';
import { getUnreadCount } from '../../../db/queries/message/messageQueries';
import logError from '../../../db/utilities/logError';

export default async function getDashboardViewChatData(userId: number) {
    try {
        const activeChats = await getLatestActiveChats(userId);
        if (activeChats === null) {
            return null;
        }

        const dashboardViewData = await Promise.all(
            activeChats.map(async (chat) => {
                const { messages, chatParticipants, ...chatFields } = chat;

                const [lastMessage] = messages;
                const currentUser = chatParticipants.find(
                    (participant) => participant.user.userId === userId,
                );
                const recipient = chat.isGroup
                    ? 'GROUP CHAT NAME PLACEHOLDER'
                    : chatParticipants.find(
                          (participant) => participant.user.userId !== userId,
                      );

                if (currentUser === undefined || recipient === undefined) {
                    throw new Error('query error, unexpected values are null!');
                }

                const unreadCount = await getUnreadCount(
                    chat.chatId,
                    userId,
                    currentUser.lastReadAt,
                );

                return {
                    ...chatFields,
                    chatParticipant: recipient,
                    messages: {
                        lastContent: lastMessage?.content,
                        sent: !lastMessage
                            ? false
                            : lastMessage.senderId === userId,
                        unread: unreadCount,
                    },
                };
            }),
        );

        return dashboardViewData;
    } catch (error) {
        logError(
            'Error occurred when trying to generate the dashboard view chat data',
            error,
        );
        return null;
    }
}
