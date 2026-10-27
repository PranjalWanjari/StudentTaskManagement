
const API_URL = "https://student-task-management.co-2023-prwanjari.workers.dev/api/tasks";

const taskForm = document.getElementById("taskForm");
const taskTitle = document.getElementById("taskTitle");
const taskList = document.getElementById("taskList");
const taskCount = document.getElementById("taskCount");

// Fetch and display all tasks
async function loadTasks() {
    try {
        const response = await fetch(API_URL);

        if (!response.ok) {
            throw new Error("Unable to load tasks");
        }

        const tasks = await response.json();

        displayTasks(tasks);
    } catch (error) {
        taskList.innerHTML = `
            <p class="empty-message">
                Unable to connect to the server. Please try again.
            </p>
        `;

        console.error(error);
    }
}

// Display tasks on the page
function displayTasks(tasks) {
    taskList.innerHTML = "";

    taskCount.textContent = `${tasks.length} Tasks`;

    if (tasks.length === 0) {
        taskList.innerHTML = `
            <p class="empty-message">
                No tasks available. Add your first task!
            </p>
        `;
        return;
    }

    tasks.forEach(task => {
        const taskItem = document.createElement("div");
        taskItem.className = "task-item";

        const taskInfo = document.createElement("div");
        taskInfo.className = "task-info";

        if (task.completed) {
            taskInfo.classList.add("completed");
        }

        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.checked = task.completed;

        checkbox.addEventListener("change", () => {
            updateTask(task.id, checkbox.checked);
        });

        const title = document.createElement("span");
        title.textContent = task.title;

        taskInfo.appendChild(checkbox);
        taskInfo.appendChild(title);

        const deleteButton = document.createElement("button");
        deleteButton.textContent = "Delete";
        deleteButton.className = "delete-btn";

        deleteButton.addEventListener("click", () => {
            deleteTask(task.id);
        });

        taskItem.appendChild(taskInfo);
        taskItem.appendChild(deleteButton);

        taskList.appendChild(taskItem);
    });
}

// Add a new task
taskForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const title = taskTitle.value.trim();

    if (!title) {
        alert("Please enter a task!");
        return;
    }

    try {
        const response = await fetch(API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ title: title })
        });

        if (!response.ok) {
            throw new Error("Unable to add task");
        }

        taskTitle.value = "";

        await loadTasks();
    } catch (error) {
        alert("Unable to add task. Please try again.");
        console.error(error);
    }
});

// Update task completion status
async function updateTask(id, completed) {
    try {
        const response = await fetch(`${API_URL}/${id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ completed: completed })
        });

        if (!response.ok) {
            throw new Error("Unable to update task");
        }

        await loadTasks();
    } catch (error) {
        alert("Unable to update task.");
        console.error(error);
    }
}

// Delete a task
async function deleteTask(id) {
    const confirmDelete = confirm("Are you sure you want to delete this task?");

    if (!confirmDelete) {
        return;
    }

    try {
        const response = await fetch(`${API_URL}/${id}`, {
            method: "DELETE"
        });

        if (!response.ok) {
            throw new Error("Unable to delete task");
        }

        await loadTasks();
    } catch (error) {
        alert("Unable to delete task.");
        console.error(error);
    }
}

// Load tasks when the page opens
loadTasks();

