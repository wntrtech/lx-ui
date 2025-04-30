// @ts-nocheck
import { test, expect, describe, afterEach } from 'vitest';
import { mount } from '@vue/test-utils';
import LxPersonDisplay from '@/components/PersonDisplay.vue';
import 'regenerator-runtime/runtime';

let wrapper;

afterEach(() => {
  if (wrapper) {
    wrapper.unmount();
  }
});

describe('LxPersonDisplay', () => {
  let wrapper;

  afterEach(() => {
    if (wrapper) {
      wrapper.unmount();
    }
  });

  test('should be a valid component', () => {
    expect(LxPersonDisplay).toBeTruthy();
  });

  describe('Props', () => {
    test('should have default values', () => {
      wrapper = mount(LxPersonDisplay, {
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
      expect(props.name).toBe(null);
      expect(props.size).toBe('m');
      expect(props.variant).toBe('full');
      expect(props.description).toBe(null);
      expect(props.role).toBe(null);
      expect(props.institution).toBe(null);
      expect(props.icon).toBe(null);
      expect(props.iconSet).toBe(null);
      expect(props.idAttribute).toBe('id');
      expect(props.nameAttribute).toBe('name');
      expect(props.firstNameAttribute).toBe('firstName');
      expect(props.lastNameAttribute).toBe('lastName');
      expect(props.descriptionAttribute).toBe('description');
      expect(props.roleAttribute).toBe('role');
      expect(props.institutionAttribute).toBe('institution');
      expect(props.iconAttribute).toBe('icon');
      expect(props.iconSetAttribute).toBe('iconSet');
      expect(props.maxLength).toBe(3);
    });

    test('should accept provided values', () => {
      wrapper = mount(LxPersonDisplay, {
        props: {
          value: {
            customId: 'customId',
            customName: 'customName',
          },
          name: 'Custom name',
          size: 's',
          variant: 'icon-only',
          description: 'Custom description',
          role: 'Custom role',
          institution: 'Custom institution',
          icon: 'accept',
          iconSet: 'material',
          idAttribute: 'customId',
          nameAttribute: 'customName',
          firstNameAttribute: 'customFirstName',
          lastNameAttribute: 'customSurname',
          descriptionAttribute: 'customDescription',
          roleAttribute: 'customRole',
          institutionAttribute: 'customInstitution',
          iconAttribute: 'customIcon',
          iconSetAttribute: 'customIconSet',
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

      expect(props.value)
        .toStrictEqual({
          customId: 'customId',
          customName: 'customName',
        })
        .toBeTypeOf('object');
      expect(props.name).toBe('Custom name').toBeTypeOf('string');
      expect(props.size).toBe('s').toBeTypeOf('string');
      expect(props.variant).toBe('icon-only').toBeTypeOf('string');
      expect(props.description).toBe('Custom description').toBeTypeOf('string');
      expect(props.role).toBe('Custom role').toBeTypeOf('string');
      expect(props.institution).toBe('Custom institution').toBeTypeOf('string');
      expect(props.icon).toBe('accept').toBeTypeOf('string');
      expect(props.iconSet).toBe('material').toBeTypeOf('string');
      expect(props.idAttribute).toBe('customId').toBeTypeOf('string');
      expect(props.nameAttribute).toBe('customName').toBeTypeOf('string');
      expect(props.firstNameAttribute).toBe('customFirstName').toBeTypeOf('string');
      expect(props.lastNameAttribute).toBe('customSurname').toBeTypeOf('string');
      expect(props.descriptionAttribute).toBe('customDescription').toBeTypeOf('string');
      expect(props.roleAttribute).toBe('customRole').toBeTypeOf('string');
      expect(props.institutionAttribute).toBe('customInstitution').toBeTypeOf('string');
      expect(props.iconAttribute).toBe('customIcon').toBeTypeOf('string');
      expect(props.iconSetAttribute).toBe('customIconSet').toBeTypeOf('string');
      expect(props.maxLength).toBe(5).toBeTypeOf('number');
      expect(props.texts.name).toBe('Name, surname');
      expect(props.texts.description).toBe('Description').toBeTypeOf('string');
      expect(props.texts.role).toBe('Role').toBeTypeOf('string');
      expect(props.texts.institution).toBe('Institution').toBeTypeOf('string');
    });
  });

  describe('Computed Properties and Methods', () => {
    test('formatName should return formatted name', () => {
      wrapper = mount(LxPersonDisplay, {
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
      wrapper = mount(LxPersonDisplay, {
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
      wrapper = mount(LxPersonDisplay, {
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
      wrapper = mount(LxPersonDisplay, {
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
      wrapper = mount(LxPersonDisplay, {
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
      wrapper = mount(LxPersonDisplay, {
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

    test('icon should return provided icon', () => {
      wrapper = mount(LxPersonDisplay, {
        props: {
          value: { firstName: 'John', lastName: 'Doe', icon: 'flash' },
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
      const { icon } = wrapper.vm;

      expect(icon).toBe('flash');
    });

    test('iconSet should return provided iconSet', () => {
      wrapper = mount(LxPersonDisplay, {
        props: {
          value: { firstName: 'John', lastName: 'Doe', iconSet: 'cds' },
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
      const { iconSet } = wrapper.vm;

      expect(iconSet).toBe('cds');
    });

    test('filteredValues should return filtered array based on attributes', () => {
      wrapper = mount(LxPersonDisplay, {
        props: {
          value: [
            { firstName: 'John', lastName: 'Doe', description: 'Developer' },
            { firstName: 'Jane' },
            { name: 'John Doe' },
            { description: 'Tester' },
          ],
          firstNameAttribute: 'firstName',
          lastNameAttribute: 'lastName',
          nameAttribute: 'name',
          description: 'description',
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
        { name: 'John Doe' },
        { description: 'Tester' },
      ]);
    });

    test('displayItems should return array of items limited by maxLength', () => {
      wrapper = mount(LxPersonDisplay, {
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
      wrapper = mount(LxPersonDisplay, {
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

    test('showDescription should return true if description is set and size is l', () => {
      wrapper = mount(LxPersonDisplay, {
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
