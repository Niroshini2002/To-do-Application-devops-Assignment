Deva nivethitha Thiyagaraja - ITBIN-2313-0075- Role: Developer
Niroshini Sachithananthan - ITBIN-2313-0074- Role: DevOps Engineer

This is a mobile-friendly todo list application that helps users manage their daily tasks with the following capabilities:
 1) CRUD Operations: Add, view, edit, and delete tasks
 2) Smart Filtering: View all tasks, only active ones, or completed ones
 3) Reminders: Set daily reminder times with audio/visual notifications
 4) Monthly Stats: Track how many tasks you completed this month
 5) Clean, modern gradient UI optimized for mobile devices

 

<!-- Reminder Section -->
        <div class="reminder-section">
            <label for="reminderTime">Set Reminder:</label>
            <input type="time" id="reminderTime">
            <button class="reminder-btn" id="setReminderBtn">🔔 Set Reminder</button>
        </div>


        .reminder-section input {
    padding: 8px 12px;
    border: 2px solid #667eea;
    border-radius: 6px;
    font-size: 14px;
}



// Set Reminder
function setReminder() {
    const timeValue = reminderTimeInput.value;
    if (!timeValue) {
        showNotification('Please select a time for reminder', 'error');
        return;
    }

    const [hours, minutes] = timeValue.split(':').map(Number);
    const now = new Date();
    const reminderTime = new Date();
    reminderTime.setHours(hours, minutes, 0);

    // If the time has passed, set it for tomorrow
    if (reminderTime < now) {
        reminderTime.setDate(reminderTime.getDate() + 1);
    }

    const timeUntilReminder = reminderTime - now;

    // Clear existing reminders
    reminderIntervals.forEach(interval => clearInterval(interval));
    reminderIntervals = [];

    // Set the reminder
    const interval = setInterval(() => {
        checkAndTriggerReminder(hours, minutes);
    }, 1000); // Check every second

    reminderIntervals.push(interval);
    showNotification(`Reminder set for ${timeValue}`, 'info');
}

// Check and Trigger Reminder
function checkAndTriggerReminder(hours, minutes) {
    const now = new Date();
    if (now.getHours() === hours && now.getMinutes() === minutes) {
        const activeTasks = tasks.filter(t => !t.completed);
        if (activeTasks.length > 0) {
            playReminderSound();
            showNotification(
                `⏰ Reminder! You have ${activeTasks.length} pending task(s)`,
                'info'
            );

            // Request notification permission if available
            if ('Notification' in window && Notification.permission === 'granted') {
                new Notification('Todo List Reminder', {
                    body: `You have ${activeTasks.length} pending task(s)!`,
                    icon: '📝'
                });
            }
        }
    }
}

// Check Reminders on Page Load
function checkReminders() {
    // Request notification permission
    if ('Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission();
    }

    // Check every minute
    setInterval(() => {
        const now = new Date();
        checkAndTriggerReminder(now.getHours(), now.getMinutes());
    }, 60000);
}

// Play Reminder Sound
function playReminderSound() {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const notes = [523, 659, 784]; // C5, E5, G5 (musical notes)

    notes.forEach((frequency, index) => {
        const oscillator = audioContext.createOscillator();
        const gain = audioContext.createGain();

        oscillator.connect(gain);
        gain.connect(audioContext.destination);

        const startTime = audioContext.currentTime + index * 0.15;
        oscillator.frequency.setValueAtTime(frequency, startTime);

        gain.gain.setValueAtTime(0.2, startTime);
        gain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.2);

        oscillator.start(startTime);
        oscillator.stop(startTime + 0.2);
    });
}




