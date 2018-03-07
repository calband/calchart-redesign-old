<doc>
The component that displays an interface to edit music-related aspects of the
show in the editor application.
</doc>

<template>
    <div class="music-content">
        <div class="top-panel">
            <div class="song-list" />
            <div class="sheet-list" />
        </div>
        <div class="workspace">
            <div class="show-audio">
                <label>Audio file for show:</label>
                <div class="icons">
                    <i class="icon-pencil edit-link" />
                    <i class="icon-times delete-link" />
                </div>
            </div>
            <button class="upload-beats-audio">Upload Beats Audio</button>
            <div class="beats-editor">
                <table>
                    <thead>
                        <th>Beat</th>
                        <th>Milliseconds</th>
                    </thead>
                    <tbody />
                </table>
                <div class="viewer-preview" />
            </div>
        </div>
    </div>
</template>

<script>
export default {

};
</script>

<style lang="scss" scoped>
.top-panel {
    @include remove-children-space;
    height: 150px;
    border-bottom: 3px double $medium-gray;
    .song-list, .sheet-list {
        display: inline-block;
        vertical-align: top;
        height: 100%;
        padding: 10px;
    }
    $song-width: 300px;
    .song-list {
        overflow-y: auto;
        border-right: 3px double $medium-gray;
        width: $song-width;
        .song {
            background: $semilight-gray;
            padding: 10px;
            cursor: pointer;
            margin-bottom: 5px;
            &:last-child {
                margin-bottom: 0;
            }
            &:hover {
                background: $light-gray;
            }
            &.active {
                background: $light-gray;
                span {
                    color: $gold;
                }
            }
            span {
                @include max-text-width(210px);
            }
            .actions {
                @include vertically-center-self;
                position: absolute;
                right: 10px;
                i {
                    margin: 0 2px;
                    cursor: pointer;
                    &.delete {
                        color: $red;
                    }
                }
            }
        }
        p.no-songs {
            text-align: center;
        }
    }
    .sheet-list {
        width: calc(100% - #{$song-width});
        white-space: nowrap;
        overflow-x: auto;
        .stuntsheet {
            display: inline-block;
            width: 175px;
            cursor: pointer;
            margin-right: 10px;
            &:last-child {
                margin-right: 0;
            }
        }
    }
}
</style>
