const mongoose = require("mongoose");

const calendarSchema = new mongoose.Schema({
    name: { type: String, required: true },
    ownerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    participants: [
        {
            userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
            role: { type: String, enum: ["view", "edit"], default: "view" }
        }
    ]
});

module.exports = mongoose.model("Calendar", calendarSchema);