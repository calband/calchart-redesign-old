<doc>
A popup that contains a form to be submitted or modified.
</doc>

<template>
    <BasePopup>
        <h1 class="title">{{ title }}</h1>
        <form>
            <slot></slot>
            <div class="buttons">
                <slot name="buttons">
                    <button @click="$emit('submit')">Save</button>
                    <button
                        class="cancel"
                        type="button"
                    >Cancel</button>
                </slot>
            </div>
        </form>
    </BasePopup>
</template>

<script>
import BasePopup from "popups/BasePopup";

export default {
    components: { BasePopup },
    extends: BasePopup,
    props: {
        title: {
            type: String,
            required: true,
        },
    },
};
</script>

<style lang="scss" scoped>
button.cancel {
    @include display-button($red);
}
</style>
