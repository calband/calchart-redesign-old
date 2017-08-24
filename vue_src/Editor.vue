<template>
    <div id="editor">
        <h1>{{ msg }}</h1>
        <p>Hello world</p>
    </div>
</template>

<script>
export default {
    name: "editor",
    data () {
        return {
            msg: "Welcome to Your Vue.js App",
        };
    },
}
</script>

<style lang="scss">
p {
    color: red;
}
</style>
