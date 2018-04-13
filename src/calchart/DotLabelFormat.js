/**
 * @file Defines the DotLabelFormat enum.
 */

import { range } from 'lodash';

import Enum from 'utils/Enum';

export default class DotLabelFormat extends Enum {
    /**
     * Get the dot labels for the given number of dots.
     *
     * @param {int} numDots
     * @return {string[]}
     */
    getDotLabels(numDots) {
        return range(numDots).map(this.getLabel);
    }

    /**
     * Get the label for the given dot number.
     *
     * @param {number} n
     * @return {string}
     */
    getLabel(n) {
        switch (this) {
            case this.constructor.COMBO: {
                // 65 = 'A'
                let charCode = 65 + (n / 10);
                let num = n % 10;
                return String.fromCharCode(charCode) + num;
            }
            case this.constructor.NUMBER: {
                return String(n);
            }
        }
    }
}

DotLabelFormat.initEnum([
    { value: 'combo', label: 'A0, A1, A2, ...' },
    { value: 'number', label: '1, 2, 3, ...' },
]);
