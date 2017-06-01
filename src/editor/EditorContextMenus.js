/**
 * @file All the context menus in the editor application.
 */

import ContextMenu from "utils/ContextMenu";

class ContinuityContextWorkspace extends ContextMenu {
    getItems() {
        return [
            {
                label: "Edit dots...",
                action: "loadContext(dot)",
            },
            {
                label: "Go to",
                submenu: [
                    {
                        label: "First beat",
                        action: "firstBeat",
                    },
                    {
                        label: "Previous beat",
                        action: "prevBeat",
                    },
                    {
                        label: "Next beat",
                        action: "nextBeat",
                    },
                    {
                        label: "Last beat",
                        action: "lastBeat",
                    },
                ],
            },
            {
                label: "Check Continuities...",
                action: "checkContinuities(fullCheck=true)",
            },
        ];
    }
}

export let ContinuityContextMenus = {
    WorkspaceMenu: ContinuityContextWorkspace,
};

class ContinuityPanelContinuity extends ContextMenu {
    /**
     * @param {ContinuityContext} context
     * @param {Event} e
     * @param {int} index - The index of the continuity being right-clicked.
     */
    constructor(context, e, index) {
        super(context, e);
        this._index = index;
    }

    getItems() {
        return [
            {
                label: "Edit...",
                action: `editContinuity(${this._index})`,
            },
            {
                label: "Move up",
                action: `moveContinuity(${this._index}, -1)`,
            },
            {
                label: "Move down",
                action: `moveContinuity(${this._index}, 1)`,
            },
            {
                label: "Delete",
                action: `deleteContinuity(${this._index})`,
            },
        ];
    }
}

export let ContinuityPanelMenus = {
    ContinuityMenu: ContinuityPanelContinuity,
};

class GraphContextSidebar extends ContextMenu {
    getItems() {
        return [
            {
                label: "Properties...",
                action: "showEditSheet",
            },
            {
                label: "Duplicate sheet",
                action: "duplicateSheet",
            },
            {
                label: "Delete sheet",
                action: "deleteSheet",
            },
        ];
    }
}

class GraphContextSheet extends ContextMenu {
    getItems() {
        return [
            {
                label: "Add sheet...",
                action: "showAddSheet",
            },
        ];
    }
}

export let GraphContextMenus = {
    SidebarMenu: GraphContextSidebar,
    SheetMenu: GraphContextSheet,
};

class DotContextWorkspace extends ContextMenu {
    getItems() {
        return [
            {
                label: "Edit continuity...",
                action: "loadContext(continuity)",
            },
        ];
    }
}

class DotContextDot extends ContextMenu {
    /**
     * @param {DotContext} context
     * @param {Event} e
     * @param {DotType} dotType - The dot type of the dot being right-clicked.
     */
    constructor(context, e, dotType) {
        super(context, e);
        this._dotType = dotType;
    }

    getItems() {
        return [
            {
                label: "Edit continuity...",
                action: `loadContext(continuity, dotType=${this._dotType})`,
            },
            {
                label: "Change dot type",
                submenu: [
                    {
                        label: "Plain",
                        action: "changeDotType(plain)",
                    },
                    {
                        label: "Solid",
                        action: "changeDotType(solid)",
                    },
                    {
                        label: "Plain Forwardslash",
                        action: "changeDotType(plain-forwardslash)",
                    },
                    {
                        label: "Solid Forwardslash",
                        action: "changeDotType(solid-forwardslash)",
                    },
                    {
                        label: "Plain Backslash",
                        action: "changeDotType(plain-backslash)",
                    },
                    {
                        label: "Solid Backslash",
                        action: "changeDotType(solid-backslash)",
                    },
                    {
                        label: "Plain Cross",
                        action: "changeDotType(plain-x)",
                    },
                    {
                        label: "Solid Cross",
                        action: "changeDotType(solid-x)",
                    },
                ],
            },
        ];
    }
}

export let DotContextMenus = {
    WorkspaceMenu: DotContextWorkspace,
    DotMenu: DotContextDot,
};

class MusicContextSong extends ContextMenu {
    /**
     * @param {MusicContext} context
     * @param {Event} e
     * @param {int} index - The index of the song being right-clicked.
     */
    constructor(context, e, index) {
        super(context, e);
        this._index = index;
    }

    getItems() {
        return [
            {
                label: "Edit...",
                action: `showEditSong(${this._index})`,
            },
            {
                label: "Move up",
                action: `moveSong(${this._index}, -1)`,
            },
            {
                label: "Move down",
                action: `moveSong(${this._index}, 1)`,
            },
            {
                label: "Delete",
                action: `removeSong(${this._index})`,
            },
        ];
    }
}

export let MusicContextMenus = {
    SongMenu: MusicContextSong,
};
