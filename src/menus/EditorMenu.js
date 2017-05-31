import Menu from "menus/Menu";

import { ZOOMS } from "utils/CalchartUtils";

export default class EditorMenu extends Menu {
    getItems() {
        let file = {
            label: "File",
            submenu: [
                {
                    label: "New stuntsheet",
                    action: "showAddSheet",
                    context: "graph-context",
                    icon: "file-o",
                },
                {
                    label: "Rename show",
                    action: "promptRename",
                },
                {
                    label: "Save",
                    action: "saveShow",
                    icon: "floppy-o",
                },
                {
                    label: "Generate PDF",
                    action: "generatePoopsheet",
                    icon: "file-pdf-o",
                },
                {
                    label: "Export",
                    action: "export",
                    icon: "file-code-o",
                },
                this.DIVIDER,
                {
                    label: "Preferences",
                    action: "editPreferences",
                },
                {
                    label: "Edit show properties",
                    action: "editShowProperties",
                },
            ],
        };

        let edit = {
            label: "Edit",
            submenu: [
                {
                    label: "Undo <span class='label'></span>",
                    class: "undo",
                    action: "undo",
                    icon: "undo",
                },
                {
                    label: "Redo <span class='label'></span>",
                    class: "redo",
                    action: "redo",
                    icon: "repeat",
                },
            ],
        };

        let contexts = [
            {
                label: "Music editor",
                action: "loadContext(music)",
                icon: "music",
            },
            {
                label: "Dot editor",
                action: "loadContext(dot)",
                icon: "dot-circle-o",
            },
            {
                label: "Continuity editor",
                action: "loadContext(continuity)",
                icon: "pencil-square-o",
            },
            // {
            //     label: "3D view",
            //     action: "loadContext(3d)",
            // },
        ];

        let zooms = [
            {
                label: "Zoom in",
                action: "zoom(0.1)",
                icon: "search-plus",
            },
            {
                label: "Zoom out",
                action: "zoom(-0.1)",
                icon: "search-minus",
            },
            this.DIVIDER,
        ];

        ZOOMS.forEach(zoom => {
            zooms.push({
                label: `${zoom * 100}%`,
                action: `zoomTo(${zoom})`,
            });
        });

        let view = {
            label: "View",
            submenu: [
                {
                    label: "View mode",
                    submenu: contexts,
                },
                {
                    label: "Toggle sheet background",
                    action: "toggleBackground",
                    context: "dot",
                },
                this.DIVIDER,
                {
                    label: "Zoom",
                    context: "graph-context",
                    icon: "search",
                    submenu: zooms,
                },
            ],
        };

        let help = {
            label: "Help",
            submenu: [
                {
                    label: "Go to help...",
                    action: "openHelp",
                    icon: "question-circle",
                },
            ],
        };

        return [file, edit, view, help];
    }
}
