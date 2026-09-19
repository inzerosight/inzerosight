import * as chunked from './chunked.js';
import * as speck48_96ctr from './speck48_96ctr.js';
import * as speck32_64ecb from './speck32_64ecb.js';
import * as chacha20 from './chacha20.js';
import { getSigHint, makeSig, parseSig } from './sig.js';

const textarea = document.getElementById('textarea');
const encoderDropdown = document.getElementById('encoder');
const cipherDropdown = document.getElementById('cipher');
const signBtn = document.getElementById('sign');
const sigDetect = document.getElementById('sigDetect');
const notice = document.getElementById('notice');
const buttons = ['encodeButton', 'decodeButton'].map(id => document.getElementById(id));
const controls = [...buttons, encoderDropdown, cipherDropdown, signBtn];

document.getElementById('encodeButton').addEventListener('click', ACT);
document.getElementById('decodeButton').addEventListener('click', ACT);
signBtn.addEventListener('click', e =>
    e.target.classList.toggle('on')
);

let fadeTimer, fadeFrame, busy = false;

async function ACT(event) {
    if (busy) return;
    clearTimeout(fadeTimer);
    cancelAnimationFrame(fadeFrame);
    sigDetect.className = '';

    if (textarea.value === '') {
        textarea.value = 'The text box is empty.';
        return;
    }

    const op = event.target.id === 'encodeButton' ? 'NO' : 'YES';
    let cipher = getCipherKey();
    let base = encoderDropdown.value.split('-')[1];
    let text = textarea.value;
    let hint = '';

    if (op === 'YES') {
        const parsed = parseSig(text);
        if (parsed) {
            hint = getSigHint(parsed, base, cipher);
            base = parsed.base;
            encoderDropdown.value = 'ZWUS-' + base;
            if (parsed.cipher) {
                cipher = parsed.cipher;
                cipherDropdown.value = cipher;
            }
            text = text.slice(0, parsed.sigIdx) + parsed.payload;
        }
    }

    const needsKey = cipher !== 'PLAIN';
    const kStr = needsKey && prompt('enter password.');

    if (hint) {
        sigDetect.textContent = hint;
        sigDetect.className = 'show';
        fadeFrame = requestAnimationFrame(() =>
            fadeTimer = setTimeout(() => sigDetect.className = '', 2000));
    }
    if (needsKey && !kStr) return;

    busy = true;
    controls.forEach(control => control.disabled = true);
    notice.textContent = 'Processing…';
    try {
        let val = await DESCRY[op][cipher](text, base, kStr);
        if (op === 'NO' && signBtn.classList.contains('on'))
            val = makeSig(base, cipher) + val;
        textarea.value = val;
        if (op === 'NO') {
            notice.textContent = 'Copying…';
            const copied = await copyText(val);
            if (copied && val.length <= 65536)
                textarea.value = 'Copied to your clipboard.\n A copy has been placed between these brackets [' + val + ']';
            notice.textContent = copied ? `Copied ${val.length.toLocaleString()} characters.` :
                'Copy failed. The encoded text is in the box; select and copy it manually.';
        } else notice.textContent = `Decoded ${val.length.toLocaleString()} characters.`;
    } catch (e) {
        console.error(e);
        notice.textContent = `Could not ${op === 'NO' ? 'encode' : 'decode'}: ${e.message}`;
    } finally {
        busy = false;
        controls.forEach(control => control.disabled = false);
    }
}

async function copyText(val) {
    if (navigator.clipboard?.writeText) {
        let timer;
        try {
            await Promise.race([
                navigator.clipboard.writeText(val),
                new Promise((_, reject) => timer = setTimeout(() => reject(new Error('Copy timed out')), 5000))
            ]);
            return true;
        } catch (e) { console.warn('Clipboard copy failed', e); }
        finally { clearTimeout(timer); }
    }
    if (val.length > 65536) return false;
    textarea.select();
    try { return document.execCommand('copy'); }
    catch (e) { console.warn('Clipboard copy failed', e); return false; }
}

function getCipherKey() {
    return cipherDropdown.value;
}

const DESCRY = {
    NO: {
        PLAIN: (ptStr, base) =>
            chunked.encodeString(ptStr, base),
        SPECK48_96CTR: (ptStr, base, kStr) =>
            chunked.encodeNumberArray(speck48_96ctr.encrypt(ptStr, speck48_96ctr.getKey(kStr)), base),
        'SPECK32_64ECB (insecure)': (ptStr, base, kStr) =>
            chunked.encodeNumberArray(speck32_64ecb.encrypt(ptStr, speck32_64ecb.getKey(kStr)), base),
        CHACHA20: async (ptStr, base, kStr) =>
            chunked.encodeNumberArray(await chacha20.encrypt(ptStr, kStr), base),
    },
    YES: {
        PLAIN: (ptStr, base) =>
            chunked.decodeToString(ptStr, base),
        SPECK48_96CTR: async (ptStr, base, kStr) =>
            speck48_96ctr.decrypt(await chunked.decodeToNumberArray(ptStr, base), speck48_96ctr.getKey(kStr)),
        'SPECK32_64ECB (insecure)': async (ptStr, base, kStr) =>
            speck32_64ecb.decrypt(await chunked.decodeToNumberArray(ptStr, base), speck32_64ecb.getKey(kStr)),
        CHACHA20: (ptStr, base, kStr) =>
            chacha20.decrypt(chunked.decodeToNumberArray(ptStr, base), kStr),
    }
};
