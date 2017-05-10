import { ValidationError } from "utils/errors";
import "utils/jquery";
import { doAction, getData, showPopup } from "utils/UIUtils";

if (_ === undefined) {
    console.error("lodash is not loaded!");
}

$(function() {
    // TODO: tabs

    $(".main-buttons button.new-show").click(e => {
        showPopup("create-show", {
            init: popup => {
                if (!window.isStunt) {
                    popup.find(".field.is_band").remove();
                }
            },
            onSubmit: popup => {
                let data = getData(popup);
                let audio = popup.find(".field.audio input")[0].files[0];
                if (!_.isUndefined(audio)) {
                    // TODO: validate extension
                }

                let params = {
                    show_name: data.show_name,
                    audio: audio,
                    is_band: data.is_band,
                };

                popup.find(".buttons").text("Saving...");

                doAction("create_show", params, {
                    dataType: "json",
                    success: data => {
                        location.href = data.url;
                    },
                });
            },
            submitHide: false,
        });
    });
});
