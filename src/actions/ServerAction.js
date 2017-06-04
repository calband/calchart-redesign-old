import { CSRF_TOKEN } from "utils/env";
import { NotImplementedError } from "utils/errors";
import { showError } from "utils/UIUtils";

/**
 * A class that sends POST requests to the server to be handled
 * by ActionsMixin.
 */
export default class ServerAction {
    constructor() {
        // {object} The data passed to send.
        this._data = null;
    }

    /**
     * @return {string} The name of the action to send to the server.
     */
    static get action() {
        throw new NotImplementedError(this);
    }

    /**
     * Run this action with the given data.
     *
     * @param {object} data - The data to send to the server.
     */
    send(data) {
        this._data = data;

        let formData = new FormData();
        formData.append("csrfmiddlewaretoken", CSRF_TOKEN);
        formData.append("action", this.constructor.action);
        _.each(data, (val, name) => {
            formData.append(name, val);
        });

        let options = this.getAjaxOptions();
        options.data = formData;

        $.ajax("", options);
    }

    /**** METHODS ****/

    /**
     * @return {object} An object containing options to pass to jQuery's Ajax call.
     */
    getAjaxOptions() {
        // http://www.mattlunn.me.uk/blog/2012/05/sending-formdata-with-jquery-ajax/
        return {
            method: "POST",
            dataType: "json",
            cache: false,
            contentType: false,
            processData: false,
            success: data => {
                this.handleSuccess(data);
            },
            error: xhr => {
                this.handleError(xhr);
            },
        };
    }

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

        showError(message);
    }

    /**
     * Handle a successful response from the server.
     *
     * @param {object} data - The JSON data returned from the server.
     */
    handleSuccess(data) {
        throw new NotImplementedError(this);
    }
}
