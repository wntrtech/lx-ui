# Design Tokens

LX uses some custom properties (variables) to promote and improve consistency, adaptability and maintainability. These variables have been divided into two major groups:
1. **Layout variables**
     - Layout variables pertain to component structure, including margins, paddings, widths, heights, font sizes, grid areas, among others.
2. **Color variables**
    - Color variables pertain to the colors used in components, including background, text, icon, and border colors, as well as colors for different interaction states (hover, active, etc.).

## LxList

### Layout

| Variable name                                | Default value                           |
|----------------------------------------------|-----------------------------------------|
| `--list-category-width`                      | 0.25rem                                 |
| `--list-expander-width`                      | `--row-size`                            |
| `--list-gap`                                 | 0.5rem                                  |
| `--list-handle-icon-height`                  | `--icon-size`                           |
| `--list-handle-icon-width`                   | `--icon-size`                           |
| `--list-handle-width`                        | `--row-size`                            |
| `--list-header-margin-right`                 | 0.5rem                                  |
| `--list-header-min-height`                   | `--icon-size`                           |
| `--list-header-padding-left`                 | 0.75rem                                 |
| `--list-icon-alignment`                      | flex-start                              |
| `--list-icon-height`                         | 1.55rem                                 |
| `--list-icon-width`                          | 1.55rem                                 |
| `--list-inner-content-padding`               | 0.25rem 0.5rem 0.25rem 0.25rem          |
| `--list-inner-grid-areas`                    | 'category inner-content icon'           |
| `--list-item-border`                         | 2px solid var(--color-list-item-border) |
| `--list-item-min-height`                     | `--row-size`                            |
| `--list-middle-grid-areas`                   | 'middle-content actions'                |
| `--list-outer-default-grid-areas`            | 'outer-content selecting'               |
| `--list-outer-draggable-grid-areas`          | 'handle outer-content'                  |
| `--list-outer-treelist-grid-areas`           | 'expander outer-content selecting'      |
| `--list-primary-font-size`                   | `--font-size`                           |
| `--list-primary-font-weight`                 | bold                                    |
| `--list-primary-line-height`                 | 1.2em                                   |
| `--list-secondary-font-size`                 | `--small-font-size`                     |
| `--list-secondary-font-weight`               | `--description-font-weight`             |
| `--list-secondary-line-height`               | 1em                                     |
| `--list-selecting-block-padding`             | 0.5rem 0.5rem 0                         |
| `--list-toolbar-gap`                         | `--gap-buttons`                         |

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


