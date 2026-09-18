import zwus from 'zwus';

export const SIG_PREFIX = '\u{200D}\u{200B}\u{00AD}';

export const SIG = {
    3: '\u{200D}\u{200B}\u{00AD}\u{180E}\u{200D}',
    6: '\u{200D}\u{200B}\u{00AD}\u{200C}\u{200D}',
    7: '\u{200D}\u{200B}\u{00AD}\u{200C}\u{200C}'
};

export const CIPHERS = {
    0: 'PLAIN',
    1: 'SPECK48_96CTR',
    2: 'SPECK32_64ECB (insecure)'
};

export const CIPHER_TO_ID = Object.fromEntries(
    Object.entries(CIPHERS).map(([k, v]) => [v, +k])
);

const SIGNATURES = Object.entries(SIG).flatMap(([base, prefix]) =>
    Object.entries(CIPHERS).map(([id, cipher]) => {
        const digits = (+id).toString(base).padStart(4, '0');
        if (digits.length !== 4) throw new RangeError(`Cipher ID ${id} exceeds ZWUS-${base}'s signature capacity`);
        const sig = prefix + zwus[base].unifier + zwus[base][0] +
            Array.from(digits, d => zwus[base][d]).join('');
        if (sig.length !== 11) throw new RangeError('Signatures must contain exactly 11 characters');
        return { base, cipher, sig, legacy: false };
    })
);

export function makeSig(base, cipher) {
    const entry = SIGNATURES.find(s => s.base === String(base) && s.cipher === cipher);
    if (!entry) throw new RangeError(`Unsupported signature: ZWUS-${base}, ${cipher}`);
    return entry.sig;
}

function findSig(text, signatures) {
    let sigIdx = text.indexOf(SIG_PREFIX);
    while (sigIdx !== -1) {
        const entry = signatures.find(s => text.startsWith(s.sig, sigIdx) &&
            (!s.legacyPlain || text[sigIdx + s.sig.length] !== zwus[s.base].unifier));
        if (entry) {
            const { base, cipher, sig, legacy } = entry;
            return { base, cipher, payload: text.slice(sigIdx + sig.length), sigIdx, sigLen: sig.length, legacy };
        }
        sigIdx = text.indexOf(SIG_PREFIX, sigIdx + 1);
    }
    return null;
}

// Current format: match only complete, registered 11-character signatures.
export const parseModernSig = text => findSig(text, SIGNATURES);

// Legacy compatibility: remove this registry, reader, and parseSig fallback together.
// Keep the supported bases and cipher IDs frozen; future standards use only the current format.
const LEGACY_SIGNATURES = [3, 6, 7].flatMap(base => [
    ...[1, 2].map(id => ({
        base: String(base), cipher: CIPHERS[id], legacy: true,
        sig: SIG[base] + zwus[base].unifier + zwus[base][0].repeat(3) + zwus[base][id]
    })),
    { base: String(base), cipher: 'PLAIN', sig: SIG[base], legacy: true, legacyPlain: true }
]);

// Legacy plaintext never starts with a unifier; do not downgrade incomplete/unknown extensions.
export const parseLegacySig = text => findSig(text, LEGACY_SIGNATURES);
export function parseSig(text) {
    const modern = parseModernSig(text), legacy = parseLegacySig(text);
    if (!modern) return legacy;
    // Legacy messages separated by visible text still need their own overlay.
    if (legacy && legacy.sigIdx < modern.sigIdx &&
        getPayloadEnd(text, legacy.base, legacy.sigIdx + legacy.sigLen) < modern.sigIdx) return legacy;
    return modern;
}

export function getPayloadEnd(text, base, startOffset) {
    const zw = new Set(Object.values(zwus[base]));
    let i = startOffset;
    while (i < text.length && zw.has(text[i])) i++;
    return i;
}
