import $ from 'jquery';
import sinon from 'sinon';

import App from 'home/App';
import { setStunt, shallowCalchart, stubAction } from 'test/utils';

function mockAjaxTab(tab) {
    let show = {
        slug: 'test',
        name: 'Test',
        published: true,
    };
    stubAction('get_tab', data => {
        expect(data.tab).toBe(tab);
        return {
            shows: [show],
        };
    });
    return show;
}

/**
 * Stubbing store for `isStunt` value.
 */
function initHome() {
    return shallowCalchart(App, {
        stubStore: true,
    });
}

describe('home/App', () => {
    it('is loading', () => {
        let wrapper = initHome();
        expect(wrapper.vm.isLoading).toBe(true);
        expect(wrapper.contains('p.loading')).toBe(true);
    });

    it('renders tabs', () => {
        let wrapper = initHome();
        let tabs = wrapper.findAll('ul.tabs li');
        expect(tabs).toHaveLength(2);
    });

    it('loads the first tab', () => {
        let show = mockAjaxTab('band');

        let wrapper = initHome();
        expect(wrapper.vm.activeTab).toBe('band');

        expect($.ajax.calledOnce).toBe(true);
        expect(wrapper.vm.tabs.band.shows).toHaveLength(1);
        expect(wrapper.vm.tabs.band.shows[0]).toBe(show);
    });

    describe('band tab not stunt', () => {
        setStunt(false);

        it('is not showing shows as published/unpublished', () => {
            mockAjaxTab('band');
            let wrapper = initHome();
            let shows = wrapper.vm.tabs.band.shows;
            expect(shows).not.toHaveProperty('published');
            expect(shows).not.toHaveProperty('unpublished');
            expect(shows).toHaveLength(1);
            expect(wrapper.vm.showPublished).toBe(false);
        });
    });

    describe('band tab as stunt', () => {
        setStunt(true);

        [true, false].forEach(published => {
            let prop = published ? 'published' : 'unpublished';
            let unprop = published ? 'unpublished' : 'published';

            it(`is showing shows as ${prop}`, () => {
                let show = mockAjaxTab('band');
                sinon.stub(show, 'published').value(published);

                let wrapper = initHome();
                let shows = wrapper.vm.tabs.band.shows;
                expect(shows).toHaveProperty('published');
                expect(shows).toHaveProperty('unpublished');
                expect(shows[prop]).toHaveLength(1);
                expect(shows[unprop]).toHaveLength(0);
            });
        });
    });

    // TODO: test changing tabs
    // TODO: test publishing/unpublishing show
    // TODO: test clicking create show button opens popup
});
