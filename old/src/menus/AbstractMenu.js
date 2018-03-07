import { NotImplementedError } from "utils/errors";
import HTMLBuilder from "utils/HTMLBuilder";
import { convertShortcut } from "utils/JSUtils";

const DIVIDER = Symbol("DIVIDER");

/**
 * An abstract superclass for a menu. Menu items should be specified with the
 * following options:
 *   - {string} label - The label of the menu item; required, can be HTML
 *   - {string} class - The class for the HTML element
 *   - {string} action - The action to run when clicked; see ApplicationController._parseAction
 *   - {string} icon - The icon to display next to the menu item
 *   - {object[]} submenu - A recursive list of menu items to use as a submenu
 */
export class AbstractMenu {
    /**
     * @param {ApplicationController} controller
     */
    constructor(controller) {
        this._controller = controller;
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
     * @return {object[]} An array of menu items as specified above.
     */
    getItems() {
        throw new NotImplementedError(this);
    }

    /**
     * Close this menu.
     */
    close() {
        throw new NotImplementedError(this);
    }
}

/**
 * A floating menu that is shown when a menu item in a parent menu is hovered over.
 */
export class AbstractSubMenu {
    /**
     * @param {(AbstractMenu|AbstractSubMenu)} parentMenu - The menu containing parentItem
     * @param {jQuery} parentItem - The menu item that opens this submenu
     * @param {object[]} items - The menu items in this submenu
     */
    constructor(parentMenu, parentItem, items) {
        this._parentMenu = parentMenu;
        this._parentItem = parentItem;

        // {object[][]} The items, split by DIVIDER
        this._items = [[]];
        items.forEach(item => {
            if (item === DIVIDER) {
                this._items.push([]);
            } else {
                _.last(this._items).push(item);
            }
        });

        // {jQuery}
        this._menu = null;

        // {AbstractSubMenu[]}
        this._submenus = [];

        // {SubMenu}
        this._activeSubmenu = null;

        this.initMenu();
    }

    /**
     * @return {string} Any classes to add to the submenu HTML element.
     */
    static get menuClass() {
        return "";
    }

    /**
     * @return {ApplicationController}
     */
    get controller() {
        return this._parentMenu.controller;
    }

    get parentItem() {
        return this._parentItem;
    }

    /**
     * Initialize the submenu HTML element.
     */
    initMenu() {
        let menuGroups = this._items.map(menuGroup => {
            let items = menuGroup.map(menuItem => {
                let item = HTMLBuilder.li("", "menu-item");
                item.html(menuItem.label);

                if (menuItem.action) {
                    item.data("action", menuItem.action)
                        .click(e => {
                            if (!item.hasClass("disabled")) {
                                this.controller.doAction(menuItem.action);
                                this.closeAll();
                            }
                        });

                    let shortcut = this.controller.shortcutCommands[menuItem.action];
                    if (shortcut) {
                        HTMLBuilder.span("", "hint")
                            .html(convertShortcut(shortcut))
                            .appendTo(item);
                    }
                }

                if (menuItem.submenu) {
                    let submenu = new this.constructor(this, item, menuItem.submenu);
                    item.addClass("has-submenu").mouseenter(e => {
                        if (!item.hasClass("disabled")) {
                            this.openSubmenu(submenu);
                        }
                    });
                    this._submenus.push(submenu);
                }

                item.mouseenter(e => {
                    if (this._activeSubmenu && item !== this._activeSubmenu.parentItem) {
                        this.closeSubmenus();
                    }
                });

                this.makeItem(item, menuItem);

                return item;
            });
            return HTMLBuilder.make("ul.menu-group").append(items);
        });

        this._menu = HTMLBuilder.div(`submenu ${this.constructor.menuClass}`, menuGroups);

        // make sure submenus appear after the main menu
        this.attach();
        this._submenus.forEach(submenu => {
            submenu.attach();
        });
    }

    /**
     * Open this submenu.
     */
    open() {
        if (this.isTopLevel()) {
            this.openTopLevel();
            return;
        }

        this._parentMenu.closeSubmenus();
        this._parentItem.addClass("active");

        // manually offset a pixel to accentuate hover
        let offset = this._parentItem.offset();
        let top = offset.top + 1;
        let left = offset.left + this._parentItem.outerWidth() - 1;

        this._menu
            .smartPosition(top, left, {
                offRight: offset.left + 1,
                fromBottom: 0,
            })
            .show();
    }

    /**
     * Open this submenu, in the case of this submenu being top-level.
     */
    openTopLevel() {
        throw new NotImplementedError(this);
    }

    /**
     * Close this menu.
     */
    close() {
        this._menu.hide();
        this.closeSubmenus();

        if (this._parentItem) {
            this._parentItem.removeClass("active");
        }
    }

    /**** METHODS ****/

    /**
     * Add this menu to the page.
     */
    attach() {
        this._menu.appendTo("body");
    }

    /**
     * Close all menus.
     */
    closeAll() {
        if (this.isTopLevel()) {
            this._parentMenu.close();
        } else {
            this._parentMenu.closeAll();
        }
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

    /**
     * @return {boolean} true if this submenu is open.
     */
    isOpen() {
        return this._menu.is(":visible");
    }

    /**
     * @return {boolean} true if this submenu is the first submenu in
     *   the submenu hierarchy.
     */
    isTopLevel() {
        return this._parentMenu instanceof AbstractMenu;
    }

    /**
     * @param {jQuery} item - The menu item to customize.
     * @param {object} menuItem - The parameters for the menu item.
     */
    makeItem(item, menuItem) {
        if (menuItem.class) {
            item.addClass(menuItem.class);
        }

        if (menuItem.icon) {
            item.prepend(HTMLBuilder.icon(menuItem.icon));
        }
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
}
