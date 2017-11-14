<doc>
The toolbar in the editor application.
</doc>

<template>
    <div class="toolbar">

    </div>
</template>

<script>
export default {

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
