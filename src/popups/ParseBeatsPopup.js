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
     * @param {File} file - The beats audio file.
     */
    constructor(file) {
        super();

        this._file = file;

        // {jQuery}
        this._status = null;

        // {OfflineAudioContext}
        this._context = null;

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

        return [title, this._status, threshold, maxBpm];
    }

    onInit() {
        let audioCtx = new AudioContext();
        let reader = new FileReader();
        reader.onload = e => {
            audioCtx.decodeAudioData(reader.result, buffer => {
                this._context = new OfflineAudioContext(2, buffer.length, SAMPLE_RATE);
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

        // TODO: fix analyzing again
        let source = this._context.createBufferSource();
        source.buffer = this._buffer;
        source.connect(this._context.destination);
        source.onended = e => {
            source.disconnect(this._context.destination);
        };
        source.start();

        this._context.startRendering().then(buffer => {
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

        // if a beat is detected at sample X, the next beat will be at
        // at least X + samplesPerBeat.
        let samplesPerBeat = (60 / this._maxBpm) * SAMPLE_RATE;

        while (i < data.length) {
            let sample = data[i];
            if (Math.abs(sample) > this._threshold) {
                beats.push(i);
                i += samplesPerBeat;
            } else {
                i++;
            }
        }

        console.log(beats);
        this._status.text(`Done: ${beats.length} beats detected.`);
    }
}
