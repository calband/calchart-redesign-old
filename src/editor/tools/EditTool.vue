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
export default {
    // Required of every EditTool
    toolInfo: {
        // {string} The human-readable label of the tool
        label: null,
        // {string} The icon to display in the toolbar
        icon: null,
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
        mouseover(e) {},
        /**
         * Called when a mouseup event is detected in the Grapher.
         *
         * @param {Event} e
         */
        mouseup(e) {},
    },
};
</script>
