const express = require("express");
const mongoose = require("mongoose");
const Event = require("./models/Event");
const path = require("path");

const app = express();

console.log("Старт файла");

// подключение к MongoDB
mongoose.connect("mongodb://127.0.0.1:27017/calendar")
    .then(() => console.log("MongoDB connected"))
    .catch(err => console.log(err));

app.listen(3000, () => {
    console.log("Server started on http://localhost:3000");
});

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

app.get("/events", async (req, res) => {
    const events = await Event.find();
    res.json(events);
});

app.post("/events", async (req, res) => {
    const newEvent = new Event({
        date: req.body.date,
        text: req.body.text
    });

    await newEvent.save();
    res.json(newEvent);
});

app.get("/", (req, res) => {
    res.sendFile(path.resolve(__dirname, "public", "index.html"));
});