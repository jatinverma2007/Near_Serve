#!/bin/bash

# Comprehensive API Test Script for Near Serve

echo "🧪 Near Serve - Complete API Testing"
echo "===================================="
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

BASE_URL="http://localhost:3000/api"
PASSED=0
FAILED=0

# Function to test endpoint
test_endpoint() {
    local method=$1
    local endpoint=$2
    local expected_status=$3
    local description=$4
    local data=$5
    
    echo -n "Testing: $description... "
    
    if [ "$method" = "GET" ]; then
        RESPONSE=$(curl -s -w "\n%{http_code}" "$BASE_URL$endpoint")
    elif [ "$method" = "POST" ]; then
        RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL$endpoint" \
          -H "Content-Type: application/json" \
          -d "$data")
    elif [ "$method" = "PUT" ]; then
        RESPONSE=$(curl -s -w "\n%{http_code}" -X PUT "$BASE_URL$endpoint" \
          -H "Content-Type: application/json" \
          -d "$data")
    elif [ "$method" = "DELETE" ]; then
        RESPONSE=$(curl -s -w "\n%{http_code}" -X DELETE "$BASE_URL$endpoint")
    fi
    
    HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
    BODY=$(echo "$RESPONSE" | head -n -1)
    
    if [ "$HTTP_CODE" = "$expected_status" ]; then
        echo -e "${GREEN}✅ PASS${NC} (Status: $HTTP_CODE)"
        ((PASSED++))
    else
        echo -e "${RED}❌ FAIL${NC} (Expected: $expected_status, Got: $HTTP_CODE)"
        echo "  Response: $BODY"
        ((FAILED++))
    fi
}

echo -e "${BLUE}📡 1. Server Health Check${NC}"
echo "-----------------------------------"
test_endpoint "GET" "/" "200" "Root endpoint"
echo ""

echo -e "${BLUE}🔐 2. Authentication Endpoints${NC}"
echo "-----------------------------------"
test_endpoint "POST" "/auth/register" "400" "Register without data" '{}'
test_endpoint "POST" "/auth/login" "400" "Login without data" '{}'
echo ""

echo -e "${BLUE}👤 3. User Endpoints${NC}"
echo "-----------------------------------"
test_endpoint "GET" "/users/profile" "401" "Get profile (no auth)"
echo ""

echo -e "${BLUE}🛠️ 4. Service Endpoints${NC}"
echo "-----------------------------------"
test_endpoint "GET" "/services" "200" "Get all services"
test_endpoint "GET" "/services/search" "200" "Search services"
test_endpoint "POST" "/services" "401" "Create service (no auth)"
echo ""

echo -e "${BLUE}📅 5. Booking Endpoints${NC}"
echo "-----------------------------------"
test_endpoint "GET" "/bookings" "401" "Get bookings (no auth)"
test_endpoint "POST" "/bookings" "401" "Create booking (no auth)"
echo ""

echo -e "${BLUE}⭐ 6. Review Endpoints${NC}"
echo "-----------------------------------"
test_endpoint "POST" "/reviews" "401" "Create review (no auth)"
test_endpoint "GET" "/reviews/my-reviews" "401" "Get my reviews (no auth)"
# Test public review endpoint with valid ObjectId
VALID_OID="507f1f77bcf86cd799439011"
test_endpoint "GET" "/services/$VALID_OID/reviews" "404" "Get service reviews (non-existent service)"
echo ""

echo -e "${BLUE}🔔 7. Notification Endpoints${NC}"
echo "-----------------------------------"
test_endpoint "GET" "/notifications" "401" "Get notifications (no auth)"
test_endpoint "GET" "/notifications/unread-count" "401" "Get unread count (no auth)"
echo ""

echo -e "${BLUE}👨‍💼 8. Provider Endpoints${NC}"
echo "-----------------------------------"
test_endpoint "GET" "/providers" "200" "Get all providers"
test_endpoint "GET" "/providers/me" "401" "Get my provider profile (no auth)"
test_endpoint "POST" "/providers" "401" "Create provider profile (no auth)"
test_endpoint "PUT" "/providers/profile" "401" "Update provider profile (no auth)"
test_endpoint "GET" "/providers/services" "401" "Get provider services (no auth)"
echo ""

echo "===================================="
echo -e "${GREEN}✅ Passed: $PASSED${NC}"
echo -e "${RED}❌ Failed: $FAILED${NC}"
echo ""

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}🎉 All API endpoints are responding correctly!${NC}"
    exit 0
else
    echo -e "${YELLOW}⚠️ Some endpoints may need attention.${NC}"
    exit 1
fi
