# Dock Long-Press Reordering Design

## Goal

Allow each visitor to long-press a Dock icon, drag it across the full Dock, and reorder the icons. The three separators remain fixed after positions 4, 6, and 8. The resulting order persists for that browser and device.

## Scope

- Support mouse, pen, and touch through Pointer Events.
- Preserve the existing click actions, hover effects, tooltips, reveal animation, and Dock styling.
- Allow icons to move across all existing Dock groups.
- Store the visitor's order in `localStorage`.
- Do not add a backend, user account synchronization, or a new drag-and-drop dependency.

## Interaction

1. Pressing an icon starts a 300 ms hold timer.
2. Releasing before the timer finishes keeps the existing click behavior.
3. Moving beyond a small tolerance before activation cancels the hold, so normal pointer movement does not unexpectedly start a drag.
4. Once activated, the icon lifts and scales slightly, captures the pointer, and follows horizontal pointer movement.
5. Crossing another icon's center swaps the dragged icon into that position. Motion layout animation moves neighboring icons smoothly.
6. Releasing or cancelling the pointer ends the drag and saves the new order.
7. Tooltips and click actions are suppressed while a drag is active.

The separators are rendered from fixed position boundaries rather than belonging to an icon group, so they remain after positions 4, 6, and 8 while icons move across them.

## State And Persistence

The Dock owns a flat ordered array of icon IDs. Rendering slices that order at the fixed group boundaries.

On initialization, the Dock reads a versioned `localStorage` value. The stored order is normalized against the current default icon list:

- known stored IDs are kept once, in their stored order;
- unknown or duplicate IDs are discarded;
- newly introduced or missing IDs are appended in default order;
- unreadable data falls back to the default order.

This makes deployments resilient when Dock icons are added or removed later. Storage access is guarded so privacy settings or unavailable storage do not break the Dock.

## Architecture

- Extract pure order-normalization and item-moving helpers into a small Dock utility module.
- Keep pointer gesture state local to the Dock component: pressed icon, hold timer, active pointer, drag position, and whether the gesture became a drag.
- Use Pointer Events for one input path across desktop and mobile.
- Use the project's existing Motion dependency for the lifted icon and layout transitions.
- Keep application-level icon click handlers unchanged.

## Accessibility And Fallbacks

- Icons remain clickable when no long-press drag occurs.
- Native image dragging and text selection remain disabled during the gesture.
- Pointer cancellation safely ends the interaction without firing an icon action.
- Users whose browser blocks `localStorage` can still reorder icons for the current page session.

## Testing

- Unit-test order normalization, invalid persisted data, missing/new icons, duplicates, and moves in both directions.
- Component/source-contract tests verify the 300 ms activation, Pointer Events, drag click suppression, fixed separator boundaries, and persistence wiring.
- Run TypeScript checks and a production build.
- Manually verify in the running site at desktop and mobile viewport sizes: short click, long-press activation, cross-separator reorder, release, and refresh restoration.

## Acceptance Criteria

- A short click retains the icon's existing action.
- Holding an icon for 300 ms activates a visible drag state.
- Dragging across any other icon reorders the Dock smoothly, including across separators.
- Separators remain after positions 4, 6, and 8.
- Dragging never triggers the icon's click action.
- The order is restored after refresh in the same browser.
- Invalid or outdated persisted order data cannot hide or duplicate Dock icons.
