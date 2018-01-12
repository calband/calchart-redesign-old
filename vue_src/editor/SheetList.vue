<doc>
The component that lists out all of the stuntsheets in a show for selection
and manipulation.
</doc>

<template>
    <div
        :class="['sheet-list', horizontal ? 'horizontal' : 'vertical']"
        :style="listDimensions"
    >
        <div
            v-for="sheet in sheets"
            :key="sheet.id"
            :class="['sheet', isActiveSheet(sheet) ? 'active' : '']"
            :style="sheetDimensions"
            @click="makeActiveSheet(sheet)"
        >
            <span class="label">{{ sheet.getLabel() }}</span>
            <div class="preview"></div>
        </div>
    </div>
</template>

<script>
// The width-to-height ratio for a Sheet
let SHEET_RATIO = 10/7;

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
        width: {
            // The width of the component
            type: [Number, String],
            default: '100%',
        },
        height: {
            // The height of the component
            type: [Number, String],
            default: '100%',
        },
    },
    computed: {
        /**
         * @return {Object} The dimensions of the list.
         */
        listDimensions() {
            return {
                width: this.width,
                height: this.height,
            };
        },
        /**
         * @return {Object} The dimensions of each Sheet.
         */
        sheetDimensions() {
            if (this.horizontal) {
                let height = this.height - 20;
                return {
                    width: height * SHEET_RATIO,
                    height: height,
                };
            } else {
                let width = this.width - 40;
                return {
                    width: width,
                    height: width / SHEET_RATIO,
                };
            }
        },
        /**
         * @return {[Sheet]} All the Sheets in the Show.
         */
        sheets() {
            if (this.$store.state.show) {
                return this.$store.state.show.getSheets();
            } else {
                return [];
            }
        },
    },
    methods: {
        /**
         * @param {String} sheet
         * @return {Boolean} True if the given Sheet is the currently active
         *   Sheet.
         */
        isActiveSheet(sheet) {
            return sheet === this.$store.state.editor.sheet;
        },
        /**
         * Make the given Sheet the currently active Sheet.
         *
         * @param {Sheet} sheet
         */
        makeActiveSheet(sheet) {
            this.$store.commit('editor/setActiveSheet', sheet);
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
        padding: 20px;
        border-right: 3px double $medium-gray;
        overflow: auto;
    }
    .sheet {
        margin-bottom: 10px;
        &:last-child {
            margin-bottom: 0;
        }
        &.active .preview {
            border-color: $gold;
            box-shadow: 0 0 5px $gold;
        }
    }
    .label {
        @include max-text-width(96%);
        position: absolute;
        top: 4%;
        left: 2%;
        font-size: 24px;
        font-family: sans-serif("DIN Next Medium");
        z-index: z-index(toolbar);
        color: $gold;
        text-shadow: 1px 1px 2px $black;
    }
    .preview {
        width: 100%;
        height: 100%;
        border: 2px solid $blue;
    }
}
</style>
