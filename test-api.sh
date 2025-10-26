#!/bin/bash

# Test script for KDSP RSVP Portal API endpoints
# This script tests all validation and admin endpoints

BASE_URL="http://localhost:3000"
ADMIN_PASSWORD="kdsp2025admin"

echo "========================================="
echo "KDSP RSVP Portal API Tests"
echo "========================================="
echo ""

# Color codes for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test counter
PASS=0
FAIL=0

# Function to print test result
print_result() {
  if [ $1 -eq 0 ]; then
    echo -e "${GREEN}✓ PASS${NC}: $2"
    PASS=$((PASS + 1))
  else
    echo -e "${RED}✗ FAIL${NC}: $2"
    FAIL=$((FAIL + 1))
  fi
}

echo "========================================="
echo "Test 1: RSVP Validation Tests"
echo "========================================="
echo ""

# Test 1.1: Missing profession_organization
echo "Test 1.1: Missing profession_organization field"
RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/api/rsvp" \
  -H "Content-Type: application/json" \
  -d '{
    "full_name": "Test User",
    "email": "test@example.com",
    "number_of_guests": 2,
    "rsvp_status": "Yes",
    "interest_types": ["Volunteer"],
    "referral_source": "Friend",
    "receive_updates": true
  }')
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | head -n-1)
if [ "$HTTP_CODE" = "400" ] && echo "$BODY" | grep -q "Profession"; then
  print_result 0 "Missing profession_organization returns 400"
else
  print_result 1 "Missing profession_organization should return 400"
fi
echo ""

# Test 1.2: Empty interest_types array
echo "Test 1.2: Empty interest_types array"
RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/api/rsvp" \
  -H "Content-Type: application/json" \
  -d '{
    "full_name": "Test User",
    "email": "test@example.com",
    "number_of_guests": 2,
    "rsvp_status": "Yes",
    "profession_organization": "Tech Company",
    "interest_types": [],
    "referral_source": "Friend",
    "receive_updates": true
  }')
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | head -n-1)
if [ "$HTTP_CODE" = "400" ] && echo "$BODY" | grep -q "interest"; then
  print_result 0 "Empty interest_types returns 400"
else
  print_result 1 "Empty interest_types should return 400"
fi
echo ""

# Test 1.3: Invalid interest_types value
echo "Test 1.3: Invalid interest_types value"
RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/api/rsvp" \
  -H "Content-Type: application/json" \
  -d '{
    "full_name": "Test User",
    "email": "test@example.com",
    "number_of_guests": 2,
    "rsvp_status": "Yes",
    "profession_organization": "Tech Company",
    "interest_types": ["InvalidType"],
    "referral_source": "Friend",
    "receive_updates": true
  }')
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | head -n-1)
if [ "$HTTP_CODE" = "400" ] && echo "$BODY" | grep -q "Invalid interest"; then
  print_result 0 "Invalid interest_types returns 400"
else
  print_result 1 "Invalid interest_types should return 400"
fi
echo ""

# Test 1.4: Invalid referral_source
echo "Test 1.4: Invalid referral_source"
RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/api/rsvp" \
  -H "Content-Type: application/json" \
  -d '{
    "full_name": "Test User",
    "email": "test@example.com",
    "number_of_guests": 2,
    "rsvp_status": "Yes",
    "profession_organization": "Tech Company",
    "interest_types": ["Volunteer"],
    "referral_source": "InvalidSource",
    "receive_updates": true
  }')
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | head -n-1)
if [ "$HTTP_CODE" = "400" ] && echo "$BODY" | grep -q "Referral source"; then
  print_result 0 "Invalid referral_source returns 400"
else
  print_result 1 "Invalid referral_source should return 400"
fi
echo ""

# Test 1.5: Missing receive_updates
echo "Test 1.5: Missing receive_updates field"
RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/api/rsvp" \
  -H "Content-Type: application/json" \
  -d '{
    "full_name": "Test User",
    "email": "test@example.com",
    "number_of_guests": 2,
    "rsvp_status": "Yes",
    "profession_organization": "Tech Company",
    "interest_types": ["Volunteer"],
    "referral_source": "Friend"
  }')
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | head -n-1)
if [ "$HTTP_CODE" = "400" ] && echo "$BODY" | grep -q "updates"; then
  print_result 0 "Missing receive_updates returns 400"
else
  print_result 1 "Missing receive_updates should return 400"
fi
echo ""

# Test 1.6: Valid RSVP submission
echo "Test 1.6: Valid RSVP submission with all required fields"
RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/api/rsvp" \
  -H "Content-Type: application/json" \
  -d '{
    "full_name": "Test User",
    "email": "test@example.com",
    "phone_number": "1234567890",
    "number_of_guests": 2,
    "rsvp_status": "Yes",
    "message": "Looking forward to it!",
    "profession_organization": "Tech Company",
    "interest_types": ["Volunteer", "Donate"],
    "referral_source": "Friend",
    "receive_updates": true
  }')
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | head -n-1)
if [ "$HTTP_CODE" = "201" ] && echo "$BODY" | grep -q "success"; then
  print_result 0 "Valid RSVP submission returns 201"
else
  print_result 1 "Valid RSVP submission should return 201"
fi
echo ""

echo "========================================="
echo "Test 2: Admin Authentication Tests"
echo "========================================="
echo ""

# Test 2.1: Admin access without authentication
echo "Test 2.1: Admin endpoint without authentication"
RESPONSE=$(curl -s -w "\n%{http_code}" -X GET "$BASE_URL/api/admin/rsvps")
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | head -n-1)
if [ "$HTTP_CODE" = "401" ] && echo "$BODY" | grep -q "Unauthorized"; then
  print_result 0 "Unauthenticated request returns 401"
else
  print_result 1 "Unauthenticated request should return 401"
fi
echo ""

# Test 2.2: Admin access with wrong password
echo "Test 2.2: Admin endpoint with wrong password"
RESPONSE=$(curl -s -w "\n%{http_code}" -X GET "$BASE_URL/api/admin/rsvps" \
  -H "Authorization: wrongpassword")
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | head -n-1)
if [ "$HTTP_CODE" = "401" ]; then
  print_result 0 "Wrong password returns 401"
else
  print_result 1 "Wrong password should return 401"
fi
echo ""

# Test 2.3: Admin access with correct password (header)
echo "Test 2.3: Admin endpoint with correct password in header"
RESPONSE=$(curl -s -w "\n%{http_code}" -X GET "$BASE_URL/api/admin/rsvps" \
  -H "Authorization: $ADMIN_PASSWORD")
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | head -n-1)
if [ "$HTTP_CODE" = "200" ] && echo "$BODY" | grep -q "success"; then
  print_result 0 "Correct password in header returns 200"
else
  print_result 1 "Correct password in header should return 200"
fi
echo ""

# Test 2.4: Admin access with correct password (query param)
echo "Test 2.4: Admin endpoint with correct password in query param"
RESPONSE=$(curl -s -w "\n%{http_code}" -X GET "$BASE_URL/api/admin/rsvps?password=$ADMIN_PASSWORD")
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | head -n-1)
if [ "$HTTP_CODE" = "200" ] && echo "$BODY" | grep -q "success"; then
  print_result 0 "Correct password in query param returns 200"
else
  print_result 1 "Correct password in query param should return 200"
fi
echo ""

echo "========================================="
echo "Test 3: Admin Endpoint Functionality Tests"
echo "========================================="
echo ""

# Test 3.1: Get RSVPs with sorting
echo "Test 3.1: Get RSVPs with sorting"
RESPONSE=$(curl -s -w "\n%{http_code}" -X GET "$BASE_URL/api/admin/rsvps?password=$ADMIN_PASSWORD&sortBy=full_name&order=asc")
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | head -n-1)
if [ "$HTTP_CODE" = "200" ] && echo "$BODY" | grep -q "count"; then
  print_result 0 "Get RSVPs with sorting returns 200"
else
  print_result 1 "Get RSVPs with sorting should return 200"
fi
echo ""

# Test 3.2: Get statistics
echo "Test 3.2: Get RSVP statistics"
RESPONSE=$(curl -s -w "\n%{http_code}" -X GET "$BASE_URL/api/admin/stats?password=$ADMIN_PASSWORD")
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | head -n-1)
if [ "$HTTP_CODE" = "200" ] && echo "$BODY" | grep -q "totalRSVPs"; then
  print_result 0 "Get statistics returns 200 with totalRSVPs"
else
  print_result 1 "Get statistics should return 200 with totalRSVPs"
fi
echo ""

# Test 3.3: Export CSV
echo "Test 3.3: Export RSVPs as CSV"
RESPONSE=$(curl -s -w "\n%{http_code}" -X GET "$BASE_URL/api/admin/export?password=$ADMIN_PASSWORD")
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | head -n-1)
if [ "$HTTP_CODE" = "200" ] && echo "$BODY" | grep -q "Full Name"; then
  print_result 0 "Export CSV returns 200 with CSV headers"
else
  print_result 1 "Export CSV should return 200 with CSV headers"
fi
echo ""

# Summary
echo "========================================="
echo "Test Summary"
echo "========================================="
echo -e "${GREEN}Passed: $PASS${NC}"
echo -e "${RED}Failed: $FAIL${NC}"
echo ""

if [ $FAIL -eq 0 ]; then
  echo -e "${GREEN}All tests passed!${NC}"
  exit 0
else
  echo -e "${RED}Some tests failed!${NC}"
  exit 1
fi
