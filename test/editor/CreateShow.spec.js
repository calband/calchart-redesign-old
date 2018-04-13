import $ from 'jquery';
import sinon from 'sinon';

import DotLabelFormat from 'calchart/DotLabelFormat';
import FieldType from 'calchart/FieldType';
import Orientation from 'calchart/Orientation';
import StepType from 'calchart/StepType';
import CreateShow from 'editor/CreateShow';
import { shallowCalchart, stubAction } from 'test/utils';

describe('CreateShow', () => {
    it('submits successfully', () => {
        let $router = { push: sinon.spy() };
        let wrapper = shallowCalchart(CreateShow, {
            stubStore: true,
            mocks: {
                $router,
            },
        });

        stubAction('create_show', () => ({ slug: 'foo' }));

        wrapper.vm.createShow({
            name: 'Foo',
            isBand: false,
            numDots: 10,
            dotGroups: {},
            labelFormat: DotLabelFormat.COMBO,
            audioUrl: null,
            songs: [],
            fieldType: FieldType.COLLEGE,
            beatsPerStep: [1, 1],
            stepType: StepType.HIGH_STEP,
            orientation: Orientation.EAST,
        });

        // check action
        expect($.ajax.called).toBe(true);

        // check store
        let commit = wrapper.vm.$store.commit;
        expect(commit.called).toBe(true);
        expect(commit.firstCall.args[0]).toBe('setShow');
        let show = commit.firstCall.args[1];
        expect(show._slug).toBe('foo');

        // check router
        expect($router.push.calledOnce).toBe(true);
        expect($router.push.firstCall.args[0].path).toBe('/editor/foo');
    });
});
