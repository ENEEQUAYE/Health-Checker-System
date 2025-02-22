document.addEventListener("DOMContentLoaded", async function () {
    const token = localStorage.getItem("token");
    
    if (!token) {
        window.location.href = "login.html"; // Redirect if not logged in
        return;
    }

    try {
        const response = await fetch("http://localhost:5000/api/users/dashboard", {
            method: "GET",
            headers: { Authorization: `Bearer ${token}` }
        });

        const data = await response.json();
        if (response.ok) {
            document.getElementById("username").textContent = data.user.username;
            document.getElementById("email").textContent = data.user.email;
        } else {
            alert("Session expired. Please log in again.");
            logout();
        }
    } catch (error) {
        console.error("Error:", error);
        logout();
    }

    document.getElementById("logout-btn").addEventListener("click", logout);
});

function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "login.html";
}
