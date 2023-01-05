"use strict";

// Pendings tasks harcoded.
const tasks = [
    {
        id: 'od1nwc1zq',
        title: 'Escribir código de alta calidad y eficiente. Implementación de funcionalidades nuevas y la solución de problemas complejos.',
        completed: false
    },
    {
        id: 'tg7566178',
        title: 'Implementar de actualizaciones y mejoras en el diseño. Incluir la creación de documentación.',
        completed: false
    }];

// Completed tasks hardcoded.
const tasksCompleted = [
    {
        id: '4a0usnp4o',
        title: 'Diseño y arquitectura de siguiente proyecto. identificación de requisitos del sistema, selección de tecnologías la definición de la estructura general de la aplicación.',
        completed: true
    },
    {
        id: 'glwkozgcw',
        title: 'Planificar y ejecutar proyecto de desarrollo de software. Estimación de tiempos y costos y la coordinación del trabajo del equipo.',
        completed: true
    },
    {
        id: 'x0cbfmyoe',
        title: 'Mejorar soft skills tales como comunicación efectiva, resolución de conflictos, participación en la revisión del seguimiento del código.',
        completed: true
    }
];
let time = 0;
let timer = null;
let timerBreak = null;
let current = null;
let isEditing = false;
let oldTitle = null;
let deleteExtraNumber = false;

// Referencia a elementos HTML
const bAdd = document.querySelector("#bAdd"); // Botón agregar tarea
const itTask = document.querySelector("#itTask"); // Input text
const form = document.querySelector("#form");
const taskName = document.querySelector("#time #taskName");
const timeDiv = document.querySelector("#time #value");
const noValue = document.querySelector('#noValueContainer');
const limitChar = document.querySelector('#limitCharContainer');
const space = document.querySelector('#space');
const letterCount = document.querySelector('#letterCount');

renderTime();
renderTasks();
renderTasksCompleted();

itTask.addEventListener("paste", (e) => {
    setTimeout(() => {
        letterCount.innerHTML = `${itTask.value.length} / 200`;
    }, 200)
})

itTask.addEventListener("keydown", (evt) => {
    let count = 0;
    evt = evt || window.event;
    let charCode = evt.keyCode || evt.which;

    if (charCode !== 32 && charCode !== 8 && charCode !== 17 && charCode !== 86 && charCode !== 37 && charCode !== 39) { // Ignoring space (charCode: 32) and delete button (charCode: 8) and Ctrl (charcode: 17).
        count = itTask.value.length + 1;
        console.log(count);
        if (count > 200) {
            letterCount.style.color = 'red';
        } else {
            letterCount.style.color = 'green';
        }
        letterCount.innerHTML = `${count} / 200`;
    }

    if (charCode === 8) { // Delete key
        if (itTask.value.length >= 1) {
            count = itTask.value.length - 1;
            console.log(count);
            letterCount.innerHTML = `${count} / 200`;
        }
        if (count > 200) {
            letterCount.style.color = 'red';
        } else {
            letterCount.style.color = 'green';
        }
    }
})

form.addEventListener("submit", (e) => {
    e.preventDefault();

    if (isEditing) {
        updateTask();
    } else {
        if (itTask.value.trim() !== "") {
            if (itTask.value.trim().length <= 200) {
                console.log(itTask.value.trim().length);
                var spanNoValue = document.querySelector('#noValueContainer #noValue');
                var spanLimitChar = document.querySelector('#limitCharContainer #limitChar');
                if (spanNoValue) {
                    spanNoValue.remove();
                    space.innerHTML = "";
                }
                if (spanLimitChar) {
                    spanLimitChar.remove();
                    space.innerHTML = "";
                }
                space.innerHTML = "";
                createTask(itTask.value);
                itTask.value = "";
                renderTasks();
                letterCount.innerHTML = `0 / 200`;
            } else {
                var spanNoValue = document.querySelector('#noValueContainer #noValue');
                if (spanNoValue) {
                    spanNoValue.remove();
                }
                console.log(itTask.value.trim().length);
                const br = '<br>';
                const html = `<span id="limitChar" class="limitCharValidation"> Límite de caracteres alcanzado. </span> <br id="space">`;
                limitChar.innerHTML = html;
                space.innerHTML = br;
            }
        } else {
            var spanLimitChar = document.querySelector('#limitCharContainer #limitChar');
            if (spanLimitChar) {
                spanLimitChar.remove();
            }
            const br = '<br>';
            const html = `<span id="noValue" class="noValueValidation"> Por favor, ingrese una nueva tarea. </span> <br id="space">`;
            noValue.innerHTML = html;
            space.innerHTML = br;
        }


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
            const tasktitle = tasks[index - 1].title;
            Swal.fire({
                title: '¿Estás seguro?',
                text: `Estás a punto de eliminar la tarea '${tasktitle}'`,
                icon: 'warning',
                showCancelButton: true,
                showCloseButton: true,
                confirmButtonColor: '#BA0F30',
                cancelButtonColor: '748DA6',
                confirmButtonText: 'Eliminar',
                reverseButtons: true
            }).then((result) => {
                if (result.value) {
                    tasks.splice(index - 1, 1);
                    Swal.fire({
                        position: 'top-end',
                        icon: 'success',
                        title: 'La tarea ha sido eliminada...',
                        showConfirmButton: false,
                        timer: 1500
                    });
                    renderTasks();
                }
            });
        });
    });

    // Editing a task
    editButtons.forEach((editBtn) => {
        editBtn.addEventListener("click", (e) => {
            const id = editBtn.getAttribute("data-id");
            const index = tasks.findIndex((task) => task.id == id);
            itTask.value = tasks[index].title;
            letterCount.innerHTML = `${tasks[index].title.length} / 200`;
            oldTitle = itTask.value;
            isEditing = true;
            bAdd.value = "Actualizar";
            taskName.textContent = `${oldTitle}`;
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
    letterCount.innerHTML = `0 / 200`;
}

function renderTasksCompleted() {

    // Current date
    var today = new Date();
    var dayOfWeek = String(today.getDay());
    var dd = String(today.getDate()).padStart(2, '0');
    var mm = String(today.getMonth()); //January is 0!
    var yyyy = today.getFullYear();

    console.log(mm);

    const months = {
        0: 'Enero',
        1: 'Febrero',
        2: 'Marzo',
        3: 'Abril',
        4: 'Mayo',
        5: 'Junio',
        6: 'Julio',
        7: 'Agosto',
        9: 'Septiembre',
        10: 'Noviembre',
        11: 'Diciembre'
    };

    const week = {
        0: 'Domingo',
        1: 'Lunes',
        2: 'Martes',
        3: 'Miércoles',
        4: 'Jueves',
        5: 'Viernes',
        6: 'Sábado'
    }

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
    // Formato: Lunes, 2 de Enero 2023.. ${week[dayOfWeek]}, ${dd} de ${months[mm]} ${yyyy}
    titleCompleted.innerHTML = `<div class="tasks-completed-title">
                                    Tareas Completadas
                                    <div class="last-update">Última actualización: ${week[dayOfWeek]}, ${dd} de ${months[mm]} ${yyyy}</div>
                                    
                                </div>`;
}
