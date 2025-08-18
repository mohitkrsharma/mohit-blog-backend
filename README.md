# Blog Backend API

A RESTful API for a blog application built with Node.js, Express, and MongoDB.

## Project Overview

This project is a backend API for a blog application that allows users to create, read, update, and delete blog posts. It includes user authentication, authorization, and profile management. The API is built with Node.js, Express, and MongoDB, following RESTful principles and best practices.

## Project Architecture

This project follows a modular architecture with a clear separation of concerns:

```
blog-backend/
├── app.js                  # Express application setup
├── server.js               # Server entry point
├── config/                 # Configuration files
│   └── db.config.js        # Database connection configuration
├── controllers/            # Request handlers
│   ├── auth.controller.js  # Authentication logic (register, login, etc.)
│   └── blog.controller.js  # Blog post operations (CRUD)
├── middleware/             # Express middleware
│   ├── auth.middleware.js  # JWT authentication and authorization
│   └── error.middleware.js # Centralized error handling
├── models/                 # Database models
│   ├── blog.model.js       # Blog schema and methods
│   └── user.model.js       # User schema and methods
├── routes/                 # API routes
│   ├── auth.routes.js      # Authentication endpoints
│   └── blog.routes.js      # Blog endpoints
├── uploads/                # Storage for uploaded files
└── utils/                  # Utility functions
    └── jwt.utils.js        # JWT token generation and verification
```

### Key Components

1. **Server Setup**

   - `server.js`: Entry point that starts the Express server and connects to MongoDB
   - `app.js`: Configures the Express application, middleware, and routes

2. **Database**

   - MongoDB with Mongoose ORM for data modeling
   - Models for User and Blog entities with validation
   - Automatic timestamps for created and updated dates

3. **Authentication**

   - JWT-based authentication with token expiration
   - User registration with automatic profile picture generation
   - Secure login with password hashing using bcrypt
   - Protected routes requiring authentication
   - Role-based authorization (admin vs regular users)

4. **Blog Management**

   - CRUD operations for blog posts
   - Pagination for blog listing
   - Author-only access for updating and deleting blogs
   - Automatic featured image generation using Picsum Photos API

5. **Middleware**
   - Authentication middleware to protect routes
   - Authorization middleware to check user roles and ownership
   - Error handling middleware for consistent error responses
   - CORS middleware for cross-origin requests
   - Request logging with Morgan

## Data Models

### User Model

```javascript
{
  firstName: {
    type: String,
    required: true,        // First name is required
    trim: true             // Removes whitespace from both ends
  },
  lastName: {
    type: String,
    required: true,        // Last name is required
    trim: true             // Removes whitespace from both ends
  },
  email: {
    type: String,
    required: true,        // Email is required
    unique: true,          // Email must be unique
    trim: true,            // Removes whitespace from both ends
    lowercase: true,       // Converts email to lowercase
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email address']
  },
  password: {
    type: String,
    required: true,        // Password is required
    minlength: 6           // Password must be at least 6 characters long
    // Password is hashed before saving using bcrypt
  },
  profilePic: {
    type: String,
    default: function() {  // Automatically generated based on user's name
      return `https://ui-avatars.com/api/?name=${this.firstName}+${this.lastName}`;
    }
  },
  userType: {
    type: String,
    enum: ['admin', 'user'], // Only these values are allowed
    default: 'user'         // Default value is 'user'
  },
  createdAt: Date,         // Automatically added by timestamps
  updatedAt: Date          // Automatically added by timestamps
}
```

#### User Model Methods

- **comparePassword(candidatePassword)**: Compares a candidate password with the hashed password
- **getFullName()**: Returns the user's full name by combining firstName and lastName

### Blog Model

```javascript
{
  title: {
    type: String,
    required: true,        // Title is required
    trim: true             // Removes whitespace from both ends
  },
  content: {
    type: String,
    required: true         // Content is required
  },
  featuredImage: {
    type: String,
    default: function() {  // Automatically generated based on title
      const seed = this.title.length * 5;
      return `https://picsum.photos/seed/${seed}/800/400`;
    }
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',           // References the User model
    required: true         // Author is required
  },
  createdAt: Date,         // Automatically added by timestamps
  updatedAt: Date          // Automatically added by timestamps
}
```

#### Blog Model Features

- **Author Population**: When querying blogs, the author information is automatically populated with firstName, lastName, email, and profilePic
- **getSummary(length)**: Returns a truncated version of the blog content for previews

## API Endpoints

### Authentication

| Method | Endpoint                            | Description                              | Authentication |
| ------ | ----------------------------------- | ---------------------------------------- | -------------- |
| POST   | /api/auth/register                  | Register a new user                      | No             |
| POST   | /api/auth/login                     | Login a user                             | No             |
| POST   | /api/auth/forgot-password           | Request password reset (sends email)     | No             |
| POST   | /api/auth/reset-password/:token     | Reset password using emailed token       | No             |
| PUT    | /api/auth/reset-password            | Reset password (logged-in user)          | Yes            |
| GET    | /api/auth/me                        | Get current user profile                 | Yes            |

#### Authentication Endpoints Examples

##### Register a new user

**Request:**
```http
POST /api/auth/register
Content-Type: application/json

{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john.doe@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "60d21b4667d0d8992e610c85",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john.doe@example.com",
    "profilePic": "https://ui-avatars.com/api/?name=John+Doe",
    "userType": "user"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

##### Login a user

**Request:**
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john.doe@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "60d21b4667d0d8992e610c85",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john.doe@example.com",
    "profilePic": "https://ui-avatars.com/api/?name=John+Doe",
    "userType": "user"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

##### Request password reset

**Request:**
```http
POST /api/auth/forgot-password
Content-Type: application/json

{
  "email": "john.doe@example.com"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Password reset email sent"
}
```

##### Reset password (logged-in user)

Note: This endpoint requires a valid JWT token. The new password must be at least 6 characters. If confirmNewPassword is provided, it must match newPassword.

**Request:**
```http
PUT /api/auth/reset-password
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "newPassword": "newpassword123",
  "confirmNewPassword": "newpassword123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Password updated successfully"
}
```

##### Get current user profile

**Request:**
```http
GET /api/auth/me
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "60d21b4667d0d8992e610c85",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john.doe@example.com",
    "profilePic": "https://ui-avatars.com/api/?name=John+Doe",
    "userType": "user"
  }
}
```

### Blog Posts

| Method | Endpoint       | Description              | Authentication    |
| ------ | -------------- | ------------------------ | ----------------- |
| GET    | /api/blogs     | Get all blog posts       | No                |
| GET    | /api/blogs/:id | Get a specific blog post | No                |
| POST   | /api/blogs     | Create a new blog post   | Yes               |
| PUT    | /api/blogs/:id | Update a blog post       | Yes (author only) |
| DELETE | /api/blogs/:id | Delete a blog post       | Yes (author only) |

#### Blog Endpoints Examples

##### Get all blog posts

**Request:**
```http
GET /api/blogs?page=1&limit=10
```

**Response:**
```json
{
  "success": true,
  "count": 2,
  "pagination": {
    "total": 2,
    "page": 1,
    "pages": 1
  },
  "data": [
    {
      "_id": "60d21b4667d0d8992e610c86",
      "title": "Getting Started with Node.js",
      "content": "Node.js is a JavaScript runtime built on Chrome's V8 JavaScript engine...",
      "featuredImage": "https://picsum.photos/seed/123/800/400",
      "author": {
        "_id": "60d21b4667d0d8992e610c85",
        "firstName": "John",
        "lastName": "Doe",
        "email": "john.doe@example.com",
        "profilePic": "https://ui-avatars.com/api/?name=John+Doe"
      },
      "createdAt": "2023-01-01T12:00:00.000Z",
      "updatedAt": "2023-01-01T12:00:00.000Z"
    },
    {
      "_id": "60d21b4667d0d8992e610c87",
      "title": "Introduction to Express.js",
      "content": "Express is a minimal and flexible Node.js web application framework...",
      "featuredImage": "https://picsum.photos/seed/456/800/400",
      "author": {
        "_id": "60d21b4667d0d8992e610c85",
        "firstName": "John",
        "lastName": "Doe",
        "email": "john.doe@example.com",
        "profilePic": "https://ui-avatars.com/api/?name=John+Doe"
      },
      "createdAt": "2023-01-02T12:00:00.000Z",
      "updatedAt": "2023-01-02T12:00:00.000Z"
    }
  ]
}
```

##### Get a specific blog post

**Request:**
```http
GET /api/blogs/60d21b4667d0d8992e610c86
```

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "60d21b4667d0d8992e610c86",
    "title": "Getting Started with Node.js",
    "content": "Node.js is a JavaScript runtime built on Chrome's V8 JavaScript engine...",
    "featuredImage": "https://picsum.photos/seed/123/800/400",
    "author": {
      "_id": "60d21b4667d0d8992e610c85",
      "firstName": "John",
      "lastName": "Doe",
      "email": "john.doe@example.com",
      "profilePic": "https://ui-avatars.com/api/?name=John+Doe"
    },
    "createdAt": "2023-01-01T12:00:00.000Z",
    "updatedAt": "2023-01-01T12:00:00.000Z"
  }
}
```

##### Create a new blog post

**Request:**
```http
POST /api/blogs
Content-Type: application/json
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

{
  "title": "MongoDB Basics",
  "content": "MongoDB is a source-available cross-platform document-oriented database program..."
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "60d21b4667d0d8992e610c88",
    "title": "MongoDB Basics",
    "content": "MongoDB is a source-available cross-platform document-oriented database program...",
    "featuredImage": "https://picsum.photos/seed/789/800/400",
    "author": {
      "_id": "60d21b4667d0d8992e610c85",
      "firstName": "John",
      "lastName": "Doe",
      "email": "john.doe@example.com",
      "profilePic": "https://ui-avatars.com/api/?name=John+Doe"
    },
    "createdAt": "2023-01-03T12:00:00.000Z",
    "updatedAt": "2023-01-03T12:00:00.000Z"
  }
}
```

##### Update a blog post

**Request:**
```http
PUT /api/blogs/60d21b4667d0d8992e610c88
Content-Type: application/json
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

{
  "title": "MongoDB Basics and Advanced Concepts",
  "content": "MongoDB is a source-available cross-platform document-oriented database program. This updated post covers both basics and advanced concepts..."
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "60d21b4667d0d8992e610c88",
    "title": "MongoDB Basics and Advanced Concepts",
    "content": "MongoDB is a source-available cross-platform document-oriented database program. This updated post covers both basics and advanced concepts...",
    "featuredImage": "https://picsum.photos/seed/789/800/400",
    "author": {
      "_id": "60d21b4667d0d8992e610c85",
      "firstName": "John",
      "lastName": "Doe",
      "email": "john.doe@example.com",
      "profilePic": "https://ui-avatars.com/api/?name=John+Doe"
    },
    "createdAt": "2023-01-03T12:00:00.000Z",
    "updatedAt": "2023-01-03T13:00:00.000Z"
  }
}
```

##### Delete a blog post

**Request:**
```http
DELETE /api/blogs/60d21b4667d0d8992e610c88
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response:**
```json
{
  "success": true,
  "data": {}
}
```

## Error Handling

The API uses a centralized error handling mechanism to ensure consistent error responses across all endpoints.

### Error Response Format

```json
{
  "success": false,
  "message": "Error message describing what went wrong",
  "errors": {
    "field1": "Validation error for field1",
    "field2": "Validation error for field2"
  },
  "stack": "Stack trace (only in development mode)"
}
```

### Common Error Types

| Status Code | Error Type                | Description                                           |
| ----------- | ------------------------- | ----------------------------------------------------- |
| 400         | Validation Error          | Invalid input data (missing fields, invalid format)   |
| 400         | Duplicate Field           | Unique constraint violation (e.g., email already exists) |
| 400         | Invalid ID                | Invalid MongoDB ObjectId format                       |
| 401         | Authentication Error      | Invalid or missing JWT token                          |
| 403         | Authorization Error       | Valid token but insufficient permissions              |
| 404         | Not Found                 | Resource not found                                    |
| 500         | Server Error              | Unexpected server error                               |

### Error Handling Examples

#### Validation Error

```json
{
  "success": false,
  "message": "Validation Error",
  "errors": {
    "email": "Please provide a valid email address",
    "password": "Password must be at least 6 characters long"
  }
}
```

#### Authentication Error

```json
{
  "success": false,
  "message": "Not authorized, token failed"
}
```

#### Resource Not Found

```json
{
  "success": false,
  "message": "Blog not found"
}
```

## Authentication Flow

1. **Registration**:

   - User submits registration data (firstName, lastName, email, password)
   - System checks if email already exists
   - Password is hashed using bcrypt with salt
   - Profile picture is automatically generated using UI Avatars API
   - User is created in the database with default userType of 'user'
   - JWT token is generated containing user ID and userType
   - Response includes user data (excluding password) and JWT token

2. **Login**:

   - User submits email and password
   - System finds user by email
   - Password is verified against the hashed password using bcrypt
   - JWT token is generated containing user ID and userType
   - Response includes user data (excluding password) and JWT token

3. **Protected Routes**:
   - Client includes JWT token in Authorization header as "Bearer {token}"
   - Auth middleware extracts and verifies the token
   - If token is valid, user is retrieved from database
   - User object is attached to the request for use in route handlers
   - If token is invalid or missing, 401 Unauthorized response is returned

4. **Authorization Checks**:
   - For role-based authorization, middleware checks user's userType
   - For ownership-based authorization (e.g., updating a blog), middleware checks if user is the author
   - If authorization check fails, 403 Forbidden response is returned

## Setup and Installation

### Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or Atlas)
- npm or yarn

### Installation Steps

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd blog-backend
   ```

2. **Install dependencies**

   ```bash
   npm install
   # or
   yarn install
   ```

3. **Environment Variables**
   Create a `.env` file in the root directory with the following variables:

   ```
   # Server Configuration
   PORT=5000
   NODE_ENV=development

   # MongoDB Connection
   MONGO_URI=mongodb://127.0.0.1:27017/blogdb
   # For MongoDB Atlas:
   # MONGO_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/blogdb

   # JWT Configuration
   JWT_SECRET=your_jwt_secret_key_should_be_long_and_random

   # App URLs (used for building reset links)
   # FRONTEND_URL is preferred if you have a separate frontend app route like https://app.example.com
   # APP_URL falls back to backend origin, e.g., http://localhost:5000
   FRONTEND_URL=http://localhost:3000
   APP_URL=http://localhost:5000

   # Email (SMTP) Configuration
   # If not provided, emails are logged to console instead of being sent
   SMTP_HOST=smtp.example.com
   SMTP_PORT=587
   SMTP_SECURE=false
   SMTP_USER=your_smtp_username
   SMTP_PASS=your_smtp_password
   EMAIL_FROM="Blog App <no-reply@example.com>"
   ```

   > **Note**: In production, use a strong, random string for JWT_SECRET

4. **Create uploads directory**

   ```bash
   mkdir uploads
   ```

5. **Start the server**

   For production:
   ```bash
   npm start
   ```

   For development with auto-reload:
   ```bash
   npm run dev
   ```

6. **Verify installation**

   The server should be running at http://localhost:5000

   You can test the API by sending a GET request to the root endpoint:
   ```bash
   curl http://localhost:5000
   # Expected response: {"message":"Welcome to Blog API"}
   ```

### API Testing

You can test the API endpoints using tools like:
- [Postman](https://www.postman.com/)
- [Insomnia](https://insomnia.rest/)
- [curl](https://curl.se/) command-line tool

## Technologies Used

### Core Technologies

- **Node.js**: JavaScript runtime environment for server-side execution
- **Express**: Fast, unopinionated, minimalist web framework for Node.js
- **MongoDB**: NoSQL document database for storing application data
- **Mongoose**: MongoDB object modeling tool designed to work in an asynchronous environment

### Authentication & Security

- **JSON Web Tokens (JWT)**: Secure method for authentication and information exchange
- **bcrypt.js**: Library for hashing passwords securely
- **cors**: Package for enabling Cross-Origin Resource Sharing

### Development Tools

- **dotenv**: Module for loading environment variables from .env files
- **morgan**: HTTP request logger middleware for Node.js
- **nodemon**: Utility that monitors for changes and automatically restarts the server (development only)

### File Handling

- **express.static**: Express middleware for serving static files
- **path**: Node.js module for working with file and directory paths
