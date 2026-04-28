import initializeBot from '../../../db/seeds/InitializeBot';

export default async function seedAll() {
    await initializeBot();

    console.log('Test database seeding complete!');
}
