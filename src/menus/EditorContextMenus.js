/**
 * @file All the context menus in the editor application.
 */

import ContextMenu from "menus/ContextMenu";

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

export let DotContextMenus = {
    WorkspaceMenu: DotContextWorkspace,
};
