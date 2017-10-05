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
        class="context-menu"
        :style="position"
    >
        <slot></slot>
    </ul>
</template>

<script>
export default {
    name: "ContextMenu",
    data() {
        return {
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
        },
        hide() {
            this.cmHide = true;
        },
    },
};
</script>

<style lang="scss" scoped>
    .context-menu {
        position: absolute;
        background: $white;
        list-style: none;
        z-index: z-index(context-menu);
        li {
            cursor: pointer;
        }
    }
</style>
