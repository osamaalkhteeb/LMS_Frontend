# LMS Client - Learning Management System Frontend

A modern, responsive Learning Management System frontend built with React, Vite, and Material-UI.


## Tech Stack

- **Framework**: React 19.1.0
- **Build Tool**: Vite 6.3.5
- **UI Library**: Material-UI (MUI) 7.1.1
- **Routing**: React Router DOM 6.8.1
- **HTTP Client**: Axios 1.10.0
- **State Management**: React Hooks + Context
- **Form Handling**: React Hook Form 7.43.5
- **Charts**: Chart.js with React Chart.js 2
- **Icons**: Material-UI Icons, Heroicons, React Icons, Lucide React
- **Notifications**: React Hot Toast
- **Drag & Drop**: DnD Kit
- **Styling**: Emotion (CSS-in-JS)

## Installation

1. **Navigate to the client directory**
   ```bash
   cd .\client\LMS\
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Set up environment variables**
   Create a `.env` file in the client/LMS directory:
   ```env
   # API Configuration
   VITE_API_URL=http://localhost:5000/api
   VITE_API_BASE_URL=http://localhost:5000/api
   
   # App Configuration
   VITE_APP_NAME=LMS Platform
   VITE_VERSION=1.0.0
   
   # Authentication
   VITE_JWT_SECRET=MySuperSecretKey@1234!SecureEnoughForProd?Yes!
   VITE_TOKEN_EXPIRY=24h
   
   # File Upload Configuration
   VITE_MAX_FILE_SIZE=10485760
   VITE_ALLOWED_FILE_TYPES=.pdf,.doc,.docx,.txt,.jpg,.jpeg,.png,.gif,.mp4,.avi,.mov
   
   # Pagination
   VITE_DEFAULT_PAGE_SIZE=10
   VITE_MAX_PAGE_SIZE=100
   
   # Feature Flags
   VITE_ENABLE_GOOGLE_AUTH=true
   VITE_ENABLE_EMAIL_VERIFICATION=true
   VITE_ENABLE_NOTIFICATIONS=true
   
   # Development
   VITE_DEBUG=true
   VITE_LOG_LEVEL=debug
   
   # Performance
   VITE_CACHE_DURATION=300000
   VITE_ENABLE_CACHE=true
   
   # Theming
   VITE_THEME=light
   VITE_PRIMARY_COLOR=#007bff
   VITE_SECONDARY_COLOR=#6c757d
   ```

4. **Start the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   ```
   
   The application will be available at `http://localhost:3000`