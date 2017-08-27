<docs>
The entry point for the home page.
</docs>

<template>
    <div>
        <div class="home-buttons">
            <button>New Show</button>
        </div>
        <div class="home-content">
            <ul class="tabs" ref="tabs">
                <template v-for="tab in tabs">
                    <li @click="loadTab(tab.name)">{{ tab.label }}</li>
                </template>
            </ul>
            <p v-if="isLoading" class="loading">Loading...</p>
            <template v-if="showPublished">
                <h2 class="unpublished">Unpublished</h2>
                <show-list></show-list>
                <h2 class="published">Published</h2>
                <show-list></show-list>
            </template>
            <template v-else>
                <show-list v-bind:shows="shows"></show-list>
            </template>
        </div>
    </div>
</template>

<script>
import ShowList from "home/ShowList.vue";

import { IS_STUNT } from "utils/env";

// Convert tabs from an array of tuples into an object
const tabs = {};
window.tabs.forEach(([name, label]) => {
    tabs[name] = {
        label,
        shows: null, // to be set with loadTab
    };
});

export default {
    components: {
        "show-list": ShowList,
    },
    data() {
        return {
            isLoading: true,
            tabs,
            activeTab: window.tabs[0][0],
        };
    },
    computed: {
        shows() {
            return this.tabs[this.activeTab].shows;
        },
        showPublished() {
            return this.activeTab == "band" && IS_STUNT;
        },
    },
    methods: {
        loadTab(tab) {
            console.log(tab);
            return $.ajax({
                data: { tab },
                dataType: "json",
                success: data => {
                    // if band and is stunt, split shows into unpublished/published
                    this.tabs[tab].shows = data.shows;
                    this.isLoading = false;
                },
            });
        },
    },
    mounted() {
        $(this.$refs.tabs).children("li:first").click();
    },
};
</script>

<style lang="scss">
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
