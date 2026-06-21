# BlogSpace — Full Stack Blog App 📝

A full-stack **Blog Platform** built with the **MERN Stack** where users can read, write, and share stories.

![MERN Stack](https://img.shields.io/badge/MERN-Stack-blue?style=for-the-badge)
![Status](https://img.shields.io/badge/Status-Live-success?style=for-the-badge)

---

## 🚀 Live Demo

- **Frontend:** your_vercel_frontend_url
- **Backend API:** your_vercel_backend_url

---

## ✨ Features

- 🔐 User Authentication (Register/Login with JWT)
- ✍️ Create, Edit, Delete Blog Posts
- 🖼️ Cover Image Upload (Cloudinary)
- 🔖 Save Posts to read later
- ❤️ Like/Unlike Posts
- 🔍 Search Posts by title or tags
- 📂 Filter by Category
- 👤 User Profile with Avatar Upload/Remove
- 📊 Dashboard with stats (Views, Likes, Posts)
- 📱 Fully Responsive (Mobile + Desktop)

---

## 🛠️ Tech Stack

### Frontend

- React.js (Vite)
- React Router DOM
- Axios
- React Hot Toast

### Backend

- Node.js + Express.js
- MongoDB + Mongoose
- JWT Authentication
- Cloudinary (Image Upload)
- Multer

---

## 📁 Project Structure

```
blog-app/
├── backend/
│ ├── config/ # DB + Cloudinary config
│ ├── controllers/ # Route logic
│ ├── middleware/ # Auth + Upload middleware
│ ├── models/ # User + Post schemas
│ ├── routes/ # API routes
│ └── server.js
│
├── frontend/
│ ├── src/
│ │ ├── api/ # Axios config
│ │ ├── components/ # Navbar, PostCard
│ │ ├── context/ # Auth context
│ │ └── pages/ # All pages
```

---

## ⚙️ Run Locally

### 1. Clone the repo

```bash
git clone https://github.com/Malaikaa903/blog-app-mern.git
cd blog-app-mern
```

### 2. Backend Setup

```bash
cd backend
npm install
```

Create `.env`:

```
PORT=5000
MONGO_URI=your_mongodb_uri
JWT_SECRET=your_secret
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

```bash
npm run dev
```

### 3. Frontend Setup

```bash
cd ../frontend
npm install
npm run dev
```

---

## 🔗 API Endpoints

### Auth

| Method | Endpoint                | Description   |
| ------ | ----------------------- | ------------- |
| POST   | /api/auth/register      | Register      |
| POST   | /api/auth/login         | Login         |
| PUT    | /api/auth/avatar        | Update avatar |
| PUT    | /api/auth/avatar/remove | Remove avatar |

### Posts

| Method | Endpoint              | Description      |
| ------ | --------------------- | ---------------- |
| GET    | /api/posts            | Get all posts    |
| GET    | /api/posts/slug/:slug | Get post by slug |
| GET    | /api/posts/my-posts   | Get my posts     |
| POST   | /api/posts            | Create post      |
| PUT    | /api/posts/:id        | Update post      |
| DELETE | /api/posts/:id        | Delete post      |
| PUT    | /api/posts/:id/like   | Like/Unlike      |

---

## 👩‍💻 Author

**Malaika Tabassum**

- GitHub: [@Malaikaa903](https://github.com/Malaikaa903)
- LinkedIn: [Malaika Tabassum](https://linkedin.com/in/malaika-tabassum-a29420371)
- Email: malaikatabassum83@gmail.com

---

⭐ If you found this helpful, please give it a star!
