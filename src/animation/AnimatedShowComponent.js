import Sound from "animation/Sound";
import Grapher from "graphers/Grapher";

import HTMLBuilder from "utils/HTMLBuilder";
import { round, roundSmall } from "utils/MathUtils";
import { setupTooltip } from "utils/UIUtils";

/**
 * A component for drawing a graph and controls that can step through
 * or animate a Show in the graph.
 */
export default class AnimatedShowComponent {
    /**
     * @param {Show} show
     * @param {jQuery} target - The HTML element to draw the component in.
     * @param {function} [refresh] - An optional callback to run whenever a
     *   refresh is required.
     */
    constructor(show, target, refresh) {
        this._show = show;
        this._target = target;
        this._refresh = refresh;

        this._grapher = null;
        this._sound = null;

        this._currSheet = show.getSheet(0);
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

    /**
     * Keyboard shortcuts for the component. Components that use this component
     * should include a `doAnimate` function that runs the provided action in
     * their AnimatedShowComponent instance.
     */
    static get shortcuts() {
        return ComponentShortcuts;
    }

    /**
     * Initialize the component.
     */
    init() {
        // grapher
        let grapherTarget = HTMLBuilder.div("animated-grapher")
            .appendTo(this._target);
        this._grapher = new Grapher(this._show, grapherTarget, {
            onZoom: grapher => {
                this.refresh();
            },
            zoomable: true,
        });

        // seek bar
        this._setupSeek();

        // controls
        let prevSheet = HTMLBuilder.icon("fast-backward", "prev-sheet")
            .click(e => this.prevSheet());
        setupTooltip(prevSheet, "Previous Sheet");
        let prevBeat = HTMLBuilder.icon("step-backward", "prev-beat")
            .click(e => this.prevBeat());
        setupTooltip(prevBeat, "Previous Beat");
        let play = HTMLBuilder.icon("play", "toggle-play disabled")
            .click(e => {
                if (!$(e.target).hasClass("disabled")) {
                    this.togglePlay();
                }
            });
        setupTooltip(play, "Animate");
        let nextBeat = HTMLBuilder.icon("step-forward", "next-beat")
            .click(e => this.nextBeat());
        setupTooltip(nextBeat, "Next Beat");
        let nextSheet = HTMLBuilder.icon("fast-forward", "next-sheet")
            .click(e => this.nextSheet());
        setupTooltip(nextSheet, "Next Sheet");

        HTMLBuilder.div("controls", [prevSheet, prevBeat, play, nextBeat, nextSheet])
            .appendTo(this._target);

        this.loadSound();
        this.refresh();
    }

    get grapher() {
        return this._grapher;
    }

    /**** METHODS ****/

    /**
     * @return {int} The current beat.
     */
    getBeat() {
        return this._currBeat;
    }

    /**
     * @return {Sheet} The current sheet.
     */
    getSheet() {
        return this._currSheet;
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

        // refresh grapher
        this._grapher.draw(this._currSheet, this._currBeat);

        // refresh seek bar
        let beat = this._getCumulativeBeat();
        let position = this._target.find(".seek").width() / this._totalBeats * beat;
        this._target.find(".seek .marker").css("transform", `translateX(${position}px)`);

        // run the refresh callback
        if (this._refresh) {
            this._refresh();
        }
    }

    /**
     * Load the show's beats data into the sound..
     */
    loadBeats() {
        this._sound.loadBeats(this._show.getBeats());
    }

    /**
     * Load a sound object according to the show's audio URL.
     */
    loadSound() {
        if (this._sound) {
            this._sound.destruct();
        }
        let playButton = this._target.find(".toggle-play");
        playButton.addClass("disabled");

        let audio = this._show.getAudioUrl();
        this._sound = new Sound(audio, {
            onload: () => {
                playButton.removeClass("disabled");
            },
            nextBeat: () => {
                this.nextBeat();
            },
            finished: () => {
                this.stop();
            },
        });
        this.loadBeats();
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
            this._currSheet = nextSheet;
        }

        this.refresh();
    }

    /**
     * Decrement the current beat.
     */
    prevBeat() {
        if (this._currBeat === 0) {
            if (this._currSheet.isFirstSheet()) {
                this._currBeat = 0;
            } else {
                this.prevSheet();
                this._currBeat = this._currSheet.getDuration() - 1;
            }
        } else {
            this._currBeat--;
        }

        this.refresh();
    }

    /**
     * Decrement the current sheet.
     */
    prevSheet() {
        if (this._currBeat === 0) {
            let prevSheet = this._currSheet.getPrevSheet();
            if (prevSheet) {
                this._currSheet = prevSheet;
            }
        } else {
            // if in the middle a sheet, go to the beginning of
            // the sheet first
            this._currBeat = 0;
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
        let playButton = this._target.find(".toggle-play");
        if (playButton.hasClass("disabled")) {
            return;
        }

        playButton.removeClassRegex(/icon-*/);

        if (this._isPlaying) {
            this.stop();
        } else {
            this.play();
        }
    }

    /**** ANIMATION ****/

    /**
     * Starts animating the show.
     */
    play() {
        let beatTime = 0;
        let beat = 0;
        let beats = this._show.getBeats();

        if (this._currBeat >= beats.length) {
            this.stop();
            return;
        }

        while (beat < this._currBeat) {
            beatTime += beats[beat];
            beat++;
        }

        this._sound.play(beatTime);

        // make paused icon
        this._target.find(".toggle-play").addClass("icon-pause");
        this._isPlaying = true;
    }

    /**
     * Stops animating the show.
     */
    stop() {
        this._sound.stop();

        // make play icon
        this._target.find(".toggle-play").addClass("icon-play");
        this._isPlaying = false;
    }

    /**** HELPERS ****/

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
        let sheet = this._show.getSheet(0);

        while (beat > sheet.getDuration()) {
            beat -= sheet.getDuration();
            sheet = sheet.getNextSheet();
        }

        return [sheet, beat];
    }

    /**
     * Set up the seekbar.
     */
    _setupSeek() {
        let bar = HTMLBuilder.make("span.bar");
        let marker = HTMLBuilder.make("span.marker");
        let seek = HTMLBuilder.div("seek", [bar, marker])
            .appendTo(this._target);

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

let ComponentShortcuts = {
    "left": "doAnimate(prevBeat)",
    "right": "doAnimate(nextBeat)",
    "shift+left": "doAnimate(prevSheet)",
    "shift+right": "doAnimate(nextSheet)",
    "space": "doAnimate(togglePlay)",
};
