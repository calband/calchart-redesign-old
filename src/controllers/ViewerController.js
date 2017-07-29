import AnimatedShowComponent from "components/AnimatedShowComponent";
import ApplicationController from "controllers/ApplicationController";

import HTMLBuilder from "utils/HTMLBuilder";

/**
 * The controller that stores the state of the viewer application and contains
 * all of the actions that can be run in the viewer page.
 */
export default class ViewerController extends ApplicationController {
    /**
     * @param {Show} show - The show being viewed in the application.
     */
    constructor(show) {
        super(show);

        this._currDot = null;
        this._animator = new AnimatedShowComponent(show, $(".viewer"), () => {
            this.refresh();
        });
    }

    static get shortcuts() {
        return AnimatedShowComponent.shortcuts;
    }

    init() {
        super.init();

        this._animator.init();
        this.refresh();

        // buttons
        $(".buttons .open-viewpsheet").click(e => {
            let dot = this._currDot ? this._currDot.data("dot").id : "";
            window.location.href = `/viewpsheet/${this.show.slug}/?dot=${dot}`;
        });

        // select dot
        let dots = $(".select-dot");
        this._show.getDots().forEach(dot => {
            HTMLBuilder.make("option", dot.label)
                .attr("value", dot.id)
                .data("dot", dot)
                .appendTo(dots);
        });
        dots
            .dropdown({
                placeholder_text_single: "None",
                allow_single_deselect: true,
            })
            .change(e => {
                let dot = dots.find("option:selected").data("dot");
                if (dot) {
                    this._currDot = this._animator.grapher.getDot(dot);
                } else {
                    this._currDot = null;
                }
                this.refresh();
            });

        this._animator.grapher.getGraph().on("click", ".dot", e => {
            let dot = $(e.currentTarget).data("dot");
            dots.choose(dot.id).change();
        });
    }

    /**
     * Refresh the UI according to the current state of the viewer
     * and Show.
     */
    refresh() {
        if (this._currDot) {
            this._animator.grapher.selectDots(this._currDot);
        }

        let currSheet = this._animator.getSheet();
        let currBeat = this._animator.getBeat();
        $(".details .sheet").text(currSheet.getLabel());
        let beatNum = currBeat === 0 ? "Hup" : currBeat;
        $(".details .beat-num").text(beatNum);
        $(".details .beat-total").text(currSheet.getDuration());
    }

    /**** METHODS ****/

    /**
     * Run the given animation action.
     */
    doAnimate(action) {
        this._animator[action]();
    }
}
