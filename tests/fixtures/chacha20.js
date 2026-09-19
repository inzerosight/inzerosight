// Frozen mode-3 fixture; ciphertext independently generated with OpenSSL ChaCha20.
// Argon2id v19, m=65536, t=3, p=1; salt/IV = 000000000000000102fdfeff.
// Derived key: 7a10361d905b0c0e2af80d3d3da5fae0f39675a1a1ae80c0d6bd4140ee85286e.
export const password = 'fixture password 🔑';
export const plaintext = '\ufeffHello, 世界 🌍\0\n';
export const payload = [0, 1, 2, 253, 254, 255,
    ...Buffer.from('70d7e974d8cbeee71de7f43cca7c5bfa007653826cd4ad', 'hex')];
