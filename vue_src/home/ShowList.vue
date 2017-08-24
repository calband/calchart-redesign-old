<docs>
A list of shows for a tab.
</docs>

<template>
    <ul class="show-list">
        <li v-for="show in shows" v-bind:class="show.slug">{{ show.name }}</li>
    </ul>
</template>

<script>
export default {
};
</script>

<style lang="scss" scoped>
    @import "~partials/_vars.scss";
    @import "~partials/_mixins.scss";
    @import "~partials/_functions.scss";

    .show-list {
        margin: 5px;
        background: $white;
        box-shadow: 0 0 5px $dark-gray;
        li {
            border-bottom: 1px solid darken($semilight-gray, 10);
            &:hover, &.active {
                color: lighten($blue, 20);
                background: $white;
            }
            &:last-child {
                border-bottom: none;
            }
        }
    }
</style>
