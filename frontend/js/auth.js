document.addEventListener("DOMContentLoaded", function () {
    // Handle Login Form
    const loginForm = document.getElementById("login-form");
    if (loginForm) {
        const flashMessages = document.getElementById("flash-messages");
        loginForm.addEventListener("submit", function (e) {
            e.preventDefault();

            let email = document.getElementById("email").value;
            let password = document.getElementById("password").value;

            fetch("http://localhost:5000/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password })
            })
            .then(response => response.json())
            .then(data => {
                if (data.token) {
                    localStorage.setItem("token", data.token);
                    localStorage.setItem("user", JSON.stringify(data.user));
                    showFlashMessage("Login successful! Redirecting...", "success");
                    setTimeout(() => { window.location.href = "dashboard.html"; }, 1500);
                } else {
                    showFlashMessage(data.message, "danger");
                }
            })
            .catch(error => {
                console.error("Error:", error);
                showFlashMessage("An error occurred. Please try again.", "danger");
            });
        });
    }

    // Handle Register Form
    const registerForm = document.getElementById("register-form");
    if (registerForm) {
        const flashMessages = document.getElementById("flash-messages");
        registerForm.addEventListener("submit", function (e) {
            e.preventDefault();

            const username = document.getElementById("register-username").value;
            const email = document.getElementById("register-email").value;
            const password = document.getElementById("register-password").value;
            const phone = document.getElementById("register-phone").value;

            fetch("http://localhost:5000/api/auth/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, email, password, phone })
            })
            .then(response => response.json())
            .then(data => {
                if (data.token) {
                    localStorage.setItem("token", data.token);
                    localStorage.setItem("user", JSON.stringify(data.user));
                    showFlashMessage("Registration successful! Redirecting...", "success");
                    setTimeout(() => { window.location.href = "dashboard.html"; }, 1500);
                } else {
                    showFlashMessage(data.message, "danger");
                }
            })
            .catch(error => {
                console.error("Error:", error);
                showFlashMessage("An error occurred. Please try again.", "danger");
            });
        });
    }

    function showFlashMessage(message, type) {
        const flashMessages = document.getElementById("flash-messages");
        if (flashMessages) {
            flashMessages.innerHTML = `<div class="alert alert-${type}">${message}</div>`;
        }
    }
});


document.addEventListener("DOMContentLoaded", function () {
    const resetPasswordConfirmForm = document.querySelector("form");
    
    if (resetPasswordConfirmForm) {
        resetPasswordConfirmForm.addEventListener("submit", async function (e) {
            e.preventDefault();

            const password = document.getElementById("password").value;
            const confirmPassword = document.getElementById("confirm_password").value;

            // Ensure passwords match
            if (password !== confirmPassword) {
                alert("Passwords do not match!");
                return;
            }

            // Extract token from URL
            const urlParams = new URLSearchParams(window.location.search);
            const token = urlParams.get("token");

            if (!token) {
                alert("Invalid reset link.");
                return;
            }

            // Send password reset request
            try {
                const response = await fetch(`http://localhost:5000/api/auth/reset-password/${token}`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ password }),
                });

                const data = await response.json();
                alert(data.message);

                if (response.ok) {
                    setTimeout(() => { window.location.href = "login.html"; }, 2000);
                }
            } catch (error) {
                console.error("Error:", error);
                alert("An error occurred. Please try again.");
            }
        });
    }
});


document.addEventListener("DOMContentLoaded", function () {
    const resetPasswordForm = document.querySelector("form");
    
    if (resetPasswordForm) {
        resetPasswordForm.addEventListener("submit", async function (e) {
            e.preventDefault();

            const email = document.getElementById("email").value;

            // Send password reset request
            try {
                const response = await fetch("http://localhost:5000/api/auth/reset-password", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ email }),
                });

                const data = await response.json();
                alert(data.message);

                if (response.ok) {
                    setTimeout(() => { window.location.href = "login.html"; }, 2000);
                }
            } catch (error) {
                console.error("Error:", error);
                alert("An error occurred. Please try again.");
            }
        });
    }
});
