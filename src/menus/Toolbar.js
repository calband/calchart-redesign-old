import HTMLBuilder from "utils/HTMLBuilder";
import { convertShortcut } from "utils/JSUtils";
import { setupTooltip } from "utils/UIUtils";

/**
 * A toolbar menu for a Calchart application. Toolbar items should be specified with the
 * following options:
 *   - {string} label - The label of the menu item; required, can be HTML
 *   - {string} class - The class for the HTML element
 *   - {string} action - The action to run when clicked; see ApplicationController._parseAction
 *   - {string} icon - The icon to display next to the menu item
 *   - {object} choices - Instead of showing an icon, display a <select> element with the
 *     given choices, mapping value to label
 *   - {string} custom - Instead of showing an icon, display the given HTML string
 */
export default class Toolbar {
    /**
     * @param {ApplicationController} controller
     * @param {jQuery} toolbar
     */
    constructor(controller, toolbar) {
        this._controller = controller;
        this._toolbar = toolbar;

        // {boolean} remember if the user is currently clicking down
        this._isMousedown = false;
        // {?jQuery} remember the currently focused toolbar item
        this._focusedItem = null;
    }

    /**
     * Initialize this toolbar within the div.toolbar element in the page.
     *
     * @param {ApplicationController} controller
     */
    static init(controller) {
        new this(controller, $("div.toolbar")).init();
    }

    /**
     * @return {object[]} An array of toolbar groups that should contain the following
     *   values:
     *     - {string} context - The context to enable the toolbar group for, if applicable
     *     - {object[]} items - The toolbar items in the group
     */
    getItems() {
        throw new NotImplementedError(this);
    }

    /**
     * Initialize the menu
     */
    init() {
        this.getItems().forEach(toolbarGroup => {
            let group = HTMLBuilder.make("ul.toolbar-group");
            if (toolbarGroup.context) {
                group.addClass(`hide ${toolbarGroup.context}-context`);
            }

            toolbarGroup.items.forEach(toolbarItem => {
                let item = HTMLBuilder.li().appendTo(group);
                this.makeItem(item, toolbarItem);

                let action = toolbarItem.action;
                item.mousedown(e => {
                        this._isMousedown = true;
                        $(window).one("mouseup", e => {
                            this._focusedItem.removeClass("focus");
                        });
                        item.mouseenter();
                    })
                    .mouseenter(e => {
                        if (this._isMousedown && !item.hasClass("disabled")) {
                            this._focusedItem = item;
                            item.addClass("focus");
                        }
                    })
                    .mouseleave(e => {
                        item.removeClass("focus");
                    })
                    .mouseup(e => {
                        this._isMousedown = false;
                        if (!item.hasClass("disabled") && action) {
                            this._controller.doAction(action);
                        }
                        item.mouseleave();
                    });
            });

            group.appendTo(this._toolbar);

            // convert dropdowns
            group.find("select").dropdown();
        });
    }

    /**
     * @param {jQuery} item - The toolbar item to customize.
     * @param {object} toolbarItem - The parameters for the toolbar item.
     */
    makeItem(item, toolbarItem) {
        if (toolbarItem.class) {
            item.addClass(toolbarItem.class);
        } else {
            item.addClass(_.kebabCase(toolbarItem.label));
        }

        if (toolbarItem.icon) {
            item.addClass("toolbar-item")
                .append(HTMLBuilder.icon(toolbarItem.icon));

            let tooltipLabel = toolbarItem.label; 
            let shortcut = this._controller.shortcutCommands[toolbarItem.action];
            if (shortcut) {
                let shortcutHint = convertShortcut(shortcut);
                tooltipLabel = `${tooltipLabel} (${shortcutHint})`;
            }
            setupTooltip(item, tooltipLabel);
        } else {
            item.addClass("toolbar-custom-item");

            if (toolbarItem.choices) {
                HTMLBuilder.label(`${toolbarItem.label}:`).appendTo(item);
                HTMLBuilder.select(toolbarItem.choices).appendTo(item);
            } else if (toolbarItem.custom) {
                item.html(toolbarItem.custom);
            }
        }
    }
}
