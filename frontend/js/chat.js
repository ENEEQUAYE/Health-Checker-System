document.addEventListener("DOMContentLoaded", async function () {
    const token = localStorage.getItem("token");

    if (!token) {
        window.location.href = "login.html";
        return;
    }

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

    // Function to simulate typing effect
    function typeMessage(message, sender) {
        const messageDiv = document.createElement("div");
        messageDiv.classList.add("message", sender === "user" ? "user-message" : "bot-message");
        chatBody.appendChild(messageDiv);
        chatBody.scrollTop = chatBody.scrollHeight;

        let index = 0;
        function type() {
            if (index < message.length) {
                messageDiv.textContent += message.charAt(index);
                index++;
                setTimeout(type, 40); // Adjust typing speed here
            } else {
                chatBody.scrollTop = chatBody.scrollHeight;
            }
        }
        type();
    }

    // Function to handle user input
    function handleUserInput(input) {
        if (currentSymptom) {
            // Store follow-up answer
            followUpAnswers[currentSymptom].push(input);
            if (currentFollowUpIndex < followUpQuestions.length - 1) {
                // Ask next follow-up question
                typeMessage(followUpQuestions[currentFollowUpIndex].replace("${symptom}", currentSymptom), "bot");
                currentFollowUpIndex++;
            } else {
                // Last follow-up question: Check for new symptoms
                let newSymptomFound = false;
                for (let symptom of allSymptoms) {
                    if (input.toLowerCase().includes(symptom.toLowerCase()) && !userSymptoms.includes(symptom)) {
                        userSymptoms.push(symptom);
                        currentSymptom = symptom;
                        followUpAnswers[symptom] = [];
                        typeMessage(`You mentioned ${symptom}. ${followUpQuestions[0].replace("${symptom}", symptom)}`, "bot");
                        currentFollowUpIndex = 1;
                        newSymptomFound = true;
                        break;
                    }
                }
                if (!newSymptomFound) {
                    // No new symptom mentioned, proceed to analyze symptoms
                    currentSymptom = null;
                    currentFollowUpIndex = 0;
                    typeMessage("Thank you for your responses. Analyzing your symptoms...", "bot");
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
                    typeMessage(`You mentioned ${symptom}. ${followUpQuestions[0].replace("${symptom}", symptom)}`, "bot");
                    currentFollowUpIndex = 1;
                    newSymptomFound = true;
                    break;
                }
            }
            if (!newSymptomFound) {
                // No symptom matched, ask for more details
                typeMessage("Please provide more details about your symptoms.", "bot");
            }
        }
    }

    // Function to analyze symptoms by sending them to the backend
    async function analyzeSymptoms() {
        try {
            const response = await fetch("http://localhost:5000/api/conditions/check", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({ symptoms: userSymptoms })
            });
            const diagnosis = await response.json();
            diagnosis.forEach(d => {
                typeMessage(
                    `Condition: ${d.condition}\n` +
                    `Match Confidence: ${d.match_percentage}%\n` +
                    `Advice: ${d.advice}\n\n` +
                    `Disclaimer: This is not a medical diagnosis. Please consult a healthcare professional for an accurate diagnosis.`,
                    "bot"
                );
            });
            //wait till the results are displayed and then thank the user
            setTimeout(() => {
                typeMessage("Thank you for using our symptom checker!", "bot");
            }
                , 10000);
            // typeMessage("Thank you for using our symptom checker!", "bot");
            //reload page
            setTimeout(() => {
                window.location.reload();
            }, 50000);
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
            const response = await fetch("http://localhost:5000/api/conditions/symptoms", {
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            });
            const data = await response.json();
            allSymptoms = data.symptoms;
        } catch (error) {
            addMessage("Error fetching symptoms. Please try again later.", "bot");
        }
    }

    // Fetch symptoms when the page loads
    fetchSymptoms();
});