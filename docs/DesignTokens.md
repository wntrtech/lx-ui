# Design Tokens

LX uses some custom properties (variables) to promote and improve consistency, adaptability and maintainability. These variables have been divided into two major groups:
1. **Layout variables**
     - Layout variables pertain to component structure, including margins, paddings, widths, heights, font sizes, grid areas, among others.
2. **Color variables**
    - Color variables pertain to the colors used in components, including background, text, icon, and border colors, as well as colors for different interaction states (hover, active, etc.).

## LxList

### Layout

| Variable name                             | Default value                                                 |
|-------------------------------------------|---------------------------------------------------------------|
| `--list-button-border-radius`             | 0                                                             |
| `--list-button-max-height`                | `--row-size`                                                  |
| `--list-button-width`                     | `--row-size`                                                  |
| `--list-category-border-radius`           | 0                                                             |
| `--list-category-margin`                  | 0.25rem                                                       |
| `--list-category-width`                   | 0.25rem                                                       |
| `--list-item-border`                      | 2px solid transparent                                         |
| `--list-item-border-radius`               | 0                                                             |
| `--list-item-border-radius-inner`         | `--list-item-border-radius`                                   |
| `--list-item-gap`                         | 0.5rem                                                        |
| `--list-item-header-padding`              | 0.35rem 0.35rem 0.2rem 0.5rem                                 |
| `--list-item-header-min-height`           | 2.75rem                                                       |
| `--list-icon-height`                      | 1.5rem                                                        |
| `--list-icon-padding`                     | 0.6rem 0.75rem 0 0.75rem                                      |
| `--list-icon-width`                       | 1.5rem                                                        |
| `--list-item-loader-padding`              | 0.85rem 1rem 0 1rem                                           |
| `--list-item-selecting-block-padding`     | 0.8rem 0.95rem 0 0.95rem                                      |
| `--list-item-width`                       | auto                                                          |
| `--list-item-min-height`                  | `--row-size`                                                  |
| `--list-grid-areas`                       | 'category content invalid-icon icon loader actions selecting' |
| `--list-grid-template-columns`            | auto 1fr auto auto auto auto auto                             |
| `--list-grid-inner-column-span`           | 1 / span 4                                                    |
| `--list-grid-outer-column-span`           | 1 / span 6                                                    |
| `--list-text-primary-font-size`           | `--font-size`                                                 |
| `--list-text-primary-font-weight`         | bold                                                          |
| `--list-text-primary-line-height`         | 1.2em                                                         |
| `--list-text-primary-margin`              | -0.1rem 0 0 0                                                 |
| `--list-text-primary-padding`             | 0.1rem 0 0.1rem 0                                             |
| `--list-text-secondary-font-size`         | `--small-font-size`                                           |
| `--list-text-secondary-font-weight`       | `--description-font-weight`                                   |
| `--list-text-secondary-line-height`       | 1.2em                                                         |
| `--list-text-secondary-margin`            | -0.15rem 0 -0.05rem 0                                         |
| `--list-text-secondary-padding`           | 0.1rem 0 0.05rem 0                                            |
| `--list-draggable-grid-inner-column-span` | 1 / span 3                                                    |
| `--list-draggable-grid-areas`             | 'handle category content icon actions'                        |
| `--list-draggable-grid-template-columns`  | auto auto 1fr auto auto                                       |
| `--list-draggable-grid-outer-column-span` | 2 / span 4                                                    |
| `--list-draggable-handle-icon-height`     | `--icon-size`                                                 |
| `--list-draggable-handle-icon-width`      | `--icon-size`                                                 |
| `--list-draggable-handle-width`           | `--row-size`                                                  |
| `--list-treelist-expander-height`         | `--row-height`                                                |
| `--list-treelist-expander-width`          | `--row-size`                                                  |
| `--list-treelist-grid-areas`              | 'expander treelist-content'                                   |
| `--list-treelist-grid-template-columns`   | auto 1fr                                                      |
| `--list-treelist-indent-left`             | `--row-size`                                                  |
| `--list-treelist-indent-right`            | 0                                                             |
| `--list-treelist-indent-child-left`       | `--row-size`                                                  |
| `--list-treelist-indent-child-right`      | 0                                                             |


### Color

| Variable name                                | Light mode value                          | Dark mode value                           |
|----------------------------------------------|-------------------------------------------|-------------------------------------------|
| `--color-list-background`                    | `--color-region`                          | `--color-region`                          |
| `--color-list-disabled-foreground`           | `--color-disabled`                        | `--color-disabled`                        |
| `--color-list-handle-icon`                   | `--color-label`                           | `--color-label`                           |
| `--color-list-hover-handle-icon`             | `--color-region-hover-foreground`         | `--color-region-hover-foreground`         |
| `--color-list-hover-background`              | `--color-region-hover-background`         | `--color-region-hover-background`         |
| `--color-list-icon`                          | `--color-data`                            | `--color-data`                            |
| `--color-list-primary`                       | `--color-data`                            | `--color-data`                            |
| `--color-list-hover-text-primary`            | `--color-region-hover-foreground`         | `--color-region-hover-foreground`         |
| `--color-list-region-background`             | `--color-region-2`                        | `--color-region-2`                        |
| `--color-list-secondary`                     | `--color-label`                           | `--color-label`                           |
| `--color-list-hover-text-secondary`          | `--color-region-hover-foreground`         | `--color-region-hover-foreground`         |

<br>
Customized values for contrast mode:

| Variable name                                | Contrast mode value                       |
|----------------------------------------------|-------------------------------------------|
| `--color-list-category-contrast`             | transparent                               |
| `--color-list-disabled-selected-text`        | `--contrast-background`                   |


## LxTile

It is worth noting that most LxTile tokens use LxList tokens as default values, so any changes to token values should be made with caution to avoid unintended effects.

### Layout

| Variable name                       | Default value                            |
|-------------------------------------|------------------------------------------|
| `--tile-width`                      | 20rem                                    |
| `--tile-width-x2-size`              | calc(var(--tile-width) * 2 + 1rem)       |
| `--tile-min-height`                 | 12rem                                    |
| `--tile-mini-min-height`            | 3rem                                     |
| `--tile-mini-grid-areas`            | 'icon-loader content'                    |
| `--tile-mini-grid-template-columns` | auto 1fr                                 |
| `--tile-mini-grid-template-rows`    | 1fr                                      |
| `--tile-header-min-height`          | `--list-item-header-min-height`          |
| `--tile-mini-header-min-height`     | 2.25rem                                  |
| `--tile-grid-areas`                 | 'icon-loader' 'content' 'custom-content' |
| `--tile-grid-template-columns`      | 1fr                                      |
| `--tile-grid-template-rows`         | auto 1fr auto                            |
| `--tile-border`                     | `--list-item-border`                     |
| `--tile-border-radius`              | `--list-item-border-radius`              |
| `--tile-border-radius-inner`        | `--tile-border-radius`                   |
| `--tile-icon-padding`               | 0                                        |
| `--tile-mini-icon-padding`          | `--tile-icon-padding`                    |
| `--tile-icon-height`                | `--icon-size`                            |
| `--tile-icon-width`                 | `--icon-size`                            |
| `--tile-loader-padding`             | 0.4rem 0rem 0.35rem 0rem                 |
| `--tile-mini-loader-padding`        | 0 0.75rem 0 0                            |
| `--tile-header-padding`             | 0                                        |
| `--tile-padding`                    | 1rem                                     |
| `--tile-text-primary-font-size`     | `--list-text-primary-font-size`          |
| `--tile-text-primary-line-height`   | `--list-text-primary-line-height`        |
| `--tile-text-primary-font-weight`   | `--list-text-primary-font-weight`        |
| `--tile-text-primary-padding`       | 0                                        |
| `--tile-text-primary-margin`        | 1.45rem 0 0 0                            |
| `--tile-text-secondary-font-size`   | `--list-text-secondary-font-size`        |
| `--tile-text-secondary-line-height` | `--list-text-secondary-line-height`      |
| `--tile-text-secondary-font-weight` | `--list-text-secondary-font-weight`      |
| `--tile-text-secondary-padding`     | 0                                        |
| `--tile-text-secondary-margin`      | 1.2rem 0 0 0                             |


### Color

| Variable name                       | Light mode value                    | Dark mode value                     |
|-------------------------------------|-------------------------------------|-------------------------------------|
| `--color-tile-background`           | `--color-list-background`           | `--color-list-background`           |
| `--color-tile-disabled-foreground`  | `--color-list-disabled-foreground`  | `--color-list-disabled-foreground`  |
| `--color-tile-hover-background`     | `--color-list-hover-background`     | `--color-list-hover-background`     |
| `--color-tile-icon`                 | `--color-list-icon`                 | `--color-list-icon`                 |
| `--color-tile-icon-hover`           | `--color-list-icon-hover`           | `--color-list-icon-hover`           |
| `--color-tile-primary`              | `--color-tile-primary`              | `--color-tile-primary`              |
| `--color-tile-secondary`            | `--color-list-secondary`            | `--color-list-secondary`            |
| `--color-tile-hover-text-primary`   | `--color-list-hover-text-primary`   | `--color-list-hover-text-primary`   |
| `--color-tile-hover-text-secondary` | `--color-list-hover-text-secondary` | `--color-list-hover-text-secondary` |


<br>
Customized value for contrast mode:

| Variable name                       | Contrast mode value     |
|-------------------------------------|-------------------------|
| `--color-tile-hover-text-secondary` | `--contrast-background` |


## LxDataBlock

It is worth noting that some LxDataBlock tokens use LxList tokens as default values, so any changes to token values should be made with caution to avoid unintended effects.

### Layout

| Variable name                               | Default value                                          |
|---------------------------------------------|--------------------------------------------------------|
| `--data-block-border`                       | `--list-item-border`                                   |
| `--data-block-button-max-height-m`          | `--row-size`                                           |
| `--data-block-button-max-height-l`          | 4rem                                                   |
| `--data-block-button-width-m`               | `--row-size`                                           |
| `--data-block-button-width-l`               | 4rem                                                   |
| `--data-block-chevron-height`               | 1rem                                                   |
| `--data-block-chevron-width`                | 1rem                                                   |
| `--data-block-chevron-wrapper-max-height-m` | `--row-size`                                           |
| `--data-block-chevron-wrapper-max-height-l` | 4rem                                                   |
| `--data-block-chevron-wrapper-width-m`      | `--row-size`                                           |
| `--data-block-chevron-wrapper-width-l`      | 4rem                                                   |
| `--data-block-content-padding-m`            | 1rem                                                   |
| `--data-block-content-padding-l`            | 2rem                                                   |
| `--data-block-grid-areas`                   | 'icon-loader-selecting content chevron-invalid button' |
| `--data-block-grid-template-columns`        | auto 1fr auto auto                                     |
| `--data-block-height-m`                     | `--list-item-min-height`                               |
| `--data-block-height-l`                     | 4rem                                                   |
| `--data-block-icon-height`                  | 2rem                                                   |
| `--data-block-icon-width`                   | 2rem                                                   |
| `--data-block-icon-wrapper-max-height-m`    | `--row-size`                                           |
| `--data-block-icon-wrapper-max-height-l`    | 4rem                                                   |
| `--data-block-icon-wrapper-width-m`         | `--row-size`                                           |
| `--data-block-icon-wrapper-width-l`         | 4rem                                                   |
| `--data-block-invalid-icon-height`          | 1rem                                                   |
| `--data-block-invalid-icon-width`           | 1rem                                                   |
| `--data-block-left-indent-m`                | 1rem                                                   |
| `--data-block-left-indent-l`                | 2rem                                                   |
| `--data-block-right-indent-m`               | 1rem                                                   |
| `--data-block-right-indent-l`               | 2rem                                                   |
| `--data-block-text-primary-font-size`       | `--list-text-primary-font-size`                        |
| `--data-block-text-primary-font-weight`     | `--list-text-primary-font-weight`                      |
| `--data-block-text-primary-line-height`     | `--list-text-primary-line-height`                      |
| `--data-block-text-primary-margin`          | 0                                                      |
| `--data-block-text-primary-padding`         | 0.25rem 0                                              |
| `--data-block-text-secondary-font-size`     | `--list-text-secondary-font-size`                      |
| `--data-block-text-secondary-font-weight`   | `--list-text-secondary-font-weight`                    |
| `--data-block-text-secondary-line-height`   | `--list-text-secondary-line-height`                    |
| `--data-block-text-secondary-margin`        | -0.125rem 0                                            |
| `--data-block-text-secondary-padding`       | 0 0 0.25rem 0                                          |


### Color

| Variable name                            | Light mode value                  | Dark mode value                   |
|------------------------------------------|-----------------------------------|-----------------------------------|
| `--color-data-block-primary`             | `--color-data`                    | `--color-data`                    |
| `--color-data-block-secondary`           | `--color-label`                   | `--color-label`                   |
| `--color-data-block-background`          | `--color-region`                  | `--color-region`                  |
| `--color-data-block-region-background`   | `--color-region-2`                | `--color-region-2`                |
| `--color-data-block-hover-background`    | `--color-region-hover`            | `--color-region-hover`            |
| `--color-data-block-hover-foreground`    | `--color-region-hover-foreground` | `--color-region-hover-foreground` |
| `--color-data-block-icon`                | `--color-label`                   | `--color-label`                   |
| `--color-data-block-button-icon`         | `--color-data`                    | `--color-data`                    |
| `--color-data-block-chevron`             | `--color-data`                    | `--color-data`                    |
| `--color-data-block-disabled-foreground` | `--color-disabled-foreground`     | `--color-disabled-foreground`     |


## LxAppendableList

### Layout

| Variable name                                  | Default value                                       |
|------------------------------------------------|-----------------------------------------------------|
| `--appendable-list-button-padding`             | 0.25rem                                             |
| `--appendable-list-padding`                    | 1rem calc(var(--row-size) + 0.5rem) 1rem 1rem       |
| `--appendable-list-padding-compact`            | 0.5rem calc(var(--row-size) + 0.5rem) 0.5rem 0.5rem |
| `--appendable-list-padding-expandable`         | 1rem                                                |
| `--appendable-list-padding-expandable-compact` | 0.5rem                                              |


## LxCard

### Layout

| Variable name          | Default value                                 |
|------------------------|-----------------------------------------------|
| `--card-min-height`    | 12rem                                         |
| `--card-border`        | 2px solid var(--color-card-background)        |
| `--card-border-region` | 2px solid var(--color-card-background-region) |
| `--card-border-radius` | 0                                             |
| `--card-padding`       | 1rem                                          |
| `--card-width`         | auto                                          |


### Color

| Variable name                   | Light mode value                  | Dark mode value                   |
|---------------------------------|-----------------------------------|-----------------------------------|
| `--color-card-foreground`       | `--color-data`                    | `--color-data`                    |
| `--color-card-background`       | `--color-region`                  | `--color-region`                  |
| `--color-card-hover-background` | `--color-region-hover-background` | `--color-region-hover-background` |
| `--color-card-hover-foreground` | `--color-region-hover-foreground` | `--color-region-hover-foreground` |


## LxBadge

### Layout

| Variable name                       | Default value                            |
|-------------------------------------|------------------------------------------|
| `--badge-line-height`               | 1rem                                     |
| `--badge-border-radius`             | 1rem                                     |
| `--badge-padding`                   | 0.25rem 0.375rem                         |
| `--badge-min-width`                 | 1.5rem                                   |
| `--badge-min-height`                | 1.5rem                                   |
| `--badge-gap`                       | 0.25rem                                  |
| `--badge-icon-width`                | 1rem                                     |


### Color

| Variable name                       | Light mode value                    | Dark mode value                     |
|-------------------------------------|-------------------------------------|-------------------------------------|
| `--color-badge-background`          | `--color-region`                    | `--color-region`                    |
| `--color-badge-region-background`   | `--color-region-2`                  | `--color-region-2`                  |
| `--color-badge-text-color`          | `--color-data`                      | `--color-data`                      |


## LxToggle

### Layout

| Variable name                           | Default value                           |
|-----------------------------------------|-----------------------------------------|
| `--toggle-border`                       | 1px solid transparent                   |
| `--toggle-border-invalid`               | 2px solid transparent                   |
| `--toggle-width`                        | 3rem                                    |
| `--toggle-height`                       | 1.5rem                                  |
| `--toggle-thumb-width`                  | 1rem                                    |
| `--toggle-thumb-height`                 | 1rem                                    |
| `--toggle-thumb-border-radius`          | 50%                                     |
| `--toggle-s-width`                      | 2rem                                    |
| `--toggle-s-height`                     | 1rem                                    |
| `--toggle-s-thumb-width`                | 0.625rem                                |
| `--toggle-s-thumb-height`               | 0.625rem                                |
| `--toggle-border-radius`                | 0.75rem                                 |
| `--toggle-padding-left-false`           | 0.165rem                                |
| `--toggle-padding-left-true`            | 1.7rem                                  |
| `--toggle-indeterminate-padding-left`   | 0.935rem                                |
| `--toggle-indeterminate-padding-right`  | 0.935rem                                |
| `--toggle-s-indeterminate-padding-left` | 0.625rem                                |
| `--toggle-s-indeterminate-padding-right`| 0.625rem                                |
| `--toggle-s-padding-left-true`          | 1.075rem                                |
| `--toggle-padding-right`                | 0.165rem                                |
| `--toggle-label-readonly-margin`        | 0.4rem 0                                |
| `--toggle-text-margin-left`             | 0.5rem                                  |
| `--toggle-checked-icon-position-left`   | 0.185rem                                |
| `--toggle-checked-icon-width`           | 1.5rem                                  |
| `--toggle-checked-icon-height`          | 1.5rem                                  |


### Color

| Variable name                       | Light mode value                        | Dark mode value                         |
|-------------------------------------|-----------------------------------------|-----------------------------------------|
| `--color-toggle-border-true`        | `--color-interactive-background`        | `--color-interactive-background`        |
| `--color-toggle-background-true`    | `--color-interactive-background`        | `--color-interactive-background`        |
| `--color-toggle-foreground-true`    | `--color-region`                        | `--color-region`                        |
| `--color-toggle-border-false`       | `--color-data`                          | `--color-data`                          |
| `--color-toggle-background-false`   | `--color-interactive-foreground`        | `--color-interactive-foreground`        |
| `--color-toggle-foreground-false`   | `--color-data`                          | `--color-data`                          |
| `--color-toggle-foreground-null`    | `--color-data`                          | `--color-data`                          |
| `--color-toggle-hover-border`       | `--color-interactive-hover-background`  | `--color-interactive-hover-background`  |
| `--color-toggle-hover-background`   | `--color-interactive-hover-background`  | `--color-interactive-hover-background`  |
| `--color-toggle-hover-foreground`   | `--color-interactive-hover-foreground`  | `--color-region`                        |


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

| Variable name                                  | Default value                              |
|------------------------------------------------|--------------------------------------------|
| `--input-border`                               | 2px solid transparent                      |
| `--input-border-bottom`                        | 1px solid var(--color-label)               |
| `--input-border-disabled`                      | 2px solid transparent                      |
| `--input-border-bottom-disabled`               | 1px solid var(--color-disabled-foreground) |
| `--input-border-radius`                        | 0                                          |
| `--input-button-border-radius`                 | 0                                          |
| `--input-button-height`                        | 2.5rem                                     |
| `--input-button-indent-left`                   | 0rem                                       |
| `--input-button-indent-right`                  | `--input-icon-wrapper-width`               |
| `--input-button-width`                         | 2.5rem                                     |
| `--input-container-width-large`                | 14rem                                      |
| `--input-container-width-small`                | 10.5rem                                    |
| `--input-text-font-size`                       | `--font-size`                              |
| `--input-text-font-weight`                     | 400                                        |
| `--input-grid-areas`                           | 'tag input invalid-icon icon button'       |
| `--input-grid-template-columns`                | auto 1fr auto auto auto                    |
| `--input-container-height`                     | 2.5rem                                     |
| `--input-icon-height`                          | 1.25rem                                    |
| `--input-icon-indent-left`                     | 0rem                                       |
| `--input-icon-indent-right`                    | `--input-icon-wrapper-width`               |
| `--input-icon-width`                           | 1.25rem                                    |
| `--input-icon-wrapper-height`                  | 100%                                       |
| `--input-icon-wrapper-width`                   | `--input-button-width`                     |
| `--input-invalid-icon-height`                  | 1.15rem                                    |
| `--input-invalid-icon-width`                   | 1.15rem                                    |
| `--input-invalid-icon-indent-left`             | 0rem                                       |
| `--input-invalid-icon-indent-right`            | `--input-icon-wrapper-width`               |
| `--input-container-padding-left`               | 1rem                                       |
| `--input-container-padding-right`              | 1rem                                       |
| `--input-tag-height`                           | 1.5rem                                     |
| `--input-tag-indent-left`                      | calc(var(--input-tag-width) + 1rem)        |
| `--input-tag-margin`                           | 0 0.5rem                                   |
| `--input-tag-indent-right`                     | 0rem                                       |
| `--input-tag-width`                            | 2.75rem                                    |
| `--input-container-min-height-text-area`       | 6rem                                       |
| `--input-container-padding-vertical-text-area` | 0.3rem                                     |
| `--input-container-width`                      | auto                                       |


### Color


| Variable name                          | Light mode value                    | Dark mode value                     |
|----------------------------------------|-------------------------------------|-------------------------------------|
| `--color-input`                        | `--color-data`                      | `--color-data`                      |
| `--color-input-background`             | `--color-region`                    | `--color-region`                    |
| `--color-input-icon`                   | `--color-label`                     | `--color-label`                     |
| `--color-input-disabled`               | `--color-disabled-foreground`       | `--color-disabled-foreground`       |
| `--color-input-disabled-background`    | transparent                         | transparent                         |
| `--color-input-disabled-icon`          | `--color-disabled-foreground`       | `--color-disabled-foreground`       |
| `--color-input-region-background`      | `--color-region-2`                  | `--color-region-2`                  |


<br>
Customized values for contrast mode:

| Variable name                    | Contrast mode value                  |
|----------------------------------|--------------------------------------|
| `--input-border`                 | 2px solid var(--contrast-foreground) |
| `--input-border-disabled`        | `--input-border`                     |
| `--input-border-bottom`          | `--input-border`                     |
| `--input-border-bottom-disabled` | `--input-border`                     |
| `--color-input-disabled`         | `--contrast-foreground`              |
| `--color-input-disabled-border`  | `--contrast-foreground`              |

## Buttons 

### Layout

| Variable name                                      | Default value                                            |
|----------------------------------------------------|----------------------------------------------------------|
| `--button-cursor`                                  | pointer                                                  |
| `--button-badge-padding`                           | 0 0.25rem 0 0.25rem                                      |
| `--button-icon-justify`                            | center                                                   |
| `--button-icon-margin`                             | 0 -0.4rem                                                |
| `--button-loader-margin`                           | 0 -0.25rem                                               |
| `--button-set-gap`                                 | 0.5rem                                                   |
| `--button-dropdown-align`                          | center                                                   |
| `--button-dropdown-border`                         | 2px solid var(--color-button-dropdown-background)        |
| `--button-dropdown-border-radius`                  | `--radius-default`                                       |
| `--button-dropdown-font-size`                      | inherit                                                  |
| `--button-dropdown-font-weight`                    | `--font-weight-interactive`                              |
| `--button-dropdown-gap`                            | 1.35rem                                                  |
| `--button-dropdown-grid-areas`                     | 'content icon'                                           |
| `--button-dropdown-grid-template-columns`          | 1fr auto                                                 |
| `--button-dropdown-grid-template-rows`             | 1fr                                                      |
| `--button-dropdown-height`                         | `--row-size-dynamic`                                     |
| `--button-dropdown-icon-height`                    | 1.5rem                                                   |
| `--button-dropdown-icon-width`                     | 1.55rem                                                  |
| `--button-dropdown-margin`                         | 0                                                        |
| `--button-dropdown-min-width`                      | `--row-size`                                             |
| `--button-dropdown-outline-offset`                 | -2px                                                     |
| `--button-dropdown-padding`                        | 0 1rem                                                   |
| `--button-dropdown-set-gap`                        | 0.1rem                                                   |
| `--button-dropdown-text-align`                     | left                                                     |
| `--button-dropdown-text-decoration`                | none                                                     |
| `--button-dropdown-width`                          | 100%                                                     |
| `--button-toolbar-group-gap`                       | 0                                                        |
| `--button-toolbar-gap`                             | 0                                                        |
| `--button-toolbar-primary-align`                   | center                                                   |
| `--button-toolbar-primary-border`                  | 2px solid var(--color-button-toolbar-primary-background) |
| `--button-toolbar-primary-border-radius`           | `--radius-default`                                       |
| `--button-toolbar-primary-font-size`               | inherit                                                  |
| `--button-toolbar-primary-font-weight`             | `--font-weight-interactive`                              |
| `--button-toolbar-primary-gap`                     | 1.35rem                                                  |
| `--button-toolbar-primary-grid-areas`              | 'content icon'                                           |
| `--button-toolbar-primary-grid-template-columns`   | minmax(max-content, 1fr) auto                            |
| `--button-toolbar-primary-grid-template-rows`      | 1fr                                                      |
| `--button-toolbar-primary-height`                  | `--row-size`                                             |
| `--button-toolbar-primary-icon-height`             | 1.5rem                                                   |
| `--button-toolbar-primary-icon-width`              | 1.55rem                                                  |
| `--button-toolbar-primary-margin`                  | 0                                                        |
| `--button-toolbar-primary-min-width`               | `--row-size`                                             |
| `--button-toolbar-primary-outline-offset`          | 0                                                        |
| `--button-toolbar-primary-padding`                 | 0 1rem                                                   |
| `--button-toolbar-primary-text-align`              | left                                                     |
| `--button-toolbar-primary-text-decoration`         | none                                                     |
| `--button-toolbar-primary-width`                   | 100%                                                     |
| `--button-toolbar-secondary-align`                 | center                                                   |
| `--button-toolbar-secondary-border`                | 2px solid var(--color-interactive-secondary-background)  |
| `--button-toolbar-secondary-border-radius`         | `--radius-default`                                       |
| `--button-toolbar-secondary-font-size`             | inherit                                                  |
| `--button-toolbar-secondary-font-weight`           | `--font-weight-interactive`                              |
| `--button-toolbar-secondary-gap`                   | 1.35rem                                                  |
| `--button-toolbar-secondary-grid-areas`            | 'content icon'                                           |
| `--button-toolbar-secondary-grid-template-columns` | minmax(max-content, 1fr) auto                            |
| `--button-toolbar-secondary-grid-template-rows`    | 1fr                                                      |
| `--button-toolbar-secondary-height`                | `--row-size`                                             |
| `--button-toolbar-secondary-icon-height`           | 1.5rem                                                   |
| `--button-toolbar-secondary-icon-width`            | 1.55rem                                                  |
| `--button-toolbar-secondary-margin`                | 0                                                        |
| `--button-toolbar-secondary-min-width`             | `--row-size`                                             |
| `--button-toolbar-secondary-outline-offset`        | 0                                                        |
| `--button-toolbar-secondary-padding`               | 0 1rem                                                   |
| `--button-toolbar-secondary-text-align`            | left                                                     |
| `--button-toolbar-secondary-text-decoration`       | none                                                     |
| `--button-toolbar-secondary-width`                 | auto                                                     |
| `--button-toolbar-tertiary-align`                  | center                                                   |
| `--button-toolbar-tertiary-border`                 | 2px solid var(--color-interactive-background)            |
| `--button-toolbar-tertiary-border-radius`          | `--radius-default`                                       |
| `--button-toolbar-tertiary-font-size`              | inherit                                                  |
| `--button-toolbar-tertiary-font-weight`            | `--font-weight-interactive`                              |
| `--button-toolbar-tertiary-gap`                    | 1.35rem                                                  |
| `--button-toolbar-tertiary-grid-areas`             | 'content icon'                                           |
| `--button-toolbar-tertiary-grid-template-columns`  | 1fr auto                                                 |
| `--button-toolbar-tertiary-grid-template-rows`     | 1fr                                                      |
| `--button-toolbar-tertiary-height`                 | `--row-size`                                             |
| `--button-toolbar-tertiary-icon-height`            | 1.5rem                                                   |
| `--button-toolbar-tertiary-icon-width`             | 1.55rem                                                  |
| `--button-toolbar-tertiary-margin`                 | 0                                                        |
| `--button-toolbar-tertiary-min-width`              | `--row-size`                                             |
| `--button-toolbar-tertiary-outline-offset`         | 0                                                        |
| `--button-toolbar-tertiary-padding`                | 0 1rem                                                   |
| `--button-toolbar-tertiary-text-align`             | left                                                     |
| `--button-toolbar-tertiary-text-decoration`        | none                                                     |
| `--button-toolbar-tertiary-width`                  | auto                                                     |
| `--button-toolbar-ghost-align`                     | center                                                   |
| `--button-toolbar-ghost-border`                    | 2px solid transparent                                    |
| `--button-toolbar-ghost-border-radius`             | `--radius-default`                                       |
| `--button-toolbar-ghost-font-size`                 | inherit                                                  |
| `--button-toolbar-ghost-font-weight`               | `--font-weight-interactive`                              |
| `--button-toolbar-ghost-gap`                       | 1.35rem                                                  |
| `--button-toolbar-ghost-grid-areas`                | 'content icon'                                           |
| `--button-toolbar-ghost-grid-template-columns`     | 1fr auto                                                 |
| `--button-toolbar-ghost-grid-template-rows`        | 1fr                                                      |
| `--button-toolbar-ghost-height`                    | `--row-size`                                             |
| `--button-toolbar-ghost-icon-height`               | 1.5rem                                                   |
| `--button-toolbar-ghost-icon-width`                | 1.55rem                                                  |
| `--button-toolbar-ghost-margin`                    | 0                                                        |
| `--button-toolbar-ghost-min-width`                 | `--row-size`                                             |
| `--button-toolbar-ghost-outline-offset`            | -2px                                                     |
| `--button-toolbar-ghost-padding`                   | 0 1rem                                                   |
| `--button-toolbar-ghost-text-align`                | left                                                     |
| `--button-toolbar-ghost-text-decoration`           | none                                                     |
| `--button-toolbar-ghost-width`                     | auto                                                     |
| `--button-toolbar-selection-align`                 | center                                                   |
| `--button-toolbar-selection-border`                | 2px solid transparent                                    |
| `--button-toolbar-selection-border-radius`         | `--radius-default`                                       |
| `--button-toolbar-selection-font-size`             | inherit                                                  |
| `--button-toolbar-selection-font-weight`           | `--font-weight-interactive`                              |
| `--button-toolbar-selection-gap`                   | 1.35rem                                                  |
| `--button-toolbar-selection-grid-areas`            | 'content icon'                                           |
| `--button-toolbar-selection-grid-template-columns` | minmax(max-content, 1fr) auto                            |
| `--button-toolbar-selection-grid-template-rows`    | 1fr                                                      |
| `--button-toolbar-selection-height`                | `--row-size`                                             |
| `--button-toolbar-selection-icon-height`           | 1.5rem                                                   |
| `--button-toolbar-selection-icon-width`            | 1.55rem                                                  |
| `--button-toolbar-selection-margin`                | 0                                                        |
| `--button-toolbar-selection-min-width`             | `--row-size`                                             |
| `--button-toolbar-selection-outline-offset`        | -2px                                                     |
| `--button-toolbar-selection-padding`               | 0 1rem                                                   |
| `--button-toolbar-selection-text-align`            | left                                                     |
| `--button-toolbar-selection-text-decoration`       | none                                                     |
| `--button-toolbar-selection-width`                 | auto                                                     |
| `--button-toolbar-selection-icon-only-height`      | `--button-toolbar-selection-height`                      |
| `--button-toolbar-selection-icon-only-min-width`   | `--button-toolbar-selection-min-width`                   |
| `--button-toolbar-selection-icon-only-padding`     | 0                                                        |
| `--button-toolbar-selection-icon-only-width`       | auto                                                     |
| `--button-toolbar-primary-icon-only-height`        | `--button-toolbar-primary-height`                        |
| `--button-toolbar-primary-icon-only-min-width`     | `--button-toolbar-primary-min-width`                     |
| `--button-toolbar-primary-icon-only-padding`       | 0                                                        |
| `--button-toolbar-primary-icon-only-width`         | auto                                                     |
| `--button-toolbar-secondary-icon-only-height`      | `--button-toolbar-secondary-height`                      |
| `--button-toolbar-secondary-icon-only-min-width`   | `--button-toolbar-secondary-min-width`                   |
| `--button-toolbar-secondary-icon-only-padding`     | 0                                                        |
| `--button-toolbar-secondary-icon-only-width`       | auto                                                     |
| `--button-toolbar-tertiary-icon-only-height`       | `--button-toolbar-tertiary-height`                       |
| `--button-toolbar-tertiary-icon-only-min-width`    | `--button-toolbar-tertiary-min-width`                    |
| `--button-toolbar-tertiary-icon-only-padding`      | 0                                                        |
| `--button-toolbar-tertiary-icon-only-width`        | auto                                                     |
| `--button-toolbar-ghost-icon-only-height`          | `--button-toolbar-ghost-height`                          |
| `--button-toolbar-ghost-icon-only-min-width`       | `--button-toolbar-ghost-min-width`                       |
| `--button-toolbar-ghost-icon-only-padding`         | 0                                                        |
| `--button-toolbar-ghost-icon-only-width`           | auto                                                     |
| `--button-nav-align`                               | center                                                   |
| `--button-nav-border`                              | 2px solid transparent                                    |
| `--button-nav-border-radius`                       | 0                                                        |
| `--button-nav-font-size`                           | inherit                                                  |
| `--button-nav-font-weight`                         | `--font-weight-interactive`                              |
| `--button-nav-gap`                                 | 1.35rem                                                  |
| `--button-nav-grid-areas`                          | 'icon content'                                           |
| `--button-nav-grid-template-columns`               | auto 1fr                                                 |
| `--button-nav-grid-template-rows`                  | 1fr                                                      |
| `--button-nav-height`                              | `--row-size`                                             |
| `--button-nav-icon-height`                         | 1.5rem                                                   |
| `--button-nav-icon-width`                          | 1.55rem                                                  |
| `--button-nav-margin`                              | 0                                                        |
| `--button-nav-min-width`                           | `--row-size`                                             |
| `--button-nav-outline-offset`                      | -2px                                                     |
| `--button-nav-padding`                             | 0 1rem                                                   |
| `--button-nav-text-align`                          | left                                                     |
| `--button-nav-text-decoration`                     | none                                                     |
| `--button-nav-width`                               | 100%                                                     |
| `--button-nav-public-align`                        | center                                                   |
| `--button-nav-public-border`                       | 0                                                        |
| `--button-nav-public-border-radius`                | 0                                                        |
| `--button-nav-public-font-size`                    | inherit                                                  |
| `--button-nav-public-font-weight`                  | `--font-weight-interactive`                              |
| `--button-nav-public-gap`                          | 1.35rem                                                  |
| `--button-nav-public-grid-areas`                   | 'content'                                                |
| `--button-nav-public-grid-template-columns`        | 1fr                                                      |
| `--button-nav-public-grid-template-rows`           | 1fr                                                      |
| `--button-nav-public-height`                       | calc(var(--row-size) - 1.35px)                           |
| `--button-nav-public-icon-height`                  | 1.5rem                                                   |
| `--button-nav-public-icon-width`                   | 1.55rem                                                  |
| `--button-nav-public-margin`                       | 0                                                        |
| `--button-nav-public-min-width`                    | `--row-size`                                             |
| `--button-nav-public-outline-offset`               | -2px                                                     |
| `--button-nav-public-padding`                      | 0 1rem                                                   |
| `--button-nav-public-text-align`                   | center                                                   |
| `--button-nav-public-text-decoration`              | none                                                     |
| `--button-nav-public-width`                        | auto                                                     |
| `--button-modal-primary-align`                     | center                                                   |
| `--button-modal-primary-border`                    | 2px solid var(--color-button-dropdown-background)        |
| `--button-modal-primary-border-radius`             | 0                                                        |
| `--button-modal-primary-font-size`                 | inherit                                                  |
| `--button-modal-primary-font-weight`               | `--font-weight-interactive`                              |
| `--button-modal-primary-height`                    | auto                                                     |
| `--button-modal-primary-margin`                    | 0                                                        |
| `--button-modal-primary-min-width`                 | `--row-size`                                             |
| `--button-modal-primary-outline-offset`            | 0                                                        |
| `--button-modal-primary-padding`                   | 1rem 1rem 2rem 1rem                                      |
| `--button-modal-primary-text-align`                | left                                                     |
| `--button-modal-primary-text-decoration`           | none                                                     |
| `--button-modal-primary-width`                     | auto                                                     |
| `--button-modal-secondary-align`                   | center                                                   |
| `--button-modal-secondary-border`                  | 2px solid var(--color-button-dropdown-background)        |
| `--button-modal-secondary-border-radius`           | 0                                                        |
| `--button-modal-secondary-font-size`               | inherit                                                  |
| `--button-modal-secondary-font-weight`             | `--font-weight-interactive`                              |
| `--button-modal-secondary-height`                  | auto                                                     |
| `--button-modal-secondary-margin`                  | 0                                                        |
| `--button-modal-secondary-min-width`               | `--row-size`                                             |
| `--button-modal-secondary-outline-offset`          | 0                                                        |
| `--button-modal-secondary-padding`                 | 1rem 1rem 2rem 1rem                                      |
| `--button-modal-secondary-text-align`              | left                                                     |
| `--button-modal-secondary-text-decoration`         | none                                                     |
| `--button-modal-secondary-width`                   | 100%                                                     |
| `--button-modal-set-flex-direction`                | row-reverse                                              |
| `--button-modal-set-gap`                           | 0                                                        |
| `--button-modal-set-justify`                       | stretch                                                  |
| `--button-modal-set-margin`                        | 0                                                        |
| `--button-modal-set-padding`                       | 0                                                        |
| `--button-primary-align`                           | center                                                   |
| `--button-primary-badge-inset`                     | -0.66rem -0.66rem auto auto                              |
| `--button-primary-empty-badge-inset`               | -0.56rem -0.56rem auto auto                              |
| `--button-primary-border`                          | 2px solid var(--color-interactive-background)            |
| `--button-primary-border-radius`                   | `--radius-default`                                       |
| `--button-primary-font-size`                       | inherit                                                  |
| `--button-primary-font-weight`                     | `--font-weight-interactive`                              |
| `--button-primary-gap`                             | 1.35rem                                                  |
| `--button-primary-grid-areas`                      | 'content icon'                                           |
| `--button-primary-grid-template-columns`           | 1fr auto                                                 |
| `--button-primary-grid-template-rows`              | 1fr                                                      |
| `--button-primary-height`                          | `--row-size`                                             |
| `--button-primary-icon-height`                     | 1.5rem                                                   |
| `--button-primary-icon-width`                      | 1.55rem                                                  |
| `--button-primary-margin`                          | 0                                                        |
| `--button-primary-min-width`                       | `--row-size`                                             |
| `--button-primary-outline-offset`                  | 0                                                        |
| `--button-primary-padding`                         | 0 1rem                                                   |
| `--button-primary-text-align`                      | left                                                     |
| `--button-primary-text-decoration`                 | none                                                     |
| `--button-primary-width`                           | auto                                                     |
| `--button-primary-icon-only-height`                | `--button-primary-height`                                |
| `--button-primary-icon-only-min-width`             | `--button-primary-min-width`                             |
| `--button-primary-icon-only-padding`               | 0                                                        |
| `--button-primary-icon-only-width`                 | auto                                                     |
| `--button-secondary-align`                         | center                                                   |
| `--button-secondary-badge-inset`                   | -0.66rem -0.66rem auto auto                              |
| `--button-secondary-border`                        | 2px solid var(--color-interactive-secondary-background)  |
| `--button-secondary-border-radius`                 | `--radius-default`                                       |
| `--button-secondary-font-size`                     | inherit                                                  |
| `--button-secondary-font-weight`                   | `--font-weight-interactive`                              |
| `--button-secondary-gap`                           | 1.35rem                                                  |
| `--button-secondary-grid-areas`                    | 'content icon'                                           |
| `--button-secondary-grid-template-columns`         | 1fr auto                                                 |
| `--button-secondary-grid-template-rows`            | 1fr                                                      |
| `--button-secondary-height`                        | `--row-size`                                             |
| `--button-secondary-icon-height`                   | 1.5rem                                                   |
| `--button-secondary-icon-width`                    | 1.55rem                                                  |
| `--button-secondary-margin`                        | 0                                                        |
| `--button-secondary-min-width`                     | `--row-size`                                             |
| `--button-secondary-outline-offset`                | 0                                                        |
| `--button-secondary-padding`                       | 0 1rem                                                   |
| `--button-secondary-text-align`                    | left                                                     |
| `--button-secondary-text-decoration`               | none                                                     |
| `--button-secondary-width`                         | auto                                                     |
| `--button-secondary-icon-only-height`              | `--button-secondary-height`                              |
| `--button-secondary-icon-only-min-width`           | `--button-secondary-min-width`                           |
| `--button-secondary-icon-only-padding`             | 0                                                        |
| `--button-secondary-icon-only-width`               | auto                                                     |
| `--button-tertiary-align`                          | center                                                   |
| `--button-tertiary-badge-inset`                    | -0.66rem -0.66rem auto auto                              |
| `--button-tertiary-border`                         | 2px solid var(--color-interactive-background)            |
| `--button-tertiary-border-radius`                  | `--radius-default`                                       |
| `--button-tertiary-font-size`                      | inherit                                                  |
| `--button-tertiary-font-weight`                    | `--font-weight-interactive`                              |
| `--button-tertiary-gap`                            | 1.35rem                                                  |
| `--button-tertiary-grid-areas`                     | 'content icon'                                           |
| `--button-tertiary-grid-template-columns`          | 1fr auto                                                 |
| `--button-tertiary-grid-template-rows`             | 1fr                                                      |
| `--button-tertiary-height`                         | `--row-size`                                             |
| `--button-tertiary-icon-height`                    | 1.5rem                                                   |
| `--button-tertiary-icon-width`                     | 1.55rem                                                  |
| `--button-tertiary-margin`                         | 0                                                        |
| `--button-tertiary-min-width`                      | `--row-size`                                             |
| `--button-tertiary-outline-offset`                 | 0                                                        |
| `--button-tertiary-padding`                        | 0 1rem                                                   |
| `--button-tertiary-text-align`                     | left                                                     |
| `--button-tertiary-text-decoration`                | none                                                     |
| `--button-tertiary-width`                          | auto                                                     |
| `--button-tertiary-icon-only-height`               | `--button-tertiary-height`                               |
| `--button-tertiary-icon-only-min-width`            | `--button-tertiary-min-width`                            |
| `--button-tertiary-icon-only-padding`              | 0                                                        |
| `--button-tertiary-icon-only-width`                | auto                                                     |
| `--button-ghost-align`                             | center                                                   |
| `--button-ghost-badge-inset`                       | -0.25rem -0.25rem auto auto                              |
| `--button-ghost-border`                            | 2px solid transparent                                    |
| `--button-ghost-border-radius`                     | `--radius-default`                                       |
| `--button-ghost-font-size`                         | inherit                                                  |
| `--button-ghost-font-weight`                       | `--font-weight-interactive`                              |
| `--button-ghost-gap`                               | 1.35rem                                                  |
| `--button-ghost-grid-areas`                        | 'content icon'                                           |
| `--button-ghost-grid-template-columns`             | 1fr auto                                                 |
| `--button-ghost-grid-template-rows`                | 1fr                                                      |
| `--button-ghost-height`                            | `--row-size`                                             |
| `--button-ghost-icon-height`                       | 1.5rem                                                   |
| `--button-ghost-icon-width`                        | 1.55rem                                                  |
| `--button-ghost-margin`                            | 0                                                        |
| `--button-ghost-min-width`                         | `--row-size`                                             |
| `--button-ghost-outline-offset`                    | -2px                                                     |
| `--button-ghost-padding`                           | 0 1rem                                                   |
| `--button-ghost-text-align`                        | left                                                     |
| `--button-ghost-text-decoration`                   | none                                                     |
| `--button-ghost-width`                             | auto                                                     |
| `--button-ghost-icon-only-height`                  | `--button-ghost-height`                                  |
| `--button-ghost-icon-only-min-width`               | `--button-ghost-min-width`                               |
| `--button-ghost-icon-only-padding`                 | 0                                                        |
| `--button-ghost-icon-only-width`                   | auto                                                     |

### Color
| Variable name                                          | Light mode value                                       | Dark mode value                                        |
|--------------------------------------------------------|--------------------------------------------------------|--------------------------------------------------------|
| `--color-button-active-mode`                           | `--color-data`                                         | `--color-data`                                         |
| `--color-button-active-mode-background`                | `--color-highlight`                                    | `--color-highlight`                                    |
| `--color-button-active-mode-border`                    | `--color-button-active-mode-background`                | `--color-button-active-mode-background`                |
| `--color-button-active-mode-icon`                      | `--color-button-active-mode`                           | `--color-button-active-mode`                           |
| `--color-button-destructive`                           | `--color-interactive-foreground`                       | `--color-interactive-foreground`                       |
| `--color-button-destructive-background`                | `--color-destructive`                                  | `--color-destructive`                                  |
| `--color-button-destructive-border`                    | `--color-button-destructive-background`                | `--color-button-destructive-background`                |
| `--color-button-destructive-icon`                      | `--color-button-destructive`                           | `--color-button-destructive`                           |
| `--color-button-dropdown`                              | `--color-data`                                         | `--color-data`                                         |
| `--color-button-dropdown-background`                   | transparent                                            | transparent                                            |
| `--color-button-dropdown-active`                       | `--color-interactive-active-foreground`                | `--color-interactive-active-foreground`                |
| `--color-button-dropdown-active-background`            | `--color-interactive-active-background`                | `--color-interactive-active-background`                |
| `--color-button-dropdown-active-border`                | `--color-button-dropdown-active-background`            | `--color-button-dropdown-active-background`            |
| `--color-button-dropdown-disabled`                     | `--color-disabled-foreground`                          | `--color-disabled-foreground`                          |
| `--color-button-dropdown-disabled-background`          | transparent                                            | transparent                                            |
| `--color-button-dropdown-disabled-border`              | transparent                                            | transparent                                            |
| `--color-button-dropdown-focus`                        | `--color-data`                                         | `--color-data`                                         |
| `--color-button-dropdown-focus-background`             | `--color-region-hover`                                 | `--color-region-hover`                                 |
| `--color-button-dropdown-focus-border`                 | `--color-button-dropdown-focus-background`             | `--color-button-dropdown-focus-background`             |
| `--color-button-dropdown-hover`                        | `--color-data`                                         | `--color-data`                                         |
| `--color-button-dropdown-hover-background`             | `--color-region-hover`                                 | `--color-region-hover`                                 |
| `--color-button-dropdown-hover-border`                 | `--color-button-dropdown-hover-background`             | `--color-button-dropdown-hover-background`             |
| `--color-button-dropdown-icon`                         | `--color-button-dropdown`                              | `--color-button-dropdown`                              |
| `--color-button-dropdown-icon-active`                  | `--color-interactive-active-foreground`                | `--color-interactive-active-foreground`                |
| `--color-button-dropdown-icon-disabled`                | `--color-disabled-foreground`                          | `--color-disabled-foreground`                          |
| `--color-button-dropdown-icon-focus`                   | `--color-button-dropdown-focus`                        | `--color-button-dropdown-focus`                        |
| `--color-button-dropdown-icon-hover`                   | `--color-button-dropdown-hover`                        | `--color-button-dropdown-hover`                        |
| `--color-button-toolbar-primary`                       | `color-interactive-foreground`                         | `color-interactive-foreground`                         |
| `--color-button-toolbar-primary-background`            | `color-interactive-background`                         | `color-interactive-background`                         |
| `--color-button-toolbar-primary-focus`                 | `color-button-toolbar-primary`                         | `color-button-toolbar-primary`                         |
| `--color-button-toolbar-primary-focus-background`      | `color-button-toolbar-primary-background`              | `color-button-toolbar-primary-background`              |
| `--color-button-toolbar-primary-focus-border`          | `color-background`                                     | `color-background`                                     |
| `--color-button-toolbar-primary-active`                | `color-interactive-active-foreground`                  | `color-interactive-active-foreground`                  |
| `--color-button-toolbar-primary-active-background`     | `color-interactive-active-background`                  | `color-interactive-active-background`                  |
| `--color-button-toolbar-primary-active-border`         | `color-button-toolbar-primary-focus-border`            | `color-button-toolbar-primary-focus-border`            |
| `--color-button-toolbar-primary-disabled`              | `color-disabled-foreground`                            | `color-disabled-foreground`                            |
| `--color-button-toolbar-primary-disabled-background`   | `color-disabled-background`                            | `color-disabled-background`                            |
| `--color-button-toolbar-primary-disabled-border`       | `color-button-toolbar-primary-disabled-background`     | `color-button-toolbar-primary-disabled-background`     |
| `--color-button-toolbar-primary-hover`                 | `color-interactive-hover-foreground`                   | `color-interactive-hover-foreground`                   |
| `--color-button-toolbar-primary-hover-background`      | `color-interactive-hover-background`                   | `color-interactive-hover-background`                   |
| `--color-button-toolbar-primary-hover-border`          | `color-button-toolbar-primary-hover-background`        | `color-button-toolbar-primary-hover-background`        |
| `--color-button-toolbar-primary-icon`                  | `color-interactive-foreground`                         | `color-interactive-foreground`                         |
| `--color-button-toolbar-primary-icon-active`           | `color-interactive-active-foreground`                  | `color-interactive-active-foreground`                  |
| `--color-button-toolbar-primary-icon-disabled`         | `color-disabled-foreground`                            | `color-disabled-foreground`                            |
| `--color-button-toolbar-primary-icon-focus`            | `color-interactive-foreground`                         | `color-interactive-foreground`                         |
| `--color-button-toolbar-primary-icon-hover`            | `color-interactive-hover-foreground`                   | `color-interactive-hover-foreground`                   |
| `--color-button-toolbar-secondary`                     | `color-interactive-secondary-foreground`               | `color-interactive-secondary-foreground`               |
| `--color-button-toolbar-secondary-background`          | `color-interactive-secondary-background`               | `color-interactive-secondary-background`               |
| `--color-button-toolbar-secondary-focus`               | `color-button-toolbar-secondary`                       | `color-button-toolbar-secondary`                       |
| `--color-button-toolbar-secondary-focus-background`    | `color-button-toolbar-secondary-background`            | `color-button-toolbar-secondary-background`            |
| `--color-button-toolbar-secondary-focus-border`        | `color-background`                                     | `color-background`                                     |
| `--color-button-toolbar-secondary-active`              | `color-interactive-active-foreground`                  | `color-interactive-active-foreground`                  |
| `--color-button-toolbar-secondary-active-background`   | `color-interactive-active-background`                  | `color-interactive-active-background`                  |
| `--color-button-toolbar-secondary-active-border`       | `color-button-toolbar-secondary-focus-border`          | `color-button-toolbar-secondary-focus-border`          |
| `--color-button-toolbar-secondary-disabled`            | `color-disabled-foreground`                            | `color-disabled-foreground`                            |
| `--color-button-toolbar-secondary-disabled-background` | `color-disabled-background`                            | `color-disabled-background`                            |
| `--color-button-toolbar-secondary-disabled-border`     | `color-button-toolbar-secondary-disabled-background`   | `color-button-toolbar-secondary-disabled-background`   |
| `--color-button-toolbar-secondary-hover`               | `color-interactive-hover-foreground`                   | `color-interactive-hover-foreground`                   |
| `--color-button-toolbar-secondary-hover-background`    | `color-interactive-hover-background`                   | `color-interactive-hover-background`                   |
| `--color-button-toolbar-secondary-hover-border`        | `color-button-toolbar-secondary-hover-background`      | `color-button-toolbar-secondary-hover-background`      |
| `--color-button-toolbar-secondary-icon`                | `color-button-toolbar-secondary`                       | `color-button-toolbar-secondary`                       |
| `--color-button-toolbar-secondary-icon-active`         | `color-interactive-active-foreground`                  | `color-interactive-active-foreground`                  |
| `--color-button-toolbar-secondary-icon-disabled`       | `color-disabled-foreground`                            | `color-disabled-foreground`                            |
| `--color-button-toolbar-secondary-icon-focus`          | `color-interactive-secondary-foreground`               | `color-interactive-secondary-foreground`               |
| `--color-button-toolbar-secondary-icon-hover`          | `color-interactive-hover-foreground`                   | `color-interactive-hover-foreground`                   |
| `--color-button-toolbar-tertiary`                      | `color-interactive-background`                         | `color-interactive-background`                         |
| `--color-button-toolbar-tertiary-background`           | `transparent`                                          | `transparent`                                          |
| `--color-button-toolbar-tertiary-focus`                | `color-button-toolbar-tertiary`                        | `color-button-toolbar-tertiary`                        |
| `--color-button-toolbar-tertiary-focus-background`     | `color-button-toolbar-tertiary-background`             | `color-button-toolbar-tertiary-background`             |
| `--color-button-toolbar-tertiary-focus-border`         | `color-focus-background`                               | `color-focus-background`                               |
| `--color-button-toolbar-tertiary-active`               | `color-interactive-active-foreground`                  | `color-interactive-active-foreground`                  |
| `--color-button-toolbar-tertiary-active-background`    | `color-interactive-active-background`                  | `color-interactive-active-background`                  |
| `--color-button-toolbar-tertiary-active-border`        | `color-button-toolbar-tertiary-active-background`      | `color-button-toolbar-tertiary-active-background`      |
| `--color-button-toolbar-tertiary-disabled`             | `color-disabled-foreground`                            | `color-disabled-foreground`                            |
| `--color-button-toolbar-tertiary-disabled-background`  | `transparent`                                          | `transparent`                                          |
| `--color-button-toolbar-tertiary-disabled-border`      | `color-button-toolbar-tertiary-disabled`               | `color-button-toolbar-tertiary-disabled`               |
| `--color-button-toolbar-tertiary-hover`                | `color-interactive-hover-foreground`                   | `color-interactive-hover-foreground`                   |
| `--color-button-toolbar-tertiary-hover-background`     | `color-interactive-hover-background`                   | `color-interactive-hover-background`                   |
| `--color-button-toolbar-tertiary-hover-border`         | `color-button-toolbar-tertiary-hover-background`       | `color-button-toolbar-tertiary-hover-background`       |
| `--color-button-toolbar-tertiary-icon`                 | `color-button-toolbar-tertiary`                        | `color-button-toolbar-tertiary`                        |
| `--color-button-toolbar-tertiary-icon-active`          | `color-interactive-active-foreground`                  | `color-interactive-active-foreground`                  |
| `--color-button-toolbar-tertiary-icon-disabled`        | `color-disabled-foreground`                            | `color-disabled-foreground`                            |
| `--color-button-toolbar-tertiary-icon-focus`           | `color-interactive-background`                         | `color-interactive-background`                         |
| `--color-button-toolbar-tertiary-icon-hover`           | `color-interactive-hover-foreground`                   | `color-interactive-hover-foreground`                   |
| `--color-button-toolbar-ghost`                         | `color-data`                                           | `color-data`                                           |
| `--color-button-toolbar-ghost-background`              | `transparent`                                          | `transparent`                                          |
| `--color-button-toolbar-ghost-focus`                   | `color-button-toolbar-ghost`                           | `color-button-toolbar-ghost`                           |
| `--color-button-toolbar-ghost-focus-background`        | `color-button-toolbar-ghost-background`                | `color-button-toolbar-ghost-background`                |
| `--color-button-toolbar-ghost-focus-border`            | `transparent`                                          | `transparent`                                          |
| `--color-button-toolbar-ghost-active`                  | `color-interactive-active-foreground`                  | `color-interactive-active-foreground`                  |
| `--color-button-toolbar-ghost-active-background`       | `color-interactive-active-background`                  | `color-interactive-active-background`                  |
| `--color-button-toolbar-ghost-active-border`           | `color-button-toolbar-ghost-active-background`         | `color-button-toolbar-ghost-active-background`         |
| `--color-button-toolbar-ghost-disabled`                | `color-disabled-foreground`                            | `color-disabled-foreground`                            |
| `--color-button-toolbar-ghost-disabled-background`     | `transparent`                                          | `transparent`                                          |
| `--color-button-toolbar-ghost-disabled-border`         | `color-button-toolbar-ghost-disabled-background`       | `color-button-toolbar-ghost-disabled-background`       |
| `--color-button-toolbar-ghost-hover`                   | `color-interactive-hover-foreground`                   | `color-interactive-hover-foreground`                   |
| `--color-button-toolbar-ghost-hover-background`        | `color-interactive-hover-background`                   | `color-interactive-hover-background`                   |
| `--color-button-toolbar-ghost-hover-border`            | `color-button-toolbar-ghost-hover-background`          | `color-button-toolbar-ghost-hover-background`          |
| `--color-button-toolbar-ghost-icon`                    | `color-interactive-background`                         | `color-interactive-background`                         |
| `--color-button-toolbar-ghost-icon-active`             | `color-interactive-active-foreground`                  | `color-interactive-active-foreground`                  |
| `--color-button-toolbar-ghost-icon-disabled`           | `color-disabled-foreground`                            | `color-disabled-foreground`                            |
| `--color-button-toolbar-ghost-icon-focus`              | `color-interactive-background`                         | `color-interactive-background`                         |
| `--color-button-toolbar-ghost-icon-hover`              | `color-interactive-hover-foreground`                   | `color-interactive-hover-foreground`                   |
| `--color-button-toolbar-selection`                     | `--color-interactive-foreground`                       | `--color-interactive-foreground`                       |
| `--color-button-toolbar-selection-background`          | transparent                                            | transparent                                            |
| `--color-button-toolbar-selection-focus`               | `--color-button-toolbar-selection`                     | `--color-button-toolbar-selection`                     |
| `--color-button-toolbar-selection-focus-background`    | `--color-button-toolbar-selection-background`          | `--color-button-toolbar-selection-background`          |
| `--color-button-toolbar-selection-focus-border`        | `--color-button-toolbar-selection-focus-background`    | `--color-button-toolbar-selection-focus-background`    |
| `--color-button-toolbar-selection-active`              | `--color-interactive-active-foreground`                | `--color-interactive-active-foreground`                |
| `--color-button-toolbar-selection-active-background`   | `--color-interactive-active-background`                | `--color-interactive-active-background`                |
| `--color-button-toolbar-selection-active-border`       | `--color-button-toolbar-selection-active-background`   | `--color-button-toolbar-selection-active-background`   |
| `--color-button-toolbar-selection-disabled`            | `--color-disabled-foreground`                          | `--color-disabled-foreground`                          |
| `--color-button-toolbar-selection-disabled-background` | `--color-disabled-background`                          | `--color-disabled-background`                          |
| `--color-button-toolbar-selection-disabled-border`     | `--color-button-toolbar-selection-disabled-background` | `--color-button-toolbar-selection-disabled-background` |
| `--color-button-toolbar-selection-hover`               | `--color-interactive-hover-foreground`                 | `--color-interactive-hover-foreground`                 |
| `--color-button-toolbar-selection-hover-background`    | `--color-interactive-hover-background`                 | `--color-interactive-hover-background`                 |
| `--color-button-toolbar-selection-hover-border`        | `--color-button-toolbar-selection-hover-background`    | `--color-button-toolbar-selection-hover-background`    |
| `--color-button-toolbar-selection-icon`                | `--color-interactive-foreground`                       | `--color-interactive-foreground`                       |
| `--color-button-toolbar-selection-icon-active`         | `--color-interactive-active-foreground`                | `--color-interactive-active-foreground`                |
| `--color-button-toolbar-selection-icon-disabled`       | `--color-disabled-foreground`                          | `--color-disabled-foreground`                          |
| `--color-button-toolbar-selection-icon-focus`          | `--color-interactive-foreground`                       | `--color-interactive-foreground`                       |
| `--color-button-toolbar-selection-icon-hover`          | `--color-interactive-hover-foreground`                 | `--color-interactive-hover-foreground`                 |
| `--color-button-nav`                                   | #111                                                   | #eee                                                   |
| `--color-button-nav-background`                        | transparent                                            | transparent                                            |
| `--color-button-nav-hover`                             | `--color-interactive-hover-foreground`                 | `--color-interactive-hover-foreground`                 |
| `--color-button-nav-hover-border`                      | transparent                                            | transparent                                            |
| `--color-button-nav-hover-background`                  | `--color-interactive-hover-background`                 | `--color-interactive-hover-background`                 |
| `--color-button-nav-icon`                              | `--color-button-nav`                                   | `--color-button-nav`                                   |
| `--color-button-nav-icon-hover`                        | `--color-interactive-hover-foreground`                 | `--color-interactive-hover-foreground`                 |
| `--color-button-nav-icon-selected`                     | `--color-button-nav-selected`                          | `--color-button-nav-selected`                          |
| `--color-button-nav-selected`                          | #111                                                   | #eee                                                   |
| `--color-button-nav-selected-background`               | #e0e0e0                                                | #35373c                                                |
| `--color-button-nav-selected-border`                   | transparent                                            | transparent                                            |
| `--color-button-nav-selected-left-border`              | `--color-brand`                                        | `--color-brand`                                        |
| `--color-button-nav-public`                            | `--color-nav-foreground`                               | `--color-nav-foreground`                               |
| `--color-button-nav-public-background`                 | transparent                                            | transparent                                            |
| `--color-button-nav-public-hover`                      | `--color-nav-foreground`                               | `--color-nav-foreground`                               |
| `--color-button-nav-public-hover-background`           | `--color-nav-hover-background`                         | `--color-nav-hover-background`                         |
| `--color-button-nav-public-hover-border`               | transparent                                            | transparent                                            |
| `--color-button-nav-public-icon`                       | `--color-button-nav-public`                            | `--color-button-nav-public`                            |
| `--color-button-nav-public-icon-hover`                 | `--color-button-nav-public-hover`                      | `--color-button-nav-public-hover`                      |
| `--color-button-modal-primary`                         | `--color-interactive-foreground`                       | `--color-interactive-foreground`                       |
| `--color-button-modal-primary-background`              | `--color-interactive-background`                       | `--color-interactive-background`                       |
| `--color-button-modal-primary-focus`                   | `--color-button-primary`                               | `--color-button-primary`                               |
| `--color-button-modal-primary-focus-background`        | `--color-button-primary-background`                    | `--color-button-primary-background`                    |
| `--color-button-modal-primary-focus-border`            | `--color-background`                                   | `--color-background`                                   |
| `--color-button-modal-primary-active`                  | `--color-interactive-active-foreground`                | `--color-interactive-active-foreground`                |
| `--color-button-modal-primary-active-background`       | `--color-interactive-active-background`                | `--color-interactive-active-background`                |
| `--color-button-modal-primary-active-border`           | `--color-button-primary-focus-border`                  | `--color-button-primary-focus-border`                  |
| `--color-button-modal-primary-disabled`                | `--color-disabled-foreground`                          | `--color-disabled-foreground`                          |
| `--color-button-modal-primary-disabled-background`     | `--color-disabled-background`                          | `--color-disabled-background`                          |
| `--color-button-modal-primary-disabled-border`         | `--color-button-primary-disabled-background`           | `--color-button-primary-disabled-background`           |
| `--color-button-modal-primary-hover`                   | `--color-interactive-hover-foreground`                 | `--color-interactive-hover-foreground`                 |
| `--color-button-modal-primary-hover-background`        | `--color-interactive-hover-background`                 | `--color-interactive-hover-background`                 |
| `--color-button-modal-primary-hover-border`            | `--color-button-primary-hover-background`              | `--color-button-primary-hover-background`              |
| `--color-button-modal-secondary`                       | `--color-interactive-secondary-foreground`             | `--color-interactive-secondary-foreground`             |
| `--color-button-modal-secondary-background`            | `--color-interactive-secondary-background`             | `--color-interactive-secondary-background`             |
| `--color-button-modal-secondary-focus`                 | `--color-button-secondary`                             | `--color-button-secondary`                             |
| `--color-button-modal-secondary-focus-background`      | `--color-button-secondary-background`                  | `--color-button-secondary-background`                  |
| `--color-button-modal-secondary-focus-border`          | `--color-background`                                   | `--color-background`                                   |
| `--color-button-modal-secondary-active`                | `--color-interactive-active-foreground`                | `--color-interactive-active-foreground`                |
| `--color-button-modal-secondary-active-background`     | `--color-interactive-active-background`                | `--color-interactive-active-background`                |
| `--color-button-modal-secondary-active-border`         | `--color-button-secondary-focus-border`                | `--color-button-secondary-focus-border`                |
| `--color-button-modal-secondary-disabled`              | `--color-disabled-foreground`                          | `--color-disabled-foreground`                          |
| `--color-button-modal-secondary-disabled-background`   | `--color-disabled-background`                          | `--color-disabled-background`                          |
| `--color-button-modal-secondary-disabled-border`       | `--color-button-secondary-disabled-background`         | `--color-button-secondary-disabled-background`         |
| `--color-button-modal-secondary-hover`                 | `--color-interactive-hover-foreground`                 | `--color-interactive-hover-foreground`                 |
| `--color-button-modal-secondary-hover-background`      | `--color-interactive-hover-background`                 | `--color-interactive-hover-background`                 |
| `--color-button-modal-secondary-hover-border`          | `--color-button-secondary-hover-background`            | `--color-button-secondary-hover-background`            |
| `--color-button-modal-set-background`                  | transparent                                            | transparent                                            |
| `--color-button-primary`                               | `--color-interactive-foreground`                       | `--color-interactive-foreground`                       |
| `--color-button-primary-background`                    | `--color-interactive-background`                       | `--color-interactive-background`                       |
| `--color-button-primary-focus`                         | `--color-button-primary`                               | `--color-button-primary`                               |
| `--color-button-primary-focus-background`              | `--color-button-primary-background`                    | `--color-button-primary-background`                    |
| `--color-button-primary-focus-border`                  | `--color-background`                                   | `--color-background`                                   |
| `--color-button-primary-active`                        | `--color-interactive-active-foreground`                | `--color-interactive-active-foreground`                |
| `--color-button-primary-active-background`             | `--color-interactive-active-background`                | `--color-interactive-active-background`                |
| `--color-button-primary-active-border`                 | `--color-button-primary-focus-border`                  | `--color-button-primary-focus-border`                  |
| `--color-button-primary-disabled`                      | `--color-disabled-foreground`                          | `--color-disabled-foreground`                          |
| `--color-button-primary-disabled-background`           | `--color-disabled-background`                          | `--color-disabled-background`                          |
| `--color-button-primary-disabled-border`               | `--color-button-primary-disabled-background`           | `--color-button-primary-disabled-background`           |
| `--color-button-primary-hover`                         | `--color-interactive-hover-foreground`                 | `--color-interactive-hover-foreground`                 |
| `--color-button-primary-hover-background`              | `--color-interactive-hover-background`                 | `--color-interactive-hover-background`                 |
| `--color-button-primary-hover-border`                  | `--color-button-primary-hover-background`              | `--color-button-primary-hover-background`              |
| `--color-button-primary-icon`                          | `--color-interactive-foreground`                       | `--color-interactive-foreground`                       |
| `--color-button-primary-icon-active`                   | `--color-interactive-active-foreground`                | `--color-interactive-active-foreground`                |
| `--color-button-primary-icon-disabled`                 | `--color-disabled-foreground`                          | `--color-disabled-foreground`                          |
| `--color-button-primary-icon-focus`                    | `--color-interactive-foreground`                       | `--color-interactive-foreground`                       |
| `--color-button-primary-icon-hover`                    | `--color-interactive-hover-foreground`                 | `--color-interactive-hover-foreground`                 |
| `--color-button-secondary`                             | `--color-interactive-secondary-foreground`             | `--color-interactive-secondary-foreground`             |
| `--color-button-secondary-background`                  | `--color-interactive-secondary-background`             | `--color-interactive-secondary-background`             |
| `--color-button-secondary-focus`                       | `--color-button-secondary`                             | `--color-button-secondary`                             |
| `--color-button-secondary-focus-background`            | `--color-button-secondary-background`                  | `--color-button-secondary-background`                  |
| `--color-button-secondary-focus-border`                | `--color-background`                                   | `--color-background`                                   |
| `--color-button-secondary-active`                      | `--color-interactive-active-foreground`                | `--color-interactive-active-foreground`                |
| `--color-button-secondary-active-background`           | `--color-interactive-active-background`                | `--color-interactive-active-background`                |
| `--color-button-secondary-active-border`               | `--color-button-secondary-focus-border`                | `--color-button-secondary-focus-border`                |
| `--color-button-secondary-disabled`                    | `--color-disabled-foreground`                          | `--color-disabled-foreground`                          |
| `--color-button-secondary-disabled-background`         | `--color-disabled-background`                          | `--color-disabled-background`                          |
| `--color-button-secondary-disabled-border`             | `--color-button-secondary-disabled-background`         | `--color-button-secondary-disabled-background`         |
| `--color-button-secondary-hover`                       | `--color-interactive-hover-foreground`                 | `--color-interactive-hover-foreground`                 |
| `--color-button-secondary-hover-background`            | `--color-interactive-hover-background`                 | `--color-interactive-hover-background`                 |
| `--color-button-secondary-hover-border`                | `--color-button-secondary-hover-background`            | `--color-button-secondary-hover-background`            |
| `--color-button-secondary-icon`                        | `--color-button-secondary`                             | `--color-button-secondary`                             |
| `--color-button-secondary-icon-active`                 | `--color-interactive-active-foreground`                | `--color-interactive-active-foreground`                |
| `--color-button-secondary-icon-disabled`               | `--color-disabled-foreground`                          | `--color-disabled-foreground`                          |
| `--color-button-secondary-icon-focus`                  | `--color-interactive-secondary-foreground`             | `--color-interactive-secondary-foreground`             |
| `--color-button-secondary-icon-hover`                  | `--color-interactive-hover-foreground`                 | `--color-interactive-hover-foreground`                 |
| `--color-button-tertiary`                              | `--color-interactive-background`                       | `--color-interactive-background`                       |
| `--color-button-tertiary-background`                   | transparent                                            | transparent                                            |
| `--color-button-tertiary-focus`                        | `--color-button-tertiary`                              | `--color-button-tertiary`                              |
| `--color-button-tertiary-focus-background`             | `--color-button-tertiary-background`                   | `--color-button-tertiary-background`                   |
| `--color-button-tertiary-focus-border`                 | `--color-focus-background`                             | `--color-focus-background`                             |
| `--color-button-tertiary-active`                       | `--color-interactive-active-foreground`                | `--color-interactive-active-foreground`                |
| `--color-button-tertiary-active-background`            | `--color-interactive-active-background`                | `--color-interactive-active-background`                |
| `--color-button-tertiary-active-border`                | `--color-button-tertiary-active-background`            | `--color-button-tertiary-active-background`            |
| `--color-button-tertiary-disabled`                     | `--color-disabled-foreground`                          | `--color-disabled-foreground`                          |
| `--color-button-tertiary-disabled-background`          | transparent                                            | transparent                                            |
| `--color-button-tertiary-disabled-border`              | `--color-button-tertiary-disabled`                     | `--color-button-tertiary-disabled`                     |
| `--color-button-tertiary-hover`                        | `--color-interactive-hover-foreground`                 | `--color-interactive-hover-foreground`                 |
| `--color-button-tertiary-hover-background`             | `--color-interactive-hover-background`                 | `--color-interactive-hover-background`                 |
| `--color-button-tertiary-hover-border`                 | `--color-button-tertiary-hover-background`             | `--color-button-tertiary-hover-background`             |
| `--color-button-tertiary-icon`                         | `--color-button-tertiary`                              | `--color-button-tertiary`                              |
| `--color-button-tertiary-icon-active`                  | `--color-interactive-active-foreground`                | `--color-interactive-active-foreground`                |
| `--color-button-tertiary-icon-disabled`                | `--color-disabled-foreground`                          | `--color-disabled-foreground`                          |
| `--color-button-tertiary-icon-focus`                   | `--color-interactive-background`                       | `--color-interactive-background`                       |
| `--color-button-tertiary-icon-hover`                   | `--color-interactive-hover-foreground`                 | `--color-interactive-hover-foreground`                 |
| `--color-button-ghost`                                 | `--color-interactive-background`                       | `--color-interactive-background`                       |
| `--color-button-ghost-background`                      | transparent                                            | transparent                                            |
| `--color-button-ghost-focus`                           | `--color-button-ghost`                                 | `--color-button-ghost`                                 |
| `--color-button-ghost-focus-background`                | `--color-button-ghost-background`                      | `--color-button-ghost-background`                      |
| `--color-button-ghost-focus-border`                    | transparent                                            | transparent                                            |
| `--color-button-ghost-active`                          | `--color-interactive-active-foreground`                | `--color-interactive-active-foreground`                |
| `--color-button-ghost-active-background`               | `--color-interactive-active-background`                | `--color-interactive-active-background`                |
| `--color-button-ghost-active-border`                   | `--color-button-ghost-active-background`               | `--color-button-ghost-active-background`               |
| `--color-button-ghost-disabled`                        | `--color-disabled-foreground`                          | `--color-disabled-foreground`                          |
| `--color-button-ghost-disabled-background`             | transparent                                            | transparent                                            |
| `--color-button-ghost-disabled-border`                 | `--color-button-ghost-disabled-background`             | `--color-button-ghost-disabled-background`             |
| `--color-button-ghost-hover`                           | `--color-interactive-hover-foreground`                 | `--color-interactive-hover-foreground`                 |
| `--color-button-ghost-hover-background`                | `--color-interactive-hover-background`                 | `--color-interactive-hover-background`                 |
| `--color-button-ghost-hover-border`                    | `--color-button-ghost-hover-background`                | `--color-button-ghost-hover-background`                |
| `--color-button-ghost-icon`                            | `--color-interactive-background`                       | `--color-interactive-background`                       |
| `--color-button-ghost-icon-active`                     | `--color-interactive-active-foreground`                | `--color-interactive-active-foreground`                |
| `--color-button-ghost-icon-disabled`                   | `--color-disabled-foreground`                          | `--color-disabled-foreground`                          |
| `--color-button-ghost-icon-focus`                      | `--color-interactive-background`                       | `--color-interactive-background`                       |
| `--color-button-ghost-icon-hover`                      | `--color-interactive-hover-foreground`                 | `--color-interactive-hover-foreground`                 |


<br>
Customized values for contrast mode:

| Variable name                            | Contrast mode value      |
|------------------------------------------|--------------------------|
| `--color-button-active-mode-background`  | `--contrast-background`  |
| `--color-button-dropdown`                | `--contrast-interactive` |
| `--color-button-dropdown-background`     | `--contrast-background`  |
| `--color-button-dropdown-focus`          | `--contrast-background`  |
| `--color-button-dropdown-hover`          | `--contrast-background`  |
| `--color-button-nav`                     | `--contrast-foreground`  |
| `--color-button-nav-icon`                | `--color-button-nav`     |
| `--color-button-nav-selected`            | `--contrast-background`  |
| `--color-button-nav-selected-background` | `--contrast-foreground`  |
| `--color-button-nav-public-hover`        | `--contrast-background`  |
| `--color-button-nav-public-icon-hover`   | `--contrast-background`  |