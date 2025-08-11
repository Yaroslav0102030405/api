import express from "express";
import type { Request, Response } from "express";
import cors from "cors";
import mongoose from "mongoose";

import dotenv from "dotenv";
dotenv.config();

// Імпортуємо змінні середовища з файлу .env
const mongoDbUrl = process.env.MONGO_DB_URL;

// Функція для підключення до бази даних MongoDB.
async function connectToMongoDB() {
  // Перевірка, чи існує URL. Якщо ні, викидаємо помилку.
  if (!mongoDbUrl) {
    console.error("Помилка: Змінна середовища MONGO_DB_URL не визначена.");
    // Завершуємо процес, оскільки без URL вона не може працювати
    process.exit(1);
  }

  try {
    // Явно вказуємо TypeScript, що mongoDbUrl не буде undefined завдяки попередній перевірці
    await mongoose.connect(mongoDbUrl);
    console.log("Успішно підключено до MongoDB!");
  } catch (error) {
    console.error("Помилка підключення до MongoDB:", error);
    process.exit(1); // Завершуємо процес, якщо не вдалося підключитися
  }
}

// Визначаємо схему для моделі Post
const postSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
});

// Створюємо модель Post на основі схеми
const Post = mongoose.model("Post", postSchema);

// --- Налаштування Express-сервера ---

const app = express();
const port = 5000;

app.use(cors());
app.use(express.json());

// Маршрут для отримання всіх статей з бази даних
app.get("/api/posts", async (req: Request, res: Response) => {
  try {
    console.log("Отримано запит на /api/posts");
    const posts = await Post.find({});
    res.json(posts);
  } catch (error) {
    console.error("Помилка при отриманні даних з MongoDB:", error);
    res.status(500).json({ message: "Помилка сервера" });
  }
});

// Маршрут для додавання статті в базу даних
app.post("/api/posts", async (req: Request, res: Response) => {
  try {
    console.log("Отримано запит POST на /api/posts");
    const { title, content } = req.body;
    const newPost = await Post.create({ title, content });
    console.log("Створено нову статтю:", newPost);
    res.status(201).json(newPost);
  } catch (error) {
    console.error("Помилка при додаванні статті в MongoDB:", error);
    res.status(500).json({ message: "Помилка сервера" });
  }
});

// Маршрут для оновлення статті за її ID
app.put("/api/posts/:id", async (req: Request, res: Response) => {
  try {
    console.log(`Отримано запит PUT на /api/posts/${req.params.id}`);
    const { id } = req.params;
    const { title, content } = req.body;
    const updatedPost = await Post.findByIdAndUpdate(
      id,
      { title, content },
      { new: true }
    );

    if (!updatedPost) {
      return res.status(404).json({ message: "Стаття не знайдена" });
    }

    console.log(`Стаття з ID ${id} оновлена:`, updatedPost);
    res.json(updatedPost);
  } catch (error) {
    console.error("Помилка при оновленні статті в MongoDB:", error);
    res.status(500).json({ message: "Помилка сервера" });
  }
});

// Маршрут для видалення статті за її ID
app.delete("/api/posts/:id", async (req: Request, res: Response) => {
  try {
    console.log(`Отримано запит DELETE на /api/posts/${req.params.id}`);
    const { id } = req.params;
    const deletedPost = await Post.findByIdAndDelete(id);

    if (!deletedPost) {
      return res.status(404).json({ message: "Стаття не знайдена" });
    }

    console.log(`Стаття з ID ${id} успішно видалена.`);
    res.status(200).json({ message: "Стаття успішно видалена" });
  } catch (error) {
    console.error("Помилка при видаленні статті з MongoDB:", error);
    res.status(500).json({ message: "Помилка сервера" });
  }
});

// Запускаємо сервер
async function startServer() {
  await connectToMongoDB(); // Підключаємося до БД
  app.listen(port, () => {
    console.log(`Сервер працює на http://localhost:${port}`);
  });
}

// Запускаємо підключення до бази даних та сервер
startServer();
