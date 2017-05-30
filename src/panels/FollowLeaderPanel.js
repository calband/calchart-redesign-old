import BasePanel from "panels/BasePanel";

import HTMLBuilder from "utils/HTMLBuilder";

export default class FollowLeaderPanel extends BasePanel {
    get name() {
        return "ftl-path";
    }

    refresh() {
        // populate panel
        let list = this._panel.find(".ftl-path-points").empty();
        this._context.continuity.getPath().forEach((coordinate, i) => {
            let point = this._context.svg.select(`.point-${i}`);
            let label = `(${coordinate.x}, ${coordinate.y})`;

            HTMLBuilder.li(label, "point")
                .data("coordinate", coordinate)
                .appendTo(list)
                .mouseenter(e => {
                    point.classed("highlight", true);
                })
                .mouseleave(e => {
                    point.classed("highlight", false);
                });
        });

        this._panel.keepOnscreen();
    }

    getContent() {
        let submitButton = HTMLBuilder.make("button.submit")
            .append(HTMLBuilder.icon("check"))
            .click(e => {
                this._context.exit();
            });

        let list = HTMLBuilder.make("ul.ftl-path-points")
            .sortable({
                containment: this._panel,
                update: () => {
                    let path = _.map(list.children(), point => $(point).data("coordinate"));
                    this._context.controller.doAction("setPath", [path]);
                },
            });

        return [
            list,
            HTMLBuilder.div("buttons", [submitButton]),
        ];
    }
}
