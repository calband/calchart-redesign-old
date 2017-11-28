<doc>
An item with an icon in the toolbar in the editor application.
</doc>

<template>
    <EditorToolbarItemCustom
        @click="doAction"
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
    },
    components: {
        EditorToolbarItemCustom,
    },
    methods: {
        /**
         * Do the action for the toolbar item.
         */
        doAction() {
            if (this.action) {
                let action = parseAction(this.action);
                this.$store.dispatch(`editor/${action.name}`, action.data);
            }
        },
    },
};
</script>

<style lang="scss" scoped>
</style>
