const mongoose = require("mongoose");

const EventSchema = new mongoose.Schema({
    calendarId: { type: mongoose.Schema.Types.ObjectId, ref: "Calendar" },
    date: String,
    text: String,
    ownerId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    type: { type: String, default: "text" }, // text или image
    url: String, // для фото
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Event", EventSchema);