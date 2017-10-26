/**
 * @file Utility and helper functions for Vue components.
 */

import _ from 'lodash';

/**
 * @type {Proxy<Vue>} A proxy to the root Vue instance.
 */
export let $root = new Proxy({ vm: null }, {
    get: (target, name) => {
        if (_.isNull(target.vm)) {
            throw new Error('Root Vue instance not initialized yet.');
        } else {
            return target.vm[name];
        }
    },
});

/**
 * Register the given Vue instance under the given name.
 *
 * @param {String} name - The name of the vue instance
 * @param {Vue} vm
 */
export function setRoot(vm) {
    $root.vm = vm;
}

/**
 * A function to be used as a computed function for a component, that
 * will return an Object containing all the values of the props passed
 * to the component.
 *
 * @return {Object}
 */
export function allProps() {
    return _.clone(this.$props);
}
