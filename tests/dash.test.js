import assert from 'node:assert/strict';
import { test } from 'node:test';
import { makeSig } from '../src/sig.js';

test('encryption mismatch hint appears after the password prompt closes', async () => {
    const elements = Object.fromEntries([
        'textarea', 'encoder', 'cipher', 'sign', 'sigDetect', 'notice', 'encodeButton', 'decodeButton'
    ].map(id => [id, {
        id, className: '', disabled: false, value: '',
        addEventListener(type, listener) { this[type] = listener; }
    }]));
    elements.textarea.value = makeSig('7', 'CHACHA20');
    elements.encoder.value = 'ZWUS-7';
    elements.cipher.value = 'PLAIN';
    elements.sign.classList = { toggle() {}, contains: () => false };

    const original = {
        document: globalThis.document, prompt: globalThis.prompt,
        setTimeout: globalThis.setTimeout, clearTimeout: globalThis.clearTimeout,
        requestAnimationFrame: globalThis.requestAnimationFrame,
        cancelAnimationFrame: globalThis.cancelAnimationFrame
    };
    let frame, timer;
    globalThis.document = { getElementById: id => elements[id] };
    globalThis.setTimeout = callback => (timer = callback, 1);
    globalThis.clearTimeout = () => {};
    globalThis.requestAnimationFrame = callback => (frame = callback, 1);
    globalThis.cancelAnimationFrame = () => {};
    globalThis.prompt = () => { timer?.(); return null; };

    try {
        await import('../src/dash.js');
        await elements.decodeButton.click({ target: elements.decodeButton });
        assert.equal(elements.sigDetect.className, 'show');
        assert.equal(elements.sigDetect.textContent, 'ZWUS-7 (CHACHA20) signature detected');
        frame();
        assert.equal(elements.sigDetect.className, 'show');
        timer();
        assert.equal(elements.sigDetect.className, '');
    } finally {
        Object.assign(globalThis, original);
    }
});
