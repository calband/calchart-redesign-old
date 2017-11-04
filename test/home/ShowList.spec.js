import { shallow } from 'vue-test-utils';

import ShowList from 'home/ShowList';

describe('home/ShowList', () => {
    it('renders no shows', () => {
        let wrapper = shallow(ShowList, {
            propsData: {
                shows: [],
            },
        });
        let shows = wrapper.find('ul.show-list');
        expect(shows.contains('li')).toBe(false);
    });
});
