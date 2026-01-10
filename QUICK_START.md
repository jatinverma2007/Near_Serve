# 🚀 Quick Start Guide - Review Feature

## ✅ What Was Fixed

1. **Created frontend/.env file** with backend API URL
2. **Fixed auth middleware mismatch** in reviewController.js
3. **Fixed notification message** to use populated user data
4. **Added debug logging** for easier troubleshooting

## 📋 Prerequisites

- Backend server running on `http://localhost:3000`
- MongoDB connected
- User account (customer role)
- At least one completed booking

## 🎯 Step-by-Step Testing

### 1. Start the Frontend

Open a new terminal and run:

```bash
cd frontend
npm run dev
```

If that doesn't work, try:
```bash
cd frontend
npx vite
```

You should see:
```
VITE v5.x.x  ready in xxx ms

➜  Local:   http://localhost:5173/
➜  Network: use --host to expose
```

### 2. Open Browser

Navigate to: `http://localhost:5173`

### 3. Login as Customer

- Click "Login" or "Sign In"
- Enter your customer credentials
- Make sure you're logged in as a **customer** (not provider)

### 4. Go to Dashboard

- Click on your profile or "Dashboard"
- Navigate to "My Bookings" section
- Switch to "Past Bookings" tab

### 5. Write a Review

- Find a booking with status "Completed"
- Click the "Write Review" button
- You'll be redirected to the service details page with review form open

### 6. Submit Review

- Select a star rating (1-5 stars)
- Write your comment in the text area
- Click "Submit Review"

### 7. Verify Success

✅ You should see:
- Alert message: "Review submitted successfully!"
- Review form closes automatically
- Your review appears in the reviews section below
- Service rating updates

## 🐛 Troubleshooting

### Frontend won't start?

```bash
cd frontend
npm install
npm run dev
```

### "Network Error" in browser console?

Check that:
1. Backend is running: `curl http://localhost:3000/api`
2. Frontend .env file exists: `cat frontend/.env`
3. Should contain: `VITE_API_URL=http://localhost:3000/api`

### Backend logs show error?

Check the terminal where backend is running for:
```
=== CREATE REVIEW REQUEST ===
User ID: [your user ID]
Request Body: {...}
```

### No completed bookings?

Create a test booking:
1. Login as customer
2. Book a service
3. Logout
4. Login as the provider who owns that service
5. Go to provider dashboard → bookings
6. Update booking status to "Completed"
7. Logout
8. Login as customer again
9. Now you can write a review

## 📊 Expected Behavior

### Frontend Console (F12):
```
=== Review Submission Debug ===
Booking ID: 6581234567890abcdef12345
Service ID: 6581234567890abcdef54321
Rating: 5
Comment: Great service!
Submitting review data: {bookingId: "...", serviceId: "...", ...}
Review response: {success: true, message: "Review created successfully", ...}
Review submitted successfully!
```

### Backend Terminal:
```
=== CREATE REVIEW REQUEST ===
User ID: 6581234567890abcdef67890
Request Body: {
  bookingId: '6581234567890abcdef12345',
  serviceId: '6581234567890abcdef54321',
  rating: 5,
  comment: 'Great service!'
}
```

## 🎉 Success Indicators

✅ No errors in browser console
✅ No errors in backend terminal
✅ Alert shows "Review submitted successfully!"
✅ Review appears immediately in the reviews list
✅ Service rating updates
✅ Provider receives notification (check provider dashboard)

## 📝 Notes

- You can only review **completed** bookings
- You can only review each booking **once**
- Rating must be between **1-5 stars**
- Comment **cannot be empty**
- You must be **logged in** as a customer

## 🔍 API Endpoints Being Used

1. **POST /api/reviews** - Create review
   - Auth: Required
   - Body: `{bookingId, serviceId, rating, comment}`

2. **GET /api/services/:id/reviews** - Get service reviews
   - Auth: Not required
   - Returns: List of reviews with pagination

## ⚡ Quick Test

Want to verify the API is working? Run:

```bash
./test-review-api.sh
```

This will test that all endpoints are accessible and responding correctly.

## 🆘 Need Help?

If you're still having issues:

1. Check both browser console (F12) and backend terminal
2. Look for the debug logs starting with "==="
3. Review the error messages carefully
4. Make sure you followed all steps in order
5. Verify you have a completed booking to review

## 📚 Additional Resources

- Full details: `REVIEW_FIX_SUMMARY.md`
- Troubleshooting guide: `REVIEW_TROUBLESHOOTING.md`
- Test script: `test-review-api.sh`
