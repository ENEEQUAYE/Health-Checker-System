// Get references to DOM elements
const chatBody = document.getElementById("chat-body");
const userInput = document.getElementById("user-input");
const sendBtn = document.getElementById("send-btn");

// Initialize variables
let allSymptoms = [];
let userSymptoms = [];
let followUpQuestions = [
    "When did the ${symptom} start?",
    "Did the ${symptom} come on suddenly or gradually?",
    "How severe is the ${symptom}, (mild, moderate, or severe)?",
    "Has the severity changed over time?",
    "How often do you experience the ${symptom}?",
    "Is it constant or does it come and go?",
    "Does anything seem to trigger or worsen the ${symptom}?",
    "Are there times of day when the ${symptom} is better or worse?",
    "Are you experiencing any other symptoms along with this?",
    "Are you experiencing any other symptoms along with this?"
];
let followUpAnswers = {};
let currentSymptomIndex = 0;
let currentFollowUpIndex = 0;
let currentSymptom = null;

// Function to add a message to the chat
function addMessage(message, sender) {
    const messageDiv = document.createElement("div");
    messageDiv.classList.add("message", sender === "user" ? "user-message" : "bot-message");
    messageDiv.textContent = message;
    chatBody.appendChild(messageDiv);
    chatBody.scrollTop = chatBody.scrollHeight;
}

// Function to handle user input
function handleUserInput(input) {
    if (currentSymptom) {
        // Store follow-up answer
        followUpAnswers[currentSymptom].push(input);
        if (currentFollowUpIndex < followUpQuestions.length - 1) {
            // Ask next follow-up question
            addMessage(followUpQuestions[currentFollowUpIndex].replace("${symptom}", currentSymptom), "bot");
            currentFollowUpIndex++;
        } else {
            // Last follow-up question: Check for new symptoms
            let newSymptomFound = false;
            for (let symptom of allSymptoms) {
                if (input.toLowerCase().includes(symptom.toLowerCase()) && !userSymptoms.includes(symptom)) {
                    userSymptoms.push(symptom);
                    currentSymptom = symptom;
                    followUpAnswers[symptom] = [];
                    addMessage(`You mentioned ${symptom}. ${followUpQuestions[0].replace("${symptom}", symptom)}`, "bot");
                    currentFollowUpIndex = 1;
                    newSymptomFound = true;
                    break;
                }
            }
            if (!newSymptomFound) {
                // No new symptom mentioned, proceed to analyze symptoms
                currentSymptom = null;
                currentFollowUpIndex = 0;
                addMessage("Thank you for your responses. Analyzing your symptoms...", "bot");
                analyzeSymptoms();
            }
        }
    } else {
        // Check if input matches any symptom
        let newSymptomFound = false;
        for (let symptom of allSymptoms) {
            if (input.toLowerCase().includes(symptom.toLowerCase())) {
                userSymptoms.push(symptom);
                currentSymptom = symptom;
                followUpAnswers[symptom] = [];
                addMessage(`You mentioned ${symptom}. ${followUpQuestions[0].replace("${symptom}", symptom)}`, "bot");
                currentFollowUpIndex = 1;
                newSymptomFound = true;
                break;
            }
        }
        if (!newSymptomFound) {
            // No symptom matched, ask for more details
            addMessage("Please provide more details about your symptoms.", "bot");
        }
    }
}

// Function to analyze symptoms by sending them to the backend
async function analyzeSymptoms() {
    try {
        const response = await fetch("http://localhost:5000/api/conditions/check", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ symptoms: userSymptoms })
        });
        const diagnosis = await response.json();
        diagnosis.forEach(d => {
            addMessage(`Condition: ${d.condition}\nMatch Confidence: ${d.match_percentage}%\nAdvice: ${d.advice}`, "bot");
        });
    } catch (error) {
        addMessage("Error analyzing symptoms. Please try again later.", "bot");
    }
}

// Event listener for send button click
sendBtn.addEventListener("click", () => {
    const message = userInput.value.trim();
    if (message) {
        addMessage(message, "user");
        userInput.value = "";
        handleUserInput(message);
    }
});

// Event listener for pressing Enter key in the input field
userInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
        sendBtn.click();
    }
});

// Function to fetch all symptoms from the server
async function fetchSymptoms() {
    try {
        const response = await fetch("http://localhost:5000/api/conditions/symptoms");
        const data = await response.json();
        allSymptoms = data.symptoms;
    } catch (error) {
        addMessage("Error fetching symptoms. Please try again later.", "bot");
    }
}

// Fetch symptoms when the page loads
fetchSymptoms();