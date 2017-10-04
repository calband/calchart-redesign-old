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
                <li
                    v-for="(tab, name) in tabs"
                    @click="loadTab(name)"
                >{{ tab.label }}</li>
            </ul>
            <div class="shows">
                <template v-if="isLoading">
                    <p class="loading">Loading...</p>
                </template>
                <template v-else-if="showPublished">
                    <h2 class="unpublished">Unpublished</h2>
                    <show-list v-bind:shows="shows.unpublished"></show-list>
                    <h2 class="published">Published</h2>
                    <show-list v-bind:shows="shows.published"></show-list>
                </template>
                <template v-else>
                    <show-list v-bind:shows="shows"></show-list>
                </template>
            </div>
        </div>
    </div>
</template>

<script>
import ShowList from "home/ShowList.vue";

import _ from "lodash";
import { IS_STUNT } from "utils/env";
import ServerAction from "utils/ServerAction";

// Convert tabs from an array of tuples into an object
const tabs = {};
window.tabs.forEach(([name, label]) => {
    tabs[name] = {
        label,
        shows: null, // to be set with loadTab
    };
});

export default {
    components: { ShowList },
    data() {
        return {
            isLoading: true,
            tabs,
            activeTab: window.tabs[0][0],
        };
    },
    computed: {
        /**
         * @return {Object[]} The shows in the currently active tab
         */
        shows() {
            return this.tabs[this.activeTab].shows;
        },
        /**
         * @return {boolean} true to display shows as published or
         *   unpublished
         */
        showPublished() {
            return this.activeTab == "band" && IS_STUNT;
        },
    },
    methods: {
        /**
         * Display the shows for the given tab, populating shows
         * from the server if not already loaded.
         *
         * @param {string} tab - The slug of the tab to load
         */
        loadTab(tab) {
            if (_.isNull(this.tabs[tab].shows)) {
                $.ajax({
                    data: { tab },
                    dataType: "json",
                    success: data => {
                        if (tab === "band" && IS_STUNT) {
                            let shows = {
                                unpublished: [],
                                published: [],
                            };
                            data.shows.forEach(show => {
                                if (show.published) {
                                    shows.published.push(show);
                                } else {
                                    shows.unpublished.push(show);
                                }
                            });
                            this.tabs[tab].shows = shows;
                        } else {
                            this.tabs[tab].shows = data.shows;
                        }

                        this.isLoading = false;
                        this.activeTab = tab;
                    },
                });
            } else {
                this.activeTab = tab;
            }
        },
        /**
         * Toggle the published status of the given show. Should only
         * be called on Cal Band shows.
         *
         * @param {Object} show
         */
        togglePublished(show) {
            let data = {
                publish: show.published,
                slug: show.slug,
            };
            new ServerAction(this, "publish_show").send(data, {
                success: () => {
                    _.remove(
                        this.tabs.band.shows,
                        _.matchesProperty("slug", show.slug),
                    );
                    this.tabs.band.shows.push(show);
                    show.published = !show.published;
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
        min-width: 700px;
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
    $height-offset: $header-height + $buttons-height;

    .home-content {
        background: $light-gray;
        height: calc(100% - #{$height-offset});
        padding: 20px 30px;
    }

    .tabs, .shows {
        @include unselectable;
        display: inline-block;
        vertical-align: top;
    }

    .tabs {
        width: $tabs-width;
        margin-right: 50px;
        li {
            padding: 15px 20px 10px;
            cursor: pointer;
            &.active {
                background: darken($light-gray, 10);
            }
            &:hover {
                background: $light-gray;
                &:not(.active) {
                    background: $semilight-gray;
                }
            }
        }
    }

    .shows {
        width: calc(100% - #{$tabs-width + 70px});
        height: 100%;
        overflow-y: auto;
        p.loading {
            margin-top: 15px;
            text-align: center;
        }
        h2.published {
            margin-top: 20px;
        }
    }
</style>
