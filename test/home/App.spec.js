import $ from 'jquery';
import sinon from 'sinon';
import { shallow } from '@vue/test-utils';

import App from 'home/App';
import { addStore, setStunt, stubAction } from 'test/utils';

function withTabs(allTabs) {
    return addStore(shallow)(App, {
        propsData: { allTabs },
    });
}

function mockAjaxTab(tab) {
    let show = { published: undefined };
    stubAction('get_tab', data => {
        expect(data.tab).toBe(tab);
        return {
            shows: [show],
        };
    });
    return show;
}

const FOO_TABS = [
    ['foo', 'My Foo Shows'],
    ['bar', 'My Bar Shows'],
];

describe('home/App', () => {
    it('is loading', () => {
        let wrapper = withTabs(FOO_TABS);
        expect(wrapper.vm.isLoading).toBe(true);
        expect(wrapper.contains('p.loading')).toBe(true);
    });

    it('renders tabs', () => {
        let wrapper = withTabs(FOO_TABS);
        let tabs = wrapper.findAll('ul.tabs li');
        expect(tabs).toHaveLength(2);
        expect(tabs.at(0).text()).toBe('My Foo Shows');
        expect(tabs.at(1).text()).toBe('My Bar Shows');
    });

    it('loads the first tab', () => {
        let show = mockAjaxTab('foo');

        let wrapper = withTabs(FOO_TABS);
        expect(wrapper.vm.activeTab).toBe('foo');

        expect($.ajax.calledOnce).toBe(true);
        expect(wrapper.vm.tabs.foo.shows).toHaveLength(1);
        expect(wrapper.vm.tabs.foo.shows[0]).toBe(show);
    });

    describe('band tab not stunt', () => {
        setStunt(false);

        it('is not showing shows as published/unpublished', () => {
            mockAjaxTab('band');
            let wrapper = withTabs([['band', 'Band']]);
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

                let wrapper = withTabs([['band', 'Band']]);
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
