<doc>
A group of toolbar items in the editor application.
</doc>

<template>
    <div class="toolbar-group">
        <slot />
    </div>
</template>

<script>
import ContextType from 'editor/ContextType';
import { validateOneOf } from 'utils/validators';

export default {
    props: {
        context: {
            // Only enable group if the given context is the active context
            type: String,
            default: null,
            validator: validateOneOf(ContextType.values),
        },
    },
};
</script>

<style lang="scss" scoped>
.toolbar-group {
    display: inline-block;
}
</style>
