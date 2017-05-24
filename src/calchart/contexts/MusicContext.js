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

    static get info() {
        return {
            name: "music",
            toolbar: "edit-music",
        };
    }

    load(options) {
        super.load(options);
    }

    unload() {
        super.unload();
    }

    refresh() {
    }
}

let ContextShortcuts = {
};

class ContextActions {
}
