// @ts-nocheck
import { test, expect, describe, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import LxMasterDetail from '@/components/MasterDetail.vue';
import 'regenerator-runtime/runtime';
import { directive } from 'vue3-click-away';

describe('LxMasterDetail', () => {
  test('should be a valid component', () => {
    expect(LxMasterDetail).toBeTruthy();
  });

  describe('Props', () => {
    test('should have default values', () => {
      const wrapper = mount(LxMasterDetail, {
        global: {
          stubs: ['router-link'],
          directives: {
            ClickAway: directive,
          },
        },
      });

      const props = wrapper.props();

      expect(props.modelValue).toEqual([]);
      expect(props.label).toBe(null);
      expect(props.description).toBe(null);
      expect(props.newLabel).toBe('');
      expect(props.placeHolder).toBe('');
      expect(props.mode).toBe('edit');
      expect(props.level).toBe(1);
      expect(props.dragAndDrop).toBe(false);
      expect(props.invalidItems).toEqual([]);
      expect(props.idAttribute).toBe('id');
      expect(props.nameAttribute).toBe('name');
      expect(props.descriptionAttribute).toBe(null);
      expect(props.texts.add).toBe('Pievienot');
    });

    test('should accept provided values', () => {
      const wrapper = mount(LxMasterDetail, {
        props: {
          modelValue: [
            {
              id: 1,
              name: 'League of Legends',
              popularity: 153109020,
              description: null,
              multiplayer: true,
              rating: 4.5,
              country: 'us',
              group: '1',
              clickable: true,
              category: 'red',
              person: {
                firstName: 'Andrei',
                lastName: 'van Roon',
                description: 'Director of League of Legends',
                role: 'SVP',
                institution: 'Riot Games',
              },
            },
          ],
          label: 'Custom label',
          description: 'Custom description',
          newLabel: 'Custom label',
          placeHolder: 'Custom placeholder',
          mode: 'read',
          level: 2,
          dragAndDrop: true,
          invalidItems: [1],
          idAttribute: 'customId',
          nameAttribute: 'customName',
          descriptionAttribute: 'customDescription',
          texts: {
            add: 'Add',
          },
        },
        global: {
          stubs: ['router-link'],
          directives: {
            ClickAway: directive,
          },
        },
      });

      const props = wrapper.props();

      expect(props.modelValue).toEqual([
        {
          id: 1,
          name: 'League of Legends',
          popularity: 153109020,
          description: null,
          multiplayer: true,
          rating: 4.5,
          country: 'us',
          group: '1',
          clickable: true,
          category: 'red',
          person: {
            firstName: 'Andrei',
            lastName: 'van Roon',
            description: 'Director of League of Legends',
            role: 'SVP',
            institution: 'Riot Games',
          },
        },
      ]);
      expect(Array.isArray(props.modelValue)).toBe(true);
      expect(props.label).toBe('Custom label').toBeTypeOf('string');
      expect(props.description).toBe('Custom description').toBeTypeOf('string');
      expect(props.newLabel).toBe('Custom label').toBeTypeOf('string');
      expect(props.placeHolder).toBe('Custom placeholder').toBeTypeOf('string');
      expect(props.mode).toBe('read').toBeTypeOf('string');
      expect(props.level).toBe(2).toBeTypeOf('number');
      expect(props.dragAndDrop).toBe(true).toBeTypeOf('boolean');
      expect(props.invalidItems).toEqual([1]);
      expect(Array.isArray(props.invalidItems)).toBe(true);
      expect(props.idAttribute).toBe('customId').toBeTypeOf('string');
      expect(props.nameAttribute).toBe('customName').toBeTypeOf('string');
      expect(props.descriptionAttribute).toBe('customDescription').toBeTypeOf('string');
      expect(props.texts.add).toBe('Add').toBeTypeOf('string');
    });
  });

  describe('Computed properties and methods', () => {
    test('model computed property should get and set modelValue correctly', async () => {
      const wrapper = mount(LxMasterDetail, {
        props: {
          modelValue: [{ id: 1, name: 'Item 1' }],
        },
        global: {
          stubs: ['router-link'],
          directives: {
            ClickAway: directive,
          },
        },
      });

      const { model } = wrapper.vm;
      expect(model).toEqual([{ id: 1, name: 'Item 1' }]);

      await wrapper.setProps({ modelValue: [{ id: 2, name: 'Item 2' }] });
      expect(wrapper.vm.model).toEqual([{ id: 2, name: 'Item 2' }]);

      wrapper.vm.model = [{ id: 3, name: 'Item 3' }];
      expect(wrapper.emitted()['update:modelValue'][0]).toEqual([[{ id: 3, name: 'Item 3' }]]);
    });

    test('selectItem method should update activeItemCode and emit selectionChanged', () => {
      const wrapper = mount(LxMasterDetail, {
        props: {
          modelValue: [{ id: 1, name: 'Item 1' }],
        },
        global: {
          stubs: ['router-link'],
          directives: {
            ClickAway: directive,
          },
        },
      });

      wrapper.vm.selectItem(1);
      expect(wrapper.vm.activeItemCode).toBe(1);
      expect(wrapper.emitted().selectionChanged[0]).toEqual([1]);
    });

    test('addItem method should emit newItemAdded', () => {
      const wrapper = mount(LxMasterDetail, {
        props: {
          modelValue: [],
        },
        global: {
          stubs: ['router-link'],
          directives: {
            ClickAway: directive,
          },
        },
      });

      wrapper.vm.addItem();
      expect(wrapper.emitted().newItemAdded).toBeTruthy();
    });

    test('isItemValid method should correctly validate items', () => {
      const wrapper = mount(LxMasterDetail, {
        props: {
          modelValue: [
            { id: 1, name: 'Item 1' },
            { id: 2, name: 'Item 2' },
          ],
          invalidItems: [1],
        },
        global: {
          stubs: ['router-link'],
          directives: {
            ClickAway: directive,
          },
        },
      });

      expect(wrapper.vm.isItemValid({ id: 1 })).toBe(false);
      expect(wrapper.vm.isItemValid({ id: 2 })).toBe(true);
    });

    test('dragStart and dragEnd methods should handle drag and drop correctly', async () => {
      const wrapper = mount(LxMasterDetail, {
        props: {
          modelValue: [
            { id: 1, name: 'Item 1', order: 0 },
            { id: 2, name: 'Item 2', order: 1 },
          ],
          dragAndDrop: true,
        },
        global: {
          stubs: ['router-link'],
          directives: {
            ClickAway: directive,
          },
        },
      });

      const dragEvent = {
        preventDefault: vi.fn(),
        target: wrapper.find('[draggable="true"]').element,
      };

      wrapper.vm.dragStart(dragEvent);
      expect(wrapper.vm.dragActive).toBe(true);

      wrapper.vm.dragEnd(dragEvent);
      expect(wrapper.vm.dragActive).toBe(false);
      expect(wrapper.vm.dragTarget).toBe(null);

      const updatedModel = wrapper.vm.model;
      expect(updatedModel[0].order).toBe(0);
      expect(updatedModel[1].order).toBe(1);
    });

    test('nav and navClose methods should toggle and close the navbar correctly', () => {
      const wrapper = mount(LxMasterDetail, {
        props: {
          modelValue: [],
        },
        global: {
          stubs: ['router-link'],
          directives: {
            ClickAway: directive,
          },
        },
      });

      wrapper.vm.nav();
      expect(wrapper.vm.navbar).toBe(true);

      wrapper.vm.navClose();
      expect(wrapper.vm.navbar).toBe(false);

      wrapper.vm.nav();
      wrapper.vm.navClose();
      expect(wrapper.vm.navbar).toBe(false);
    });
  });
});
