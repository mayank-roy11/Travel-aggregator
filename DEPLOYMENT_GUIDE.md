# Deployment Guide

## How to Deploy and Modify Travel Aggregator

### 1. **Local Development Workflow**

```bash
# Start backend (Terminal 1)
cd backend
npm start

# Start frontend (Terminal 2)  
cd frontend
npm start
```

### 2. **Testing Changes Locally**

- Make your changes in the code
- Test both frontend and backend locally
- Ensure all features work (flight search, round trip, booking)
- Only push to GitHub when everything works locally


### 3. **Automatic Deployment**

- Render will automatically detect changes on GitHub
- It rebuilds and redeploys your app automatically
- No manual deployment needed!

### 4. **API Configuration**

The app automatically detects environment:
- **Local Development**: Uses `http://localhost:5000/api`
- **Production**: Uses the same hostname as your frontend (e.g., `https://your-app.onrender.com/api`)

### 5. **Environment Variables (Set in Render Dashboard)**

Required environment variables:
```
TRAVELPAYOUTS_TOKEN=your_token_here
TRAVELPAYOUTS_MARKER=your_marker_here
TRAVELPAYOUTS_HOST=localhost
```

### 6. **Testing After Deployment**

1. Visit your deployed URL: `https://your-app-name.onrender.com`
2. Test all features:
   - Flight search (one-way)
   - Round trip search
   - Booking functionality
   - Filters

### 7. **Troubleshooting**

If something breaks:
1. Check Render logs in the dashboard
2. Verify environment variables are set
3. Test locally first before pushing
4. Check browser console for errors

### 8. **Making Updates**

1. Make changes locally
2. Test thoroughly
3. Push to GitHub
4. Wait for Render to auto-deploy (2-3 minutes)
5. Test the live site

### 9. **Rollback if Needed**

If deployment breaks something:
```bash
git revert HEAD
git push origin master
```

This will automatically rollback the deployment too! 