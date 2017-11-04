import { shallow } from 'vue-test-utils';

import App from 'home/App';

describe('home/App', () => {
    it('renders tabs according to window.tabs', () => {
        window.tabs = [
            ['foo', 'My Foo Shows'],
            ['bar', 'My Bar Shows'],
        ];
        let wrapper = shallow(App);
        let tabs = wrapper.findAll('ul.tabs li');
        expect(tabs.length).toBe(2);
        expect(tabs.at(0).text()).toBe('My Foo Shows');
        expect(tabs.at(1).text()).toBe('My Bar Shows');
    });
});
