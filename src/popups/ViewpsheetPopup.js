import Grapher from "calchart/Grapher";
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
        };
    }

    show() {
        super.show();

        _.each(this._popup.find(".sheet"), $sheet => {
            let sheet = $($sheet).data("sheet");
            let path = $($sheet).find(".individual-path");
            let pathGrapher = new Grapher(this._controller.show, path, {
                // TODO: four step, yardlines, zoomable
            });
            pathGrapher.drawPath(sheet, this._dot);
        });

        this.loadSheet(this._popup.find(".sheet:first"));
    }

    getContent() {
        let sheets = this._controller.show.getSheets();

        let svgs = sheets.map(sheet => {
            let info = sheet.getDotInfo(this._dot);

            let title = `Dot ${this._dot.label}: SS ${sheet.getLabel()}`;
            let header = HTMLBuilder.make("h2", title);

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

            // TODO: whole formation with dot type

            return HTMLBuilder.div("sheet", [
                header,
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
            // TODO: download pdf
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
}
