<doc>
A menu tab in the Editor menu.
</doc>

<template>
    <div
        :class="['menu-tab', { active }]"
        @mousedown.stop="$emit('mousedown', $event)"
        @mouseover="$emit('mouseover')"
    >
        <span>{{ label }}</span>
        <EditorSubMenu ref="submenu">
            <slot />
        </EditorSubMenu>
    </div>
</template>

<script>
import EditorSubMenu from './EditorSubMenu';

export default {
    props: {
        label: {
            // The label of the tab
            type: String,
            required: true,
        },
    },
    components: { EditorSubMenu },
    data() {
        return {
            active: false,
        };
    },
    methods: {
        activate() {
            this.active = true;
            this.$refs.submenu.activate();
        },
        deactivate() {
            this.active = false;
            this.$refs.submenu.deactivate();
        },
    },
};
</script>

<style lang="scss" scoped>
.menu-tab {
    display: inline-block;
    span {
        display: inline-block;
        color: $black;
        padding: 7px 10px 3px;
        border: 1px solid transparent;
    }
    &:hover span {
        background: $light-gray-darker;
    }
    &.active span {
        background: $white;
        border: 1px solid rgba($black, 0.2);
        border-bottom: 1px solid $white;
        box-shadow: 0 1px 1px rgba($black, 0.2);
        z-index: z-index(header) + 1;
        // block the border/shadow on the bottom
        &:before {
            content: "";
            position: absolute;
            top: 100%;
            left: 0;
            width: 100%;
            height: 4px;
            background: $white;
        }
    }
}
</style>
