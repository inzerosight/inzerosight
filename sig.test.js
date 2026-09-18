import assert from 'node:assert/strict';
import { test } from 'node:test';
import zwus from 'zwus';
import * as chunked from './chunked.js';
import * as ctr from './speck48_96ctr.js';
import * as ecb from './speck32_64ecb.js';
import { makeSig, parseSig, parseModernSig, parseLegacySig, getPayloadEnd } from './sig.js';

// Frozen wire-format fixtures, independent of the signature registry.
const HEADERS = {
    3: '\u200D\u200B\u00AD\u180E\u200D',
    6: '\u200D\u200B\u00AD\u200C\u200D',
    7: '\u200D\u200B\u00AD\u200C\u200C'
};
const MODES = ['PLAIN', 'SPECK48_96CTR', 'SPECK32_64ECB (insecure)'];
const MESSAGE = 'tt\0 Hello, 世界 🌍\n';
const key = 'signature regression';

for (const base of [3, 6, 7]) {
    const z = zwus[base], header = HEADERS[base];
    const extended = digits => header + z.unifier + z[0] +
        Array.from(digits, d => z[d]).join('');

    test(`ZWUS-${base}: exact 11-character headers and round trips for every mode`, () => {
        for (const [id, cipher] of MODES.entries()) {
            const expected = extended('000' + id);
            assert.equal(makeSig(base, cipher), expected);
            assert.equal(makeSig(String(base), cipher).length, 11);
            const engine = [null, ctr, ecb][id];
            const payload = engine ? chunked.encodeNumberArray(engine.encrypt(MESSAGE, engine.getKey(key)), base) :
                chunked.encodeString(MESSAGE, base);
            const parsed = parseSig('visible ' + expected + payload + ' suffix');
            assert.deepEqual(parsed, {
                base: String(base), cipher, payload: payload + ' suffix', sigIdx: 8, sigLen: 11, legacy: false
            });
            const start = parsed.sigIdx + parsed.sigLen;
            const source = 'visible ' + expected + payload + ' suffix';
            const end = getPayloadEnd(source, base, start);
            assert.equal(source.slice(start, end), payload);
            const decoded = engine ? engine.decrypt(chunked.decodeToNumberArray(parsed.payload, base), engine.getKey(key)) :
                chunked.decodeToString(parsed.payload, base);
            assert.equal(decoded, MESSAGE);
        }
    });

    test(`ZWUS-${base}: modern reader rejects every unregistered four-digit ID`, () => {
        for (let id = 3; id < base ** 4; id++)
            assert.equal(parseModernSig(extended(id.toString(base).padStart(4, '0'))), null, `ID ${id}`);
    });

    test(`ZWUS-${base}: modern reader requires every character to match`, () => {
        const sig = extended('0000');
        for (let end = 0; end < sig.length; end++)
            assert.equal(parseModernSig(sig.slice(0, end)), null);
        for (let i = 0; i < sig.length; i++)
            assert.equal(parseModernSig(sig.slice(0, i) + 'x' + sig.slice(i + 1)), null);
        assert.equal(parseModernSig(extended('10000')), null);
        assert.equal(parseSig(extended('0000') + z[2]).sigLen, 11);
        assert.equal(parseSig(extended('0000') + z[2]).payload, z[2]);
    });

    test(`ZWUS-${base}: malformed extensions do not fall back to legacy PLAIN`, () => {
        for (const tail of [z.unifier, z.unifier + z[0], z.unifier + z[0].repeat(4),
            z.unifier + z[0] + 'xxx', z.unifier + z[0] + z[2].repeat(4)])
            assert.equal(parseSig(header + tail), null);
    });

    test(`ZWUS-${base}: legacy five-character PLAIN stays readable`, () => {
        const payload = zwus.encodeString(MESSAGE, base);
        const parsed = parseSig(header + payload);
        assert.deepEqual(parsed, {
            base: String(base), cipher: 'PLAIN', payload, sigIdx: 0, sigLen: 5, legacy: true
        });
        assert.equal(zwus.decodeToString(parsed.payload, base), MESSAGE);
        assert.equal(parseModernSig(header + payload), null);
    });

    test(`ZWUS-${base}: legacy ten-character encrypted signatures stay readable`, () => {
        for (const [id, engine] of [[1, ctr], [2, ecb]]) {
            const sig = extended('00' + id);
            const payload = zwus.encodeNumberArray(engine.encrypt(MESSAGE, engine.getKey(key)), base);
            const parsed = parseSig(sig + payload);
            assert.equal(parsed.cipher, MODES[id]);
            assert.equal(parsed.sigLen, 10);
            assert.equal(parsed.legacy, true);
            assert.equal(parsed.payload, payload);
            assert.equal(engine.decrypt(zwus.decodeToNumberArray(parsed.payload, base), engine.getKey(key)), MESSAGE);
            // A legacy header's next digit is payload, even if all 11 characters resemble a future ID.
            assert.equal(parseLegacySig(sig + z[0]).payload, z[0]);
        }
    });

    test(`ZWUS-${base}: complete modern signatures take priority and preserve offsets`, () => {
        const sig = extended('0000'), payload = zwus.encodeString('hello', base);
        const prefix = header + z.unifier + 'broken ';
        const parsed = parseSig(prefix + sig + payload);
        assert.equal(parsed.sigIdx, prefix.length);
        assert.equal(parsed.legacy, false);
        assert.equal(parsed.payload, payload);
    });

    test(`ZWUS-${base}: legacy and modern messages separated by visible text remain discoverable`, () => {
        const payload = zwus.encodeString('hello', base);
        const legacy = header + payload, modern = extended('0000') + payload;
        const text = legacy + ' and ' + modern;
        const first = parseSig(text);
        assert.equal(first.legacy, true);
        assert.equal(first.sigIdx, 0);
        const end = getPayloadEnd(text, base, first.sigLen);
        assert.equal(end, legacy.length);
        assert.equal(parseSig(text.slice(end)).legacy, false);
    });

    test(`ZWUS-${base}: empty and chunked payloads preserve their contents`, () => {
        const sig = makeSig(base, 'PLAIN');
        assert.equal(parseSig(sig).payload, '');
        const text = 't'.repeat(65535) + '🌍\0';
        assert.equal(chunked.decodeToString(parseSig(sig + chunked.encodeString(text, base)).payload, base), text);
    });
}

test('unknown standards and modes cannot generate signatures', () => {
    assert.throws(() => makeSig(8, 'PLAIN'), RangeError);
    assert.throws(() => makeSig(7, 'unknown'), RangeError);
    assert.throws(() => makeSig(7), RangeError);
});

test('legacy cross-standard collision does not match a modern signature', () => {
    const text = zwus.encodeString('ŵt', 7);
    assert.equal(parseModernSig(text), null);
    assert.equal(parseLegacySig(text).base, '6');
    assert.equal(parseSig(text + makeSig(7, 'PLAIN')).legacy, false);
});
