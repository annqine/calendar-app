// express → сервер
// mongoose → работа с MongoDB
// socket.io → обновление в реальном времени
// multer → загрузка файлов

const express = require("express");
const mongoose = require("mongoose");
const Event = require("./models/Event");
const path = require("path");
const bcrypt = require("bcrypt");
const User = require("./models/User");
const Calendar = require("./models/Calendar");
const PORT = 3000;

const http = require("http");
const { Server } = require("socket.io");

const app = express();

console.log("Старт файла");

// подключение к MongoDB
mongoose.connect("mongodb://127.0.0.1:27017/calendar")
    .then(() => console.log("MongoDB connected"))
    .catch(err => console.log(err));

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

app.get("/events", async (req, res) => {
    const calendarId = req.query.calendarId; // передаем ID календаря через URL
    if (!calendarId) return res.status(400).json({ message: "calendarId не передан" });

    const events = await Event.find({ calendarId })
        .populate("ownerId", "email"); // добавляем email владельца

    res.json(events);
});

app.post("/events", async (req, res) => {
    const { calendarId, date, text, ownerId } = req.body;
    const newEvent = new Event({
        calendarId,
        date,
        text,
        ownerId,
        type: req.body.type || "text",
        url: req.body.url || ""
    });

    await newEvent.save();
    res.json(newEvent);

    io.to(calendarId).emit("receiveEvent", newEvent);
});

const server = http.createServer(app);
const io = new Server(server);

io.on("connection", (socket) => {
    console.log("Пользователь подключился:", socket.id);

    socket.on("joinCalendar", (calendarId) => {
        socket.join(calendarId);
        console.log(`Пользователь ${socket.id} присоединился к календарю ${calendarId}`);
    });

    socket.on("newEvent", (event) => {
        io.to(event.calendarId).emit("receiveEvent", event);
    });
});

server.listen(PORT, () => {
    console.log(`Server started on http://localhost:${PORT}`);
});

app.get("/", (req, res) => {
    res.sendFile(path.resolve(__dirname, "public", "index.html"));
});

// регистрация
app.post("/register", async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) return res.status(400).json({ message: "Email и пароль обязательны" });

    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: "Пользователь уже существует" });

    const hash = await bcrypt.hash(password, 10); // хешируем пароль
    const user = new User({ email, passwordHash: hash });
    await user.save();

    res.json({ message: "Пользователь зарегистрирован" });
});

// вход
app.post("/login", async (req, res) => {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Пользователь не найден" });

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) return res.status(400).json({ message: "Неверный пароль" });

    res.json({ message: "Вход успешен", userId: user._id });
});



// создать календарь
app.post("/calendars", async (req, res) => {
    const { name, ownerId } = req.body;
    console.log("Создаём календарь:", req.body);
    if (!name || !ownerId) return res.status(400).json({ message: "Нужно имя и id владельца" });

    const calendar = new Calendar({ name, ownerId, participants: [{ userId: ownerId, role: "edit" }] });
    await calendar.save();
    res.json(calendar);
    
});

// получить все календари пользователя
app.get("/calendars/:userId", async (req, res) => {
    const userId = req.params.userId;
    if (!userId) return res.status(400).json({ message: "userId не передан" });
    const calendars = await Calendar.find({
        $or: [
            { ownerId: userId },
            { "participants.userId": userId }
        ]
    });
    res.json(calendars);
});

// добавить участника к календарю
app.post("/calendars/:calendarId/add-participant", async (req, res) => {
    const { email, role } = req.body; // email участника и роль: view / edit
    const calendarId = req.params.calendarId;

    const calendar = await Calendar.findById(calendarId);
    if (!calendar) return res.status(404).json({ message: "Календарь не найден" });

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "Пользователь не найден" });

    // проверяем, есть ли уже участник
    const exists = calendar.participants.find(p => p.userId.equals(user._id));
    if (exists) return res.status(400).json({ message: "Пользователь уже в календаре" });

    calendar.participants.push({ userId: user._id, role: role || "view" });
    await calendar.save();

    res.json({ message: "Пользователь добавлен", calendar });
});

app.post("/calendars/:calendarId/remove-participant", async (req, res) => {
    const { userId } = req.body;
    const calendar = await Calendar.findById(req.params.calendarId);

    calendar.participants = calendar.participants.filter(
        p => !p.userId.equals(userId)
    );

    await calendar.save();
    res.json({ message: "Удалено" });
});