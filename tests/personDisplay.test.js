// @ts-nocheck
import { test, expect, describe } from 'vitest';
import { mount } from '@vue/test-utils';
import LxPersonDisplay from '@/components/PersonDisplay.vue';
import 'regenerator-runtime/runtime';

describe('LxPersonDisplay', () => {
  test('should be a valid component', () => {
    expect(LxPersonDisplay).toBeTruthy();
  });

  describe('Props', () => {
    test('should have default values', () => {
      const wrapper = mount(LxPersonDisplay, {
        global: {
          provide: {
            sectionMode: 'sectionMode',
            formMode: 'defaultFormMode',
            rowRequiredTexts: 'defaultRequiredTexts',
            sectionColumnCount: 3,
          },
        },
      });

      const props = wrapper.props();

      expect(props.value).toBe(null);
      expect(props.size).toBe('m');
      expect(props.kind).toBe('default');
      expect(props.variant).toBe('full');
      expect(props.description).toBe(null);
      expect(props.role).toBe(null);
      expect(props.institution).toBe(null);
      expect(props.firstNameAttribute).toBe('firstName');
      expect(props.lastNameAttribute).toBe('lastName');
      expect(props.descriptionAttribute).toBe('description');
      expect(props.roleAttribute).toBe('role');
      expect(props.institutionAttribute).toBe('institution');
      expect(props.maxLength).toBe(3);
      expect(props.texts.name).toBe('Vārds, uzvārds');
      expect(props.texts.description).toBe('Apraksts');
      expect(props.texts.role).toBe('Loma');
      expect(props.texts.institution).toBe('Iestāde');
    });

    test('should accept provided values', () => {
      const wrapper = mount(LxPersonDisplay, {
        props: {
          value: 'custom-id',
          size: 's',
          kind: 'icon',
          variant: 'icon-only',
          description: 'Custom description',
          role: 'Custom role',
          institution: 'Custom institution',
          firstNameAttribute: 'customName',
          lastNameAttribute: 'customSurname',
          descriptionAttribute: 'customDescription',
          roleAttribute: 'customRole',
          institutionAttribute: 'customInstitution',
          maxLength: 5,
          texts: {
            name: 'Name, surname',
            description: 'Description',
            role: 'Role',
            institution: 'Institution',
          },
        },
        global: {
          provide: {
            sectionMode: 'sectionMode',
            formMode: 'defaultFormMode',
            rowRequiredTexts: 'defaultRequiredTexts',
            sectionColumnCount: 3,
          },
        },
      });

      const props = wrapper.props();

      expect(props.value).toBe('custom-id').toBeTypeOf('string');
      expect(props.size).toBe('s').toBeTypeOf('string');
      expect(props.kind).toBe('icon').toBeTypeOf('string');
      expect(props.variant).toBe('icon-only').toBeTypeOf('string');
      expect(props.description).toBe('Custom description').toBeTypeOf('string');
      expect(props.role).toBe('Custom role').toBeTypeOf('string');
      expect(props.institution).toBe('Custom institution').toBeTypeOf('string');
      expect(props.firstNameAttribute).toBe('customName').toBeTypeOf('string');
      expect(props.lastNameAttribute).toBe('customSurname').toBeTypeOf('string');
      expect(props.descriptionAttribute).toBe('customDescription').toBeTypeOf('string');
      expect(props.roleAttribute).toBe('customRole').toBeTypeOf('string');
      expect(props.institutionAttribute).toBe('customInstitution').toBeTypeOf('string');
      expect(props.maxLength).toBe(5).toBeTypeOf('number');
      expect(props.texts.name).toBe('Name, surname');
      expect(props.texts.description).toBe('Description').toBeTypeOf('string');
      expect(props.texts.role).toBe('Role').toBeTypeOf('string');
      expect(props.texts.institution).toBe('Institution').toBeTypeOf('string');
    });
  });

  describe('Computed Properties and Methods', () => {
    test('formatName should return formatted name', () => {
      const wrapper = mount(LxPersonDisplay, {
        props: {
          value: { firstName: 'John', lastName: 'Doe' },
        },
        global: {
          provide: {
            sectionMode: 'none',
            formMode: 'defaultFormMode',
            rowRequiredTexts: 'defaultRequiredTexts',
            sectionColumnCount: 3,
          },
        },
      });
      const { vm } = wrapper;
      const formattedName = vm.formatName(wrapper.props().value);

      expect(formattedName).toBe('John Doe');
    });

    test('computed name should return formatted name', () => {
      const wrapper = mount(LxPersonDisplay, {
        props: {
          value: { firstName: 'John', lastName: 'Doe' },
        },
        global: {
          provide: {
            sectionMode: 'none',
            formMode: 'defaultFormMode',
            rowRequiredTexts: 'defaultRequiredTexts',
            sectionColumnCount: 3,
          },
        },
      });
      const { name } = wrapper.vm;

      expect(name).toBe('John Doe');
    });

    test('showMultiple should return true for multiple values', () => {
      const wrapper = mount(LxPersonDisplay, {
        props: {
          value: [
            { firstName: 'John', lastName: 'Doe' },
            { firstName: 'Jane', lastName: 'Doe' },
          ],
        },
        global: {
          provide: {
            sectionMode: 'none',
            formMode: 'defaultFormMode',
            rowRequiredTexts: 'defaultRequiredTexts',
            sectionColumnCount: 3,
          },
        },
      });
      const { showMultiple } = wrapper.vm;

      expect(showMultiple).toBe(true);
    });

    test('description should return provided description', () => {
      const wrapper = mount(LxPersonDisplay, {
        props: {
          value: { firstName: 'John', lastName: 'Doe', description: 'Developer' },
        },
        global: {
          provide: {
            sectionMode: 'none',
            formMode: 'defaultFormMode',
            rowRequiredTexts: 'defaultRequiredTexts',
            sectionColumnCount: 3,
          },
        },
      });
      const { description } = wrapper.vm;

      expect(description).toBe('Developer');
    });

    test('role should return provided role', () => {
      const wrapper = mount(LxPersonDisplay, {
        props: {
          value: { firstName: 'John', lastName: 'Doe', role: 'Engineer' },
        },
        global: {
          provide: {
            sectionMode: 'none',
            formMode: 'defaultFormMode',
            rowRequiredTexts: 'defaultRequiredTexts',
            sectionColumnCount: 3,
          },
        },
      });
      const { role } = wrapper.vm;

      expect(role).toBe('Engineer');
    });

    test('institution should return provided institution', () => {
      const wrapper = mount(LxPersonDisplay, {
        props: {
          value: { firstName: 'John', lastName: 'Doe', institution: 'Tech Inc.' },
        },
        global: {
          provide: {
            sectionMode: 'none',
            formMode: 'defaultFormMode',
            rowRequiredTexts: 'defaultRequiredTexts',
            sectionColumnCount: 3,
          },
        },
      });
      const { institution } = wrapper.vm;

      expect(institution).toBe('Tech Inc.');
    });

    test('filteredValues should return filtered array based on attributes', () => {
      const wrapper = mount(LxPersonDisplay, {
        props: {
          value: [
            { firstName: 'John', lastName: 'Doe', description: 'Developer' },
            { firstName: 'Jane' },
            { description: 'Tester' },
          ],
        },
        global: {
          provide: {
            sectionMode: 'none',
            formMode: 'defaultFormMode',
            rowRequiredTexts: 'defaultRequiredTexts',
            sectionColumnCount: 3,
          },
        },
      });
      const { filteredValues } = wrapper.vm;

      expect(filteredValues).toEqual([
        { firstName: 'John', lastName: 'Doe', description: 'Developer' },
        { description: 'Tester' },
      ]);
    });

    test('displayItems should return array of items limited by maxLength', () => {
      const wrapper = mount(LxPersonDisplay, {
        props: {
          value: [
            { firstName: 'John', lastName: 'Doe' },
            { firstName: 'Jane', lastName: 'Doe' },
            { firstName: 'Jim', lastName: 'Doe' },
            { firstName: 'Jack', lastName: 'Doe' },
          ],
          maxLength: 3,
        },
        global: {
          provide: {
            sectionMode: 'none',
            formMode: 'defaultFormMode',
            rowRequiredTexts: 'defaultRequiredTexts',
            sectionColumnCount: 3,
          },
        },
      });
      const { displayItems } = wrapper.vm;

      expect(displayItems).toEqual([
        { firstName: 'John', lastName: 'Doe' },
        { firstName: 'Jane', lastName: 'Doe' },
      ]);
    });

    test('tooltipItems should return array of items', () => {
      const wrapper = mount(LxPersonDisplay, {
        props: {
          value: [
            { firstName: 'John', lastName: 'Doe' },
            { firstName: 'Jane', lastName: 'Doe' },
          ],
        },
        global: {
          provide: {
            sectionMode: 'none',
            formMode: 'defaultFormMode',
            rowRequiredTexts: 'defaultRequiredTexts',
            sectionColumnCount: 3,
          },
        },
      });
      const { tooltipItems } = wrapper.vm;

      expect(tooltipItems).toEqual([
        { firstName: 'John', lastName: 'Doe' },
        { firstName: 'Jane', lastName: 'Doe' },
      ]);
    });

    test('showAvatar should return true if nameKey is set and kind is default', () => {
      const wrapper = mount(LxPersonDisplay, {
        props: {
          value: { firstName: 'John', lastName: 'Doe' },
          kind: 'default',
        },
        global: {
          provide: {
            sectionMode: 'none',
            formMode: 'defaultFormMode',
            rowRequiredTexts: 'defaultRequiredTexts',
            sectionColumnCount: 3,
          },
        },
      });
      const { showAvatar } = wrapper.vm;

      expect(showAvatar).toBe(true);
    });

    test('showDescription should return true if description is set and size is l', () => {
      const wrapper = mount(LxPersonDisplay, {
        props: {
          value: { firstName: 'John', lastName: 'Doe', description: 'Developer' },
          size: 'l',
        },
        global: {
          provide: {
            sectionMode: 'none',
            formMode: 'defaultFormMode',
            rowRequiredTexts: 'defaultRequiredTexts',
            sectionColumnCount: 3,
          },
        },
      });
      const { showDescription } = wrapper.vm;

      expect(showDescription).toBe(true);
    });
  });
});
