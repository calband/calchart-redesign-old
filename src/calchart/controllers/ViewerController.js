import ApplicationController from "calchart/ApplicationController";
import Grapher from "calchart/Grapher";

/**
 * The controller that stores the state of the viewer application and contains
 * all of the actions that can be run in the viewer page.
 */
export default class ViewerController extends ApplicationController {
    /**
     * @param {Show} show - The show being viewed in the application.
     */
    constructor(show) {
        super(show);

        this._grapher = null;
        this._currSheet = null;
        this._currBeat = null;
    }

    static get shortcuts() {
        return EditorShortcuts;
    }

    init() {
        super.init();

        // let workspace = $(".workspace");
        // this._grapher = new Grapher(this._show, workspace, {
        //     boundDots: true,
        //     drawYardlineNumbers: true,
        //     draw4Step: true,
        //     drawDotType: true,
        //     expandField: true,
        //     showLabels: true,
        //     zoom: 1,
        // });
        // this._grapher.drawField();

        // let sheet = _.first(this._show.getSheets());
        // if (sheet) {
        //     this.loadSheet(sheet);
        // }
    }

    // /**
    //  * Go to the zero-th beat of the sheet.
    //  */
    // firstBeat() {
    //     this._currBeat = 0;
    //     this.refresh("grapher", "context");
    // }

    // /**
    //  * @param {?Sheet} The currently active sheet, or null if there is no active Sheet (i.e.
    //  *   there are no Sheets in the Show).
    //  */
    // getActiveSheet() {
    //     return this._activeSheet;
    // }

    // /**
    //  * @param {int}
    //  */
    // getCurrentBeat() {
    //     return this._currBeat;
    // }

    // /**
    //  * Go to the last beat of the sheet.
    //  */
    // lastBeat() {
    //     this._currBeat = this._activeSheet.getDuration();
    //     this.refresh("grapher", "context");
    // }

    // /**
    //  * Increment the current beat.
    //  */
    // nextBeat() {
    //     this._currBeat++;
    //     let duration = this._activeSheet.getDuration();

    //     if (this._currBeat > duration) {
    //         this._currBeat = duration;
    //     } else {
    //         this.refresh("grapher", "context");
    //     }
    // }

    // /**
    //  * Decrement the current beat.
    //  */
    // prevBeat() {
    //     this._currBeat--;

    //     if (this._currBeat < 0) {
    //         this._currBeat = 0;
    //     } else {
    //         this.refresh("grapher", "context");
    //     }
    // }

    // /**
    //  * Refresh the UI according to the current state of the editor
    //  * and Show.
    //  *
    //  * @param {...String} [targets=all] - The elements to refresh.
    //  *   Elements that can be refreshed:
    //  *     - all
    //  *     - sidebar (default all)
    //  *     - sidebarPreviews (default sidebar)
    //  *     - grapherClear: empties grapher before refreshing
    //  *     - grapher (default all || grapherClear)
    //  *     - context (default all)
    //  */
    // refresh(...targets) {
    //     // targets to refresh
    //     let refresh = {};
    //     refresh.all = targets.includes("all") || targets.length === 0;
    //     refresh.sidebar = refresh.all || targets.includes("sidebar");
    //     refresh.sidebarPreviews = refresh.sidebar || targets.includes("sidebarPreviews");
    //     refresh.grapherClear = targets.includes("grapherClear");
    //     refresh.grapher = refresh.all || refresh.grapherClear || targets.includes("grapher");
    //     refresh.context = refresh.all || targets.includes("context");

    //     let _this = this;
    //     let sidebar = $(".sidebar");

    //     if (refresh.sidebar) {
    //         sidebar.empty();
    //         this._show.getSheets().forEach(sheet => {
    //             let label = HTMLBuilder.span(sheet.getLabel(), "label");

    //             let preview = HTMLBuilder.div("preview");
    //             let $sheet = HTMLBuilder
    //                 .div("stuntsheet", [label, preview], sidebar)
    //                 .data("sheet", sheet);

    //             if (sheet === this._activeSheet) {
    //                 $sheet.addClass("active");
    //             }
    //         });
    //         sidebar.find(".stuntsheet.active").scrollIntoView({
    //             margin: 10,
    //         });
    //     }

    //     if (refresh.sidebarPreviews) {
    //         sidebar.find(".stuntsheet").each(function() {
    //             let sheet = $(this).data("sheet");
    //             let preview = $(this).find(".preview");

    //             // field preview
    //             let grapher = new Grapher(_this._show, preview, {
    //                 drawOrientation: false,
    //                 drawYardlines: false,
    //                 fieldPadding: 5,
    //             })
    //             grapher.draw(sheet);
    //         });
    //     }

    //     // refresh grapher
    //     if (refresh.grapher) {
    //         let selectedDots = this._selectedDots;
    //         if (refresh.grapherClear) {
    //             selectedDots = this.getSelectedDots().map(dot => dot.id);
    //             this._grapher.clear();
    //         }

    //         if (this._activeSheet) {
    //             this._grapher.draw(this._activeSheet, this._currBeat);
    //         } else {
    //             this._grapher.drawField();
    //         }

    //         // this._selectedDots will refer to stale dots after calling grapher.clear()
    //         if (refresh.grapherClear) {
    //             selectedDots = this._grapher.getDots(selectedDots);
    //         }

    //         this._grapher.selectDots(selectedDots);
    //         this._selectedDots = selectedDots;
    //     }

    //     // refresh context
    //     if (refresh.context && this._context) {
    //         this._context.refresh();
    //     }
    // }
}

let EditorShortcuts = {
    "left": "prevBeat",
    "right": "nextBeat",
    "shift+left": "prevSheet",
    "shift+right": "nextSheet",
};
