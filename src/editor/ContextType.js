/**
 * @file Defines the ContextType enum.
 *
 * The enum contains the different editor contexts that can be toggled. A
 * context can be thought of as a page or a view. Different contexts will show
 * different sidebars and potentially different layouts of the screen.
 *
 * We use this idea of contexts so that components like the Grapher can be the
 * same for both contexts and maintain its state.
 */

import Enum from 'utils/Enum';

export default class ContextType extends Enum {
}

ContextType.initEnum([
    'formation',
    'flow',
]);
