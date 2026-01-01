const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function resetPassword(email, newPassword) {
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    try {
        const user = await prisma.user.update({
            where: { email: email },
            data: { password: hashedPassword }
        });
        console.log(`Password for ${email} has been reset to: ${newPassword}`);
    } catch (e) {
        console.log("Error updating user:", e.message);
    } finally {
        await prisma.$disconnect();
    }
}

// Usage: node reset-password.js <email> <new_password>
const args = process.argv.slice(2);
if (args.length < 2) {
    console.log("Usage: node reset-password.js <email> <new_password>");
} else {
    resetPassword(args[0], args[1]);
}
