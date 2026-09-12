import zwus from 'zwus';
import * as speck48_96ctr from './speck48_96ctr.js';
import * as speck32_64ecb from './speck32_64ecb.js';

const textarea = document.getElementById('textarea');
const encoderDropdown = document.getElementById('encoder');
const cipherDropdown = document.getElementById('cipher');
const signBtn = document.getElementById('sign');
const sigDetect = document.getElementById('sigDetect');

const SIG = {
    3: '\u{200D}\u{200B}\u{00AD}\u{180E}',
    6: '\u{200D}\u{200B}\u{00AD}\u{2060}',
    8: '\u{200D}\u{200B}\u{00AD}\u{FEFF}'
};

document.getElementById('encodeButton').addEventListener('click', ACT);
document.getElementById('decodeButton').addEventListener('click', ACT);
signBtn.addEventListener('click', e =>
    e.target.classList.toggle('on')
);

let fadeTimer;

function ACT(event) {
    clearTimeout(fadeTimer);
    sigDetect.className = '';

    if (textarea.value === '') {
        textarea.value = 'The text box is empty.';
        return;
    }

    const op = event.target.id === 'encodeButton' ? 'NO' : 'YES';
    const cipher = getCipherKey();
    let base = encoderDropdown.value.split('-')[1];
    let text = textarea.value;

    if (op === 'YES') {
        const sigBase = Object.keys(SIG).find(b => text.includes(SIG[b]));
        if (sigBase) {
            if (sigBase !== base) {
                sigDetect.textContent = `ZWUS-${sigBase} signature detected`;
                sigDetect.className = 'show';
                fadeTimer = setTimeout(() =>
                    sigDetect.className = '', 2000
                );
            }
            base = sigBase;
            encoderDropdown.value = 'ZWUS-' + base;
            text = text.replace(SIG[base], '');
        }
    }

    const needsKey = cipher !== 'PLAIN';
    const kStr = needsKey && prompt('enter password.');

    if (needsKey && !kStr) return;

    try {
        let val = DESCRY[op][cipher](text, base, kStr);
        if (op === 'NO' && signBtn.classList.contains('on'))
            val = SIG[base] + val;
        textarea.value = val;
    } catch (e) {
        console.log(e);
    }

    if (op === 'NO') {
        textarea.select();
        document.execCommand('copy');
        textarea.value = 'Copied to your clipboard.\n A copy has been placed between these brackets [' + textarea.value + ']';
    }
}

function getCipherKey() {
    return cipherDropdown.value;
}

const DESCRY = {
    NO: {
        PLAIN: (ptStr, base) =>
            zwus.encodeString(ptStr, base),
        SPECK48_96CTR: (ptStr, base, kStr) =>
            zwus.encodeNumberArray(speck48_96ctr.encrypt(ptStr, speck48_96ctr.getKey(kStr)), base),
        'SPECK32_64ECB (insecure)': (ptStr, base, kStr) =>
            zwus.encodeNumberArray(speck32_64ecb.encrypt(ptStr, speck32_64ecb.getKey(kStr)), base),
    },
    YES: {
        PLAIN: (ptStr, base) =>
            zwus.decodeToString(ptStr, base),
        SPECK48_96CTR: (ptStr, base, kStr) =>
            speck48_96ctr.decrypt(zwus.decodeToNumberArray(ptStr, base), speck48_96ctr.getKey(kStr)),
        'SPECK32_64ECB (insecure)': (ptStr, base, kStr) =>
            speck32_64ecb.decrypt(zwus.decodeToNumberArray(ptStr, base), speck32_64ecb.getKey(kStr)),
    }
};
