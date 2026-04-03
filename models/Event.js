const mongoose = require("mongoose");

const EventSchema = new mongoose.Schema({
    date: String,      // дата
    text: String,      // заметка
    image: String      // имя файла картинки
});

module.exports = mongoose.model("Event", EventSchema);