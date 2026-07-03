# Geeta GPT Backend API 🕉️

Node.js + Express + MongoDB backend with Firebase Authentication integration.

## 🔥 Authentication System

This backend integrates with **Firebase Authentication** for user authentication while maintaining user data in MongoDB.

### Authentication Architecture

```
Firebase Auth (Primary)  →  MongoDB (User Data)  →  JWT Tokens (API Access)
```

1. **Signup Flow:**
   - Frontend creates user in Firebase
   - Backend receives Firebase UID
   - User document created in MongoDB
   - JWT token issued for API access

2. **Login Flow:**
   - Firebase validates credentials on frontend
   - Email verification checked (Firebase)
   - Backend issues JWT for authenticated API calls

3. **Password Reset:**
   - Handled entirely by Firebase
   - No backend involvement required

4. **Account Deletion:**
   - Frontend deletes Firebase user first
   - Backend deletes MongoDB user data
   - All related data (chats, etc.) removed

## 🛠️ Tech Stack

- **Node.js** - Runtime environment
- **Express** - Web framework
- **MongoDB + Mongoose** - Database
- **JWT** - API authentication
- **BCrypt** - Password hashing
- **GROQ SDK** - AI integration (Llama 3.3 70B)
- **Firebase Admin** - Push notifications
- **Node-Cron** - Scheduled tasks

## 📦 Setup

```bash
# Install dependencies
npm install

# Start development server with auto-reload
npm start
```

## 🔑 Environment Variables

Create a `.env` file in the backend directory:

```env
# Database
MONGODB_URI=your_mongodb_connection_string

# JWT
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRE=30d

# AI
GROQ_API_KEY=your_groq_api_key

# Firebase Admin (for push notifications)
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_PRIVATE_KEY=your_private_key
FIREBASE_CLIENT_EMAIL=your_client_email

# Server
PORT=5000
```

## 📡 API Endpoints

### Authentication Routes (`/api/auth`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/signup` | Create user (Firebase UID + MongoDB) |
| POST | `/login` | Login user (accepts Firebase token) |
| POST | `/logout` | Logout user |
| GET | `/me` | Get current user |
| PUT | `/profile` | Update user profile |
| POST | `/update-fcm-token` | Update FCM token for notifications |
| POST | `/delete-account` | Delete user account (MongoDB) |

### Chat Routes (`/api/chat`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/` | Send message to AI |
| GET | `/history` | Get chat history |
| DELETE | `/:chatId` | Delete specific chat |
| PUT | `/:chatId/title` | Update chat title |

### Notification Routes (`/api/notifications`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/settings` | Get notification settings |
| PUT | `/settings` | Update notification settings |
| GET | `/history` | Get notification history |

## 🏗️ Project Structure

```
backend/
├── authRoutes.js           # Authentication endpoints
├── cronRoutes.js           # Cron job management
├── index.js                # Server entry point
├── middleware/
│   └── auth.js             # JWT verification middleware
├── models/
│   ├── usermodels.js       # User schema
│   ├── chat.js             # Chat schema
│   └── notificationModels.js
├── routes/
│   └── notifications.js    # Notification routes
├── services/
│   ├── groqService.js      # GROQ AI integration
│   ├── scheduler.js        # Cron jobs
│   └── notificationService.js
└── utils/
    └── firebaseAdmin.js    # Firebase Admin SDK
```

## 🔐 Security Features

- **JWT Authentication** - Secure API access
- **BCrypt Hashing** - Password encryption
- **Firebase Integration** - Email verification required
- **Protected Routes** - Auth middleware on sensitive endpoints
- **Environment Variables** - Sensitive data protection
- **CORS Configuration** - Cross-origin security

## 📝 Recent Updates

### Migration from OTP to Firebase (February 2026)

- ✅ Removed custom OTP system
- ✅ Removed nodemailer/resend dependencies
- ✅ Integrated Firebase UID in user model
- ✅ Updated signup to accept Firebase UID
- ✅ Updated login to accept Firebase token (optional)
- ✅ Removed OTP-related endpoints:
  - `/send-otp` (removed)
  - `/forgot-password` (removed - handled by Firebase)
  - `/verify-reset-otp` (removed)
  - `/reset-password` (removed - handled by Firebase)
  - `/send-delete-otp` (removed)
  - `/verify-delete-otp` (removed)
- ✅ Simplified account deletion flow
- ✅ Maintained backward compatibility with existing users

## 🚀 Features

- **AI Chat** - GROQ API integration with context awareness
- **Push Notifications** - Scheduled daily wisdom via Firebase
- **User Management** - Profile, settings, preferences
- **Chat History** - Save, edit, export conversations
- **Demo Accounts** - Guest access with time limits
- **Cron Jobs** - Automated notification delivery
- **Multi-language Support** - Hindi, English, Sanskrit

## 📊 Database Models

### User Model
```javascript
{
  name: String,
  email: String,
  password: String (hashed),
  firebaseUid: String (optional),
  isDemo: Boolean,
  isVerified: Boolean,
  fcmToken: String,
  lastLogin: Date,
  createdAt: Date
}
```

### Chat Model
```javascript
{
  userId: ObjectId,
  title: String,
  messages: [{
    role: String,
    content: String,
    timestamp: Date
  }],
  createdAt: Date,
  updatedAt: Date
}
```

## 🔧 Scripts

- `npm start` - Start server with nodemon (auto-reload)
- `npm test` - Run tests (if configured)

## 📞 Error Handling

All endpoints return standardized error responses:

```json
{
  "success": false,
  "message": "Error description"
}
```

HTTP status codes follow REST conventions.

---

**Built with 💻 and 🕉️**
