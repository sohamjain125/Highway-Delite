# Highway Delite - Note Taking Application

A full-stack note-taking application built with React, Node.js, and MongoDB, featuring user authentication, note management, and a responsive design.

## Features

- **User Authentication**: Sign up/sign in with email + OTP or Google account
- **Note Management**: Create, view, and delete notes
- **Responsive Design**: Mobile-first design that works on all devices
- **JWT Authorization**: Secure API endpoints with JWT tokens
- **Real-time Updates**: Instant feedback for user actions

## Technology Stack

- **Frontend**: React 18 with TypeScript
- **Backend**: Node.js with Express and TypeScript
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT + Google OAuth 2.0
- **Styling**: CSS3 with responsive design
- **Build Tool**: Vite

## Project Structure

```
highway-delite/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── pages/         # Page components
│   │   ├── services/      # API services
│   │   ├── types/         # TypeScript types
│   │   └── utils/         # Utility functions
│   ├── public/            # Static assets
│   └── package.json
├── server/                 # Node.js backend
│   ├── src/
│   │   ├── controllers/   # Route controllers
│   │   ├── middleware/    # Custom middleware
│   │   ├── models/        # MongoDB models
│   │   ├── routes/        # API routes
│   │   ├── services/      # Business logic
│   │   └── utils/         # Utility functions
│   └── package.json
└── README.md
```

## Prerequisites

- Node.js 18+ 
- MongoDB 6+
- Git

## Installation & Setup

### 1. Clone the repository
```bash
git clone <repository-url>
cd highway-delite
```

### 2. Install dependencies
```bash
# Install backend dependencies
cd server
npm install

# Install frontend dependencies
cd ../client
npm install
```

### 3. Environment Configuration

#### Backend (.env)
Create a `.env` file in the `server` directory:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/highway-delite
JWT_SECRET=your-super-secret-jwt-key
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback
FRONTEND_URL=http://localhost:5173
```

#### Frontend (.env)
Create a `.env` file in the `client` directory:
```env
VITE_API_URL=http://localhost:5000/api
VITE_GOOGLE_CLIENT_ID=your-google-client-id
```

### 4. Start MongoDB
```bash
# Start MongoDB service
mongod
```

### 5. Run the application

#### Development Mode
```bash
# Terminal 1 - Start backend
cd server
npm run dev

# Terminal 2 - Start frontend
cd client
npm run dev
```

#### Production Mode
```bash
# Build frontend
cd client
npm run build

# Start production server
cd ../server
npm start
```

## API Endpoints

### Authentication
- `POST /api/auth/signup` - User registration
- `POST /api/auth/verify-otp` - OTP verification
- `POST /api/auth/signin` - User login
- `GET /api/auth/google` - Google OAuth
- `GET /api/auth/google/callback` - Google OAuth callback
- `POST /api/auth/signout` - User logout

### Notes
- `GET /api/notes` - Get user notes
- `POST /api/notes` - Create new note
- `DELETE /api/notes/:id` - Delete note

## Features Implementation

### 1. User Authentication
- Email + OTP flow for signup
- Google OAuth integration
- JWT token management
- Input validation and error handling

### 2. Note Management
- Create new notes
- View all user notes
- Delete notes
- Real-time updates

### 3. Responsive Design
- Mobile-first approach
- Desktop and mobile layouts
- Consistent UI components
- Modern design with blue theme

### 4. Security
- JWT authorization
- Input sanitization
- CORS configuration
- Secure cookie handling

## Development Workflow

1. **Feature Development**: Implement features in separate branches
2. **Testing**: Test each feature thoroughly
3. **Commit**: Commit work after completing each feature
4. **Code Review**: Review and merge changes

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support and questions, please open an issue in the repository.
