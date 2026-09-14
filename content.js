import zwus from 'zwus';
import * as speck48_96ctr from './speck48_96ctr.js';
import * as speck32_64ecb from './speck32_64ecb.js';
import { SIG_PREFIX, parseSig, getPayloadEnd } from './sig.js';

let host, shadow;
const active = new Set();

function initShadow() {
    if (host) return;
    host = document.createElement('div');
    host.id = 'in0-host';
    shadow = host.attachShadow({ mode: 'open' });
    const s = document.createElement('style');
    s.textContent = `
        .in0-wrap {
            position: fixed;
            pointer-events: auto;
            z-index: 2147483647;
            display: flex;
            flex-direction: column;
            align-items: center;
            font-family: system-ui, -apple-system, sans-serif;
            transition: opacity 0.1s ease;
        }
        .in0-btn {
            background: #18191c;
            color: #fff;
            border: 1px solid #3a3b40;
            border-radius: 4px;
            font-size: 11px;
            font-weight: 600;
            padding: 4px 10px;
            cursor: pointer;
            box-shadow: 0 4px 12px rgba(0,0,0,0.5);
            position: relative;
            white-space: nowrap;
        }
        .in0-btn:hover {
            border-color: #00b4d8;
            box-shadow: 0 0 8px rgba(0,180,216,0.4);
        }
        .in0-badge {
            position: absolute;
            top: -6px;
            right: -6px;
            width: 15px;
            height: 15px;
            border-radius: 50%;
            background: #00b4d8;
            color: #fff;
            font-size: 10px;
            font-weight: 700;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 1px 3px rgba(0,0,0,0.4);
        }
        .in0-arrow {
            width: 0;
            height: 0;
            border-left: 5px solid transparent;
            border-right: 5px solid transparent;
            border-top: 6px solid #18191c;
            margin-top: -1px;
        }
    `;
    shadow.appendChild(s);
    (document.body || document.documentElement).appendChild(host);
}

function createOverlay(node, parsed, start, endNode, end) {
    for (const e of active) if (e.node === node && e.start === start) return;
    initShadow();
    const wrap = document.createElement('div');
    wrap.className = 'in0-wrap';

    const btn = document.createElement('button');
    btn.className = 'in0-btn';
    btn.textContent = parsed.cipher === 'PLAIN' ? 'Decode' : 'Decrypt';

    const badge = document.createElement('span');
    badge.className = 'in0-badge';
    badge.textContent = '\u00D8';
    btn.appendChild(badge);

    const arrow = document.createElement('div');
    arrow.className = 'in0-arrow';

    wrap.appendChild(btn);
    wrap.appendChild(arrow);
    shadow.appendChild(wrap);

    const entry = { wrap, node, start, endNode, end };
    active.add(entry);

    btn.onclick = () => onAction(entry, parsed);
    updatePos(entry);
}

function updatePos(entry) {
    const { wrap, node, start, endNode, end } = entry;
    if (!node.isConnected || !endNode.isConnected) {
        wrap.remove();
        active.delete(entry);
        return;
    }
    const p = node.parentElement;
    if (!p || (p.checkVisibility && !p.checkVisibility({ checkOpacity: true, checkVisibilityCSS: true }))) {
        wrap.style.display = 'none';
        return;
    }

    const r = document.createRange();
    try {
        r.setStart(node, start);
        r.setEnd(endNode, Math.min(end, endNode.nodeValue.length));
    } catch {
        wrap.remove();
        active.delete(entry);
        return;
    }
    let rect = r.getBoundingClientRect();
    if (!rect.width && !rect.height) rect = p.getBoundingClientRect();
    if (!rect.width && !rect.height) {
        wrap.style.display = 'none';
        return;
    }

    // Check viewport bounds
    if (rect.bottom < 0 || rect.top > window.innerHeight || rect.right < 0 || rect.left > window.innerWidth) {
        wrap.style.display = 'none';
        return;
    }

    // Check ancestor scroll/overflow clipping
    let cur = p;
    while (cur && cur !== document.body && cur !== document.documentElement) {
        const s = window.getComputedStyle(cur);
        if (s.overflow !== 'visible' || s.overflowX !== 'visible' || s.overflowY !== 'visible') {
            const cr = cur.getBoundingClientRect();
            if (rect.bottom < cr.top || rect.top > cr.bottom || rect.right < cr.left || rect.left > cr.right) {
                wrap.style.display = 'none';
                return;
            }
        }
        cur = cur.parentElement;
    }

    wrap.style.display = 'flex';
    const x = rect.left + (rect.width || 0) / 2;
    const y = rect.top;
    wrap.style.left = `${x - wrap.offsetWidth / 2}px`;
    wrap.style.top = `${y - wrap.offsetHeight - 2}px`;
}

function onAction(entry, parsed) {
    const { wrap, node, start, endNode, end } = entry;
    const r = document.createRange();
    r.setStart(node, start);
    r.setEnd(endNode, end);
    const rawPayload = r.toString().slice(parsed.sigLen);
    let decoded = '';

    if (parsed.cipher === 'PLAIN') {
        try {
            decoded = zwus.decodeToString(rawPayload, parsed.base);
        } catch (e) {
            console.error(e);
        }
    } else {
        const pass = prompt(`in\u00D8sight: enter password (${parsed.cipher}):`);
        if (!pass) return;
        try {
            const arr = zwus.decodeToNumberArray(rawPayload, parsed.base);
            if (parsed.cipher === 'SPECK48_96CTR')
                decoded = speck48_96ctr.decrypt(arr, speck48_96ctr.getKey(pass));
            else if (parsed.cipher === 'SPECK32_64ECB (insecure)')
                decoded = speck32_64ecb.decrypt(arr, speck32_64ecb.getKey(pass));
        } catch (e) {
            console.error(e);
        }
        if (!decoded) {
            alert('Decryption failed.');
            return;
        }
    }

    if (decoded) {
        r.deleteContents();
        const span = document.createElement('span');
        span.className = 'inzerosight-decoded';
        span.style.color = '#00b4d8';
        span.style.fontWeight = '600';
        span.textContent = ` ${decoded} `;
        r.insertNode(span);
        wrap.remove();
        active.delete(entry);
    }
}

function getPayloadRange(node, base, start) {
    let endNode = node;
    let end = getPayloadEnd(node.nodeValue, base, start);

    // Gmail inserts <wbr> elements into long zero-width runs, splitting one payload across text nodes.
    while (end === endNode.nodeValue.length) {
        let next = endNode.nextSibling;
        let hasWbr = false;
        while (next?.nodeType === Node.ELEMENT_NODE && next.tagName === 'WBR') {
            hasWbr = true;
            next = next.nextSibling;
        }
        if (!hasWbr || next?.nodeType !== Node.TEXT_NODE) break;
        const nextEnd = getPayloadEnd(next.nodeValue, base, 0);
        if (!nextEnd) break;
        endNode = next;
        end = nextEnd;
    }
    return { endNode, end };
}

function scanNode(node) {
    if (!node || node.nodeType !== Node.TEXT_NODE) return;
    const val = node.nodeValue;
    if (!val || !val.includes(SIG_PREFIX)) return;

    let idx = 0;
    while (idx < val.length) {
        const sub = val.slice(idx);
        const p = parseSig(sub);
        if (!p) break;
        const start = idx + p.sigIdx;
        const { endNode, end } = getPayloadRange(node, p.base, start + p.sigLen);
        createOverlay(node, p, start, endNode, end);
        idx = endNode === node ? end + 1 : val.length;
    }
}

function scanTree(root) {
    if (!root) return;
    const ign = { SCRIPT: 1, STYLE: 1, TEXTAREA: 1, INPUT: 1, NOSCRIPT: 1, 'IN0-HOST': 1 };
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
        acceptNode: n => (ign[n.parentElement?.tagName] ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT)
    });
    let n;
    while ((n = walker.nextNode())) scanNode(n);
}

scanTree(document.body);

let rafId;
function scheduleUpdate() {
    if (rafId || active.size === 0) return;
    rafId = requestAnimationFrame(() => {
        rafId = null;
        active.forEach(updatePos);
    });
}

const obs = new MutationObserver(muts => {
    for (const e of [...active]) {
        if (!e.node.isConnected || !e.node.nodeValue?.startsWith(SIG_PREFIX, e.start)) {
            e.wrap.remove();
            active.delete(e);
        }
    }
    for (const m of muts) {
        if (m.type === 'characterData') scanNode(m.target);
        else for (const an of m.addedNodes) {
            if (an.nodeType === Node.TEXT_NODE) scanNode(an);
            else if (an.nodeType === Node.ELEMENT_NODE && an.id !== 'in0-host') scanTree(an);
        }
    }
    scheduleUpdate();
});

obs.observe(document.documentElement, { childList: true, subtree: true, characterData: true });

window.addEventListener('scroll', scheduleUpdate, { capture: true, passive: true });
window.addEventListener('resize', scheduleUpdate, { passive: true });
