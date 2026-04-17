import 'dotenv/config';
import { prisma } from '../lib/prisma';

// Usernames to delete (matched against the `name` field)
const USERNAMES_TO_DELETE = ['Heil 14', 'Hitler 88'];

async function main() {
    for (const name of USERNAMES_TO_DELETE) {
        try {
            const user = await prisma.user.findFirst({ where: { name } });
            if (!user) {
                console.log(`User not found: "${name}"`);
                continue;
            }

            await prisma.user.delete({ where: { id: user.id } });
            console.log(`Deleted user: "${name}" (id: ${user.id}, email: ${user.email})`);
            console.log(`  → Also delete from Supabase Auth: id ${user.id}`);
        } catch (error: any) {
            console.error(`Error deleting "${name}":`, error.message);
        }
    }

    await prisma.$disconnect();
}

main();
