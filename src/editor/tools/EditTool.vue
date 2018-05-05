<doc>
The superclass for editor tools.

EditTools are represented in the toolbar as an icon that can be selected. The
template for the EditTool is what will be displayed in the Grapher when the
tool is in use. Elements in this layer will be above every other element in the
Grapher.

When an event is detected in the Grapher, the corresponding `mouse*` method will
be called with the event that was fired. This event contains the element that
was clicked along with all other information that is passed in the Javascript
Event object.
</doc>

<script>
import $ from 'jquery';
import Vue from 'vue';

import GrapherScale from 'grapher/GrapherScale';

export default {
    // Required of every EditTool
    toolInfo: {
        // {string} The human-readable label of the tool
        label: null,
        // {string} The icon to display in the toolbar
        icon: null,
    },
    props: {
        grapher: {
            // {Vue} The Grapher instance that contains the tool
            type: Vue,
        },
        scale: {
            // {GrapherScale} The scale of the Grapher
            type: GrapherScale,
            required: true,
        },
    },
    data() {
        return {
            // whether the mouse is being pressed
            isMousedown: false,
            // coordinates of the cursor relative to the Grapher
            cursorX: 0,
            cursorY: 0,
            // coordinates of the cursor, snapped to the grid
            snapX: 0,
            snapY: 0,
        };
    },
    methods: {
        /**** Event handlers shared by most edit tools ****/
        /* Defining these methods will overwrite them; use the below methods */

        /**
         * Called when a mousedown event is detected.
         *
         * @param {Event} e
         */
        mousedown(e) {
            this.isMousedown = true;
            $(document).on('mouseup.edit-tool', e => {
                this.mouseup(e);
            });
            this.mousemove(e);
            this.onMousedown(e);
        },
        /**
         * Called when a mousedown or mousemove event is detected.
         *
         * @param {Event} e
         */
        mousemove(e) {
            let grapher = this.grapher.$el;
            let bounds = grapher.getBoundingClientRect();

            this.cursorX = e.clientX - bounds.left + grapher.scrollLeft;
            this.cursorY = e.clientY - bounds.top + grapher.scrollTop;

            // TODO: make grid settable
            let grid = 2;
            if (grid) {
                let snapped = this.scale.snapPixels({
                    x: this.cursorX,
                    y: this.cursorY,
                }, grid);
                this.snapX = snapped.x;
                this.snapY = snapped.y;
            } else {
                this.snapX = this.cursorX;
                this.snapY = this.cursorY;
            }

            this.onMousemove(e);
        },
        /**
         * Called when a mouseup event is detected.
         *
         * @param {Event} e
         */
        mouseup(e) {
            e.stopPropagation();
            $(document).off('mouseup.edit-tool');
            this.isMousedown = false;

            this.onMouseup(e);
        },

        /**** Event hooks for subclasses ****/
        onMousedown(e) {},
        onMousemove(e) {},
        onMouseup(e) {},
    },
};
</script>
