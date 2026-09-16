import zwus from 'zwus';

export const SIG_PREFIX = '\u{200D}\u{200B}\u{00AD}';

export const SIG = {
    3: '\u{200D}\u{200B}\u{00AD}\u{180E}\u{200D}',
    6: '\u{200D}\u{200B}\u{00AD}\u{200C}\u{200D}',
    7: '\u{200D}\u{200B}\u{00AD}\u{200C}\u{200C}'
};

export const CIPHERS = {
    1: 'SPECK48_96CTR',
    2: 'SPECK32_64ECB (insecure)'
};

export const CIPHER_TO_ID = Object.fromEntries(
    Object.entries(CIPHERS).map(([k, v]) => [v, +k])
);

export function makeSig(base, cipher) {
    let s = SIG[base];
    const id = CIPHER_TO_ID[cipher];
    if (id) {
        const zwDigits = Array.from(id.toString(base).padStart(3, '0'), d => zwus[base][d]).join('');
        s += zwus[base].unifier + zwus[base][0] + zwDigits;
    }
    return s;
}

export function parseSig(text) {
    let sigIdx = text.indexOf(SIG_PREFIX), base;
    while (sigIdx !== -1) {
        base = Object.keys(SIG).find(b => text.startsWith(SIG[b], sigIdx));
        if (base) break;
        sigIdx = text.indexOf(SIG_PREFIX, sigIdx + SIG_PREFIX.length);
    }
    if (!base) return null;
    const after = text.slice(sigIdx + SIG[base].length);
    const barrier = zwus[base].unifier + zwus[base][0];
    if (after.startsWith(barrier)) {
        const zwDigits = Array.from(after.slice(barrier.length, barrier.length + 3));
        const digits = zwDigits.map(z => Object.keys(zwus[base]).find(k => zwus[base][k] === z)).join('');
        const cipher = CIPHERS[parseInt(digits, base)];
        if (!cipher) return { base, cipher: 'PLAIN', payload: after, sigIdx, sigLen: SIG[base].length };
        const payload = after.slice(barrier.length + 3);
        const sigLen = SIG[base].length + barrier.length + 3;
        return { base, cipher, payload, sigIdx, sigLen };
    }
    return { base, cipher: 'PLAIN', payload: after, sigIdx, sigLen: SIG[base].length };
}

export function getPayloadEnd(text, base, startOffset) {
    const zw = new Set(Object.values(zwus[base]));
    let i = startOffset;
    while (i < text.length && zw.has(text[i])) i++;
    return i;
}
