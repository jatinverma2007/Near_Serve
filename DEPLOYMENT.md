# Deployment Guide for NearServe

## Backend Deployment (Render)

Your backend is deployed at: `https://near-serve.onrender.com`

### Environment Variables on Render

Set these environment variables in your Render dashboard:

```
PORT=3000
NODE_ENV=production
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRY=1h
MONGO_URI=mongodb+srv://nearuser:Vv0mX0d3NVTmrOWk@cluster0.gr7yaja.mongodb.net/nearserve
```

### Build Command
```
cd backend && npm install
```

### Start Command
```
cd backend && npm start
```

---

## Frontend Deployment (Vercel)

Your frontend is deployed at: `https://near-serve-mocha.vercel.app`

### Environment Variables on Vercel

**CRITICAL:** Set this environment variable in your Vercel project settings:

```
VITE_API_URL=https://near-serve.onrender.com/api
```

**How to set it:**
1. Go to your Vercel project dashboard
2. Click on "Settings" tab
3. Click on "Environment Variables" in the left sidebar
4. Add new variable:
   - **Name:** `VITE_API_URL`
   - **Value:** `https://near-serve.onrender.com/api`
   - **Environment:** Production (and Preview if you want)
5. Click "Save"
6. **Redeploy your project** for changes to take effect

### Build Settings

- **Framework Preset:** Vite
- **Root Directory:** `frontend`
- **Build Command:** `npm run build`
- **Output Directory:** `dist`

---

## After Setting Environment Variables

1. **Redeploy on Vercel:**
   ```bash
   # Push to trigger automatic deployment, or
   # Click "Redeploy" in Vercel dashboard
   ```

2. **Verify Backend is Running:**
   - Visit: `https://near-serve.onrender.com/`
   - Should return API information

3. **Test the Application:**
   - Visit: `https://near-serve-mocha.vercel.app/`
   - Try to register a new account
   - Try to login
   - Check browser console for errors

---

## Troubleshooting

### Issue: 404 Errors on API Calls

**Cause:** Frontend is trying to call `/api/auth/login` locally instead of the Render backend.

**Solution:** 
- Set `VITE_API_URL` environment variable on Vercel
- Redeploy after setting the variable

### Issue: CORS Errors

**Cause:** Backend is not allowing requests from Vercel domain.

**Solution:**
- Backend `server.js` has been updated with CORS configuration
- Redeploy backend on Render

### Issue: 500 Internal Server Error

**Cause:** Environment variables not set correctly on Render.

**Solution:**
- Verify all environment variables are set in Render dashboard
- Check Render logs for specific errors

---

## Quick Deployment Checklist

### Render (Backend)
- [ ] Environment variables set (PORT, NODE_ENV, JWT_SECRET, JWT_EXPIRY, MONGO_URI)
- [ ] Build command: `cd backend && npm install`
- [ ] Start command: `cd backend && npm start`
- [ ] Service is running and accessible

### Vercel (Frontend)
- [ ] Root directory set to `frontend`
- [ ] Environment variable `VITE_API_URL` set to `https://near-serve.onrender.com/api`
- [ ] Framework preset: Vite
- [ ] Build command: `npm run build`
- [ ] Output directory: `dist`
- [ ] Project redeployed after setting environment variables

---

## Testing Your Deployment

1. **Test Backend:**
   ```bash
   curl https://near-serve.onrender.com/
   ```

2. **Test Registration:**
   ```bash
   curl -X POST https://near-serve.onrender.com/api/auth/register \
     -H "Content-Type: application/json" \
     -d '{"name":"Test User","email":"test@example.com","password":"test123"}'
   ```

3. **Test Frontend:**
   - Open `https://near-serve-mocha.vercel.app/`
   - Open browser DevTools (F12) > Network tab
   - Try to register/login
   - Check that API calls go to `near-serve.onrender.com`
