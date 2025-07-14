# Blog Backend API

A RESTful API for a blog application built with Node.js, Express, and MongoDB.

## Project Architecture

This project follows a modular architecture with clear separation of concerns:

```
blog-backend/
├── app.js                  # Express application setup
├── server.js               # Server entry point
├── config/                 # Configuration files
│   └── db.config.js        # Database connection
├── controllers/            # Request handlers
│   ├── auth.controller.js  # Authentication logic
│   └── blog.controller.js  # Blog post operations
├── middleware/             # Express middleware
│   ├── auth.middleware.js  # JWT authentication
│   └── error.middleware.js # Error handling
├── models/                 # Database models
│   ├── blog.model.js       # Blog schema
│   └── user.model.js       # User schema
├── routes/                 # API routes
│   ├── auth.routes.js      # Authentication endpoints
│   └── blog.routes.js      # Blog endpoints
├── uploads/                # Storage for uploaded files
└── utils/                  # Utility functions
    └── jwt.utils.js        # JWT token generation
```

### Key Components

1. **Server Setup**
   - `server.js`: Entry point that starts the Express server
   - `app.js`: Configures the Express application, middleware, and routes

2. **Database**
   - MongoDB with Mongoose ORM
   - Models for User and Blog entities

3. **Authentication**
   - JWT-based authentication
   - User registration, login, and profile management
   - Password hashing with bcrypt

4. **Blog Management**
   - CRUD operations for blog posts
   - File uploads for profile pictures and blog images

5. **Middleware**
   - Authentication middleware to protect routes
   - Error handling middleware for consistent error responses

## Data Models

### User Model
```javascript
{
  firstName: String,       // Required
  lastName: String,        // Required
  email: String,           // Required, Unique
  password: String,        // Required, Hashed
  profilePic: String,      // Optional, file path
  userType: String,        // 'admin' or 'user', default: 'user'
  createdAt: Date,         // Automatically added
  updatedAt: Date          // Automatically added
}
```

### Blog Model
```javascript
{
  title: String,           // Required
  content: String,         // Required
  featuredImage: String,   // Optional, file path
  author: ObjectId,        // Required, reference to User
  createdAt: Date,         // Automatically added
  updatedAt: Date          // Automatically added
}
```

## API Endpoints

### Authentication

| Method | Endpoint | Description | Authentication |
|--------|----------|-------------|----------------|
| POST | /api/auth/register | Register a new user | No |
| POST | /api/auth/login | Login a user | No |
| POST | /api/auth/forgot-password | Request password reset | No |
| GET | /api/auth/me | Get current user profile | Yes |

### Blog Posts

| Method | Endpoint | Description | Authentication |
|--------|----------|-------------|----------------|
| GET | /api/blogs | Get all blog posts | No |
| GET | /api/blogs/:id | Get a specific blog post | No |
| POST | /api/blogs | Create a new blog post | Yes |
| PUT | /api/blogs/:id | Update a blog post | Yes (author only) |
| DELETE | /api/blogs/:id | Delete a blog post | Yes (author only) |

## File Upload

The application uses Multer for handling file uploads:
- Profile pictures during user registration
- Featured images for blog posts

Files are stored in the `uploads/` directory and served as static files.

## Authentication Flow

1. **Registration**:
   - User submits registration form with profile picture
   - Password is hashed using bcrypt
   - User is created in the database
   - JWT token is generated and returned

2. **Login**:
   - User submits email and password
   - Password is verified against the hashed password
   - JWT token is generated and returned

3. **Protected Routes**:
   - Client includes JWT token in Authorization header
   - Auth middleware verifies the token
   - User object is attached to the request

## Setup and Installation

1. **Clone the repository**
   ```
   git clone <repository-url>
   cd blog-backend
   ```

2. **Install dependencies**
   ```
   npm install
   ```

3. **Environment Variables**
   Create a `.env` file with the following variables:
   ```
   PORT=5000
   MONGO_URI=mongodb://localhost:27017/blog-app
   JWT_SECRET=your_jwt_secret_key
   ```

4. **Create uploads directory**
   ```
   mkdir uploads
   ```

5. **Start the server**
   ```
   npm start
   ```
   For development with auto-reload:
   ```
   npm run dev
   ```

## Technologies Used

- **Node.js**: JavaScript runtime
- **Express**: Web framework
- **MongoDB**: NoSQL database
- **Mongoose**: MongoDB object modeling
- **JWT**: JSON Web Tokens for authentication
- **bcrypt**: Password hashing
- **Multer**: File upload handling
- **dotenv**: Environment variable management
- **cors**: Cross-Origin Resource Sharing
