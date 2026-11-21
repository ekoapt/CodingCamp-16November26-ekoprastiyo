# Implementation Plan: To-Do Life Dashboard

## Overview

Implement a client-side single-page dashboard in pure HTML, CSS, and Vanilla JavaScript
(no build step, no external dependencies) with four widgets: Greeting, Focus Timer, To-Do
List, and Quick Links. All user data persists through `localStorage`. The file layout is
`index.html` / `css/style.css` / `js/app.js`.

## Tasks

- [x] 1. Scaffold project structure and HTML skeleton
  - Create `css/` and `js/` directories
  - Create `index.html` with semantic landmarks for each widget (`#greeting`, `#timer`, `#todo`, `#links`)
  - Add all required element IDs from the design: `#greeting-time`, `#greeting-date`, `#greeting-text`, `#timer-display`, `#timer-start`, `#timer-stop`, `#timer-reset`, `#todo-input`, `#todo-add-btn`, `#todo-list`, `#link-label`, `#link-url`, `#link-add-btn`, `#link-list`, `#link-label-error`, `#link-url-error`, `#storage-error`
  - Link `css/style.css` and `js/app.js` with no inline `<style>` blocks or inline `<script>` logic
  - Add `maxlength="250"` on `#todo-input` and `maxlength="50"` on `#link-label` as HTML attributes
  - _Requirements: 6.1, 6.2, 6.3, 6.4_

- [x] 2. Implement Storage module
  - [x] 2.1 Write the `Storage` plain-object module in `js/app.js`
    - Define `Storage.TASK_KEY = 'todo_tasks'` and `Storage.LINK_KEY = 'quick_links'`
    - Implement `Storage.save(key, data)` using `JSON.stringify` + `localStorage.setItem`
    - Implement `Storage.load(key)` with a `try/catch` around `JSON.parse`; return `[]` on `null` or parse error; call `onError(key, rawValue)` on parse failure
    - Implement the `onError` callback to show `#storage-error` element
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6_

  - [ ]* 2.2 Write unit tests for Storage
    - Test: `load` on absent key returns `[]`
    - Test: `load` on malformed JSON returns `[]` and fires error callback
    - Test: `save` writes correct key with a JSON string; `load` on that key returns the original value
    - _Requirements: 5.1, 5.2, 5.5, 5.6_

- [x] 3. Implement GreetingWidget
  - [x] 3.1 Write `GreetingWidget` pure helper functions
    - Implement `_formatTime(date)` → `"HH:MM"` (zero-padded 24-hour)
    - Implement `_formatDate(date)` → `"Weekday, DD Month YYYY"` using English names
    - Implement `_getGreeting(hour)` with the lookup table: 5–11 → "Good Morning", 12–16 → "Good Afternoon", 17–20 → "Good Evening", all others → "Good Night"
    - _Requirements: 1.1, 1.3, 1.4, 1.5, 1.6, 1.7_

  - [x] 3.2 Wire `GreetingWidget.init()` and interval
    - Implement `_tick()` that reads `new Date()`, validates it via `isNaN(date.getTime())`, updates `#greeting-time`, `#greeting-date`, `#greeting-text`
    - Implement `_handleInvalidDate()` to set `#greeting-time` to "Time unavailable", clear the other two elements, and stop the interval
    - Start a 1 000 ms `setInterval` in `init()` and call `_tick()` immediately
    - _Requirements: 1.2, 1.8, 1.9_

  - [ ]* 3.3 Write property test for `_formatTime` (Property 1)
    - **Property 1: Time HH:MM format**
    - **Validates: Requirements 1.1**
    - Use `fc.date()` to generate arbitrary valid Date objects; assert result matches `/^\d{2}:\d{2}$/` and round-trips to the correct hour/minute values

  - [ ]* 3.4 Write property test for `_formatDate` (Property 2)
    - **Property 2: Date string contains all required components**
    - **Validates: Requirements 1.3**
    - Use `fc.date()` to generate arbitrary dates; assert result contains a weekday, numeric day, month name, and four-digit year

  - [ ]* 3.5 Write property test for `_getGreeting` (Property 3)
    - **Property 3: Greeting covers all hours without gaps or overlaps**
    - **Validates: Requirements 1.4, 1.5, 1.6, 1.7**
    - Use `fc.integer({min:0, max:23})`; assert exactly one of the four greeting strings is returned with correct hour boundary mapping

  - [ ]* 3.6 Write unit tests for GreetingWidget
    - Test: invalid Date triggers "Time unavailable" message and clears date/greeting elements
    - Test: DOM elements are populated after one `_tick()` call with a valid Date
    - _Requirements: 1.2, 1.9_

- [x] 4. Implement FocusTimer
  - [x] 4.1 Write `FocusTimer` state machine and `_formatTime`
    - Define `TOTAL_SECONDS = 1500`, `state = 'idle'`, `remaining = 1500`, `intervalId = null`
    - Implement `_formatTime(seconds)` → `"MM:SS"` (zero-padded)
    - Implement `_start()`, `_stop()`, `_reset()`, `_tick()` with correct state transitions per the design state diagram
    - `_tick()` decrements `remaining`; when it reaches 0 transitions to `idle` and calls `_render()`
    - _Requirements: 2.1, 2.2, 2.4, 2.5, 2.6, 2.7, 2.10_

  - [ ] 4.2 Wire `FocusTimer.init()` and button enable/disable logic
    - Implement `_render()` to update `#timer-display` and apply the enable/disable rules per state: idle → Start enabled, Stop disabled, Reset enabled; running → Start disabled, Stop enabled, Reset enabled; paused → Start enabled, Stop disabled, Reset enabled
    - Attach click listeners for `#timer-start`, `#timer-stop`, `#timer-reset` in `init()`
    - Call `_render()` immediately in `init()` to show "25:00" on page load
    - _Requirements: 2.1, 2.3, 2.6, 2.8, 2.9_

  - [ ]* 4.3 Write property test for `_formatTime` (Property 4)
    - **Property 4: Timer MM:SS format is a lossless encoding**
    - **Validates: Requirements 2.7**
    - Use `fc.integer({min:0, max:1500})`; assert result matches `/^\d{2}:\d{2}$/` and decodes back to the original second count via `minutes * 60 + seconds`

  - [ ]* 4.4 Write unit tests for FocusTimer
    - Test: initial state is `idle`, display is `25:00`
    - Test: Start → state becomes `running`; Stop → state becomes `paused`; Reset → state becomes `idle`, display resets to `25:00`
    - Test: countdown reaching 00:00 → state becomes `idle`, Stop disabled, Start and Reset enabled
    - Test: activating Start after 00:00 resets to 25:00 and starts counting
    - _Requirements: 2.1, 2.4, 2.5, 2.6, 2.8, 2.9, 2.10_

- [ ] 5. Checkpoint — Storage, Greeting, and Timer
  - Ensure all tests written so far pass. Verify that opening `index.html` via `file://` renders the greeting with live time and date, shows "25:00" in the timer, and that Start/Stop/Reset behave correctly. Ask the user if any questions arise.

- [x] 6. Implement TodoList
  - [x] 6.1 Implement `TodoList` core data operations
    - Define `TodoList.tasks = []`
    - Implement `_validate(text)` → `boolean`; trims input and checks length is between 1 and 250
    - Implement `_add(text)`: validate, create a Task object with `id` (via `crypto.randomUUID()` or `Date.now().toString()`), `text` (trimmed), `completed: false`, `createdAt: Date.now()`, push to `tasks`, call `_persist()` and `_render()`; on empty/whitespace input retain focus on `#todo-input`
    - Implement `_toggle(id)`: flip `completed`, call `_persist()` and `_render()`
    - Implement `_delete(id)`: filter out task, call `_persist()` and `_render()`
    - Implement `_persist()`: call `Storage.save(TASK_KEY, tasks)`
    - _Requirements: 3.1, 3.2, 3.3, 3.5, 3.6, 3.9, 3.10, 5.1, 5.3_

  - [x] 6.2 Implement `TodoList` inline editing
    - Implement `_startEdit(id)`: set task text `<span>` to `contenteditable="true"`, change edit button to Save, focus and select text
    - Implement `_saveEdit(id, newText)`: trim newText; if empty restore original text; otherwise update `task.text`, call `_persist()`; remove `contenteditable`, revert button to Edit, call `_render()`
    - Handle Escape key to cancel edit and restore original text without flashing
    - Handle Enter key inside the editable span to trigger `_saveEdit()`
    - _Requirements: 3.7, 3.8_

  - [x] 6.3 Implement `TodoList._render()` and `_renderItem(task)`
    - `_render()` clears `#todo-list` and re-appends a DOM element per task
    - `_renderItem(task)` returns a `<li>` containing: `<input type="checkbox">` for completion toggle, `<span>` for text (strikethrough class when `completed`), edit button, delete button
    - `TodoList.init()` loads from `Storage.load(TASK_KEY)`, assigns to `tasks`, calls `_render()`, wires `#todo-add-btn` click and `#todo-input` Enter keypress
    - _Requirements: 3.4, 3.5, 3.6, 3.11_

  - [ ]* 6.4 Write property test for `_add` with valid input (Property 5)
    - **Property 5: Adding a valid task grows the task list by exactly one**
    - **Validates: Requirements 3.2**
    - Use `fc.string({minLength:1, maxLength:250}).filter(s => s.trim().length > 0)`; assert `tasks.length` increases by exactly 1 and new item text equals trimmed input

  - [ ]* 6.5 Write property test for whitespace rejection (Property 6)
    - **Property 6: Whitespace-only task submissions are rejected**
    - **Validates: Requirements 3.3**
    - Use `fc.string().map(s => s.replace(/\S/g, ' '))`; assert `tasks.length` is unchanged after `_add(whitespaceString)`

  - [ ]* 6.6 Write property test for `_renderItem` controls (Property 7)
    - **Property 7: Every rendered task item contains all four required controls**
    - **Validates: Requirements 3.4**
    - Use `fc.record({id: fc.string(), text: fc.string(), completed: fc.boolean(), createdAt: fc.integer()})`; assert returned element contains checkbox, text span, edit control, and delete control

  - [ ]* 6.7 Write property test for double-toggle (Property 8)
    - **Property 8: Completion toggle is a round-trip operation**
    - **Validates: Requirements 3.5, 3.6**
    - Use `fc.boolean()` for initial `completed` state; call `_toggle(id)` twice; assert `completed` equals original value

  - [ ]* 6.8 Write property test for whitespace edit discard (Property 9)
    - **Property 9: Whitespace-only edit is discarded and original text is preserved**
    - **Validates: Requirements 3.8**
    - Use `fc.string().filter(s => s.trim() === '')`; call `_saveEdit(id, whitespaceString)`; assert `task.text` is unchanged

  - [ ]* 6.9 Write property test for `_delete` (Property 10)
    - **Property 10: Deleting a task removes exactly that task from the list**
    - **Validates: Requirements 3.9**
    - Use `fc.array(taskArbitrary, {minLength:1})` + a random index; assert `tasks.length` decreases by exactly 1 and no task with that ID remains

  - [ ]* 6.10 Write property test for task persistence round-trip (Property 11)
    - **Property 11: Task list persistence is a round-trip**
    - **Validates: Requirements 3.10, 5.1, 5.3**
    - Use `fc.array(taskArbitrary)`; after any mutation assert `JSON.parse(localStorage.getItem('todo_tasks'))` deep-equals `TodoList.tasks`

  - [ ]* 6.11 Write unit tests for TodoList
    - Test: add task clears input field
    - Test: `_saveEdit` with valid text saves new text
    - Test: `_saveEdit` with empty string restores original text
    - Test: `_delete` removes the item from DOM and tasks array
    - Test: `init()` loads from pre-populated `localStorage` and renders items
    - _Requirements: 3.2, 3.7, 3.8, 3.9, 3.11_

- [x] 7. Implement QuickLinks
  - [x] 7.1 Implement `QuickLinks` core data operations and validation
    - Define `QuickLinks.links = []`
    - Implement `_validateLabel(label)` → `boolean`; trimmed length 1–50
    - Implement `_validateUrl(url)` → `boolean`; starts with `http://` or `https://`
    - Implement `_add(label, url)`: validate both fields; on failure call `_showError(field, msg)` with `aria-invalid="true"` on the offending input and populate `#link-label-error` / `#link-url-error`; on success create a Link object, push to `links`, call `_persist()` and `_render()`
    - Implement `_delete(id)`: filter out link, call `_persist()` and `_render()`
    - Implement `_open(url)`: call `window.open(url, '_blank', 'noopener,noreferrer')`
    - Implement `_persist()`: `Storage.save(LINK_KEY, links)`
    - Implement `_showError(field, msg)` and `_clearErrors()`; clear errors on next successful submission or when user starts typing in the offending field
    - _Requirements: 4.1, 4.3, 4.4, 4.6, 4.7, 5.2, 5.3_

  - [x] 7.2 Implement `QuickLinks._render()` and `_renderItem(link)` and wire `init()`
    - `_render()` clears `#link-list` and re-appends one element per link
    - `_renderItem(link)` returns a container with a clickable button (label text, truncated to 50 chars) and a delete button
    - `QuickLinks.init()` loads from `Storage.load(LINK_KEY)`, assigns to `links`, calls `_render()`, wires `#link-add-btn` click
    - On load with no saved links, render an empty `#link-list` with no buttons
    - _Requirements: 4.2, 4.5, 4.8, 4.9_

  - [ ]* 7.3 Write property test for label cap (Property 12)
    - **Property 12: Link button label is capped at 50 characters**
    - **Validates: Requirements 4.2**
    - Use `fc.string()` for arbitrary label length; assert visible button text is at most 50 characters

  - [ ]* 7.4 Write property test for URL validation (Property 13)
    - **Property 13: URL validation rejects all non-http/https URLs**
    - **Validates: Requirements 4.4**
    - Use `fc.string().filter(s => !/^https?:\/\//.test(s))`; assert `_validateUrl` returns `false` and no link is added

  - [ ]* 7.5 Write property test for `_delete` link (Property 14)
    - **Property 14: Deleting a link removes exactly that link from the list**
    - **Validates: Requirements 4.6**
    - Use `fc.array(linkArbitrary, {minLength:1})` + a random index; assert `links.length` decreases by 1 and no link with that ID remains

  - [ ]* 7.6 Write property test for link persistence round-trip (Property 15)
    - **Property 15: Link list persistence is a round-trip**
    - **Validates: Requirements 4.7, 5.2, 5.3**
    - Use `fc.array(linkArbitrary)`; after any mutation assert `JSON.parse(localStorage.getItem('quick_links'))` deep-equals `QuickLinks.links`

  - [ ]* 7.7 Write unit tests for QuickLinks
    - Test: empty label shows inline error on `#link-label-error`
    - Test: empty URL shows inline error on `#link-url-error`
    - Test: URL without `http://` / `https://` shows URL inline error
    - Test: valid submission adds a button and clears error elements
    - Test: delete removes the button and updates `links`
    - Test: `init()` loads from pre-populated `localStorage` and renders link buttons
    - Test: empty `localStorage` renders empty link list
    - _Requirements: 4.3, 4.4, 4.5, 4.6, 4.8, 4.9_

- [ ] 8. Checkpoint — TodoList and QuickLinks
  - Ensure all tests written so far pass. Verify that tasks can be added, completed, edited, and deleted, and that links can be added and deleted with correct validation messages. Ask the user if any questions arise.

- [x] 9. Write CSS styling
  - [ ] 9.1 Create `css/style.css` with the full application stylesheet
    - Apply a clean minimal design: neutral background, card-style widget panels with subtle shadow, readable sans-serif typography (minimum 16px body text)
    - Establish clear visual hierarchy: widget headings larger than body text, greeting time prominent
    - Style completed tasks with strikethrough and reduced opacity
    - Style focus timer display with a large monospace font for the countdown
    - Style Quick Links buttons compactly with hover/focus states
    - Style the `#storage-error` banner as hidden by default (`display:none`); shown via a `.visible` class added by JS
    - Style inline error messages (`#link-label-error`, `#link-url-error`) in a distinct error color
    - Style `[aria-invalid="true"]` input fields with an error border
    - Ensure no inline `style` attributes or `<style>` blocks appear in `index.html`
    - _Requirements: 6.1, 3.5, 3.6_

- [x] 10. DOMContentLoaded wiring and integration
  - [x] 10.1 Wire all widget `init()` calls in `app.js`
    - Add a single `DOMContentLoaded` listener at the bottom of `app.js` that calls, in order: `Storage.init()`, `GreetingWidget.init()`, `FocusTimer.init()`, `TodoList.init()`, `QuickLinks.init()`
    - Confirm no ES module `import`/`export` syntax is used anywhere in `app.js`
    - Confirm no `fetch` or `XMLHttpRequest` calls are present in `app.js`
    - _Requirements: 5.4, 5.7, 6.2, 6.4_

  - [ ]* 10.2 Write integration / smoke tests
    - Test: file structure audit — exactly one CSS file in `css/`, exactly one JS file in `js/`, no `<style>` blocks, no inline `style` attributes in `index.html`
    - Test: after any task write, `localStorage` key is `'todo_tasks'`; after any link write, `localStorage` key is `'quick_links'`
    - Test: static grep confirms no `fetch` / `XMLHttpRequest` calls in `app.js`
    - _Requirements: 5.1, 5.2, 6.1, 6.2, 5.7_

- [x] 11. Final checkpoint — full application
  - Ensure all tests pass. Verify that `index.html` opens via `file://` with all four widgets functional, that data persists across page reloads, and that the layout has no inline styles. Ask the user if any questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for a faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation before proceeding to the next phase
- Property-based tests use [fast-check](https://fast-check.dev/) and validate universal correctness properties; each test must reference its design property with the tag `Feature: todo-life-dashboard, Property N`
- Unit tests validate specific examples and edge cases
- All pure functions (`_formatTime`, `_formatDate`, `_getGreeting`, `FocusTimer._formatTime`, `_validate`, `_validateLabel`, `_validateUrl`) are testable in Node.js without a browser DOM

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["2.1"] },
    { "id": 1, "tasks": ["2.2", "3.1", "4.1", "6.1", "7.1"] },
    { "id": 2, "tasks": ["3.2", "3.3", "3.4", "3.5", "4.2", "4.3", "6.2", "6.4", "6.5", "7.2", "7.3", "7.4"] },
    { "id": 3, "tasks": ["3.6", "4.4", "6.3", "6.6", "6.7", "6.8", "6.9", "6.10", "7.5", "7.6"] },
    { "id": 4, "tasks": ["6.11", "7.7", "9.1", "10.1"] },
    { "id": 5, "tasks": ["10.2"] }
  ]
}
```
