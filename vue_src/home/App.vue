<docs>
The entry point for the home page.
</docs>

<template>
    <div class="home-view">
        <div class="home-buttons">
            <button @click="showPopupCreateShow">New Show</button>
        </div>
        <div class="home-content">
            <ul class="tabs" ref="tabs">
                <li
                    v-for="(tab, name) in tabs"
                    :class="getActiveClass(name)"
                    :key="name"
                    @click="loadTab(name)"
                >{{ tab.label }}</li>
            </ul>
            <div class="shows">
                <template v-if="isLoading">
                    <p class="loading">Loading...</p>
                </template>
                <template v-else-if="showPublished">
                    <h2
                        v-if="shows.unpublished.length > 0"
                        class="unpublished"
                    >Unpublished</h2>
                    <ShowList
                        :shows="shows.unpublished"
                        :isOwner="isOwner"
                        :canPublish="true"
                        @publish="togglePublished"
                    />
                    <h2
                        v-if="shows.published.length > 0"
                        class="published"
                    >Published</h2>
                    <ShowList
                        :shows="shows.published"
                        :isOwner="isOwner"
                        :canPublish="true"
                        @publish="togglePublished"
                    />
                </template>
                <template v-else>
                    <ShowList
                        :shows="shows"
                        :isOwner="isOwner"
                        :canPublish="false"
                        @publish="togglePublished"
                    />
                </template>
            </div>
        </div>
    </div>
</template>

<script>
import $ from 'jquery';
import { isNull } from 'lodash';
import { mapState } from 'vuex';

import ShowList from './ShowList';

import CreateShowPopup from 'popups/CreateShowPopup';
import { showPopup } from 'popups/lib';
import sendAction, { handleError } from 'utils/ajax';
import { findAndRemove } from 'utils/array';

// TODO: move tabs to above home-content (rename home-buttons)
// TODO: have shows display as a box preview

export default {
    name: 'Home',
    components: { ShowList },
    props: {
        allTabs: {
            type: Array,
            required: true,
            validator: obj => obj.length === 2,
        },
    },
    data() {
        let tabs = {};
        this.allTabs.forEach(([name, label]) => {
            tabs[name] = {
                label,
                shows: null, // to be set with loadTab
            };
        });

        return {
            isLoading: true,
            tabs,
            activeTab: this.allTabs[0][0],
        };
    },
    mounted() {
        $(this.$refs.tabs).children('li:first').click();
    },
    computed: {
        /**
         * @return {boolean} true if the User is the owner of the
         *   currently active tab.
         */
        isOwner() {
            return this.activeTab === 'owned' || this.isStunt;
        },
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
            return this.activeTab == 'band' && this.isStunt;
        },
        ...mapState('env', ['isStunt']),
    },
    methods: {
        /**
         * Return a class Object that adds the 'active' class if the given tab
         * is the active tab.
         *
         * @param {String} tab
         * @return {Object}
         */
        getActiveClass(tab) {
            return {
                active: this.activeTab === tab,
            };
        },
        /**
         * Display the shows for the given tab, populating shows
         * from the server if not already loaded.
         *
         * @param {string} tab - The slug of the tab to load
         */
        loadTab(tab) {
            if (isNull(this.tabs[tab].shows)) {
                $.ajax({
                    data: { tab },
                    dataType: 'json',
                    success: data => {
                        if (tab === 'band' && this.isStunt) {
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
                    error: handleError,
                });
            } else {
                this.activeTab = tab;
            }
        },
        /**
         * Display the CreateShowPopup.
         */
        showPopupCreateShow() {
            showPopup(CreateShowPopup);
        },
        /**
         * Toggle the published status of the given show. Should only
         * be called on Cal Band shows.
         *
         * @param {Object} show
         */
        togglePublished(show) {
            let data = {
                publish: !show.published,
                slug: show.slug,
            };
            sendAction('publish_show', data, {
                success: () => {
                    let shows = this.tabs.band.shows;
                    let toRemove = show.published
                        ? shows.published
                        : shows.unpublished;
                    let toAdd = show.published
                        ? shows.unpublished
                        : shows.published;
                    findAndRemove(toRemove, ['slug', show.slug]);
                    toAdd.push(show);
                    show.published = !show.published;
                },
            });
        },
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
            &:hover:not(.active) {
                background: $semilight-gray;
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
