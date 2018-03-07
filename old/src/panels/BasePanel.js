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
        this._panel = this.getPanel();
    }

    /**
     * Display this panel.
     */
    show() {
        // always keep panel on screen
        $(window).on("resize.panel", e => {
            this._panel.keepOnscreen();
        });

        this._panel.show()
            .keepOnscreen();
    }

    /**
     * Refresh this panel.
     */
    refresh() {}

    /**
     * Hide this panel.
     */
    hide() {
        this._panel.hide();

        $(window).off(".panel");
    }

    /**** HOOKS ****/

    /**
     * @return {jQuery} The built panel.
     */
    getPanel() {
        let handle = HTMLBuilder.div("panel-handle")
            .mousedown(e => {
                e.preventDefault();

                // pixels from the top-left corner of the handle to the cursor
                let offset = $(e.currentTarget).offset();
                let offsetX = e.pageX - offset.left;
                let offsetY = e.pageY - offset.top;

                // make draggable
                $(window).on({
                    "mousemove.panel-drag": e => {
                        let left = e.pageX - offsetX;
                        let top = e.pageY - offsetY;

                        // don't go out of window
                        let maxX = $(window).width() - this._panel.outerWidth();
                        let maxY = $(window).height() - this._panel.outerHeight();

                        this._panel.css({
                            top: _.clamp(top, 0, maxY),
                            left: _.clamp(left, 0, maxX),
                        });
                    },
                    "mouseup.panel-drag": e => {
                        $(window).off(".panel-drag");
                    },
                });
            });

        let content = HTMLBuilder.div("panel-content", this.getContent());

        let panel = HTMLBuilder.div(`panel ${this._context.name}`, [handle, content])
            .appendTo("body");

        // initialize the panel in bottom-right corner of screen
        panel.css({
            top: $(window).height() - panel.outerHeight() - 20,
            left: $(window).width() - panel.outerWidth() - 20,
        });

        // TODO: make panel resizeable (#23)

        return panel;
    }

    /**
     * @return {jQuery[]} The content of the panel.
     */
    getContent() {
        throw new NotImplementedError(this);
    }
}
