# ZWUS Standards & Bases

Choosing the right ZWUS base involves balancing **payload size** against **platform compatibility**.

## Choosing the Optimal Base

- **Higher Bases (e.g. ZWUS-8):**
  You generally want to use the highest standard possible because higher bases encode more data per character, resulting in significantly more compact zero-width payloads and smaller storage footprints.
  
- **Compatibility Trade-off:**
  The higher the base, the larger the alphabet of zero-width Unicode characters required. Certain messaging apps, web services, or platforms may strip, sanitize, or fail to hide some of these characters properly (sometimes rendering visible space or placeholder boxes). If a platform alters or rejects certain characters, lower bases like **ZWUS-6** or **ZWUS-3** offer higher compatibility by restricting the alphabet to a smaller, safer subset of zero-width characters.

> **Developer Advice:**
> - **ZWUS-8:** Only pick ZWUS-8 if you are using lots of Asian or non-standard Unicode characters (where high code points benefit most from base-8 compression).
> - **ZWUS-6:** The sweet spot for English text if the target website or platform supports it.
> - **ZWUS-3:** Only use ZWUS-3 if you want to be as safe as possible across strict platforms.

## Automatic Detection with Sign

If you enable **Sign** when encoding, an invisible, collision-free signature is attached to the secret message. When decoding—either in the extension popup or via the on-screen overlay—inØsight automatically identifies and switches to the correct base and cipher every time. You never need to remember or guess which standard was used.

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

### ZWUS-8
Uses 9 unique characters (base 8 digits + delimiter):

| Role | Unicode | Character Name |
| :--- | :--- | :--- |
| **Separator** | `U+200C` | Zero Width Non-Joiner |
| **Digit 0** | `U+200D` | Zero Width Joiner |
| **Digit 1** | `U+200F` | Right-to-Left Mark |
| **Digit 2** | `U+00AD` | Soft Hyphen |
| **Digit 3** | `U+2060` | Word Joiner |
| **Digit 4** | `U+200B` | Zero Width Space |
| **Digit 5** | `U+200E` | Left-to-Right Mark |
| **Digit 6** | `U+180E` | Mongolian Vowel Separator |
| **Digit 7** | `U+FEFF` | Zero Width No-Break Space (BOM) |
