// DOM Elements
const taskInput = document.getElementById('taskInput');
const dueDateInput = document.getElementById('dueDateInput');
const addBtn = document.getElementById('addBtn');
const overdueList = document.getElementById('overdueList');
const pendingList = document.getElementById('pendingList');
const completedList = document.getElementById('completedList');
const notification = document.getElementById('notification');
const statsBtn = document.getElementById('statsBtn');
const statsModal = document.getElementById('statsModal');
const closeBtn = document.querySelector('.close');
const reminderTimeInput = document.getElementById('reminderTime');

// State
let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
let reminders = JSON.parse(localStorage.getItem('reminders')) || [];
let reminderCheckInterval = null;

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    renderTasks();
    setupEventListeners();
    initializeReminders();
});

// Event Listeners
function setupEventListeners() {
    addBtn.addEventListener('click', addTask);
    taskInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') addTask();
    });

    statsBtn.addEventListener('click', openStatsModal);
    closeBtn.addEventListener('click', closeStatsModal);
    window.addEventListener('click', (e) => {
        if (e.target === statsModal) closeStatsModal();
    });
    
    // Reminder event listener
    const setReminderBtn = document.getElementById('setReminderBtn');
    if (setReminderBtn) {
        setReminderBtn.addEventListener('click', setReminderForTasks);
    }
}

// Add Task
function addTask() {
    const text = taskInput.value.trim();
    const dueDate = dueDateInput.value;
    
    if (!text) {
        showNotification('Please enter a task', 'error');
        return;
    }

    const task = {
        id: Date.now(),
        text: text,
        completed: false,
        createdDate: new Date().toISOString(),
        completedDate: null,
        dueDate: dueDate ? new Date(dueDate).toISOString() : null
    };

    tasks.push(task);
    saveTasks();
    renderTasks();
    taskInput.value = '';
    dueDateInput.value = '';
    taskInput.focus();
    showNotification('Task added successfully!', 'success');
}

// Delete Task
function deleteTask(id) {
    if (confirm('Are you sure you want to delete this task?')) {
        tasks = tasks.filter(task => task.id !== id);
        saveTasks();
        renderTasks();
        showNotification('Task deleted', 'info');
    }
}

// Toggle Task Completion
function toggleTask(id) {
    const task = tasks.find(t => t.id === id);
    if (task) {
        task.completed = !task.completed;
        if (task.completed) {
            task.completedDate = new Date().toISOString();
            playSound();
            showNotification('✓ Great job! Task completed!', 'success');
        } else {
            task.completedDate = null;
        }
        saveTasks();
        renderTasks();
    }
}

// Edit Task
function editTask(id) {
    const task = tasks.find(t => t.id === id);
    if (!task) return;

    const newText = prompt('Edit your task:', task.text);
    if (newText === null) return; // User cancelled
    
    if (newText.trim()) {
        task.text = newText.trim();
    } else {
        showNotification('Task text cannot be empty', 'error');
        return;
    }

    const currentDueDate = task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : '';
    const newDueDate = prompt('Edit due date (YYYY-MM-DD) or leave empty:', currentDueDate);
    
    if (newDueDate !== null) {
        if (newDueDate.trim() === '') {
            task.dueDate = null;
        } else {
            const date = new Date(newDueDate);
            if (!isNaN(date.getTime())) {
                task.dueDate = date.toISOString();
            } else {
                showNotification('Invalid date format. Use YYYY-MM-DD', 'error');
                return;
            }
        }
    }

    saveTasks();
    renderTasks();
    showNotification('Task updated', 'info');
}

// Render Tasks
function renderTasks() {
    const now = new Date();
    
    // Categorize tasks
    const overdueTasks = tasks.filter(task => 
        !task.completed && task.dueDate && new Date(task.dueDate) < now
    );
    
    const pendingTasks = tasks.filter(task => 
        !task.completed && (!task.dueDate || new Date(task.dueDate) >= now)
    );
    
    const completedTasks = tasks.filter(task => task.completed);
    
    // Render each category
    renderTaskList(overdueList, overdueTasks, 'overdue');
    renderTaskList(pendingList, pendingTasks, 'pending');
    renderTaskList(completedList, completedTasks, 'completed');
    
    // Update stats
    updateStats();
}

// Helper function to render a task list
function renderTaskList(container, taskList, category) {
    if (taskList.length === 0) {
        const emptyMessage = category === 'overdue' ? 'No overdue tasks!' :
                           category === 'pending' ? 'No pending tasks. Add one to get started!' :
                           'No completed tasks yet.';
        container.innerHTML = `<p class="empty-message">${emptyMessage}</p>`;
        return;
    }

    // Sort tasks: overdue by due date (soonest first), others by creation date
    const sortedTasks = taskList.sort((a, b) => {
        if (category === 'overdue' && a.dueDate && b.dueDate) {
            return new Date(a.dueDate) - new Date(b.dueDate);
        }
        return new Date(b.createdDate) - new Date(a.createdDate);
    });

    container.innerHTML = sortedTasks
        .map(task => {
            const isOverdue = category === 'overdue';
            const dueDateDisplay = task.dueDate ? formatDate(task.dueDate) : 'No due date';
            const daysUntilDue = task.dueDate ? Math.ceil((new Date(task.dueDate) - new Date()) / (1000 * 60 * 60 * 24)) : null;
            
            return `
                <div class="todo-item ${task.completed ? 'completed' : ''} ${isOverdue ? 'overdue' : ''}">
                    <input 
                        type="checkbox" 
                        class="checkbox" 
                        ${task.completed ? 'checked' : ''}
                        onchange="toggleTask(${task.id})"
                    >
                    <div style="flex: 1;">
                        <p class="todo-text">${escapeHtml(task.text)}</p>
                        <p class="todo-date">Created: ${formatDate(task.createdDate)}</p>
                        ${task.dueDate ? `<p class="due-date ${isOverdue ? 'overdue-text' : daysUntilDue <= 1 ? 'due-soon' : ''}">Due: ${dueDateDisplay}${daysUntilDue !== null && daysUntilDue >= 0 ? ` (${daysUntilDue === 0 ? 'Today' : daysUntilDue === 1 ? 'Tomorrow' : `${daysUntilDue} days`})` : ''}</p>` : ''}
                    </div>
                    <div class="todo-actions">
                        <button class="edit-btn" onclick="editTask(${task.id})">Edit</button>
                        <button class="delete-btn" onclick="deleteTask(${task.id})">Delete</button>
                    </div>
                </div>
            `;
        })
        .join('');
}

// Save Tasks to LocalStorage
function saveTasks() {
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

// Show Notification
function showNotification(message, type = 'info') {
    notification.textContent = message;
    notification.className = `notification ${type} show`;

    setTimeout(() => {
        notification.classList.remove('show');
    }, 3000);
}

// Play Sound for Task Completion
function playSound() {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gain = audioContext.createGain();

    oscillator.connect(gain);
    gain.connect(audioContext.destination);

    oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
    oscillator.frequency.setValueAtTime(600, audioContext.currentTime + 0.1);

    gain.gain.setValueAtTime(0.3, audioContext.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.5);
}

// Format Date
function formatDate(dateString) {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
        return `Today at ${date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`;
    } else if (date.toDateString() === yesterday.toDateString()) {
        return 'Yesterday';
    } else {
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    }
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
gi
// Open Stats Modal
function openStatsModal() {
    statsModal.classList.add('show');
    updateStats();
}

// Close Stats Modal
function closeStatsModal() {
    statsModal.classList.remove('show');
}

// Update Statistics
function updateStats() {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const monthlyCompleted = tasks.filter(task => {
        if (!task.completedDate) return false;
        const completedDate = new Date(task.completedDate);
        return (
            completedDate.getMonth() === currentMonth &&
            completedDate.getFullYear() === currentYear
        );
    }).length;

    const totalTasks = tasks.length;
    const completionRate = totalTasks > 0 ? Math.round((monthlyCompleted / totalTasks) * 100) : 0;

    document.getElementById('monthlyCompleted').textContent = monthlyCompleted;
    document.getElementById('totalTasks').textContent = totalTasks;
    document.getElementById('completionRate').textContent = completionRate + '%';
}

// ==================== REMINDER FEATURE ====================

// Initialize Reminders on Load
function initializeReminders() {
    requestNotificationPermission();
    renderReminders();
    startReminderCheck();
    restoreReminderTime();
}

// Request Notification Permission
function requestNotificationPermission() {
    if ('Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission();
    }
}

// Set Reminder
function setReminderForTasks() {
    const timeValue = reminderTimeInput.value;
    
    if (!timeValue) {
        showNotification('Please select a reminder time', 'error');
        return;
    }

    const [hours, minutes] = timeValue.split(':').map(Number);
    
    const reminder = {
        id: Date.now(),
        time: timeValue,
        hours: hours,
        minutes: minutes,
        createdAt: new Date().toISOString(),
        triggered: false,
        completed: false
    };

    reminders.push(reminder);
    saveReminders();
    renderReminders();
    showNotification(`✓ Reminder set for ${timeValue}`, 'success');
}

// Start Reminder Check
function startReminderCheck() {
    // Clear existing interval
    if (reminderCheckInterval) {
        clearInterval(reminderCheckInterval);
    }

    // Check every 30 seconds
    reminderCheckInterval = setInterval(() => {
        const now = new Date();
        
        reminders.forEach(reminder => {
            if (!reminder.completed && !reminder.triggered) {
                if (now.getHours() === reminder.hours && now.getMinutes() === reminder.minutes) {
                    triggerReminder(reminder);
                }
            }
        });
    }, 30000); // Check every 30 seconds
}

// Trigger Reminder
function triggerReminder(reminder) {
    reminder.triggered = true;
    saveReminders();
    renderReminders();

    // Get active tasks count
    const activeTasks = tasks.filter(t => !t.completed);
    const taskCount = activeTasks.length;

    if (taskCount > 0) {
        playReminderSound();
        showNotification(
            `🔔 Reminder! You have ${taskCount} pending task(s)`,
            'info'
        );

        // Browser notification
        if ('Notification' in window && Notification.permission === 'granted') {
            new Notification('📝 Task Reminder', {
                body: `You have ${taskCount} pending task(s) to complete!`,
                icon: '🔔',
                tag: 'task-reminder',
                requireInteraction: true
            });
        }
    }
}

// Play Reminder Sound
function playReminderSound() {
    try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const notes = [523, 659, 784]; // C5, E5, G5 (Pleasant chord)

        notes.forEach((frequency, index) => {
            const oscillator = audioContext.createOscillator();
            const gain = audioContext.createGain();

            oscillator.connect(gain);
            gain.connect(audioContext.destination);

            const startTime = audioContext.currentTime + index * 0.15;
            oscillator.frequency.setValueAtTime(frequency, startTime);
            
            gain.gain.setValueAtTime(0.25, startTime);
            gain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.2);

            oscillator.start(startTime);
            oscillator.stop(startTime + 0.2);
        });
    } catch (e) {
        console.log('Audio context not available');
    }
}

// Render Reminders
function renderReminders() {
    const activeReminders = reminders.filter(r => !r.completed);
    const remindersDisplay = document.getElementById('activeReminders');

    if (!remindersDisplay) return; // Element not found

    if (activeReminders.length === 0) {
        remindersDisplay.innerHTML = '<p class="empty-msg">No reminders set</p>';
        return;
    }

    const reminderHTML = activeReminders
        .sort((a, b) => {
            const timeA = a.hours * 60 + a.minutes;
            const timeB = b.hours * 60 + b.minutes;
            return timeA - timeB;
        })
        .map(reminder => {
            const now = new Date();
            const reminderTime = new Date();
            reminderTime.setHours(reminder.hours, reminder.minutes, 0);
            
            const isOverdue = reminderTime < now && !reminder.triggered;
            const isPassed = reminder.triggered;

            return `
                <div class="reminder-card ${isPassed ? 'triggered' : 'active'}">
                    <div class="reminder-header">
                        <span class="reminder-title">📋 Task Reminder</span>
                        <span class="reminder-time-badge ${isOverdue ? 'overdue' : ''}">
                            ${reminder.time} ${isOverdue ? '⚠️' : ''}
                        </span>
                    </div>
                    <div class="reminder-info">
                        <span><span class="reminder-label">Set:</span> ${new Date(reminder.createdAt).toLocaleString()}</span>
                        <span><span class="reminder-label">Active Tasks:</span> ${tasks.filter(t => !t.completed).length}</span>
                    </div>
                    <div class="reminder-actions">
                        <button class="reminder-action-btn reminder-complete-btn" onclick="completeReminder(${reminder.id})">
                            ✓ Done
                        </button>
                        <button class="reminder-action-btn reminder-delete-btn" onclick="deleteReminder(${reminder.id})">
                            Delete
                        </button>
                    </div>
                </div>
            `;
        })
        .join('');

    remindersDisplay.innerHTML = reminderHTML;
}

// Complete Reminder
function completeReminder(id) {
    const reminder = reminders.find(r => r.id === id);
    if (reminder) {
        reminder.completed = true;
        saveReminders();
        renderReminders();
        showNotification('Reminder completed!', 'success');
    }
}

// Delete Reminder
function deleteReminder(id) {
    if (confirm('Delete this reminder?')) {
        reminders = reminders.filter(r => r.id !== id);
        saveReminders();
        renderReminders();
        showNotification('Reminder deleted', 'info');
    }
}

// Save Reminders to LocalStorage
function saveReminders() {
    localStorage.setItem('reminders', JSON.stringify(reminders));
}

// Restore Reminder Time Input
function restoreReminderTime() {
    const lastReminder = reminders.filter(r => !r.completed).pop();
    if (lastReminder && reminderTimeInput) {
        reminderTimeInput.value = lastReminder.time;
    }
}

// ==================== END REMINDER FEATURE ====================