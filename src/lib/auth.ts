const bcrypt = require("bcrypt");

export async function hashPassword(password: string) {
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    return hashedPassword;
}

export async function comparePassword(password: string, hashedPassword: string) {
    const match = await bcrypt.compare(password, hashedPassword);
    return match;
}