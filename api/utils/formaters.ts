import bcrypt from 'bcrypt';

const PROCESS_MIN_DIGITS = 4;

export const formatCapitalized = (name: string) => {
    return name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
};

export const formatUsername = (name: string) => {
    return name.toLowerCase().trim().replace(/\s+/g, '.');
};

export const formatPassword = async (password: string) => {
    return await bcrypt.hash(password, 10);
};

export const formatProcessNum = (value: number | string, year?: number | string) => {
    const currentYear = String(year || new Date().getFullYear());
    const strValue = String(value).trim();

    if (strValue.startsWith(currentYear) && strValue.length > currentYear.length) {
        const seq = strValue.slice(currentYear.length);
        return `${currentYear}${seq.padStart(PROCESS_MIN_DIGITS, '0')}`;
    }

    const cleanNum = String(Number(strValue)).padStart(PROCESS_MIN_DIGITS, '0');
    return `${currentYear}${cleanNum}`;
};