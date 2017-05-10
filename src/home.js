import { ValidationError } from "utils/errors";
import HTMLBuilder from "utils/HTMLBuilder";
import "utils/jquery";
import { doAction, getData, showPopup } from "utils/UIUtils";

if (_ === undefined) {
    console.error("lodash is not loaded!");
}

$(function() {
    $(".tabs li").click(function() {
        if ($(this).hasClass("active")) {
            return;
        }

        let tab = $(this).data("tab");

        $.ajax({
            data: {
                tab: tab,
            },
            dataType: "json",
            success: data => {
                $(".shows li").remove();
                data.shows.forEach(show => {
                    HTMLBuilder.li(show.name)
                        .data("slug", show.slug)
                        .appendTo(".shows");
                });

                $(".tabs li.active").removeClass("active");
                $(this).addClass("active");
            },
        });
    });

    $(".shows li").click(function() {
        let slug = $(this).data("slug");
        location.href = `/editor/${slug}`;
    });

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
