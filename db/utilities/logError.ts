export default function logError(errorDescription: string, error: any) {
    console.error('------------------Logged Error------------------\n');
    console.error(errorDescription, '\n');
    console.error(error, '\n');
    console.error('------------------Logged Error------------------\n');
}
