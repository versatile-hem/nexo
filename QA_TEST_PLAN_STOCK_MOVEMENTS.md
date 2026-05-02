# 🧪 QA Test Plan: Stock Movement Lifecycle

**Test Date:** 2 May 2026  
**Environment:** localhost:5173  
**Test Scope:** Complete inventory flow from Stock In → Stock Out (multi-channel) → Returns

---

## 📋 Test Environment Setup

### Prerequisites
- [ ] Dev server running at `http://localhost:5173`
- [ ] Backend API running at `http://localhost:8080`
- [ ] Test user logged in with appropriate permissions
- [ ] Product catalog loaded

### Test Product
- **SKU:** SKU-001 (or available test product)
- **Initial Stock:** 0 units
- **Unit:** nos (pieces)

---

## 🔄 Step-by-Step Test Execution

### **Step 1: Stock In - Add 100 Units** ✅

**URL:** `http://localhost:5173/inventory/stock-in`

**Actions:**
1. Navigate to Stock In page
2. Select product: SKU-001
3. Enter quantity: 100
4. Set supplier: "Test Supplier"
5. Set batch number: "BATCH-001"
6. Click "Save Stock In"

**Expected Results:**
- ✅ Toast message: "Stock In recorded."
- ✅ Result shows: `Stock In: 100 units`
- ✅ Page resets for next entry
- ✅ Inventory query cache invalidated

**Actual Results:**
```
[Awaiting manual test execution]
```

---

### **Step 2: Verify Stock Movement Entry**

**URL:** `http://localhost:5173/inventory/stock-movements`

**Expected Results:**
- ✅ New entry visible with:
  - Product: SKU-001
  - Quantity: 100
  - Type: IN (green badge)
  - Channel: Manual
  - Date: Today

**Filters Applied:**
- Type: All Types
- From Date: Today
- To Date: Today

**Actual Results:**
```
[Awaiting manual test execution]
```

---

### **Step 3: Stock Out - Meesho Order (Remove 20 Units)** 📦

**URL:** `http://localhost:5173/inventory/daily-operations`

**Actions:**
1. Set Date: Today
2. Set Channel: Meesho
3. Enter Raw Input or manually add:
   - Product: SKU-001
   - Quantity: 20
   - Unit: nos
   - Courier: "Ekart"
4. Click "Save Daily Operations"

**Expected Results:**
- ✅ Toast: "Daily operations saved and stock updated."
- ✅ Stock reduced from 100 → 80
- ✅ Movement entry created:
  - Type: ORDER (or OUT)
  - Channel: MEESHO
  - Quantity: -20

**Actual Results:**
```
[Awaiting manual test execution]
```

---

### **Step 4: Stock Out - Flipkart Order (Remove 15 Units)** 📦

**URL:** `http://localhost:5173/inventory/daily-operations`

**Actions:**
1. Set Date: Today
2. Set Channel: Flipkart
3. Add order:
   - Product: SKU-001
   - Quantity: 15
   - Courier: "Ekart"
4. Click "Save Daily Operations"

**Expected Results:**
- ✅ Stock reduced from 80 → 65
- ✅ Movement entry created:
  - Type: ORDER
  - Channel: FLIPKART
  - Quantity: -15

**Actual Results:**
```
[Awaiting manual test execution]
```

---

### **Step 5: Stock Out - Offline Channel (Remove 10 Units)** 🏪

**URL:** `http://localhost:5173/inventory/daily-operations`

**Actions:**
1. Set Channel: Offline
2. Add order:
   - Product: SKU-001
   - Quantity: 10
   - Courier: Manual/Counter
3. Click "Save Daily Operations"

**Expected Results:**
- ✅ Stock reduced from 65 → 55
- ✅ Movement entry created:
  - Type: ORDER
  - Channel: OFFLINE
  - Quantity: -10

**Actual Results:**
```
[Awaiting manual test execution]
```

---

### **Step 6: Return Adjustment (Add 5 Units Back)** 🔁

**URL:** `http://localhost:5173/inventory/daily-operations`

**Actions:**
1. Set Date: Today
2. Set Channel: Any (e.g., Flipkart)
3. Add return (if UI supports):
   - Product: SKU-001
   - Quantity: 5 (in Returns section)
4. Click "Save Daily Operations"

**Expected Results:**
- ✅ Stock increased from 55 → 60
- ✅ Movement entry created:
  - Type: RETURN
  - Channel: FLIPKART
  - Quantity: +5

**Actual Results:**
```
[Awaiting manual test execution]
```

---

## 📊 Final Inventory Calculation

### Stock Calculation Chain
```
Initial Stock:        0 units
+ Stock In:         +100 units  → 100
- Meesho Order:      -20 units  → 80
- Flipkart Order:    -15 units  → 65
- Offline Order:     -10 units  → 55
+ Return:            +5 units   → 60
─────────────────────────────
FINAL STOCK:         60 units ✅
```

### Validation Points
- [ ] Product balance = 60 units
- [ ] All 4 OUT movements recorded
- [ ] All channels correctly labeled
- [ ] Correct quantities (positive/negative)
- [ ] Timestamps present
- [ ] Movement order chronological

---

## 🔍 Stock Movements History Verification

**URL:** `http://localhost:5173/inventory/stock-movements`

### Expected Table Entries (Sorted by Latest)

| # | Product | Qty | Channel | Type | Date | Status |
|---|---------|-----|---------|------|------|--------|
| 1 | SKU-001 | 5 | Flipkart | RETURN | Today | ✅ |
| 2 | SKU-001 | 10 | Offline | OUT | Today | ✅ |
| 3 | SKU-001 | 15 | Flipkart | OUT | Today | ✅ |
| 4 | SKU-001 | 20 | Meesho | OUT | Today | ✅ |
| 5 | SKU-001 | 100 | Manual | IN | Today | ✅ |

### Filter Tests

#### Test 1: Filter by Type = "IN"
- **Expected:** Only 1 entry (100 units IN)
- **Actual:** 
  ```
  [Awaiting manual test execution]
  ```

#### Test 2: Filter by Type = "OUT"  
- **Expected:** 3 entries (20+15+10 = 45 units total OUT)
- **Actual:**
  ```
  [Awaiting manual test execution]
  ```

#### Test 3: Filter by Channel = "FLIPKART"
- **Expected:** 2 entries (15 OUT + 5 RETURN)
- **Actual:**
  ```
  [Awaiting manual test execution]
  ```

#### Test 4: Pagination Test
- **Page Size:** Set to 2 items per page
- **Expected:** Multiple pages required to view all 5 entries
- **Test Navigation:** Click Previous/Next buttons
- **Expected Results:**
  - [ ] All pages load correctly
  - [ ] No data duplication
  - [ ] Correct items shown per page
  - [ ] Previous disabled on page 1
  - [ ] Next disabled on last page
- **Actual:**
  ```
  [Awaiting manual test execution]
  ```

---

## ⚠️ Edge Cases & Negative Tests

### Test Case 1: Negative Stock Prevention
**Action:** Try to sell more than available stock  
**Input:** Quantity: 100 (when only 60 available)  
**Expected:** 
- [ ] Error message displayed
- [ ] Stock NOT reduced below 0
- [ ] Database remains consistent

**Actual:** ```
[Awaiting manual test execution]
```

---

### Test Case 2: Required Field Validation
**Action:** Try to submit without required fields  
**Expected:**
- [ ] Product field: Error "Select product"
- [ ] Quantity field: Error "Enter valid quantity"
- [ ] Form NOT submitted

**Actual:**
```
[Awaiting manual test execution]
```

---

### Test Case 3: Duplicate Submission Prevention
**Action:** Click Save button multiple times rapidly  
**Expected:**
- [ ] Only 1 request sent
- [ ] No duplicate entries in movement history
- [ ] Button disabled during submission

**Actual:**
```
[Awaiting manual test execution]
```

---

### Test Case 4: Real-time UI Updates
**Action:** After saving, check UI updates instantly  
**Expected:**
- [ ] Stock balance updates without page refresh
- [ ] New entries appear in movement history
- [ ] No stale data displayed

**Actual:**
```
[Awaiting manual test execution]
```

---

### Test Case 5: Error Handling
**Action:** Disconnect backend API and try operation  
**Expected:**
- [ ] Error toast displayed: "Failed to save..."
- [ ] Form NOT cleared (data preserved)
- [ ] User can retry

**Actual:**
```
[Awaiting manual test execution]
```

---

## 🎨 UI/UX Validation

### Stock In Page
- [ ] Form fields clearly labeled
- [ ] Product dropdown searchable
- [ ] Unit dropdown functional
- [ ] Add/Remove row buttons work
- [ ] Save button disabled with empty required fields
- [ ] Result display shows updated balance
- [ ] Success toast visible (≥3 seconds)

### Daily Operations Page
- [ ] Date picker functional
- [ ] Channel dropdown shows all 4 options:
  - [ ] Meesho
  - [ ] Flipkart
  - [ ] Amazon
  - [ ] Offline
- [ ] Orders and Returns tables separate
- [ ] Add Row buttons functional
- [ ] Remove Row buttons functional
- [ ] Courier field autocomplete (if available)
- [ ] Confirm dialog before save with order count

### Stock Movements Page
- [ ] Table displays all columns:
  - [ ] Product name/SKU
  - [ ] Quantity (numeric, right-aligned)
  - [ ] Channel (color-coded badge)
  - [ ] Type (green for IN, red for OUT/RETURN)
  - [ ] Date (readable format)
- [ ] Filters easily accessible:
  - [ ] Type dropdown
  - [ ] Date range inputs
  - [ ] Product dropdown
- [ ] Pagination controls visible
  - [ ] Page size dropdown
  - [ ] Previous/Next buttons
  - [ ] Page info display
- [ ] Empty state message (when no data)
- [ ] Loading skeleton while fetching
- [ ] Error state with retry button

---

## 📈 Performance Validation

### Load Time Tests
- [ ] Stock In Page load: < 2s
- [ ] Daily Operations Page load: < 2s
- [ ] Stock Movements Page load: < 2s
- [ ] Pagination navigation: < 1s

### Data Volume Tests
- [ ] Add 50 stock movements: All visible in history
- [ ] Paginate through 100+ entries: No lag
- [ ] Filter 1000 entries: Response < 2s

---

## 🔗 API Validation

### Request/Response Logging

#### Stock In API Call
```
POST /api/stock-in
{
  "items": [
    {
      "productId": 1,
      "quantity": 100,
      "unit": "nos",
      "supplier": "Test Supplier",
      "batchNumber": "BATCH-001",
      "movementTime": "2026-05-02T12:00:00Z"
    }
  ]
}

Response: 200 OK
{
  "productId": 1,
  "quantity": 100
}
```

#### Daily Operations Batch API Call
```
POST /api/end-of-day-operations
{
  "operations": [
    {
      "type": "ORDER",
      "productId": 1,
      "quantity": 20,
      "unit": "nos",
      "courier": "Courier Name",
      "channel": "MEESHO",
      "movementTime": "2026-05-02T13:00:00Z"
    }
  ],
  "notes": ""
}

Response: 200 OK
```

#### Stock Movements Query
```
GET /api/stock-movements?type=&startDate=&endDate=&page=0&size=20

Response: 200 OK
{
  "content": [...],
  "totalPages": 1,
  "totalElements": 5,
  "pageNumber": 0,
  "last": true
}
```

---

## 🐛 Issues Found

| ID | Title | Severity | Status | Details |
|----|-------|----------|--------|---------|
| | | | | |

---

## ✅ Test Summary

### Statistics
- **Total Test Cases:** 25+
- **Passed:** 
- **Failed:** 
- **Skipped:** 
- **Pass Rate:** 

### Critical Issues Found
- None expected based on code review

### Recommendations
1. Add product search in returns/orders section
2. Implement batch import for stock in
3. Add export functionality for movement history
4. Consider audit trail for user actions

---

## 📸 Evidence

### Screenshots Required
- [ ] Stock In form filled and submitted
- [ ] Stock Movements table with all entries
- [ ] Filter results for each type
- [ ] Pagination navigation
- [ ] Error message handling
- [ ] Final inventory balance

---

**Approval:** _______________  
**Date:** _______________  
**Tester:** QA Engineer  

