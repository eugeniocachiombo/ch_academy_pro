import bcrypt from 'bcrypt';

export const formatCapitalized = (name: string) => {
    return name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
};

export const formatUsername = (name: string) => {
    return name.toLowerCase().trim().replace(/\s+/g, '.');
}

export const formatPassword = async (password: string) => {
    return await bcrypt.hash(password, 10);
}