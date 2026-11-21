# Requirements Document

## Introduction

The To-Do List Life Dashboard is a client-side web application built with HTML, CSS, and Vanilla JavaScript. It runs entirely in the browser with no backend server and persists all user data using the browser's Local Storage API. The dashboard combines four widgets on a single page: a time/greeting display, a 25-minute Focus Timer, a task manager (To-Do List), and a Quick Links launcher. The application must be usable as a standalone webpage or packaged as a browser extension, and must work in modern versions of Chrome, Firefox, Edge, and Safari.

## Glossary

- **Dashboard**: The single-page web application described in this document.
- **Greeting_Widget**: The UI section that displays the current time, date, and a time-of-day greeting.
- **Focus_Timer**: The UI section that runs a 25-minute countdown timer.
- **Todo_List**: The UI section that manages a user's task items.
- **Task**: A single to-do item consisting of at minimum a text description and a completion state.
- **Quick_Links**: The UI section that displays user-defined shortcut buttons that open URLs.
- **Link**: A user-defined record consisting of a label and a URL stored in Quick_Links.
- **Storage**: The browser's Local Storage API used to persist all user data.
- **Clock**: The real-time clock mechanism that drives the Greeting_Widget display.
- **Morning**: The time range from 05:00 to 11:59.
- **Afternoon**: The time range from 12:00 to 17:59.
- **Evening**: The time range from 18:00 to 20:59.
- **Night**: The time range from 21:00 to 04:59.

---

## Requirements

### Requirement 1: Real-Time Greeting Display

**User Story:** As a user, I want to see the current time, date, and a contextual greeting when I open the Dashboard, so that I have immediate situational awareness without checking another app.

#### Acceptance Criteria

1. THE Greeting_Widget SHALL display the current time in HH:MM format using the 24-hour clock.
2. WHEN the current local time advances by one second, THE Greeting_Widget SHALL update the displayed time to reflect the new HH:MM value.
3. THE Greeting_Widget SHALL display the current date including the full weekday name, day, month, and year (e.g., "Saturday, 21 November 2026").
4. IF the current local hour is between 05:00 (inclusive) and 12:00 (exclusive), THEN THE Greeting_Widget SHALL display the greeting "Good Morning".
5. IF the current local hour is between 12:00 (inclusive) and 17:00 (exclusive), THEN THE Greeting_Widget SHALL display the greeting "Good Afternoon".
6. IF the current local hour is between 17:00 (inclusive) and 21:00 (exclusive), THEN THE Greeting_Widget SHALL display the greeting "Good Evening".
7. IF the current local hour is between 21:00 (inclusive) and 05:00 (exclusive) the following day, THEN THE Greeting_Widget SHALL display the greeting "Good Night".
8. THE Greeting_Widget SHALL derive the current time and date from the browser's native `Date` API without requiring any server calls.
9. IF the browser's native `Date` API returns an invalid or unavailable value, THEN THE Greeting_Widget SHALL display a message indicating that the current time is unavailable, in place of the time, date, and greeting.

---

### Requirement 2: Focus Timer

**User Story:** As a user, I want a 25-minute countdown timer with Start, Stop, and Reset controls, so that I can time focused work sessions without leaving the Dashboard.

#### Acceptance Criteria

1. WHEN the page loads, THE Focus_Timer SHALL initialize to a countdown value of 25 minutes and 00 seconds (25:00).
2. WHEN the user activates the Start control, THE Focus_Timer SHALL begin counting down in one-second decrements.
3. WHILE the Focus_Timer is counting down, THE Focus_Timer SHALL update the displayed time value every second.
4. WHEN the user activates the Stop control, THE Focus_Timer SHALL pause the countdown and retain the current remaining time.
5. WHEN the user activates the Reset control, THE Focus_Timer SHALL stop any active countdown and reset the displayed time to 25:00.
6. WHEN the countdown reaches 00:00, THE Focus_Timer SHALL stop automatically, display 00:00, disable the Stop control, and enable the Start and Reset controls.
7. THE Focus_Timer SHALL display the remaining time in MM:SS format at all times.
8. WHILE the Focus_Timer is counting down, THE Focus_Timer SHALL disable the Start control to prevent duplicate timers.
9. WHILE the Focus_Timer is in its initial state, paused, or has completed the countdown, THE Focus_Timer SHALL disable the Stop control.
10. WHEN the user activates the Start control after the countdown has reached 00:00, THE Focus_Timer SHALL reset to 25:00 and begin counting down.

---

### Requirement 3: To-Do List Task Management

**User Story:** As a user, I want to add, edit, mark complete, and delete tasks that persist across browser sessions, so that I can track my daily responsibilities without losing them on page refresh.

#### Acceptance Criteria

1. THE Todo_List SHALL provide an input field and a submission control that allow the user to add a new Task.
2. WHEN the user submits a new Task, THE Todo_List SHALL add the Task to the list and clear the input field.
3. IF the user submits a Task with an empty or whitespace-only input, THEN THE Todo_List SHALL not add the Task and SHALL retain focus on the input field.
4. THE Todo_List SHALL display each Task with a completion toggle, the task text, an edit control, and a delete control.
5. WHEN the user activates the completion toggle for a Task, THE Todo_List SHALL mark that Task as done and visually distinguish it from incomplete tasks (e.g., strikethrough text).
6. WHEN the user activates the completion toggle for a completed Task, THE Todo_List SHALL mark that Task as incomplete and remove the done visual style.
7. WHEN the user activates the edit control for a Task, THE Todo_List SHALL allow the user to modify the task text inline and SHALL save the change when the user presses Enter or activates a dedicated save control.
8. IF the user saves an edited Task with empty or whitespace-only text, THEN THE Todo_List SHALL discard the edit and restore the previous task text.
9. WHEN the user activates the delete control for a Task, THE Todo_List SHALL remove that Task from the list permanently.
10. WHEN any Task is added, edited, completed, uncompleted, or deleted, THE Storage SHALL persist the full updated task list under the same fixed key on every write so that a subsequent read using that same key retrieves the current state after page reload.
11. WHEN the Dashboard loads, THE Todo_List SHALL retrieve and render all previously saved tasks from Storage.
12. THE Todo_List SHALL limit task text input to a maximum of 250 characters and SHALL prevent the user from entering characters beyond that limit.

---

### Requirement 4: Quick Links Management

**User Story:** As a user, I want to save and launch favorite website shortcuts from the Dashboard, so that I can open frequently visited pages in one click without bookmarking them separately.

#### Acceptance Criteria

1. THE Quick_Links SHALL provide an input form with a label field (maximum 50 characters) and a URL field, and a submission control to add a new Link.
2. WHEN the user submits a new Link, THE Quick_Links SHALL add the Link as a clickable button displaying the user-provided label truncated to 50 characters.
3. IF the user submits a Link with an empty label or an empty URL, THEN THE Quick_Links SHALL not add the Link and SHALL display an inline error message adjacent to each empty field indicating that the field is required.
4. IF the user submits a Link whose URL does not begin with `http://` or `https://`, THEN THE Quick_Links SHALL not add the Link and SHALL display an inline error message adjacent to the URL field indicating that the URL format is invalid.
5. WHEN the user activates a Link button, THE Quick_Links SHALL open the associated URL in a new browser tab.
6. THE Quick_Links SHALL provide a delete control on each Link button that removes the Link from the list when activated.
7. WHEN any Link is added or deleted, THE Storage SHALL persist the full updated link list under a fixed, application-defined key so that the data survives page reload.
8. WHEN the Dashboard loads and Storage contains previously saved links, THE Quick_Links SHALL retrieve and render all saved links as buttons.
9. IF the Dashboard loads and Storage contains no saved links, THEN THE Quick_Links SHALL render the link list as empty with no buttons displayed.

---

### Requirement 5: Data Persistence via Local Storage

**User Story:** As a user, I want all my tasks and links to be saved automatically in my browser, so that my data is available every time I open the Dashboard without any manual export or login.

#### Acceptance Criteria

1. THE Storage SHALL save all Task data under a single dedicated Local Storage key named `todo_tasks`.
2. THE Storage SHALL save all Link data under a single dedicated Local Storage key named `quick_links`.
3. WHEN task or link data changes, THE Dashboard SHALL serialize the updated data as a JSON string and write it to the corresponding Local Storage key within 500ms of the change.
4. WHEN the Dashboard loads, THE Dashboard SHALL read and deserialize task and link data from their respective Local Storage keys before rendering any task or link content.
5. IF Storage returns null for a key on page load, THEN THE Dashboard SHALL treat the data as an empty list and render an empty state without error.
6. IF Local Storage data for a key cannot be parsed as valid JSON on page load, THEN THE Dashboard SHALL discard the corrupted value, treat the data as an empty list, and display an error message indicating data could not be loaded.
7. THE Dashboard SHALL NOT require any server-side storage, authentication, or network request to read or write user data.

---

### Requirement 6: Single-File Architecture Constraints

**User Story:** As a developer, I want the project to follow a strict single-file-per-type structure, so that the codebase stays minimal and easy to maintain.

#### Acceptance Criteria

1. THE Dashboard SHALL be structured so that all styling is contained in exactly one CSS file located in a `css/` directory, and no `<style>` blocks or inline `style` attributes appear in any HTML file.
2. THE Dashboard SHALL be structured so that all JavaScript logic is contained in exactly one JS file located in a `js/` directory, and no `<script>` blocks containing logic appear inline in any HTML file.
3. THE Dashboard SHALL load in the latest stable release of Chrome, Firefox, Edge, and Safari without requiring a build step, bundler, or external framework, using only browser-native HTML, CSS, and JavaScript features.
4. THE Dashboard SHALL function as a standalone webpage opened directly from the filesystem via the `file://` protocol with all features operational, requiring no server-side processing or network requests to function.
5. IF the Dashboard is served from a local or remote HTTP server, THEN THE Dashboard SHALL function identically to its `file://` behavior with no feature degradation.
