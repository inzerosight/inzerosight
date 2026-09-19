import assert from 'node:assert/strict';
import { test } from 'node:test';
import zwus from 'zwus';
import * as chunked from '../src/chunked.js';
import { encrypt, decrypt } from '../src/chacha20.js';
import { password, plaintext, payload } from './fixtures/chacha20.js';

test('mode 3 decrypts the frozen fixture through every ZWUS base', async () => {
    for (const base of [3, 6, 7]) {
        const encoded = zwus.encodeNumberArray(payload, base);
        assert.equal(await decrypt(zwus.decodeToNumberArray(encoded, base), password), plaintext);
    }
});

test('mode 3 emits six nonce bytes and raw ChaCha20 ciphertext compatible with OpenSSL', async () => {
    const random = globalThis.crypto.getRandomValues;
    globalThis.crypto.getRandomValues = bytes => {
        assert.equal(bytes.length, 6);
        bytes.set(payload.slice(0, 6));
        return bytes;
    };
    try { assert.deepEqual(await encrypt(plaintext, password), payload); }
    finally { globalThis.crypto.getRandomValues = random; }
});

test('mode 3 generates fresh nonce bytes without adding padding or a tag', async () => {
    const output = await encrypt(plaintext, password);
    assert.equal(output.length, 6 + Buffer.byteLength(plaintext));
    assert.ok(output.every(n => Number.isInteger(n) && n >= 0 && n <= 255));
    assert.notDeepEqual((await encrypt(plaintext, password)).slice(0, 6), output.slice(0, 6));
});

test('mode 3 preserves long UTF-8 messages across encoding chunks', async () => {
    const message = 'a'.repeat(65536) + plaintext;
    const output = await encrypt(message, password);
    const encoded = chunked.encodeNumberArray(output, 7);
    assert.equal(encoded, zwus.encodeNumberArray(output, 7));
    assert.equal(await decrypt(chunked.decodeToNumberArray(encoded, 7), password), message);
});

test('mode 3 round trips an empty plaintext with only the nonce in its payload', async () => {
    const output = await encrypt('', password);
    assert.equal(output.length, 6);
    assert.equal(await decrypt(output, password), '');
});

test('mode 3 rejects truncated nonces and non-byte numbers before key derivation', async () => {
    for (const input of [null, [], [0, 1, 2, 3, 4], new Uint8Array(6),
        ...[-1, 256, 1.5, NaN, Infinity, '1', undefined].map(n => [0, 0, 0, 0, 0, 0, n])])
        await assert.rejects(decrypt(input, password), /Invalid ChaCha20 payload/);
});

test('mode 3 has no authentication tag and permits valid UTF-8 bit flips', async () => {
    const altered = payload.slice();
    altered[9] ^= 'H'.charCodeAt(0) ^ 'J'.charCodeAt(0);
    assert.equal(await decrypt(altered, password), plaintext.replace('Hello', 'Jello'));
});
