import speck from 'generic-speck';
import { blake2bHex } from 'blakejs';

const speck48_96 = speck({ bits: 24, rounds: 23, rightRotations: 8, leftRotations: 3 });

export function getKey(kStr: string): number[] {
    const key96bit = blake2bHex(kStr, undefined, 12);
    return [
        parseInt(key96bit.slice(0, 6), 16),
        parseInt(key96bit.slice(6, 12), 16),
        parseInt(key96bit.slice(12, 18), 16),
        parseInt(key96bit.slice(18, 24), 16)
    ];
}

export function encrypt(ptStr: string, key: number[]): number[] {
    const nonce = globalThis.crypto.getRandomValues(new Uint32Array(1))[0] & 0xFFFFFF;
    
    const ctArr = Array.from(ptStr, (c, i) => {
        const ctrBlock = nonce * 16777216 + (i & 0xFFFFFF);
        const ks = speck48_96.encrypt(ctrBlock, key);
        return (c.codePointAt(0)! ^ ks) >>> 0;
    });
    
    return [nonce, ...ctArr];
}

export function decrypt(numArr: number[], key: number[]): string {
    if (!numArr || numArr.length === 0) return '';
    
    const nonce = numArr[0];
    const ctArr = numArr.slice(1);
    
    return ctArr.map((ct, i) => {
        const ctrBlock = nonce * 16777216 + (i & 0xFFFFFF);
        const ks = speck48_96.encrypt(ctrBlock, key);
        const cp = (ct ^ ks) >>> 0;
        try { return String.fromCodePoint(cp); }
        catch { return ''; }
    }).join('');
}
