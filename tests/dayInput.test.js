// @ts-nocheck
import { mount } from '@vue/test-utils';
import { describe, test, expect, afterEach } from 'vitest';
import LxDayInput from '@/components/DayInput.vue';
import 'regenerator-runtime/runtime';

let wrapper;

afterEach(() => {
  if (wrapper) {
    wrapper.unmount();
  }
});

describe('LxDayInput', () => {
  test('should be a valid component', () => {
    expect(LxDayInput).toBeTruthy();
  });

  describe('Props', () => {
    describe('modelValue', () => {
      test('should have the correct default value', () => {
        wrapper = mount(LxDayInput);
        const props = wrapper.props();
        expect(props.modelValue).toBe(null);
      });

      test('should accept provided value', () => {
        wrapper = mount(LxDayInput, {
          props: {
            modelValue: 365,
            readOnly: true,
          },
        });
        const props = wrapper.props();

        expect(props.modelValue).toBe(365);
        expect(props.modelValue).toBeTypeOf('number');
      });
    });

    describe('disabled', () => {
      test('should have the correct default value', () => {
        wrapper = mount(LxDayInput);
        const props = wrapper.props();
        expect(props.disabled).toBe(false);
      });

      test('should accept provided value', () => {
        wrapper = mount(LxDayInput, {
          props: { disabled: true },
        });
        const props = wrapper.props();
        expect(props.disabled).toBe(true);
        expect(props.disabled).toBeTypeOf('boolean');
      });
    });

    describe('readOnly', () => {
      test('should have the correct default value', () => {
        wrapper = mount(LxDayInput);
        const props = wrapper.props();
        expect(props.readOnly).toBe(false);
      });

      test('should accept provided value', () => {
        wrapper = mount(LxDayInput, {
          props: { readOnly: true },
        });
        const props = wrapper.props();
        expect(props.readOnly).toBe(true);
        expect(props.readOnly).toBeTypeOf('boolean');
      });
    });

    describe('kind', () => {
      test('should have the correct default value', () => {
        wrapper = mount(LxDayInput);
        const props = wrapper.props();
        expect(props.kind).toBe('label');
      });

      test('should accept provided value', () => {
        wrapper = mount(LxDayInput, {
          props: { kind: 'icon' },
        });
        const props = wrapper.props();
        expect(props.kind).toBe('icon');
        expect(props.kind).toBeTypeOf('string');
      });
    });

    describe('invalid', () => {
      test('should have the correct default value', () => {
        wrapper = mount(LxDayInput);
        const props = wrapper.props();
        expect(props.invalid).toBe(false);
      });

      test('should accept provided value', () => {
        wrapper = mount(LxDayInput, {
          props: { invalid: true },
        });
        const props = wrapper.props();
        expect(props.invalid).toBe(true);
        expect(props.invalid).toBeTypeOf('boolean');
      });
    });

    describe('invalidationMessage', () => {
      test('should have the correct default value', () => {
        wrapper = mount(LxDayInput);
        const props = wrapper.props();
        expect(props.invalidationMessage).toBe(null);
      });

      test('should accept provided value', () => {
        wrapper = mount(LxDayInput, {
          props: { invalidationMessage: 'Custom invalidation message' },
        });
        const props = wrapper.props();
        expect(props.invalidationMessage).toBe('Custom invalidation message');
        expect(props.invalidationMessage).toBeTypeOf('string');
      });
    });

    describe('texts', () => {
      test('should accept provided values', () => {
        wrapper = mount(LxDayInput, {
          props: {
            texts: {
              inputDaysPlaceholder: 'Custom days placeholder',
              inputMonthsPlaceholder: 'Custom months placeholder',
              inputYearsPlaceholder: 'Custom years placeholder',
              inputTooltip: 'Custom tooltip',
              dropdownPlaceholder: 'Custom dropdown placeholder',
              dropdownTooltip: 'Custom dropdown tooltip',
            },
          },
        });
        const props = wrapper.props().texts;

        expect(props.inputDaysPlaceholder).toBe('Custom days placeholder');
        expect(props.inputDaysPlaceholder).toBeTypeOf('string');
        expect(props.inputMonthsPlaceholder).toBe('Custom months placeholder');
        expect(props.inputMonthsPlaceholder).toBeTypeOf('string');
        expect(props.inputYearsPlaceholder).toBe('Custom years placeholder');
        expect(props.inputYearsPlaceholder).toBeTypeOf('string');
        expect(props.inputTooltip).toBe('Custom tooltip');
        expect(props.inputTooltip).toBeTypeOf('string');
        expect(props.dropdownPlaceholder).toBe('Custom dropdown placeholder');
        expect(props.dropdownPlaceholder).toBeTypeOf('string');
        expect(props.dropdownTooltip).toBe('Custom dropdown tooltip');
        expect(props.dropdownTooltip).toBeTypeOf('string');
      });
    });
  });
});
