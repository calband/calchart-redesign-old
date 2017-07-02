import UploadAudioAction from "actions/UploadAudioAction";
import Song from "calchart/Song";
import BaseContext from "editor/contexts/BaseContext";
import Grapher from "graphers/Grapher";
import { MusicContextMenus as menus } from "menus/EditorContextMenus";
import AddSongPopup from "popups/AddSongPopup";
import EditSongPopup from "popups/EditSongPopup";
import ParseBeatsPopup from "popups/ParseBeatsPopup";

import { AUDIO_EXTENSIONS } from "utils/CalchartUtils";
import HTMLBuilder from "utils/HTMLBuilder";
import { underscoreKeys, update } from "utils/JSUtils";
import { round, roundSmall } from "utils/MathUtils";
import { promptFile, showError } from "utils/UIUtils";

/**
 * The Context that allows a user to edit the songs, audio, and music
 * animation in the show.
 */
export default class MusicContext extends BaseContext {
    constructor(controller) {
        super(controller);

        this._activeSong = _.first(this.show.getSongs());

        this._grapher = null;
        this._grapherState = {
            sheet: _.first(this.show.getSheets()),
            beat: 0,
        };
        this._isPlaying = false;
        this._cumBeats = [];
        this._totalBeats = null;
    }

    static get shortcuts() {
        return ContextShortcuts;
    }

    static get actions() {
        return ContextActions;
    }

    static get name() {
        return "music";
    }

    static get refreshTargets() {
        return _.concat(super.refreshTargets, "panels", "preview", "workspace");
    }

    get songPanel() {
        return $(".music-content .song-list");
    }

    get sheetPanel() {
        return $(".music-content .sheet-list");
    }

    get workspace() {
        return $(".music-content .workspace");
    }

    load(options) {
        super.load(options);

        // panel events

        this._addEvents(this.songPanel, ".song", {
            click: e => {
                if ($(e.target).notIn(".actions")) {
                    let song = $(e.currentTarget).data("song");
                    this.loadSong(song);
                }
            },
            contextmenu: e => {
                let index = $(e.currentTarget).index();
                new menus.SongMenu(this, e, index).show();
            },
        });

        this._addEvents(this.songPanel, ".actions .edit", {
            click: e => {
                let index = $(e.currentTarget).parents(".song").index();
                this.showEditSong(index);
            },
        });

        this._addEvents(this.songPanel, ".actions .delete", {
            click: e => {
                let index = $(e.currentTarget).parents(".song").index();
                this.controller.doAction("removeSong", [index]);
            },
        });

        this._addEvents(this.sheetPanel, ".stuntsheet", {
            click: e => {
                let sheet = $(e.currentTarget).data("sheet");
                if ($(e.currentTarget).hasClass("active")) {
                    this.controller.doAction("removeSheetFromSong", [sheet]);
                } else {
                    this.controller.doAction("addSheetToSong", [sheet]);
                }
            },
        });

        // workspace events

        this._addEvents(this.workspace, ".show-audio .edit-link", {
            click: e => {
                promptFile(file => {
                    let extension = _.last(file.name.split("."));
                    if (!_.includes(AUDIO_EXTENSIONS, extension)) {
                        showError(`Invalid extension: ${extension}`);
                        return;
                    }

                    new UploadAudioAction(this).send({
                        audio: file,
                    });
                });
            },
        });

        this._addEvents(this.workspace, ".show-audio .delete-link", {
            click: e => {
                this.controller.doAction("setAudioUrl", [null]);
            },
        });

        this._addEvents(this.workspace, ".upload-beats-audio", {
            click: e => {
                promptFile(file => {
                    let extension = _.last(file.name.split("."));
                    if (!_.includes(AUDIO_EXTENSIONS, extension)) {
                        showError(`Invalid extension: ${extension}`);
                        return;
                    }

                    new ParseBeatsPopup(this, file).show();
                });
            },
        });

        $(".music-content").show();

        // beats editor

        if (_.isNull(this._grapher)) {
            let drawTarget = this.workspace.find(".preview-graph")
            this._grapher = new Grapher(this.show, drawTarget, {
                fieldPadding: 5,
                drawYardlines: false,
            });
        }

        // cache the cumulative beats for each sheet; i.e. the number of beats
        // until that sheet
        let totalBeats = 0;
        this._cumBeats = this.show.getSheets().map(sheet => {
            let curr = totalBeats;
            totalBeats += sheet.getDuration();
            return curr;
        });
        this._totalBeats = totalBeats;

        this._setupControls();
    }

    unload() {
        super.unload();

        $(".music-content").hide();
    }

    /**
     * Refresh the top panels containing the song and sheet list.
     */
    refreshPanels() {
        // action icons
        let iconEdit = HTMLBuilder.icon("pencil", "edit");
        let iconDelete = HTMLBuilder.icon("times", "delete");
        let actions = HTMLBuilder.div("actions", [iconEdit, iconDelete]);

        this.songPanel.empty();
        this.show.getSongs().forEach(song => {
            let label = HTMLBuilder.span(song.getName());
            let $song = HTMLBuilder.div("song", [label, actions.clone()])
                .data("song", song)
                .appendTo(this.songPanel);

            if (song === this._activeSong) {
                $song.addClass("active");
            }
        });

        // no songs in panel
        if (this.songPanel.children().length === 0) {
            HTMLBuilder.make("p.no-songs", "No songs currently in show.")
                .appendTo(this.songPanel);
        }

        this.sheetPanel.empty();
        this.show.getSheets().forEach(sheet => {
            let label = HTMLBuilder.span(sheet.getLabel(), "label");

            let preview = HTMLBuilder.div("preview");
            let $sheet = HTMLBuilder
                .div("stuntsheet", [label, preview])
                .data("sheet", sheet)
                .appendTo(this.sheetPanel);

            if (this._activeSong && this._activeSong.hasSheet(sheet)) {
                $sheet.addClass("active");
            }

            let grapher = new Grapher(this.show, preview, {
                drawYardlines: false,
                fieldPadding: 5,
            });
            grapher.draw(sheet);
        });
    }

    /**
     * Refresh the beats editor preview.
     */
    refreshPreview() {
        let state = this._grapherState;
        this._grapher.draw(state.sheet, state.beat);

        // refresh seek
        let seek = this.workspace.find(".seek");
        let beat = this._getCumulativeBeat();
        let position = seek.width() / this._totalBeats * beat;
        seek.find(".marker").css("transform", `translateX(${position}px)`);
    }

    /**
     * Refresh the beats editor.
     */
    refreshWorkspace() {
        let url = this.show.getAudioUrl();
        let deleteIcon = this.workspace.find(".show-audio .delete-link");
        let label = this.workspace.find(".show-audio label");
        label.next(".url").remove();

        if (url) {
            HTMLBuilder.make("a.url", url)
                .attr("href", url)
                .text(url)
                .insertAfter(label);
            deleteIcon.show();
        } else {
            HTMLBuilder.span("None uploaded", "url")
                .insertAfter(label);
            deleteIcon.hide();
        }

        let table = this.workspace.find("table tbody").empty();
        this.show.getBeats().forEach((beat, i) => {
            let row = HTMLBuilder.make("tr").appendTo(table);

            HTMLBuilder.make("td", i + 1).appendTo(row);
            let cell = HTMLBuilder.make("td.millisecond").appendTo(row);
            let input = HTMLBuilder.input({
                type: "number",
                initial: beat,
                change: e => {
                    let beats = this.show.getBeats();
                    beats[i] = beat;
                },
            });
            input
                .appendTo(cell)
                .on("mousewheel", e => {
                    $(e.target).blur();
                });
        });
    }

    /**** METHODS ****/

    /**
     * Load the given song.
     *
     * @param {Song} song
     */
    loadSong(song) {
        this._activeSong = song;
        this.refresh("panels");
    }

    /**
     * Start animating the preview.
     */
    play() {
        this._isPlaying = true;
        this.workspace.find(".toggle-play")
            .removeClass("icon-play")
            .addClass("icon-pause");

        // TODO: play music and animate
    }

    /**
     * Show the popup that adds a song to the show.
     */
    showAddSong() {
        new AddSongPopup(this.controller).show();
    }

    /**
     * Show the popup that edits a song in the show.
     *
     * @param {int} index - The index of the song to edit.
     */
    showEditSong(index) {
        let song = this.show.getSong(index);
        new EditSongPopup(this.controller, song).show();
    }

    /**
     * Stop animating the preview.
     */
    stop() {
        this._isPlaying = false;
        this.workspace.find(".toggle-play")
            .removeClass("icon-pause")
            .addClass("icon-play");

        // TODO: stop music and animation
    }

    /**** HELPERS ****/

    /**
     * Get the cumulative number of beats for the current sheet and beat
     *
     * @return {number}
     */
    _getCumulativeBeat() {
        let index = this._grapherState.sheet.getIndex();
        return this._cumBeats[index] + this._grapherState.beat;
    }

    /**
     * Get the sheet and beat for the given cumulative beat number.
     *
     * @param {number} beat - The cumulative number of beats
     * @return {[Sheet, number]}
     */
    _getSheetAndBeat(beat) {
        let sheet = this.show.getSheet(0);

        while (beat > sheet.getDuration()) {
            beat -= sheet.getDuration();
            sheet = sheet.getNextSheet();
        }

        return [sheet, beat];
    }

    /**
     * Set up the seek and play button for the preview.
     */
    _setupControls() {
        let seek = this.workspace.find(".seek");
        let marker = seek.find(".marker");
        let markerRadius = marker.width() / 2;
        let seekLeft = seek.offset().left;
        let seekWidth = seek.width();
        let interval = seekWidth / this._totalBeats;

        let updateSeek = e => {
            let prev = marker.offset().left;

            // snap to beat
            let x = _.clamp(e.pageX - seekLeft - markerRadius, 0, seekWidth);
            let cumBeat = roundSmall(round(x, interval) / interval);

            // don't redraw screen if the beat didn't change
            if (x !== prev) {
                let [sheet, beat] = this._getSheetAndBeat(cumBeat);
                this._grapherState.sheet = sheet;
                this._grapherState.beat = beat;
                this.refresh("preview");
            }
        };

        this._addEvents(seek, {
            mousedown: e => {
                // prevent text highlight
                e.preventDefault();

                this.stop();
                updateSeek(e);

                $(document).on({
                    "mousemove.seek": updateSeek,
                    "mouseup.seek": e => {
                        $(document).off(".seek");
                    },
                });
            },
        });

        this._addEvents(this.workspace.find(".toggle-play"), {
            click: e => {
                if (this._isPlaying) {
                    this.stop();
                } else {
                    this.play();
                }
            }
        });
    }
}

let ContextShortcuts = {
    "alt+n": "showAddSong", // can't capture ctrl+n: http://stackoverflow.com/a/7296303/4966649
};

class ContextActions {
    /**
     * Add the given sheet to the given song.
     *
     * @param {Sheet} sheet
     * @param {Song} [song=this._activeSong]
     */
    static addSheetToSong(sheet, song=this._activeSong) {
        song.addSheet(sheet);
        sheet.updateMovements();
        this.refresh("panels");

        return {
            undo: function() {
                song.removeSheet(sheet);
                sheet.updateMovements();
                this.refresh("panels");
            },
        };
    }

    /**
     * Add a song to the show with the given name.
     *
     * @param {string} name
     */
    static addSong(name) {
        let song = Song.create(this.show, name);
        this.show.addSong(song);
        this.loadSong(song);

        return {
            undo: function() {
                this.show.removeSong(song);
                this.loadSong(song);
            },
        };
    }

    /**
     * Move the song at the given index by the given amount.
     *
     * @param {int} index - The index of the song to move
     * @param {int} delta - The amount to change the index
     */
    static moveSong(index, delta) {
        let newIndex = index + delta;
        if (newIndex < 0 || newIndex >= this.show.getSongs().length) {
            return false;
        }

        this.show.moveSong(index, newIndex);
        this.refresh("panels");

        return {
            undo: function() {
                this.show.moveSong(newIndex, index);
                this.refresh("panels");
            },
        };
    }
    /**
     * Remove the given sheet from the given song.
     *
     * @param {Sheet} sheet
     * @param {Song} [song=this._activeSong]
     */
    static removeSheetFromSong(sheet, song=this._activeSong) {
        song.removeSheet(sheet);
        sheet.updateMovements();
        this.refresh("panels");

        return {
            undo: function() {
                song.addSheet(sheet);
                sheet.updateMovements();
                this.refresh("panels");
            },
        };
    }

    /**
     * Remove the song at the given index from the show.
     *
     * @param {int} index
     */
    static removeSong(index) {
        let song = this.show.getSong(index);
        this.show.removeSong(song);
        if (song === this._activeSong) {
            this.loadSong(this.show.getSong(0));
        }
        this.refresh("panels");

        return {
            undo: function() {
                this.show.addSong(song);
                this.loadSong(song);
                this.refresh("panels");
            },
        };
    }

    /**
     * Save the given beats to the Show.
     *
     * @param {number[]} beats
     */
    static saveBeats(beats) {
        let old = this.show.getBeats();
        this.show.setBeats(beats);
        this.refresh("workspace");

        return {
            undo: function() {
                this.show.setBeats(old);
                this.refresh("workspace");
            },
        };
    }

    /**
     * Save the given data for the given song.
     *
     * @param {Song} song
     * @param {object} data
     */
    static saveSong(song, data) {
        let changed = update(song, underscoreKeys(data));
        song.updateMovements();
        this.refresh("panels");

        return {
            undo: function() {
                update(song, changed);
                song.updateMovements();
                this.refresh("panels");
            },
        };
    }

    /**
     * Set the audio URL for the show.
     *
     * @param {string} url
     */
    static setAudioUrl(url) {
        let old = this.show.getAudioUrl();
        this.show.setAudioUrl(url);
        this.refresh("workspace");

        let label = _.isNull(url) ? "Remove audio url" : "Set audio url";

        return {
            label: label,
            undo: function() {
                this.show.setAudioUrl(old);
                this.refresh("workspace");
            },
        };
    }
}
