<docs>
A component that represents a context menu. Injected using the context-menu
custom block using loaders/context-menu-loader.js.

A component can only have one context menu. The context menu is added to the
template and can be opened with `this.contextMenu.open(event)`.

Usage:

    <template>
        <p @contextmenu.prevent="this.contextMenu.open($event)">Right click here</p>
    </template>

    <context-menu>
        <li v-if="foo" @click="doFoo">Foo</li>
        <li @click="doBar">Bar</li>
    </context-menu>

    <script>
    export default {
        data: { foo: true },
        methods: {
            doFoo: function() {
                console.log("foo");
            },
            doBar: function() {
                console.log("bar");
            },
        },
    }
    </script>
</docs>

<template>
    <ul
        v-if="!cmHide"
        v-on-click-outside="hide"
        class="context-menu"
        :style="position"
    >
        <slot></slot>
    </ul>
</template>

<script>
import $ from "jquery";

export default {
    _isContextMenu: true,
    updated() {
        if (!this._initClick) {
            // Whenever <li> is clicked, hide context menu
            let menuItems = _.filter(this.$slots.default, ["tag", "li"]);
            _.each(menuItems, node => {
                let callbacks = node.data.on.click.fns;
                if (!_.isArray(callbacks)) {
                    callbacks = [callbacks];
                    node.data.on.click.fns = callbacks;
                }
                callbacks.push($event => this.hide());
            });
            this._initClick = true;
        }
    },
    data() {
        return {
            _initClick: false,
            cmHide: true,
            position: {
                left: null,
                top: null,
            },
        };
    },
    methods: {
        open(e) {
            this.cmHide = false;
            // left/top relative to parent
            let offset = $(this.$parent.$el).offset();
            this.position.left = e.pageX - offset.left;
            this.position.top = e.pageY - offset.top;

            // TODO: smart position
        },
        hide() {
            this.cmHide = true;

            let hideCallback = this.$parent.$options.methods.onContextMenuHide;
            if (hideCallback) {
                hideCallback.call(this.$parent);
            }
        },
    },
};
</script>

<style lang="scss" scoped>
    .context-menu {
        @include hover-menu;
        z-index: z-index(context-menu);
    }
</style>
