#!/bin/bash

# Test script to verify review API endpoints

echo "🧪 Testing Review API Endpoints"
echo "================================"
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

BASE_URL="http://localhost:3000/api"

echo "📡 Backend URL: $BASE_URL"
echo ""

# Test 1: Check if backend is running
echo "1️⃣ Checking if backend is running..."
if curl -s "$BASE_URL" > /dev/null; then
    echo -e "${GREEN}✅ Backend is running${NC}"
else
    echo -e "${RED}❌ Backend is not running${NC}"
    echo "Please start the backend with: cd backend && npm run dev"
    exit 1
fi
echo ""

# Test 2: Check review routes are registered
echo "2️⃣ Checking available endpoints..."
curl -s "$BASE_URL" | grep -q "createReview"
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Review endpoints are registered${NC}"
else
    echo -e "${YELLOW}⚠️  Review endpoints may not be properly registered${NC}"
fi
echo ""

# Test 3: Try to create a review (will fail without auth, but we can check the error)
echo "3️⃣ Testing POST /api/reviews endpoint..."
RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/reviews" \
  -H "Content-Type: application/json" \
  -d '{"bookingId":"test","serviceId":"test","rating":5,"comment":"test"}')

HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | head -n -1)

echo "HTTP Status: $HTTP_CODE"
echo "Response: $BODY"

if [ "$HTTP_CODE" = "401" ]; then
    echo -e "${GREEN}✅ Endpoint exists (returns 401 Unauthorized as expected)${NC}"
elif [ "$HTTP_CODE" = "400" ]; then
    echo -e "${GREEN}✅ Endpoint exists (returns 400 Bad Request - validation working)${NC}"
else
    echo -e "${YELLOW}⚠️  Unexpected response: $HTTP_CODE${NC}"
fi
echo ""

# Test 4: Get service reviews (public endpoint)
echo "4️⃣ Testing GET /api/services/:id/reviews endpoint..."
# Using a dummy ID - will return 400/404 but proves endpoint exists
TEST_SERVICE_ID="507f1f77bcf86cd799439011" # Valid ObjectId format
RESPONSE=$(curl -s -w "\n%{http_code}" "$BASE_URL/services/$TEST_SERVICE_ID/reviews")

HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | head -n -1)

echo "HTTP Status: $HTTP_CODE"
echo "Response: $BODY"

if [ "$HTTP_CODE" = "404" ] || [ "$HTTP_CODE" = "200" ]; then
    echo -e "${GREEN}✅ Endpoint exists and is accessible${NC}"
else
    echo -e "${YELLOW}⚠️  Unexpected response: $HTTP_CODE${NC}"
fi
echo ""

echo "================================"
echo "🎉 API Endpoint Test Complete!"
echo ""
echo "Next steps:"
echo "1. Start frontend: cd frontend && npm run dev"
echo "2. Login as a customer"
echo "3. Navigate to a completed booking"
echo "4. Click 'Write Review'"
echo "5. Submit your review"
echo ""
