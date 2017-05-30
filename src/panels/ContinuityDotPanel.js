import BasePanel from "panels/BasePanel";

import HTMLBuilder from "utils/HTMLBuilder";

export default class ContinuityDotsPanel extends BasePanel {
    get name() {
        return "edit-continuity-dots";
    }

    refresh() {
        // re-order dots on every refresh
        let list = this._panel.find(".dot-order");
        this._getDots().forEach(dot => {
            let li = list.find(`li.dot-${dot.id}`);
            list.append(li);
        });
    }

    getContent() {
        let reverseButton = HTMLBuilder.make("button.flip")
            .append(HTMLBuilder.icon("reverse"))
            .click(e => {
                this._context.controller.doAction("reverseDotOrder");
            });
        let submitButton = HTMLBuilder.make("button.submit")
            .append(HTMLBuilder.icon("check"))
            .click(e => {
                this._context.exit();
            });
            

        let list = HTMLBuilder.make("ul.dot-order")
            .sortable({
                containment: this._panel,
                update: () => {
                    let order = _.map(list.children(), dot => $(dot).data("dot"));
                    this._context.controller.doAction("changeDotOrder", [order]);
                },
            });

        this._getDots().forEach(dot => {
            let $dot = this._context.grapher.getDot(dot);

            HTMLBuilder.li(dot.label, `dot dot-${dot.id}`)
                .data("dot", dot)
                .appendTo(list)
                .mouseenter(e => {
                    this._context.selectDots($dot);
                })
                .mouseleave(e => {
                    this._context.deselectDots($dot);
                });
        });

        return [
            list,
            HTMLBuilder.div("buttons", [reverseButton, submitButton]),
        ];
    }

    /**** HELPERS ****/

    /**
     * @return {Dot[]} The ordered dots in the continuity.
     */
    _getDots() {
        return this._context.continuity.getOrder();
    }
}
