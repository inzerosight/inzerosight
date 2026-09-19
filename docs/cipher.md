# Encryption

### PLAIN
No encryption. Encodes text directly.

### CHACHA20
Stream cipher with a 256-bit key and a 48-bit random nonce prepended to the output. **Recommended for all encrypted messages.**

- **Payload size:** Operates directly on UTF-8 bytes rather than 32-bit integers, keeping the zero-width payload around **~1.5×** the size of plain text (compared to ~4.8× for Speck).
- **Key derivation:** Derives keys using memory-hard Argon2id (64 MB RAM, 3 iterations), significantly increasing the cost of offline GPU dictionary and brute-force attacks against human passwords.
- **Nonce space:** The 48-bit nonce provides a safe threshold of roughly 2.38 million encryptions under the same password before reaching a 1% collision risk.

### SPECK48/96 CTR
Legacy stream cipher mode with a 24-bit random nonce prepended to the output. Retained for backwards compatibility with existing messages.

- **Payload size:** Encrypts each character into a 32-bit integer, causing output to expand roughly **4.5× to 5×** larger than unencrypted text.
- **Key derivation:** Uses standard BLAKE2b without a memory-hard KDF like Argon2id, offering minimal resistance to offline dictionary attacks if weak passwords are used.
- **Nonce space constraint:** Reaches birthday-paradox collision risk quickly (~4,096 encryptions). **Rotate your password after roughly every 100 encryptions** to avoid nonce reuse risk.

### SPECK32/64 ECB (insecure)
Legacy block cipher in ECB mode. Each character is encrypted independently — identical plaintext characters produce identical ciphertext. 

- **Not secure under real threat models** since patterns in the plaintext leak through.
- Retained strictly for legacy decoding and testing.

---

## Comparison

| Mode | Relative Size | Key Size | Key Derivation | Notes |
| :--- | :---: | :---: | :---: | :--- |
| **PLAIN** | $1.0\times$ | — | — | Direct encoding |
| **CHACHA20** | **$\sim 1.5\times$** | **256-bit** | **Argon2id (64 MB)** | **Recommended default** |
| **SPECK48/96 CTR** | $\sim 4.8\times$ | 96-bit | BLAKE2b (fast) | 24-bit nonce; legacy |
| **SPECK32/64 ECB** | $\sim 4.8\times$ | 64-bit | BLAKE2b (fast) | Insecure; legacy |

---
Cipher test. Decrypt this sentence with the password 123‍​­‌‍‌‍‍‍‏‏‎​‏­‎‏​‌‏‏⁠­­⁠​‎­⁠‎‍‍‌‎⁠‏​‎​​⁠⁠⁠‍‏‌­​­‎‎‏‏‎​‍‏‎‌‏⁠­​‍​‎­‏­‏​­‌‏​­⁠‎⁠­‎‎‏‏⁠⁠‌​‏​­​­‍‏‏‍​‎‌‏⁠‎⁠​‏​­​​‎‎‎‌‏‍‎‎‎⁠­­­⁠⁠­‍‌‏‍​‏‎‎⁠‏‏‏​‏⁠‌​⁠‍­‎‏‍⁠‏‎⁠​‌‎‍‍⁠‎‍‎⁠‏‍‎­‌‏­⁠​​­­⁠⁠‎‍‎‎‌­‍‍⁠‍⁠‏‎​‎‌‏‍⁠⁠⁠‎‍‎‍‏.
