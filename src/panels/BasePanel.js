import { NotImplementedError } from "utils/errors";
import HTMLBuilder from "utils/HTMLBuilder";

/**
 * The base class for any panels in Calchart.
 */
export default class BasePanel {
    /**
     * @param {Context} context
     */
    constructor(context) {
        this._context = context;
        this._panel = null;
    }

    /**
     * Display this panel.
     */
    show() {
        let handle = HTMLBuilder.div("panel-handle");
        let content = HTMLBuilder.div("panel-content", this.getContent());

        this._panel = HTMLBuilder.div(`panel ${this._context.name}`, [handle, content])
            .appendTo("body");

        // initialize the panel in bottom-right corner of screen
        this._panel.css({
            top: $(window).height() - this._panel.outerHeight() - 20,
            left: $(window).width() - this._panel.outerWidth() - 20,
        });

        // make panel draggable
        handle.mousedown(e => {
            e.preventDefault();

            let offset = $(e.currentTarget).offset();
            // pixels from the top-left corner of the handle to the cursor
            let offsetX = e.pageX - offset.left;
            let offsetY = e.pageY - offset.top;

            $(window).on({
                "mousemove.panel-drag": e => {
                    let left = e.pageX - offsetX;
                    let top = e.pageY - offsetY;

                    // // don't go out of window
                    // let maxX = $(window).width() - $(panel).outerWidth();
                    // let maxY = $(window).height() - $(panel).outerHeight();

                    // $(panel).css({
                    //     top: _.clamp(top, 0, maxY),
                    //     left: _.clamp(left, 0, maxX),
                    // });
                },
                "mouseup.panel-drag": e => {
                    $(window).off(".panel-drag");
                    this._panel.keepOnscreen();
                },
            });
        });

        // always keep panel on screen
        $(window).on("resize.panel", e => {
            this._panel.keepOnscreen();
        });

        // TODO: make panel resizeable (#23)
    }

    /**
     * Refresh this panel.
     */
    refresh() {}

    /**
     * Hide this panel.
     */
    hide() {
        this._panel.remove();
        this._panel = null;

        $(window).off(".panel");
    }

    /**** HOOKS ****/

    /**
     * @return {jQuery[]} The content of the panel.
     */
    getContent() {
        throw new NotImplementedError(this);
    }
}
