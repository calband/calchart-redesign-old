<doc>
A popup for creating a new show.
</doc>

<template>
    <FormPopup title="Create Show" @submit="createShow">
        <CharField
            :required="true"
            name="name"
        />
        <BooleanField
            v-if="IS_STUNT"
            :initial="true"
            name="isBand"
            label="For Cal Band"
        />
    </FormPopup>
</template>

<script>
import _ from "lodash";

import { BasePopup, FormPopup } from "./lib";

import { BooleanField, CharField, cleanFields } from "forms/lib";
import { IS_STUNT } from "utils/env";

export default {
    components: { FormPopup, BooleanField, CharField },
    extends: BasePopup,
    data() {
        return {
            IS_STUNT,
        };
    },
    methods: {
        /**
         * Create a show with the given form values.
         */
        createShow(values) {
            // TODO:
            // new CreateShowAction(this._popup).send({
            //     name: data.name,
            //     is_band: data.isBand,
            // });
            // dont hide popup
            console.log(values);
        },
    },
};
</script>
