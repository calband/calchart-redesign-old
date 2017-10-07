/**
 * @file Utility functions for popup components.
 */

/**
 * Mount and display the given popup.
 *
 * @param {BasePopup} Popup
 */
export function showPopup(Popup) {
    let popup = new Popup().$mount();
    $("body").append(popup.$el);
}
