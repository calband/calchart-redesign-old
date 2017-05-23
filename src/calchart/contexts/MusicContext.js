import BaseContext from "calchart/contexts/BaseContext";

/**
 * The Context that allows a user to edit the songs, audio, and music
 * animation in the show.
 */
export default class MusicContext extends BaseContext {
    constructor(controller) {
        super(controller);
    }

    static get shortcuts() {
        return ContextShortcuts;
    }

    static get actions() {
        return ContextActions;
    }

    load(options) {
        super.load(options);

        this._setupContextMenus();

        $(".toolbar .edit-music").addClass("active");
    }

    unload() {
        super.unload();

        $(".toolbar .edit-music").removeClass("active");
    }

    refresh() {
    }

    /**
     * Set up the events for showing context menus.
     */
    _setupContextMenus() {
        this._addEvents(".workspace", {
            contextmenu: e => {
                showContextMenu(e, {
                });
            },
        });
    }
}

let ContextShortcuts = {
};

class ContextActions {
}
