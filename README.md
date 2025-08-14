# Travel Aggregator Platform

This project contains the full-stack travel aggregator application, designed with a microservices-oriented architecture. It includes a React frontend, a Node.js backend for core business logic, and a separate Python service for handling user authentication.

## Project Architecture

The project is structured as a monorepo with three primary services:

- **`frontend/`**: A modern, responsive React application that serves as the user interface. It communicates with the backend for flight searches and booking information.

- **`backend/`**: A robust Node.js and Express.js application that provides the core API. It handles flight data aggregation from external services, manages booking link generation, and serves data to the frontend.

- **`python-auth-service/`**: A standalone Python (Flask) service dedicated to user authentication. It manages Google OAuth 2.0 flows and user sessions, interacting with its own MySQL database.

## Key Features

- **Flight Search**: Search for one-way and round-trip flights.
- **Dynamic Pricing**: View live, cheapest prices on the home page.
- **Booking Redirects**: Seamlessly redirect to airline booking pages with currency and locale enforcement.
- **Google OAuth**: Secure user login and registration via Google.
- **Modular Architecture**: Decoupled services for scalability and maintainability.

## Tech Stack

| Service               | Technologies                               |
| --------------------- | ------------------------------------------ |
| **Frontend**          | React, React Router, CSS, JavaScript (ES6+)|
| **Backend**           | Node.js, Express.js                        |
| **Authentication**    | Python, Flask, Google OAuth 2.0, MySQL     |
| **Database**          | MySQL (for auth service)                   |
| **Deployment**        | Render (for automatic deployments from GitHub) |

---

## Local Development Setup

### Prerequisites

- [Node.js](https://nodejs.org/en/) (v16 or later)
- [Python](https://www.python.org/downloads/) (v3.8 or later) & `pip`
- [Git](https://git-scm.com/)
- A MySQL database (local or cloud-hosted, e.g., PlanetScale, Railway)



###  configure Environment Variables

Create a `.env` file in the project root and add the following variables. These are essential for connecting to external APIs and services.

```env
# Backend Configuration
TRAVELPAYOUTS_TOKEN=your_travelpayouts_api_token
TRAVELPAYOUTS_MARKER=your_travelpayouts_marker_id

# Python Authentication Service Configuration
GOOGLE_CLIENT_ID=your_google_oauth_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_google_oauth_client_secret
DATABASE_URL="mysql+pymysql://user:pass@host:port/dbname"
SECRET_KEY="a_strong_random_secret_key_for_flask_sessions"
```

### Setup and Run the Services

Run each service in a separate terminal.

#### Terminal 1: Backend (Node.js)

```bash
# Navigate to the backend directory
cd backend

# Install dependencies
npm install

# Start the server
npm start
# The backend will run on http://localhost:5000
```

#### Terminal 2: Frontend (React)

```bash
# Navigate to the frontend directory
cd frontend

# Install dependencies
npm install

# Start the React development server
npm start
# The frontend will be available at http://localhost:3000
```

#### Terminal 3: Python Auth Service

1.  **Set up the Database**: Connect to your MySQL instance and run the schema script to create the necessary tables.
    ```sql
    -- Source: python-auth-service/database_schema.sql
    CREATE TABLE users (...);
    CREATE TABLE user_sessions (...);
    ```

2.  **Run the Python Service**:
    ```bash
    # Navigate to the Python service directory
    cd python-auth-service

    # Install dependencies
    pip install -r requirements.txt

    # Run the Flask application
    python google_oauth_app.py
    # The auth service will run on http://localhost:5001
    ```

## Deployment

This project is configured for continuous deployment on **Render**. Any push to the `main` branch on GitHub will automatically trigger a new build and deployment.

For more details, refer to the [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md).

## Authentication Flow

The authentication service is decoupled from the main backend. The React frontend communicates directly with the Python service for all Google login actions. Once authenticated, the user's session is managed by the Python service, which can be extended to issue JWTs for authorizing access to the Node.js backend in the future.

For a detailed guide on setting up Google OAuth and the database, see [python-auth-service/setup_guide.md](python-auth-service/setup_guide.md).

All Rights Reserved.
