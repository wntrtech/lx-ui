// @ts-nocheck
import { test, expect, describe } from 'vitest';
import { mount } from '@vue/test-utils';
import LxVisualPicker from '@/components/VisualPicker.vue';

// TODO: need fix inside LxVisualPicker (all test are in todo(skipped) state)
// [Vue warn]: Vue received a Component that was made a reactive object.
// This can lead to unnecessary performance overhead and should be avoided
// by marking the component with `markRaw` or using `shallowRef` instead of `ref`.
// [Vue warn]: Invalid watch source:  {id: 'CH', name: 'Šveice'}
// A watch source can only be a getter/effect function, a ref,
// a reactive object, or an array of these types.

describe('LxVisualPicker', () => {
  test('should be a valid component', () => {
    expect(LxVisualPicker).toBeTruthy();
  });

  describe('Props', () => {
    test.todo('should have default values', () => {
      const wrapper = mount(LxVisualPicker, {
        global: {
          stubs: ['router-link'],
        },
      });
      const props = wrapper.props();
      expect(props.id).toBeTruthy();
      expect(props.id).toBeTypeOf('string');
      expect(props.kind).toBe('europe');
      expect(props.kind).toBeTypeOf('string');
      expect(props.modelValue).toEqual([]);
      expect(Array.isArray(props.modelValue)).toBe(true);
      expect(props.readOnly).toBe(false);
      expect(props.readOnly).toBeTypeOf('boolean');
      expect(props.mode).toBe('default');
      expect(props.mode).toBeTypeOf('string');
      expect(props.texts).toEqual({
        visualView: 'Vizuālais skats',
        listView: 'Saraksta skats',
        removeCountry: 'Noņemt valsti',
        errorLabel: 'Neizdevās ielādēt attēlu',
      });
      expect(props.texts).toBeTypeOf('object');
    });

    test.todo('should accept provided values with kind:europe', () => {
      const wrapper = mount(LxVisualPicker, {
        props: {
          id: 'custom-id',
          kind: 'europe',
          modelValue: ['DK', 'NL'],
          readOnly: true,
          mode: 'compact',
          texts: {
            visualView: 'Visual View',
            listView: 'List View',
            removeCountry: 'Remove Country',
            errorLabel: 'Failed to load image',
            europe: {
              DK: 'Dānija',
              NL: 'Nīderlande',
            },
          },
        },
        global: {
          stubs: ['router-link'],
        },
      });
      const props = wrapper.props();

      expect(props.id).toBe('custom-id');
      expect(props.id).toBeTypeOf('string');
      expect(props.kind).toBe('europe');
      expect(props.kind).toBeTypeOf('string');
      expect(props.modelValue).toEqual(['DK', 'NL']);
      expect(Array.isArray(props.modelValue)).toBe(true);
      expect(props.readOnly).toBe(true);
      expect(props.readOnly).toBeTypeOf('boolean');
      expect(props.mode).toBe('compact');
      expect(props.mode).toBeTypeOf('string');
      expect(props.texts).toEqual({
        visualView: 'Visual View',
        listView: 'List View',
        removeCountry: 'Remove Country',
        errorLabel: 'Failed to load image',
        europe: {
          DK: 'Dānija',
          NL: 'Nīderlande',
        },
      });
      expect(props.texts).toBeTypeOf('object');
    });

    test.todo('should accept provided values with kind skeleton', () => {
      const wrapper = mount(LxVisualPicker, {
        props: {
          kind: 'skeleton',
          modelValue: ['60413009', '272679001'],
          texts: {
            skeleton: {
              60413009: 'Rib cage',
              272679001: 'Bone structure of head',
            },
          },
        },
        global: {
          stubs: ['router-link'],
        },
      });
      const props = wrapper.props();

      expect(props.kind).toBe('skeleton');
      expect(props.kind).toBeTypeOf('string');
      expect(props.modelValue).toEqual(['60413009', '272679001']);
      expect(Array.isArray(props.modelValue)).toBe(true);
      expect(props.texts).toEqual({
        skeleton: {
          60413009: 'Rib cage',
          272679001: 'Bone structure of head',
        },
      });
      expect(props.texts).toBeTypeOf('object');
    });

    test.todo('should accept provided values with kind spine', () => {
      const wrapper = mount(LxVisualPicker, {
        props: {
          kind: 'spine',
          modelValue: ['278915007', '699698002'],
          texts: {
            spine: {
              278915007: 'Coccyx',
              699698002: 'Sacrum',
            },
          },
        },
        global: {
          stubs: ['router-link'],
        },
      });
      const props = wrapper.props();

      expect(props.kind).toBe('spine');
      expect(props.kind).toBeTypeOf('string');
      expect(props.modelValue).toEqual(['278915007', '699698002']);
      expect(Array.isArray(props.modelValue)).toBe(true);
      expect(props.texts).toEqual({
        spine: {
          278915007: 'Coccyx',
          699698002: 'Sacrum',
        },
      });
      expect(props.texts).toBeTypeOf('object');
    });

    test.todo('should accept provided values with kind arms', () => {
      const wrapper = mount(LxVisualPicker, {
        props: {
          kind: 'arms',
          modelValue: ['734355008', '734354007'],
          texts: {
            arms: {
              734355008: 'Bone structure of right hand',
              734354007: 'Bone structure of left hand',
            },
          },
        },
        global: {
          stubs: ['router-link'],
        },
      });
      const props = wrapper.props();

      expect(props.kind).toBe('arms');
      expect(props.kind).toBeTypeOf('string');
      expect(props.modelValue).toEqual(['734355008', '734354007']);
      expect(Array.isArray(props.modelValue)).toBe(true);
      expect(props.texts).toEqual({
        arms: {
          734355008: 'Bone structure of right hand',
          734354007: 'Bone structure of left hand',
        },
      });
      expect(props.texts).toBeTypeOf('object');
    });

    test.todo('should accept provided values with kind left-hand', () => {
      const wrapper = mount(LxVisualPicker, {
        props: {
          kind: 'left-hand',
          modelValue: ['737403003', '764825000'],
          texts: {
            leftHand: {
              737403003: 'Left lunate bone',
              764825000: 'Left triquetum',
            },
          },
        },
        global: {
          stubs: ['router-link'],
        },
      });
      const props = wrapper.props();

      expect(props.kind).toBe('left-hand');
      expect(props.kind).toBeTypeOf('string');
      expect(props.modelValue).toEqual(['737403003', '764825000']);
      expect(Array.isArray(props.modelValue)).toBe(true);
      expect(props.texts).toEqual({
        leftHand: {
          737403003: 'Left lunate bone',
          764825000: 'Left triquetum',
        },
      });
      expect(props.texts).toBeTypeOf('object');
    });

    test.todo('should accept provided values with kind right-hand', () => {
      const wrapper = mount(LxVisualPicker, {
        props: {
          kind: 'right-hand',
          modelValue: ['737404009', '764824001'],
          texts: {
            rightHand: {
              737404009: 'Right lunate bone',
              764824001: 'Right triquetum',
            },
          },
        },
        global: {
          stubs: ['router-link'],
        },
      });
      const props = wrapper.props();

      expect(props.kind).toBe('right-hand');
      expect(props.kind).toBeTypeOf('string');
      expect(props.modelValue).toEqual(['737404009', '764824001']);
      expect(Array.isArray(props.modelValue)).toBe(true);
      expect(props.texts).toEqual({
        rightHand: {
          737404009: 'Right lunate bone',
          764824001: 'Right triquetum',
        },
      });
      expect(props.texts).toBeTypeOf('object');
    });

    test.todo('should accept provided values with kind latvia', () => {
      const wrapper = mount(LxVisualPicker, {
        props: {
          kind: 'latvia',
          modelValue: ['0001000', '0002000'],
          texts: {
            latvia: {
              '0001000': 'Rīga',
              '0002000': 'Daugavpils',
            },
          },
        },
        global: {
          stubs: ['router-link'],
        },
      });
      const props = wrapper.props();

      expect(props.kind).toBe('latvia');
      expect(props.kind).toBeTypeOf('string');
      expect(props.modelValue).toEqual(['0001000', '0002000']);
      expect(Array.isArray(props.modelValue)).toBe(true);
      expect(props.texts).toEqual({
        latvia: {
          '0001000': 'Rīga',
          '0002000': 'Daugavpils',
        },
      });
      expect(props.texts).toBeTypeOf('object');
    });
  });
});
