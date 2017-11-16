import { shallow } from 'vue-test-utils';

import App from 'App';
import { $store } from 'test/utils';

describe('App', () => {
    it('does not show messages on init', () => {
        let wrapper = shallow(App, {
            mocks: { $store },
        });
        expect(wrapper.contains('ul.messages')).toBe(false);
    });
});
