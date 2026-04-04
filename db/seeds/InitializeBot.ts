import { prisma } from '../../lib/prisma';

export default async function initializeBot() {
    try {
        await prisma.user.create({
            data: {
                type: 'BOT',
                username: 'quicktalk',
                name: 'Quick Talk',
            },
        });
        console.log('Bot seeded successfully!');
    } catch (error) {
        console.error(
            '------------------Initialization Error------------------',
        );
        console.error(error);
        console.error(
            '------------------Initialization Error------------------',
        );
    }
}
