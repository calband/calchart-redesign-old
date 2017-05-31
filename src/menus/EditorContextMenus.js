/**
 * @file All the context menus in the editor application.
 */

import ContextMenu from "menus/ContextMenu";

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
