import { defineConfig } from 'vite';
import fs from 'node:fs';

export default defineConfig(async ({ mode }) => {
    const target = process.env.TARGET || (['chrome', 'firefox', 'web'].includes(mode) ? mode : 'chrome');
    const plugins = [];

    if (target !== 'web') {
        const { default: webExtension } = await import('vite-plugin-web-extension');
        plugins.push(
            webExtension({
                manifest: () => {
                    const base = {
                        name: "in\u00D8sight",
                        version: "3.3.1",
                        author: "planetrenox@pm.me",
                        homepage_url: "https://github.com/inzerosight/inzerosight",
                        description: "Communicate undetected in plain sight.",
                        icons: { "48": "icon_500.png" },
                        permissions: ["clipboardWrite"],
                    };

                    const content_scripts = [{
                        matches: ["<all_urls>"],
                        js: ["content.js"],
                        run_at: "document_idle"
                    }];

                    if (target === 'chrome') {
                        return {
                            ...base,
                            manifest_version: 3,
                            content_security_policy: {
                                extension_pages: "script-src 'self' 'wasm-unsafe-eval'; object-src 'self';",
                            },
                            action: {
                                default_icon: { "48": "icon_500.png" },
                                default_title: "in\u00D8sight",
                                default_popup: "index.html",
                            },
                            content_scripts,
                        };
                    }

                    return {
                        ...base,
                        manifest_version: 2,
                        browser_action: {
                            browser_style: false,
                            default_icon: "icon_500.png",
                            default_title: "in\u00D8sight",
                            default_popup: "index.html",
                        },
                        content_security_policy: "script-src 'self' 'wasm-unsafe-eval'; style-src 'self';",
                        browser_specific_settings: {
                            gecko: {
                                id: "{0a73f41c-c59c-404b-9e07-f7392fa830d4}",
                            },
                            gecko_android: { strict_min_version: "120.0" },
                        },
                        content_scripts,
                    };
                },
            })
        );
    }

    // Custom plugin to ensure the icon is always copied to the target output directory
    plugins.push({
        name: 'copy-icon',
        writeBundle() {
            if (fs.existsSync('src/assets/icon_500.png')) {
                fs.copyFileSync('src/assets/icon_500.png', `dist/${target}/icon_500.png`);
            }
        }
    });

    return {
        root: 'src',
        build: {
            outDir: `../dist/${target}`,
            emptyOutDir: true,
        },
        plugins,
    };
});
