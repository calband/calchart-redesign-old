import Toolbar from "utils/Toolbar";

export default class EditorToolbar extends Toolbar {
    getItems() {
        return [
            {
                items: [
                    {
                        label: "Edit Music",
                        class: "music",
                        icon: "music",
                        action: "loadContext(music)",
                    },
                    {
                        label: "Edit Dots",
                        class: "dot",
                        icon: "dot-circle-o",
                        action: "loadContext(dot)",
                    },
                    {
                        label: "Edit Continuity",
                        class: "continuity",
                        icon: "pencil-square-o",
                        action: "loadContext(continuity)",
                    },
                ],
            },
            {
                context: "graph",
                items: [
                    {
                        label: "Add Stuntsheet",
                        icon: "file-o",
                        action: "showAddSheet",
                    },
                ],
            },
            {
                context: "dot",
                items: [
                    {
                        label: "Selection",
                        icon: "mouse-pointer",
                        action: "loadTool(selection)",
                    },
                    {
                        label: "Lasso",
                        icon: "lasso",
                        action: "loadTool(lasso)",
                    },
                    {
                        label: "Swap",
                        icon: "exchange",
                        action: "loadTool(swap)",
                    },
                    {
                        label: "Stretch",
                        icon: "arrows",
                        action: "loadTool(stretch)",
                    },
                    {
                        label: "Line",
                        icon: "line",
                        action: "loadTool(line)",
                    },
                    {
                        label: "Arc",
                        icon: "arc",
                        action: "loadTool(arc)",
                    },
                    {
                        label: "Block",
                        icon: "rectangle",
                        action: "loadTool(block)",
                    },
                    {
                        label: "Circle",
                        icon: "circle-o",
                        action: "loadTool(circle)",
                    },
                ],
            },
            {
                context: "dot",
                items: [
                    {
                        label: "Snap to",
                        choices: {
                            0: "None",
                            1: "1",
                            2: "2",
                            4: "4",
                        },
                    },
                    {
                        label: "Resnap",
                        custom: "<button>Resnap</button>",
                    },
                ],
            },
            {
                context: "continuity",
                items: [
                    {
                        label: "Previous Beat",
                        icon: "chevron-left",
                        action: "prevBeat",
                    },
                    {
                        label: "Seek",
                        custom: "<span class='bar'></span><span class='marker'></span>",
                    },
                    {
                        label: "Next Beat",
                        icon: "chevron-right",
                        action: "nextBeat",
                    },
                    {
                        label: "Check Continuities",
                        icon: "check",
                        action: "checkContinuities(fullCheck=true)",
                    },
                ],
            },
            {
                context: "background",
                items: [
                    {
                        label: "Save",
                        icon: "check",
                        action: "exit",
                    },
                    {
                        label: "Cancel",
                        icon: "times",
                        action: "revert",
                    },
                ],
            },
            {
                context: "ftl-path",
                items: [
                    {
                        label: "Selection",
                        icon: "mouse-pointer",
                        action: "loadTool(selection)",
                    },
                    {
                        label: "Add Point",
                        icon: "plus-square-o",
                        action: "loadTool(add-point)",
                    },
                    {
                        label: "Remove Point",
                        icon: "minus-square-o",
                        action: "loadTool(remove-point)",
                    },
                ],
            },
            {
                context: "gate-reference",
                items: [
                    {
                        label: "Save",
                        icon: "check",
                        action: "exit",
                    },
                ],
            },
            {
                context: "music",
                items: [
                    {
                        label: "Add Song",
                        icon: "file-o",
                        action: "showAddSong",
                    },
                ],
            },
        ];
    }
}
