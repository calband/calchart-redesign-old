import _ from 'lodash';

import { attempt } from 'utils/JSUtils';

/**
 * Parse the given function name.
 *
 * @param {string} name - The function name, in one of the following formats:
 *   - "name": the name of the function, without arguments specified
 *   - "name(arg)": the name of the function, run with the given argument.
 *     Arguments can be given in the following formats:
 *       - a number; e.g. "foo(1)" -> `foo(1)`
 *       - a boolean; e.g. "foo(true)" -> `foo(true)`
 *       - a string; e.g. "foo(bar)" -> `foo("bar")`
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
        actionArg = actionMatch[3];
        let json = attempt(() => JSON.parse(actionArg));
        if (!_.isNull(json)) {
            actionArg = json;
        }
    }

    return {
        name: actionName,
        data: actionArg,
    };
};
