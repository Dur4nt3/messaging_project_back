import { prisma } from '../../lib/prisma';

export default async function truncateAllTables() {
    await prisma.$executeRaw`
        TRUNCATE TABLE
            "Chat",
            "ChatParticipant",
            "Friendship",
            "Message",
            "TokenBlacklist",
            "User"
        RESTART IDENTITY CASCADE
    `;

    console.log('All tables truncated successfully.');
}
