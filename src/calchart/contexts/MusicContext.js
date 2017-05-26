import BaseContext from "calchart/contexts/BaseContext";

import HTMLBuilder from "utils/HTMLBuilder";

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

    get sidebar() {
        return $(".music-sidebar");
    }

    get workspace() {
        return $(".music-workspace");
    }

    load(options) {
        super.load(options);

        $(".music-content").show();
    }

    unload() {
        super.unload();

        $(".music-content").hide();
    }

    refresh() {
    }
}

let ContextShortcuts = {
};

class ContextActions {
}
