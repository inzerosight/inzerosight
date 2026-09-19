import assert from 'node:assert/strict';
import { test } from 'node:test';
import { password, plaintext, payload } from './fixtures/chacha20.js';

let listener;
globalThis.chrome = { runtime: { onMessage: {
    addListener(value) { listener = value; }
} } };
const { handleMessage } = await import('../src/background.js');

test('background decrypts ChaCha20 requests outside the content script', async () => {
    assert.equal(typeof listener, 'function');
    assert.equal(await handleMessage({ type: 'OTHER' }), undefined);
    const response = new Promise(resolve => assert.equal(listener({
        type: 'CHACHA20_DECRYPT', numbers: payload, password
    }, null, resolve), true));
    assert.deepEqual(await response, { ok: true, value: plaintext });
    assert.match((await handleMessage({
        type: 'CHACHA20_DECRYPT', numbers: [], password
    })).error, /Invalid ChaCha20 payload/);
});
