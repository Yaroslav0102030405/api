import React, { useState, useEffect } from "react";

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
    <div className="bg-gray-100 p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">Список статей</h2>
      {posts.length === 0 ? (
        <p className="text-gray-600">Наразі немає статей.</p>
      ) : (
        <ul className="space-y-4">
          {posts.map((post) => (
            <li
              key={post._id}
              className="bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow flex justify-between items-center"
            >
              <div>
                <h3 className="text-xl font-semibold text-blue-600">
                  {post.title}
                </h3>
                <p className="text-gray-700 mt-2">{post.content}</p>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => onEditPost(post)}
                  className="px-3 py-1 bg-yellow-500 text-white text-sm font-medium rounded-md hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
                >
                  Редагувати
                </button>
                <button
                  onClick={() => onDeletePost(post._id)}
                  className="px-3 py-1 bg-red-500 text-white text-sm font-medium rounded-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
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
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">
        {postToEdit ? "Редагувати статтю" : "Створити нову статтю"}
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="title"
            className="block text-sm font-medium text-gray-700"
          >
            Назва статті
          </label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2"
            required
          />
        </div>
        <div>
          <label
            htmlFor="content"
            className="block text-sm font-medium text-gray-700"
          >
            Зміст статті
          </label>
          <textarea
            id="content"
            rows={4}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2"
            required
          ></textarea>
        </div>
        <div className="flex space-x-2">
          <button
            type="submit"
            className="w-full inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            {postToEdit ? "Оновити" : "Створити"}
          </button>
          {postToEdit && (
            <button
              type="button"
              onClick={() => setPostToEdit(null)}
              className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
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
    <div className="min-h-screen bg-gray-200 p-8 flex flex-col items-center font-sans">
      <h1 className="text-4xl font-extrabold mb-8 text-gray-900">Мій Блог</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-6xl">
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
