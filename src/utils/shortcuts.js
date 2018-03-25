/**
 * @file Functions related to shortcut parsing.
 */

import { defaultTo } from 'lodash';
import store from 'store';

let shortcutMap, shortcutSep;
if (store.state.env.IS_MAC) {
    // HTML codes: http://apple.stackexchange.com/a/55729
    shortcutMap = {
        ctrl: '&#8984;',
        alt: '&#8997;',
        shift: '&#8679;',
        backspace: '&#9003;',
        tab: '&#8677;',
        enter: '&crarr;',
        left: '&larr;',
        up: '&uarr;',
        right: '&rarr;',
        down: '&darr;',
        delete: '&#8998;',
    };
    shortcutSep = '';
} else {
    shortcutMap = {
        ctrl: 'Ctrl',
        alt: 'Alt',
        shift: 'Shift',
        backspace: 'Backspace',
        tab: 'Tab',
        enter: 'Enter',
        left: 'Left',
        up: 'Up',
        right: 'Right',
        down: 'Down',
        delete: 'Del',
    };
    shortcutSep = '+';
}

/**
 * Convert the given shortcut key binding to a human readable hint.
 *
 * @param {string} shortcut - The shortcut key binding, e.g. 'ctrl+s'
 * @return {string} The human readable shortcut hint
 */
export function convertShortcut(shortcut) {
    return shortcut.split('+').map(key => {
        return defaultTo(shortcutMap[key], key.toUpperCase());
    }).join(shortcutSep);
}
