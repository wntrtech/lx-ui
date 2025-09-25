# LxFormBuilder Guide

## Schema attributes

LxFormBuilder implements these **standard** JSON schema attributes:

- properties
  - `title` - LxRow label
  - `description` - LxRow info slot content
  - `maxLength` - LxTextInput and LxTextArea `maxLength` prop
  - `required` - array of all required rows
  - `readOnly` - row input component `readOnly` prop
  - `examples` - placeholder for input component if `lx.placeholder` is not defined
  - `default` - this value will be assigned to `v-model` if `v-model` is equal to `null`
  - `type` - determines row input component
    - **string**: 
      - If `lx.kind` is not defined → LxTextInput with mask that is defined in `lx.mask` attribute. 
      - If `lx.kind="multiline"` → LxTextArea
      - If `lx.variant="default"` or `lx.variant="dropdown"` or `lx.variant="tiles"` or `lx.variant="tags"` → LxValuePicker with `kind="single"`
      - If `format="date"` → LxDateTimePicker with `kind="date"`
      - If `format="time"` → LxDateTimePicker with `kind="time"`
      - If `format="date-time"` → LxDateTimePicker with `kind="dateTime"`
      - If `enum` is defined → LxValuePicker with `kind="single"` and enum array values as items
    - **integer**: LxTextInput with `mask="integer"`
    - **number**: LxTextInput with mask that is defined in `lx.mask` attribute (default mask - `decimal`)
    - **boolean**: LxToggle
    - **array**:
      - If `kind="multiple"` and `items` is Array → LxValuePicker
      - If `items` is Object and `items.type = 'object'` → LxAppendableList
      - If `items` is Object and `items.type != 'object'` → LxAppendableListSimple
    - **object**: LxForm inside of LxDataBlock

    
## LX attributes

For more LX features, use custom schema attribute `lx` with these parameters:

### for all property types

- `rowSpan` - LxRow `rowSpan` prop
- `columnSpan` - LxRow `columnSpan` prop
- `tooltip` - Component `tooltip` prop
- `disabled` - Component `disabled` prop
- `placeholder` - LxTextInput, LxTextArea, LxValuePicker `placeholder` prop
- `wrapper='placeholder'` - LxPlaceholder will be used instead of LxRow
- `order` - Defines the order for LxRows. LxRows that do not have defined order attribute will be places at end in the same order as defined in schema
- `rowActionDefinitions` - LxRow `actionDefinitions` prop
  - `@rowActionClick` event available to handle LxRow action clicks.

<br>

`@emit` event is available to handle all custom emits. Can contain up to 4 parameters:
- emitName – the name of the specific component's emit event;
- key – the attribute of the component defined in the schema prop;
- value – the emitted value (defaults to undefined, but used by some emits);
- additionalParameters – optional additional parameters for the emit (defaults to undefined, used when the value alone is not sufficient).

### for `type="string"` or `type="integer"` or `type="number"`:

- `mask` - LxTextInput `mask` prop
- `kind` - LxTextInput, LxValuePicker `kind` prop
- `scale` - LxTextInput `scale` prop for `mask="decimal"`
- `uppercase` - LxTextInput `uppercase` prop
- `convertToString` - LxInput `convertToString` prop
- `signed` - LxTextInput `signed` prop form `mask="decimal"`
- `customMaskValue` - LxTextInput `customMaskValue` prop. Used only when `mask` prop is `custom`

### for `type="string"` and `lx.kind="multiple"`
- `rows` - LxTextArea `rows` prop
- `dynamicHeight` - LxTextArea `dynamicHeight` prop
### for `type="string"` and (`lx.variant="default"` or `lx.variant="dropdown"` or `lx.variant="tiles"` or `lx.variant="tags"`)
- `items` - LxValuePicker `items` prop
- `variant` - LxValuePicker `variant` prop
- `hasSearch` - LxValuePicker `hasSearch` prop
- `alwaysAsArray` - LxValuePicker `alwaysAsArray` prop
- `nullable` - LxValuePicker `nullable` prop
- `texts` - LxValuePicker `texts` prop
- `hasSelectAll` - LxValuePicker `hasSelectAll` prop
- `readOnlyRenderType` - LxValuePicker `readOnlyRenderType` prop
### `type="string"` and (`format="date"` or `format="time"` or `format="date-time"`)
- `minDate` - LxDateTimePicker `minDate` prop
- `maxDate` - LxDateTimePicker `maxDate` prop
- `required` - LxDateTimePicker `required` prop
- `timeAdjust` - LxDateTimePicker `timeAdjust` prop
- `clearIfNotExact` - LxDateTimePicker `clearIfNotExact` prop
- `texts` - LxDateTimePicker `texts` prop
- `tooltip` - LxDateTimePicker `tooltip` prop
- `locale` LxDateTimePicker `locale` prop
- `specialDates` LxDateTimePicker `specialDates` prop
- `dictionary` LxDateTimePicker `dictionary` prop
- `variant` - LxDateTimePicker `variant` prop
### `type="array"`
- `items` - LxValuePicker `items` prop
- `variant` - LxValuePicker `variant` prop
- `hasSearch` - LxValuePicker `hasSearch` prop
- `alwaysAsArray` - LxValuePicker `alwaysAsArray` prop
- `nullable` - LxValuePicker `nullable` prop
- `texts` - LxValuePicker `texts` prop
- `hasSelectAll` - LxValuePicker `hasSelectAll` prop
- `readOnlyRenderType` - LxValuePicker `readOnlyRenderType` prop
- `idAttribute` - LxValuePicker `idAttribute` prop
- `nameAttribute` - LxValuePicker `nameAttribute` prop
- `iconAttribute` - LxValuePicker `iconAttribute` prop
- `iconSetAttribute` - LxValuePicker `iconSetAttribute` prop
- `categoryAttribute` - LxValuePicker `categoryAttribute` prop
- `descriptionAttribute` - LxValuePicker `descriptionAttribute` prop
- `searchAttributes` - LxValuePicker `searchAttributes` prop
- `displayType` -  determines the way how array is displayed ('default' || 'list' || 'listModal' || 'table' || 'tableModal')
  - if `displayType = 'list'` || `displayType = 'listModal'`
    - `idAttribute` - LxList `idAttribute` prop
    - `primaryAttribute` - LxList `primaryAttribute` prop
    - `secondaryAttribute` - LxList `secondaryAttribute` prop
    - `hrefAttribute` - LxList `hrefAttribute` prop
    - `groupAttribute` - LxList `groupAttribute` prop
    - `clickableAttribute` - LxList `clickableAttribute` prop                  
    - `iconAttribute` - LxList `iconAttribute` prop
    - `iconSetAttribute` - LxList `iconSetAttribute` prop        
    - `tooltipAttribute` - LxList `tooltipAttribute` prop
    - `categoryAttribute` - LxList `categoryAttribute` prop
    - `orderAttribute` - LxList `orderAttribute` prop
    - `hasSearch` - LxList `hasSearch` prop
    - `groupDefinitions` - LxList `groupDefinitions` prop
    - `icon` - LxList `icon` prop
    - `iconSet` - LxList `iconSet` prop
    - `kind` - LxList `kind` prop
    - `listType` - LxList `listType` prop
    - `hasSearch` - LxList `hasSearch` prop
    - `searchString` - LxList `searchString` prop
    - `searchSide` - LxList `searchSide` prop
    - `loading` - LxList `loading` prop
    - `busy` - LxList `busy` prop
    - `hideFilteredItems` - LxList `hideFilteredItems` prop
    - `texts` - LxList `texts` prop
    - `emptyStateIcon` - LxList `emptyStateIcon` prop
    - `includeUnspecifiedGroup` - LxList `includeUnspecifiedGroup` prop
  - if `displayType = 'table'` || `displayType = 'tableModal'`
    - `loading` - LxDataGrid `loading` prop
    - `busy` - LxDataGrid `busy` prop
    - `skeletonRowCount` - LxDataGrid `skeletonRowCount` prop
    - `showHeader` - LxDataGrid `showHeader` prop
    - `showStatusBar` - LxDataGrid `showStatusBar` prop
    - `showAllColumns` - LxDataGrid `showAllColumns` prop
    - `hasSorting` - LxDataGrid `hasSorting` prop
    - `sortingIgnoreEmpty` - LxDataGrid `sortingIgnoreEmpty` prop
    - `itemsPerPage` - LxDataGrid `itemsPerPage` prop
    - `totalItems` - LxDataGrid `totalItems` prop
    - `sortingMode` - LxDataGrid `sortingMode` prop
    - `texts` - LxDataGrid `texts` prop
    - `label` - LxDataGrid `label` prop
    - `description` - LxDataGrid `description` prop
### `type="boolean"`
- `size` - LxToggle `size` prop
- `labelOn` - LxToggle on slot text
- `labelOff` - LxToggle off slot text
- `labelIndeterminate` - LxToggle indeterminate slot text
### `type="object"`
 - `icon` - LxDataBlock `icon` prop
 - `nameAttribute` - LxDataBlock `name` prop
 - `columnCount` - LxForm `columnCount` prop
 - `forceUppercase` - LxDataBlock `forceUppercase` prop
 - `size` - LxDataBlock `size` prop
 - `iconSet` - LxDataBlock `iconSet` prop
 - `descriptionAttribute` - LxDataBlock `description` prop
 - `disabled` - LxDataBlock `disabled`
 - `loading` - LxDataBlock  `loading` prop
 - `busy` - LxDataBlock `busy` prop
 - `displayType` -  determines the way how object is displayed ('default' || 'modal')
    - if `displayType = 'modal'`:
      - `primaryAttribute` - LxListItem `label` prop
      - `secondaryAttribute` - LxListItem `description` prop
      - `formColumnCount` - LxForm `columnCount` prop

## LxAppendableList

When schema defines an array of objects (property `type="array"` and `items` is `Object`), Form Builder is using LxAppendableList to render that.

It is basically an LxForm inside another LxForm.

Each attribute mentioned in properties list is an LxRow by itself, therefore all the usual LxFormBuilder props can be defined for each element.

The only exception is that LxAppendableList cannot be used inside another LxAppendableList, so an array of objects inside an array of objects won't render even if defined.

### LX attributes for LxAppendable List
  - `readOnly` - LxAppendableList readOnly prop
  - `expandable` - LxAppendableList expandable prop
  - `nameAttribute` - LxAppendableList nameAttribute prop
  - `addButtonLabel` - LxAppendableList addButtonLabel prop
  - `columnCount` - LxAppendableList columnCount prop
  - `kind` - LxAppendableList kind prop
  - `requiredMode` - LxAppendableList required prop
  - `forceUppercase` - LxAppendableList forceUppercase prop
  - `defaultExpanded` - LxAppendableList defaultExpanded prop
  - `expandedAttribute` - LxAppendableList expandedAttribute prop

## LxAppendableListSimle

When schema defines an array of objects (property `type="array"` and `items` is `string`, `number`, `integer` or `boolean`), Form Builder is using LxAppendableListSimple to render that.

This component works similarly to LxAppendableList, only difference is that LxAppendableListSimple operates not with object arrays, but with string, number, boolean arrays.

### LX attributes for LxAppendableListSimple

LxAppendableListSimple has all the same LX attributes, except, `expandable`.

## LxDataBlock

When schema defines an object (`type="object"`), Form Builder is using LxForm inside of LxDataBlock to render that.

Inside of this rows properties attribute LxForms fields can be defined.

## Additional information

If `title` attribute is not defined for a property, property's attribute name is used as LxRow `label` prop.

## Validations

LxFormBuilder implements these **standard** JSON schema attributes as LxForm validations:

### Number validations
 - `minimum` - The value must be a number. Validates only if value is greater than or exactly equal to "minimum".
 - `exclusiveMinimum` - The value must be a number. Validates only if value is strictly greater than "exclusiveMinimum".
 - `maximum` - The value must be a number. Validates only if value is less than or exactly equal to "maximum".
 - `exclusiveMaximum` - The value must be a number. Validates only if value is strictly less than "exclusiveMaximum".
 - `multipleOf` - The value must be a number, strictly greater then 0. A numeric instance is valid only if division by this keyword's value results in an integer.
### String validations
 - `minLength` - The value must be a non-negative integer. Validates only if values length is greater than, or equal to, the value of this keyword. 
 - `maxLength` - The value must be a non-negative integer. Validates only if values length is less than, or equal to, the value of this keyword.
 - `pattern` - The value of this keyword must be a string. This string should be a valid regular expression. Validates if the regular expression matches the instance successfully.
### Array validations
 - `minItems` - The value must be a non-negative integer. Validates only if values size is greater than, or equal to, the value of this keyword.
 - `maxItems` - The value must be a non-negative integer. Validates only if values size is less than, or equal to, the value of this keyword.
 - `uniqueItems` - The value must be a boolean. If it has boolean value true, validates successfully if all of its elements are unique.
### Object validations
 - `minProperties` - The value must be a non-negative integer. Validates if its number of properties is greater than, or equal to, the value of this keyword.
 - `maxProperties` - The value must be a non-negative integer. Validates if its number of properties is less than, or equal to, the value of this keyword.
 - `required` - The value must be an array. Validates if every item in the array is the name of a property in the instance.


---

## Schema Example

```js

const schema = {
  type: 'object',
  required: ['firstName', 'isActive'],
  properties: {
    firstName: {
      title: 'Name',
      description: 'Person\'s name',
      type: 'string',
      maxLength: 15,
      readOnly: null,
      lx: {
        mask: 'default',
        columnSpan: 2,
      },
    },
    lastName: {
      title: 'Last Name',
      description: 'Person\'s last name',
      type: 'string',
      maxLength: 15,
    },
    isActive: {
      title: 'Active',
      type: 'boolean',
      lx: {
        labelOn: 'True',
        labelOff: 'False',
      },
    },
    description: {
      title: 'Description',
      type: 'string',
      lx: {
        kind: 'multiline',
        rows: 5,
      },
    },
    favoriteGame: {
      title: 'Favorite game',
      type: 'string',
      lx: {
        hasSearch: true,
        variant: 'dropdown',
        items: [
          {
            id: '1',
            name: 'Dota 2',
          },
          {
            id: '2',
            name: 'CS:GO',
          },
          {
            id: '3',
            name: 'PUBG',
          },
          {
            id: '4',
            name: 'Fortnite',
          },
        ],
      },
    },
    dislikedGames: {
      title: 'Disliked games',
      type: 'array',
      lx: {
        variant: 'default',
        items: [
          {
            id: '1',
            name: 'Dota 2',
          },
          {
            id: '2',
            name: 'CS:GO',
          },
          {
            id: '3',
            name: 'PUBG',
          },
          {
            id: '4',
            name: 'Fortnite',
          },
        ],
      },
    },
    birthDate: {
      title: 'Birth date',
      type: 'string',
      format: 'date',
    },
    developers: {
      title: 'Favorite game developers',
      type: 'array',
      items: {
        properties: {
          name: {
            type: 'string',
            title: 'Name',
          },
          comment: {
            type: 'string',
            title: 'Comment',
            lx: {
              kind: 'multiline',
            },
          },
        },
      },
    },
    placeholder: {
      lx: {
        wrapper: 'placeholder',
      },
    },
    computer: {
      title: 'Computer specification',
      type: 'object',
      properties: {
        type: {
          type: 'string',
          title: 'Tips',
          lx: {
            items: [
              { id: 'desktop', name: 'Desktop computer' },
              { id: 'laptop', name: 'Laptop' },
            ],
            variant: 'dropdown',
          },
        },
        cpu: {
        type: 'string',
        title: 'Processor',
        },
        gpu: {
        type: 'string',
        title: 'Graphics Card',
        },
        psu: {
        type: 'string',
        title: 'Power Supply',
        },
        memory: {
        type: 'number',
        title: 'Memory (GB)',
        },
        hasWifi: {
        type: 'boolean',
        title: 'WiFi',
        },
      },
      lx: {
        nameAttribute: 'type',
        icon: 'hardware',
        formColumnCount: 2,
      },
    },
    profile: {
      type: 'object',
      title: 'Player profile',
      properties: {
        nickname: {
          type: 'string',
          title: 'Nickname',
        },
        level: {
          type: 'integer',
          title: 'Level',
        },
      },
      lx: {
        displayType: 'modal',
        primaryAttribute: 'nickname',
        secondaryAttribute: 'level',
      },
    },
    drivingGames: {
      title: 'Favorite driving games',
      type: 'array',
      items: {
        properties: {
          id: {
            type: 'string',
            title: 'ID',
          },
          name: {
            type: 'string',
            title: 'Name',
          },
        },
      },
      lx: {
        displayType: 'list',
        listType: '1',
      },
    },
    mobaGames: {
      title: 'Favorite MOBA games',
      type: 'array',
      items: {
        properties: {
          id: {
            type: 'string',
            title: 'ID',
          },
          name: {
            type: 'string',
            title: 'Name',
          },
        },
      },
      lx: {
        displayType: 'listModal',
        listType: '2',
      },
    },
    fpsGames: {
      title: 'Favorite shooting games',
      type: 'array',
      items: {
        properties: {
          id: {
        type: 'string',
        title: 'Identifier',
          },
          name: {
        type: 'string',
        title: 'Name',
          },
          playerCount: {
        title: 'Player count',
        type: 'number',
          },
        },
      },
      lx: {
        displayType: 'table',
      },
    },
    sportsGames: {
      title: 'Favorite sports games',
      type: 'array',
      items: {
        properties: {
          id: {
            type: 'string',
            title: 'Identifier',
          },
          name: {
            type: 'string',
            title: 'Name',
          },
          multiplayer: {
            type: 'boolean',
            title: 'Multiplayer game',
          },
        },
      },
      lx: {
        displayType: 'tableModal',
      },
    },
  },
};
```

This schema would generate 15 rows:
1. **firstName**
  - LxRow occupies 2 LxForm columns 
  - LxRow label is "Name"
  - LxRow has info slot with content "Person's names"
  - This row is required
  - LxTextInput component is generated in this row
  - LxTextInput has character limit of 15, readOnly set to false, default mask
2. **lastName**
  - LxRow occupies 1 LxForm column (default)
  - LxRow label is "Last Name"
  - LxRow has info slot with content "Person's last name"
  - LxTextInput component is generated in this row
  - LxTextInput has character limit of 15, default mask
3. **isActive**
  - LxRow occupies 1 LxForm column (default)
  - LxRow label is "Active"
  - LxRow has no info slot
  - This row is required
  - LxToggle component is generated in this row
  - LxToggle has "True" inserted into on slot
  - LxToggle has "False" inserted into off slot
4. **description**
  - LxRow occupies 2 LxForm columns
  - LxRow label is "Description"
  - LxRow has no info slot
  - LxTextArea component is generated in this row
  - LxTextArea has height of 5 lines
5. **favoriteGame**
  - LxRow occupies 1 LxForm column (default)
  - LxRow label is "Favorite game"
  - LxRow has no info slot
  - LxValuePicker component with `kind="single"` is generated in this row
  - LxValuePicker has 4 items and variant set to "dropdown"
  - LxValuePicker has search
6. **dislikedGames**
  - LxRow occupies 1 LxForm column (default)
  - LxRow label is "Disliked games"
  - LxRow has no info slot
  - LxValuePicker component with `kind="multiple"` is generated in this row
  - LxValuePicker has 4 items and variant set to "default"
7. **birthDate**
  - LxRow occupies 1 LxForm column (default)
  - LxRow label is "Birth date"
  - LxDateTimePicker component with `kind="date"` is generated in this row
8. **developers**
  - LxRow occupies 1 LxForm column (default)
  - LxRow label is "Favorite game developers"
  - LxAppendableList component is generated in this row
9. **placeholder**
  - LxPlaceholder component is generated in this row
  - LxPlaceholder occupies 1 LxForm column (default)
10. **computer**
  - LxRow occupies 1 LxForm column (default)
  - LxRow label is "Computer specification"
  - LxDataBlock component is generated in this row if model value is not defined or null
11. **profile**
  - LxRow occupies 1 LxForm column (default)
  - LxRow label is "Player profile"
  - LxListItem component is generated in this row if model value is not defined or null
  - LxButton component that allows to create object is generated in this row if model value is null or undefined
12. **drivingGames**
  - LxRow occupies 1 LxForm column (default)
  - LxRow label is "Favorite driving games"
  - LxList component is generated in this row
13. **mobaGames**
  - LxRow occupies 1 LxForm column (default)
  - LxRow label is "Favorite MOBA games"
  - LxList component is generated in this row
  - Every item is openable and editable in modal dialog
14. **fpsGames**
  - LxRow occupies 1 LxForm column (default)
  - LxRow label is "Favorite shooting games"
  - LxDataGrid component is generated in this row
15. **sportsGames**
- LxRow occupies 1 LxForm column (default)
- LxRow label is "Favorite sports games"
- LxDataGrid component is generated in this row
- Every item is openable and editable in modal dialog

---

## Other Components

Since lx/ui `1.9.0 beta 5` version, many other input and display components can be defined with LxFormBuilder.

The required component can be defined in the `displayType` attribute of the `lx` attribute.

For example, the LxCamera component can be defined in this way:

```js
{
  type: 'object',
  properties: {
    camera: {
      type: 'string',
      lx: {
        displayType: 'camera'
      },
    },
  }
}
```

Input component type is the type of components `modelValue` prop. However container and indicator components can mostly be defined in one of two ways: 
- type='object' - all props must be defined in `modelValue`;
- type='string' or type='array' - all props must be defined in `schema`, only the main one can be defined in `modelValue`. 

Using `type="object"`
```js
const schema = {
  type: 'object',
  properties: {
    icon: {
      type: 'object',
      lx: {
        displayType: 'icon'
      },
    },
  }
}

const modelValue = ref({
  icon: { value: 'flash', iconSet: 'cds', title: 'Flash icon'}
})
```

Using `type="string"`
```js
const schema = {
  type: 'object',
  properties: {
    icon: {
      type: 'string',
      lx: {
        displayType: 'icon',
        iconSet: 'cds',
        title: 'Flash icon',
      },
    },
  }
}

const modelValue = ref({
  icon: 'flash',
})
```

List of added components their types and main props:

| Component | displayType | type | main prop (only for not input components) |
| -------- | ------- | ------- | ------- |
| LxAutoComplete | 'autoComplete' | 'string', 'array', 'object' | - |
| LxButton | 'button' | 'string', 'object' | `label` |
| LxCamera | 'camera' | 'string' | - |
| LxCheckbox | 'checkbox' | 'boolean' | - |
| LxContentSwitcher | 'contentSwitcher' | 'string' | - |
| LxDataVisualizer | 'dataVisualizer' | 'array', 'object' | `items` |
| LxDropdownMenu | 'dropDownMenu' | 'string', 'object' | `label` |
| LxFileUploader | 'file' | 'array' | - |
| LxFileViewer | 'fileViewer' | 'string' | - |
| LxFlag | 'flag' | 'string', 'object' | `value` |
| LxIcon | 'icon' | 'string', 'object' | `value` |
| LxIllustration | 'illustration' | 'string', 'object' | `value` |
| LxLink | 'link' | 'string', 'object' | `href` |
| LxMap | 'map' | 'object' | - |
| LxMarkdownTextArea | 'markdown' | 'string' | - |
| LxNumberSlider | 'numberSlider' | 'integer' | - |
| LxPersonDisplay | 'personDisplay' | 'string', 'array', 'object' | `value` |
| LxQr | 'qr' | 'string', 'object' | `value` |
| LxQrScanner | 'qrScanner' | 'object' | - |
| LxRatings | 'ratings' | 'integer', 'number' | - |
| LxRichTextDisplay | 'richTextDisplay' | 'string', 'object' | `value` |
| LxStateDisplay | 'stateDisplay' | 'string', 'object' | `value` |
| LxSteps | 'steps' | 'string' | - |
| LxVisualPicker | 'visualPicker' | 'string', 'array' | - |
| LxDayInput | 'dayInput' | 'integer', 'object' | - |
| LxDrawPad | 'drawPad' | 'string' | - |
| LxLogoDisplay | 'logoDisplay' | 'string', 'object' | `value` |
| LxStack | 'stack' | 'object' | - |

There is also an option to show basic text: 

```js
const schema = {
  type: 'object',
  properties: {
    text: {
      type: 'string',
      lx: {
        displayType: 'text',
      },
    },
  }
}

const modelValue = ref({
  text: 'text',
})
```

LxStack component can be used to describe custom layout inside each row. Components can be put inside up to 2 LxStack nested levels.

```js
const schema = {
  type: 'object',
  properties: {
    outerStack: {
      type: 'object',
      lx: {
        displayType: 'stack',
        orientation: 'horizontal',
        mode: 'grid',
        horizontalAlignment: 'stretch',
        verticalAlignment: 'center',
        horizontalConfig: ['*', 'auto'],
      },
      properties: {
        name: {
          type: 'string',
        },
        innerStack: {
          type: 'object',
          lx: {
            displayType: 'stack',
            orientation: 'horizontal',
          },
          properties: {
            icon: {
              type: 'string',
              lx: {
                displayType: 'button',
                icon: 'info',
                kind: 'ghost',
              },
            },
            flag: {
              type: 'object',
              lx: {
                displayType: 'flag',
                value: 'lv',
              },
            },
          },
        },
      },
    },
  }
}
```

## LxList customItem layouts

There are 2 ways to define LxList customItem layout:
 - `lx.hasCustomItems === 'default'`
 - `lx.hasCustomItems === 'nested'`

 These are 7 different display types for List items that can be defined using `lx.displayType` attribute:

| displayType | type | description |
| -------- | ------- |  ------- | 
| 'primaryText' | 'string' | Displays value using 'lx-primary' class | 
| 'secondaryText' | 'string' | Displays value using 'lx-secondary' class | 
| 'flag' | 'string', 'object' | Displays country flag using LxFlag | 
| 'stateDisplay' | 'string', 'object' | Displays state using LxStateDisplay | 
| 'personDisplay' | 'string', 'object'  | Displays person information using LxPersonDisplay | 
| 'icon' | 'string', 'object' | Displays icon using LxIcon | 
| `not-defined` | 'string' | Displays value using basic text | 

### hasCustomItems === 'default'

This variant is designed to display a flat object elements. Element attributes are defined in the `items.properties` attribute and special keywords are used to define the layout. 

Using this variant, all list element attributes are placed in an LxStack with `grid` mode. This means that for each attribute it is possible to define in which row and column it will be placed, using the `stackRow` and `stackColumn` keywords.
 
The number of LxStack rows and columns, as well as all other props, can be defined in the `lx.stack` element.

```js
const schema = {
  type: 'object',
  properties: {
    list: {
      title: 'Custom item list',
      type: 'array',
      lx: {
        displayType: 'list',
        listType: '1',
        hasCustomItems: 'default',
        stack: {
          orientation: 'horizontal',
          verticalAlignment: 'center',
          mode: 'grid',
          horizontalConfig: ['*', '*'],
          verticalConfig: ['*', 'auto'],
        },
      },
      items: {
        properties: {
          id: {
            type: 'string',
            title: 'ID',
          },
          name: {
            type: 'string',
            title: 'Name',
            lx: {
              displayType: 'primaryText',
              stackRow: '1',
              stackColumn: '2',
            },
          },
          country: {
            type: 'string',
            title: 'Country',
            lx: {
              displayType: 'flag',
              stackRow: '2',
              stackColumn: 2,
            },
          },
        },
      },
    },
  },
}

const model = {
  list: [
    {id: '1', name: 'Latvia', country: 'lv'},
    {id: '2', name: 'Lithuania', country: 'lt'},
    {id: '3', name: 'Estonia', country: 'ee'},
  ]
}
```

### hasCustomItems === 'nested'

This variant is used to display nested object elements. It allows to put LxStack inside another LxStack, thus allowing more flexible layouts.

Stack element can be defined using `lx.displayType = 'stack'`.

```js
const schema = {
  type: 'object',
  properties: {
    nestedList: {
      title: 'Custom item list',
      type: 'array',
      lx: {
        displayType: 'list',
        listType: '1',
        hasCustomItems: 'default',
        stack: {
          orientation: 'horizontal',
          verticalAlignment: 'center',
          mode: 'grid',
          horizontalConfig: ['*', '*'],
          verticalConfig: ['*', 'auto'],
        },
      },
      items: {
        properties: {
          outerStack: {
            type: 'object',
            lx: {
              displayType: 'stack'
            },
            properties: {
              id: {
                type: 'string',
                title: 'ID',
              },
              innerStack: {
                type: 'object',
                lx: {
                  displayType: 'stack'
                },
                properties: {
                  name: {
                    type: 'string',
                    title: 'Name',
                    lx: {
                      displayType: 'primaryText',
                      stackRow: '1',
                      stackColumn: '2',
                    },
                  },
                  country: {
                    type: 'string',
                    title: 'Country',
                    lx: {
                      displayType: 'flag',
                      stackRow: '2',
                      stackColumn: 2,
                    },
                  },
                }
              },
            }
          },
          id: {
            type: 'string',
            title: 'ID',
          },
          name: {
            type: 'string',
            title: 'Name',
            lx: {
              displayType: 'primaryText',
              stackRow: '1',
              stackColumn: '2',
            },
          },
          country: {
            type: 'string',
            title: 'Country',
            lx: {
              displayType: 'flag',
              stackRow: '2',
              stackColumn: 2,
            },
          },
        },
      },
    },
  },
}

const model = {
  nestedList: [
    { outerStack: {id: '1', innterName: {name: 'Latvia', country: 'lv'}}},
    { outerStack: { id: '2', innterName: {name: 'Lithuania', country: 'lt'}}},
    { outerStack: { id: '3', innterName: {name: 'Estonia', country: 'ee'}}},
  ]
}
```

### Validations

Starting from lx/ui version `1.9.0`, the `validations` prop is available in all builder components.
It allows you to define custom validation messages whenever needed.
If an attribute has a non-empty error message in the `validations` prop, the component’s `invalid` prop will be set to `true`, and the `invalidationMessage` prop will contain the defined message.

#### Validations example

Example `schema` prop: 
```js
const schema = {
  type: 'object',
  properties: {
    name: {
      type: 'string',
    },
    age: {
      type: 'number',
    },
    isStudent: {
      type: 'boolean',
    },
  }
}
```
Example `validations` prop: 
```js
const validations = {
  name: 'Please enter a name',
  age: 'Age must be at least 18',
}
```

In this example in form there is going to be 3 input fields: 
- The **name** input field will be in an invalid state and display the message: "Please enter a name";
- The **age** input field will be in an invalid state and display the message: "Age must be at least 18";
- The **isStudent** input field will not be in an invalid state.

## Component examples

### Basic Text

```js
{
  type: 'string',
  lx: {
    displayType: 'text'
  }
}
```

### LxAutoComplete
 
`type='string'` for single selection, or `type='array'` for multiple selection mode
```js
{
  autoComplete: {
    type: 'string',
    lx: {
      displayType: 'autoComplete'
      items:  [{id: 'one', name: 'One'}, {id: 'two', name: 'Two'}],
      idAttribute: 'id',
      nameAttribute: 'name',
      dictionary: null,
      groupId:null,
      queryMinLength: 0,
      queryMaxLength: null,
      queryDebounce: 200,
      placeholder: null,
      tooltip: 'AutoComplete tooltip',
      readOnly: false,
      disabled: false,
      loading: false,
      hasDetails: false,
      detailMode: 'simple',
      variant: 'default',
      preloadedItems: null,
      labelId: null,
      hasSelectAll: false,
      searchAttributes: null
    }
  }
}
```

### LxButton

#### type="string"
schema: 
```js
{
  button: {
    type: 'string',
    lx: {
      displayType: 'button'
      id: 'button-id',
      title: 'button title',
      busyTooltip: '',
      icon: 'flash',
      iconSet: 'cds',
      iconVariant: 'default',
      kind: 'primary',
      variant: 'default',
      size: 'default',
      destructive: false,
      href: {},
      disabled: false,
      loading: false,
      busy: false,
      badge: '',
      badgeType: 'default', 
      active: false,
      tabindex:  0,
      customClass: '',
      openInNewTab: false,
    }
  }
}
```

modelValue:

```js
{
  button: 'button label',
}
```

#### type="object"
schema: 
```js
{
  button: {
    type: 'object',
    lx: {
      displayType: 'button'
    }
  }
}
```
modelValue:

```js
{
  button: {
    label: 'button label',
    title: 'button title',
    busyTooltip: '',
    icon: 'flash',
    iconSet: 'cds',
    iconVariant: 'default',
    kind: 'primary',
    variant: 'default',
    size: 'default',
    destructive: false,
    href: {},
    disabled: false,
    loading: false,
    busy: false,
    badge: '',
    badgeType: 'default', 
    active: false,
    tabindex:  0,
    customClass: '',
    openInNewTab: false,
  }
}
```

### LxCamera

schema:
```js

{
  camera: {
    type: 'string',
    lx: {
      displayType: 'camera'
      id: 'camera-id',
      cameraSwitcherMode: 'toggle',
      hasFlashlightToggle: false,
      imageSize: 'default',
      preferencesId: 'lx-camera-settings',
      labelId: null,
      texts: undefined,
    }
  }
}
```

### LxCheckbox

```js
{
  checkbox: {
    type: 'boolean',
    lx: {
      displayType: 'checkbox',
      groupId: null,
      label: 'label',
      disabled: false,
      value: 'none',
      tabindex: '0',
      labelId: null,
    }
  }
}
```

### LxContentSwitcher

```js
{
  checkbox: {
    type: 'string',
    lx: {
      displayType: 'contentSwitcher'
      items: [{id: 'one', name: 'One'}, {id: 'two', name: 'Two'}],
      idAttribute: 'id',
      nameAttribute: 'name',
      readOnly: false,
      disabled: false,
      kind : 'default',
      icon : null,
      tooltip: null,
      labelId: null,
    }
  }
}
```

### LxDataVisualizer

#### type='array'

schema: 
```js
{
  dataVisualizer: {
    type: 'array',
    lx: {
      displayType: 'dataVisualizer'
      kind: 'bars-horizontal',
      thresholds: [],
      showValues: 'default',
      idAttribute: 'id',
      nameAttribute: 'name',
      colorAttribute: 'color',
      valueAttribute: 'value',
      showLegend: false,
      targets: [],
      maxValue: null,
      mode: 'default',
    }
  }
}
```

modelValue: 

```js
{
  dataVisualizer: [{id: 'one', name: 'One', value: 10}, {id: 'two', name: 'Two', value: 8}],
}
```

#### type='object'

schema: 
```js
{
  dataVisualizer: {
    type: 'object',
    lx: {
      displayType: 'dataVisualizer'
    }
  }
}
```

modelValue: 

```js
{
  dataVisualizer: {
    kind: 'bars-horizontal',
    items: [{id: 'one', name: 'One', value: 10}, {id: 'two', name: 'Two', value: 8}],
    thresholds: [],
    showValues: 'default',
    idAttribute: 'id',
    nameAttribute: 'name',
    colorAttribute: 'color',
    valueAttribute: 'value',
    showLegend: false,
    targets: [],
    maxValue: null,
    mode: 'default',
  }
}
```

### LxDateTimeRange
schema:
```js
{
  dateTimeRange: {
    type: 'object',
    format: 'date',
    lx: {
      displayType: 'dateTimeRange',
      minDate: '2025-01-01',
      maxDate: '2025-12-31',
      required: false,
      disabled: false,
      timeAdjust: false,
      rangeMonth: 'next',
      clearIfNotExact: false,
    }
  }
}
```

modelValue:
```js
{
  dateTimeRange: {
    startDate: '2025-06-06',
    endDate: '2025-07-01',
  }
}
```

### LxDropDownMenu

#### type="object"
schema: 
```js
{
  dropDownMenu: {
    type: 'object',
    lx: {
      displayType: 'dropDownMenu',
      items: [
        {
          label: 'Edit',
          icon: 'edit',
        },
        {
          label: 'Delete',
          icon: 'delete',
          destructive: true,
        },
      ]
    }
  }
}
```
modelValue:

```js
{
  dropDownMenu: {
    label: 'Open actions',
    variant: 'icon-only',
    icon: 'overflow-menu',
    kind: 'ghost',
  }
}
```

### LxFileUplader

```js
{
  file: {
    type: 'array',
    lx: {
      displayType: 'file',
      kind: 'multiple',
      mode: 'default',
      draggable: false,
      dataType: 'meta',
      hasSearch: false,
      disabled: false,
      loading: false,
      busy: false,
      readOnly: false,
      allowedFileExtensions: [],
      maxFileSize: 30000000,
      hasDownloadButton: false,
      showMeta: true,
      maxSizeForMeta: 30000000,
      hasCamera: false,
      cameraSwitcherMode: 'toggle',
      hasFlashlightToggle: false,
      imageSize: 'default',
      preferencesId: 'lx-camera-settings',
      labelId: null,
    }
  }
}
```
### LxFileViewer 

```js
{
  fileViewer: {
    type: 'string',
    lx: {
      displayType: 'fileViewer',
      scrollable: false,
      width: 'auto',
      height: 'auto',
      fileName: null,
      showPrintButton: false,
      showFullScreenButton: true,
      primaryDownloadButton: false,
      stickyHeader: true,
      zoomLevel: null,
      downloadType: 'default',
      preloadLibs: [],
    }
  }
}
```

### LxFlag

#### type="string"

schema: 
```js
{
  flag: {
    type: 'string',
    lx: {
      displayType: 'flag'
      size: 'm',
      title: 'Latvian flag'
    }
  }
}
```

modelValue: 

```js
{
  flag: 'lv',
}
```

#### type="object"

schema: 
```js
{
  flag: {
    type: 'object',
    lx: {
      displayType: 'flag'
    }
  }
}
```

modelValue: 

```js
{
  flag: { value: 'lv',  size: 'm', title: 'Latvian flag' },
}
```

### LxIcon

#### type="string"

schema: 
```js
{
  icon: {
    type: 'string',
    lx: {
      displayType: 'icon'
      iconSet: 'cds',
      variant: 'default',
      customClass: '',
      animation: 'default',
      meaningful: false,
      title: 'Flash icon'
      desc: '',
    }
  }
}
```

modelValue: 

```js
{
  icon: 'flash',
}
```

#### type="object"

schema: 
```js
{
  icon: {
    type: 'object',
    lx: {
      displayType: 'icon'
    }
  }
}
```

modelValue: 

```js
{
  icon: { value: 'lv',  size: 'm', title: 'Flash icon' },
}
```

### LxIllustration

#### type="string"

schema: 
```js
{
  illustration: {
    type: 'string',
    lx: {
      displayType: 'illustration'
      class: 'lx-illustration'
      animation: 'default',
    }
  }
}
```

modelValue: 
```js
{
  illustration: 'success',
}
```

#### type="object"

schema: 
```js
{
  illustration: {
    type: 'object',
    lx: {
      displayType: 'illustration'
    }
  }
}
```

modelValue: 
```js
{
  illustration: { value: 'success',  class: 'lx-illustration', animation: 'default' },
}
```

### LxLink

#### type="string"

schema: 
```js
{
  link: {
    type: 'string',
    lx: {
      displayType: 'link'
    }
  }
}
```

modelValue: 
```js
{
  link: '/profile',
}
```

#### type="object"

schema: 
```js
{
  link: {
    type: 'object',
    lx: {
      displayType: 'link'
    }
  }
}
```

modelValue: 
```js
{
  link: { name: 'profile' },
}
```

### LxMap

schema: 
```js
{
  map: {
    type: 'object',
    lx: {
      displayType: 'map'
    }
  }
}
```

modelValue: 
```js
{
  map: { 
    zoom: 2,
    center: { lat: 0, lng: 0 },
    showSearch: false,
    showToolbar: false,
    ignoreThemeChange: false,
    hasUserLocation: false,
   },
}
```

### LxMarkdownTextArea

```js
{ 
  markdown: {
    type: 'string',
    lx: {
      displayType: 'markdown'
      placeholder: 'markdown placeholder',
      rows: 3,
      maxlength: 500,
      disabled: false,
      showColorPicker: false,
      showLinkEditor: true,
      tooltip: null,
      showPlaceholderPicker: false,
      showImagePicker: false,
      showUnderlineToggle: true,
      showHeadingPicker: true,
      imageMaxSize: 3000000,
      dictionary: null,
      labelId: null,
    }
  }
}
```

### LxNumberSlider

```js
{
  numberSlider: {
    type: 'integer',
    lx: {
      displayType: 'numberSlider'
      min: 0,
      max: 9999,
      step: 1,
      stepMultiplier: 5,
      hasInput: false,
      labelId: null,
    }
  }
}
```

### LxPersonDisplay

`type` can be `string`, `object` or `array`
```js
{
  personDisplay: {
    type: 'string',
    lx: {
      displayType: 'personDisplay'
      name: 'Name Surname',
      size: 'm',
      variant: 'full',
      description: 'Admin',
      role: null,
      institution: null,
      icon: null,
      iconSet: null,
      idAttribute: 'id',
      nameAttribute: 'name',
      firstNameAttribute: 'firstName',
      lastNameAttribute: 'lastName',
      descriptionAttribute: 'description',
      roleAttribute: 'role',
      institutionAttribute: 'institution',
      iconAttribute: 'icon',
      iconSetAttribute: 'iconSet',
      maxLength: 3,
    }
  }
}
```

### LxQr 

#### type="string"

schema: 
```js
{
  qr: {
    type: 'string',
    lx: {
      displayType: 'qr'
      size: 's',
      ignoreTheme: false,
    }
  }
}
```

modelValue: 
```js
{
  qr: 'https://github.com/wntrtech/lx-ui',
}
```

#### type="object"

schema: 
```js
{
  qr: {
    type: 'object',
    lx: {
      displayType: 'qr'
    }
  }
}
```

modelValue: 
```js
{
  qr: { 
    value: 'https://github.com/wntrtech/lx-ui', size: 's', ignoreTheme: false 
  }
}
```

### LxQrScanner 

```js
{
  qrScanner: { 
    type: 'object',
    lx: {
      displayType: 'qrScanner'
      hasFileUploader: true,
      kind: 'single',
      cameraSwitcherMode: 'list',
      hasFlashlightToggle: false,
      showAlerts: true,
      labelId: null,
    }
  }
}
```

### LxRatings 
`type` can be `integer` or `number`
```js
{
  ratings: { 
    type: 'integer',
    lx: {
      displayType: 'ratings'
      mode: 'edit',
      variant: 'default',
      disabled: false,
    }
  }
}
```

### LxRichTextDisplay

#### type="string"

schema: 
```js
{
  richTextDisplay: {
    type: 'string',
    lx: {
      displayType: 'richTextDisplay'
      loading: false,
    }
  }
}
```

modelValue: 
```js
{
  richTextDisplay: 'Very very rich text',
}
```

#### type="object"

schema: 
```js
{
  richTextDisplay: {
    type: 'object',
    lx: {
      displayType: 'richTextDisplay'
    }
  }
}
```

modelValue: 
```js
{
  richTextDisplay: { 
    value: 'https://github.com/wntrtech/lx-ui', loading: false 
  }
}
```

### LxStack 

```js
{
  steps: { 
    type: 'object',
    lx: {
      displayType: 'stack'
      orientation: 'vertical',
      kind: 'default',
      mode: 'default',
      horizontalAlignment: 'leading',
      verticalAlignment: 'leading',
      verticalConfig: [],
      horizontalConfig: [],
    }
  }
}
```

### LxStateDisplay

#### type="string"

schema: 
```js
{
  stateDisplay: {
    type: 'string',
    lx: {
      displayType: 'stateDisplay'
      dictionary: [
        {
          value: 'success',
          displayName: 'Finished',
          displayType: 'finished',
          displayShape: 'circle',
        },
      ]
    }
  }
}
```

modelValue: 
```js
{
  stateDisplay: 'success',
}
```

#### type="object"

schema: 
```js
{
  stateDisplay: {
    type: 'object',
    lx: {
      displayType: 'stateDisplay'
    }
  }
}
```

modelValue: 
```js
{
  stateDisplay: { 
    value: 'sucess',
    dictionary: [
      {
        value: 'success',
        displayName: 'Finished',
        displayType: 'finished',
        displayShape: 'circle',
      },
    ]
  }
}
```

### LxSteps 

```js
{
  steps: { 
    type: 'string',
    lx: {
      displayType: 'steps'
      items: [
        {id: 'download', name: 'Download', state: 'complete'},
        {id: 'installation', name: 'Installation', state: 'current'},
      ],
      kind: 'default',
      idAttribute: 'id',
      nameAttribute: 'name',
      descriptionAttribute: 'description',
      stateAttribute: 'state',
      loading: false,
      busy: false,
      disabled: false,
    }
  }
}
```

### LxVisualPicker 

`type='string'` for single selection, or `type='array'` for multiple selection mode

```js
{
  visualPicker: { 
    type: 'string',
    lx: {
      displayType: 'visualPicker'
      kind: 'europe',
      readOnly: false,
      mode: 'default'
      labelId: null,
    }
  }
}
```

### LxDayInput 

`type` can be `integer` or `object`
```js
{
  dayInput: { 
    type: 'integer',
    lx: {
      displayType: 'dayInput'
      disabled: false,
      readOnly: false,
      kind: 'label',
      labelId: null,
    }
  }
}
```

### LxDrawPad 

```js
{
  drawPad: { 
    type: 'string',
    lx: {
      displayType: 'drawPad'
      disabled: false,
      width: '500',
      height: '400',
      instrument: 'brush',
      color: 'black',
      showInstruments: false,
      showColorPicker: false,
      showClearAll: false,
      labelId: null,
    }
  }
}
```

### LxLogoDisplay 

#### type="string"

schema: 
```js
{
  logoDisplay: {
    type: 'string',
    lx: {
      displayType: 'logoDisplay'
      kind: 'default',
      size: 'auto',
    }
  }
}
```

modelValue: 
```js
{
  logoDisplay: 'zzdats',
}
```

#### type="object"

schema: 
```js
{
  logoDisplay: {
    type: 'object',
    lx: {
      displayType: 'logoDisplay'
    }
  }
}
```

modelValue: 
```js
{
  logoDisplay: { 
    value: 'zzdats',
    kind: 'default',
    size: 'auto',
  }
}
```