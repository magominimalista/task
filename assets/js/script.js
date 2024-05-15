const taskInput = document.getElementById("new-task");
const addButton = document.getElementById("add-task");
const taskList = document.getElementById("task-list");
const searchInput = document.getElementById("search-task");
const filterStatusSelect = document.getElementById("filter-status");
const exportBtn = document.getElementById("export-btn");

addButton.addEventListener("click", addTask);
taskList.addEventListener("click", handleTaskClick);
searchInput.addEventListener("input", filterTasks);
filterStatusSelect.addEventListener("change", filterTasksStatus);
exportBtn.addEventListener("click", exportTasks);

taskInput.addEventListener("keyup", function (event) {
  if (event.key === "Enter") {
    addTask();
  }
});

function updateProgressBar() {
  // Recuperar as tarefas salvas do armazenamento local
  const tasks = JSON.parse(localStorage.getItem("tasks")) || [];

  // Contar o número total de tarefas e o número de tarefas concluídas
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((task) => task.completed).length;

  // Calcular o percentual de progresso
  const progressPercent =
    totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

  // Verificar se a barra de progresso já existe no documento
  const progressBar = document.querySelector(".progress");
  if (progressBar) {
    // Se a barra de progresso existir, atualize sua largura com base na porcentagem de progresso
    progressBar.style.width = progressPercent + "%";
  } else {
    // Caso contrário, crie a barra de progresso e defina sua largura com base na porcentagem de progresso
    const newProgressBar = document.createElement("div");
    newProgressBar.classList.add("progress");
    newProgressBar.style.width = progressPercent + "%";
    document.body.appendChild(newProgressBar); // Adicione a barra de progresso ao corpo do documento
  }
}

function updateProgressBarOnLoad() {
  // Recuperar as tarefas salvas do armazenamento local
  const tasks = JSON.parse(localStorage.getItem("tasks")) || [];

  // Contar o número total de tarefas e o número de tarefas concluídas
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((task) => task.completed).length;

  // Calcular o percentual de progresso
  const progressPercent =
    totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

  // Atualizar a largura da barra de progresso
  const progressBar = document.querySelector(".progress");
  progressBar.style.width = progressPercent + "%";
}

// Carregar tarefas ao iniciar
loadTasks();
updateProgressBar();

function loadTasks() {
  const tasks = JSON.parse(localStorage.getItem("tasks")) || [];
  const emptyTaskList = document.getElementById("empty-task-list");

  if (tasks.length === 0) {
    emptyTaskList.style.display = "flex"; // Mostra a div se a lista estiver vazia
    taskList.style.display = "none"; // Esconde a lista de tarefas se estiver vazia
  } else {
    emptyTaskList.style.display = "none";
    taskList.style.display = "block"; // Mostra a lista de tarefas se houver tarefas

    tasks.forEach((task) => {
      const li = createTaskElement(task);
      if (task.completed) {
        li.classList.add("completed"); // Adiciona a classe "completed" se a tarefa estiver concluída
      }
      taskList.appendChild(li);
    });
    tasks.reverse();
    updateProgressBarOnLoad();
  }
}

// Chamando a função ao carregar a página
window.addEventListener("load", updateProgressBarOnLoad);

function handleTaskClick(event) {
  const target = event.target;
  const taskItem = target.closest("li");

  // Verifica o tipo de elemento clicado e delega a ação apropriada
  switch (true) {
    case target.tagName === "INPUT":
      toggleTaskCompleted(target);
      break;
    case target.classList.contains("delete"):
      deleteTask(target.parentElement);
      break;
    case target.classList.contains("edit"):
      editTask(target.parentElement);
      break;
    case target.classList.contains("category"):
      updateCategory(target);
      break;
    case target.classList.contains("edit"):
      openTaskModal(taskItem); // Abre o modal para editar a tarefa
      break;
  }
  updateProgressBar();
}

function toggleTaskCompleted(checkbox) {
  const categorySelect = checkbox.parentElement.querySelector(".category");
  const bolElement = checkbox.parentElement.querySelector(".bol");

  checkbox.parentElement.classList.toggle("completed");

  if (checkbox.checked) {
    categorySelect.value = "done";
    bolElement.classList.remove("todo", "doing");
    bolElement.classList.add("done");
  } else {
    categorySelect.value =
      categorySelect.value === "done" ? "todo" : categorySelect.value;
    bolElement.classList.remove("done");
    bolElement.classList.add(categorySelect.value);
  }

  saveTasks();
  updateProgressBar();
}

function deleteTask(taskItem) {
  taskItem.classList.add("deleting"); // Adiciona a classe para iniciar a animação
  setTimeout(() => {
    taskItem.remove();
    saveTasks();
    updateProgressBar();

    // Verifica se a lista está vazia após a remoção
    if (taskList.children.length === 0) {
      location.reload(); // Recarrega a página se a lista estiver vazia
    }
  }, 500); // Tempo da animação (500ms)
}

function updateCategory(categorySelect) {
  const bolElement = categorySelect.parentElement.querySelector(".bol");
  bolElement.classList.remove("todo", "doing", "done");
  bolElement.classList.add(categorySelect.value);
  saveTasks();
}

function createTaskElement(task) {
  const li = document.createElement("li");

  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  checkbox.checked = task.completed;
  li.appendChild(checkbox);

  const span = document.createElement("span");
  span.textContent = task.text;
  li.appendChild(span);

  const categoryContainer = document.createElement("div");
  categoryContainer.classList.add("category-container");
  li.appendChild(categoryContainer);

  const bolElement = document.createElement("div");
  bolElement.classList.add("bol", task.category);
  categoryContainer.appendChild(bolElement);

  const categorySelect = document.createElement("select");
  categorySelect.classList.add("category");
  ["todo", "doing", "done"].forEach((category) => {
    const option = document.createElement("option");
    option.value = category;
    option.textContent = category[0].toUpperCase() + category.slice(1);
    option.classList.add(category);
    categorySelect.appendChild(option);
  });
  categorySelect.value = task.category;

  categoryContainer.appendChild(categorySelect);

  const editButton = document.createElement("button");
  editButton.innerHTML = '<i class="fa-regular fa-pen-to-square"></i> Editar';
  editButton.classList.add("edit");
  li.appendChild(editButton);

  const deleteButton = document.createElement("button");
  deleteButton.innerHTML = '<i class="fa-regular fa-trash-can"></i> Excluir';
  deleteButton.classList.add("delete");
  li.appendChild(deleteButton);

  return li;
}

function saveTasks() {
  const tasks = [];
  const listItems = taskList.querySelectorAll("li");

  listItems.forEach((item) => {
    tasks.push({
      text: item.querySelector("span").textContent,
      completed: item.querySelector("input").checked,
      category: item.querySelector(".category").value, // Salva a categoria
    });
  });

  localStorage.setItem("tasks", JSON.stringify(tasks));
}

function editTask(taskItem) {
  const taskSpan = taskItem.querySelector("span");
  const originalText = taskSpan.textContent;
  const bolElement = taskItem.querySelector(".bol");
  const categorySelect = taskItem.querySelector(".category");

  // Armazena o event listener
  const changeEventListener = function () {
    bolElement.classList.remove("todo", "doing", "done");
    bolElement.classList.add(this.value);
    saveTasks();
  };
  categorySelect.removeEventListener("change", changeEventListener); // Remove o antigo listener

  // Cria um input para edição
  const editInput = document.createElement("input");
  editInput.type = "text";
  editInput.value = originalText;
  taskSpan.replaceWith(editInput);
  editInput.focus();

  // Salva a edição ao pressionar Enter
  editInput.addEventListener("keyup", function (event) {
    if (event.key === "Enter") {
      const newText = editInput.value.trim();
      if (newText !== "") {
        taskSpan.textContent = newText;
        editInput.replaceWith(taskSpan);
        bolElement.classList.remove("todo", "doing", "done");
        bolElement.classList.add(categorySelect.value);
        saveTasks();

        // Readiciona o event listener após a edição ser concluída
        categorySelect.addEventListener("change", changeEventListener);
      }
    }
  });

  // Salva a edição ao perder o foco
  editInput.addEventListener("blur", function () {
    const newText = editInput.value.trim();
    if (newText !== "") {
      taskSpan.textContent = newText;
      editInput.replaceWith(taskSpan);
      bolElement.classList.remove("todo", "doing", "done");
      bolElement.classList.add(categorySelect.value);
      saveTasks();

      // Readiciona o event listener após a edição ser concluída
      categorySelect.addEventListener("change", changeEventListener);
    }
  });
}

function addTask() {
  const taskText = taskInput.value.trim();
  if (taskText !== "") {
    const li = document.createElement("li");
    li.innerHTML = `
              <input type="checkbox">
              <span>${taskText}</span>
              <div class="category-container">
                  <select class="category">
                      <option value="todo" class="todo">Todo</option>
                      <option value="doing" class="doing">Doing</option>
                      <option value="done" class="done">Done</option>
                  </select>
              </div>
              <button class="edit"><i class="fa-regular fa-pen-to-square"></i> Editar</button>
              <button class="delete"><i class="fa-regular fa-trash-can"></i> Excluir</button>
          `;

    // Cria a bolinha e adiciona ao container da categoria
    const bolElement = document.createElement("div");
    bolElement.classList.add("bol", "todo"); // Adiciona a classe "todo" inicialmente
    const categoryContainer = li.querySelector(".category-container");
    categoryContainer.insertBefore(bolElement, categoryContainer.firstChild);

    const categorySelect = li.querySelector(".category");
    categorySelect.value = "todo"; // Inicia a categoria como "todo"

    categorySelect.addEventListener("change", function () {
      // Remove a classe antiga e adiciona a nova
      bolElement.classList.remove("todo", "doing", "done");
      bolElement.classList.add(this.value);

      saveTasks();
      updateProgressBar();
    });

    taskList.prepend(li);
    taskInput.value = "";

    saveTasks();
    updateProgressBar();

    const emptyTaskList = document.getElementById("empty-task-list");
    emptyTaskList.style.display =
      taskList.children.length > 0 ? "none" : "flex";

    if (taskList.children.length > 0) {
      filterStatusSelect.addEventListener("change", filterTasksStatus);
    }
  }
  if (taskList.children.length === 1) {
    // Verifica se agora há 1 item na lista
    location.reload();
  }
}

function filterTasksStatus() {
  const filterCategory = filterStatusSelect.value;
  const tasks = taskList.querySelectorAll("li");

  // Verifica se a lista está vazia
  if (tasks.length === 0) {
    return; // Não faz nada se a lista estiver vazia
  }

  tasks.forEach((task) => {
    const taskCategory = task.querySelector(".category").value;

    // Mostra a tarefa se a categoria corresponder ao filtro ou se o filtro for "all"
    const showTask =
      filterCategory === "all" || filterCategory === taskCategory;

    task.style.display = showTask ? "flex" : "none";
  });
}

function filterTasks() {
  const searchTerm = searchInput.value.toLowerCase();
  const tasks = taskList.querySelectorAll("li");

  tasks.forEach((task) => {
    const taskText = task.querySelector("span").textContent.toLowerCase();
    task.style.display = taskText.includes(searchTerm) ? "flex" : "none";
  });
}

function exportTasks() {
  const tasks = JSON.parse(localStorage.getItem("tasks")) || [];

  // Verifica se há pelo menos uma tarefa
  if (tasks.length > 0) {
    let tasksText = "TAREFAS\n";

    tasks.forEach((task) => {
      tasksText += `- [${task.completed ? "x" : " "}] ${task.text}\n`;
    });

    const blob = new Blob([tasksText], { type: "text/plain;charset=utf-8" });
    saveAs(blob, "tarefas.txt");
  } else {
    alert("Adicione pelo menos uma tarefa antes de exportar.");
  }
}

const screenshotBtn = document.getElementById("screenshot-btn");

screenshotBtn.addEventListener("click", () => {
  const screenshotContainer = document.createElement("div");
  screenshotContainer.appendChild(
    document.querySelector(".container").cloneNode(true)
  );
  document.body.appendChild(screenshotContainer); // Adiciona o container ao body

  screenshotContainer.style.width = "860px";
  html2canvas(screenshotContainer)
    .then((canvas) => {
      // Passa o screenshotContainer para html2canvas
      const base64Image = canvas.toDataURL("image/png");

      const link = document.createElement("a");
      link.href = base64Image;
      link.download = "screenshot.png";
      link.click();
    })
    .finally(() => {
      screenshotContainer.remove(); // Remove o container após a captura
    });
});

document.addEventListener("DOMContentLoaded", function () {
  // Recupera o tema salvo
  const savedTheme = localStorage.getItem("theme");

  // Se houver um tema salvo, aplica-o
  if (savedTheme) {
    const theme = document.getElementById("theme");
    theme.setAttribute("href", savedTheme);
  }
});

function toggleTheme() {
  const theme = document.getElementById("theme");

  if (theme.getAttribute("href") === "assets/css/dark.css") {
    theme.setAttribute("href", "assets/css/light.css");
    // Salva o tema escolhido no armazenamento local
    localStorage.setItem("theme", "assets/css/light.css");
  } else {
    theme.setAttribute("href", "assets/css/dark.css");
    // Salva o tema escolhido no armazenamento local
    localStorage.setItem("theme", "assets/css/dark.css");
  }
}
