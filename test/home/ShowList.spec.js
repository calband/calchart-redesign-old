import { shallow } from '@vue/test-utils';

import ShowList from 'home/ShowList';
import { ContextMenuStub } from 'test/utils';

describe('home/ShowList', () => {
    it('renders no shows', () => {
        let wrapper = shallow(ShowList, {
            propsData: {
                shows: [],
                isOwner: false,
                canPublish: false,
            },
            stubs: {
                'context-menu': ContextMenuStub,
            },
        });
        let shows = wrapper.find('ul.show-list');
        expect(shows.contains('li')).toBe(false);
    });
});
