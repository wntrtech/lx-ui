// @ts-nocheck
import { mount } from '@vue/test-utils';
import { describe, test, expect, afterEach } from 'vitest';
import LxTextArea from '@/components/TextArea.vue';

let wrapper;

afterEach(() => {
  if (wrapper) {
    wrapper.unmount();
  }
});

describe('MyComponent', () => {
  test('should be a valid component', () => {
    expect(LxTextArea).toBeTruthy();
  });

  describe('Props', () => {
    test('should have the correct default props', () => {
      wrapper = mount(LxTextArea);

      expect(wrapper.props().id).toBe(null);
      expect(wrapper.props().modelValue).toBe(null);
      expect(wrapper.props().placeholder).toBe(null);
      expect(wrapper.props().rows).toBe(3);
      expect(wrapper.props().readOnly).toBe(false);
      expect(wrapper.props().disabled).toBe(false);
      expect(wrapper.props().invalid).toBe(false);
      expect(wrapper.props().invalidationMessage).toBe(null);
      expect(wrapper.props().maxlength).toBe(null);
      expect(wrapper.props().dynamicHeight).toBe(false);
      expect(wrapper.props().tooltip).toBe(null);
    });

    test('should accept valid prop values with valid types', () => {
      wrapper = mount(LxTextArea, {
        props: {
          id: 'test-id',
          modelValue: 'test-value',
          placeholder: 'Enter text',
          rows: 5,
          readOnly: true,
          disabled: true,
          invalid: true,
          invalidationMessage: 'Invalid input',
          maxlength: 100,
          dynamicHeight: true,
          tooltip: 'This is a tooltip',
        },
      });

      expect(wrapper.props().id).toBe('test-id');
      expect(wrapper.props().id).toBeTypeOf('string');
      expect(wrapper.props().modelValue).toBe('test-value');
      expect(wrapper.props().modelValue).toBeTypeOf('string');
      expect(wrapper.props().placeholder).toBe('Enter text');
      expect(wrapper.props().placeholder).toBeTypeOf('string');
      expect(wrapper.props().rows).toBe(5);
      expect(wrapper.props().rows).toBeTypeOf('number');
      expect(wrapper.props().readOnly).toBe(true);
      expect(wrapper.props().readOnly).toBeTypeOf('boolean');
      expect(wrapper.props().disabled).toBe(true);
      expect(wrapper.props().disabled).toBeTypeOf('boolean');
      expect(wrapper.props().invalid).toBe(true);
      expect(wrapper.props().invalid).toBeTypeOf('boolean');
      expect(wrapper.props().invalidationMessage).toBe('Invalid input');
      expect(wrapper.props().invalidationMessage).toBeTypeOf('string');
      expect(wrapper.props().maxlength).toBe(100);
      expect(wrapper.props().maxlength).toBeTypeOf('number');
      expect(wrapper.props().dynamicHeight).toBe(true);
      expect(wrapper.props().dynamicHeight).toBeTypeOf('boolean');
      expect(wrapper.props().tooltip).toBe('This is a tooltip');
      expect(wrapper.props().tooltip).toBeTypeOf('string');
    });
  });
});
