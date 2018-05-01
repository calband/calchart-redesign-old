/**
 * @file The entrypoint for the popups package.
 */

import $ from 'jquery';

const PopupPlugin = {
    install: Vue => {
        Vue.mixin({
            methods: {
                /**
                 * Mount and display the given popup.
                 *
                 * @param {BasePopup} component
                 */
                showPopup(component) {
                    // don't open another popup
                    if ($('.popup-wrapper').length > 0) {
                        return;
                    }

                    let PopupComponent = Vue.extend(component);
                    let popup = new PopupComponent().$mount();
                    popup.open();
                },
            },
        });
    },
};
export default PopupPlugin;
