import * as chacha20 from './chacha20.js';
import { CHACHA20_DECRYPT } from './messages.js';

export function handleMessage(message) {
    if (message?.type !== CHACHA20_DECRYPT) return;
    return chacha20.decrypt(message.numbers, message.password)
        .then(value => ({ ok: true, value }))
        .catch(error => ({ ok: false, error: error.message }));
}

const runtime = globalThis.browser?.runtime || globalThis.chrome?.runtime;
runtime?.onMessage?.addListener((message, _sender, sendResponse) => {
    const pending = handleMessage(message);
    if (!pending) return;
    pending.then(sendResponse);
    return true;
});
