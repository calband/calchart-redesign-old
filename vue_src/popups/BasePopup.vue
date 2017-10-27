<doc>
The base component for a generic popup.
</doc>

<template>
    <div class="popup-wrapper">
        <div v-on-click-outside="hide" class="popup">
            <slot></slot>
        </div>
    </div>
</template>

<script>
import $ from 'jquery';

import { $root } from 'utils/vue';

export default {
    methods: {
        open() {
            $('body').append(this.$el);
            // ESC closes popup
            $(window).on('keyup.popup', e => {
                if (e.which === 27) {
                    this.hide();
                }
            });
        },
        hide() {
            $(window).off('.popup');
            this.$destroy();
            $(this.$el).remove();
        },
    },
    computed: {
        $router() {
            return $root.$router;
        },
    },
};
</script>

<style lang="scss" scoped>
    .popup-wrapper {
        @include vertically-center;
        position: fixed;
        z-index: z-index(popup);
        left: 0;
        top: 0;
        width: 100%;
        height: 100%;
        background: rgba($white, 0.4);
        text-align: center;
        overflow-y: auto;
        padding: 50px 0;
    }
    .popup {
        display: inline-block;
        width: 500px;
        border-radius: 5px;
        background: white;
        box-shadow: 0 0 10px $dark-gray;
        padding: 20px 30px;
    }
</style>
