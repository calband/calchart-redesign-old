import DotType from "calchart/DotType";
import BasePanel from "panels/BasePanel";

import { STATIC_PATH } from "utils/env";
import HTMLBuilder from "utils/HTMLBuilder";

export default class DotPanel extends BasePanel {
    /**
     * @param {DotContext} context
     */
    constructor(context) {
        super(context);

        // {Dot} track last dot selected
        this._lastSelected = null;
    }

    refresh() {
        // highlight dots in panel
        let dotLabels = this._panel.find(".dot-labels");
        dotLabels.find(".active").removeClass("active");
        this._context.getSelectedDots().forEach(dot => {
            dotLabels.find(`.dot-${dot.id}`).addClass("active");
        });
    }

    getContent() {
        let dotTypes = HTMLBuilder.make("ul.dot-types");
        DotType.forEach(type => {
            if (DotType.isAll(type)) {
                return;
            }

            let icon = HTMLBuilder.img(`${STATIC_PATH}/img/dot-${type}.png`);
            HTMLBuilder.li()
                .append(icon)
                .appendTo(dotTypes)
                .click(e => {
                    let dots = this._context.activeSheet.getDotsOfType(type);
                    let $dots = this._context.grapher.getDots(dots);
                    this._context.selectDots($dots, {
                        append: e.shiftKey || e.ctrlKey || e.metaKey,
                    });
                });
        });

        let dotLabels = HTMLBuilder.make("ul.dot-labels");
        this._context.show.getDots().forEach(dot => {
            HTMLBuilder.li(dot.label)
                .addClass(`dot-${dot.id}`)
                .click(e => {
                    let $dot = this._context.grapher.getDot(dot);
                    if (e.ctrlKey || e.metaKey) {
                        this._context.toggleDots($dot);

                        if ($(e.currentTarget).hasClass("active")) {
                            this._lastSelected = dot;
                        } else {
                            this._lastSelected = null;
                        }
                    } else if (e.shiftKey && this._lastSelected) {
                        let delta = Math.sign(dot.id - this._lastSelected.id);
                        let curr = this._lastSelected.id;
                        let range = this._context.grapher.getDot(curr);

                        while (curr !== dot.id) {
                            curr += delta;
                            range = range.add(this._context.grapher.getDot(curr));
                        }

                        this._context.selectDots(range);
                        this._lastSelected = dot;
                    } else {
                        this._context.selectDots($dot, {
                            append: false,
                        });
                        this._lastSelected = dot;
                    }
                })
                .appendTo(dotLabels);
        });

        return [dotTypes, dotLabels];
    }
}
