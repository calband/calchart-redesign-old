<doc>
A popup for creating a new show.
</doc>

<template>
    <FormPopup title="Create Show" @submit="createShow">
        <formly-form :form="form" :model="model" :fields="fields"></formly-form>
    </FormPopup>
</template>

<script>
import _ from "lodash";

import { BasePopup, FormPopup } from "./lib";

import { IS_STUNT } from "utils/env";

export default {
    components: { FormPopup },
    extends: BasePopup,
    data() {
        return {
            form: {},
            model: {
                name: "",
                isBand: IS_STUNT,
            },
            fields: [
                {
                    key: "name",
                    type: "text",
                    required: true,
                },
                {
                    key: "isBand",
                    type: "checkbox",
                    display: () => IS_STUNT,
                    templateOptions: {
                        label: "For Cal Band",
                    },
                },
            ],
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
