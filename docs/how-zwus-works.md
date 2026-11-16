# How ZWUS Works

ZWUS (Zero Width Unicode Standard) is a steganographic encoding. It stores a message in Unicode characters that take up no visible space, so the message can sit inside ordinary text without changing how that text looks.

## Encoding

1. **Text to numbers.** Each character becomes a number. ZWUS-3 and ZWUS-6 use the character's Unicode code point. ZWUS-7 ranks the 95 printable ASCII characters by how common they are in English (`t` = 0, `e` = 1, space = 2, …), so everyday text needs fewer digits; every other character gets a number based on its code point.
2. **Numbers to digits.** Each number is written in the standard's base: 3, 6, or 7.
3. **Digits to invisible characters.** Each digit is swapped for one zero-width character from the standard's alphabet, and an invisible separator goes between characters.

### Example

`hi` in ZWUS-7:

| Character | Number | Base 7 | Zero-width characters |
| :--- | :--- | :--- | :--- |
| `h` | 8 | `11` | `U+200F` `U+200F` |
| `i` | 5 | `5` | `U+200E` |

Joined with the separator `U+200C`, the hidden message is four invisible characters: `U+200F U+200F U+200C U+200E`.

The same text in ZWUS-6 takes seven characters, because `h` and `i` are encoded from their code points (104 and 105) instead of their ranks.

## Decoding

Decoding runs the steps in reverse. Visible characters are ignored, the invisible ones are split at each separator, each group of digits is read back as a number, and each number is turned back into its character.

The decoder has to use the same base the message was encoded with.

## Ciphers

With a cipher selected, the text is encrypted with your password first, and the encrypted output is what gets encoded. Without one (PLAIN), the message is hidden but not protected: anyone who finds the invisible characters can decode them. See [cipher.md](cipher.md).

## Sign

Sign prepends an 11-character invisible signature that records the base and cipher. With it, inØsight can spot hidden messages on a page and decode them without being told which settings were used.

## Limits

- Hidden text is longer than the original, because every character becomes several invisible ones. This matters on platforms with character limits.
- Some platforms strip certain zero-width characters, which is why there is more than one standard. See [zwus.md](zwus.md) for choosing a base and for each standard's alphabet.
