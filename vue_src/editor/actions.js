/**
 * @file Functions for parsing editor actions.
 */

import _ from 'lodash';

import { attempt } from 'utils/JSUtils';

/**
 * A helper to parse arguments. Supports any JSON strings, with the following
 * syntactic helpers:
 *  - a string does not need quotes: `foo(bar)` -> `foo("bar")`
 *  - an object can use python notation:
 *    `foo(bar=1, foo=2)` -> `foo({ bar: 1, foo: 2 })
 *
 * @param {String} arg
 * @return {*}
 */
function parseArg(arg) {
    let json = attempt(() => JSON.parse(arg));
    if (!_.isNull(json)) {
        return json;
    } else if (_.includes(arg, "=")) {
        let o = {};
        _.split(arg, ",").forEach(pair => {
            let [key, val] = _.split(pair, "=");
            o[key] = parseArg(val);
        });
        return o;
    } else {
        // unquoted string
        return arg;
    }
}

/**
 * Parse the given function name.
 *
 * @param {string} name - The function name, in one of the following formats:
 *   - "name": the name of the function, without arguments specified
 *   - "name(arg)": the name of the function, run with the given argument.
 *     See parseArg for the format of the argument.
 * @return {Object}
 *   - {String} name
 *   - {*} data
 */
export default function parseAction(name) {
    let actionMatch = name.match(/^(\w+)(\((.+)\))?$/);

    if (_.isNull(actionMatch)) {
        throw new Error(`Action name in an invalid format: ${name}`);
    }

    let actionName = actionMatch[1];
    let actionArg = null;

    if (actionMatch[2]) {
        actionArg = parseArg(actionMatch[3]);
    }

    return {
        name: actionName,
        data: actionArg,
    };
};
