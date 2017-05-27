import BaseContext from "calchart/contexts/BaseContext";
import Grapher from "calchart/Grapher";
import Song from "calchart/Song";

import { ValidationError } from "utils/errors";
import HTMLBuilder from "utils/HTMLBuilder";
import { underscoreKeys, update } from "utils/JSUtils";
import { getData, showContextMenu, showPopup } from "utils/UIUtils";

/**
 * The Context that allows a user to edit the songs, audio, and music
 * animation in the show.
 */
export default class MusicContext extends BaseContext {
    constructor(controller) {
        super(controller);

        this._activeSong = _.first(this.show.getSongs());
    }

    static get shortcuts() {
        return ContextShortcuts;
    }

    static get actions() {
        return ContextActions;
    }

    static get info() {
        return {
            name: "music",
            html: "edit-music",
        };
    }

    static get refreshTargets() {
        return ["panels", "workspace"];
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

        this._addEvents(this.songPanel, ".song", {
            click: e => {
                if ($(e.target).notIn(".actions")) {
                    let song = $(e.currentTarget).data("song");
                    this.loadSong(song);
                }
            },
            contextmenu: e => {
                let index = $(e.currentTarget).index();

                showContextMenu(e, {
                    "Edit...": `showEditSong(${index})`,
                    "Move down": `moveSong(${index}, 1)`,
                    "Move up": `moveSong(${index}, -1)`,
                    "Delete": `removeSong(${index})`,
                });
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
                // TODO
            },
        });

        this._addEvents(this.sheetPanel, ".stuntsheet", {
            click: e => {
                // TODO: add/remove to active song
            },
        });

        $(".music-content").show();
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
            HTMLBuilder.make("p.no-songs")
                .text("No songs currently in show.")
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
     * Refresh the beats editor.
     */
    refreshWorkspace() {
        // TODO: implement (#160)
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
     * Show the popup that adds a song to the show.
     */
    showAddSong() {
        showPopup("add-song", {
            onSubmit: popup => {
                let data = getData(popup);

                this.controller.doAction("addSong", [data.songName]);
            },
        });
    }

    /**
     * Show the popup that edits a song in the show.
     *
     * @param {int} index - The index of the song to edit.
     */
    showEditSong(index) {
        let song = this.show.getSong(index);

        showPopup("edit-song", {
            init: popup => {
                popup.find(".songName input").val(song.getName());
                popup.find(".fieldType select").choose(song.fieldType);
                popup.find(".stepType select").choose(song.stepType);
                popup.find(".orientation select").choose(song.orientation);

                popup.find(".beatsPerStep select")
                    .choose(song.beatsPerStep === "default" ? "default" : "custom")
                    .change(function() {
                        let disabled = $(this).val() !== "custom";
                        $(this).siblings("input").prop("disabled", disabled);
                    })
                    .change();

                popup.find(".beatsPerStep > input").val(song.getBeatsPerStep());
            },
            onSubmit: popup => {
                let data = getData(popup);

                data.name = data.songName;

                if (data.beatsPerStep === "custom") {
                    data.beatsPerStep = parseInt(data.customBeatsPerStep);
                    if (_.isNaN(data.beatsPerStep)) {
                        throw new ValidationError("Please provide the number of beats per step.");
                    } else if (data.beatsPerStep <= 0) {
                        throw new ValidationError("Beats per step needs to be a positive integer.");
                    }
                }

                this.controller.doAction("saveSong", [song, data]);
            },
        });
    }
}

let ContextShortcuts = {
    "alt+n": "showAddSong", // can't capture ctrl+n: http://stackoverflow.com/a/7296303/4966649
};

class ContextActions {
    /**
     * Add a song to the show with the given name.
     *
     * @param {string} name
     */
    static addSong(name) {
        let song = this.show.addSong(name);
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
        let song = this.show.getSong(index);
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
     * TODO
     */
    static removeSong() {
        // TODO
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
     * TODO
     */
    static setSongSheets() {
        // TODO
    }
}
