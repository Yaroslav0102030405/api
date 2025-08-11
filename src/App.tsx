import React, { useState, useEffect } from "react";
import "./App.css"; // Імпортуємо наш файл стилів

// Визначаємо інтерфейс для даних статті
interface Post {
  _id: string;
  title: string;
  content: string;
}

// Компонент для відображення списку статей
const PostList: React.FC<{
  posts: Post[];
  onDeletePost: (id: string) => void;
  onEditPost: (post: Post) => void;
}> = ({ posts, onDeletePost, onEditPost }) => {
  return (
    <div className="post-list">
      <h2 className="post-list-title">Список статей</h2>
      {posts.length === 0 ? (
        <p className="post-list-empty-message">Наразі немає статей.</p>
      ) : (
        <ul className="post-list-ul">
          {posts.map((post) => (
            <li key={post._id} className="post-list-item">
              <div>
                <h3 className="post-list-item-title">{post.title}</h3>
                <p className="post-list-item-content">{post.content}</p>
              </div>
              <div className="post-list-buttons">
                <button
                  onClick={() => onEditPost(post)}
                  className="edit-button"
                >
                  Редагувати
                </button>
                <button
                  onClick={() => onDeletePost(post._id)}
                  className="delete-button"
                >
                  Видалити
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

// Компонент для форми створення нової статті
const PostForm: React.FC<{
  onPostCreated: (newPost: Post) => void;
  onPostUpdated: (updatedPost: Post) => void;
  postToEdit: Post | null;
  setPostToEdit: (post: Post | null) => void;
}> = ({ onPostCreated, onPostUpdated, postToEdit, setPostToEdit }) => {
  const [title, setTitle] = useState<string>("");
  const [content, setContent] = useState<string>("");

  useEffect(() => {
    if (postToEdit) {
      setTitle(postToEdit.title);
      setContent(postToEdit.content);
    } else {
      setTitle("");
      setContent("");
    }
  }, [postToEdit]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    const postData = { title, content };

    try {
      if (postToEdit) {
        // Оновлюємо існуючу статтю
        const response = await fetch(
          `http://localhost:5000/api/posts/${postToEdit._id}`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(postData),
          }
        );

        if (!response.ok) throw new Error(`Error: ${response.status}`);
        const updatedPost: Post = await response.json();
        console.log("Стаття успішно оновлена:", updatedPost);
        onPostUpdated(updatedPost);
      } else {
        // Створюємо нову статтю
        const response = await fetch("http://localhost:5000/api/posts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(postData),
        });

        if (!response.ok) throw new Error(`Error: ${response.status}`);
        const createdPost: Post = await response.json();
        console.log("Стаття успішно створена:", createdPost);
        onPostCreated(createdPost);
      }

      // Очищаємо форму після виконання
      setTitle("");
      setContent("");
      setPostToEdit(null); // Виходимо з режиму редагування
    } catch (error) {
      console.error("Error submitting post:", error);
      alert("Помилка при збереженні статті.");
    }
  };

  return (
    <div className="post-form">
      <h2 className="post-form-title">
        {postToEdit ? "Редагувати статтю" : "Створити нову статтю"}
      </h2>
      <form onSubmit={handleSubmit} className="post-form-form">
        <div>
          <label htmlFor="title" className="post-form-label">
            Назва статті
          </label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="post-form-input"
            required
          />
        </div>
        <div>
          <label htmlFor="content" className="post-form-label">
            Зміст статті
          </label>
          <textarea
            id="content"
            rows={6}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="post-form-textarea"
            required
          ></textarea>
        </div>
        <div className="post-form-buttons">
          <button type="submit" className="submit-button">
            {postToEdit ? "Оновити" : "Створити"}
          </button>
          {postToEdit && (
            <button
              type="button"
              onClick={() => setPostToEdit(null)}
              className="cancel-button"
            >
              Скасувати
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

// Головний компонент App, що об'єднує інші компоненти
const App: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [postToEdit, setPostToEdit] = useState<Post | null>(null);

  // Завантажуємо пости лише один раз при першому рендерингу
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/posts");
        if (!response.ok) {
          throw new Error(`Error: ${response.status}`);
        }
        const data: Post[] = await response.json();
        setPosts(data);
      } catch (error) {
        console.error("Error fetching posts:", error);
      }
    };
    fetchPosts();
  }, []);

  // Ця функція оновлює стан, коли створено новий пост
  const handlePostCreated = (newPost: Post) => {
    setPosts((prevPosts) => [...prevPosts, newPost]);
  };

  // Ця функція видаляє пост за його ID
  const handleDeletePost = async (id: string) => {
    try {
      const response = await fetch(`http://localhost:5000/api/posts/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }

      // Фільтруємо список, щоб видалити пост
      setPosts((prevPosts) => prevPosts.filter((post) => post._id !== id));
      console.log(`Пост з ID ${id} успішно видалено.`);
    } catch (error) {
      console.error("Error deleting post:", error);
      alert("Помилка при видаленні статті.");
    }
  };

  // Ця функція оновлює стан, коли пост оновлено
  const handlePostUpdated = (updatedPost: Post) => {
    setPosts((prevPosts) =>
      prevPosts.map((post) =>
        post._id === updatedPost._id ? updatedPost : post
      )
    );
    setPostToEdit(null); // Виходимо з режиму редагування
  };

  return (
    <div className="app">
      <h1 className="app-title">Мій Блог</h1>
      <div className="app-container">
        <PostForm
          onPostCreated={handlePostCreated}
          onPostUpdated={handlePostUpdated}
          postToEdit={postToEdit}
          setPostToEdit={setPostToEdit}
        />
        <PostList
          posts={posts}
          onDeletePost={handleDeletePost}
          onEditPost={setPostToEdit}
        />
      </div>
    </div>
  );
};

export default App;
