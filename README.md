# NearServe

Find trusted Plumber, Electrician & Mechanic near your home.

## Project Structure

```
NearServe/
├── backend/          # Node.js Express API server
│   ├── config/      # Configuration files
│   ├── middleware/  # Authentication middleware
│   ├── models/      # MongoDB models
│   ├── routes/      # API routes
│   └── server.js    # Main server file
│
└── frontend/         # React frontend with Vite
    ├── src/
    │   ├── components/  # React components
    │   ├── image/       # Images and assets
    │   ├── App.jsx      # Main App component
    │   ├── api.js       # API client functions
    │   └── styles.css   # Global styles
    └── index.html
```

## Features

- ✅ User Authentication (Register/Login)
- ✅ JWT-based authorization
- ✅ Protected routes
- ✅ User profile management
- ✅ Modern, responsive UI design
- ✅ Clean white theme with professional styling

## Tech Stack

### Backend
- Node.js
- Express.js
- MongoDB with Mongoose
- JWT for authentication
- bcrypt for password hashing

### Frontend
- React 18
- Vite
- Modern CSS with CSS Variables
- Responsive design

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- MongoDB database
- npm or yarn

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file with the following variables:
```env
PORT=3000
NODE_ENV=development
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRY=1h
MONGO_URI=your-mongodb-connection-string
```

4. Start the server:
```bash
# Development mode with auto-reload
npm run dev

# Production mode
npm start
```

The backend server will run on `http://localhost:3000`

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file (optional):
```env
VITE_API_URL=http://localhost:3000/api
```

4. Start the development server:
```bash
npm run dev
```

The frontend will run on `http://localhost:5173`

## API Endpoints

### Authentication

**Register**
```
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

**Login**
```
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

### Protected Routes

**Get Profile**
```
GET /api/profile
Authorization: Bearer <your-jwt-token>
```

## Development

### Backend Development
```bash
cd backend
npm run dev
```

### Frontend Development
```bash
cd frontend
npm run dev
```

### Building for Production

**Frontend:**
```bash
cd frontend
npm run build
```

## Environment Variables

### Backend (.env)
- `PORT` - Server port (default: 3000)
- `NODE_ENV` - Environment (development/production)
- `JWT_SECRET` - Secret key for JWT signing
- `JWT_EXPIRY` - JWT token expiration time
- `MONGO_URI` - MongoDB connection string

### Frontend (.env)
- `VITE_API_URL` - Backend API URL (optional, defaults to /api)

## Security Notes

- Never commit `.env` files to version control
- Change the JWT_SECRET in production
- Use strong passwords for database connections
- Enable HTTPS in production
- Set appropriate CORS policies

## License

ISC

## Author

Jatin Verma
