import speck from 'generic-speck';
import { blake2bHex } from 'blakejs';

const speck32_64 = speck();

export function getKey(kStr: string): number[] {
    const key64bit = blake2bHex(kStr, undefined, 8);
    return [
        parseInt(key64bit.slice(0, 4), 16),
        parseInt(key64bit.slice(4, 8), 16),
        parseInt(key64bit.slice(8, 12), 16),
        parseInt(key64bit.slice(12, 16), 16)
    ];
}

export function encrypt(ptStr: string, key: number[]): number[] {
    return Array.from(ptStr, c => speck32_64.encrypt(c.codePointAt(0)!, key));
}

export function decrypt(numArr: number[], key: number[]): string {
    return numArr.map(x => {
        try { return String.fromCodePoint(speck32_64.decrypt(x, key)); }
        catch { return ''; }
    }).join('');
}
