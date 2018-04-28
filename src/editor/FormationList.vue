<docs>
The sidebar containing a list of formations for the editor.
</docs>

<template>
    <div>
        <div class="scrollable">
            TODO
        </div>
        <button :click="null" class="add-formation">Add</button>
    </div>
</template>

<script>
import Formation from 'calchart/Formation';
import { validateType } from 'utils/types';

export default {
    props: {
        formations: {
            // The formations to show in the sidebar
            type: Array,
            required: true,
            validator: validateType({
                _type: 'array',
                _wraps: Formation,
            }),
        },
    },
};
</script>

<style lang="scss" scoped>
.scrollable {
    height: calc(100% - #{$toolbar-height});
}

button.add-formation {
    margin: 5px auto;
    display: block;
}
</style>
