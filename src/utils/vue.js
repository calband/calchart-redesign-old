/**
 * @file Utility and helper functions for Vue components.
 */

import { each } from 'lodash';

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
