import App from 'App';
import { shallowCalchart } from 'test/utils';

describe('App', () => {
    it('does not show messages on init', () => {
        let wrapper = shallowCalchart(App, {
            stubStore: true,
            mocks: {
                $route: { path: '/' },
            },
        });
        expect(wrapper.contains('ul.messages')).toBe(false);
    });
});
