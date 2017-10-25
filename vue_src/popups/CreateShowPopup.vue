<doc>
A popup for creating a new show.
</doc>

<template>
    <FormPopup
        title="Create Show"
        :model="model"
        :fields="fields"
        @submit="createShow"
    />
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
        createShow() {
            // TODO:
            // new CreateShowAction(this._popup).send({
            //     name: data.name,
            //     is_band: data.isBand,
            // });
            // // dont hide popup
            console.log(this.model.name);
            console.log(this.model.isBand);
        },
    },
};
</script>
