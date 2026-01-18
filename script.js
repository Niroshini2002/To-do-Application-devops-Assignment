// DOM Elements
const taskInput = document.getElementById('taskInput');
const addBtn = document.getElementById('addBtn');
const todoList = document.getElementById('todoList');
const notification = document.getElementById('notification');
const statsBtn = document.getElementById('statsBtn');
const statsModal = document.getElementById('statsModal');
const closeBtn = document.querySelector('.close');

// State
let tasks = JSON.parse(localStorage.getItem('tasks')) || [];

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    renderTasks();
    setupEventListeners();
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
}

// Add Task
function addTask() {
    const text = taskInput.value.trim();
    if (!text) {
        showNotification('Please enter a task', 'error');
        return;
    }

    const task = {
        id: Date.now(),
        text: text,
        completed: false,
        createdDate: new Date().toISOString(),
        completedDate: null
    };

    tasks.push(task);
    saveTasks();
    renderTasks();
    taskInput.value = '';
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
    if (newText !== null && newText.trim()) {
        task.text = newText.trim();
        saveTasks();
        renderTasks();
        showNotification('Task updated', 'info');
    }
}

// Render Tasks
function renderTasks() {
    if (tasks.length === 0) {
        todoList.innerHTML = '<p class="empty-message">No tasks yet. Add one to get started!</p>';
        return;
    }

    todoList.innerHTML = tasks
        .sort((a, b) => new Date(b.createdDate) - new Date(a.createdDate))
        .map(task => `
            <div class="todo-item ${task.completed ? 'completed' : ''}">
                <input 
                    type="checkbox" 
                    class="checkbox" 
                    ${task.completed ? 'checked' : ''}
                    onchange="toggleTask(${task.id})"
                >
                <div style="flex: 1;">
                    <p class="todo-text">${escapeHtml(task.text)}</p>
                    <p class="todo-date">${formatDate(task.createdDate)}</p>
                </div>
                <div class="todo-actions">
                    <button class="edit-btn" onclick="editTask(${task.id})">Edit</button>
                    <button class="delete-btn" onclick="deleteTask(${task.id})">Delete</button>
                </div>
            </div>
        `)
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