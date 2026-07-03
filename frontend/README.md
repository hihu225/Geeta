# Geeta GPT Frontend 🕉️

React + Vite application with Firebase Authentication and Capacitor for mobile deployment.

## 🔥 Firebase Authentication

This app uses **Firebase Email/Password Authentication** with email verification for secure user management.

### Authentication Flow

1. **Signup:**
   - User creates account with email and password
   - Firebase sends verification email automatically
   - User must verify email before logging in
   - User data synced to MongoDB backend

2. **Login:**
   - Firebase validates credentials
   - Email verification status checked
   - JWT token issued for API access
   - If not verified, option to resend verification email

3. **Password Reset:**
   - Firebase handles password reset via secure email links
   - No custom OTP system required

4. **Account Deletion:**
   - Deletes Firebase Authentication user
   - Removes MongoDB user data
   - Both systems synchronized

## 🛠️ Tech Stack

- **React 18** - UI framework
- **Vite** - Build tool and dev server
- **Firebase SDK** - Authentication
- **Capacitor** - Native mobile features
- **Axios** - HTTP client
- **React Router** - Navigation
- **SweetAlert2** - Elegant alerts
- **React Toastify** - Toast notifications

## 📦 Setup

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## 📱 Mobile Build

```bash
# Sync with Android
npx cap sync android

# Open in Android Studio
npx cap open android
```

## 🔑 Environment Variables

Create a `.env` file in the frontend directory:

```env
VITE_BACKEND_URL=your_backend_url
```

Firebase config is in `src/firebase.js` (already configured).

## 🏗️ Project Structure

```
src/
├── firebase.js          # Firebase configuration
├── App.jsx             # Main app component
├── Login.jsx           # Firebase login
├── Signup.jsx          # Firebase signup with verification
├── DeleteAccount.jsx   # Account deletion (Firebase + MongoDB)
├── Chatbot.jsx         # AI chat interface
└── components/         # Reusable components
```

## 🚀 Key Features

- Firebase email verification on signup
- Password reset via Firebase
- Synchronized user deletion (Firebase + MongoDB)
- JWT-based API authentication
- Demo account support
- Push notifications via FCM
- Voice input for chat
- Chat export to PDF
- Theme customization

## 📝 Recent Updates

- ✅ Migrated from custom OTP to Firebase Authentication
- ✅ Email verification required for all new users
- ✅ Firebase password reset replacing OTP-based reset
- ✅ Synchronized account deletion across Firebase and MongoDB
- ✅ Removed nodemailer dependencies (handled by Firebase)

## 🔧 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

---

This template uses [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md) for Fast Refresh.
