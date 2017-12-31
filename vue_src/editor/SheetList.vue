<doc>
The component that lists out all of the stuntsheets in a show for selection
and manipulation.
</doc>

<template>
    <div :class="['sheet-list', horizontal ? 'horizontal' : 'vertical']">
        <div
            v-for="sheet in sheets"
            :key="sheet.id"
            class="sheet"
        >
            <span class="label">{{ sheet.getLabel() }}</span>
            <div class="preview"></div>
        </div>
    </div>
</template>

<script>
export default {
    props: {
        horizontal: {
            // Display the sheets in a horizontal line.
            type: Boolean,
            default: false,
        },
        menu: {
            // Enable the context menu
            type: Boolean,
            default: false,
        },
    },
    computed: {
        sheets() {
            return this.$store.state.show.getSheets();
        },
    },
};
</script>

<style lang="scss" scoped>
.sheet-list {
    @include unselectable;
    &.horizontal {
        padding: 10px;
    }
    &.vertical {
        display: inline-block;
        vertical-align: top;
        height: 100%;
        width: 200px;
        padding: 20px;
        border-right: 3px double $medium-gray;
        overflow: auto;
    }
}
</style>
