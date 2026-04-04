import { prisma } from '../../lib/prisma';

import initializeBot from './InitializeBot';

async function main() {
    console.log('Seeding bot...');
    await initializeBot();
}

main()
    .then(async () => {
        await prisma.$disconnect();
    })
    .catch(async (e) => {
        console.error(e);
        await prisma.$disconnect();
        process.exit(1);
    });
