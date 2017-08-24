<docs>
The entry point for the home page.
</docs>

<template>
    <div id="content">
        <div class="home-buttons">
            <button>New Show</button>
        </div>
        <div class="home-content">
            <ul class="tabs" ref="tabs">
                <li
                    v-for="tab in tabs"
                    @click="loadTab(name)"
                >
                    {{ tab.label }}
                </li>
            </ul>
            <p v-if="isLoading" class="loading">Loading...</p>
            <template v-if="activeTab == 'band' && isStunt">
                <h2 class="unpublished">Unpublished</h2>
                <show-list></show-list>
                <h2 class="published">Published</h2>
                <show-list></show-list>
            </template>
            <template v-else>
                <show-list v-bind:shows="$store.state.shows"></show-list>
            </template>
        </div>
    </div>
</template>

<script>
import { mapState, mapGetters, mapActions } from "vuex";

import ShowList from "home/ShowList.vue";

export default {
    components: {
        "show-list": ShowList,
    },
    data: {
        isLoading: true,
    },
    computed: {
        ...mapState([
            "activeTab",
            "isStunt",
        ]),
        ...mapGetters([
            "shows",
        ]),
    },
    methods: {
        ...mapActions([
            "loadTab",
        ]),
    },
    created() {
        $(this.$refs.tabs).children("li:first").click();
    },
};
</script>

<style lang="scss">
    @import "~partials/_mixins.scss";

    body {
        padding: 0;
        padding-top: 20px;
    }

    header {
        margin: 0 20px;
    }

    .messages {
        @include hover-messages;
    }
</style>

<style lang="scss" scoped>
    @import "~partials/_vars.scss";
    @import "~partials/_mixins.scss";
    @import "~partials/_functions.scss";

    $buttons-height: 60px;

    .home-buttons {
        padding: 10px 0;
        height: $buttons-height;
        text-align: center;
        box-shadow: 0 2px 1px $medium-gray;
        z-index: z-index(popup);
        button {
            margin: 0;
        }
    }

    $tabs-width: 200px;
    $height-offset: $header-height + $buttons-height + 20px;

    .home-content {
        background: $light-gray;
        height: calc(100% - #{$height-offset});
        padding: 20px 30px;
    }

    .tabs, .shows {
        @include unselectable;
        display: inline-block;
        vertical-align: top;
        li {
            padding: 15px 20px 10px;
            cursor: pointer;
            &:hover {
                background: $light-gray;
            }
        }
    }

    .tabs {
        width: $tabs-width;
        margin-right: 50px;
        li {
            &.active {
                background: darken($light-gray, 10);
            }
            &:hover:not(.active) {
                background: $semilight-gray;
            }
        }
    }

    .shows {
        width: calc(100% - #{$tabs-width + 70px});
        height: 100%;
        overflow-y: auto;
        h2.unpublished {
            margin-top: 0;
        }
        h2.published {
            margin-top: 20px;
        }
        p.loading {
            text-align: center;
        }
    }
</style>
