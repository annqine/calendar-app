async function loadEvents() {
    const res = await fetch("/events");
    const data = await res.json();

    const container = document.getElementById("events");
    container.innerHTML = "";

    data.forEach(e => {
        container.innerHTML += `
            <div>
                <b>${e.date}</b>: ${e.text}
                <hr>
            </div>
        `;
    });
}

async function addEvent() {
    const date = document.getElementById("date").value;
    const text = document.getElementById("text").value;

    await fetch("/events", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ date, text })
    });

    loadEvents();
}

loadEvents();