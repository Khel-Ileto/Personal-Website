document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const programForm = document.getElementById('program-form');
    const exercisesContainer = document.getElementById('exercises-container');
    const addExerciseBtn = document.getElementById('add-exercise');
    const programList = document.getElementById('program-list');
    const workoutLogger = document.getElementById('workout-logger');
    const workoutLogForm = document.getElementById('workout-log-form');
    const exerciseLogs = document.getElementById('exercise-logs');
    const workoutHistory = document.getElementById('workout-history');
    const cancelLogBtn = document.getElementById('cancel-log');
    const editWorkoutModal = new bootstrap.Modal(document.getElementById('editWorkoutModal'));
    const editProgramModal = new bootstrap.Modal(document.getElementById('editProgramModal'));
    const editWorkoutForm = document.getElementById('edit-workout-form');
    const editExerciseLogs = document.getElementById('edit-exercise-logs');
    const editProgramForm = document.getElementById('edit-program-form');
    const editExercisesContainer = document.getElementById('edit-exercises-container');
 // Add deleteProgram function
 window.deleteProgram = function(programId) {
    if (confirm('Are you sure you want to delete this program?')) {
        // Remove the program
        programs = programs.filter(p => p.id !== programId);
        localStorage.setItem('workoutPrograms', JSON.stringify(programs));
        
        // Also remove associated workout logs
        workoutLogs = workoutLogs.filter(log => log.programId !== programId);
        localStorage.setItem('workoutLogs', JSON.stringify(workoutLogs));
        
        renderProgramList();
        renderWorkoutHistory();
    }
};

// Set up modal close button handlers
document.querySelectorAll('.btn-close').forEach(closeBtn => {
    closeBtn.addEventListener('click', function() {
        const modal = this.closest('.modal');
        if (modal.id === 'editWorkoutModal') {
            editWorkoutModal.hide();
            editWorkoutForm.reset();
            editExerciseLogs.innerHTML = '';
        } else if (modal.id === 'editProgramModal') {
            editProgramModal.hide();
            editProgramForm.reset();
            editExercisesContainer.innerHTML = '';
        }
    });
});

// Update cancel button functionality
cancelLogBtn.addEventListener('click', () => {
    if (confirm('Are you sure you want to cancel this workout log? All entered data will be lost.')) {
        workoutLogger.style.display = 'none';
        workoutLogForm.reset();
        exerciseLogs.innerHTML = '';
    }
});
// Add cancel button for edit program modal
const cancelEditProgramBtn = document.getElementById('cancel-edit-program');
if (cancelEditProgramBtn) {
    cancelEditProgramBtn.addEventListener('click', () => {
        if (confirm('Are you sure you want to cancel? All changes will be lost.')) {
            editProgramModal.hide();
            editProgramForm.reset();
            editExercisesContainer.innerHTML = '';
        }
    });
}

// Add cancel button for edit workout modal
const cancelEditWorkoutBtn = document.getElementById('cancel-edit-workout');
if (cancelEditWorkoutBtn) {
    cancelEditWorkoutBtn.addEventListener('click', () => {
        if (confirm('Are you sure you want to cancel? All changes will be lost.')) {
            editWorkoutModal.hide();
            editWorkoutForm.reset();
            editExerciseLogs.innerHTML = '';
        }
    });
}

// Make sure editProgramForm submit handler is properly set up
editProgramForm.addEventListener('submit', saveEditedProgram);
    // Load saved data
    let programs = JSON.parse(localStorage.getItem('workoutPrograms')) || [];
    let workoutLogs = JSON.parse(localStorage.getItem('workoutLogs')) || [];

    // Add exercise field (for program creation)
    function addExerciseField(container, values = null) {
        const exerciseDiv = document.createElement('div');
        exerciseDiv.className = 'exercise-input mb-3 p-3 border border-secondary rounded';
        exerciseDiv.innerHTML = `
            <div class="form-group mb-2">
                <label class="text-light">Exercise Name</label>
                <input type="text" class="form-control bg-secondary text-light exercise-name" 
                    placeholder="Enter exercise name (e.g., Bench Press)" required
                    value="${values ? values.name : ''}">
            </div>
            <div class="row mb-2">
                <div class="col-md-4">
                    <label class="text-light">Sets</label>
                    <input type="number" class="form-control bg-secondary text-light sets" 
                        placeholder="Number of sets" min="1" required
                        value="${values ? values.sets : ''}">
                </div>
                <div class="col-md-4">
                    <label class="text-light">Min Reps</label>
                    <input type="number" class="form-control bg-secondary text-light min-reps" 
                        placeholder="Minimum reps" min="1" required
                        value="${values ? values.minReps : ''}">
                </div>
                <div class="col-md-4">
                    <label class="text-light">Max Reps</label>
                    <input type="number" class="form-control bg-secondary text-light max-reps" 
                        placeholder="Maximum reps" min="1" required
                        value="${values ? values.maxReps : ''}">
                </div>
            </div>
            <div class="form-group mb-2">
                <label class="text-light">Notes (optional)</label>
                <input type="text" class="form-control bg-secondary text-light exercise-notes" 
                    placeholder="Add exercise notes (e.g., Rest 2 mins between sets)"
                    value="${values ? (values.notes || '') : ''}">
            </div>
            <button type="button" class="btn btn-danger btn-sm remove-exercise">Remove Exercise</button>
        `;
        container.appendChild(exerciseDiv);

        exerciseDiv.querySelector('.remove-exercise').addEventListener('click', () => exerciseDiv.remove());
    }

 

    // Update weight unit labels
    function updateWeightUnitLabels(container, unit) {
        container.querySelectorAll('.weight-unit-label').forEach(label => {
            label.textContent = unit;
        });
    }

    // Create set input fields
    function createSetInputs(setIndex, weightUnit = 'kg', values = null) {
        return `
            <div class="set-log row mb-3 align-items-center">
                <div class="col-auto">
                    <span class="text-light">Set ${setIndex + 1}</span>
                </div>
                <div class="col">
                    <div class="row">
                        <div class="col">
                            <input type="number" class="form-control bg-secondary text-light reps-done" 
                                placeholder="Enter reps completed" min="1" required
                                value="${values ? values.reps : ''}">
                        </div>
                        <div class="col">
                            <div class="input-group">
                                <input type="number" class="form-control bg-secondary text-light weight-used" 
                                    placeholder="Enter weight" step="0.5" min="0" required
                                    value="${values ? values.weight : ''}">
                                <span class="input-group-text bg-secondary text-light weight-unit-label" 
                                      style="cursor: pointer;" 
                                      onclick="toggleWeightUnit(this)">${weightUnit}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
    document.addEventListener('input', (event) => {
        // Check if the target is reps or weight input
        if (event.target.classList.contains('reps-done') || event.target.classList.contains('weight-used')) {
            let value = parseFloat(event.target.value);
    
            // Ensure the value is a positive number and greater than 0
            if (isNaN(value) || value <= 0) {
                event.target.value = ''; // Clear invalid input
            }
        }
    });
    
    window.toggleWeightUnit = function(element) {
        const currentUnit = element.textContent;
        element.textContent = currentUnit === 'kg' ? 'lbs' : 'kg';
    };
    // Save program
    function saveProgram(e) {
        e.preventDefault();
        const exercises = [];
        exercisesContainer.querySelectorAll('.exercise-input').forEach(exerciseDiv => {
            exercises.push({
                name: exerciseDiv.querySelector('.exercise-name').value,
                sets: parseInt(exerciseDiv.querySelector('.sets').value),
                minReps: parseInt(exerciseDiv.querySelector('.min-reps').value),
                maxReps: parseInt(exerciseDiv.querySelector('.max-reps').value),
                notes: exerciseDiv.querySelector('.exercise-notes').value
            });
        });

        const program = {
            id: Date.now().toString(),
            name: document.getElementById('program-name').value,
            exercises: exercises
        };

        programs.push(program);
        localStorage.setItem('workoutPrograms', JSON.stringify(programs));
        programForm.reset();
        exercisesContainer.innerHTML = '';
        addExerciseField(exercisesContainer);
        renderProgramList();
    }
// Edit program
window.editProgram = function(programId) {
    const program = programs.find(p => p.id === programId);
    document.getElementById('edit-program-name').value = program.name;
    editExercisesContainer.innerHTML = '';
    
    program.exercises.forEach(exercise => {
        addExerciseField(editExercisesContainer, exercise);
    });
    
    editProgramForm.dataset.programId = programId;
    editProgramModal.show();
};

// Save edited program
function saveEditedProgram(e) {
    e.preventDefault();
    const programId = editProgramForm.dataset.programId;
    const programIndex = programs.findIndex(p => p.id === programId);
    
    const exercises = [];
    editExercisesContainer.querySelectorAll('.exercise-input').forEach(exerciseDiv => {
        exercises.push({
            name: exerciseDiv.querySelector('.exercise-name').value,
            sets: parseInt(exerciseDiv.querySelector('.sets').value),
            minReps: parseInt(exerciseDiv.querySelector('.min-reps').value),
            maxReps: parseInt(exerciseDiv.querySelector('.max-reps').value),
            notes: exerciseDiv.querySelector('.exercise-notes').value
        });
    });

    programs[programIndex] = {
        ...programs[programIndex],
        name: document.getElementById('edit-program-name').value,
        exercises: exercises
    };

    localStorage.setItem('workoutPrograms', JSON.stringify(programs));
    editProgramModal.hide();
    renderProgramList();
}

    // Start workout logging
    window.startWorkoutLog = function(e) {
        const programId = e.target.dataset.programId;
        const program = programs.find(p => p.id === programId);
        
        workoutLogger.style.display = 'block';
        document.getElementById('logging-program-name').textContent = program.name;
        exerciseLogs.innerHTML = '';

        program.exercises.forEach(exercise => {
            const exerciseLog = document.createElement('div');
            exerciseLog.className = 'exercise-log mb-4 p-3 border border-secondary rounded';
            
            exerciseLog.innerHTML = `
                <div class="exercise-header mb-3">
                    <h5 class="text-light">${exercise.name}</h5>
                    <p class="text-light small mb-1">Target: ${exercise.minReps}-${exercise.maxReps} reps</p>
                    ${exercise.notes ? `<p class="text-light small mb-1">Notes: ${exercise.notes}</p>` : ''}
                  
                </div>
            `;

            const setsContainer = document.createElement('div');
            setsContainer.className = 'sets-container';
            for (let i = 0; i < exercise.sets; i++) {
                setsContainer.innerHTML += createSetInputs(i);
            }
            exerciseLog.appendChild(setsContainer);

            exerciseLogs.appendChild(exerciseLog);

            // Add weight unit toggle functionality
            exerciseLog.querySelectorAll('.weight-unit').forEach(radio => {
                radio.addEventListener('change', (e) => {
                    updateWeightUnitLabels(exerciseLog, e.target.value);
                });
            });
        });

        workoutLogForm.dataset.programId = programId;
        
        // Set today's date as default
        const today = new Date().toISOString().split('T')[0];
        document.getElementById('workout-date').value = today;
    };

    // Save workout log
    function saveWorkoutLog(e) {
        e.preventDefault();
        const exercises = [];
exerciseLogs.querySelectorAll('.exercise-log').forEach((exerciseLog, index) => {
    const sets = [];
    
    exerciseLog.querySelectorAll('.set-log').forEach((setLog) => {
        sets.push({
            reps: parseInt(setLog.querySelector('.reps-done').value),
            weight: parseFloat(setLog.querySelector('.weight-used').value),
            weightUnit: setLog.querySelector('.weight-unit-label').textContent
        });
    });

            const program = programs.find(p => p.id === workoutLogForm.dataset.programId);
            exercises.push({
                name: program.exercises[index].name,
                targetRange: `${program.exercises[index].minReps}-${program.exercises[index].maxReps}`,
                sets: sets
            });
        });

        const workoutLog = {
            id: Date.now().toString(),
            programId: workoutLogForm.dataset.programId,
            date: document.getElementById('workout-date').value,
            exercises: exercises
        };

        workoutLogs.push(workoutLog);
        localStorage.setItem('workoutLogs', JSON.stringify(workoutLogs));
        workoutLogForm.reset();
        workoutLogger.style.display = 'none';
        renderWorkoutHistory();
    }

    // Edit workout
    window.editWorkout = function(logId) {
        const log = workoutLogs.find(l => l.id === logId);
        const program = programs.find(p => p.id === log.programId);

        document.getElementById('edit-workout-date').value = log.date;
        editExerciseLogs.innerHTML = '';

        log.exercises.forEach((exercise, index) => {
            const exerciseLog = document.createElement('div');
            exerciseLog.className = 'exercise-log mb-4 p-3 border border-secondary rounded';
            
            exerciseLog.innerHTML = `
                <div class="exercise-header mb-3">
                    <h5 class="text-light">${exercise.name}</h5>
                    <p class="text-light small mb-1">Target: ${exercise.targetRange}</p>
             
                </div>
            `;

            const setsContainer = document.createElement('div');
            setsContainer.className = 'sets-container';
            exercise.sets.forEach((set, i) => {
                setsContainer.innerHTML += createSetInputs(i, set.weightUnit, set);
            });
            exerciseLog.appendChild(setsContainer);

            editExerciseLogs.appendChild(exerciseLog);

            // Add weight unit toggle functionality
            exerciseLog.querySelectorAll('.weight-unit').forEach(radio => {
                if (exercise.sets[0].weightUnit === radio.value) {
                    radio.checked = true;
                }
                radio.addEventListener('change', (e) => {
                    updateWeightUnitLabels(exerciseLog, e.target.value);
                });
            });
        });

        editWorkoutForm.dataset.logId = logId;
        editWorkoutModal.show();
    };

    // Save edited workout
    function saveEditedWorkout() {
        const logId = editWorkoutForm.dataset.logId;
        const logIndex = workoutLogs.findIndex(l => l.id === logId);
        const log = workoutLogs[logIndex];

        const exercises = [];
editExerciseLogs.querySelectorAll('.exercise-log').forEach((exerciseLog, exIdx) => {
    const sets = [];
    
    exerciseLog.querySelectorAll('.set-log').forEach((setLog) => {
        sets.push({
            reps: parseInt(setLog.querySelector('.reps-done').value),
            weight: parseFloat(setLog.querySelector('.weight-used').value),
            weightUnit: setLog.querySelector('.weight-unit-label').textContent
        });
    });
            exercises.push({
                name: log.exercises[exIdx].name,
                targetRange: log.exercises[exIdx].targetRange,
                sets: sets
            });
        });

        workoutLogs[logIndex] = {
            ...log,
            date: document.getElementById('edit-workout-date').value,
            exercises: exercises
        };

        localStorage.setItem('workoutLogs', JSON.stringify(workoutLogs));
        renderWorkoutHistory();
        editWorkoutModal.hide();
    }

    // Render program list
    function renderProgramList() {
        programList.innerHTML = '';
        programs.forEach(program => {
            const programCard = document.createElement('div');
            programCard.className = 'col-md-6 mb-3';
            programCard.innerHTML = `
                <div class="card bg-dark">
                    <div class="card-body">
                        <h5 class="card-title text-light">${program.name}</h5>
                        <div class="mb-3">
                            ${program.exercises.map(ex => `
                                <div class="text-light small">
                                    ${ex.name}: ${ex.sets}x${ex.minReps}-${ex.maxReps}
                                    ${ex.notes ? `<br><small class="text-muted">${ex.notes}</small>` : ''}
                                </div>
                            `).join('')}
                        </div>
                        <button class="btn btn-primary btn-sm me-2" onclick="startWorkoutLog(event)" data-program-id="${program.id}">
                            Log Workout
                        </button>
                        <button class="btn btn-secondary btn-sm me-2" onclick="editProgram('${program.id}')">
                            Edit
                        </button>
                        <button class="btn btn-danger btn-sm" onclick="deleteProgram('${program.id}')">
                            Delete
                        </button>
                    </div>
                </div>
            `;
            programList.appendChild(programCard);
        });
    }

    // Event listeners
    addExerciseBtn.addEventListener('click', () => addExerciseField(exercisesContainer));
    programForm.addEventListener('submit', saveProgram);
    workoutLogForm.addEventListener('submit', saveWorkoutLog);
    document.getElementById('save-edit-workout').addEventListener('click', saveEditedWorkout);
    cancelLogBtn.addEventListener('click', () => {
        workoutLogger.style.display = 'none';
        workoutLogForm.reset();
    });
  
    document.getElementById('edit-add-exercise').addEventListener('click', () => addExerciseField(editExercisesContainer));

    // Initialize
    addExerciseField(exercisesContainer);
    renderProgramList();
    renderWorkoutHistory();

    // Render workout history
    function renderWorkoutHistory() {
        workoutHistory.innerHTML = '';
        workoutLogs.sort((a, b) => new Date(b.date) - new Date(a.date)).forEach(log => {
            const program = programs.find(p => p.id === log.programId);
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${new Date(log.date).toLocaleDateString()}</td>
                <td>${program ? program.name : 'Deleted Program'}</td>
                <td>
                    <button class="btn btn-secondary btn-sm me-2" onclick="editWorkout('${log.id}')">
                        Edit
                    </button>
                    <button class="btn btn-danger btn-sm" onclick="deleteWorkout('${log.id}')">
                        Delete
                    </button>
                </td>
            `;
            workoutHistory.appendChild(row);
        });
    }

    // Delete workout
    window.deleteWorkout = function(logId) {
        if (confirm('Are you sure you want to delete this workout log?')) {
            workoutLogs = workoutLogs.filter(l => l.id !== logId);
            localStorage.setItem('workoutLogs', JSON.stringify(workoutLogs));
            renderWorkoutHistory();
        }
    };

    // Set today's date as default for new workout logs
    const today = new Date().toISOString().split('T')[0];
    if (document.getElementById('workout-date')) {
        document.getElementById('workout-date').value = today;
    }
});