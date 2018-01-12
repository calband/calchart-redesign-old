<doc>
The toolbar in the editor application.
</doc>

<template>
    <div class="toolbar">
        <EditorToolbarGroup>
            <EditorToolbarItem
                label="Edit Music"
                icon="music"
                action="loadContext(music)"
                :active="isContext('music')"
            />
            <EditorToolbarItem
                label="Edit Dots"
                icon="dot-circle-o"
                action="loadContext(dot)"
                :active="isContext('dot')"
            />
            <EditorToolbarItem
                label="Edit Continuity"
                icon="pencil-square-o"
                action="loadContext(continuity)"
                :active="isContext('continuity')"
            />
        </EditorToolbarGroup>
        <EditorToolbarGroup context="graph">
            <EditorToolbarItem
                label="Add Stuntsheet"
                icon="file-o"
                action="showAddSheet"
            />
        </EditorToolbarGroup>
        <EditorToolbarGroup context="dot">
            <EditorToolbarItem
                label="Selection"
                icon="mouse-pointer"
                action="loadTool(selection)"
                :active="isTool('selection')"
            />
            <EditorToolbarItem
                label="Lasso"
                icon="lasso"
                action="loadTool(lasso)"
                :active="isTool('lasso')"
            />
            <EditorToolbarItem
                label="Swap"
                icon="exchange"
                action="loadTool(swap)"
                :active="isTool('swap')"
            />
            <EditorToolbarItem
                label="Stretch"
                icon="arrows"
                action="loadTool(stretch)"
                :active="isTool('stretch')"
            />
            <EditorToolbarItem
                label="Line"
                icon="line"
                action="loadTool(line)"
                :active="isTool('line')"
            />
            <EditorToolbarItem
                label="Arc"
                icon="arc"
                action="loadTool(arc)"
                :active="isTool('arc')"
            />
            <EditorToolbarItem
                label="Block"
                icon="rectangle"
                action="loadTool(block)"
                :active="isTool('block')"
            />
            <EditorToolbarItem
                label="Circle"
                icon="circle-o"
                action="loadTool(circle)"
                :active="isTool('circle')"
            />
        </EditorToolbarGroup>
        <EditorToolbarGroup context="dot">
            <EditorToolbarItemCustom class="snap-to">
                <label>Snap to:</label>
                <Select2
                    @input="setSnap"
                    :value="$store.state.editor.snap"
                    :choices="SNAP_STEPS"
                />
            </EditorToolbarItemCustom>
            <EditorToolbarItemCustom class="resnap">
                <button>Resnap</button>
            </EditorToolbarItemCustom>
        </EditorToolbarGroup>
        <EditorToolbarGroup context="continuity">
            <EditorToolbarItem
                label="Previous Beat"
                icon="chevron-left"
                action="prevBeat"
            />
            <EditorToolbarItemCustom>
                <SeekBar />
            </EditorToolbarItemCustom>
            <EditorToolbarItem
                label="Next Beat"
                icon="chevron-right"
                action="nextBeat"
            />
            <EditorToolbarItem
                label="Check Continuities"
                icon="check"
                action="checkContinuities(fullCheck=true)"
            />
        </EditorToolbarGroup>
        <EditorToolbarGroup context="music">
            <EditorToolbarItem
                label="Add Song"
                icon="file-o"
                action="showAddSong"
            />
        </EditorToolbarGroup>
        <EditorToolbarGroup context="background">
            <EditorToolbarItem
                label="Save"
                icon="check"
                action="exit"
            />
            <EditorToolbarItem
                label="Cancel"
                icon="times"
                action="revert"
            />
        </EditorToolbarGroup>
        <EditorToolbarGroup context="ftl-path">
            <EditorToolbarItem
                label="Selection"
                icon="mouse-pointer"
                action="loadTool(selection)"
            />
            <EditorToolbarItem
                label="Add Point"
                icon="plus-square-o"
                action="loadTool(add-point)"
            />
            <EditorToolbarItem
                label="Remove Point"
                icon="minus-square-o"
                action="loadTool(remove-point)"
            />
        </EditorToolbarGroup>
        <EditorToolbarGroup context="gate-reference">
            <EditorToolbarItem
                label="Save"
                icon="check"
                action="exit"
            />
        </EditorToolbarGroup>
    </div>
</template>

<script>
import { mapMutations } from 'vuex';

import ContextType from 'editor/ContextType';
import ToolType from 'editor/ToolType';
import SeekBar from 'utils/SeekBar';
import Select2 from 'utils/Select2';

import EditorToolbarGroup from './EditorToolbarGroup';
import EditorToolbarItem from './EditorToolbarItem';
import EditorToolbarItemCustom from './EditorToolbarItemCustom';

export default {
    components: {
        EditorToolbarGroup,
        EditorToolbarItem,
        EditorToolbarItemCustom,
        SeekBar,
        Select2,
    },
    constants: {
        SNAP_STEPS: [
            { value: '0', label: 'None' },
            { value: '1', label: '1' },
            { value: '2', label: '2' },
            { value: '4', label: '4' },
        ],
    },
    methods: {
        ...mapMutations('editor', [
            'setSnap',
        ]),
        /**
         * @param {ContextType} context
         * @return {Boolean} true if the context matches the current context.
         */
        isContext(context) {
            return ContextType.isCurrent(this.$store, context);
        },
        /**
         * @param {ToolType} tool
         * @return {Boolean} true if the tool matches the current editing tool.
         */
        isTool(tool) {
            return ToolType.fromValue(tool) === this.$store.state.editor.tool;
        },
    },
};
</script>

<style lang="scss" scoped>
.toolbar {
    @include unselectable;
    padding: 5px 0;
    padding-left: 10px;
    background: $light-gray;
    background: linear-gradient($light-gray, $semilight-gray);
    border-bottom: 1px solid rgba($medium-gray, 0.5);
    box-shadow: 0 1px 2px rgba($black, 0.2);
    z-index: z-index(toolbar);
    .snap-to {
        margin: 0 5px;
        text-align: center;
        select {
            width: 75px;
        }
    }
    .resnap button {
        font-size: 12px;
        margin: 0;
        padding: 0.6em 1.5em 0.3em;
    }
}
</style>
