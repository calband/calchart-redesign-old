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
            // coordinates of the cursor relative to the Grapher
            cursorX: 0,
            cursorY: 0,
        };
    },
    methods: {
        /**
         * Called when a mousedown event is detected in the Grapher.
         *
         * @param {Event} e
         */
        mousedown(e) {},
        /**
         * Called when a mouseover event is detected in the Grapher.
         *
         * @param {Event} e
         */
        mousemove(e) {
            let grapher = this.grapher.$el;
            let bounds = grapher.getBoundingClientRect();
            this.cursorX = e.clientX - bounds.left + grapher.scrollLeft;
            this.cursorY = e.clientY - bounds.top + grapher.scrollTop;
        },
        /**
         * Called when a mouseup event is detected in the Grapher.
         *
         * @param {Event} e
         */
        mouseup(e) {},
    },
};
</script>
