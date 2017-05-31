import { SubMenu } from "menus/Menu";

// only one context menu can be active at once
let activeContextMenu = null;

/**
 * A context menu displays when a user right-clicks in a Calchart
 * application. Initialized with objects of the form:
 *
 * {
 *     label: string,     // the label of the menu item; required, can be HTML
 *     action: string,    // the action to run when clicked; see ApplicationController._parseAction
 *     submenu: object[], // a recursive list of objects of menu items to use as a submenu
 * }
 */
export default class ContextMenu {
    /**
     * @param {Context} context
     * @param {Event} e
     */
    constructor(context, e) {
        this._context = context;
        this._event = e;
        this._target = $(e.target);
        this._menu = null;
    }

    get controller() {
        return this._context.controller;
    }

    get event() {
        return this._event;
    }

    /**
     * @return {object[]} An array of menu items of the format given above.
     */
    getItems() {
        throw new NotImplementedError(this);
    }

    /**
     * Display the context menu.
     */
    show() {
        this._event.preventDefault();

        // close any existing menus
        if (activeContextMenu) {
            activeContextMenu.close();
        }
        activeContextMenu = this;

        this._target.parents().lockScroll();

        // clicking outside of context menu and its submenus closes them
        $(window).on("click.context-menu", e => {
            if ($(e.target).notIn(".submenu")) {
                this.close();
            }
        });

        this._menu = new ContextSubMenu(this, null, this.getItems());
        this._menu.open();
    }

    /**** METHODS ****/

    /**
     * Close this context menu.
     */
    close() {
        this._menu.close();
        this._target.parents().unlockScroll();
        $(window).off(".context-menu");
    }

    /**
     * A noop for SubMenu.open(); there is nothing to close when the top-level
     * context submenu is opened.
     */
    closeSubmenus() {
    }
}

/**
 * A floating menu in a context menu, both for the main context menu and
 * any of its submenus.
 */
class ContextSubMenu extends SubMenu {
    static get menuClass() {
        return "context-menu";
    }

    /**** METHODS ****/

    open() {
        if (this.isTopLevel()) {
            let event = this._parentMenu.event;
            this._menu
                .css({
                    top: event.pageY,
                    left: event.pageX,
                })
                .show();
        } else {
            super.open();
        }
    }

    close() {
        if (this.isTopLevel()) {
            this._menu.remove();
            this.closeSubmenus();
        } else {
            super.close();
        }
    }

    isTopLevel() {
        return this._parentMenu instanceof ContextMenu;
    }

    makeItem(item, menuItem) {
        // any context menu-specific customizations to menu items
    }
}
