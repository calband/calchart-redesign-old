<doc>
A custom item in the toolbar in the editor application.
</doc>

<template>
    <div
        @mousedown="$emit('mousedown', $event)"
        @mouseup="$emit('mouseup', $event)"
        @mouseenter="$emit('mouseenter', $event)"
        @mouseleave="$emit('mouseleave', $event)"
        class="toolbar-item"
    >
        <slot></slot>
    </div>
</template>

<style lang="scss" scoped>
.toolbar-item {
    display: inline-block;
    margin: 0 1px;
    cursor: default;
    vertical-align: middle;
}
</style>
