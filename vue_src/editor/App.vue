<docs>
The entry point for the editor page.
</docs>

<template>
    <div class="editor-view">
        <div class="editor-header">
            <h1>{{ show.name }}</h1>
            <EditorMenu />
            <EditorToolbar />
        </div>
        <div class="content">
            <GraphEditor v-if="graphEditor" />
            <MusicEditor v-else />
        </div>
    </div>
</template>

<script>
import _ from 'lodash';
import { mapState } from 'vuex';

import { showPopup } from 'popups/lib';
import SetupShowPopup from 'popups/SetupShowPopup';

import GraphEditor from './GraphEditor';
import EditorMenu from './menu/EditorMenu';
import MusicEditor from './MusicEditor';
import EditorToolbar from './toolbar/EditorToolbar';

export default {
    name: 'Editor',
    components: {
        EditorMenu,
        EditorToolbar,
        GraphEditor,
        MusicEditor,
    },
    data() {
        return {
            graphEditor: true,
        };
    },
    mounted() {
        if (!this.isInitialized) {
            showPopup(SetupShowPopup);
        }
    },
    computed: {
        /**
         * @return {Boolean} true if the show is initialized.
         */
        isInitialized() {
            return !_.isNull(this.$store.state.show);
        },
        /**
         * @return {Show|Object} The Show currently loaded in the editor. If
         *   the Show is not initialized yet, returns the data for creating
         *   a show.
         */
        show() {
            if (this.isInitialized) {
                return this.$store.state.show;
            } else {
                return this.$store.state.editor.newShowData;
            }
        },
    },
};
</script>

<style lang="scss">
body {
    padding: 0;
    padding-top: 20px;
    min-width: 800px;
    min-height: 750px;
    cursor: default;
}

header {
    margin: 20px;
    margin-top: 0;
}

ul.messages {
    @include hover-messages;
}
</style>

<style lang="scss" scoped>
$editor-header-height: 95px;

.editor-header {
    height: $editor-header-height;
    h1 {
        margin: 0;
        padding-left: 20px;
    }
}

.content {
    @include remove-children-space;
    display: none;
    height: calc(100% - #{$editor-header-height + $header-height + 20px});
    width: 100%;
    font-size: 0;
    .stuntsheet {
        &.active .preview {
            border-color: $gold;
            box-shadow: 0 0 5px $gold;
        }
        span.label {
            @include max-text-width(96%);
            position: absolute;
            top: 2%;
            left: 2%;
            font-size: 24px;
            font-family: sans-serif("DIN Next Medium");
            z-index: z-index(toolbar);
            color: $gold;
            text-shadow: 1px 1px 2px $black;
        }
        .preview {
            display: block;
            width: 100%;
            height: 100%;
            border: 2px solid $blue;
        }
    }
}

// .popup {
//     label {
//         width: 90px;
//     }
//     .field {
//         &.numBeats, &.numDots, &.beatsPerStep {
//             label {
//                 width: initial;
//             }
//         }
//         &.beatsPerStep {
//             select {
//                 width: 90px;
//             }
//             & > input {
//                 margin-left: 10px;
//                 width: 50px;
//                 vertical-align: middle;
//                 text-align: center;
//             }
//         }
//     }
//     &.edit-show {
//         .isBand label {
//             width: initial;
//         }
//     }
//     &.edit-sheet {
//         .icons {
//             display: inline-block;
//             margin-left: 10px;
//             vertical-align: middle;
//             i {
//                 cursor: pointer;
//                 &.move-link {
//                     font-size: 0.9em;
//                 }
//                 &.clear-link {
//                     color: $red;
//                 }
//             }
//         }
//     }
// }

// .panel {
//     display: none;
//     position: absolute;
//     background: $dark-gray;
//     z-index: z-index(panel);
//     box-shadow: 0 0 5px $black;
//     white-space: nowrap;
//     $panel-handle-height: 10px;
//     .panel-handle {
//         background: $medium-gray;
//         background: linear-gradient($semilight-gray, $medium-gray);
//         height: $panel-handle-height;
//     }
// }

// /** EDIT BACKGROUND CONTEXT **/

// body.context-background .workspace .graph {
//     .dots {
//         opacity: 0.5;
//     }
//     .dot-labels {
//         display: none;
//     }
// }

// .background-image-handles {
//     position: absolute;
//     cursor: move;
// }

// /** DOT CONTEXT **/

// .panel.dot {
//     $dot-type-size: 24px;
//     $li-size: $dot-type-size + 10px;
//     $li-margin: 5px;
//     ul {
//         height: $li-size * 8 + $li-margin * 7;
//         margin: 5px;
//         display: inline-block;
//         vertical-align: top;
//         &.dot-types li {
//             padding: 5px;
//             background: $light-gray;
//             font-size: 0;
//             cursor: pointer;
//             &:not(:last-child) {
//                 margin-bottom: $li-margin;
//             }
//             img {
//                 width: $dot-type-size;
//             }
//         }
//         &.dot-labels {
//             overflow: scroll;
//             margin-left: 0;
//             background: $light-gray;
//             li {
//                 @include unselectable;
//                 padding: 5px 20px;
//                 text-align: center;
//                 &.active {
//                     background: $blue;
//                     color: $light-gray;
//                 }
//             }
//         }
//     }
// }

// .workspace {
//     &.edit-tools-active {
//         cursor: crosshair;
//     }
//     .selection-box {
//         position: absolute;
//         border: 2px solid rgba($white, 0.8);
//         background: rgba($white, 0.2);
//     }
//     .stretch-box {
//         position: absolute;
//         border: 1px solid $gold;
//     }
//     .edit-tool-path {
//         stroke: $gold;
//         fill: none;
//     }
//     .lasso-path {
//         fill: rgba($light-gray, 0.3);
//     }
// }

// /** CONTINUITY CONTEXT **/

// .popup.edit-continuity {
//     label {
//         width: 125px;
//     }
//     .customText {
//         label {
//             width: initial;
//             margin: 5px 0;
//         }
//         textarea {
//             width: 100%;
//             max-width: 100%;
//         }
//     }
//     &.continuity-cm, &.continuity-mt, &.continuity-close {
//         .duration {
//             label {
//                 width: initial;
//             }
//             select {
//                 width: 125px;
//             }
//             & > input {
//                 margin-left: 10px;
//                 width: 50px;
//                 vertical-align: middle;
//             }
//         }
//     }
// }

// .panel.continuity {
//     width: 300px;
//     .add-continuity {
//         padding: 10px;
//         background: $light-gray;
//         select {
//             width: 100%;
//         }
//         .chosen-container {
//             .chosen-default {
//                 color: $blue;
//                 font-size: $font-size;
//             }
//             .chosen-results {
//                 max-height: 125px;
//             }
//         }
//     }
//     .continuities {
//         height: 125px;
//         padding: 10px;
//         padding-top: 0;
//         overflow-y: auto;
//         border-bottom: 2px solid $black;
//         background: $light-gray;
//         .continuity {
//             @include vertically-center(false);
//             padding: 10px;
//             background: $light-gold;
//             &:not(:last-child) {
//                 margin-bottom: 5px;
//             }
//             .info {
//                 @include vertically-center(false);
//                 & > span {
//                     width: 50px;
//                     margin-right: 5px;
//                 }
//                 label {
//                     margin-right: 5px;
//                 }
//                 input[type=number] {
//                     width: 50px;
//                     margin-right: 5px;
//                 }
//             }
//             .actions {
//                 @include vertically-center-self;
//                 position: absolute;
//                 right: 10px;
//                 i {
//                     margin: 0 2px;
//                     cursor: pointer;
//                     &.delete {
//                         color: $red;
//                     }
//                 }
//             }
//             select {
//                 -webkit-appearance: none;
//                 padding: 5px 10px;
//                 padding-right: 20px;
//                 width: initial;
//                 background: $light-gray url(img/updown.png) no-repeat right;
//                 background-size: 1.2em;
//                 color: $blue;
//                 border: 1px solid $medium-gray;
//                 border-radius: 3px;
//                 font-size: 0.8em;
//                 vertical-align: middle;
//                 outline: 0;
//                 cursor: pointer;
//             }
//             .info i {
//                 cursor: pointer;
//                 margin: 0 5px;
//                 padding: 5px;
//                 background: $blue;
//                 color: $white;
//                 &:hover {
//                     background: lighten($blue, 10);
//                 }
//             }
//             &.mt, &.close {
//                 select {
//                     margin-right: 5px;
//                 }
//             }
//         }
//     }
//     .dot-types {
//         @include unselectable;
//         height: 35px;
//         padding: 0 10px 5px;
//         top: -2px;
//         background: $dark-gray;
//         overflow-x: auto;
//         li {
//             display: inline-block;
//             padding: 5px 7px;
//             background: $medium-gray;
//             border: 2px solid $black;
//             cursor: pointer;
//             font-size: 14px;
//             vertical-align: top;
//             color: $black;
//             &:hover {
//                 background: lighten($medium-gray, 5);
//             }
//             &:not(:last-child) {
//                 border-right: none;
//             }
//             &.active {
//                 background: $light-gray;
//                 border-top-color: transparent;
//                 color: $blue;
//             }
//             &.all-before, &.all-after {
//                 padding-top: 6px;
//                 padding-bottom: 4px;
//             }
//             img {
//                 height: 1em;
//             }
//         }
//     }
// }

// .panel-dropdown {
//     @include hover-menu;
//     z-index: z-index(popup);
//     border-radius: 3px;
//     li {
//         padding: 5px;
//         text-align: center;
//     }
// }

// /** CONTINUITY DOT CONTEXT **/

// body.context-continuity-dots .workspace .graph {
//     .dots .dot {
//         opacity: 0.5;
//     }
// }

// .panel.continuity-dots {
//     .panel-content {
//         padding: 5px;
//     }
//     .dot-order {
//         margin-bottom: 5px;
//         max-height: 300px;
//         overflow-y: auto;
//         .dot {
//             padding-top: 5px;
//             text-align: center;
//             background: $light-gray;
//             cursor: ns-resize;
//             &:hover {
//                 background: $medium-gray;
//             }
//         }
//     }
//     .buttons button {
//         display: block;
//         margin: 0;
//         margin-bottom: 5px;
//         padding: 10px 25px;
//         &:last-child {
//             margin-bottom: 0;
//         }
//     }
// }

// /** FTL PATH CONTEXT **/

// body.context-ftl-path .workspace .graph {
//     .dots .dot {
//         opacity: 0.5;
//     }
//     .ref-point {
//         fill: $gold;
//         &.highlight {
//             fill: $highlight-purple;
//         }
//     }
// }

// .ftl-path-helper {
//     stroke: $gold;
//     fill: none;
// }

// // add-point helper
// .ftl-path-add-point {
//     stroke: $gold;
//     fill: none;
// }

// .panel.ftl-path {
//     .panel-content {
//         padding: 5px;
//     }
//     .ftl-path-points {
//         margin-bottom: 5px;
//         .point {
//             padding-top: 5px;
//             text-align: center;
//             background: $light-gray;
//             cursor: ns-resize;
//             &:hover {
//                 background: $medium-gray;
//             }
//         }
//     }
//     .buttons button.submit {
//         margin: 0;
//         padding: 10px 25px;
//     }
// }

// /** GATE REFERENCE CONTEXT **/

// body.context-gate-reference .workspace .graph {
//     cursor: crosshair;
//     .gate-reference-helper, .gate-reference-point {
//         fill: $gold;
//     }
//     .gate-reference-helper {
//         opacity: 0.7;
//     }
// }

// /** MUSIC CONTEXT **/

// body.context-music .workspace {
//     text-align: center;
//     padding: 10px;
//     .show-audio {
//         display: inline-block;
//         label {
//             margin-right: 5px;
//         }
//         .icons {
//             display: inline-block;
//             margin-left: 10px;
//             vertical-align: middle;
//             i {
//                 cursor: pointer;
//                 &.delete-link {
//                     color: $red;
//                 }
//             }
//         }
//     }
//     .beats-editor {
//         @include remove-children-space;
//         $col-width: 130px;
//         table {
//             display: inline-block;
//             thead {
//                 display: block;
//                 th {
//                     font-size: 1.1em;
//                     font-weight: bold;
//                     padding-top: 7px;
//                 }
//             }
//             tbody {
//                 max-height: 325px;
//                 overflow: auto;
//                 display: block;
//                 td.millisecond {
//                     padding: 0;
//                     input {
//                         border: 0;
//                         box-shadow: none;
//                         width: 100%;
//                         padding: 5px;
//                         padding-top: 7px;
//                     }
//                 }
//             }
//             td, th {
//                 width: $col-width;
//                 text-align: center;
//             }
//         }
//         .viewer-preview {
//             display: inline-block;
//             width: calc(100% - #{$col-width * 2 + 10px});
//             height: 350px;
//             vertical-align: top;
//             padding: 20px;
//             .animated-grapher {
//                 display: inline-block;
//                 margin: 10px;
//                 height: 75%;
//                 width: 75%;
//             }
//             .seek {
//                 // @include seek-bar;
//                 margin-top: 0;
//             }
//             .controls {
//                 @include unselectable;
//                 margin: 20px 0;
//                 i {
//                     cursor: pointer;
//                     font-size: 24px;
//                     margin: 0 10px;
//                 }
//             }
//         }
//     }
// }

// /** TWO STEP CONTEXT **/

// .panel.two-step {
//     @extend .panel.continuity;
//     .buttons {
//         background: $dark-gray;
//         padding: 5px;
//         button {
//             margin: 0;
//             width: 100%;
//         }
//     }
// }
</style>
