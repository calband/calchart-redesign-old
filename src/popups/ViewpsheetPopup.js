import Grapher from "calchart/Grapher";
import MovementCommandArc from "calchart/movements/MovementCommandArc";
import BasePopup from "popups/BasePopup";

import HTMLBuilder from "utils/HTMLBuilder";
import { setupTooltip } from "utils/UIUtils";

/**
 * The popup containing the viewpsheet to be previewed and downloaded.
 */
export default class ViewpsheetPopup extends BasePopup {
    /**
     * @param {ViewerController} controller
     */
    constructor(controller) {
        super();

        this._controller = controller;
        this._dot = controller.getDot();
    }

    get info() {
        return {
            name: "viewpsheet",
            title: `Viewpsheet for ${this._dot.label}`,
        };
    }

    show() {
        super.show();

        _.each(this._popup.find(".sheet"), sheet => {
            let info = $(sheet).data("sheet").getDotInfo(this._dot);
            let path = $(sheet).find(".individual-path");

            let pathGrapher = new Grapher(this._controller.show, path);
            pathGrapher.drawField();
            this._drawPath(pathGrapher, info);
        });

        this.loadSheet(this._popup.find(".sheet:first"));
    }

    getContent() {
        let sheets = this._controller.show.getSheets();

        let svgs = sheets.map(sheet => {
            let info = sheet.getDotInfo(this._dot);

            let label = HTMLBuilder.make("h2", `SS ${sheet.getLabel()}`);

            let continuities = HTMLBuilder.make("ul.continuities");
            sheet.getContinuities(info.type).forEach(continuity => {
                let text = continuity.getText();
                text.split("\n").forEach(line => {
                    HTMLBuilder.li(line, "continuity")
                        .appendTo(continuities);
                });
            });

            let movements = HTMLBuilder.make("ul.movements");
            info.movements.forEach(movement => {
                let text = movement.getText();
                HTMLBuilder.li(text, "movement")
                    .appendTo(movements);
            });

            let path = HTMLBuilder.div("individual-path");

            // individual path
            // whole formation with dot type

            return HTMLBuilder.div("sheet", [
                label,
                HTMLBuilder.div("text", [continuities, movements]),
                path,
            ]).data("sheet", sheet);
        });

        let controls = [
            HTMLBuilder.icon("arrow-left", "prev-sheet"),
            HTMLBuilder.icon("arrow-right", "next-sheet"),
        ];

        let buttons = [
            HTMLBuilder.make("button.download", "Download"),
            HTMLBuilder.make("button.close", "Close"),
        ];

        return [
            HTMLBuilder.div("sheets", svgs),
            HTMLBuilder.div("controls", controls),
            HTMLBuilder.div("buttons", buttons),
        ];
    }

    onInit() {
        this._popup.find(".controls .prev-sheet").click(e => {
            let sheet = this._popup.find(".sheet:visible").prev();
            if (sheet.exists()) {
                this.loadSheet(sheet);
            }
        });

        this._popup.find(".controls .next-sheet").click(e => {
            let sheet = this._popup.find(".sheet:visible").next();
            if (sheet.exists()) {
                this.loadSheet(sheet);
            }
        });

        this._popup.find("button.download").click(e => {
            // TODO
        });

        this._popup.find("button.close").click(e => {
            this.hide();
        });
    }

    /**
     * Load the given sheet in the popup.
     *
     * @param {jQuery} sheet
     */
    loadSheet(sheet) {
        this._popup.find(".sheet").hide();
        sheet.show();
    }

    /**** HELPERS ****/

    /**
     * Draw the given movements onto the grapher.
     *
     * @param {Grapher} grapher
     * @param {object} info - Info from Sheet.getDotInfo
     */
    _drawPath(grapher, info) {
        let path = grapher.getSVG()
            .append("path")
            .classed("path-movements", true);

        let scale = grapher.getScale();
        let position = scale.toDistance(info.position);
        let pathDef = `M ${position.x} ${position.y}`;

        info.movements.forEach(movement => {
            if (movement instanceof MovementCommandArc) {
                let arcPath = movement.getPathDef(scale);
                pathDef += ` ${arcPath}`;
            } else {
                let position = scale.toDistance(movement.getEndPosition());
                pathDef += ` L ${position.x} ${position.y}`;
            }
        });

        path.attr("d", pathDef);

        // TODO: add start/stop markers

        // TODO: start grapher zoomed-in
    }
}
