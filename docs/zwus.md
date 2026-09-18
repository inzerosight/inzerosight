# ZWUS Standards & Bases

Choosing the right ZWUS base depends on platform compatibility.

**ZWUS-7** stands for Zero Width Unicode Standard Base 7. It's newer and should be used instead of ZWUS-6 in almost all situations that are compatible. When encoding, it is ~34% more space efficient compared to ZWUS-6, especially when encoding English. In almost all cases, I've personally found ZWUS-7 is compatible everywhere ZWUS-6 is, so use ZWUS-7.

**ZWUS-3** is compatible on Twitter (X), but because of Twitter's character limit, it's kinda limiting. If there is demand, I could create a new standard that uses fewer characters for Twitter—just open an issue and let me know if that's what you want.

> [!NOTE]
> ZWUS-8 was removed. If you need to decode something that was encoded in ZWUS-8, send me an email at `planetrenox@pm.me` and I can help you.

---

## Automatic Detection with Sign

If you enable **Sign** when encoding, an invisible signature is attached to the secret message. When decoding—either in the extension popup or via the on-screen overlay—inØsight automatically identifies the base and cipher.

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
Uses 8 unique characters (base 7 digits + delimiter):

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
