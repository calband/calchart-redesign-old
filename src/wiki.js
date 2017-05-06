/**
 * Set up the navigation bar on the help pages.
 */
function setupNavigation() {
    let nav = $("ul.nav");
    nav.children("li").each(function() {
        let submenu = $(this).children(".nav-submenu").appendTo("body");

        $(this).children("a").mouseenter(() => {
            $(".nav-submenu").hide();
            let offset = $(this).offset();

            $(submenu)
                .css({
                    top: offset.top + $(this).outerHeight() + 3,
                    left: offset.left,
                })
                .show();

            // if mouse leaves, close submenu unless user enters the submenu
            // within a specified time interval

            let timer = null;
            function hideSubmenu() {
                $(submenu).hide();
            }

            $(this).mouseleave(e => {
                timer = setTimeout(hideSubmenu, 100);
                $(this).off(e);
            });

            $(submenu)
                .mouseenter(e => {
                    clearTimeout(timer);
                    $(submenu).off(e);
                })
                .mouseleave(hideSubmenu);
        });
    });
}

$(function() {
    setupNavigation();
});
