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
        this._currSheet = show.getSheets()[0];
        this._currBeat = 0;
    }

    static get shortcuts() {
        return EditorShortcuts;
    }

    init() {
        super.init();

        this._grapher = new Grapher(this._show, $(".viewer"));
        this.refresh();

        // TODO: set up seek bar
        // TODO: set up buttons
        // TODO: set up clicking dots in graph
        // TODO: set up selecting dots in controls
    }

    /**
     * Increment the current beat.
     */
    nextBeat() {
        this._currBeat++;

        if (this._currBeat === this._currSheet.getDuration()) {
            this.nextSheet();
        } else {
            this.refresh();
        }
    }

    /**
     * Increment the current sheet.
     */
    nextSheet() {
        let nextSheet = this._currSheet.getNextSheet();

        if (_.isNull(nextSheet)) {
            // currently on last sheet; go to last beat
            this._currBeat = this._currSheet.getDuration() - 1;
        } else {
            this._currBeat = 0;
            this._currSheet = this._currSheet.getNextSheet();
        }

        this.refresh();
    }

    /**
     * Decrement the current beat.
     */
    prevBeat() {
        this._currBeat--;

        if (this._currBeat < 0) {
            let prevSheet = this._currSheet.getPrevSheet();
            if (_.isNull(prevSheet)) {
                // currently on first sheet; go to first beat
                this._currBeat = 0;
            } else {
                this._currBeat = prevSheet.getDuration() - 1;
                this._currSheet = prevSheet;
            }
        }

        this.refresh();
    }

    /**
     * Decrement the current sheet.
     */
    prevSheet() {
        this._currBeat = 0;
        let prevSheet = this._currSheet.getPrevSheet();

        if (!_.isNull(prevSheet)) {
            this._currSheet = prevSheet;
        }

        this.refresh();
    }

    /**
     * Refresh the UI according to the current state of the viewer
     * and Show.
     */
    refresh() {
        if (_.isUndefined(this._currSheet)) {
            this._grapher.drawField();
            return;
        }

        this._grapher.draw(this._currSheet, this._currBeat);
        $(".details .sheet").text(this._currSheet.getLabel());
        let beatNum = this._currBeat === 0 ? "Hup" : this._currBeat;
        $(".details .beat-num").text(beatNum);
        $(".details .beat-total").text(this._currSheet.getDuration());
    }
}

let EditorShortcuts = {
    "left": "prevBeat",
    "right": "nextBeat",
    "shift+left": "prevSheet",
    "shift+right": "nextSheet",
    "space": "togglePlay", // TODO: add space to shortcut keys
};
