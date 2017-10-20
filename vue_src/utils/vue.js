/**
 * @file Utility and helper functions for Vue components.
 */

import _ from "lodash";

/**
 * @type {Object} An object that the application can register Vue
 *   instances to.
 */
let $vms = window.$vms = {};
export { $vms };

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
