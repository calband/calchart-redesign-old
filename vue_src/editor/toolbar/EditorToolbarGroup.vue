<doc>
A group of toolbar items in the editor application.
</doc>

<template>
    <div v-show="isContext" class="toolbar-group">
        <slot />
    </div>
</template>

<script>
import { isNull } from 'lodash';

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
    computed: {
        /**
         * @return {Boolean} true if the toolbar group is context-agnostic or
         *   if it matches the current context.
         */
        isContext() {
            return (
                isNull(this.context) ||
                ContextType.isCurrent(this.$store, this.context)
            );
        },
    },
};
</script>

<style lang="scss" scoped>
.toolbar-group {
    display: inline-block;
    padding: 0 5px;
    &:not(:first-child) {
        border-left: 1px solid $medium-gray;
    }
}
</style>
