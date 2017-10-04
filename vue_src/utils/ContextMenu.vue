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
    import ContextMenu from "utils/ContextMenu.vue";
    export default {
        components: { ContextMenu },
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
    <ul class="context-menu" v-if="!cmHide">
        <slot></slot>
    </ul>
</template>

<script>
export default {
    name: "ContextMenu",
    data: function() {
        return {
            cmHide: true,
        };
    },
    methods: {
        open: function(e) {
            this.cmHide = false;
        },
        hide: function() {
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
