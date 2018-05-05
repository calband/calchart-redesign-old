<doc>
A toolbar item that can contain any arbitrary elements.
</doc>

<template>
    <div class="toolbar-item">
        <slot />
    </div>
</template>

<style lang="scss" scoped>
.toolbar-item {
    display: inline-block;
    cursor: default;
    vertical-align: middle;
    margin-right: 10px;
    &:last-child {
        margin-right: 0;
    }
}
</style>
