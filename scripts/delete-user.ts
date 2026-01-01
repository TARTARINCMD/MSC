import 'dotenv/config';
import { prisma } from '../lib/prisma';

async function main() {
    const email = 'sidukovruslan20022@gmail.com';
    try {
        const user = await prisma.user.delete({
            where: { email },
        });
        console.log(`Successfully deleted user: ${user.email}`);
    } catch (error: any) {
        if (error.code === 'P2025') {
            console.log(`User with email ${email} not found.`);
        } else {
            console.error('Error deleting user:', error);
        }
    }
}

main();
