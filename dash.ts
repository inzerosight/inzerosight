import zwus from 'zwus';
import * as speck48_96ctr from './speck48_96ctr.js';
import * as speck32_64ecb from './speck32_64ecb.js';

type Cipher = 'PLAIN' | 'SPECK48_96CTR' | 'SPECK32_64ECB (insecure)';
type Op = 'NO' | 'YES';
type Transform = (ptStr: string, base: string, kStr: string) => string;

const textarea = document.getElementById('textarea') as HTMLTextAreaElement;
const encoderDropdown = document.getElementById('encoder') as HTMLSelectElement;
const cipherDropdown = document.getElementById('cipher') as HTMLSelectElement;
document.getElementById('encodeButton')?.addEventListener('click', ACT);
document.getElementById('decodeButton')?.addEventListener('click', ACT);

const DESCRY: Record<Op, Record<Cipher, Transform>> = {
    NO: {
        PLAIN: (ptStr, base) => zwus.encodeString(ptStr, base),
        SPECK48_96CTR: (ptStr, base, kStr) =>
            zwus.encodeNumberArray(speck48_96ctr.encrypt(ptStr, speck48_96ctr.getKey(kStr)), base),
        'SPECK32_64ECB (insecure)': (ptStr, base, kStr) =>
            zwus.encodeNumberArray(speck32_64ecb.encrypt(ptStr, speck32_64ecb.getKey(kStr)), base),
    },
    YES: {
        PLAIN: (ptStr, base) => zwus.decodeToString(ptStr, base),
        SPECK48_96CTR: (ptStr, base, kStr) =>
            speck48_96ctr.decrypt(zwus.decodeToNumberArray(ptStr, base), speck48_96ctr.getKey(kStr)),
        'SPECK32_64ECB (insecure)': (ptStr, base, kStr) =>
            speck32_64ecb.decrypt(zwus.decodeToNumberArray(ptStr, base), speck32_64ecb.getKey(kStr)),
    }
};

function ACT(event: MouseEvent): void {
    if (!textarea.value) {
        textarea.value = 'The text box is empty.';
        return;
    }

    const op: Op = (event.target as HTMLElement).id === 'encodeButton' ? 'NO' : 'YES';
    const cipher = cipherDropdown.value as Cipher;
    const base = encoderDropdown.value.split('-')[1];
    const needsKey = cipher !== 'PLAIN';
    const kStr = needsKey ? prompt('enter password.') : '';

    if (needsKey && !kStr) return;

    try {
        textarea.value = DESCRY[op][cipher](textarea.value, base, kStr || '');
    } catch (e) {
        console.error(e);
    }

    if (op === 'NO') {
        textarea.select();
        document.execCommand('copy');
        textarea.value = `Copied to your clipboard.\n A copy has been placed between these brackets [${textarea.value}]`;
    }
}
