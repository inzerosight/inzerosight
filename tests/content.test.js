import assert from 'node:assert/strict';
import { test } from 'node:test';
import zwus from 'zwus';
import { makeSig } from '../src/sig.js';

test('page overlay detects headers split by WBR and decodes across the split', async () => {
    const buttons = [], inserted = [], fixtures = [], texts = [];
    const rect = { top: 10, bottom: 20, left: 10, right: 20, width: 10, height: 10 };
    const body = { tagName: 'BODY', appendChild() {} };
    const parent = { tagName: 'DIV', parentElement: body, getBoundingClientRect: () => rect };
    let observer;

    const element = tag => ({
        tagName: tag.toUpperCase(), nodeType: 1, style: {}, offsetWidth: 0, offsetHeight: 0,
        appendChild(child) { child.parentElement = this; },
        attachShadow() { return element('shadow'); },
        getBoundingClientRect: () => rect,
        remove() { this.removed = true; }
    });
    const addRun = (encoded, cut, cipher) => {
        const parts = [encoded.slice(0, cut), encoded.slice(cut, 13), encoded.slice(13)];
        const nodes = parts.flatMap((part, i) => i ? [element('wbr'), {
            nodeType: 3, nodeValue: part, parentElement: parent, isConnected: true
        }] : [{ nodeType: 3, nodeValue: part, parentElement: parent, isConnected: true }]);
        nodes.forEach((node, i) => {
            node.previousSibling = nodes[i - 1] || null;
            node.nextSibling = nodes[i + 1] || null;
            if (node.nodeType === 3) texts.push(node);
        });
        fixtures.push({ nodes, cipher });
    };

    for (const base of [3, 6, 7]) for (const cipher of
        ['PLAIN', 'SPECK48_96CTR', 'SPECK32_64ECB (insecure)']) {
        const payload = cipher === 'PLAIN' ? zwus.encodeString('hello', base) :
            zwus.encodeNumberArray([1, 2, 3], base);
        for (const cut of [1, 2, 3, 5, 6, 10]) addRun(makeSig(base, cipher) + payload, cut, cipher);
    }

    globalThis.Node = { ELEMENT_NODE: 1, TEXT_NODE: 3 };
    globalThis.NodeFilter = { SHOW_TEXT: 4, FILTER_ACCEPT: 1, FILTER_REJECT: 2 };
    globalThis.document = {
        body, documentElement: body,
        createElement(tag) { const node = element(tag); if (tag === 'button') buttons.push(node); return node; },
        createTreeWalker() {
            let i = 0;
            return { nextNode: () => texts[i++] || null };
        },
        createRange() {
            return {
                setStart(node, offset) { this.startNode = node; this.start = offset; },
                setEnd(node, offset) { this.endNode = node; this.end = offset; },
                getBoundingClientRect: () => rect,
                toString() {
                    let value = '', node = this.startNode;
                    while (node) {
                        if (node.nodeType === 3) value += node.nodeValue.slice(
                            node === this.startNode ? this.start : 0,
                            node === this.endNode ? this.end : undefined
                        );
                        if (node === this.endNode) break;
                        node = node.nextSibling;
                    }
                    return value;
                },
                deleteContents() {},
                insertNode(node) { inserted.push(node); }
            };
        }
    };
    globalThis.window = {
        innerHeight: 100, innerWidth: 100, addEventListener() {},
        getComputedStyle: () => ({ overflow: 'visible', overflowX: 'visible', overflowY: 'visible' })
    };
    globalThis.MutationObserver = class {
        constructor(callback) { this.callback = callback; observer = this; }
        observe() {}
    };
    globalThis.requestAnimationFrame = callback => { callback(); return 1; };

    await import('../src/content.js');
    assert.equal(buttons.length, fixtures.length);
    fixtures.forEach(({ cipher }, i) =>
        assert.equal(buttons[i].textContent, cipher === 'PLAIN' ? 'Decode' : 'Decrypt'));
    observer.callback([{ type: 'childList', addedNodes: [] }]);
    assert.equal(buttons.some(button => button.parentElement.removed), false);
    buttons[0].onclick();
    assert.equal(inserted[0].textContent, ' hello ');
});
