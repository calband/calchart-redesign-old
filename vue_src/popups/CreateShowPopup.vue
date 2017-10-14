<doc>
A popup for creating a new show.
</doc>

<template>
    <FormPopup title="Create Show">
        <vue-form-generator :schema="schema" :model="model" :options="formOptions"></vue-form-generator>
    </FormPopup>
</template>

<script>
import _ from "lodash";

import BasePopup from "popups/BasePopup";
import FormPopup from "popups/FormPopup";
import { IS_STUNT } from "utils/env";
import generateFormData from "utils/forms";

export default {
    components: { FormPopup },
    extends: BasePopup,
    data() {
        let fields = [
            {
                type: "input",
                label: "Name",
                model: "name",
            },
            {
                type: "checkbox",
                label: "For Cal Band",
                model: "isBand",
            },
        ];
        
        if (!IS_STUNT) {
            _.pullAt(fields, 1);
        }

        return generateFormData({ fields });
    },
};
</script>
