import $ from 'jquery';
import { shallow } from 'vue-test-utils';

import App from 'home/App';
import 'test/utils';

describe('home/App', () => {
    it('renders tabs', () => {
        let wrapper = shallow(App, {
            propsData: {
                allTabs: [
                    ['foo', 'My Foo Shows'],
                    ['bar', 'My Bar Shows'],
                ],
            },
        });
        let tabs = wrapper.findAll('ul.tabs li');
        expect(tabs).toHaveLength(2);
        expect(tabs.at(0).text()).toBe('My Foo Shows');
        expect(tabs.at(1).text()).toBe('My Bar Shows');
    });

    it('loads the first tab', () => {
        $.ajax.callsFake(options => {
            // TODO: fake success data
        });
        let wrapper = shallow(App, {
            propsData: {
                allTabs: [['foo', 'Foo']],
            },
        });

        expect($.ajax.calledOnce).toBe(true);
    });
});
