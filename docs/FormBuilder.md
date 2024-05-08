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
- `order` - Defines the order for LxRows. LxRows that do not have defined order attribute will be places at end in the same order as defined in schema.


### for `type="string"` or `type="integer"` or `type="number"`:

- `mask` - LxTextInput `mask` prop
- `kind` - LxTextInput, LxValuePicker `kind` prop
- `scale` - LXTextInput `scale` prop for `mask="decimal"`
- `uppercase` - LxTextInput `uppercase` prop
- `convertToString` - LxInput `convertToString` prop
- `signed` - LxTextInput `signed` prop form `mask="decimal"`

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
### `type="string"` and (`format="date"` or `format="time"` or `format="date-time"`)
- `minDate` - LxDateTimePicker `minDate` prop
- `maxDate` - LxDateTimePicker `maxDate` prop
- `required` - LxDateTimePicker `required` prop
- `timeAdjust` - LxDateTimePicker `timeAdjust` prop
- `clearIfNotExact` - LxDateTimePicker `clearIfNotExact` prop
- `texts` - LxDateTimePicker `texts` prop
### `type="array"`
- `items` - LxValuePicker `items` prop
- `variant` - LxValuePicker `variant` prop
- `hasSearch` - LxValuePicker `hasSearch` prop
- `alwaysAsArray` - LxValuePicker `alwaysAsArray` prop
- `nullable` - LxValuePicker `nullable` prop
- `texts` - LxValuePicker `texts` prop
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
### `type="boolean"`
- `size` - LxToggle `size` prop
- `labelOn` - LxToggle on slot text
- `labelOff` - LxToggle off slot text
- `labelIndeterminate` - LxToggle indeterminate slot text
### `type="object"`
 - `icon` - LxDataBlock `icon` prop
 - `nameAttribute` - LxDataBlock `name` prop
 - `columnCount` - LxForm `columnCount` prop
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

```javascript

const schema = {
  type: 'object',
  required: ['firstName', 'isActive'],
  properties: {
    firstName: {
      title: 'Vārds',
      description: 'Personas vārds',
      type: 'string',
      maxLength: 15,
      readOnly: null,
      lx: {
        mask: 'default',
        columnSpan: 2,
      },
    },
    lastName: {
      title: 'Uzvārds',
      description: 'Personas uzvārds',
      type: 'string',
      maxLength: 15,
    },
    isActive: {
      title: 'Aktīvs',
      type: 'boolean',
      lx: {
        labelOn: 'True',
        labelOff: 'False',
      },
    },
    description: {
      title: 'Apraksts',
      type: 'string',
      lx: {
        kind: 'multiline',
        rows: 5,
      },
    },
    favoriteGame: {
      title: 'Mīļākā spēle',
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
      title: 'Spēles, kas nepatīk',
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
      title: 'Dzimšanas datums',
      type: 'string',
      format: 'date',
    },
    developers: {
      title: 'Mīļākie spēlu izstrādātāji',
      type: 'array',
      items: {
        properties: {
          name: {
            type: 'string',
            title: 'Nosaukumus',
          },
          comment: {
            type: 'string',
            title: 'Komentārs',
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
      title: 'Datora specifikācija',
      type: 'object',
      properties: {
        type: {
          type: 'string',
          title: 'Tips',
          lx: {
            items: [
              { id: 'desktop', name: 'Stacionārais dators' },
              { id: 'laptop', name: 'Portatīvais dators' },
            ],
            variant: 'dropdown',
          },
        },
        cpu: {
          type: 'string',
          title: 'Procesors',
        },
        gpu: {
          type: 'string',
          title: 'Video karte',
        },
        psu: {
          type: 'string',
          title: 'Barošanas bloks',
        },
        memory: {
          type: 'number',
          title: 'Atmiņa (GB)',
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
      title: 'Spēlētāja profils',
      properties: {
        nickname: {
          type: 'string',
          title: 'Segvārds',
        },
        level: {
          type: 'integer',
          title: 'Līmenis',
        },
      },
      lx: {
        displayType: 'modal',
        primaryAttribute: 'nickname',
        secondaryAttribute: 'level',
      },
    },
    drivingGames: {
      title: 'Mīļākās braukšanas spēles',
      type: 'array',
      items: {
        properties: {
          id: {
            type: 'string',
            title: 'Identifikators',
          },
          name: {
            type: 'string',
            title: 'Nosaukums',
          },
        },
      },
      lx: {
        displayType: 'list',
        listType: '1',
      },
    },
    mobaGames: {
      title: 'Mīļākās MOBA spēles',
      type: 'array',
      items: {
        properties: {
          id: {
            type: 'string',
            title: 'Identifikators',
          },
          name: {
            type: 'string',
            title: 'Nosaukums',
          },
        },
      },
      lx: {
        displayType: 'listModal',
        listType: '2',
      },
    },
    fpsGames: {
      title: 'Mīļākās šaušanas spēles',
      type: 'array',
      items: {
        properties: {
          id: {
            type: 'string',
            title: 'Identifikators',
          },
          name: {
            type: 'string',
            title: 'Nosaukums',
          },
          playerCount: {
            title: 'Spēlētāju skaits',
            type: 'number',
          },
        },
      },
      lx: {
        displayType: 'table',
      },
    },
    sportsGames: {
      title: 'Mīļākās sporta spēles',
      type: 'array',
      items: {
        properties: {
          id: {
            type: 'string',
            title: 'Identifikators',
          },
          name: {
            type: 'string',
            title: 'Nosaukums',
          },
          multiplayer: {
            type: 'boolean',
            title: 'Daudzspēlētāju spēle',
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
  - LxRow label is "Vārds"
  - LxRow has info slot with content "Personas vārds"
  - This row is required
  - LxTextInput component is generated in this row
  - LxTextInput has character limit of 15, readOnly set to false, default mask
2. **lastName**
  - LxRow occupies 1 LxForm column (default)
  - LxRow label is "Uzvārds"
  - LxRow has info slot with content "Personas uzvārds"
  - LxTextInput component is generated in this row
  - LxTextInput has character limit of 15, default mask
3. **isActive**
  - LxRow occupies 1 LxForm column (default)
  - LxRow label is "Aktīvs"
  - LxRow has no info slot
  - This row is required
  - LxToggle component is generated in this row
  - LxToggle has "True" inserted into on slot
  - LxToggle has "False" inserted into off slot
4. **description**
  - LxRow occupies 2 LxForm columns
  - LxRow label is "Apraksts"
  - LxRow has no info slot
  - LxTextArea component is generated in this row
  - LxTextArea has height of 5 lines
5. **favoriteGame**
  - LxRow occupies 1 LxForm column (default)
  - LxRow label is "Mīļākā spēle"
  - LxRow has no info slot
  - LxValuePicker component with `kind="single"` is generated in this row
  - LxValuePicker has 4 items and variant set to "dropdown"
  - LxValuePicker has search
6. **dislikedGames**
  - LxRow occupies 1 LxForm column (default)
  - LxRow label is "Spēles, kas nepatīk"
  - LxRow has no info slot
  - LxValuePicker component with `kind="multiple"` is generated in this row
  - LxValuePicker has 4 items and variant set to "default"
7. **birthDate**
  - LxRow occupies 1 LxForm column (default)
  - LxRow label is "Dzimšanas datums"
  - LxDateTimePicker component with `kind="date"` is generated in this row
8. **developers**
  - LxRow occupies 1 LxForm column (default)
  - LxRow label is "Mīļākie spēlu izstrādātāji"
  - LxAppendableList component is generated in this row
9. **placeholder**
  - LxPlaceholder component is generated in this row
  - LxPlaceholder occupies 1 LxForm column (default)
10. **computer**
  - LxRow occupies 1 LxForm column (default)
  - LxRow label is "Datora specifikācija"
  - LxDataBlock component is generated in this row if model value is not defined or null
11. **profile**
  - LxRow occupies 1 LxForm column (default)
  - LxRow label is "Spēlētāja profils"
  - LxListItem component is generated in this row if model value is not defined or null
  - LxButton component that allows to create object is generated in this row if model value is null or undefined
12. **drivingGames**
  - LxRow occupies 1 LxForm column (default)
  - LxRow label is "Mīļākās braukšanas spēles"
  - LxList component is generated in this row
13. **mobaGames**
  - LxRow occupies 1 LxForm column (default)
  - LxRow label is "Mīļākās MOBA spēles"
  - LxList component is generated in this row
  - Every item is openable and editable in modal dialog
14. **fpsGames**
  - LxRow occupies 1 LxForm column (default)
  - LxRow label is "Mīļākās šaušanas spēles"
  - LxDataGrid component is generated in this row
15. **sportsGames**
- LxRow occupies 1 LxForm column (default)
- LxRow label is "Mīļākās sporta spēles"
- LxDataGrid component is generated in this row
- Every item is openable and editable in modal dialog