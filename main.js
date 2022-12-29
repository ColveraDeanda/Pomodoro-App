"use strict";

const tasks = [];
const tasksCompleted = [];
let time = 0;
let timer = null;
let timerBreak = null;
let current = null;
let isEditing = false;
let oldTitle = null;

// Referencia a elementos HTML
const bAdd = document.querySelector("#bAdd"); // Botón agregar tarea
const itTask = document.querySelector("#itTask"); // Input text
const form = document.querySelector("#form");
const taskName = document.querySelector("#time #taskName");
const timeDiv = document.querySelector("#time #value");

renderTime();

form.addEventListener("submit", (e) => {
    e.preventDefault();

    if (isEditing) {
        updateTask();
    } else {
        if (itTask.value !== "") {
            createTask(itTask.value);
            itTask.value = "";
        }
        renderTasks();
    }
});

function createTask(value) {
    const newTask = {
        id: (Math.random() * 100).toString(36).slice(3),
        title: value,
        completed: false,
    };
    tasks.unshift(newTask); // unshift() Adds one or more elements to the beginning of an array
}

function renderTasks() {
    let count = 0;
    let html = tasks.map((task) => {
        count++;
        return `
        <div class="task">
            <div class="completed">${task.completed
                ? `<span><img src="img/check.png" alt="Task Completed" width="40" height="40"></span>`
                : `<button class="start-button" data-id="${task.id}">Empezar</button> <button class="delete" data-count="${count}"><img src="img/garbage.png" alt="Delete Task"></button> <button class="edit" data-id="${task.id}"><img src="img/edit.png" alt="Edit Task"></button>`
            }</div>
            <div class="title">${task.title}</div>
        </div>
        `;
    });

    const tasksContainer = document.querySelector("#tasks");
    tasksContainer.innerHTML = html.join("");

    // Agregando el evento a los botones creados de la plantilla.
    const startButtons = document.querySelectorAll(".task .start-button");
    const deleteButtons = document.querySelectorAll(".task .delete");
    const editButtons = document.querySelectorAll(".task .edit");

    if (current) {
        // Setting disabled option for start buttons when task is in progress
        disableStartButton(startButtons);
        disableStartButton(deleteButtons);
        disableStartButton(editButtons);
    }

    startButtons.forEach((button) => {
        button.addEventListener("click", (e) => {
            if (!timer) {
                const id = button.getAttribute("data-id");
                startButtonHandler(id);
                button.innerHTML = `
                <div class="progress-btn active" data-progress-style="indefinite-circle">
                    <div class="btn">Buttoooon</div>
                    <svg class="progress circle-loader" width="40" height="40" version="1.1" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="20" cy="20" r="10">
                    </svg>
                </div>
                `;

                // Setting disabled option when task is in progress
                const disabledProperty = document.createAttribute("disabled");
                const classDisabledInput = document.createAttribute("class");
                classDisabledInput.value = "input-disabled";
                const classDisabledButton = document.createAttribute("class");
                classDisabledButton.value = "button-disabled";

                itTask.setAttributeNode(disabledProperty); // HTML disabled for input.
                itTask.setAttributeNode(classDisabledInput); // CSS disabled for input.
                bAdd.setAttributeNode(classDisabledButton); // css disabled for button

                // Deshabilitando los botones
                disableStartButton(startButtons);
                disableStartButton(deleteButtons);
                disableStartButton(editButtons);
            }
        });
    });

    // Deleting a task
    deleteButtons.forEach((deleteBtn) => {
        deleteBtn.addEventListener("click", (e) => {
            const index = deleteBtn.getAttribute("data-count");
            tasks.splice(index - 1, 1);
            renderTasks();
        });
    });

    // Editing a task
    editButtons.forEach((editBtn) => {
        editBtn.addEventListener("click", (e) => {
            const id = editBtn.getAttribute("data-id");
            const index = tasks.findIndex((task) => task.id == id);
            itTask.value = tasks[index].title;
            oldTitle = itTask.value;
            isEditing = true;
            bAdd.value = "Update";
            taskName.textContent = `Updating task: ${oldTitle}`;
        });
    });
}

function startButtonHandler(id) {
    time = 5;
    current = id;
    const taskIndex = tasks.findIndex((task) => task.id === id);
    taskName.textContent = tasks[taskIndex].title;
    renderTime();
    timer = setInterval(() => {
        timeHandler(id);
    }, 1000);
}

function timeHandler(id) {
    time--;
    renderTime();

    if (time === 0) {
        clearInterval(timer);
        markCompleted(id);
        renderTasks();
        timer = null;
        startBreak();
    }
}

function renderTime() {
    const minutes = parseInt(time / 60);
    const seconds = parseInt(time % 60);

    timeDiv.textContent = `${minutes < 10 ? "0" : ""}${minutes} : ${seconds < 10 ? "0" : ""
        }${seconds}`;
}

function markCompleted(id) {
    let taskIndex = tasks.findIndex((task) => task.id === id);
    tasks[taskIndex].completed = true;
    tasksCompleted.unshift(tasks[taskIndex]);
    tasks.splice(taskIndex, 1);
    renderTasks();
    renderTasksCompleted();
}

function startBreak() {
    time = 3;
    taskName.textContent = "Break";
    renderTime();
    timerBreak = setInterval(() => {
        timerBreakHandler();
    }, 1000);
}

function timerBreakHandler() {
    time--;
    renderTime();

    if (time === 0) {
        clearInterval(timerBreak);
        current = null;
        renderTasks();
        timerBreak = null;
        taskName.textContent = "";
        itTask.removeAttribute("disabled");
        itTask.classList.remove("input-disabled");
        bAdd.classList.remove("button-disabled");
    }
}

function disableStartButton(startButtons) {
    startButtons.forEach((startBtn) => {
        startBtn.classList.add("button-disabled");
    });
}

function updateTask() {
    let index = tasks.findIndex((task) => task.title == oldTitle);
    tasks[index].title = itTask.value;
    renderTasks();
    isEditing = false;
    bAdd.value = "Agregar tarea";
    oldTitle = null;
    itTask.value = "";
    taskName.textContent = "";
}

function renderTasksCompleted() {
    const html = tasksCompleted.map(task => {
        return `
        <div class="task">
            <div class="completed">
                <span><img src="img/check.png" alt="Task Completed" width="40" height="40"></span>
            </div>
            <div class="title-completed">${task.title}</div>
        </div>
        `;
    });

    const tasksCompletedContainer = document.querySelector('#tasksCompleted');
    const titleCompleted = document.querySelector('#title-completed');
    const titleIncompleted = document.querySelector('#title-incompleted');

    titleIncompleted.textContent = '';
    tasksCompletedContainer.innerHTML = html.join('');
    titleCompleted.innerHTML = '<div class="tasks-completed-title">Tareas Completadas:</div>'
}
