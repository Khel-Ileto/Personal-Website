document.addEventListener("DOMContentLoaded", function () {
  // DOM Elements
  const programForm = document.getElementById("program-form");
  const exercisesContainer = document.getElementById("exercises-container");
  const addExerciseBtn = document.getElementById("add-exercise");
  const programList = document.getElementById("program-list");
  const workoutLogger = document.getElementById("workout-logger");
  const workoutLogForm = document.getElementById("workout-log-form");
  const exerciseLogs = document.getElementById("exercise-logs");
  const workoutHistory = document.getElementById("workout-history");
  const cancelLogBtn = document.getElementById("cancel-log");
  const editWorkoutModal = new bootstrap.Modal(
    document.getElementById("editWorkoutModal")
  );
  const editProgramModal = new bootstrap.Modal(
    document.getElementById("editProgramModal")
  );
  const editWorkoutForm = document.getElementById("edit-workout-form");
  const editExerciseLogs = document.getElementById("edit-exercise-logs");
  const editProgramForm = document.getElementById("edit-program-form");
  const editExercisesContainer = document.getElementById(
    "edit-exercises-container"
  );
  const viewWorkoutModal = new bootstrap.Modal(
    document.getElementById("viewWorkoutModal")
  );

  // Load saved data
  let programs = JSON.parse(localStorage.getItem("workoutPrograms")) || [];
  let workoutLogs = JSON.parse(localStorage.getItem("workoutLogs")) || [];

  // Add exercise field for program creation
  function addExerciseField(container, values = null) {
    const exerciseDiv = document.createElement("div");
    exerciseDiv.className =
      "exercise-input mb-3 p-3 border border-secondary rounded";
    exerciseDiv.innerHTML = `
            <div class="form-group mb-2">
                <label class="text-light">Exercise Name</label>
                <input type="text" class="form-control bg-secondary text-light exercise-name" 
                    placeholder="Enter exercise name (e.g., Bench Press)" required
                    value="${values ? values.name : ""}">
            </div>
            <div class="form-group mb-2">
                <label class="text-light">Notes (optional)</label>
                <input type="text" class="form-control bg-secondary text-light exercise-notes" 
                    placeholder="Add exercise notes (e.g., Rest 2 mins between sets)"
                    value="${values ? values.notes || "" : ""}">
            </div>
            <button type="button" class="btn btn-danger btn-sm remove-exercise">Remove Exercise</button>
        `;
    container.appendChild(exerciseDiv);

    exerciseDiv
      .querySelector(".remove-exercise")
      .addEventListener("click", () => exerciseDiv.remove());
  }

  // Create set input fields
  function createSetInputs(setIndex, weightUnit = "kg", values = null) {
    return `
            <div class="set-log row mb-3 align-items-center">
                <div class="col-auto">
                    <span class="text-light">Set ${setIndex + 1}</span>
                </div>
                <div class="col">
                    <div class="row">
                        <div class="col">
                            <input type="number" class="form-control bg-secondary text-light reps-done" 
                                placeholder="Reps" min="1" required
                                value="${values ? values.reps : ""}">
                        </div>
                        <div class="col">
                            <div class="input-group">
                                <input type="number" class="form-control bg-secondary text-light weight-used" 
                                    placeholder="Weight" step="0.5" min="0" required
                                    value="${values ? values.weight : ""}">
                                <span class="input-group-text bg-secondary text-light weight-unit-label" 
                                      onclick="toggleWeightUnit(this)">${weightUnit}</span>
                            </div>
                        </div>
                        <div class="col-auto">
                            <button type="button" class="btn btn-danger btn-sm remove-set">×</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
  }

  // Toggle weight unit
  window.toggleWeightUnit = function (element) {
    element.textContent = element.textContent === "kg" ? "lbs" : "kg";
  };

  // Save program
  function saveProgram(e) {
    e.preventDefault();
    const exercises = [];
    exercisesContainer
      .querySelectorAll(".exercise-input")
      .forEach((exerciseDiv) => {
        exercises.push({
          name: exerciseDiv.querySelector(".exercise-name").value,
          notes: exerciseDiv.querySelector(".exercise-notes").value,
        });
      });

    const program = {
      id: Date.now().toString(),
      name: document.getElementById("program-name").value,
      exercises: exercises,
    };

    programs.push(program);
    localStorage.setItem("workoutPrograms", JSON.stringify(programs));
    programForm.reset();
    exercisesContainer.innerHTML = "";
    addExerciseField(exercisesContainer);
    renderProgramList();
  }

  // Delete program
  window.deleteProgram = function (programId) {
    if (confirm("Are you sure you want to delete this program?")) {
      programs = programs.filter((p) => p.id !== programId);
      localStorage.setItem("workoutPrograms", JSON.stringify(programs));
      workoutLogs = workoutLogs.filter((log) => log.programId !== programId);
      localStorage.setItem("workoutLogs", JSON.stringify(workoutLogs));
      renderProgramList();
      renderWorkoutHistory();
    }
  };

  // Edit program
  window.editProgram = function (programId) {
    const program = programs.find((p) => p.id === programId);
    document.getElementById("edit-program-name").value = program.name;
    editExercisesContainer.innerHTML = "";

    program.exercises.forEach((exercise) => {
      addExerciseField(editExercisesContainer, exercise);
    });

    editProgramForm.dataset.programId = programId;
    editProgramModal.show();
  };

  // Save edited program
  function saveEditedProgram(e) {
    e.preventDefault();
    const programId = editProgramForm.dataset.programId;
    const programIndex = programs.findIndex((p) => p.id === programId);

    const exercises = [];
    editExercisesContainer
      .querySelectorAll(".exercise-input")
      .forEach((exerciseDiv) => {
        exercises.push({
          name: exerciseDiv.querySelector(".exercise-name").value,
          notes: exerciseDiv.querySelector(".exercise-notes").value,
        });
      });

    programs[programIndex] = {
      ...programs[programIndex],
      name: document.getElementById("edit-program-name").value,
      exercises: exercises,
    };

    localStorage.setItem("workoutPrograms", JSON.stringify(programs));
    editProgramModal.hide();
    renderProgramList();
  }

  // Start workout logging
  window.startWorkoutLog = function (e) {
    const programId = e.target.dataset.programId;
    const program = programs.find((p) => p.id === programId);

    workoutLogger.style.display = "block";
    document.getElementById("logging-program-name").textContent = program.name;
    exerciseLogs.innerHTML = "";

    program.exercises.forEach((exercise) => {
      const exerciseLog = document.createElement("div");
      exerciseLog.className =
        "exercise-log mb-4 p-3 border border-secondary rounded";

      exerciseLog.innerHTML = `
            <div class="exercise-header mb-3">
                <input type="text" class="form-control bg-secondary text-light mb-2" 
                       value="${exercise.name}" placeholder="Exercise name">
                ${
                  exercise.notes
                    ? `<p class="text-light small mb-1">Notes: ${exercise.notes}</p>`
                    : ""
                }
                <button type="button" class="btn btn-danger btn-sm remove-exercise-log mb-2">Remove Exercise</button>
            </div>
            <div class="sets-container"></div>
            <button type="button" class="btn btn-secondary btn-sm add-set">Add Set</button>
        `;

      const setsContainer = exerciseLog.querySelector(".sets-container");
      setsContainer.innerHTML = createSetInputs(0);

      // Add remove exercise handler
      exerciseLog
        .querySelector(".remove-exercise-log")
        .addEventListener("click", () => {
          if (exerciseLogs.children.length > 1) {
            exerciseLog.remove();
          } else {
            alert("You must have at least one exercise in your workout.");
          }
        });

      // Add set button handler
      function renumberSets(setsContainer) {
        setsContainer.querySelectorAll(".set-log").forEach((setLog, index) => {
          setLog.querySelector(".col-auto span").textContent = `Set ${
            index + 1
          }`;
        });
      }

      // Modify the add set button handler in startWorkoutLog function
      exerciseLog.querySelector(".add-set").addEventListener("click", () => {
        const setsContainer = exerciseLog.querySelector(".sets-container");
        const setCount = setsContainer.children.length;
        const setHtml = createSetInputs(setCount); // This still passes the current count for initial creation
        const wrapper = document.createElement("div");
        wrapper.innerHTML = setHtml;
        setsContainer.appendChild(wrapper.firstElementChild);
        renumberSets(setsContainer); // Renumber after adding
      });

      // Modify the remove set handler in startWorkoutLog function
      setsContainer.addEventListener("click", (e) => {
        if (e.target.classList.contains("remove-set")) {
          const setLog = e.target.closest(".set-log");
          if (setsContainer.children.length > 1) {
            setLog.remove();
            renumberSets(setsContainer); // Renumber after removing
          }
        }
      });

      exerciseLogs.appendChild(exerciseLog);
    });

    // Add the "Add Exercise" button after the exercise logs
    const addExerciseBtn = document.createElement("button");
    addExerciseBtn.type = "button";
    addExerciseBtn.className = "btn btn-secondary btn-sm";
    addExerciseBtn.textContent = "Add Exercise";
    addExerciseBtn.addEventListener("click", () => {
      const exerciseLog = document.createElement("div");
      exerciseLog.className =
        "exercise-log mb-4 p-3 border border-secondary rounded";

      exerciseLog.innerHTML = `
          <div class="exercise-header mb-3">
              <input type="text" class="form-control bg-secondary text-light mb-2" 
                     placeholder="Exercise name" required>
              <button type="button" class="btn btn-danger btn-sm remove-exercise-log mb-2">Remove Exercise</button>
          </div>
          <div class="sets-container">
              ${createSetInputs(0)}
          </div>
          <button type="button" class="btn btn-secondary btn-sm add-set">Add Set</button>
      `;

      // Add remove exercise handler
      exerciseLog
        .querySelector(".remove-exercise-log")
        .addEventListener("click", () => {
          if (exerciseLogs.children.length > 1) {
            exerciseLog.remove();
          } else {
            alert("You must have at least one exercise in your workout.");
          }
        });

      // Add set button handler
      exerciseLog.querySelector(".add-set").addEventListener("click", () => {
        const setsContainer = exerciseLog.querySelector(".sets-container");
        const setCount = setsContainer.children.length;
        const setHtml = createSetInputs(setCount);
        const wrapper = document.createElement("div");
        wrapper.innerHTML = setHtml;
        setsContainer.appendChild(wrapper.firstElementChild);
      });

      // Remove set handler
      exerciseLog
        .querySelector(".sets-container")
        .addEventListener("click", (e) => {
          if (e.target.classList.contains("remove-set")) {
            const setLog = e.target.closest(".set-log");
            if (
              exerciseLog.querySelector(".sets-container").children.length > 1
            ) {
              setLog.remove();
            }
          }
        });

      exerciseLogs.appendChild(exerciseLog);
    });

    exerciseLogs.after(addExerciseBtn);

    workoutLogForm.dataset.programId = programId;

    const today = new Date().toISOString().split("T")[0];
    document.getElementById("workout-date").value = today;
  };
  // Save workout log
  function saveWorkoutLog(e) {
    e.preventDefault();
    const exercises = [];

    exerciseLogs.querySelectorAll(".exercise-log").forEach((exerciseLog) => {
      const sets = [];
      exerciseLog.querySelectorAll(".set-log").forEach((setLog) => {
        sets.push({
          reps: parseInt(setLog.querySelector(".reps-done").value),
          weight: parseFloat(setLog.querySelector(".weight-used").value),
          weightUnit: setLog.querySelector(".weight-unit-label").textContent,
        });
      });

      exercises.push({
        name: exerciseLog.querySelector(".exercise-header input").value,
        sets: sets,
      });
    });

    const workoutLog = {
      id: Date.now().toString(),
      programId: workoutLogForm.dataset.programId,
      date: document.getElementById("workout-date").value,
      exercises: exercises,
    };

    workoutLogs.push(workoutLog);
    localStorage.setItem("workoutLogs", JSON.stringify(workoutLogs));
    workoutLogForm.reset();
    workoutLogger.style.display = "none";
    renderWorkoutHistory();
  }

  // Edit workout
  window.editWorkout = function (logId) {
    const log = workoutLogs.find((l) => l.id === logId);

    document.getElementById("edit-workout-date").value = log.date;
    editExerciseLogs.innerHTML = "";

    log.exercises.forEach((exercise) => {
      const exerciseLog = document.createElement("div");
      exerciseLog.className =
        "exercise-log mb-4 p-3 border border-secondary rounded";

      exerciseLog.innerHTML = `
                <div class="exercise-header mb-3">
                    <input type="text" class="form-control bg-secondary text-light mb-2" 
                           value="${exercise.name}" placeholder="Exercise name">
                    <button type="button" class="btn btn-danger btn-sm remove-exercise-log mb-2">Remove Exercise</button>
                </div>
                <div class="sets-container"></div>
                <button type="button" class="btn btn-secondary btn-sm add-set">Add Set</button>
            `;

      const setsContainer = exerciseLog.querySelector(".sets-container");
      exercise.sets.forEach((set, index) => {
        setsContainer.innerHTML += createSetInputs(index, set.weightUnit, set);
      });

      // Add remove exercise handler
      exerciseLog
        .querySelector(".remove-exercise-log")
        .addEventListener("click", () => {
          if (editExerciseLogs.children.length > 1) {
            exerciseLog.remove();
          } else {
            alert("You must have at least one exercise in your workout.");
          }
        });

      // Add set button handler
      function renumberSets(setsContainer) {
        setsContainer.querySelectorAll(".set-log").forEach((setLog, index) => {
          setLog.querySelector(".col-auto span").textContent = `Set ${
            index + 1
          }`;
        });
      }

      // Modify the add set button handler in startWorkoutLog function
      exerciseLog.querySelector(".add-set").addEventListener("click", () => {
        const setsContainer = exerciseLog.querySelector(".sets-container");
        const setCount = setsContainer.children.length;
        const setHtml = createSetInputs(setCount); // This still passes the current count for initial creation
        const wrapper = document.createElement("div");
        wrapper.innerHTML = setHtml;
        setsContainer.appendChild(wrapper.firstElementChild);
        renumberSets(setsContainer); // Renumber after adding
      });

      // Modify the remove set handler in startWorkoutLog function
      setsContainer.addEventListener("click", (e) => {
        if (e.target.classList.contains("remove-set")) {
          const setLog = e.target.closest(".set-log");
          if (setsContainer.children.length > 1) {
            setLog.remove();
            renumberSets(setsContainer); // Renumber after removing
          }
        }
      });

      editExerciseLogs.appendChild(exerciseLog);
    });

    editWorkoutForm.dataset.logId = logId;
    editWorkoutModal.show();
  };

  // Save edited workout
  function saveEditedWorkout() {
    const logId = editWorkoutForm.dataset.logId;
    const logIndex = workoutLogs.findIndex((l) => l.id === logId);
    const log = workoutLogs[logIndex];

    const exercises = [];
    editExerciseLogs
      .querySelectorAll(".exercise-log")
      .forEach((exerciseLog) => {
        const sets = [];
        exerciseLog.querySelectorAll(".set-log").forEach((setLog) => {
          sets.push({
            reps: parseInt(setLog.querySelector(".reps-done").value),
            weight: parseFloat(setLog.querySelector(".weight-used").value),
            weightUnit: setLog.querySelector(".weight-unit-label").textContent,
          });
        });

        exercises.push({
          name: exerciseLog.querySelector(".exercise-header input").value,
          sets: sets,
        });
      });

    workoutLogs[logIndex] = {
      ...log,
      date: document.getElementById("edit-workout-date").value,
      exercises: exercises,
    };

    localStorage.setItem("workoutLogs", JSON.stringify(workoutLogs));
    editWorkoutModal.hide();
    renderWorkoutHistory();
  }

  // Delete workout
  window.deleteWorkout = function (logId) {
    if (confirm("Are you sure you want to delete this workout log?")) {
      workoutLogs = workoutLogs.filter((l) => l.id !== logId);
      localStorage.setItem("workoutLogs", JSON.stringify(workoutLogs));
      renderWorkoutHistory();
    }
  };

  // View workout
  window.viewWorkout = function (logId) {
    const log = workoutLogs.find((l) => l.id === logId);
    const program = programs.find((p) => p.id === log.programId);

    document.getElementById("view-workout-date").textContent = new Date(
      log.date
    ).toLocaleDateString();
    document.getElementById("view-workout-program").textContent = program
      ? program.name
      : "Deleted Program";

    const viewExerciseLogs = document.getElementById("view-exercise-logs");
    viewExerciseLogs.innerHTML = "";

    log.exercises.forEach((exercise) => {
      const exerciseDiv = document.createElement("div");

      exerciseDiv.className = "mb-4 p-3 border border-secondary rounded";

      // Calculate exercise stats
      const totalWeight = exercise.sets.reduce((sum, set) => {
        const weight = set.weight;
        const reps = set.reps;
        // Convert to kg if needed
        const weightInKg =
          set.weightUnit === "lbs" ? weight * 0.453592 : weight;
        return sum + weightInKg * reps;
      }, 0);

      const totalReps = exercise.sets.reduce((sum, set) => sum + set.reps, 0);
      const maxWeight = Math.max(...exercise.sets.map((set) => set.weight));

      exerciseDiv.innerHTML = `
                <h5 class="text-light mb-3">${exercise.name}</h5>
                <div class="stats-summary mb-3">
                    <div class="row text-light">
                        <div class="col-md-4">
                            <small>Total Volume: ${totalWeight.toFixed(
                              1
                            )} kg</small>
                        </div>
                        <div class="col-md-4">
                            <small>Total Reps: ${totalReps}</small>
                        </div>
                        <div class="col-md-4">
                            <small>Max Weight: ${maxWeight} ${
        exercise.sets[0].weightUnit
      }</small>
                        </div>
                    </div>
                </div>
                <div class="table-responsive">
                    <table class="table table-dark table-sm">
                        <thead>
                            <tr>
                                <th>Set</th>
                                <th>Weight</th>
                                <th>Reps</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${exercise.sets
                              .map(
                                (set, index) => `
                                <tr>
                                    <td>${index + 1}</td>
                                    <td>${set.weight} ${set.weightUnit}</td>
                                    <td>${set.reps}</td>
                                </tr>
                            `
                              )
                              .join("")}
                        </tbody>
                    </table>
                </div>
            `;

      viewExerciseLogs.appendChild(exerciseDiv);
    });

    viewWorkoutModal.show();
  };

  // Render program list
  function renderProgramList() {
    programList.innerHTML = "";
    programs.forEach((program) => {
      const programCard = document.createElement("div");
      programCard.className = "col-md-6 mb-3";
      programCard.innerHTML = `
                <div class="card bg-dark">
                    <div class="card-body">
                        <h5 class="card-title text-light">${program.name}</h5>
                        <div class="mb-3">
                            ${program.exercises
                              .map(
                                (ex) => `
                                <div class="text-light small">
                                    ${ex.name}
                                    ${
                                      ex.notes
                                        ? `<br><small class="text-muted">${ex.notes}</small>`
                                        : ""
                                    }
                                </div>
                            `
                              )
                              .join("")}
                        </div>
                        <button class="btn btn-primary btn-sm me-2" onclick="startWorkoutLog(event)" data-program-id="${
                          program.id
                        }">
                            Log Workout
                        </button>
                        <button class="btn btn-secondary btn-sm me-2" onclick="editProgram('${
                          program.id
                        }')">
                            Edit
                        </button>
                        <button class="btn btn-danger btn-sm" onclick="deleteProgram('${
                          program.id
                        }')">
                            Delete
                        </button>
                    </div>
                </div>
            `;
      programList.appendChild(programCard);
    });
  }

  // Render workout history
  function renderWorkoutHistory() {
    workoutHistory.innerHTML = "";
    workoutLogs
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .forEach((log) => {
        const program = programs.find((p) => p.id === log.programId);
        const row = document.createElement("tr");
        row.innerHTML = `
                <td>${new Date(log.date).toLocaleDateString()}</td>
                <td>${program ? program.name : "Deleted Program"}</td>
                <td>
                    <button class="btn btn-primary btn-sm me-2" onclick="viewWorkout('${
                      log.id
                    }')">
                        View
                    </button>
                    <button class="btn btn-secondary btn-sm me-2" onclick="editWorkout('${
                      log.id
                    }')">
                        Edit
                    </button>
                    <button class="btn btn-danger btn-sm" onclick="deleteWorkout('${
                      log.id
                    }')">
                        Delete
                    </button>
                </td>
            `;
        workoutHistory.appendChild(row);
      });
  }

  // Set up modal close button handlers
  document.querySelectorAll(".btn-close").forEach((closeBtn) => {
    closeBtn.addEventListener("click", function () {
      const modal = this.closest(".modal");
      if (modal.id === "editWorkoutModal") {
        editWorkoutModal.hide();
        editWorkoutForm.reset();
        editExerciseLogs.innerHTML = "";
      } else if (modal.id === "editProgramModal") {
        editProgramModal.hide();
        editProgramForm.reset();
        editExercisesContainer.innerHTML = "";
      } else if (modal.id === "viewWorkoutModal") {
        viewWorkoutModal.hide();
      }
    });
  });

  // Add handler for view modal minimize button if it exists
  const minimizeViewWorkoutBtn = document.getElementById(
    "minimize-view-workout"
  );
  if (minimizeViewWorkoutBtn) {
    minimizeViewWorkoutBtn.addEventListener("click", () => {
      viewWorkoutModal.hide();
    });
  }

  // Cancel button handlers
  cancelLogBtn.addEventListener("click", () => {
    if (
      confirm(
        "Are you sure you want to cancel this workout log? All entered data will be lost."
      )
    ) {
      workoutLogger.style.display = "none";
      workoutLogForm.reset();
      exerciseLogs.innerHTML = "";
    }
  });

  const cancelEditProgramBtn = document.getElementById("cancel-edit-program");
  if (cancelEditProgramBtn) {
    cancelEditProgramBtn.addEventListener("click", () => {
      if (
        confirm("Are you sure you want to cancel? All changes will be lost.")
      ) {
        editProgramModal.hide();
        editProgramForm.reset();
        editExercisesContainer.innerHTML = "";
      }
    });
  }

  const cancelEditWorkoutBtn = document.getElementById("cancel-edit-workout");
  if (cancelEditWorkoutBtn) {
    cancelEditWorkoutBtn.addEventListener("click", () => {
      if (
        confirm("Are you sure you want to cancel? All changes will be lost.")
      ) {
        editWorkoutModal.hide();
        editWorkoutForm.reset();
        editExerciseLogs.innerHTML = "";
      }
    });
  }

  // Input validation for reps and weight
  document.addEventListener("input", (event) => {
    if (
      event.target.classList.contains("reps-done") ||
      event.target.classList.contains("weight-used")
    ) {
      let value = parseFloat(event.target.value);
      if (isNaN(value) || value <= 0) {
        event.target.value = "";
      }
    }
  });

  // Event listeners
  addExerciseBtn.addEventListener("click", () =>
    addExerciseField(exercisesContainer)
  );
  document
    .getElementById("edit-add-exercise")
    .addEventListener("click", () => addExerciseField(editExercisesContainer));
  programForm.addEventListener("submit", saveProgram);
  workoutLogForm.addEventListener("submit", saveWorkoutLog);
  editProgramForm.addEventListener("submit", saveEditedProgram);
  document
    .getElementById("save-edit-workout")
    .addEventListener("click", saveEditedWorkout);
  document
    .getElementById("save-edit-program")
    .addEventListener("click", function () {
      saveEditedProgram(new Event("submit"));
    });

  // Initialize
  addExerciseField(exercisesContainer);
  renderProgramList();
  renderWorkoutHistory();

  // Set today's date as default for new workout logs
  const today = new Date().toISOString().split("T")[0];
  if (document.getElementById("workout-date")) {
    document.getElementById("workout-date").value = today;
  }
});
