<doc>
A menu item in the Editor menu.
</doc>

<template>
    <div
        :class="['menu-item', itemClasses]"
        @click="doVuex"
        @mouseover="$emit('mouseover')"
    >
        <i v-if="icon" :data-icon="icon" class="icon" />
        <span>{{ label }}</span>
        <!-- TODO: hint -->
        <EditorSubMenu v-if="hasSubmenu" ref="submenu">
            <slot />
        </EditorSubMenu>
    </div>
</template>

<script>
import { isUndefined } from 'lodash';

import EditorSubMenu from './EditorSubMenu';

export default {
    _isMenuItem: true,
    props: {
        label: {
            // The label of the menu item
            type: String,
            required: true,
        },
        mutation: {
            // A Vuex mutation to run when clicked
            type: String,
            default: null,
        },
        mutationArgs: {
            // Any argument(s) to pass to the Vuex mutation
            type: null,
            default: null,
        },
        action: {
            // A Vuex action to run when clicked
            type: String,
            default: null,
        },
        actionArgs: {
            // Any argument(s) to pass to the Vuex action
            type: null,
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
    },
    components: { EditorSubMenu },
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
            return this.disabled;
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
         * Do the Vuex mutation/action for the menu item.
         */
        doVuex() {
            if (!this.isDisabled) {
                if (this.mutation) {
                    this.$store.commit(
                        `editor/${this.mutation}`, this.mutationArgs
                    );
                } else if (this.action) {
                    this.$store.dispatch(
                        `editor/${this.action}`, this.actionArgs
                    );
                }
            }
        },
    },
};
</script>

<style lang="scss" scoped>
.menu-item {
    padding: 5px 30px;
    cursor: pointer;
    color: $black;
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
