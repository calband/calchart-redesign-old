<doc>
An item with an icon in the toolbar in the editor application.
</doc>

<template>
    <EditorToolbarItemCustom
        @mousedown="mousedown"
        @mouseup="mouseup"
        @mouseenter="mouseenter"
        @mouseleave="mouseleave"
        :class="{ focus, active }"
    >
        <i :class="`icon-${icon}`" />
    </EditorToolbarItemCustom>
</template>

<script>
import parseAction from 'editor/actions';

import EditorToolbarItemCustom from './EditorToolbarItemCustom';

export default {
    props: {
        label: {
            // The label to show in the tooltip
            type: String,
            required: true,
        },
        icon: {
            // The icon to show in the toolbar
            type: String,
            required: true,
        },
        action: {
            // The action to do when the item is clicked
            type: String,
            required: true,
        },
        active: {
            // True if this toolbar item should be turned on
            type: Boolean,
            default: false,
        },
    },
    components: {
        EditorToolbarItemCustom,
    },
    data() {
        return {
            focus: false,
        };
    },
    methods: {
        /**
         * Do the action for the toolbar item.
         */
        doAction() {
            // TODO: fix
            if (this.action) {
                let action = parseAction(this.action);
                this.$store.dispatch(`editor/${action.name}`, action.data);
            }
        },
        /**
         * Handle the mousedown event.
         */
        mousedown(e) {
            this.focus = true;
        },
        /**
         * Handle the mouseenter event.
         *
         * @param {Event} e
         */
        mouseenter(e) {
            if (e.buttons === 1) {
                this.focus = true;
            }
        },
        /**
         * Handle the mouseleave event.
         */
        mouseleave(e) {
            this.focus = false;
        },
        /**
         * Handle the mouseup event.
         */
        mouseup(e) {
            this.focus = false;
        },
    },
};
</script>

<style lang="scss" scoped>
.toolbar-item {
    padding: 5px;
    border: 1px solid transparent;
    border-radius: 2px;
    line-height: 0; // firefox heights
    &:hover, &.active, &.focus:hover {
        border-color: darken($semilight-gray, 10);
        box-shadow: 0 0 1px rgba($black, 0.2);
        background: rgba($white, 0.5);
    }
    &.active, &.focus:hover {
        background: rgba($white, 0.7);
    }
    i {
        color: $dark-gray;
        cursor: default;
    }
}
</style>
