// @ts-nocheck
import { test, expect, describe, afterEach } from 'vitest';
import { mount } from '@vue/test-utils';
import LxWidget from '@/components/Widget.vue';

let wrapper;

afterEach(() => {
  if (wrapper) {
    wrapper.unmount();
  }
});

describe('LxWidget', () => {
  test('should be a valid component', () => {
    expect(LxWidget).toBeTruthy();
  });

  describe('Props', () => {
    test('should have default values', () => {
      wrapper = mount(LxWidget, {
        global: {
          stubs: ['router-link'],
        },
      });

      const props = wrapper.props();

      expect(props.id).toBeTruthy();
      expect(props.id).toBeTypeOf('string');
      expect(props.label).toBe('');
      expect(props.label).toBeTypeOf('string');
      expect(props.width).toBe('s');
      expect(props.width).toBeTypeOf('string');
      expect(props.height).toBe('s');
      expect(props.height).toBeTypeOf('string');
      expect(props.showHeader).toBe(true);
      expect(props.showHeader).toBeTypeOf('boolean');
      expect(props.showFooter).toBe(false);
      expect(props.showFooter).toBeTypeOf('boolean');
      expect(props.href).toBeNull();
      expect(props.actionDefinitions).toEqual([]);
      expect(props.actionDefinitions).toBeTypeOf('object');
      expect(props.kind).toBe('default');
      expect(props.kind).toBeTypeOf('string');
      expect(props.coverImage).toBe('');
      expect(props.coverImage).toBeTypeOf('string');
    });

    test('should accept provided values', () => {
      wrapper = mount(LxWidget, {
        props: {
          id: 'custom-id',
          label: 'Custom Label',
          width: 'm',
          height: 'm',
          showHeader: false,
          showFooter: true,
          href: { url: 'http://example.com' },
          actionDefinitions: ['action1', 'action2'],
          kind: 'fancy',
          coverImage: 'http://example.com/image.jpg',
        },
        global: {
          stubs: ['router-link'],
        },
      });

      const props = wrapper.props();

      expect(props.id).toBe('custom-id');
      expect(props.id).toBeTypeOf('string');
      expect(props.label).toBe('Custom Label');
      expect(props.label).toBeTypeOf('string');
      expect(props.width).toBe('m');
      expect(props.width).toBeTypeOf('string');
      expect(props.height).toBe('m');
      expect(props.height).toBeTypeOf('string');
      expect(props.showHeader).toBe(false);
      expect(props.showHeader).toBeTypeOf('boolean');
      expect(props.showFooter).toBe(true);
      expect(props.showFooter).toBeTypeOf('boolean');
      expect(props.href).toEqual({ url: 'http://example.com' });
      expect(props.href).toBeTypeOf('object');
      expect(props.actionDefinitions).toEqual(['action1', 'action2']);
      expect(props.actionDefinitions).toBeTypeOf('object');
      expect(props.kind).toBe('fancy');
      expect(props.kind).toBeTypeOf('string');
      expect(props.coverImage).toBe('http://example.com/image.jpg');
      expect(props.coverImage).toBeTypeOf('string');
    });
  });
});
