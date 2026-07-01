// Local Storage Keys
const LOCAL_STORAGE_LIST_KEY = 'zentodo.lists';
const LOCAL_STORAGE_SELECTED_LIST_ID_KEY = 'zentodo.selectedListId';
const LOCAL_STORAGE_TASKS_KEY = 'zentodo.tasks';
const LOCAL_STORAGE_COMPLETED_COLLAPSED_KEY = 'zentodo.completedCollapsed';

// State Variables
let lists = JSON.parse(localStorage.getItem(LOCAL_STORAGE_LIST_KEY)) || [];
let selectedListId = localStorage.getItem(LOCAL_STORAGE_SELECTED_LIST_ID_KEY);
let tasks = JSON.parse(localStorage.getItem(LOCAL_STORAGE_TASKS_KEY)) || [];
let completedCollapsed = JSON.parse(localStorage.getItem(LOCAL_STORAGE_COMPLETED_COLLAPSED_KEY)) || false;

// UI State Filters & Sorting
let currentFilter = 'all'; // 'all', 'active', 'completed'
let currentSort = 'none'; // 'none', 'date-asc', 'date-desc', 'priority-desc', 'alphabetical-asc'
let searchQuery = '';

// Seed Data if LocalStorage is Empty
const defaultLists = [
  { id: 'l-1', name: 'Work' },
  { id: 'l-2', name: 'Personal' },
  { id: 'l-3', name: 'Fitness' }
];

const defaultTasks = [
  {
    id: 't-1',
    listId: 'l-1',
    title: 'Review landing page design layout',
    completed: false,
    datetime: getFutureDateTimeString(2), // 2 hours from now
    priority: 'high'
  },
  {
    id: 't-2',
    listId: 'l-1',
    title: 'Prepare presentation slides for weekly sync',
    completed: false,
    datetime: getFutureDateTimeString(24), // tomorrow
    priority: 'medium'
  },
  {
    id: 't-3',
    listId: 'l-1',
    title: 'Archive old repository branches',
    completed: true,
    datetime: '',
    priority: 'low'
  },
  {
    id: 't-4',
    listId: 'l-2',
    title: 'Buy fresh ingredients for dinner recipe',
    completed: false,
    datetime: getFutureDateTimeString(6), // 6 hours from now
    priority: 'medium'
  },
  {
    id: 't-5',
    listId: 'l-3',
    title: 'Morning cardio session',
    completed: true,
    datetime: getFutureDateTimeString(-4), // 4 hours ago
    priority: 'high'
  }
];

function getFutureDateTimeString(hoursAhead) {
  const date = new Date();
  date.setHours(date.getHours() + hoursAhead);
  
  // Format to YYYY-MM-DDTHH:MM for datetime-local
  const tzOffset = date.getTimezoneOffset() * 60000; // offset in milliseconds
  const localISOTime = (new Date(date - tzOffset)).toISOString().slice(0, 16);
  return localISOTime;
}

// Seed helper
function seedInitialData() {
  if (lists.length === 0) {
    lists = defaultLists;
    tasks = defaultTasks;
    selectedListId = 'l-1';
    save();
  }
}

// DOM Elements - Sidebar
const listsContainer = document.getElementById('lists-container');
const newListForm = document.getElementById('new-list-form');
const newListInput = document.getElementById('new-list-input');

// DOM Elements - Header & controls
const activeListTitle = document.getElementById('active-list-title');
const progressText = document.getElementById('progress-text');
const progressBarFill = document.getElementById('progress-bar-fill');
const searchInput = document.getElementById('search-input');
const deleteListBtn = document.getElementById('delete-list-btn');

// DOM Elements - New Task Form
const newTaskForm = document.getElementById('new-task-form');
const taskTitleInput = document.getElementById('task-title-input');
const taskDatetimeInput = document.getElementById('task-datetime-input');
const priorityOptions = document.getElementsByName('priority');

// DOM Elements - Display
const activeTasksList = document.getElementById('active-tasks-list');
const completedTasksList = document.getElementById('completed-tasks-list');
const completedSection = document.getElementById('completed-section');
const completedCount = document.getElementById('completed-count');
const completedToggleBtn = document.getElementById('completed-toggle-btn');
const emptyState = document.getElementById('empty-state');

// DOM Elements - Filters / Sort
const filterBtns = document.querySelectorAll('.filter-btn');
const sortSelect = document.getElementById('sort-select');

// DOM Elements - Edit Modal
const editModal = document.getElementById('edit-modal');
const editTaskForm = document.getElementById('edit-task-form');
const editTaskId = document.getElementById('edit-task-id');
const editTaskTitle = document.getElementById('edit-task-title');
const editTaskDatetime = document.getElementById('edit-task-datetime');
const editTaskList = document.getElementById('edit-task-list');
const closeModalBtn = document.getElementById('close-modal-btn');
const cancelEditBtn = document.getElementById('cancel-edit-btn');


// --- State Management ---
function save() {
  localStorage.setItem(LOCAL_STORAGE_LIST_KEY, JSON.stringify(lists));
  localStorage.setItem(LOCAL_STORAGE_SELECTED_LIST_ID_KEY, selectedListId);
  localStorage.setItem(LOCAL_STORAGE_TASKS_KEY, JSON.stringify(tasks));
  localStorage.setItem(LOCAL_STORAGE_COMPLETED_COLLAPSED_KEY, JSON.stringify(completedCollapsed));
}

// --- Helper Functions ---
function getActiveList() {
  return lists.find(list => list.id === selectedListId) || lists[0];
}

function formatDate(dateTimeStr) {
  if (!dateTimeStr) return '';
  const date = new Date(dateTimeStr);
  
  // Format options
  const options = { 
    month: 'short', 
    day: 'numeric', 
    hour: '2-digit', 
    minute: '2-digit'
  };
  return date.toLocaleDateString(undefined, options);
}

function isOverdue(task) {
  if (task.completed || !task.datetime) return false;
  return new Date(task.datetime) < new Date();
}


// --- Rendering Logic ---
function render() {
  seedInitialData();
  
  // Safety check for active list
  const activeList = getActiveList();
  if (activeList) {
    selectedListId = activeList.id;
    activeListTitle.textContent = activeList.name;
    deleteListBtn.classList.remove('hidden');
  } else {
    activeListTitle.textContent = 'No Lists Found';
    deleteListBtn.classList.add('hidden');
  }

  renderLists();
  renderTasks();
}

function renderLists() {
  listsContainer.innerHTML = '';
  
  lists.forEach(list => {
    const listTasks = tasks.filter(task => task.listId === list.id && !task.completed);
    
    const li = document.createElement('li');
    li.classList.add('list-item');
    if (list.id === selectedListId) {
      li.classList.add('active');
    }
    li.dataset.listId = list.id;

    li.innerHTML = `
      <div class="list-item-left">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="8" y1="6" x2="21" y2="6"></line>
          <line x1="8" y1="12" x2="21" y2="12"></line>
          <line x1="8" y1="18" x2="21" y2="18"></line>
          <line x1="3" y1="6" x2="3.01" y2="6"></line>
          <line x1="3" y1="12" x2="3.01" y2="12"></line>
          <line x1="3" y1="18" x2="3.01" y2="18"></line>
        </svg>
        <span class="list-title">${escapeHtml(list.name)}</span>
      </div>
      <span class="list-count">${listTasks.length}</span>
    `;

    li.addEventListener('click', () => {
      selectedListId = list.id;
      currentFilter = 'all';
      // Reset active filter button styling
      filterBtns.forEach(btn => {
        if (btn.dataset.filter === 'all') btn.classList.add('active');
        else btn.classList.remove('active');
      });
      save();
      render();
    });

    listsContainer.appendChild(li);
  });
}

function renderTasks() {
  activeTasksList.innerHTML = '';
  completedTasksList.innerHTML = '';
  
  if (!selectedListId) {
    activeTasksList.innerHTML = '';
    completedTasksList.innerHTML = '';
    completedSection.classList.add('hidden');
    emptyState.style.display = 'flex';
    updateProgress(0, 0);
    return;
  }

  // Filter tasks to match selected list
  let filteredTasks = tasks.filter(task => task.listId === selectedListId);
  const totalTasks = filteredTasks.length;
  const completedTasksCount = filteredTasks.filter(t => t.completed).length;
  
  updateProgress(completedTasksCount, totalTasks);

  // Search filter
  if (searchQuery.trim() !== '') {
    filteredTasks = filteredTasks.filter(task => 
      task.title.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }

  // Completion status filter
  if (currentFilter === 'active') {
    filteredTasks = filteredTasks.filter(task => !task.completed);
  } else if (currentFilter === 'completed') {
    filteredTasks = filteredTasks.filter(task => task.completed);
  }

  // Sorting
  const sortedTasks = sortTasksList(filteredTasks);

  // Render individual tasks
  let activeCount = 0;
  let compCount = 0;

  sortedTasks.forEach(task => {
    const taskEl = createTaskDOMElement(task);
    
    if (task.completed) {
      completedTasksList.appendChild(taskEl);
      compCount++;
    } else {
      activeTasksList.appendChild(taskEl);
      activeCount++;
    }
  });

  // Completed toggle details
  completedCount.textContent = compCount;
  if (compCount > 0 && currentFilter !== 'active') {
    completedSection.classList.remove('hidden');
    if (completedCollapsed) {
      completedTasksList.classList.add('collapsed');
      completedToggleBtn.classList.remove('open');
    } else {
      completedTasksList.classList.remove('collapsed');
      completedToggleBtn.classList.add('open');
    }
  } else {
    completedSection.classList.add('hidden');
  }

  // Empty state visual check
  if (activeCount === 0 && compCount === 0) {
    emptyState.style.display = 'flex';
  } else {
    emptyState.style.display = 'none';
  }
}

function updateProgress(completed, total) {
  progressText.textContent = `${completed} of ${total} completed`;
  const percentage = total === 0 ? 0 : Math.round((completed / total) * 100);
  progressBarFill.style.width = `${percentage}%`;
}

function sortTasksList(tasksList) {
  const priorityWeight = { high: 3, medium: 2, low: 1 };
  const listCopy = [...tasksList];

  switch (currentSort) {
    case 'date-asc':
      return listCopy.sort((a, b) => {
        if (a.datetime && b.datetime) return new Date(a.datetime) - new Date(b.datetime);
        if (a.datetime) return -1;
        if (b.datetime) return 1;
        return 0;
      });
      
    case 'date-desc':
      return listCopy.sort((a, b) => {
        if (a.datetime && b.datetime) return new Date(b.datetime) - new Date(a.datetime);
        if (a.datetime) return -1;
        if (b.datetime) return 1;
        return 0;
      });
      
    case 'priority-desc':
      return listCopy.sort((a, b) => priorityWeight[b.priority] - priorityWeight[a.priority]);
      
    case 'alphabetical-asc':
      return listCopy.sort((a, b) => a.title.localeCompare(b.title));
      
    case 'none':
    default:
      return listCopy; // Creation order (default)
  }
}

function createTaskDOMElement(task) {
  const div = document.createElement('div');
  div.classList.add('task-item');
  div.classList.add(`priority-${task.priority}-card`);
  if (task.completed) {
    div.classList.add('completed');
  }

  // Overdue status check
  const overdue = isOverdue(task);
  const formattedDate = formatDate(task.datetime);

  let dateBadgeHtml = '';
  if (task.datetime) {
    dateBadgeHtml = `
      <span class="task-date-tag ${overdue ? 'overdue' : ''}">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10"></circle>
          <polyline points="12 6 12 12 16 14"></polyline>
        </svg>
        ${formattedDate} ${overdue ? '(Overdue)' : ''}
      </span>
    `;
  }

  div.innerHTML = `
    <div class="task-item-left">
      <label class="checkbox-container">
        <input type="checkbox" ${task.completed ? 'checked' : ''} class="task-checkbox">
        <span class="checkmark"></span>
      </label>
      <div class="task-text-container">
        <span class="task-title">${escapeHtml(task.title)}</span>
        <div class="task-meta-row">
          ${dateBadgeHtml}
          <span class="task-priority-badge ${task.priority}">${task.priority}</span>
        </div>
      </div>
    </div>
    <div class="task-actions">
      <button class="task-btn edit-btn" title="Edit Task">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
          <path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
        </svg>
      </button>
      <button class="task-btn delete-btn" title="Delete Task">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="3 6 5 6 21 6"></polyline>
          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
        </svg>
      </button>
    </div>
  `;

  // Attach Event listeners dynamically to buttons inside the task
  const checkbox = div.querySelector('.task-checkbox');
  checkbox.addEventListener('change', () => {
    task.completed = checkbox.checked;
    save();
    render();
  });

  const editBtn = div.querySelector('.edit-btn');
  editBtn.addEventListener('click', () => {
    openEditModal(task);
  });

  const deleteBtn = div.querySelector('.delete-btn');
  deleteBtn.addEventListener('click', () => {
    tasks = tasks.filter(t => t.id !== task.id);
    save();
    render();
  });

  return div;
}

// Safe Escaping helper to avoid XSS injections
function escapeHtml(text) {
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return text.replace(/[&<>"']/g, m => map[m]);
}


// --- Event Listeners setup ---

// Add List form
newListForm.addEventListener('submit', e => {
  e.preventDefault();
  const listName = newListInput.value.trim();
  if (!listName) return;

  const newList = {
    id: 'l-' + Date.now(),
    name: listName
  };

  lists.push(newList);
  selectedListId = newList.id;
  newListInput.value = '';
  save();
  render();
});

// Delete Active List
deleteListBtn.addEventListener('click', () => {
  if (!selectedListId) return;
  
  if (confirm('Are you sure you want to delete the current list and all its tasks?')) {
    lists = lists.filter(list => list.id !== selectedListId);
    tasks = tasks.filter(task => task.listId !== selectedListId);
    
    if (lists.length > 0) {
      selectedListId = lists[0].id;
    } else {
      selectedListId = null;
    }
    
    save();
    render();
  }
});

// Add Task Form Submit
newTaskForm.addEventListener('submit', e => {
  e.preventDefault();
  const title = taskTitleInput.value.trim();
  if (!title || !selectedListId) return;

  const datetime = taskDatetimeInput.value;
  
  let priority = 'low';
  for (const option of priorityOptions) {
    if (option.checked) {
      priority = option.value;
      break;
    }
  }

  const newTask = {
    id: 't-' + Date.now(),
    listId: selectedListId,
    title: title,
    completed: false,
    datetime: datetime,
    priority: priority
  };

  tasks.push(newTask);
  
  // Reset fields
  taskTitleInput.value = '';
  taskDatetimeInput.value = '';
  priorityOptions[0].checked = true; // reset to low priority

  save();
  render();
});

// Search Input Listener
searchInput.addEventListener('input', e => {
  searchQuery = e.target.value;
  renderTasks();
});

// Filter click selectors
filterBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    filterBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    currentFilter = btn.dataset.filter;
    renderTasks();
  });
});

// Sort select dropdown change
sortSelect.addEventListener('change', e => {
  currentSort = e.target.value;
  renderTasks();
});

// Completed Section toggle click
completedToggleBtn.addEventListener('click', () => {
  completedCollapsed = !completedCollapsed;
  save();
  renderTasks();
});


// --- Edit Modal Controls ---
function openEditModal(task) {
  editTaskId.value = task.id;
  editTaskTitle.value = task.title;
  editTaskDatetime.value = task.datetime || '';
  
  // Check radio buttons for priority
  document.getElementById(`edit-prio-${task.priority === 'medium' ? 'med' : task.priority}`).checked = true;

  // Populate Select List options
  editTaskList.innerHTML = '';
  lists.forEach(list => {
    const opt = document.createElement('option');
    opt.value = list.id;
    opt.textContent = list.name;
    if (list.id === task.listId) {
      opt.selected = true;
    }
    editTaskList.appendChild(opt);
  });

  editModal.classList.add('open');
}

function closeEditModal() {
  editModal.classList.remove('open');
  editTaskForm.reset();
}

// Edit Modal Form submit handler
editTaskForm.addEventListener('submit', e => {
  e.preventDefault();
  const id = editTaskId.value;
  const task = tasks.find(t => t.id === id);
  if (!task) return;

  const editPrioOptions = document.getElementsByName('edit-priority');
  let selectedPriority = 'low';
  for (const option of editPrioOptions) {
    if (option.checked) {
      selectedPriority = option.value;
      break;
    }
  }

  task.title = editTaskTitle.value.trim();
  task.datetime = editTaskDatetime.value;
  task.priority = selectedPriority;
  task.listId = editTaskList.value;

  closeEditModal();
  save();
  render();
});

// Close buttons for modal
closeModalBtn.addEventListener('click', closeEditModal);
cancelEditBtn.addEventListener('click', closeEditModal);

// Close modal when clicking outside contents
window.addEventListener('click', e => {
  if (e.target === editModal) {
    closeEditModal();
  }
});


// --- App Init ---
seedInitialData();
render();
