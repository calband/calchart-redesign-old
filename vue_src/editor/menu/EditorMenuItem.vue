<doc>
A menu item in the Editor menu.
</doc>

<template>
    <div
        :class="['menu-item', itemClasses]"
        @click="doAction"
        @mouseover="$emit('mouseover')"
    >
        <i v-if="icon" :class="`icon icon-${icon}`"></i>
        <span>{{ label }}</span>
        <!-- TODO: hint -->
        <EditorMenuSubMenu
            v-if="hasSubmenu"
            ref="submenu"
        >
            <slot />
        </EditorMenuSubMenu>
    </div>
</template>

<script>
import { isUndefined } from 'lodash';

import ContextType from 'editor/ContextType';
import { validateOneOf } from 'utils/validators';

import EditorMenuSubMenu from './EditorMenuSubMenu';

export default {
    _isMenuItem: true,
    props: {
        label: {
            // The label of the menu item
            type: String,
            required: true,
        },
        action: {
            // See editor/actions.js
            type: String,
            default: null,
        },
        icon: {
            // The icon to display next to the label
            type: String,
            default: null,
        },
        disabled: {
            // Whether to disable the menu item
            type: Boolean,
            default: false,
        },
        context: {
            // Only enable menu item if the given context is the active context
            type: String,
            default: null,
            validator: validateOneOf(ContextType.values),
        },
    },
    components: { EditorMenuSubMenu },
    data() {
        return {
            active: false,
        };
    },
    computed: {
        /**
         * @return {Object} Classes to add to the menu item.
         */
        itemClasses() {
            return {
                active: this.active,
                disabled: this.isDisabled,
                'has-submenu': this.hasSubmenu,
            };
        },
        /**
         * @return {Boolean} true if the menu item has a submenu.
         */
        hasSubmenu() {
            return !isUndefined(this.$slots.default);
        },
        /**
         * @return {Boolean} true if the menu item is disabled.
         */
        isDisabled() {
            return this.disabled || (
                this.context &&
                !ContextType.isCurrent(this.$store, this.context)
            );
        },
        /**
         * @return {Object} Positioning information for the menu tab.
         */
        position() {
            return this.$el.getBoundingClientRect();
        },
    },
    methods: {
        /**
         * Activate the menu item's submenu.
         */
        activateSubmenu() {
            if (this.hasSubmenu) {
                this.$refs.submenu.activate();
                this.active = true;
            }
        },
        /**
         * Deactivate the menu item's submenu.
         */
        deactivateSubmenu() {
            if (this.hasSubmenu) {
                this.$refs.submenu.deactivate();
                this.active = false;
            }
        },
        /**
         * Do the action for the menu item.
         */
        doAction() {
            if (!this.isDisabled && this.action) {
                this.$store.dispatch('editor/doAction', this.action);
            }
        },
    },
};
</script>

<style lang="scss" scoped>
.menu-item {
    padding: 5px 30px;
    cursor: pointer;
    color: $dark-gray;
    span {
        top: 0.1em;
    }
    &:hover, &.active {
        &:not(.disabled) {
            background: $light-gray;
        }
    }
    &.disabled {
        color: $light-gray;
        cursor: default;
    }
    &.has-submenu:after {
        @include vertically-center-self;
        position: absolute;
        content: "\5c";
        font-family: "icons";
        font-size: 0.9em;
        vertical-align: middle;
        right: 5px;
        color: $medium-gray;
    }
    .icon {
        position: absolute;
        left: 5px;
    }
}
</style>
