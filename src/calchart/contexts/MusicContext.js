import BaseContext from "calchart/contexts/BaseContext";
import Grapher from "calchart/Grapher";
import Song from "calchart/Song";

import HTMLBuilder from "utils/HTMLBuilder";
import { getData, showPopup } from "utils/UIUtils";

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
                // TODO
            },
        });

        this._addEvents(this.songPanel, ".actions .edit", {
            click: e => {
                // TODO
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
     * TODO
     */
    static removeSong() {
        // TODO
    }

    /**
     * TODO
     */
    static setSongSheets() {
        // TODO
    }
}
