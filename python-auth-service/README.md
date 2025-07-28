# Python Authentication Service

A Flask-based authentication service for the Travel Aggregator project.

## Features

- User registration and login
- JWT token authentication
- Password hashing with bcrypt
- User profile management
- CORS enabled for frontend integration

## Setup

### 1. Install Python Dependencies
```bash
cd python-auth-service
pip install -r requirements.txt
```

### 2. Set Environment Variables
Create a `.env` file:
```
SECRET_KEY=your-super-secret-key-here
JWT_SECRET_KEY=your-jwt-secret-key-here
DATABASE_URL=sqlite:///users.db
```

### 3. Run the Service
```bash
python app.py
```

The service will run on `http://localhost:5001`

## API Endpoints

### Health Check
```
GET /health
```

### Register User
```
POST /register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "name": "John Doe"
}
```

### Login
```
POST /login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

### Get Profile (Requires JWT)
```
GET /profile
Authorization: Bearer <jwt_token>
```

### Update Profile (Requires JWT)
```
PUT /profile
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "name": "New Name",
  "password": "newpassword123"
}
```

### Logout (Requires JWT)
```
POST /logout
Authorization: Bearer <jwt_token>
```

## Integration with Node.js Backend

The Python service runs independently. Your Node.js backend can:

1. **Proxy requests** to the Python service
2. **Call Python API** directly from Node.js
3. **Use both services** in parallel

## Deployment

### Local Development
- Python service: `http://localhost:5001`
- Node.js backend: `http://localhost:5000`
- React frontend: `http://localhost:3000`

### Production
Deploy the Python service separately and update your frontend to call the Python API directly. 