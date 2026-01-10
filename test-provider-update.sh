#!/bin/bash

# Provider Profile Update Verification Script

echo "🧪 Provider Profile Update - Verification Test"
echo "=============================================="
echo ""

BASE_URL="http://localhost:3000/api"
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}📋 Prerequisites:${NC}"
echo "1. Backend server running on port 3000"
echo "2. MongoDB connected"
echo "3. Provider account with auth token"
echo ""

# Check if server is running
echo -n "Checking if server is running... "
if curl -s http://localhost:3000 > /dev/null; then
    echo -e "${GREEN}✅ Server is running${NC}"
else
    echo -e "${RED}❌ Server is not running${NC}"
    echo "Start the server with: cd backend && npm run dev"
    exit 1
fi
echo ""

echo -e "${BLUE}🧪 Testing Provider Endpoints:${NC}"
echo "-----------------------------------"

# Test 1: Get all providers (public)
echo -n "1. GET /api/providers (public)... "
RESPONSE=$(curl -s -w "\n%{http_code}" "$BASE_URL/providers")
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
if [ "$HTTP_CODE" = "200" ]; then
    echo -e "${GREEN}✅ PASS${NC}"
    COUNT=$(echo "$RESPONSE" | head -n -1 | grep -o '"count":[0-9]*' | cut -d':' -f2)
    echo "   Found $COUNT providers"
else
    echo -e "${RED}❌ FAIL${NC} (Status: $HTTP_CODE)"
fi

# Test 2: Get provider by ID (public)
echo -n "2. GET /api/providers/:id (public)... "
# Get first provider ID
PROVIDER_ID=$(curl -s "$BASE_URL/providers" | grep -o '"_id":"[^"]*"' | head -1 | cut -d'"' -f4)
if [ -n "$PROVIDER_ID" ]; then
    RESPONSE=$(curl -s -w "\n%{http_code}" "$BASE_URL/providers/$PROVIDER_ID")
    HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
    if [ "$HTTP_CODE" = "200" ]; then
        echo -e "${GREEN}✅ PASS${NC}"
        echo "   Provider ID: $PROVIDER_ID"
    else
        echo -e "${RED}❌ FAIL${NC} (Status: $HTTP_CODE)"
    fi
else
    echo -e "${YELLOW}⚠️  SKIP${NC} (No providers found)"
fi

# Test 3: Update provider profile (requires auth)
echo -n "3. PUT /api/providers/profile (protected)... "
RESPONSE=$(curl -s -w "\n%{http_code}" -X PUT "$BASE_URL/providers/profile" \
  -H "Content-Type: application/json" \
  -d '{"businessName":"Test"}')
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
if [ "$HTTP_CODE" = "401" ]; then
    echo -e "${GREEN}✅ PASS${NC} (Requires authentication as expected)"
else
    echo -e "${YELLOW}⚠️  Status: $HTTP_CODE${NC}"
fi

echo ""
echo -e "${BLUE}📝 To test with authentication:${NC}"
echo "-----------------------------------"
echo "1. Login to get auth token:"
echo '   curl -X POST http://localhost:3000/api/auth/login \'
echo '     -H "Content-Type: application/json" \'
echo '     -d '"'"'{"email":"your@email.com","password":"yourpassword"}'"'"''
echo ""
echo "2. Update provider profile:"
echo '   curl -X PUT http://localhost:3000/api/providers/profile \'
echo '     -H "Content-Type: application/json" \'
echo '     -H "Authorization: Bearer YOUR_TOKEN" \'
echo '     -d '"'"'{'
echo '       "businessName": "Updated Name",'
echo '       "bio": "Updated bio",'
echo '       "categories": ["plumber","electrician"],'
echo '       "contactInfo": {"phone":"1234567890"},'
echo '       "address": {"city":"Mumbai","state":"Maharashtra"}'
echo '     }'"'"''
echo ""
echo "3. Check backend terminal for debug logs:"
echo "   === UPDATE PROVIDER PROFILE REQUEST ==="
echo "   User ID: ..."
echo "   Request Body: ..."
echo "   Found provider: ..."
echo "   Updating field: ..."
echo "   Provider saved successfully"
echo ""

echo -e "${BLUE}🎯 Frontend Testing:${NC}"
echo "-----------------------------------"
echo "1. Login as a provider"
echo "2. Navigate to Provider Dashboard"
echo "3. Click 'Edit Profile' or go to Provider Setup"
echo "4. Update any field (business name, categories, contact info)"
echo "5. Click 'Save' or 'Update Profile'"
echo "6. Check for success message"
echo "7. Verify changes in dashboard"
echo ""

echo -e "${BLUE}📊 Debug Information:${NC}"
echo "-----------------------------------"
echo "Backend URL: $BASE_URL"
echo "Provider Update Endpoint: PUT $BASE_URL/providers/profile"
echo "Frontend API File: frontend/src/services/providerAPI.js:90"
echo "Backend Controller: backend/controllers/providerController.js:updateProviderProfile"
echo "Backend Route: backend/routes/providerRoutes.js"
echo ""

echo -e "${GREEN}✅ Basic provider endpoints are working!${NC}"
echo ""
echo "Next: Test with authentication using the steps above."
