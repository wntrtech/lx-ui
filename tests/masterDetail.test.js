// @ts-nocheck
import { test, expect, describe } from 'vitest';
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
      expect(props.mode).toBe('edit');
      expect(props.idAttribute).toBe('id');
      expect(props.nameAttribute).toBe('name');
      expect(props.descriptionAttribute).toBe(null);
      expect(props.categoryAttribute).toBe('category');
      expect(props.invalidAttribute).toBe('invalid');
      expect(props.texts.add).toBe('Pievienot ierakstu');
      expect(props.texts.noData).toBe('Nav datu');
      expect(props.texts.noDataDescription).toBe('Izvēlieties ierakstu, lai apskatītu datus');
      expect(props.texts.back).toBe('Atgriezties atpakaļ');
    });

    test('should accept provided values', () => {
      const wrapper = mount(LxMasterDetail, {
        props: {
          modelValue: [
            {
              id: '1',
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
          mode: 'read',
          idAttribute: 'group',
          nameAttribute: 'name',
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
          id: '1',
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
      expect(props.mode).toBe('read').toBeTypeOf('string');
      expect(props.idAttribute).toBe('group').toBeTypeOf('string');
      expect(props.nameAttribute).toBe('name').toBeTypeOf('string');
      expect(props.descriptionAttribute).toBe('customDescription').toBeTypeOf('string');
      expect(props.texts.add).toBe('Add').toBeTypeOf('string');
    });
  });

  describe('Computed properties and methods', () => {
    test('model computed property should get and set modelValue correctly', async () => {
      const wrapper = mount(LxMasterDetail, {
        props: {
          modelValue: [{ id: '1', name: 'Item 1' }],
        },
        global: {
          stubs: ['router-link'],
          directives: {
            ClickAway: directive,
          },
        },
      });

      const { model } = wrapper.vm;
      expect(model).toEqual([{ id: '1', name: 'Item 1' }]);

      await wrapper.setProps({ modelValue: [{ id: '2', name: 'Item 2' }] });
      expect(wrapper.vm.model).toEqual([{ id: '2', name: 'Item 2' }]);

      wrapper.vm.model = [{ id: '3', name: 'Item 3' }];
      expect(wrapper.emitted()['update:modelValue'][0]).toEqual([[{ id: '3', name: 'Item 3' }]]);
    });

    test('selectItem method should update activeItemCode and emit selectionChanged', () => {
      const wrapper = mount(LxMasterDetail, {
        props: {
          modelValue: [{ id: '1', name: 'Item 1' }],
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

    test('invalid items test', () => {
      const wrapper = mount(LxMasterDetail, {
        props: {
          modelValue: [
            { id: '1', name: 'Item 1', invalid: true },
            { id: '2', name: 'Item 2' },
          ],
        },
        global: {
          stubs: ['router-link'],
          directives: {
            ClickAway: directive,
          },
        },
      });

      const rows = wrapper.findAll('.lx-list-item');
      expect(rows[0].classes()).toContain('lx-invalid');
      expect(rows[1].classes()).not.toContain('lx-invalid');
    });

    test('item category test', () => {
      const wrapper = mount(LxMasterDetail, {
        props: {
          categoryAttribute: 'type',
          modelValue: [
            { id: '1', name: 'Item 1', type: 'red' },
            { id: '2', name: 'Item 2', type: 'deleted' },
            { id: '3', name: 'Item 3' },
          ],
        },
        global: {
          stubs: ['router-link'],
          directives: {
            ClickAway: directive,
          },
        },
      });

      const rows = wrapper.findAll('.lx-list-item');
      expect(rows[0].classes()).toContain('lx-category-red');
      expect(rows[1].classes()).toContain('lx-category-deleted');
      expect(rows[2].classes()).not.toContain('lx-category');
    });

    test('mode prop test', async () => {
      const wrapper = mount(LxMasterDetail, {
        props: {
          modelValue: [{ id: '1', name: 'Item 1' }],
          mode: 'edit',
        },
        global: {
          stubs: ['router-link'],
          directives: {
            ClickAway: directive,
          },
        },
      });

      const master = wrapper.find('.lx-master');
      expect(master.html()).toContain('lx-master-detail-button');
      await wrapper.setProps({ mode: 'read' });
      expect(master.html()).not.toContain('lx-master-detail-button');
    });
  });
});
