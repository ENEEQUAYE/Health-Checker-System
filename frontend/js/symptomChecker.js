document.addEventListener("DOMContentLoaded", async function () {
    const token = localStorage.getItem("token");

    if (!token) {
        window.location.href = "login.html";
        return;
    }

    const symptomListDiv = document.getElementById("symptom-list");
    const symptomSearch = document.getElementById("symptom-search");
    const resultDiv = document.getElementById("result");
    const followUpModal = document.getElementById("followUpModal");
    const followUpBody = document.getElementById("follow-up-body");
    const followUpInput = document.getElementById("follow-up-answer");
    const submitFollowUp = document.getElementById("submit-follow-up");

    let allSymptoms = [];
    let followUpResponses = [];
    let currentFollowUpIndex = 0;
    let selectedSymptoms = new Set();

    // Fetch available symptoms
    async function loadSymptoms() {
        try {
            const response = await fetch("http://localhost:5000/api/conditions/symptoms");
            const data = await response.json();

            allSymptoms = data.symptoms;
            displaySymptoms(allSymptoms);
        } catch (error) {
            console.error("Error fetching symptoms:", error);
            symptomListDiv.innerHTML = `<div class="alert alert-danger">Failed to load symptoms. Please try again later.</div>`;
        }
    }

    // Display symptoms in 3 columns
    function displaySymptoms(symptoms) {
        symptomListDiv.innerHTML = "";
        const rowDiv = document.createElement("div");
        rowDiv.classList.add("row");

        symptoms.forEach((symptom, index) => {
            const colDiv = document.createElement("div");
            colDiv.classList.add("col-md-4", "form-check");

            const checkbox = document.createElement("input");
            checkbox.type = "checkbox";
            checkbox.value = symptom;
            checkbox.id = `symptom-${index}`;
            checkbox.classList.add("form-check-input");

            if (selectedSymptoms.has(symptom)) {
                checkbox.checked = true;
            }

            checkbox.addEventListener("change", function () {
                if (this.checked) {
                    selectedSymptoms.add(this.value);
                } else {
                    selectedSymptoms.delete(this.value);
                }
            });

            const label = document.createElement("label");
            label.htmlFor = `symptom-${index}`;
            label.textContent = ` ${symptom}`;
            label.classList.add("form-check-label");

            colDiv.appendChild(checkbox);
            colDiv.appendChild(label);
            rowDiv.appendChild(colDiv);
        });

        symptomListDiv.appendChild(rowDiv);
    }

    // Search bar functionality
    symptomSearch.addEventListener("input", function () {
        const searchTerm = symptomSearch.value.toLowerCase();
        const filteredSymptoms = allSymptoms.filter(symptom =>
            symptom.toLowerCase().includes(searchTerm)
        );
        displaySymptoms(filteredSymptoms);
    });

    // Handle form submission
    document.getElementById("symptom-form").addEventListener("submit", function (e) {
        e.preventDefault();

        if (selectedSymptoms.size === 0) {
            resultDiv.innerHTML = `<div class="alert alert-warning">Please select at least one symptom.</div>`;
            return;
        }

        followUpResponses = [];
        currentFollowUpIndex = 0;
        openChatBox();
        askFollowUpQuestion();
    });

    // Open Chat Box
    function openChatBox() {
        followUpModal.style.display = "block";
        followUpBody.innerHTML = "<p class='text-muted'>Let's get more details about your symptoms.</p>";
    }

    // Ask follow-up questions using chat box
    function askFollowUpQuestion() {
        if (currentFollowUpIndex < Array.from(selectedSymptoms).length) {
            const symptom = Array.from(selectedSymptoms)[currentFollowUpIndex];
            const question = document.createElement("p");
            question.classList.add("chat-message", "bot");
            question.innerHTML = `<strong>Health Checker:</strong> What is the severity of "${symptom}"? (mild/moderate/severe)`;
            followUpBody.appendChild(question);
            followUpInput.value = "";
            followUpInput.focus();
        } else {
            submitSymptoms();
            closeChatBox();
        }
    }

    // Handle follow-up answer submission
    submitFollowUp.addEventListener("click", function () {
        const answer = followUpInput.value.trim() || "unknown";
        const userReply = document.createElement("p");
        userReply.classList.add("chat-message", "user");
        userReply.innerHTML = `<strong>You:</strong> ${answer}`;
        followUpBody.appendChild(userReply);

        followUpResponses.push({ name: Array.from(selectedSymptoms)[currentFollowUpIndex], severity: answer });
        currentFollowUpIndex++;
        askFollowUpQuestion();
    });

    // Close Chat Box
    function closeChatBox() {
        followUpModal.style.display = "none";
    }

    // Send symptoms and follow-up responses to backend
    async function submitSymptoms() {
        try {
            const response = await fetch("http://localhost:5000/api/conditions/check", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({ symptoms: followUpResponses })
            });

            const data = await response.json();

            if (Array.isArray(data) && data.length > 0) {
                resultDiv.innerHTML = "<h4>Possible Diagnoses:</h4>";
                data.forEach(diagnosis => {
                    resultDiv.innerHTML += `
                        <div class="alert alert-info">
                            <strong>Condition:</strong> ${diagnosis.condition} <br>
                            <strong>Match Confidence:</strong> ${diagnosis.match_percentage}% <br>
                            <strong>Advice:</strong> ${diagnosis.advice}
                        </div>
                    `;
                });
            } else {
                resultDiv.innerHTML = `<div class="alert alert-warning">No matching conditions found.</div>`;
            }
        } catch (error) {
            console.error("Error analyzing symptoms:", error);
            resultDiv.innerHTML = `<div class="alert alert-danger">Failed to analyze symptoms. Please try again.</div>`;
        }
    }

    loadSymptoms();
});
