declare module 'zwus' {
    export function encodeString(text: string, base: string | number): string;
    export function decodeToString(text: string, base: string | number): string;
    export function encodeNumberArray(arr: number[], base: string | number): string;
    export function decodeToNumberArray(text: string, base: string | number): number[];
    const zwus: {
        encodeString: typeof encodeString;
        decodeToString: typeof decodeToString;
        encodeNumberArray: typeof encodeNumberArray;
        decodeToNumberArray: typeof decodeToNumberArray;
    };
    export default zwus;
}

declare module 'generic-speck' {
    export interface SpeckOptions {
        bits?: number;
        rounds?: number;
        rightRotations?: number;
        leftRotations?: number;
    }
    export interface SpeckInstance {
        encrypt: (plain: number, key: number[]) => number;
        decrypt: (cipher: number, key: number[]) => number;
    }
    export default function speck(options?: SpeckOptions): SpeckInstance;
}
