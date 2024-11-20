# Design Tokens

LX uses some custom properties (variables) to promote and improve consistency, adaptability and maintainability. These variables have been divided into two major groups:
1. **Layout variables**
     - Layout variables pertain to component structure, including margins, paddings, widths, heights, font sizes, grid areas, among others.
2. **Color variables**
    - Color variables pertain to the colors used in components, including background, text, icon, and border colors, as well as colors for different interaction states (hover, active, etc.).

## LxList

### Layout

| Variable name                                  | Default value                                                 |
|------------------------------------------------|---------------------------------------------------------------|
| `--list-button-border-radius`                  | 0                                                             |
| `--list-button-height`                         | calc(var(--row-size) - 3px)                                   |
| `--list-button-width`                          | calc(var(--row-size) - 3px)                                   |
| `--list-category-border-radius`                | 0                                                             |
| `--list-category-margin`                       | 0.25rem                                                       |
| `--list-category-width`                        | 0.25rem                                                       |
| `--list-draggable-inner-column-span`           | 1 / span 4                                                    |
| `--list-draggable-grid-areas`                  | 'handle category content invalid-icon icon loader actions'    |
| `--list-draggable-grid-template-columns`       | auto auto 1fr auto auto auto auto                             |
| `--list-draggable-outer-column-span`           | 2 / span 6                                                    |
| `--list-expander-width`                        | `--row-size`                                                  |
| `--list-gap`                                   | 0.5rem                                                        |
| `--list-handle-icon-height`                    | `--icon-size`                                                 |
| `--list-handle-icon-width`                     | `--icon-size`                                                 |
| `--list-handle-width`                          | `--row-size`                                                  |
| `--list-header-border-radius`                  | `--list-item-border-radius`                                   |
| `--list-header-padding`                        | 0.35rem 0.35rem 0.2rem 0.5rem                                 |
| `--list-header-min-height`                     | 2.75rem                                                       |
| `--list-icon-height`                           | 1.5rem                                                        |
| `--list-icon-padding`                          | 0.65rem 0.75rem 0 0.75rem                                     |
| `--list-icon-width`                            | 1.5rem                                                        |
| `--list-inner-column-span`                     | 1 / span 4                                                    |
| `--list-item-border`                           | 2px solid var(--color-list-item-border)                       |
| `--list-item-border-radius`                    | 0                                                             |
| `--list-item-min-height`                       | `--row-size`                                                  |
| `--list-grid-areas`                            | 'category content invalid-icon icon loader actions selecting' |
| `--list-grid-template-columns`                 | auto 1fr auto auto auto auto auto                             |
| `--list-outer-column-span`                     | 1 / span 6                                                    |
| `--list-primary-font-size`                     | `--font-size`                                                 |
| `--list-primary-font-weight`                   | bold                                                          |
| `--list-primary-line-height`                   | 1.2em                                                         |
| `--list-primary-margin`                        | -0.1rem 0 0 0                                                 |
| `--list-primary-padding`                       | 0.1rem 0 0.1rem 0                                             |
| `--list-secondary-font-size`                   | `--small-font-size`                                           |
| `--list-secondary-font-weight`                 | `--description-font-weight`                                   |
| `--list-secondary-line-height`                 | 1.2em                                                         |
| `--list-secondary-margin`                      | -0.15rem 0 -0.05rem 0                                         |
| `--list-secondary-padding`                     | 0.1rem 0 0.05rem 0                                            |
| `--list-selecting-block-padding`               | 0.85rem 0.95rem 0 0.95rem                                     |
| `--list-toolbar-gap`                           | `--gap-buttons`                                               |
| `--list-treelist-child-left-indent`            | `--row-size`                                                  |
| `--list-treelist-child-right-indent`           | 0                                                             |
| `--list-treelist-grid-areas`                   | 'expander treelist-content'                                   |
| `--list-treelist-grid-template-columns`        | auto 1fr                                                      |
| `--list-treelist-left-indent`                  | 3rem                                                          |
| `--list-treelist-right-indent`                 | 0                                                             |

### Color


| Variable name                                | Light mode value                          | Dark mode value                           |
|----------------------------------------------|-------------------------------------------|-------------------------------------------|
| `--color-list-checked-background`            | `--color-data`                            | `--color-data`                            |
| `--color-list-checked-border`                | `--color-list-checked-background`         | `--color-list-checked-background`         |
| `--color-list-checkmark`                     | `--color-region`                          | `--color-region`                          |
| `--color-list-background`                    | `--color-region`                          | `--color-region`                          |
| `--color-list-expander-selected-icon`        | `--color-data`                            | `--color-data`                            |
| `--color-list-foreground-disabled`           | `--color-disabled`                        | `--color-disabled`                        |
| `--color-list-foreground-hover`              | `--color-region-hover-foreground`         | `--color-region-hover-foreground`         |
| `--color-list-group-expander-checkbox`       | `--color-list-checked-border`             | `--color-list-checked-border`             |
| `--color-list-handle-background-hover`       | `--color-list-hover-background`           | `--color-list-hover-background`           |
| `--color-list-handle-icon`                   | `--color-label`                           | `--color-label`                           |
| `--color-list-handle-icon-hover`             | `--color-list-foreground-hover`           | `--color-list-foreground-hover`           |
| `--color-list-hover-background`              | `--color-region-hover-background`         | `--color-region-hover-background`         |
| `--color-list-hover-border`                  | transparent                               | transparent                               |
| `--color-list-icon`                          | `--color-data`                            | `--color-data`                            |
| `--color-list-icon-selected`                 | `--color-data`                            | `--color-data`                            |
| `--color-list-interactive-background`        | `--color-interactive-hover-background`    | `--color-interactive-hover-background`    |
| `--color-list-interactive-foreground`        | `--color-focus-foreground`                | `--color-focus-foreground`                |
| `--color-list-item-border`                   | `transparent`                             | `transparent`                             |
| `--color-list-primary`                       | `--color-data`                            | `--color-data`                            |
| `--color-list-primary-text-hover`            | `--color-list-foreground-hover`           | `--color-list-foreground-hover`           |
| `--color-list-primary-text-selected`         | `--color-list-primary`                    | `--color-list-primary`                    |
| `--color-list-region-background`             | `--color-region-2`                        | `--color-region-2`                        |
| `--color-list-region-selected-background`    | `--color-list-region-background`          | `--color-list-region-background`          |
| `--color-list-secondary`                     | `--color-label`                           | `--color-label`                           |
| `--color-list-secondary-text-hover`          | `--color-secondary`                       | `--color-list-secondary`                  |
| `--color-list-secondary-text-selected`       | `--color-secondary`                       | `--color-list-secondary`                  |
| `--color-list-selected-background`           | `--color-list-background`                 | `--color-list-background`                 |
| `--color-list-selected-foreground-disabled`  | `--color-disabled`                        | `--color-disabled`                        |
| `--color-list-selected-border`               | `--color-brand`                           | `--color-brand`                           |
| `--color-list-selected-border-hover`         | `--color-interactive-hover-background`    | `--color-interactive-hover-background`    |
| `--color-list-unchecked-background`          | transparent                               | transparent                               |
| `--color-list-unchecked-background-hover`    | `--color-list-unchecked-background`       | `--color-list-unchecked-background`       |
| `--color-list-unchecked-border`              | `--color-data`                            | `--color-data`                            |
| `--color-list-unchecked-border-hover`        | `--color-list-unchecked-border`           | `--color-list-unchecked-border`           |

<br>
Customized values for contrast mode:

| Variable name                                | Contrast mode value                       |
|----------------------------------------------|-------------------------------------------|
| `--color-list-category-contrast`             | transparent                               |
| `--color-list-checked-background`            | `--contrast-background`                   |
| `--color-list-checked-border`                | `--color-list-checked-background`         |
| `--color-list-checkmark`                     | `--contrast-interactive`                  |
| `--color-list-expander-selected-icon`        | `--contrast-background`                   |
| `--color-list-hover-border`                  | `--contrast-foreground`                   |
| `--color-list-icon-selected`                 | `--contrast-background`                   |
| `--color-list-interactive-background`        | `--contrast-hover`                        |
| `--color-list-item-border`                   | `--color-chrome`                          |
| `--color-list-primary-text-selected`         | `--contrast-background`                   |
| `--color-list-region-selected-background`    | `--contrast-foreground`                   |
| `--color-list-secondary-text-hover`          | `--color-list-foreground-hover`           |
| `--color-list-secondary-text-selected`       | `--contrast-background`                   |
| `--color-list-selected-background`           | `--contrast-foreground`                   |
| `--color-list-selected-border-hover`         | `--contrast-foreground`                   |
| `--color-list-selected-foreground-disabled`  | `--color-background`                      |
| `--color-list-unchecked-background-hover`    | `--contrast-background`                   |
| `--color-list-unchecked-border-hover`        | `--contrast-background`                   |

## Inputs 

Some input components are both visually and functionally similar. This includes:
- LxTextInput 
- LxAutoComplete 
- LxDropDown
- LxValuePicker `variant='dropdown'`
- LxRotator
- LxDayInput 
- LxDateTimePicker 
- LxDateTimeRange 
- LxTextArea 
- LxMarkdownTextArea
- LxDrawPad

### Layout

| Variable name                          | Default value                                 |
|----------------------------------------|-----------------------------------------------|
| `--input-border`                       | 2px solid transparent                         |
| `--input-border-bottom`                | 1px solid var(--color-input-border-bottom)    |
| `--input-border-radius`                | 0                                             |
| `--input-button-border-radius`         | 0                                             |
| `--input-button-height`                | 2.5rem                                        |
| `--input-button-left-indent`           | 0rem                                          |
| `--input-button-right-indent`          | `--input-icon-wrapper-width`                  |
| `--input-button-width`                 | 2.5rem                                        |
| `--input-date-time-width`              | 14rem                                         |
| `--input-date-width`                   | 10.5rem                                       |
| `--input-font-size`                    | `--font-size`                                 |
| `--input-font-weight`                  | 400                                           |
| `--input-grid-areas`                   | 'tag input invalid-icon icon button'          |
| `--input-grid-template-columns`        | auto 1fr auto auto auto                       |
| `--input-height`                       | 2.5rem                                        |
| `--input-icon-height`                  | 1.25rem                                       |
| `--input-icon-left-indent`             | 0rem                                          |
| `--input-icon-right-indent`            | `--input-icon-wrapper-width`                  |
| `--input-icon-width`                   | 1.25rem                                       |
| `--input-icon-wrapper-height`          | 100%                                          |
| `--input-icon-wrapper-width`           | `--input-button-width`                        |
| `--input-invalid-icon-height`          | 1.15rem                                       |
| `--input-invalid-icon-width`           | 1.15rem                                       |
| `--input-invalid-left-indent`          | 0rem                                          |
| `--input-invalid-right-indent`         | `--input-icon-wrapper-width`                  |
| `--input-left-padding`                 | 1rem                                          |
| `--input-right-padding`                | 1rem                                          |
| `--input-rotator-font-weight`          | `--data-weight`                               |
| `--input-rotator-icon-height`          | 1.5rem                                        |
| `--input-rotator-icon-width`           | auto                                          |
| `--input-tag-height`                   | 1.5rem                                        |
| `--input-tag-left-indent`              | calc(var(--input-tag-width) + 1rem)           |
| `--input-tag-margin`                   | 0 0.5rem                                      |
| `--input-tag-right-indent`             | 0rem                                          |
| `--input-tag-width`                    | 2.75rem                                       |
| `--input-text-area-justify`            | left                                          |
| `--input-text-area-min-height`         | 6rem                                          |
| `--input-text-area-vertical-padding`   | 1rem                                          |
| `--input-time-width`                   | `--input-date-width`                          |
| `--input-width`                        | auto                                          |

### Color


| Variable name                                | Light mode value                        | Dark mode value                          |
|----------------------------------------------|-----------------------------------------|------------------------------------------|
| `--color-input`                              | `--color-data`                          | `--color-data`                           |
| `--color-input-background`                   | `--color-region`                        | `--color-region`                         |
| `--color-input-border-bottom`                | `--color-label`                         | `--color-label`                          |
| `--color-input-date-time-icon`               | `--color-data`                          | `--color-data`                           |
| `--color-input-disabled`                     | `--color-disabled-foreground`           | `--color-disabled-foreground`            |
| `--color-input-disabled-background`          | transparent                             | transparent                              |
| `--color-input-disabled-border`              | `--color-input-disabled-background`     | `--color-input-disabled-background`      |
| `--color-input-disabled-border-bottom`       | `--color-input-disabled`                | `--color-input-disabled`                 |
| `--color-input-icon`                         | `--color-label`                         | `--color-label`                          |
| `--color-input-icon-disabled`                | `--color-disabled-foreground`           | `--color-disabled-foreground`            |
| `--color-input-region-background`            | `--color-region-2`                      | `--color-region-2`                       |
| `--color-input-rotator-icon`                 | `--color-data`                          | `--color-data`                           |
| `--color-input-text-length`                  | `--color-label`                         | `--color-label`                          |


<br>
Customized values for contrast mode:

| Variable name                                | Contrast mode value                       |
|----------------------------------------------|-------------------------------------------|
| `--color-input-disabled`                     | `--contrast-foreground`                   |
| `--color-input-disabled-border`              | `--contrast-foreground`                   |
| `--color-input-outline`                      | `--contrast-foreground`                   |
| `--color-input-selected-range-background`    | `--contrast-hover`                        |