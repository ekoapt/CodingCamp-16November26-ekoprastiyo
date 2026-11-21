/* js/app.js — To-Do Life Dashboard */
/* Application logic will be added in subsequent tasks */

// ─── Storage ────────────────────────────────────────────────────────────────

const Storage = {
  TASK_KEY: 'todo_tasks',
  LINK_KEY: 'quick_links',

  save(key, data) {
    localStorage.setItem(key, JSON.stringify(data));
  },

  load(key) {
    let raw = null;
    try {
      raw = localStorage.getItem(key);
      if (raw === null) return [];
      return JSON.parse(raw);
    } catch (e) {
      this.onError(key, raw);
      return [];
    }
  },

  onError(key, rawValue) {
    const banner = document.getElementById('storage-error');
    if (banner) {
      banner.classList.add('visible');
    }
  },

  init() {
    // no-op: placeholder so DOMContentLoaded can call Storage.init() uniformly
  },
};

// ─── GreetingWidget ─────────────────────────────────────────────────────────

const GreetingWidget = {
  _formatTime(date) {
    const hh = String(date.getHours()).padStart(2, '0');
    const mm = String(date.getMinutes()).padStart(2, '0');
    return `${hh}:${mm}`;
  },

  _formatDate(date) {
    const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const months   = ['January', 'February', 'March', 'April', 'May', 'June',
                      'July', 'August', 'September', 'October', 'November', 'December'];
    const weekday = weekdays[date.getDay()];
    const day     = date.getDate();
    const month   = months[date.getMonth()];
    const year    = date.getFullYear();
    return `${weekday}, ${day} ${month} ${year}`;
  },

  _getGreeting(hour) {
    if (hour >= 5 && hour <= 11) return 'Good Morning';
    if (hour >= 12 && hour <= 16) return 'Good Afternoon';
    if (hour >= 17 && hour <= 20) return 'Good Evening';
    return 'Good Night';
  },

  intervalId: null,

  _tick() {
    const date = new Date();
    if (isNaN(date.getTime())) {
      this._handleInvalidDate();
      return;
    }
    document.getElementById('greeting-time').textContent = this._formatTime(date);
    document.getElementById('greeting-date').textContent = this._formatDate(date);
    document.getElementById('greeting-text').textContent = this._getGreeting(date.getHours());
  },

  _handleInvalidDate() {
    document.getElementById('greeting-time').textContent = 'Time unavailable';
    document.getElementById('greeting-date').textContent = '';
    document.getElementById('greeting-text').textContent = '';
    clearInterval(this.intervalId);
    this.intervalId = null;
  },

  init() {
    this._tick();
    this.intervalId = setInterval(() => this._tick(), 1000);
  },
};

// ─── FocusTimer ─────────────────────────────────────────────────────────────

const FocusTimer = {
  TOTAL_SECONDS: 1500,
  state: 'idle',       // 'idle' | 'running' | 'paused'
  remaining: 1500,
  intervalId: null,

  // Task 4.1 ─ pure helper ───────────────────────────────────────────────────

  _formatTime(seconds) {
    const mm = String(Math.floor(seconds / 60)).padStart(2, '0');
    const ss = String(seconds % 60).padStart(2, '0');
    return `${mm}:${ss}`;
  },

  // Task 4.1 ─ state-machine methods ────────────────────────────────────────

  _start() {
    if (this.state === 'running') return;

    // Re-start after countdown completed: reset to full duration first
    if (this.state === 'idle' && this.remaining === 0) {
      this.remaining = this.TOTAL_SECONDS;
    }

    this.state = 'running';
    this.intervalId = setInterval(() => this._tick(), 1000);
    this._render();
  },

  _stop() {
    if (this.state !== 'running') return;
    clearInterval(this.intervalId);
    this.intervalId = null;
    this.state = 'paused';
    this._render();
  },

  _reset() {
    clearInterval(this.intervalId);
    this.intervalId = null;
    this.remaining = this.TOTAL_SECONDS;
    this.state = 'idle';
    this._render();
  },

  _tick() {
    this.remaining -= 1;
    if (this.remaining <= 0) {
      this.remaining = 0;
      clearInterval(this.intervalId);
      this.intervalId = null;
      this.state = 'idle';
    }
    this._render();
  },

  // Task 4.2 ─ DOM rendering and button enable/disable ──────────────────────

  _render() {
    const display = document.getElementById('timer-display');
    const btnStart = document.getElementById('timer-start');
    const btnStop  = document.getElementById('timer-stop');
    const btnReset = document.getElementById('timer-reset');

    display.textContent = this._formatTime(this.remaining);

    // Enable/disable rules per state
    if (this.state === 'running') {
      btnStart.disabled = true;
      btnStop.disabled  = false;
      btnReset.disabled = false;
    } else {
      // idle or paused
      btnStart.disabled = false;
      btnStop.disabled  = true;
      btnReset.disabled = false;
    }
  },

  // Task 4.2 ─ init ─────────────────────────────────────────────────────────

  init() {
    document.getElementById('timer-start').addEventListener('click', () => this._start());
    document.getElementById('timer-stop').addEventListener('click',  () => this._stop());
    document.getElementById('timer-reset').addEventListener('click', () => this._reset());

    this._render(); // Show "25:00" and correct button states on page load
  },
};

// ─── TodoList ────────────────────────────────────────────────────────────────

const TodoList = {

  // ── 6.1 Core data operations ──────────────────────────────────────────────

  tasks: [],

  _validate(text) {
    const trimmed = typeof text === 'string' ? text.trim() : '';
    return trimmed.length >= 1 && trimmed.length <= 250;
  },

  _add(text) {
    if (!this._validate(text)) {
      const input = document.getElementById('todo-input');
      if (input) input.focus();
      return;
    }
    const task = {
      id: (typeof crypto !== 'undefined' && crypto.randomUUID)
            ? crypto.randomUUID()
            : Date.now().toString(),
      text: text.trim(),
      completed: false,
      createdAt: Date.now(),
    };
    this.tasks.push(task);
    this._persist();
    this._render();

    // Clear and re-focus the input field (Req 3.2)
    const input = document.getElementById('todo-input');
    if (input) {
      input.value = '';
      input.focus();
    }
  },

  _toggle(id) {
    const task = this.tasks.find(t => t.id === id);
    if (!task) return;
    task.completed = !task.completed;
    this._persist();
    this._render();
  },

  _delete(id) {
    this.tasks = this.tasks.filter(t => t.id !== id);
    this._persist();
    this._render();
  },

  _persist() {
    Storage.save(Storage.TASK_KEY, this.tasks);
  },

  // ── 6.2 Inline editing ────────────────────────────────────────────────────

  _startEdit(id) {
    const li = document.querySelector(`[data-id="${id}"]`);
    if (!li) return;

    const span = li.querySelector('.todo-text');
    const editBtn = li.querySelector('.todo-edit-btn');
    const task = this.tasks.find(t => t.id === id);
    if (!span || !editBtn || !task) return;

    // Store original text in case of Escape / empty-save
    span.dataset.original = task.text;

    span.contentEditable = 'true';
    span.classList.add('editing');
    editBtn.textContent = 'Save';
    editBtn.dataset.editing = 'true';

    // Focus and select all
    span.focus();
    const sel = window.getSelection();
    const range = document.createRange();
    range.selectNodeContents(span);
    sel.removeAllRanges();
    sel.addRange(range);

    // Keyboard handlers (stored so they can be removed on save/cancel)
    span._keyHandler = (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        this._saveEdit(id, span.textContent);
      } else if (e.key === 'Escape') {
        e.preventDefault();
        this._cancelEdit(id);
      }
    };
    span.addEventListener('keydown', span._keyHandler);
  },

  _cancelEdit(id) {
    const li = document.querySelector(`[data-id="${id}"]`);
    if (!li) return;
    const span = li.querySelector('.todo-text');
    const editBtn = li.querySelector('.todo-edit-btn');
    if (!span || !editBtn) return;

    // Restore original text
    span.textContent = span.dataset.original || span.textContent;
    span.contentEditable = 'false';
    span.classList.remove('editing');
    editBtn.textContent = 'Edit';
    delete editBtn.dataset.editing;

    if (span._keyHandler) {
      span.removeEventListener('keydown', span._keyHandler);
      delete span._keyHandler;
    }
  },

  _saveEdit(id, newText) {
    const task = this.tasks.find(t => t.id === id);
    if (!task) return;

    const trimmed = typeof newText === 'string' ? newText.trim() : '';

    if (trimmed.length === 0) {
      // Discard edit, restore original text without re-rendering
      this._cancelEdit(id);
      return;
    }

    task.text = trimmed;
    this._persist();
    this._render();
  },

  // ── 6.3 Rendering ─────────────────────────────────────────────────────────

  _renderItem(task) {
    const li = document.createElement('li');
    li.dataset.id = task.id;
    li.className = 'todo-item';

    // Checkbox (completion toggle)
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = task.completed;
    checkbox.setAttribute('aria-label', 'Mark task complete');
    checkbox.addEventListener('change', () => this._toggle(task.id));

    // Text span
    const span = document.createElement('span');
    span.className = 'todo-text' + (task.completed ? ' completed' : '');
    span.textContent = task.text;
    // contentEditable starts as false (string 'false' keeps it non-editable)
    span.contentEditable = 'false';

    // Edit button
    const editBtn = document.createElement('button');
    editBtn.type = 'button';
    editBtn.className = 'todo-edit-btn';
    editBtn.textContent = 'Edit';
    editBtn.setAttribute('aria-label', 'Edit task');
    editBtn.addEventListener('click', () => {
      if (editBtn.dataset.editing) {
        this._saveEdit(task.id, span.textContent);
      } else {
        this._startEdit(task.id);
      }
    });

    // Delete button
    const deleteBtn = document.createElement('button');
    deleteBtn.type = 'button';
    deleteBtn.className = 'todo-delete-btn';
    deleteBtn.textContent = 'Delete';
    deleteBtn.setAttribute('aria-label', 'Delete task');
    deleteBtn.addEventListener('click', () => this._delete(task.id));

    li.appendChild(checkbox);
    li.appendChild(span);
    li.appendChild(editBtn);
    li.appendChild(deleteBtn);

    return li;
  },

  _render() {
    const list = document.getElementById('todo-list');
    if (!list) return;

    list.innerHTML = '';
    this.tasks.forEach(task => {
      list.appendChild(this._renderItem(task));
    });
  },

  init() {
    this.tasks = Storage.load(Storage.TASK_KEY);
    this._render();

    // Wire Add button
    const addBtn = document.getElementById('todo-add-btn');
    if (addBtn) {
      addBtn.addEventListener('click', () => {
        const input = document.getElementById('todo-input');
        if (input) this._add(input.value);
      });
    }

    // Wire Enter key on input
    const input = document.getElementById('todo-input');
    if (input) {
      input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
          this._add(input.value);
        }
      });
    }
  },
};

// ─── QuickLinks ──────────────────────────────────────────────────────────────

const QuickLinks = {

  // ── 7.1 Core data operations and validation ───────────────────────────────

  links: [],

  _validateLabel(label) {
    const trimmed = typeof label === 'string' ? label.trim() : '';
    return trimmed.length >= 1 && trimmed.length <= 50;
  },

  _validateUrl(url) {
    if (typeof url !== 'string') return false;
    return url.startsWith('http://') || url.startsWith('https://');
  },

  _add(label, url) {
    this._clearErrors();

    const trimmedLabel = typeof label === 'string' ? label.trim() : '';
    const labelValid   = this._validateLabel(label);
    const urlValid     = this._validateUrl(url);

    if (!labelValid) {
      this._showError('label', 'Label must be between 1 and 50 characters.');
    }
    if (!urlValid) {
      this._showError('url', 'URL must start with http:// or https://');
    }
    if (!labelValid || !urlValid) return;

    const link = {
      id: (typeof crypto !== 'undefined' && crypto.randomUUID)
            ? crypto.randomUUID()
            : Date.now().toString(),
      label: trimmedLabel,
      url: url,
    };
    this.links.push(link);
    this._persist();
    this._render();

    // Clear input fields after successful add
    const labelInput = document.getElementById('link-label');
    const urlInput   = document.getElementById('link-url');
    if (labelInput) labelInput.value = '';
    if (urlInput)   urlInput.value   = '';
  },

  _delete(id) {
    this.links = this.links.filter(l => l.id !== id);
    this._persist();
    this._render();
  },

  _open(url) {
    window.open(url, '_blank', 'noopener,noreferrer');
  },

  _persist() {
    Storage.save(Storage.LINK_KEY, this.links);
  },

  _showError(field, msg) {
    if (field === 'label') {
      const input = document.getElementById('link-label');
      const error = document.getElementById('link-label-error');
      if (input) input.setAttribute('aria-invalid', 'true');
      if (error) error.textContent = msg;
    } else if (field === 'url') {
      const input = document.getElementById('link-url');
      const error = document.getElementById('link-url-error');
      if (input) input.setAttribute('aria-invalid', 'true');
      if (error) error.textContent = msg;
    }
  },

  _clearErrors() {
    const labelInput = document.getElementById('link-label');
    const urlInput   = document.getElementById('link-url');
    const labelError = document.getElementById('link-label-error');
    const urlError   = document.getElementById('link-url-error');

    if (labelInput) labelInput.removeAttribute('aria-invalid');
    if (urlInput)   urlInput.removeAttribute('aria-invalid');
    if (labelError) labelError.textContent = '';
    if (urlError)   urlError.textContent   = '';
  },

  // ── 7.2 Rendering ────────────────────────────────────────────────────────

  _renderItem(link) {
    const container = document.createElement('div');
    container.className = 'link-item';
    container.dataset.id = link.id;

    // Open button — displays truncated label
    const openBtn = document.createElement('button');
    openBtn.type = 'button';
    openBtn.className = 'link-open-btn';
    openBtn.textContent = link.label.substring(0, 50);
    openBtn.setAttribute('aria-label', `Open ${link.label}`);
    openBtn.addEventListener('click', () => this._open(link.url));

    // Delete button
    const deleteBtn = document.createElement('button');
    deleteBtn.type = 'button';
    deleteBtn.className = 'link-delete-btn';
    deleteBtn.textContent = 'Delete';
    deleteBtn.setAttribute('aria-label', `Delete ${link.label}`);
    deleteBtn.addEventListener('click', () => this._delete(link.id));

    container.appendChild(openBtn);
    container.appendChild(deleteBtn);

    return container;
  },

  _render() {
    const list = document.getElementById('link-list');
    if (!list) return;

    list.innerHTML = '';
    this.links.forEach(link => {
      list.appendChild(this._renderItem(link));
    });
  },

  // ── Init ──────────────────────────────────────────────────────────────────

  init() {
    this.links = Storage.load(Storage.LINK_KEY);
    this._render();

    // Clear errors as the user types in either field
    const labelInput = document.getElementById('link-label');
    const urlInput   = document.getElementById('link-url');
    if (labelInput) labelInput.addEventListener('input', () => this._clearErrors());
    if (urlInput)   urlInput.addEventListener('input',   () => this._clearErrors());

    // Wire Add Link button
    const addBtn = document.getElementById('link-add-btn');
    if (addBtn) {
      addBtn.addEventListener('click', () => {
        const label = labelInput ? labelInput.value : '';
        const url   = urlInput   ? urlInput.value   : '';
        this._add(label, url);
      });
    }
  },
};

// ─── Bootstrap ───────────────────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', () => {
  Storage.init();
  GreetingWidget.init();
  FocusTimer.init();
  TodoList.init();
  QuickLinks.init();
});
