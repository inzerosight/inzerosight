# ZWUS Standards & Bases

Choosing the right ZWUS base involves balancing **payload size** against **platform compatibility**.

## Choosing the Optimal Base

- **ZWUS-7:**
  Ranks printable ASCII characters by frequency so common English letters and spaces use short values. It is the default for casual text.
  
- **Compatibility Trade-off:**
  The higher the base, the larger the alphabet of zero-width Unicode characters required. Certain messaging apps, web services, or platforms may strip, sanitize, or fail to hide some of these characters properly (sometimes rendering visible space or placeholder boxes). If a platform alters or rejects certain characters, lower bases like **ZWUS-6** or **ZWUS-3** offer higher compatibility by restricting the alphabet to a smaller, safer subset of zero-width characters.

> **Developer Advice:**
> - **ZWUS-7:** Use it for compact everyday English text.
> - **ZWUS-6:** Use it when a platform does not preserve ZWUS-7's additional character.
> - **ZWUS-3:** Only use ZWUS-3 if you want to be as safe as possible across strict platforms.

## Why ZWUS-7 Is Smaller

ZWUS-6 writes each character's Unicode code point in base 6. For example, `t` is code point 116, which needs three base-6 digits. ZWUS-7 first assigns short numbers to printable ASCII characters in an order chosen for ordinary English text, then writes those numbers in base 7:

| Character | ZWUS-6 value | ZWUS-6 digits | ZWUS-7 rank | ZWUS-7 digits |
| :--- | ---: | ---: | ---: | ---: |
| `t` | 116 | 3 | 0 | 1 |
| `e` | 101 | 3 | 1 | 1 |
| space | 32 | 2 | 2 | 1 |
| `a` | 97 | 3 | 3 | 1 |
| `s` | 115 | 3 | 7 | 2 |

Ranks 0–6 fit in one zero-width digit; ranks 7–48 fit in two. All lowercase English letters fit in one or two digits, as do the decimal digits. Each encoded character is separated by one zero-width unifier in either standard, so shorter values directly reduce the payload length. ZWUS-7 adds `U+FEFF` as a seventh digit, but the frequency ranking is responsible for most of the saving.

For example, encoding `hello world` without a signature produces **42 zero-width characters with ZWUS-6** and **28 with ZWUS-7**: one third fewer characters. The count includes separators and measures characters, not UTF-8 bytes. The exact saving depends on the text. Rare printable characters can still need three digits, and control characters such as newlines can be longer in ZWUS-7. Non-ASCII characters retain their code points. Frequency ranking applies to strings only; number arrays use ordinary base-7 numbers.

## Automatic Detection with Sign

If you enable **Sign** when encoding, an invisible signature is attached to the secret message. When decoding—either in the extension popup or via the on-screen overlay—inØsight identifies the base and cipher.

---

## Unicode Alphabet by Standard

### ZWUS-3
Uses 4 unique characters (base 3 digits + delimiter):

| Role | Unicode | Character Name |
| :--- | :--- | :--- |
| **Separator** | `U+00AD` | Soft Hyphen |
| **Digit 0** | `U+180E` | Mongolian Vowel Separator |
| **Digit 1** | `U+200B` | Zero Width Space |
| **Digit 2** | `U+200D` | Zero Width Joiner |

### ZWUS-6
Uses 7 unique characters (base 6 digits + delimiter):

| Role | Unicode | Character Name |
| :--- | :--- | :--- |
| **Separator** | `U+200C` | Zero Width Non-Joiner |
| **Digit 0** | `U+200D` | Zero Width Joiner |
| **Digit 1** | `U+200F` | Right-to-Left Mark |
| **Digit 2** | `U+00AD` | Soft Hyphen |
| **Digit 3** | `U+2060` | Word Joiner |
| **Digit 4** | `U+200B` | Zero Width Space |
| **Digit 5** | `U+200E` | Left-to-Right Mark |

### ZWUS-7
Uses 8 unique characters (base 7 digits + delimiter). Printable ASCII is ranked so frequent English characters take fewer digits; other Unicode code points retain their numeric value (control characters move above the ASCII ranks). Number arrays use ordinary base-7 values:

| Role | Unicode | Character Name |
| :--- | :--- | :--- |
| **Separator** | `U+200C` | Zero Width Non-Joiner |
| **Digit 0** | `U+200D` | Zero Width Joiner |
| **Digit 1** | `U+200F` | Right-to-Left Mark |
| **Digit 2** | `U+00AD` | Soft Hyphen |
| **Digit 3** | `U+2060` | Word Joiner |
| **Digit 4** | `U+200B` | Zero Width Space |
| **Digit 5** | `U+200E` | Left-to-Right Mark |
| **Digit 6** | `U+FEFF` | Zero Width No-Break Space (BOM) |
