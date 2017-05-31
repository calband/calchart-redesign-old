import { NotImplementedError } from "utils/errors";
import HTMLBuilder from "utils/HTMLBuilder";
import { addShortcutHint } from "utils/UIUtils";

const DIVIDER = Symbol("DIVIDER");

/**
 * A menu for a Calchart application. Initialized with objects of the form:
 *
 * {
 *     label: string,     // the label of the menu item; required, can be HTML
 *     class: string,     // the class for the HTML element
 *     action: string,    // the action to run when clicked; see ApplicationController._parseAction
 *     context: string,   // the context to enable the menu item for, if applicable
 *     icon: string,      // the icon to display in the menu
 *     submenu: object[], // a recursive list of objects of menu items to use as a submenu
 * }
 */
export default class Menu {
    /**
     * @param {ApplicationController} controller
     */
    constructor(controller) {
        this._controller = controller;
        this._menu = $("ul.menu");

        // {jQuery}
        this._activeTab = null;

        // {SubMenu}
        this._activeSubmenu = null;
    }

    /**
     * Initialize this menu within the ul.menu element in the page.
     *
     * @param {ApplicationController} controller
     */
    static init(controller) {
        new this(controller).init();
    }

    get controller() {
        return this._controller;
    }

    /**
     * @return {Symbol} A symbol that indicates a divider in the submenu.
     */
    get DIVIDER() {
        return DIVIDER;
    }

    /**
     * @return {object[]} An array of menu items of the format given above.
     */
    getItems() {
        throw new NotImplementedError(this);
    }

    /**
     * Initialize the menu
     */
    init() {
        this.getItems().forEach(menuTab => {
            let tab = HTMLBuilder.li(menuTab.label, "menu-tab")
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
     * Open the given tab and its submenu in the menu.
     *
     * @param {jQuery} tab
     * @param {SubMenu} submenu
     */
    openSubmenu(tab, submenu) {
        // clicking outside of menu and its submenus closes them
        $(window)
            .off(".close-submenus")
            .on("click.close-submenus", e => {
                if ($(e.target).notIn(".menu-tab, .submenu")) {
                    this.close();
                }
            });
        submenu.open();

        this._activeTab = tab;
        this._activeSubmenu = submenu;
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
        }
    }

    /**
     * Close all menus.
     */
    closeAll() {
        this.close();
    }

    /**
     * Close the the active submenu on the page.
     */
    closeSubmenus() {
        this.close();
    }
}

/**
 * A helper class for creating and interacting with submenus.
 */
class SubMenu {
    /**
     * @param {(Menu|SubMenu)} parentMenu - The parent menu
     * @param {jQuery} parentItem - The menu item that opens this submenu
     * @param {object[]} items - The menu items in this submenu
     */
    constructor(parentMenu, parentItem, items) {
        this._menu = null;
        this._parentMenu = parentMenu;
        this._parentItem = parentItem;

        // split by DIVIDER
        this._items = [[]];
        items.forEach(item => {
            if (item === DIVIDER) {
                this._items.push([]);
            } else {
                _.last(this._items).push(item);
            }
        });

        // {Submenu}
        this._activeSubmenu = null;

        this.init();
    }

    get controller() {
        return this._parentMenu.controller;
    }

    get parentItem() {
        return this._parentItem;
    }

    /**
     * Initialize this menu.
     */
    init() {
        let menuGroups = this._items.map(menuGroup => {
            let items = menuGroup.map(menuItem => this._makeItem(menuItem));
            return HTMLBuilder.make("ul.menu-group").append(items);
        });

        this._menu = HTMLBuilder.div("controller-menu submenu", menuGroups)
            .appendTo("body");
    }

    /**
     * Open this menu.
     */
    open() {
        this._parentMenu.closeSubmenus();
        this._parentItem.addClass("active");

        let offset = this._parentItem.offset();
        if (this.isTopLevel()) {
            this._menu.css({
                top: offset.top + this._parentItem.outerHeight(),
                left: offset.left,
            });
        } else {
            // manually offset a pixel to accentuate hover
            let top = offset.top + 1;
            let left = offset.left + this._parentItem.outerWidth() - 1;

            this._menu.smartPosition(top, left, {
                offRight: offset.left + 1,
                fromBottom: 0,
            });
        }

        this._menu.show();
    }

    /**
     * Open the given submenu.
     *
     * @param {SubMenu} submenu
     */
    openSubmenu(submenu) {
        submenu.open();
        this._activeSubmenu = submenu;
    }

    /**
     * Close this menu.
     */
    close() {
        this._menu.hide();
        this._parentItem.removeClass("active");
        this.closeSubmenus();
    }

    /**
     * Close all menus.
     */
    closeAll() {
        this._parentMenu.close();
    }

    /**
     * Close the active submenu underneath this submenu.
     */
    closeSubmenus() {
        if (this._activeSubmenu) {
            this._activeSubmenu.close();
            this._activeSubmenu = null;
        }
    }

    /**** METHODS ****/

    /**
     * @return {boolean} true if this submenu is open.
     */
    isOpen() {
        return this._menu.is(":visible");
    }

    /**
     * @return {boolean} true if this submenu is a submenu for a menu tab.
     */
    isTopLevel() {
        return this._parentMenu instanceof Menu;
    }

    /**** HELPERS ****/

    /**
     * @param {object} menuItem
     * @return {jQuery} The menu item specified by the given definition.
     */
    _makeItem(menuItem) {
        let item = HTMLBuilder.li("", "menu-item");
        item.html(menuItem.label);

        if (menuItem.class) {
            item.addClass(menuItem.class);
        }
        if (menuItem.icon) {
            item.prepend(HTMLBuilder.icon(menuItem.icon));
        }
        if (menuItem.context) {
            item.addClass(`disabled ${menuItem.context}-group`);
        }
        if (menuItem.action) {
            item.data("action", menuItem.action)
                .click(e => {
                    if (!item.hasClass("disabled")) {
                        this.controller.doAction(menuItem.action);
                        this.closeAll();
                    }
                });

            // addShortcutHint(item, menuItem.action);
        }
        if (menuItem.submenu) {
            let submenu = new SubMenu(this, item, menuItem.submenu);
            item.addClass("has-submenu").mouseenter(e => {
                if (!item.hasClass("disabled")) {
                    this.openSubmenu(submenu);
                }
            });
        }

        item.mouseenter(e => {
            if (this._activeSubmenu && item !== this._activeSubmenu.parentItem) {
                this.closeSubmenus();
            }
        });

        return item;
    }
}
