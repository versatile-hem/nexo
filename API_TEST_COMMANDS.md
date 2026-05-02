# 🔗 API Test Commands & cURL Examples

**Purpose:** Direct API testing without UI  
**Environment:** localhost:8080  
**Test Date:** 2 May 2026

---

## Prerequisites

```bash
# Verify backend is running
curl -s http://localhost:8080/api/health
# Expected: 200 OK
```

---

## Test Sequence via API

### 1️⃣ Get Product List

```bash
curl -s http://localhost:8080/api/products \
  -H "Content-Type: application/json" | jq

# Expected Response:
# [
#   {
#     "id": 1,
#     "name": "Test Product",
#     "sku": "SKU-001",
#     "unit": "nos",
#     "balance": 0
#   }
# ]

# Save product ID (usually 1) for next steps
PRODUCT_ID=1
```

---

### 2️⃣ Stock In - Add 100 Units

```bash
curl -X POST http://localhost:8080/api/stock-in \
  -H "Content-Type: application/json" \
  -d '[
    {
      "productId": 1,
      "quantity": 100,
      "unit": "nos",
      "supplier": "Test Supplier",
      "batchNumber": "BATCH-001",
      "movementTime": "2026-05-02T10:00:00Z"
    }
  ]' | jq

# Expected Response: 200 OK
# [
#   {
#     "productId": 1,
#     "quantity": 100
#   }
# ]
```

---

### 3️⃣ Get Stock Movements - Verify Stock In

```bash
curl -s "http://localhost:8080/api/stock-movements" \
  -H "Content-Type: application/json" | jq

# Expected: Entry with type="IN", quantity=100

# Filter by type
curl -s "http://localhost:8080/api/stock-movements?type=IN" | jq
# Expected: 1 entry
```

---

### 4️⃣ End of Day Operations - Stock Out (Meesho 20 units)

```bash
curl -X POST http://localhost:8080/api/end-of-day-operations \
  -H "Content-Type: application/json" \
  -d '{
    "operations": [
      {
        "type": "ORDER",
        "productId": 1,
        "quantity": 20,
        "unit": "nos",
        "courier": "Ekart",
        "channel": "MEESHO",
        "movementTime": "2026-05-02T11:00:00Z"
      }
    ],
    "notes": "Meesho order"
  }' | jq

# Expected: 200 OK with operation confirmation
```

---

### 5️⃣ End of Day Operations - Stock Out (Flipkart 15 units)

```bash
curl -X POST http://localhost:8080/api/end-of-day-operations \
  -H "Content-Type: application/json" \
  -d '{
    "operations": [
      {
        "type": "ORDER",
        "productId": 1,
        "quantity": 15,
        "unit": "nos",
        "courier": "Ekart",
        "channel": "FLIPKART",
        "movementTime": "2026-05-02T12:00:00Z"
      }
    ],
    "notes": "Flipkart order"
  }' | jq
```

---

### 6️⃣ End of Day Operations - Stock Out (Offline 10 units)

```bash
curl -X POST http://localhost:8080/api/end-of-day-operations \
  -H "Content-Type: application/json" \
  -d '{
    "operations": [
      {
        "type": "ORDER",
        "productId": 1,
        "quantity": 10,
        "unit": "nos",
        "courier": "Counter",
        "channel": "OFFLINE",
        "movementTime": "2026-05-02T13:00:00Z"
      }
    ],
    "notes": "Offline sale"
  }' | jq
```

---

### 7️⃣ End of Day Operations - Return (Add 5 units back)

```bash
curl -X POST http://localhost:8080/api/end-of-day-operations \
  -H "Content-Type: application/json" \
  -d '{
    "operations": [
      {
        "type": "RETURN",
        "productId": 1,
        "quantity": 5,
        "unit": "nos",
        "courier": "Ekart",
        "channel": "FLIPKART",
        "movementTime": "2026-05-02T14:00:00Z"
      }
    ],
    "notes": "Customer return"
  }' | jq
```

---

### 8️⃣ Final Verification - Get All Movements

```bash
curl -s "http://localhost:8080/api/stock-movements?page=0&size=100" \
  -H "Content-Type: application/json" | jq

# Expected: Array with 5 entries in order:
# [
#   { qty: 100, type: IN },
#   { qty: 20, type: OUT, channel: MEESHO },
#   { qty: 15, type: OUT, channel: FLIPKART },
#   { qty: 10, type: OUT, channel: OFFLINE },
#   { qty: 5, type: RETURN, channel: FLIPKART }
# ]
```

---

### 9️⃣ Pagination Test

```bash
# Get page 1 with 2 items per page
curl -s "http://localhost:8080/api/stock-movements?page=0&size=2" | jq

# Expected: 
# {
#   "content": [ 2 items ],
#   "totalPages": 3,
#   "totalElements": 5,
#   "pageNumber": 0,
#   "last": false
# }

# Get page 2
curl -s "http://localhost:8080/api/stock-movements?page=1&size=2" | jq
# Expected: 2 more items

# Get page 3
curl -s "http://localhost:8080/api/stock-movements?page=2&size=2" | jq
# Expected: 1 item, "last": true
```

---

### 🔟 Filter Tests

```bash
# Filter by type = IN
curl -s "http://localhost:8080/api/stock-movements?type=IN" | jq
# Expected: 1 entry (qty: 100)

# Filter by type = OUT
curl -s "http://localhost:8080/api/stock-movements?type=OUT" | jq
# Expected: 3 entries (qty: 20, 15, 10)

# Filter by channel = MEESHO
curl -s "http://localhost:8080/api/stock-movements?channel=MEESHO" | jq
# Expected: 1 entry (qty: 20)

# Filter by date range
curl -s "http://localhost:8080/api/stock-movements?startDate=2026-05-02&endDate=2026-05-02" | jq
# Expected: All 5 entries (same day)

# Combine filters
curl -s "http://localhost:8080/api/stock-movements?type=OUT&channel=FLIPKART" | jq
# Expected: 2 entries (15 OUT, 5 RETURN)
```

---

## Automated Test Script

```bash
#!/bin/bash
# test_stock_movements.sh

BASE_URL="http://localhost:8080/api"
PRODUCT_ID=1
SUCCESS_COUNT=0
FAIL_COUNT=0

# Helper functions
assert_status() {
  local status=$1
  local expected=$2
  if [ "$status" -eq "$expected" ]; then
    echo "✅ Status $status"
    ((SUCCESS_COUNT++))
  else
    echo "❌ Status $status (expected $expected)"
    ((FAIL_COUNT++))
  fi
}

assert_contains() {
  local response=$1
  local text=$2
  if echo "$response" | grep -q "$text"; then
    echo "✅ Contains '$text'"
    ((SUCCESS_COUNT++))
  else
    echo "❌ Missing '$text' in response"
    ((FAIL_COUNT++))
  fi
}

echo "🧪 Starting Stock Movement Tests..."

# Test 1: Stock In
echo -e "\n📦 Test 1: Stock In (100 units)"
RESPONSE=$(curl -s -w "\n%{http_code}" -X POST $BASE_URL/stock-in \
  -H "Content-Type: application/json" \
  -d '[{"productId": 1, "quantity": 100, "unit": "nos"}]')
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
assert_status "$HTTP_CODE" "200"

# Test 2: Verify entry
echo -e "\n✅ Test 2: Verify Stock In Entry"
RESPONSE=$(curl -s $BASE_URL/stock-movements)
assert_contains "$RESPONSE" '"quantity":100'
assert_contains "$RESPONSE" '"type":"IN"'

# Test 3: Stock Out
echo -e "\n📦 Test 3: Stock Out (Meesho 20 units)"
RESPONSE=$(curl -s -w "\n%{http_code}" -X POST $BASE_URL/end-of-day-operations \
  -H "Content-Type: application/json" \
  -d '{
    "operations":[{"type":"ORDER","productId":1,"quantity":20,"channel":"MEESHO"}],
    "notes":""
  }')
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
assert_status "$HTTP_CODE" "200"

# Test 4: Pagination
echo -e "\n📄 Test 4: Pagination (2 items per page)"
RESPONSE=$(curl -s "$BASE_URL/stock-movements?page=0&size=2")
assert_contains "$RESPONSE" '"totalPages"'
assert_contains "$RESPONSE" '"totalElements"'

# Test 5: Filters
echo -e "\n🔍 Test 5: Filters"
RESPONSE=$(curl -s "$BASE_URL/stock-movements?type=IN")
assert_contains "$RESPONSE" '"quantity":100'

echo -e "\n📊 Test Summary"
echo "✅ Passed: $SUCCESS_COUNT"
echo "❌ Failed: $FAIL_COUNT"
echo "Total: $((SUCCESS_COUNT + FAIL_COUNT))"

if [ $FAIL_COUNT -eq 0 ]; then
  echo -e "\n🎉 All tests passed!"
  exit 0
else
  echo -e "\n⚠️ Some tests failed"
  exit 1
fi
```

---

## Running the Automated Tests

```bash
# Make script executable
chmod +x test_stock_movements.sh

# Run tests
./test_stock_movements.sh

# Expected output:
# ✅ Status 200
# ✅ Contains 'quantity'
# ...
# 📊 Test Summary
# ✅ Passed: 15
# ❌ Failed: 0
```

---

## API Response Validation Checklist

### Stock In Response
```json
{
  "productId": 1,
  "quantity": 100,
  "sku": "SKU-001"
}
```
- [ ] HTTP 200
- [ ] productId present
- [ ] quantity = 100
- [ ] No errors

### Stock Movements List Response
```json
{
  "content": [
    {
      "id": "1",
      "productId": 1,
      "product": "SKU-001",
      "qty": 100,
      "quantity": 100,
      "type": "IN",
      "reference": "Manual",
      "createdAt": "2026-05-02T...",
      "items": []
    }
  ],
  "totalPages": 1,
  "totalElements": 1,
  "pageNumber": 0,
  "last": true
}
```
- [ ] HTTP 200
- [ ] content array present
- [ ] totalPages = 1
- [ ] totalElements = 5 (after all ops)
- [ ] All entries have required fields

### End of Day Operations Response
```json
{
  "operations": [...],
  "totalProcessed": 1
}
```
- [ ] HTTP 200
- [ ] operations array
- [ ] totalProcessed count accurate

---

## Performance Benchmarks

Expected response times:
```
Stock In:           200-400ms
Get Movements:      150-300ms
End of Day Ops:     500-1000ms (batch)
Pagination:         150-250ms
Filter + Page:      200-350ms
```

---

## Troubleshooting via API

### Check backend health
```bash
curl -i http://localhost:8080/api/health
```

### Check database connection
```bash
curl -s http://localhost:8080/api/products | jq '.length'
# Should return > 0
```

### Check for stack traces
```bash
# If you get 500 errors, check:
curl -s http://localhost:8080/api/stock-movements | jq '.error'
```

---

**End of API Test Guide**
