<p align="center"><img src="icon_500.png" width="128"></p>
<h1 align="center">inØsight</h1>
<p align="center">This sentence contains hidden text you can only read by installing inzerosight.‍​­‌‍‏‎‏‌⁠‍⁠‌⁠‍­‌­‎‏‌⁠‏‍‌­​‏‌⁠‏­‌⁠‏‏‌‏‏­‌‎­‌⁠­‏‌⁠‍⁠‌⁠‏⁠‌‎­‌­​⁠‌­​‏‌⁠‍­‌‎­‌⁠‍­‌⁠‍⁠‌⁠‏‎‌‎­‌­​⁠‌⁠‍⁠‌⁠‍‏‌⁠‍‏‌⁠‏⁠‌⁠‍­‌­‎⁠‌­​⁠‌­​‏‌⁠‏­‌­​‎‌‎­‌⁠‏‏‌­​‎‌­​⁠‌⁠‏‍‌­​‎‌⁠‏­‌⁠‍‍‌⁠­‏‌‎­‌­‎⁠‌⁠‍­‌‎­‌⁠‍​‌⁠‍‍‌­​‏‌­‎⁠‌⁠‍­‌‎­‌⁠‏‏‌­‎⁠‌­‎‏‌­‎­‌⁠‏­‌‏‏​</p>

<p align="center">
<a href="https://addons.mozilla.org/en-US/firefox/addon/in0sight/">Firefox Add-on</a> · <a href="https://chromewebstore.google.com/detail/acnmohbphjmnbaboacmecidopeplkhog">Chrome Web Store</a>
</p>

---

<p align="center">
  <img src="docs/inzerosight.gif" alt="inØsight demo">
</p>

<p align="center">
  <img src="docs/ui.png" alt="inØsight user interface">
</p>

### Sign
When enabled, prepends an invisible zero-width signature to the output. This allows inØsight to automatically detect hidden messages across web pages, identify the base and cipher, and show the on-screen decode button.

## How ZWUS Works

1. Takes each character's Unicode code point. ZWUS-7 ranks printable ASCII first so common letters and spaces use short values.
2. Converts the value to the chosen base (3, 6, or 7).
3. Maps each resulting digit to its assigned zero-width character from the alphabet.
4. Joins digits together; separates characters with the base's designated separator (also zero-width).

The result is a string of invisible Unicode that carries the full original text. Decoding reverses the mapping: splits on the separator, looks up each zero-width character to recover the digit, parses the base-N number back to a code point, and reconstructs the string.

For details regarding picking the optimal standard/base, see [docs/zwus.md](docs/zwus.md).

For cipher details, see [docs/cipher.md](docs/cipher.md).

## Use ZWUS in Your Own Projects

The encoder/decoder is available as a standalone package for multiple languages:

- **JavaScript/TypeScript:** [zwus on npm](https://www.npmjs.com/package/zwus)
- **Rust:** [zwus on crates.io](https://crates.io/crates/zwus)

> [!NOTE]
> Encoding works with **all Unicode characters in existence** (`U+0000` to `U+10FFFF`), including every language script, emoji, and symbol.
