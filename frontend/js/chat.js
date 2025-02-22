// Get references to DOM elements
const chatBody = document.getElementById("chat-body");
const userInput = document.getElementById("user-input");
const sendBtn = document.getElementById("send-btn");

// Initialize variables
let allSymptoms = [];
let userSymptoms = [];
let followUpQuestions = {
    "fever": ["When did the fever start?", "How high is your temperature?"],
    "cough": ["Is it a dry or wet cough?", "How long have you been coughing?"],
    "headache": ["Where is the headache located?", "On a scale of 1 to 10, how severe is the headache?"],
    "fatigue": ["How long have you been feeling fatigued?", "Do you feel fatigued all the time or does it come and go?"],
    "sore throat": ["When did the sore throat start?", "Is it painful to swallow?"]
};
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
        if (currentFollowUpIndex < followUpQuestions[currentSymptom].length) {
            // Ask next follow-up question
            addMessage(followUpQuestions[currentSymptom][currentFollowUpIndex], "bot");
            currentFollowUpIndex++;
        } else {
            // All follow-up questions answered, analyze symptoms
            currentSymptom = null;
            currentFollowUpIndex = 0;
            addMessage("Thank you for your responses. Analyzing your symptoms...", "bot");
            analyzeSymptoms();
        }
    } else {
        // Check if input matches any symptom
        for (let symptom of allSymptoms) {
            if (input.toLowerCase().includes(symptom.toLowerCase())) {
                userSymptoms.push(symptom);
                currentSymptom = symptom;
                followUpAnswers[symptom] = [];
                addMessage(`You mentioned ${symptom}. ${followUpQuestions[symptom][currentFollowUpIndex]}`, "bot");
                currentFollowUpIndex++;
                return;
            }
        }
        // No symptom matched, ask for more details
        addMessage("Please provide more details about your symptoms.", "bot");
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