import { AbstractMenu, AbstractSubMenu } from "menus/AbstractMenu";

// only one context menu can be active at once
let activeContextMenu = null;

/**
 * A context menu created and displayed when a user right-clicks in a
 * Calchart application. Menu items should be formatted as specified
 * in menus/AbstractMenu.
 */
export default class ContextMenu extends AbstractMenu {
    /**
     * @param {Controller} controller
     * @param {Event} e
     */
    constructor(controller, e) {
        super(controller);

        this._event = e;

        // {ContextSubMenu}
        this._menu = null;

        // {jQuery}
        this._target = $(e.target);
    }

    get event() {
        return this._event;
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

    close() {
        this._menu.destroy();
        this._target.parents().unlockScroll();
        $(window).off(".context-menu");
        activeContextMenu = null;
    }
}

class ContextSubMenu extends AbstractSubMenu {
    static get menuClass() {
        return "context-menu";
    }

    /**
     * Close and remove this menu.
     */
    destroy() {
        this._menu.remove();
        this._submenus.forEach(submenu => submenu.destroy());
    }

    openTopLevel() {
        let event = this._parentMenu.event;
        this._menu
            .smartPosition(event.pageY, event.pageX)
            .show();
    }
}
