<doc>
A popup for creating a new show.
</doc>

<template>
    <FormPopup
        title="Create Show"
        :hideOnSubmit="false"
        :model="model"
        :fields="fields"
        :onSubmit="createShow"
    />
</template>

<script>
import _ from "lodash";

import { BasePopup, FormPopup } from "./lib";

import { IS_STUNT } from "utils/env";
import ServerAction from "utils/ServerAction";

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
        createShow(data) {
            // TODO: hide buttons

            new ServerAction("create_show").send(data, {
                success: data => {
                    this.hide();
                    // TODO: redirect to editor
                    console.log(data.slug);
                },
                error: xhr => {
                    ServerAction.error(xhr);

                    // TODO: show buttons again
                },
            });

            return false;
        },
    },
};
</script>
