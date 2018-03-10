import ServerAction from "actions/ServerAction";

export default class PublishShowAction extends ServerAction {
    static get action() {
        return "publish_show";
    }

    handleSuccess(data) {
        let publish = this._data.publish;
        let headerClass = publish ? "published" : "unpublished";
        $(`.shows li.${this._data.slug}`)
            .data("published", publish)
            .appendTo(`h2.${headerClass} + .show-list`);
    }
}
