import zwus from 'zwus';

const SIZE = 65536;

function encode(values, base, method) {
    const parts = [];
    for (let start = 0; start < values.length;) {
        let end = Math.min(start + SIZE, values.length);
        if (typeof values === 'string' && end < values.length &&
            values.charCodeAt(end - 1) >= 0xD800 && values.charCodeAt(end - 1) <= 0xDBFF) end--;
        parts.push(zwus[method](values.slice(start, end), base));
        start = end;
    }
    return parts.join(zwus[base].unifier);
}

function decode(text, base, method) {
    const parts = [], sep = zwus[base].unifier;
    for (let start = 0; start < text.length;) {
        let end = Math.min(start + SIZE, text.length);
        if (end < text.length) {
            const cut = text.lastIndexOf(sep, end - 1);
            end = cut >= start ? cut + 1 : (text.indexOf(sep, end) + 1 || text.length);
        }
        parts.push(zwus[method](text.slice(start, end), base));
        start = end;
    }
    return method === 'decodeToString' ? parts.join('') : parts.flat();
}

export const encodeString = (text, base) => encode(text, base, 'encodeString');
export const encodeNumberArray = (numbers, base) => encode(numbers, base, 'encodeNumberArray');
export const decodeToString = (text, base) => decode(text, base, 'decodeToString');
export const decodeToNumberArray = (text, base) => decode(text, base, 'decodeToNumberArray');
