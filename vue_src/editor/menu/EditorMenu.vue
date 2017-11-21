<doc>
The top menu in the editor application.
</doc>

<template>
    <div class="menu">
        <EditorMenuTab label="File">
            <EditorMenuItem
                label="New stuntsheet"
                action="showAddSheet"
                icon="file-o"
                context="graph"
            />
            <EditorMenuItem
                label="Rename show"
                action="promptRename"
            />
            <EditorMenuItem
                label="Save"
                action="saveShow"
                icon="floppy-o"
            />
            <EditorMenuItem
                label="Generate PDF"
                action="generatePoopsheet"
                icon="file-pdf-o"
            />
            <EditorMenuItem
                label="Export"
                action="export"
                icon="file-code-o"
            />
            <EditorMenuItemDivider />
            <EditorMenuItem
                label="Preferences"
                action="editPreferences"
            />
            <EditorMenuItem
                label="Edit show properties"
                action="editShowProperties"
            />
        </EditorMenuTab>
        <EditorMenuTab label="Edit">
            <EditorMenuItem
                :label="`Undo ${undoLabel}`"
                :disabled="undoLabel === ''"
                action="undo"
                icon="undo"
            />
            <EditorMenuItem
                :label="`Redo ${redoLabel}`"
                :disabled="redoLabel === ''"
                action="redo"
                icon="repeat"
            />
        </EditorMenuTab>
        <EditorMenuTab label="View">
            <EditorMenuItem label="View mode">
                <EditorMenuItem
                    label="Music editor"
                    action="loadContext(music)"
                    icon="music"
                />
                <EditorMenuItem
                    label="Dot editor"
                    action="loadContext(dot)"
                    icon="dot-circle-o"
                />
                <EditorMenuItem
                    label="Continuity editor"
                    action="loadContext(continuity)"
                    icon="pencil-square-o"
                />
                <!--
                <EditorMenuItem
                    label="3D view"
                    action="loadContext(3D)"
                />
                -->
                <EditorMenuItem
                    @click="openViewer"
                    label="Open in viewer..."
                />
            </EditorMenuItem>
            <EditorMenuItem
                label="Toggle sheet background"
                action="toggleBackground"
                context="dot"
            />
            <EditorMenuItemDivider />
            <EditorMenuItem label="Zoom" icon="search" context="graph">
                <EditorMenuItem
                    label="Zoom in"
                    action="zoomBy(0.1)"
                    icon="search-plus"
                />
                <EditorMenuItem
                    label="Zoom out"
                    action="zoomBy(-0.1)"
                    icon="search-minus"
                />
                <EditorMenuItemDivider />
                <EditorMenuItem
                    v-for="zoom in ZOOMS"
                    :label="`${zoom * 100}%`"
                    :action="`zoomTo(${zoom})`"
                    :key="zoom"
                />
            </EditorMenuItem>
        </EditorMenuTab>
        <EditorMenuTab label="Help">
            <EditorMenuItem
                @click="openHelp"
                label="Go to help..."
                icon="question-circle"
            />
        </EditorMenuTab>
    </div>
</template>

<script>
import $ from 'jquery';

import { ZOOMS } from 'utils/CalchartUtils';

import EditorMenuTab from './EditorMenuTab';
import EditorMenuItem from './EditorMenuItem';
import EditorMenuItemDivider from './EditorMenuItemDivider';

export default {
    components: {
        EditorMenuTab,
        EditorMenuItem,
        EditorMenuItemDivider,
    },
    data() {
        return {
            ZOOMS,
            undoLabel: '',
            redoLabel: '',
            activeTab: null,
        };
    },
    mounted() {
        $('body').append(this.$refs.background);

        this.$children.forEach(menuTab => {
            menuTab.$on('mouseover', () => {
                if (this.activeTab && this.activeTab !== menuTab) {
                    this.activate(menuTab);
                }
            });
            menuTab.$on('mousedown', () => {
                if (this.activeTab) {
                    this.deactivate();
                } else {
                    this.activate(menuTab);
                }
            })
        });
    },
    methods: {
        /**
         * Activate the given menu tab.
         */
        activate(menuTab) {
            this.deactivate();
            menuTab.activate();
            this.activeTab = menuTab;

            $(document).one('mousedown.menu', () => {
                this.deactivate();
            });
        },
        /**
         * Deactivate the active menu tab.
         */
        deactivate() {
            if (this.activeTab) {
                this.activeTab.deactivate();
                this.activeTab = null;
            }

            $(document).off('.menu');
        },
        /**
         * Open the viewer app for the current show.
         */
        openViewer() {
            console.log('open viewer');
        },
        /**
         * Open the help pages.
         */
        openHelp() {
            console.log('open help');
        },
    },
};
</script>

<style lang="scss" scoped>
.menu {
    @include unselectable;
    margin: 5px 0;
    padding-left: 10px;
    z-index: z-index(menu);
}
</style>
