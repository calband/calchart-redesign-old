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
    }

    get info() {
        let dot = this._controller.getDot();
        return {
            name: "viewpsheet",
            title: `Viewpsheet for ${dot.label}`,
        };
    }

    getContent() {
        let dot = this._controller.getDot();
        let sheets = this._controller.show.getSheets();

        let svgs = sheets.map(sheet => {
            let info = sheet.getDotInfo(dot);
            // render SVG for sheet's viewpsheet
        });

        let controls = [
            HTMLBuilder.icon("arrow-left"),
            HTMLBuilder.icon("arrow-right"),
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
}
