<docs>
The sidebar containing a list of formations for the editor.
</docs>

<template>
    <div>
        <div class="scrollable">
            <div v-for="formation in formations" class="formation">
                <span>{{ formation.name }}</span>
                <Grapher />
            </div>
        </div>
        <button
            @click="showPopup(AddFormationPopup)"
            class="add-formation"
        >Add</button>
    </div>
</template>

<script>
import Formation from 'calchart/Formation';
import Grapher from 'grapher/Grapher';
import AddFormationPopup from 'popups/AddFormationPopup';
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
    components: {
        Grapher,
    },
    constants: {
        AddFormationPopup,
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
