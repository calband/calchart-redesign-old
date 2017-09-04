import _ from "lodash";

import { CSRF_TOKEN } from "utils/env";

/**
 * A helper class that sends POST requests to the server.
 */
export default class ServerAction {
    /**
     * @param {Vue} vm - The Vue instance running the server action.
     * @param {String} [action] - The action to send to the server, if
     *   the static action variable is not set.
     */
    constructor(vm, action) {
        this._vm = vm;
        this._action = this.constructor.action || action;
    }

    /**
     * @return {String} The name of the action to send to the server.
     */
    static get action() {
        return null;
    }

    /**
     * Run this action with the given data.
     *
     * @param {Object} data - The data to send to the server
     * @param {Object} [options] - AJAX options to override defaults
     */
    send(data, options) {
        // http://www.mattlunn.me.uk/blog/2012/05/sending-formdata-with-jquery-ajax/
        let formData = new FormData();
        formData.append("csrfmiddlewaretoken", CSRF_TOKEN);
        formData.append("action", this._action);
        _.each(data, (val, name) => {
            formData.append(name, val);
        });

        $.ajax("", _.defaults(options, {
            method: "POST",
            data: formData,
            dataType: "json",
            cache: false,
            contentType: false,
            processData: false,
            error: xhr => {
                this.handleError(xhr);
            },
        }));
    }

    /**** METHODS ****/

    /**
     * Handle an error returned by the server.
     *
     * @param {jqXHR} xhr
     */
    handleError(xhr) {
        console.error(xhr);

        let message;
        if (xhr.responseJSON) {
            message = xhr.responseJSON.message;
        } else {
            switch (xhr.status) {
                case 403:
                    message = "Invalid permissions. Please refresh the page.";
                    break;
                default:
                    message = "An error occurred.";
            }
        }

        this._vm.$root.showError(message);
    }
}
