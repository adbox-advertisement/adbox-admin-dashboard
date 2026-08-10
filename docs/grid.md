# Grid System

A grid provides the structural foundation of a layout. It creates consistency, alignment, and predictable spacing while allowing flexibility across different screen sizes.

## Start with a 12-Column Grid

A **12-column grid** is the standard for web design because it divides evenly into multiple layouts:

- 2 columns (6:6)
- 3 columns (4:4:4)
- 4 columns (3:3:3:3)
- 6 columns (2:2:2:2:2:2)

This flexibility makes it suitable for nearly every interface, from dashboards to marketing pages.

---

## Use Column Ratios

Build layouts using clean column ratios instead of arbitrary widths.

Common layouts:

| Layout     | Use Case                  |
| ---------- | ------------------------- |
| **4 : 8**  | Sidebar + main content    |
| **3 : 9**  | Navigation + workspace    |
| **6 : 6**  | Equal split               |
| **2 : 10** | Utility panel + content   |
| **8 : 4**  | Content + secondary panel |

Column ratios create predictable visual balance across the interface.

---

## Choose Appropriate Gutters

Gutters are the spaces between columns. Their size influences the overall feel of the interface.

| Gutter   | Visual Feel                       |
| -------- | --------------------------------- |
| **8px**  | Dense, technical, dashboard-heavy |
| **24px** | Balanced, modern, general-purpose |
| **40px** | Spacious, editorial, premium      |

Choose gutter widths intentionally based on the product's visual tone.

---

## Responsive Grid

Reduce the number of columns as screen size decreases while preserving alignment.

| Breakpoint  | Columns |
| ----------- | ------: |
| Desktop     |      12 |
| Tablet      |       6 |
| Large Phone |       4 |
| Small Phone |       1 |

A responsive grid allows content to reflow naturally without sacrificing structure.

Example progression:

```text
Desktop:      12 columns
████████████

Tablet:        6 columns
██████

Large Phone:   4 columns
████

Small Phone:   1 column
█
```

---

## Break the Grid Intentionally

Once a consistent grid has been established, selectively breaking it can create emphasis.

Examples:

- Full-width hero images
- Pull quotes extending into the margin
- Featured cards spanning additional columns
- Edge-to-edge visual sections

Breaking the grid only works when the underlying structure is already clear.

---

## Maintain Strong Alignment

Alignment is one of the strongest indicators of visual polish.

Guidelines:

- Align elements to shared column edges.
- Keep margins and spacing consistent.
- Avoid arbitrary positioning.
- Even asymmetrical layouts should align to the same underlying grid.

Well-aligned interfaces feel intentional, even when they include overlapping or offset elements.

---

# Responsive Strategy

```
Desktop      → 12 Columns
Tablet       → 6 Columns
Large Phone  → 4 Columns
Small Phone  → 1 Column
```

Reduce columns progressively rather than inventing entirely new layouts for each breakpoint.

---

# Do

- Build layouts on a shared 12-column grid.
- Use clean column ratios such as **4:8**, **6:6**, or **3:9**.
- Match gutter width to the visual density of the interface.
- Collapse columns progressively across breakpoints (**12 → 6 → 4 → 1**).
- Align elements to shared column edges.
- Break the grid only after establishing a consistent structure.

---

# Don't

- Don't use arbitrary widths when standard column ratios provide a cleaner solution.
- Don't break the grid before users understand the underlying structure.
- Don't ignore alignment in favor of visual experimentation.
- Don't let responsive layouts lose their grid-based organization.
- Don't mix inconsistent gutter sizes without a deliberate design purpose.
