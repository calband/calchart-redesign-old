import BasePopup from "popups/BasePopup";

import { CharField, NumberField } from "utils/fields";
import HTMLBuilder from "utils/HTMLBuilder";
import { validatePositive } from "utils/JSUtils";
import { setupTooltip } from "utils/UIUtils";

// samples per second
const SAMPLE_RATE = 44100;

/**
 * The popup to parse beats from an audio file.
 */
export default class ParseBeatsPopup extends BasePopup {
    /**
     * @param {MusicContext} context
     * @param {File} file - The beats audio file.
     */
    constructor(context, file) {
        super();

        this._controller = context.controller;
        this._file = file;

        // {number[]}
        this._beats = null;

        // {jQuery}
        this._status = null;

        // {AudioBuffer}
        this._buffer = null;

        // {number} a sample must be above this value to count as a "beat"
        this._threshold = 0.005;

        // {number} the maximum bpm of the show
        this._maxBpm = 300;
    }

    get info() {
        return {
            name: "parse-beats",
        };
    }

    getContent() {
        let title = HTMLBuilder.make("h1", "Parse Beats Audio");
        this._status = HTMLBuilder.make("p");

        let threshold = new CharField("threshold", {
            initial: this._threshold,
        }).render();
        threshold.find("input").change(e => {
            let input = $(e.target);
            let val = parseFloat(input.val());
            if (val < 0) {
                input.val(0);
                this._threshold = 0;
            } else {
                this._threshold = val;
            }

            this.startAnalyzing();
        });
        setupTooltip(threshold.find("label"), "Value of audio sample to count as a 'beat'");

        let maxBpm = new NumberField("maxBpm", {
            label: "Max BPM",
            initial: this._maxBpm,
        }).render();
        maxBpm.find("input").change(e => {
            this._maxBpm = validatePositive(e.currentTarget);
            this.startAnalyzing();
        });
        setupTooltip(maxBpm.find("label"), "The max BPM in the show");

        let button = HTMLBuilder.make("button", "Save").click(e => {
            this._controller.doAction("saveBeats", [this._beats]);
            this.hide();
        });

        return [title, this._status, threshold, maxBpm, button];
    }

    onInit() {
        let audioCtx = new AudioContext();
        let reader = new FileReader();
        reader.onload = e => {
            audioCtx.decodeAudioData(reader.result, buffer => {
                this._buffer = buffer;
                this.startAnalyzing();
            });
        };
        reader.readAsArrayBuffer(this._file);
    }

    /**** METHODS ****/

    /**
     * Trigger analyzing of the beats audio file.
     */
    startAnalyzing() {
        if (_.isNull(this._buffer)) {
            return;
        }

        let context = new OfflineAudioContext(2, this._buffer.length, SAMPLE_RATE);
        let source = context.createBufferSource();
        source.buffer = this._buffer;
        source.connect(context.destination);
        source.onended = e => {
            source.disconnect(context.destination);
        };
        source.start();

        context.startRendering().then(buffer => {
            let data = buffer.getChannelData(0);
            this._parseBeats(data);
        });
    }

    /**** HELPERS ****/

    /**
     * Parse beats in the given channel data.
     *
     * @param {Float32Array} data
     */
    _parseBeats(data) {
        this._status.text("Analyzing...");

        let i = 0;
        let beats = [];
        let cumulative = 0;

        // if a beat is detected at sample X, the next beat will be at
        // at least X + samplesPerBeat.
        let samplesPerBeat = (60 / this._maxBpm) * SAMPLE_RATE;

        while (i < data.length) {
            let sample = data[i];
            if (Math.abs(sample) > this._threshold) {
                // milliseconds from previous beat to this beat
                let ms = (i / SAMPLE_RATE * 1000) - cumulative;
                // round to nearest millisecond
                ms = Math.round(ms);
                beats.push(ms);
                cumulative += ms;
                i += samplesPerBeat;
            } else {
                i++;
            }
        }

        this._beats = beats;
        this._status.text(`Done: ${beats.length} beats detected.`);
    }
}
