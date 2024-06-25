// Retrieve tasks and nextId from localStorage
let taskList = JSON.parse(localStorage.getItem("tasks")) || [];
let nextId = JSON.parse(localStorage.getItem("nextId")) || 1;

// Function to generate a unique task id
function generateTaskId() {
  return nextId++;
}

// Function to create a task card
function createTaskCard(task) {
  const cardColor = getTaskColor(task);
  const card = `<div class="card mb-3 task-card" id="task-${task.id}" data-id="${task.id}" style="border-left: 5px solid ${cardColor}">
                  <div class="card-body">
                    <h5 class="card-title">${task.title}</h5>
                    <p class="card-text">${task.description}</p>
                    <p class="card-text">${task.dueDate}</p>
                    <button type="button" class="btn btn-danger delete-task">Delete</button>
                  </div>
                </div>`;
  return card;
}

// Function to get task color based on due date
function getTaskColor(task) {
  const dueDate = new Date(task.dueDate);
  const today = new Date();
  const diffTime = dueDate - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); // calculate and give me a number, it will always give you the smallest intiger and give you 1. (ex 1.1 = 2)
  if (diffDays <= 0) {
    return "red"; // overdue
  } else if (diffDays <= 5) {
    return "yellow"; // nearing deadline
  } else {
    return "green"; // in progress
  }
}

// Function to render the task list and make cards draggable
function renderTaskList() {
  $("#todo-cards").empty();
  $("#in-progress-cards").empty();
  $("#done-cards").empty();

  taskList.forEach((task) => {
    const card = createTaskCard(task);
    switch (task.status) {
      case "todo":
        $("#todo-cards").append(card);
        break;
      case "inProgress":
        $("#in-progress-cards").append(card);
        break;
      case "done":
        $("#done-cards").append(card);
        break;
    }
  });

  // Make cards draggable
  $(".task-card").draggable({
    revert: "invalid",
    cursor: "move",
    start: handleDragStart,
    stop: handleDragStop,
  });
}

// Function to handle adding a new task
function handleAddTask(event) {
  event.preventDefault();
  const task = {
    id: generateTaskId(),
    title: $("#task-name").val(),
    description: $("#message-text").val(),
    dueDate: $("#datepicker").val(),
    status: "todo",
  };
  taskList.push(task);
  localStorage.setItem("tasks", JSON.stringify(taskList));
  localStorage.setItem("nextId", JSON.stringify(nextId));
  renderTaskList();
  $("#exampleModal").modal("hide");
}

// Function to handle deleting a task
function handleDeleteTask(event) {
  const taskId = $(this).closest(".task-card").data("id");
  taskList = taskList.filter((task) => task.id !== taskId);
  localStorage.setItem("tasks", JSON.stringify(taskList));
  renderTaskList();
}

// Function to handle dropping a task into a new status lane
function handleDrop(event, ui) {
  const taskId = ui.draggable.data("id");
  let newStatus;
  switch ($(this).attr("id")) {
    case "in-progress":
      newStatus = "inProgress";
      break;
    case "done":
      newStatus = "done";
      break;
    default:
      newStatus = "todo";
  }
  const taskIndex = taskList.findIndex((task) => task.id === taskId);
  taskList[taskIndex].status = newStatus;
  localStorage.setItem("tasks", JSON.stringify(taskList));
  renderTaskList();
}

// Function to handle starting dragging tasks
function handleDragStart(event, ui) {
  $(this).css("z-index", 1000); // Set higher z-index while dragging
}

// Function to handle stopping dragging tasks
function handleDragStop(event, ui) {
  $(this).css("z-index", ""); // Reset z-index after dragging
}

// Event listener for adding a new task
$("#modal-submit").click(handleAddTask);

// Event listener for deleting a task
$(document).on("click", ".delete-task", handleDeleteTask);

// When the page loads, render the task list, add event listeners, make lanes droppable, and make the due date field a date picker
$(document).ready(function () {
  renderTaskList();
  $(".lane").droppable({
    accept: ".task-card",
    drop: handleDrop,
  });
});

$(function () {
  $("#datepicker").datepicker();
});
