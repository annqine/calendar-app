// calendarUtils.js

const socket = io();

// Копирование ID календаря
function copyCalendarId(id) {
    navigator.clipboard.writeText(id);
    alert("ID скопирован!");
}

// Модальное окно
function openModal(html) {
    document.getElementById("modalBody").innerHTML = html;
    document.getElementById("modal").classList.remove("hidden");
}

function closeModal() {
    document.getElementById("modal").classList.add("hidden");
}

// Загрузка календарей
async function loadCalendars(containerId) {
    const userId = localStorage.getItem("userId");
    if (!userId) return alert("Ошибка: userId не найден");

    const res = await fetch("/calendars/" + userId);
    const data = await res.json();
    const container = document.getElementById(containerId);
    container.innerHTML = "";

    data.forEach(cal => {
        const card = document.createElement("div");
        card.className = "calendar-card";

        card.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center;">
                <h3 style="margin:0;">${cal.name}</h3>
                <div class="calendar-header" style="display:flex; align-items:center; gap:5px;">
                    <span>ID</span>
                    <button onclick="copyCalendarId('${cal._id}', event)">📋</button>
                </div>
            </div>
            <div class="calendar-buttons">
                <button onclick="showParticipants('${cal._id}', event)">Участники</button>
                <button onclick="showOwner('${cal.ownerId}', event)">Владелец</button>
                <button onclick="selectCalendar('${cal._id}', event)">Добавить запись</button>
            </div>
        `;

        // Клик по карточке
        card.onclick = (e) => {
            if (e.target.tagName !== "BUTTON") {
                localStorage.setItem("currentCalendarId", cal._id);
                window.location.href = "calendar.html";
            }
        };

        // Подсказка по участникам
        card.onmouseenter = () => {
            const participants = cal.participants?.map(p => p.userId).join(", ") || "-";
            card.title = `Участники: ${participants}\nВладелец: ${cal.ownerId}`;
        };

        container.appendChild(card);
    });
}

// Показ участников
async function showParticipants(calendarId) {
    const res = await fetch("/calendars/" + localStorage.getItem("userId"));
    const calendars = await res.json();
    const cal = calendars.find(c => c._id === calendarId);

    let html = "<h3>Участники</h3>";
    cal.participants?.forEach(p => {
        html += `<div>${p.userId} (${p.role}) <button onclick="removeParticipant('${calendarId}','${p.userId}')">❌</button></div>`;
    });

    html += `<hr>
        <input id="newEmail" placeholder="Email">
        <select id="newRole">
            <option value="view">view</option>
            <option value="edit">edit</option>
        </select>
        <button onclick="addParticipantFromModal('${calendarId}')">Добавить</button>`;

    openModal(html);
}

// Добавить участника из модального окна
async function addParticipantFromModal(calendarId) {
    const email = document.getElementById("newEmail").value;
    const role = document.getElementById("newRole").value;

    await fetch(`/calendars/${calendarId}/add-participant`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, role })
    });

    showParticipants(calendarId);
}

// Удаление участника
async function removeParticipant(calendarId, userId) {
    await fetch(`/calendars/${calendarId}/remove-participant`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId })
    });

    showParticipants(calendarId);
}

// Показ владельца
function showOwner(ownerId) {
    openModal(`<h3>Владелец</h3><p>${ownerId}</p>`);
}

// Выбор календаря для добавления событий
function selectCalendar(calendarId) {
    localStorage.setItem("currentCalendarId", calendarId);
    socket.emit("joinCalendar", calendarId);
    if (typeof loadEvents === "function") loadEvents();
}