import { AbstractMenu, AbstractSubMenu } from "menus/AbstractMenu";

import HTMLBuilder from "utils/HTMLBuilder";

/**
 * A menu for a Calchart application. Menu items should be formatted as
 * specified in menus/AbstractMenu. Menu items can also have the following
 * options:
 *   - {string} context - The context to enable the menu item for, if
 *     applicable
 */
export default class Menu extends AbstractMenu {
    /**
     * @param {ApplicationController} controller
     * @param {jQuery} menu
     */
    constructor(controller, menu) {
        super(controller);

        this._menu = menu;

        // {jQuery}
        this._activeTab = null;

        // {SubMenu}
        this._activeSubmenu = null;
    }

    /**
     * Initialize this menu within the div.menu element in the page.
     *
     * @param {ApplicationController} controller
     */
    static init(controller) {
        new this(controller, $("div.menu")).init();
    }

    /**
     * Initialize the menu
     */
    init() {
        this.getItems().forEach(menuTab => {
            let tab = HTMLBuilder.div("menu-tab")
                .text(menuTab.label)
                .appendTo(this._menu);

            let submenu = new SubMenu(this, tab, menuTab.submenu);

            // clicking toggles submenu
            tab.click(e => {
                if (submenu.isOpen()) {
                    this.close();
                } else {
                    this.openSubmenu(tab, submenu);
                }
            });

            // activate submenu when hovered over
            tab.mouseenter(e => {
                if (this._activeTab && tab !== this._activeTab) {
                    this.openSubmenu(tab, submenu);
                }
            });
        });
    }

    /**
     * Close this menu.
     */
    close() {
        if (this._activeTab) {
            this._activeTab.removeClass("active");
            this._activeSubmenu.close();

            this._activeTab = null;
            this._activeSubmenu = null;
            $(window).off(".close-submenus");
        }
    }

    /**
     * Open the given tab and its submenu in the menu.
     *
     * @param {jQuery} tab
     * @param {SubMenu} submenu
     */
    openSubmenu(tab, submenu) {
        submenu.open();

        // clicking outside of menu and its submenus closes them
        $(window).on("click.close-submenus", e => {
            if ($(e.target).notIn(".menu-tab, .submenu")) {
                this.close();
            }
        });

        this._activeTab = tab;
        this._activeSubmenu = submenu;
    }
}

class SubMenu extends AbstractSubMenu {
    /**
     * @return {string} The class to add to the submenu HTML element.
     */
    static get menuClass() {
        return "controller-menu";
    }

    /**
     * @param {jQuery} item - The menu item to customize.
     * @param {object} menuItem - The parameters for the menu item.
     */
    makeItem(item, menuItem) {
        super.makeItem(item, menuItem);

        if (menuItem.context) {
            item.addClass(`disabled ${menuItem.context}-context`);
        }
    }

    openTopLevel() {
        this._parentMenu.close();
        this._parentItem.addClass("active");

        let offset = this._parentItem.offset();
        this._menu
            .css({
                top: offset.top + this._parentItem.outerHeight(),
                left: offset.left,
            })
            .show();
    }
}
