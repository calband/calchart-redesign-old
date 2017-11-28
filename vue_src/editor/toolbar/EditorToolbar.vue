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
            />
            <EditorToolbarItem
                label="Edit Dots"
                icon="dot-circle-o"
                action="loadContext(dot)"
            />
            <EditorToolbarItem
                label="Edit Continuity"
                icon="pencil-square-o"
                action="loadContext(continuity)"
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
            />
            <EditorToolbarItem
                label="Lasso"
                icon="lasso"
                action="loadTool(lasso)"
            />
            <EditorToolbarItem
                label="Swap"
                icon="exchange"
                action="loadTool(swap)"
            />
            <EditorToolbarItem
                label="Stretch"
                icon="arrows"
                action="loadTool(stretch)"
            />
            <EditorToolbarItem
                label="Line"
                icon="line"
                action="loadTool(line)"
            />
            <EditorToolbarItem
                label="Arc"
                icon="arc"
                action="loadTool(arc)"
            />
            <EditorToolbarItem
                label="Block"
                icon="rectangle"
                action="loadTool(block)"
            />
            <EditorToolbarItem
                label="Circle"
                icon="circle-o"
                action="loadTool(circle)"
            />
        </EditorToolbarGroup>
        <EditorToolbarGroup context="dot">
            <EditorToolbarItemCustom>
                <label>Snap to</label>
                <select>
                    <option
                        v-for="(value, label) in SNAP_STEPS"
                        :key="value"
                        :value="value"
                    >{{ label }}</option>
                </select>
            </EditorToolbarItemCustom>
            <EditorToolbarItemCustom>
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
import SeekBar from 'utils/SeekBar';

import EditorToolbarGroup from './EditorToolbarGroup';
import EditorToolbarItem from './EditorToolbarItem';
import EditorToolbarItemCustom from './EditorToolbarItemCustom';

export default {
    components: {
        EditorToolbarGroup,
        EditorToolbarItem,
        EditorToolbarItemCustom,
        SeekBar,
    },
    constants: {
        SNAP_STEPS: {
            0: 'None',
            1: '1',
            2: '2',
            4: '4',
        },
    },
};
</script>

<style lang="scss" scoped>
.toolbar {
    padding-left: 10px;
    .continuity-context .seek {
        // @include seek-bar;
        margin: 0;
        width: 150px;
    }
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
