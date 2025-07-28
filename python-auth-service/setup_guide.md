# Google OAuth + MySQL Setup Guide

## **Step 1: Set Up MySQL Database**

### **1.1 Create MySQL Database Online**
Choose a MySQL hosting service:
- **PlanetScale** (Free tier available)
- **Railway** (Free tier available)
- **AWS RDS** (Pay as you go)
- **Google Cloud SQL** (Free tier available)

### **1.2 Run Database Schema**
```sql
-- Copy and paste the contents of database_schema.sql
-- into your MySQL database management tool
```

### **1.3 Get Database Connection String**
```
mysql+pymysql://username:password@host:port/database_name
```

## **Step 2: Set Up Google OAuth**

### **2.1 Create Google Cloud Project**
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project
3. Enable Google+ API

### **2.2 Create OAuth Credentials**
1. Go to "APIs & Services" → "Credentials"
2. Click "Create Credentials" → "OAuth 2.0 Client IDs"
3. Choose "Web application"
4. Add authorized redirect URIs:
   - `http://localhost:5001/auth/google/callback` (development)
   - `https://your-domain.com/auth/google/callback` (production)

### **2.3 Get OAuth Credentials**
- **Client ID**: `123456789-abcdef.apps.googleusercontent.com`
- **Client Secret**: `GOCSPX-abcdefghijklmnop`

## **Step 3: Configure Environment Variables**

### **3.1 Create .env File**
```bash
# Database Configuration
DATABASE_URL=mysql+pymysql://username:password@host:port/travel_aggregator

# Security Keys
SECRET_KEY=your-super-secret-key-here
JWT_SECRET_KEY=your-jwt-secret-key-here

# Google OAuth
GOOGLE_CLIENT_ID=123456789-abcdef.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-abcdefghijklmnop
GOOGLE_REDIRECT_URI=http://localhost:5001/auth/google/callback
```

## **Step 4: Install Dependencies**

```bash
cd python-auth-service
pip install -r requirements.txt
```

## **Step 5: Run the Service**

```bash
python google_oauth_app.py
```

The service will run on `http://localhost:5001`

## **Step 6: Test the Setup**

### **6.1 Test Health Check**
```bash
curl http://localhost:5001/health
```

### **6.2 Test Google OAuth**
1. Visit `http://localhost:5001/auth/google/login`
2. You'll get an authorization URL
3. Open that URL in browser
4. Complete Google login
5. You'll be redirected back with user data

## **Step 7: Frontend Integration**

### **7.1 Google Login Button**
```javascript
const handleGoogleLogin = async () => {
  try {
    // Get Google OAuth URL
    const response = await fetch('http://localhost:5001/auth/google/login');
    const data = await response.json();
    
    // Redirect to Google
    window.location.href = data.auth_url;
  } catch (error) {
    console.error('Google login error:', error);
  }
};
```

### **7.2 Handle OAuth Callback**
```javascript
// In your React app, handle the callback
useEffect(() => {
  const urlParams = new URLSearchParams(window.location.search);
  const code = urlParams.get('code');
  
  if (code) {
    // Exchange code for user data
    handleGoogleCallback(code);
  }
}, []);
```

## **Step 8: Production Deployment**

### **8.1 Update Redirect URIs**
In Google Cloud Console, add your production domain:
```
https://your-domain.com/auth/google/callback
```

### **8.2 Update Environment Variables**
```bash
GOOGLE_REDIRECT_URI=https://your-domain.com/auth/google/callback
DATABASE_URL=mysql+pymysql://prod_user:prod_pass@prod_host:3306/travel_aggregator
```

### **8.3 Deploy Python Service**
- Deploy to **Railway**, **Heroku**, or **AWS**
- Set environment variables in deployment platform
- Point your domain to the deployed service

## **Data Flow Example:**

### **User clicks "Login with Google":**
```
1. Frontend → Python Service: GET /auth/google/login
2. Python Service → Google: Redirect to Google OAuth
3. User → Google: Login with Google account
4. Google → Python Service: Redirect with authorization code
5. Python Service → Google: Exchange code for user data
6. Python Service → MySQL: Store/update user data
7. Python Service → Frontend: Return JWT token + user data
```

### **What Gets Stored in MySQL:**
```sql
-- Example user record
INSERT INTO users VALUES (
  1,                                    -- id
  'john@gmail.com',                     -- email
  NULL,                                 -- password (NULL for OAuth)
  'John Doe',                          -- name
  'https://google.com/photo.jpg',       -- profile_picture
  'google',                            -- auth_provider
  '123456789',                         -- google_id
  TRUE,                                -- email_verified
  TRUE,                                -- is_active
  NOW(),                               -- created_at
  NOW()                                -- updated_at
);
```

## **Security Features:**
- ✅ **Password hashing** for email users
- ✅ **JWT tokens** for session management
- ✅ **Email verification** from Google
- ✅ **Unique Google IDs** to prevent duplicates
- ✅ **CORS protection** for frontend integration

## **Next Steps:**
1. **Test locally** with the setup
2. **Create frontend components** for Google login
3. **Deploy to production** with your domain
4. **Add more OAuth providers** (Facebook, GitHub)

Your Google OAuth + MySQL setup is ready! 🚀 