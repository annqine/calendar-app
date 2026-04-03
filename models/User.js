const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    passwordHash: { type: String, required: true }
});//bcrypt для хеширования паролей

module.exports = mongoose.model("User", userSchema);