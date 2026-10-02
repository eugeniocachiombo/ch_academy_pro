import CryptoJS from 'crypto-js';
const CRYPTO_SECRET_KEY = String(import.meta.env.VITE_CRYPTO_SECRET_KEY || 'secret')

class CryptoService {
    public encryptId(text: string) {
        const encryptedText = CryptoJS.AES.encrypt(String(text), CRYPTO_SECRET_KEY).toString();
        return encodeURIComponent(encryptedText);
    }
    public decryptId(text: string): number {
        const safeText = decodeURIComponent(text);
        const bytes = CryptoJS.AES.decrypt(safeText, CRYPTO_SECRET_KEY);
        const decryptedText = bytes.toString(CryptoJS.enc.Utf8);
        return Number(decryptedText) || 0;
    }
}

export default new CryptoService();