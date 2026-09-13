# Encryption

### PLAIN
No encryption. Encodes text directly.

### SPECK32/64 ECB
Block cipher in ECB mode. Each character is encrypted independently — identical plaintext characters produce identical ciphertext. Useful when you want varied-looking output from the same input, but **not secure under real threat models** since patterns in the plaintext leak through.

### SPECK48/96 CTR
Stream cipher mode with a random 24-bit nonce prepended to the output. Identical plaintexts produce different ciphertexts each time. Significantly more secure than ECB. **Rotate your password after roughly every 100 encryptions** to avoid nonce reuse risk within the 24-bit space.
