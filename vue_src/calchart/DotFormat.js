import { range } from 'lodash';

import makeEnum from 'utils/enum';

/**
 * An Enum containing all the possible dot label formats.
 */
export default class DotFormat {
    /**
     * Return the dot labels for the given number of dots.
     *
     * @param {string} dotFormat - The format of the label. @see DOT_FORMATS.
     * @param {int} numDots - The number of dots to make labels for.
     * @return {string[]} The labels of the dots.
     */
    getDotLabels(numDots) {
        return range(numDots).map(this.getLabel);
    }
}

makeEnum(DotFormat, [
    {
        value: 'combo',
        label: 'A0, A1, A2, ...',
        getLabel: n => {
            // 65 = 'A'
            let charCode = 65 + (n / 10);
            let num = n % 10;
            return String.fromCharCode(charCode) + num;
        },
    },
    {
        value: 'number',
        label: '1, 2, 3, ...',
        getLabel: String,
    },
]);
