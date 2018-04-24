<doc>
A submenu in the Editor menu.
</doc>

<template>
    <div
        v-show="active"
        :style="position"
        class="submenu"
    >
        <slot />
    </div>
</template>

<script>
export default {
    data() {
        return {
            active: false,
            activeItem: null,
            position: {
                left: 0,
                top: 0,
            },
        };
    },
    mounted() {
        this.forEachItem(menuItem => {
            menuItem.$on('mouseover', () => {
                if (this.activeItem !== menuItem) {
                    if (this.activeItem) {
                        this.activeItem.deactivateSubmenu();
                    }
                    menuItem.activateSubmenu();
                    this.activeItem = menuItem;
                }
            });
        });
    },
    computed: {
        /**
         * @return {Boolean} True if this submenu is the top-level submenu
         *   for a menu tab.
         */
        isTopLevel() {
            return ! this.$parent.$options._isMenuItem;
        },
    },
    methods: {
        /**
         * Activate the submenu.
         */
        activate() {
            this.active = true;

            this.$nextTick(() => {
                // set position from top-left corner of page
                let parentPos = this.$parent.$el.getBoundingClientRect();
                let width = this.$el.getBoundingClientRect().width;
                let windowWidth = document.documentElement.clientWidth;
                if (this.isTopLevel) {
                    this.position.top = parentPos.bottom;

                    if (parentPos.left + width <= windowWidth) {
                        this.position.left = parentPos.left;
                    } else {
                        this.position.left = parentPos.right - width;
                    }
                } else {
                    this.position.top = parentPos.top;
                    // cool 3D effect
                    this.position.left = parentPos.right - 2;
                }
            });
        },
        /**
         * Deactivate the submenu.
         */
        deactivate() {
            this.active = false;
            if (this.activeItem) {
                this.activeItem.deactivateSubmenu();
            }
            this.activeItem = null;
        },
        /**
         * Run the given callback for all EditorMenuItem nodes.
         *
         * @param {Function} cb
         */
        forEachItem(cb) {
            this.$slots.default.forEach(node => {
                if (node.componentInstance.$options._isMenuItem) {
                    cb(node.componentInstance);
                }
            });
        },
    },
};
</script>

<style lang="scss" scoped>
.submenu {
    position: fixed;
    background: $white;
    border: 1px solid rgba($black, 0.2);
    box-shadow: 0 0 1px rgba($black, 0.2);
    padding: 5px 0;
    left: 0;
    top: 1.4em;
    z-index: z-index(header);
}
</style>
