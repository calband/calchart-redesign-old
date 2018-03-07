/**
 * @file Actions that are saved in History.
 */

import Sheet from 'calchart/Sheet';

/**
 * Add a Sheet to the Show.
 *
 * @param {int} numBeats - The number of beats for the Sheet.
 */
export function addSheet(context, { numBeats }) {
    let show = context.rootState.show;
    let index = show.getSheets().length;
    let numDots = show.getDots().length;
    let sheet = Sheet.create(show, index, numBeats, numDots);

    context.commit('modifyShow', {
        func: 'addSheet',
        args: [sheet],
    }, { root: true });
    context.commit('setActiveSheet', sheet);
}
