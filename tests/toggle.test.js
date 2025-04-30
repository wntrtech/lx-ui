// @ts-nocheck
import { mount } from '@vue/test-utils';
import { describe, test, expect, afterEach } from 'vitest';
import LxToggle from '@/components/Toggle.vue';

let wrapper;

afterEach(() => {
  if (wrapper) {
    wrapper.unmount();
  }
});

describe('LxToggle', () => {
  test('should be a valid component', () => {
    expect(LxToggle).toBeTruthy();
  });

  describe('Props', () => {
    test('should have the correct default props', () => {
      wrapper = mount(LxToggle);
      const props = wrapper.props();

      expect(props.id).toBe(null);
      expect(props.modelValue).toBe(null);
      expect(props.size).toBe('m');
      expect(props.disabled).toBe(false);
      expect(props.invalid).toBe(false);
      expect(props.invalidationMessage).toBe(null);
      expect(props.readOnly).toBe(false);
      expect(props.tooltip).toBe(null);
    });

    test('should accept provided prop values', () => {
      wrapper = mount(LxToggle, {
        props: {
          id: 'custom-id',
          modelValue: true,
          size: 's',
          disabled: true,
          invalid: true,
          invalidationMessage: 'Custom invalidation message',
          readOnly: true,
          tooltip: 'Custom tooltip',
          texts: {
            valueYes: 'Custom value yes placeholder',
            valueNo: 'Custom value yes placeholder',
          },
        },
      });
      const props = wrapper.props();

      expect(props.id).toBe('custom-id');
      expect(props.id).toBeTypeOf('string');
      expect(props.modelValue).toBe(true);
      expect(props.modelValue).toBeTypeOf('boolean');
      expect(props.size).toBe('s');
      expect(props.size).toBeTypeOf('string');
      expect(props.disabled).toBe(true);
      expect(props.disabled).toBeTypeOf('boolean');
      expect(props.invalid).toBe(true);
      expect(props.invalid).toBeTypeOf('boolean');
      expect(props.invalidationMessage).toBe('Custom invalidation message');
      expect(props.invalidationMessage).toBeTypeOf('string');
      expect(props.readOnly).toBe(true);
      expect(props.readOnly).toBeTypeOf('boolean');
      expect(props.tooltip).toBe('Custom tooltip');
      expect(props.tooltip).toBeTypeOf('string');
      expect(props.texts.valueYes).toBe('Custom value yes placeholder');
      expect(props.texts.valueYes).toBeTypeOf('string');
      expect(props.texts.valueNo).toBe('Custom value yes placeholder');
      expect(props.texts.valueNo).toBeTypeOf('string');
    });
  });
});
