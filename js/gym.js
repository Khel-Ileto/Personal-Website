document.addEventListener("DOMContentLoaded", function () {
  const workoutForm = document.getElementById("workout-form");
  const workoutHistory = document.getElementById("workout-history");
  const setContainer = document.getElementById("set-container");
  const generateSetsButton = document.getElementById("generate-sets");

  let workouts = JSON.parse(localStorage.getItem("workouts")) || []; // Retrieve workouts from localStorage or initialize an empty array

  // Function to generate input fields for the number of sets specified by the user
  generateSetsButton.addEventListener("click", function () {
    const setCount = document.getElementById("set-count").value;

    if (!setCount || setCount < 1) {
      alert("Please enter a valid number of sets.");
      return;
    }

    setContainer.innerHTML = ""; // Clear previous sets
    for (let i = 1; i <= setCount; i++) {
      const setDiv = document.createElement("div");
      setDiv.classList.add("form-group");
      setDiv.innerHTML = `
        <h5 class="text-light">Set ${i}</h5>
        <label for="reps${i}" class="text-light">Reps</label>
        <input type="number" class="form-control" id="reps${i}" placeholder="e.g. 10" min="1" required>

        <label for="weight${i}" class="text-light">Weight (kg)</label>
        <input type="number" class="form-control" id="weight${i}" placeholder="e.g. 50" step="0.5">
      `;
      setContainer.appendChild(setDiv);
    }

    console.log(`Generated ${setCount} sets`);
  });

  // Function to handle form submission (save workout)
  workoutForm.addEventListener("submit", function (e) {
    e.preventDefault();

    const date = document.getElementById("date").value;
    const exercise = document.getElementById("exercise").value;
    const setCount = document.getElementById("set-count").value;

    if (!date || !exercise || !setCount) {
      alert("Please fill in all required fields.");
      return;
    }

    let setsDetails = "";
    for (let i = 1; i <= setCount; i++) {
      const reps = document.getElementById(`reps${i}`).value;
      const weight =
        document.getElementById(`weight${i}`).value || "Bodyweight";

      if (!reps) {
        alert(`Please enter the number of reps for Set ${i}.`);
        return;
      }

      setsDetails += `Set ${i}: ${reps} Reps @ ${weight} kg<br>`;
    }

    const workout = {
      date,
      exercise,
      setsDetails,
    };

    // Save workout in the array and localStorage
    workouts.push(workout);
    localStorage.setItem("workouts", JSON.stringify(workouts));

    // Render the workout history table with the latest data
    renderWorkoutHistory();

    // Reset the form and set container for new input
    workoutForm.reset();
    setContainer.innerHTML = "";
    console.log("Form reset, ready for new input.");
  });

  // Function to render the workout history table
  function renderWorkoutHistory() {
    workoutHistory.innerHTML = ""; // Clear current history

    // Sort workouts by date in ascending order
    workouts.sort((a, b) => new Date(a.date) - new Date(b.date));

    let lastDate = ""; // Track the last date for separation purposes

    workouts.forEach((workout, index) => {
      // Add a blank row if the date changes
      if (workout.date !== lastDate && lastDate !== "") {
        const blankRow = document.createElement("tr");
        blankRow.innerHTML = `<td colspan="4" style="height: 20px; background-color: #2c2c2c; border: none;"></td>`;
        workoutHistory.appendChild(blankRow);
      }

      const newRow = document.createElement("tr");
      newRow.innerHTML = `
          <td>${workout.date}</td>
          <td>${workout.exercise}</td>
          <td>${workout.setsDetails}</td>
          <td>
              <button class="btn btn-primary btn-sm edit-btn" data-index="${index}">Edit</button>
              <button class="btn btn-danger btn-sm delete-btn" data-index="${index}">Delete</button>
          </td>
      `;

      workoutHistory.appendChild(newRow);

      lastDate = workout.date; // Update the last date
    });

    // Attach event listeners to edit and delete buttons
    document.querySelectorAll(".edit-btn").forEach((button) => {
      button.addEventListener("click", handleEditWorkout);
    });

    document.querySelectorAll(".delete-btn").forEach((button) => {
      button.addEventListener("click", handleDeleteWorkout);
    });
  }

  // Function to handle editing a workout
  function handleEditWorkout(e) {
    const index = e.target.getAttribute("data-index");
    const workout = workouts[index];

    // Populate the form with the workout data
    document.getElementById("date").value = workout.date;
    document.getElementById("exercise").value = workout.exercise;

    // Generate the sets based on the workout data
    const setCount = workout.setsDetails.split("<br>").length - 1;
    document.getElementById("set-count").value = setCount;
    generateSetsButton.click();

    for (let i = 1; i <= setCount; i++) {
      const reps = workout.setsDetails.match(/Set \d+: (\d+) Reps/)[1];
      const weight = workout.setsDetails.match(/@ (.*?) kg/)[1];
      document.getElementById(`reps${i}`).value = reps;
      document.getElementById(`weight${i}`).value = weight;
    }

    // Remove the workout from the array (will be re-added on save)
    workouts.splice(index, 1);
    renderWorkoutHistory();
  }

  // Function to handle deleting a workout
  function handleDeleteWorkout(e) {
    const index = e.target.getAttribute("data-index");

    // Remove the workout from the array and localStorage
    workouts.splice(index, 1);
    localStorage.setItem("workouts", JSON.stringify(workouts));

    // Re-render the workout history
    renderWorkoutHistory();
  }

  // Initial render of the workout history when the page loads
  renderWorkoutHistory();
});
