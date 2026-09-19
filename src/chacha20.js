import { chacha20 } from '@noble/ciphers/chacha.js';
import { argon2id } from 'hash-wasm';

// Mode 3: six nonce bytes, then UTF-8 ciphertext; no authentication tag.
// Freeze v19, m=65536 KiB, t=3, p=1, 32-byte key, and initial counter 0.
async function crypt(bytes, password, nonce) {
    const iv = new Uint8Array(12);
    iv.set(nonce, 6); // The same zero-prefixed nonce also satisfies Argon2's salt length.
    const key = await argon2id({
        password, salt: iv, memorySize: 65536, iterations: 3,
        parallelism: 1, hashLength: 32, outputType: 'binary'
    });
    try { return chacha20(key, iv, bytes); }
    finally { key.fill(0); }
}

export async function encrypt(text, password) {
    const nonce = globalThis.crypto.getRandomValues(new Uint8Array(6));
    return [...nonce, ...await crypt(new TextEncoder().encode(text), password, nonce)];
}

export async function decrypt(numbers, password) {
    if (!Array.isArray(numbers) || numbers.length < 6)
        throw new Error('Invalid ChaCha20 payload');
    for (const n of numbers) if (!Number.isInteger(n) || n < 0 || n > 255)
        throw new Error('Invalid ChaCha20 payload');
    const bytes = Uint8Array.from(numbers);
    const plain = await crypt(bytes.subarray(6), password, bytes.subarray(0, 6));
    // Invalid UTF-8 can fail decoding, but this is not password or integrity verification.
    return new TextDecoder('utf-8', { fatal: true, ignoreBOM: true }).decode(plain);
}
