import ApplicationController from "calchart/ApplicationController";
import Grapher from "calchart/Grapher";

import { round, roundSmall } from "utils/MathUtils";

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
        this._isPlaying = false;

        // cache the cumulative beats for each sheet; i.e. the number of beats
        // until that sheet
        let totalBeats = 0;
        this._cumBeats = show.getSheets().map(sheet => {
            let curr = totalBeats;
            totalBeats += sheet.getDuration();
            return curr;
        });
        this._totalBeats = totalBeats;
    }

    static get shortcuts() {
        return EditorShortcuts;
    }

    init() {
        super.init();

        this._grapher = new Grapher(this._show, $(".viewer"));
        this.refresh();

        this._setupSeek();

        // TODO: set up buttons
        // TODO: set up clicking dots in graph
        // TODO: set up selecting dots in controls
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

        // refresh seek
        let beat = this._getCumulativeBeat();
        let position = $(".seek").width() / this._totalBeats * beat;
        $(".seek .marker").css("transform", `translateX(${position}px)`);
    }

    /**** ANIMATION ****/

    /**
     * Starts animating the show.
     */
    play() {
        // TODO
    }

    /**
     * Stops animating the show.
     */
    stop() {
        // TODO
    }

    /**** CONTROLS ****/

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
     * Set the current beat, setting the corresponding sheet.
     *
     * @param {number} beat - The beat to set.
     */
    setBeat(beat) {
        let [currSheet, currBeat] = this._getSheetAndBeat(beat);

        this._currSheet = currSheet;
        this._currBeat = currBeat;
        this.refresh();
    }

    /**
     * If the show is currently animating, stop the animation. Otherwise,
     * start the animation.
     */
    togglePlay() {
        if (this._isPlaying) {
            // TODO: change icon
            this.stop();
        } else {
            // TODO: change icon
            this.play();
        }
    }

    /**
     * Get the cumulative number of beats for the current sheet and beat
     *
     * @return {number}
     */
    _getCumulativeBeat() {
        let index = this._currSheet.getIndex();
        return this._cumBeats[index] + this._currBeat;
    }

    /**
     * Get the sheet and beat for the given cumulative beat number.
     *
     * @param {number} beat - The cumulative number of beats
     * @return {[Sheet, number]}
     */
    _getSheetAndBeat(beat) {
        let sheet = this._show.getSheets()[0];

        while (beat > sheet.getDuration()) {
            beat -= sheet.getDuration();
            sheet = sheet.getNextSheet();
        }

        return [sheet, beat];
    }

    /**
     * Set up the seekbar
     */
    _setupSeek() {
        let seek = $(".controls .seek");
        let marker = seek.find(".marker");
        let markerRadius = marker.width() / 2;
        let seekLeft = seek.offset().left;
        let seekWidth = seek.width();
        let interval = seekWidth / this._totalBeats;

        let updateSeek = pageX => {
            let prev = marker.offset().left;

            // snap to beat
            let x = _.clamp(pageX - seekLeft - markerRadius, 0, seekWidth);
            let beat = roundSmall(round(x, interval) / interval);

            // don't redraw screen if the beat didn't change
            if (x !== prev) {
                this.setBeat(beat);
            }
        };

        seek.mousedown(e => {
            e.preventDefault();
            updateSeek(e.pageX);

            $(document).on({
                "mousemove.seek": e => {
                    updateSeek(e.pageX);
                },
                "mouseup.seek": e => {
                    $(document).off(".seek");
                },
            });
        });
    }
}

let EditorShortcuts = {
    "left": "prevBeat",
    "right": "nextBeat",
    "shift+left": "prevSheet",
    "shift+right": "nextSheet",
    "space": "togglePlay", // TODO: add space to shortcut keys
};
