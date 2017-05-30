import ApplicationController from "controllers/ApplicationController";
import Context from "editor/Context";
import EditShowPopup from "popups/EditShowPopup";

import { IS_LOCAL } from "utils/env";
import { ActionError, ValidationError } from "utils/errors";
import HTMLBuilder from "utils/HTMLBuilder";
import { empty, underscoreKeys, update } from "utils/JSUtils";
import {
    doAction,
    setupMenu,
    setupToolbar,
    showMessage,
} from "utils/UIUtils";

/**
 * The controller that stores the state of the editor application and contains
 * all of the actions that can be run in the editor page.
 *
 * Most actions are delegated to the active context, which determines the
 * actions currently available to the user. See BaseContext for more details.
 */
export default class EditorController extends ApplicationController {
    /**
     * @param {Show} show - The show being edited in the application.
     */
    constructor(show) {
        super(show);

        this._context = null;

        this._undoHistory = [];
        this._redoHistory = [];

        // track last saved state of show
        this._savedShow = JSON.stringify(this.show.serialize());
    }

    /**
     * See EditorActions.
     */
    static get actions() {
        return EditorActions;
    }

    static get shortcuts() {
        return EditorShortcuts;
    }

    static getAllShortcutCommands() {
        return _.extend(super.getAllShortcutCommands(), Context.getAllShortcutCommands());
    }

    init() {
        super.init();

        Context.init(this);

        setupMenu(".menu");
        setupToolbar(".toolbar");

        // prompt user if leaving while unsaved, unless in development
        if (!IS_LOCAL) {
            $(window).on("beforeunload", () => {
                let data = JSON.stringify(this.show.serialize());
                if (data !== this._savedShow) {
                    return true;
                }
            });
        }

        this.loadContext("dot");

        let sheet = this.show.getSheet(0);
        if (sheet) {
            this._context.loadSheet(sheet);
        }
    }

    /**
     * Run the method with the given name.
     *
     * The method can either be an instance method or an action. An action is
     * anything that modifies the Show. All actions can be undone and redone.
     * All other methods (things that update the controller, context, etc.) are
     * instance methods.
     *
     * @param {string} name - The function to call (@see EditorController#_parseAction).
     * @param {Array} [args] - Arguments to pass to the action. Can also be passed in name
     *   (see _parseAction), which will override any arguments passed in as a parameter
     */
    doAction(name, args=[]) {
        let action = this._getAction(name);
        action.args = _.defaultTo(action.args, args);

        let data = action.function.apply(action.context, action.args);

        if (action.canUndo && data !== false) {
            let actionData = _.extend({}, data, action);
            // if data was returned from the action, use it for redos instead
            // of the initial args
            actionData.args = _.defaultTo(data.data, action.args);
            this._undoHistory.push(actionData);

            // after doing an action, can't redo previous actions
            empty(this._redoHistory);

            this._updateHistory();
        }
    }

    /**
     * Show the popup for editing the show properties.
     */
    editShowProperties() {
        new EditShowPopup(this).show();
    }

    /**
     * Automatically download the JSON file for the show.
     */
    export() {
        window.open(`/download/${this.show.slug}.json`);
    }

    getContext() {
        return this._context;
    }

    getShortcut(shortcut) {
        let action = super.getShortcut(shortcut);
        return _.defaultTo(action, this._context.constructor.shortcuts[shortcut]);
    }

    /**
     * Loads a Context for the application.
     *
     * @param {string} name - The name of the Context to load.
     * @param {Object} [options] - Any options to customize loading the context.
     *   Will be passed to Context.load.
     */
    loadContext(name, options={}) {
        if (this._context) {
            // don't load same context
            if (name === this._context.info.name) {
                return;
            }
            this._context.unload();
        }

        $("body").attr("class", `context-${name}`);
        this._context = Context.load(name, this, options);
        this._context.refresh();
    }

    /**
     * Open the help pages.
     */
    openHelp() {
        window.open("/help", "_blank");
    }

    /**
     * Redo the last undone action.
     */
    redo() {
        if (this._redoHistory.length === 0) {
            return;
        }

        let actionData = this._redoHistory.pop();
        let newData = actionData.function.apply(actionData.context, actionData.args);
        // update undo function
        actionData.undo = newData.undo;

        this._undoHistory.push(actionData);
        this._updateHistory();
    }

    /**
     * Revert any actions in the redo/undo history that satisfy the given
     * filter function. Treating the redo/undo history as one long history,
     * reverts from the end until the predicate returns false.
     *
     * @param {function} predicate - The function that takes in the action
     *   object and returns true if the action should be undone (if in
     *   undoHistory) or discarded (if in redoHistory).
     */
    revertWhile(predicate) {
        while (this._redoHistory.length > 0) {
            let action = this._redoHistory.pop();
            if (!predicate(action)) {
                this._redoHistory.push(action);
                break;
            }
        }

        if (this._redoHistory.length > 0) {
            return;
        }

        while (this._undoHistory.length > 0) {
            let action = this._undoHistory.pop();
            if (predicate(action)) {
                action.undo.apply(action.context);
            } else {
                this._undoHistory.push(action);
                break;
            }
        }

        this._updateHistory();
    }

    /**
     * Save the Show to the server.
     */
    saveShow() {
        let data = JSON.stringify(this.show.serialize());
        let params = {
            viewer: data,
        };

        let li = showMessage("Saving...", {
            autohide: false,
        });

        doAction("save_show", params, {
            success: () => {
                li.text("Saved!").delayHide();
                this._savedShow = data;
            },
        });
    }

    /**
     * Undo the last action in history.
     */
    undo() {
        if (this._undoHistory.length === 0) {
            return;
        }

        let actionData = this._undoHistory.pop();
        actionData.undo.apply(actionData.context);

        this._redoHistory.push(actionData);
        this._updateHistory();
    }

    /**
     * Get the action represented by the given parameter. Overriding
     * ApplicationController's _getAction to allow looking up methods
     * in EditorActions and the active Context.
     *
     * @param {string} name
     * @return {Object} An object of the form:
     *   {
     *       context: Object,
     *       function: function,
     *       args: ?Array,
     *       canUndo: boolean,
     *   }
     */
    _getAction(name) {
        let data = this._parseAction(name);

        function getAction(context, container, canUndo) {
            let action = container[data.name];
            if (_.isFunction(action)) {
                return {
                    name: data.name,
                    context: context,
                    function: action,
                    args: data.args,
                    canUndo: canUndo,
                };
            }
        };

        let action = (
            getAction(this, this, false) ||
            getAction(this, this.constructor.actions, true) ||
            getAction(this._context, this._context, false) ||
            getAction(this._context, this._context.constructor.actions, true)
        );

        if (_.isUndefined(action)) {
            throw new ActionError(`No action with the name: ${data.name}`);
        } else {
            return action;
        }
    }

    /**
     * Update the Undo/Redo labels in the menu.
     */
    _updateHistory() {
        function updateLabel(action, history) {
            let li = $(`.controller-menu li[data-action=${action}]`);
            let span = li.find("span.label");
            let data = _.last(history);

            if (_.isUndefined(data)) {
                span.remove();
            } else {
                if (!span.exists()) {
                    span = HTMLBuilder.span("", "label").appendTo(li);
                }
                let label = _.defaultTo(data.label, _.lowerCase(data.name));
                span.text(` ${label}`);
            }
        }

        updateLabel("undo", this._undoHistory);
        updateLabel("redo", this._redoHistory);
    }
}

let EditorShortcuts = {
    "ctrl+shift+z": "redo",
    "ctrl+s": "saveShow",
    "ctrl+z": "undo",
    "d": "loadContext(dot)",
    "c": "loadContext(continuity)",
    "m": "loadContext(music)",
};

/**
 * Contains all actions in the EditorController. Actions are any methods that modify
 * the Show and can be undone/redone. All actions must return an object containing:
 *   - {function} undo - The function that will undo this action. `this` will be
 *     set to the EditorController instance.
 *   - {Object} [data] - Optional data to pass to the redo function. Defaults
 *     to any arguments initially passed to the function.
 *   - {string} [label] - Optional label to use for the Undo/Redo menu item.
 *     Defaults to the spaced-out name of the action.
 *
 * Actions are also passed the EditorController instance as `this`. If an action returns
 * false, the action is cancelled (i.e. cannot be undone).
 */
class EditorActions {
    /**
     * Save the Show properties.
     *
     * @param {Object} data - The data from the edit-show popup.
     */
    static saveShowProperties(data) {
        let changed = update(this.show, underscoreKeys(data));

        this.show.getSheets().forEach(sheet => sheet.updateMovements());
        this._context.refresh();

        return {
            undo: function() {
                update(this.show, changed);
                this.show.getSheets().forEach(function(sheet) {
                    sheet.updateMovements();
                });
                this._context.refresh();
            },
        };
    }
}
