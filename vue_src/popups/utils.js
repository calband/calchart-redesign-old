/**
 * @file Utility functions for popup components.
 */

import $ from "jquery";
import Vue from "vue";

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
