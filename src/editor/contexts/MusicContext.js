import Song from "calchart/Song";
import BaseContext from "editor/contexts/BaseContext";
import Grapher from "graphers/Grapher";
import { MusicContextMenus as menus } from "menus/EditorContextMenus";
import AddSongPopup from "popups/AddSongPopup";
import EditSongPopup from "popups/EditSongPopup";

import HTMLBuilder from "utils/HTMLBuilder";
import { underscoreKeys, update } from "utils/JSUtils";

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

    static get name() {
        return "music";
    }

    static get refreshTargets() {
        return _.concat(super.refreshTargets, "panels", "workspace");
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
}
