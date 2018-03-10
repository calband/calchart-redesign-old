/**
 * @file The entrypoint for the popups package.
 */

import Vue from 'vue';

export { default as BasePopup } from './BasePopup';
export { default as FormPopup } from './FormPopup';

/**
 * Mount and display the given popup.
 *
 * @param {BasePopup} Popup
 */
export function showPopup(Popup) {
    let PopupComponent = Vue.extend(Popup);
    let popup = new PopupComponent().$mount();
    popup.open();
}
