import "utils/jquery";

if (_ === undefined) {
    console.error("lodash is not loaded!");
}

/**
 * Set up the navigation bar on the help pages.
 */
function setupNavigation() {
    let nav = $("ul.nav");
    nav.children("li").each(function() {
        let submenu = $(this).children(".nav-submenu").appendTo("body");
        let navItem = $(this);
        let offset = navItem.offset();
        let height = navItem.outerHeight();

        $(this).children("a").mouseenter(() => {
            $(submenu)
                .css({
                    top: offset.top + height,
                    left: offset.left + 2,
                })
                .show();

            // close submenu if not hovering over the submenu or this navItem
            $(document).mousemove(e => {
                if ($(e.target).notIn(submenu) && $(e.target).notIn(navItem)) {
                    $(submenu).hide();
                    $(document).off(e);
                }
            });
        });
    });
}

$(function() {
    setupNavigation();
});
