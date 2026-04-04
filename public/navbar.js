
async function loadNavbar() {
    const res = await fetch("navbar.html");
    const data = await res.text();

    const navbarContainer = document.getElementById("navbar-container");
    navbarContainer.innerHTML = data;

    document.getElementById("calendarBtn").onclick = () => {
        window.location.href = "calendars.html";
    };

    document.getElementById("loginBtn").onclick = () => {
        window.location.href = "login.html";
    };
}

// переходы
function goToCalendars() {
    window.location.href = "calendars.html";
}

function goToLogin() {
    window.location.href = "login.html";
}

// загружаем navbar при открытии страницы
loadNavbar();
