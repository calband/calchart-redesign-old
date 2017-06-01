import DotType from "calchart/DotType";
import { ContinuityPanelMenus as menus } from "editor/EditorContextMenus";
import BasePanel from "panels/BasePanel";

import { CONTINUITIES } from "utils/CalchartUtils";
import { STATIC_PATH } from "utils/env";
import HTMLBuilder from "utils/HTMLBuilder";

export default class ContinuityPanel extends BasePanel {
    /**
     * @param {ContinuityContext} context
     */
    constructor(context) {
        super(context);
    }

    show() {
        super.show();

        this._panel.find(".add-continuity select").dropdown({
            placeholder_text_single: "Add Continuity...",
        });
    }

    refresh() {
        // populate continuities
        let continuities = this._panel.find(".continuities").empty();

        // action icons
        let iconEdit = HTMLBuilder.icon("pencil", "edit");
        let iconDelete = HTMLBuilder.icon("times", "delete");
        let actions = HTMLBuilder.div("actions", [iconEdit, iconDelete]);

        this.getContinuities().forEach(continuity => {
            let label = HTMLBuilder.span(continuity.info.label);
            let contents = continuity.getPanel(this._context);

            let info = HTMLBuilder.div("info", [label].concat(contents));

            let classes = `continuity ${continuity.info.type}`;

            HTMLBuilder.div(classes, [info, actions.clone()])
                .data("continuity", continuity)
                .appendTo(continuities);
        });

        this.refreshFooter();

        // select dots of the active dot type
        let dots = $(`.dot.${this.getDotType()}`);
        this._context.selectDots(dots);
    }

    refreshFooter() {
        // update tabs list in panel
        let tabs = this._panel.find(".dot-types").empty();
        let dotType = this.getDotType();
        let dotTypes = this._context.activeSheet.getDotTypes();

        if (!_.includes(dotTypes, dotType)) {
            dotType = DotType.ALL_BEFORE;
            this._context.setDotType(dotType);
        }

        dotTypes.forEach(type => {
            let tab = HTMLBuilder.make("li.tab")
                .addClass(type)
                .appendTo(tabs)
                .click(e => {
                    this._context.setDotType(type);
                    this._context.refresh("panel");
                });

            if (DotType.isAll(type)) {
                tab.text("All");
            } else {
                let icon = HTMLBuilder.img(`${STATIC_PATH}/img/dot-${type}.png`);
                tab.append(icon);
            }

            if (type === dotType) {
                tab.addClass("active");
            }
        });
    }

    /**** METHODS ****/

    getContent() {
        let select = HTMLBuilder.select()
            .append(HTMLBuilder.make("option")) // add empty option
            .change(e => {
                let type = $(e.currentTarget).val();
                this._context.controller.doAction("addContinuity", [type]);
                $(e.currentTarget).choose("");
            });

        _.each(CONTINUITIES, (continuities, group) => {
            let options = _.map(continuities,(label, value) => 
                HTMLBuilder.make("option")
                    .attr("value", value)
                    .text(label)
            );

            HTMLBuilder.make("optgroup")
                .attr("label", group)
                .append(options)
                .appendTo(select);
        });

        let continuities = HTMLBuilder.div("continuities")
            .on("mousedown", "select", e => {
                e.preventDefault();

                let select = $(e.currentTarget);
                let dropdown = HTMLBuilder.make("ul.panel-dropdown");

                _.each(select.children(), option => {
                    let val = $(option).attr("value");
                    let text = $(option).text();
                    HTMLBuilder.li(text)
                        .click(e => {
                            select.val(val).change();
                        })
                        .appendTo(dropdown);
                });

                // position dropdown so mouse starts on selected option
                let offset = select.offset();
                offset.top -= select.children(":selected").index() * dropdown.children(":first").outerHeight();

                dropdown
                    .css({
                        top: offset.top,
                        left: offset.left,
                        width: select.outerWidth(),
                    })
                    .appendTo("body")
                    .keepOnscreen();

                $(window).one("click", e => {
                    dropdown.remove();
                });
            })
            .on("click", ".continuity .edit", e => {
                let continuity = $(e.currentTarget).parents(".continuity");
                this._context.editContinuity(continuity);
            })
            .on("click", ".continuity .delete", e => {
                let continuity = $(e.currentTarget).parents(".continuity");
                this._context.deleteContinuity(continuity);
            })
            .on("contextmenu", ".continuity", e => {
                let index = $(e.currentTarget).index();
                new menus.ContinuityMenu(this._context, e, index).show();
            });

        return [
            HTMLBuilder.div("add-continuity", [select]),
            continuities,
            this.getFooter(),
        ];
    }

    /**
     * @return {Continuity[]} The continuities to populate the panel with.
     */
    getContinuities() {
        let dotType = this.getDotType();
        return this._context.activeSheet.getContinuities(dotType);
    }

    /**
     * Retrieve the given continuity
     *
     * @param {(jQuery|int)} continuity - The continuity to get, either
     *   the continuity HTML element in the panel, or the index of the
     *   continuity in the panel.
     * @return {Continuity}
     */
    getContinuity(continuity) {
        if (_.isNumber(continuity)) {
            continuity = this._panel.find(".continuity").get(continuity);
        }
        return $(continuity).data("continuity");
    }

    /**
     * @return {DotType} The currently active dot type of the panel.
     */
    getDotType() {
        return this._context.getDotType();
    }

    /**
     * @return {jQuery} The element to put at the bottom of the panel.
     */
    getFooter() {
        return HTMLBuilder.make("ul.dot-types");
    }
}
