<doc>
A custom item in the toolbar in the editor application.
</doc>

<template>
    <div class="toolbar-item">
        <slot />
    </div>
</template>

<style lang="scss" scoped>
.toolbar-item {
    display: inline-block;
}
</style>
