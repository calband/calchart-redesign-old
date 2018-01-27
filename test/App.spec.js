import { shallow } from '@vue/test-utils';

import App from 'App';
import { addRouter, addStore } from 'test/utils';

describe('App', () => {
    it('does not show messages on init', () => {
        let wrapper = addRouter(addStore(shallow))(App);
        expect(wrapper.contains('ul.messages')).toBe(false);
    });
});
