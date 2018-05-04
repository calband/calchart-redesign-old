/**
 * @file Utility and helper functions for Vue components.
 */

import { each, has } from 'lodash';

/**
 * A plugin to activate the `constants` component option.
 */
export let ConstantsPlugin = {
    install: Vue => {
        Vue.mixin({
            created() {
                each(this.$options.constants, (val, key) => {
                    this[key] = val;
                });
            },
        });
    },
};

/**
 * Check that the given component is, indeed, a Vue component.
 *
 * @param {Object} component
 * @return {boolean}
 */
export function isVue(component) {
    return has(component, 'render');
}
