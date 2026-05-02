# 🔬 Technical Test Execution Guide

**Purpose:** Step-by-step instructions for executing stock movement tests  
**Date:** 2 May 2026

---

## 🛠️ Test Environment Verification

### Backend API Validation
```bash
# Test 1: Verify backend is running
curl -s http://localhost:8080/api/health
# Expected: 200 OK or valid health response

# Test 2: Check product API
curl -s http://localhost:8080/api/products
# Expected: 200 OK with product list

# Test 3: Check stock movements endpoint
curl -s http://localhost:8080/api/stock-movements
# Expected: 200 OK with paginated response
```

### Frontend Validation
```bash
# Test application compilation
npm run build
# Expected: ✓ built in < 3s

# Test dev server
npm run dev
# Expected: Server running on http://localhost:5173
```

---

## 🔍 Code Review Findings

### Stock In Page (`/src/features/inventory/pages/StockInPage.tsx`)

**✅ Verified Implementation:**
```typescript
// Correct API integration
const addMutation = useMutation({
  mutationFn: () => operationsApi.stockIn(items),
  onSuccess: (balances) => {
    toast.success("Stock In recorded.");
    setResultRows(balances);
    queryClient.invalidateQueries({ queryKey: ["stock-movements"] });
    // ✅ Cache invalidation ensures fresh data
  },
});
```

**Validation Logic:**
- ✅ Product selection mandatory (validates earlier)
- ✅ Positive quantity validation via `validatePositiveQuantity()`
- ✅ Batch number and supplier optional
- ✅ Success/error toasts implemented

---

### Daily Operations Page (`/src/features/inventory/pages/DailyOperationsPage.tsx`)

**✅ Verified Batch API Integration:**
```typescript
// Batch endpoint implementation
const result = await operationsApi.endOfDayOperations(operations);

// Handles multiple operations in single request
{
  "operations": [
    { type: "ORDER", productId: 1, quantity: 20, channel: "MEESHO", ... },
    { type: "ORDER", productId: 1, quantity: 15, channel: "FLIPKART", ... },
    { type: "ORDER", productId: 1, quantity: 10, channel: "OFFLINE", ... },
    { type: "RETURN", productId: 1, quantity: 5, channel: "FLIPKART", ... }
  ],
  "notes": ""
}
```

**Channel Support:**
- ✅ Meesho: Direct mapping to `MEESHO`
- ✅ Flipkart: Direct mapping to `FLIPKART`
- ✅ Amazon: Mapped to `AMAZON`
- ✅ Offline: Mapped to `OFFLINE`

**Data Flow:**
1. User enters orders/returns in table
2. Form validation ensures quantity > 0
3. Product resolution by name/SKU
4. Batch submission to API
5. Query cache invalidation
6. UI reset after success

---

### Stock Movements Page (`/src/features/inventory/pages/StockMovementsPage.tsx`)

**✅ Verified Pagination Logic:**

**Server-Side Pagination (No Filter):**
```typescript
const paginatedMovements = useMemo(() => {
  if (isFiltered) {
    // Client-side pagination for filtered results
    const start = displayedPage * pageSize;
    const end = start + pageSize;
    return filteredMovements.slice(start, end);
  }
  // ✅ Server-side: Use API-paginated data directly
  return movements;
}, [filteredMovements, displayedPage, pageSize, isFiltered, movements]);
```

**Client-Side Pagination (With Product Filter):**
- Filters by product ID
- Recalculates total pages from filtered subset
- Slices data locally for display

**Display Logic:**
- ✅ Item range: "Showing X to Y of Z"
- ✅ Page info: "Page X of Y"
- ✅ Previous button: Disabled on page 1
- ✅ Next button: Disabled on last page

---

### Operations API (`/src/services/operationsApi.ts`)

**✅ Batch Endpoint Implementation:**
```typescript
async endOfDayOperations(operations: DailyOperationPayload[], notes?: string) {
  const payload = {
    operations: operations.map((op) => ({
      type: op.type,
      productId: Number(op.productId),
      quantity: op.quantity,
      unit: op.unit,
      courier: op.courier,
      channel: toBackendChannel(op.channel),
      movementTime: op.movementTime || new Date().toISOString(),
    })),
    notes: notes || "",
  };

  const response = await api.post<any>("/end-of-day-operations", payload);
  return response.data;
}
```

**Channel Mapping:**
```typescript
function toBackendChannel(channel?: string) {
  if (!channel) return undefined;
  if (channel === "Meesho") return "MEESHO";
  if (channel === "Flipkart") return "FLIPKART";
  if (channel === "Offline") return "OFFLINE";
  return "AMAZON";
}
```

---

## ✅ Implementation Checklist

### Stock In Feature
- [x] Form accepts: Product, Quantity, Unit, Supplier, Batch Number
- [x] API: POST `/api/stock-in` with items array
- [x] Response: Updated inventory balance
- [x] Query cache invalidation: `["stock-movements"]` and `["products"]`
- [x] Success toast: "Stock In recorded."
- [x] Form reset after submission

### Daily Operations Feature
- [x] Supports Orders and Returns tables
- [x] Channel dropdown: Meesho, Flipkart, Amazon, Offline
- [x] Date picker for operation date
- [x] Product + quantity validation
- [x] Batch API: POST `/api/end-of-day-operations`
- [x] Sends all operations in single request
- [x] Pre-save validation: Stock In required
- [x] Pre-save validation: Product existence check
- [x] Query cache invalidation after save

### Stock Movements Feature
- [x] Table display: Product, Quantity, Channel, Type, Date
- [x] Type filter: All/IN/OUT
- [x] Product filter: Dropdown with search
- [x] Date range filter: From/To dates
- [x] Page size selector: 10/20/50/100
- [x] Pagination: Previous/Next buttons
- [x] Page info display
- [x] Color-coded badges:
  - [x] Green for IN type
  - [x] Red for OUT/RETURN type
  - [x] Blue for channel
- [x] Correct item counts per page

---

## 🧮 Expected API Response Formats

### Stock In Response
```json
{
  "productId": 1,
  "quantity": 100,
  "sku": "SKU-001"
}
```

### End of Day Operations Response
```json
{
  "operations": [
    { "productId": 1, "quantity": 20 },
    { "productId": 1, "quantity": 15 }
  ],
  "totalProcessed": 2
}
```

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
      "createdAt": "2026-05-02T12:00:00Z",
      "items": []
    }
  ],
  "totalPages": 1,
  "totalElements": 1,
  "pageNumber": 0,
  "last": true
}
```

---

## 📊 Test Data Preparation

### Product Setup
```sql
-- Verify test product exists
SELECT * FROM products WHERE sku = 'SKU-001';
-- Expected: 1 row

-- Alternative: Create test product if needed
INSERT INTO products 
  (name, sku, unit, supplier_id) 
VALUES 
  ('Test Product', 'SKU-001', 'nos', 1);
```

---

## 🎯 Manual Test Execution Steps

### Phase 1: Stock In (Add 100 units)

**Step 1.1: Navigate to Stock In**
```
URL: http://localhost:5173/inventory/stock-in
Expected: Form with fields visible
```

**Step 1.2: Fill Form**
```
Product: Select "SKU-001"
Quantity: 100
Unit: nos
Supplier: Test Supplier
Batch Number: BATCH-2026-05-001
```

**Step 1.3: Submit**
```
Action: Click "Save Stock In" button
Expected Output:
  - Toast: "Stock In recorded."
  - Result shows: "Stock In: 100 units"
  - Form resets
```

**Step 1.4: Verify Backend**
```
POST /api/stock-in
Payload:
{
  "items": [{
    "productId": 1,
    "quantity": 100,
    "unit": "nos",
    "supplier": "Test Supplier",
    "batchNumber": "BATCH-2026-05-001",
    "movementTime": "2026-05-02T..."
  }]
}

Expected: 200 OK with balance response
```

---

### Phase 2: Verify Stock Movement Entry

**Step 2.1: Navigate to Stock Movements**
```
URL: http://localhost:5173/inventory/stock-movements
Expected: Table with stock in entry visible
```

**Step 2.2: Verify Entry Details**
```
Row Check:
  ✓ Product: SKU-001 or product name
  ✓ Quantity: 100 (right-aligned, bold)
  ✓ Channel: Manual (blue badge)
  ✓ Type: IN (green badge)
  ✓ Date: 2026-05-02
```

**Step 2.3: Apply Filter - Type: IN**
```
Filter: Type = "IN"
Expected: Only Stock In entry visible (quantity: 100)
```

---

### Phase 3: Stock Out - Meesho (Remove 20 units)

**Step 3.1: Navigate to Daily Operations**
```
URL: http://localhost:5173/inventory/daily-operations
Expected: Empty/form ready
```

**Step 3.2: Set Parameters**
```
Date: 2026-05-02 (today)
Channel: Meesho
```

**Step 3.3: Add Order Row**
```
Product: SKU-001
Quantity: 20
Unit: nos
Courier: Ekart
```

**Step 3.4: Submit**
```
Action: Click "Save Daily Operations"
Expected:
  - Confirm dialog: "Proceed with ORDER entries?"
  - Toast: "Daily operations saved and stock updated."
  - Data cleared
```

**Step 3.5: Verify Stock Movements**
```
URL: http://localhost:5173/inventory/stock-movements
New Entry Expected:
  ✓ Product: SKU-001
  ✓ Quantity: 20 (right-aligned)
  ✓ Channel: Meesho (blue badge)
  ✓ Type: OUT (red badge)
  ✓ Date: 2026-05-02
```

---

## 🔧 Debugging Checklist

If test fails, check:

### Browser Console
```javascript
// Check for errors
window.console.error() // Should be empty

// Verify React Query
window.__REACT_QUERY_CACHE__ // Should have data
```

### Network Tab
```
✓ POST /api/stock-in → 200 OK
✓ POST /api/end-of-day-operations → 200 OK
✓ GET /api/stock-movements → 200 OK
✓ GET /api/products → 200 OK
```

### Redux/State (if applicable)
```javascript
// Check store state
localStorage.getItem('dailyOpsStore')
// Should contain operations data
```

### Database Verification
```sql
-- Check stock movements
SELECT * FROM stock_movement 
WHERE product_id = 1 
ORDER BY created_at DESC;

-- Check product balance
SELECT * FROM products WHERE id = 1;
-- balance should be 60 after all operations
```

---

## 🐛 Common Issues & Resolutions

### Issue 1: "Stock In is required before daily operations"
**Cause:** No Stock In recorded for the date  
**Resolution:** Complete Phase 1 (Stock In) first before daily operations

### Issue 2: Pagination buttons not visible
**Cause:** Less than 1 page of data  
**Resolution:** Add more entries or reduce page size to 10

### Issue 3: Unknown product error
**Cause:** Product not in catalog  
**Resolution:** Check product dropdown, ensure product exists in DB

### Issue 4: Stale data displayed
**Cause:** Query cache not invalidated  
**Resolution:** Hard refresh (Cmd+Shift+R) or check React Query keys

### Issue 5: Negative stock allowed
**Cause:** Validation not enforced  
**Resolution:** Check backend validation rules

---

## 📝 Test Results Template

```markdown
# Test Execution Results - [DATE]

## Summary
- Total Operations: 4 (1 IN + 3 OUT + Returns)
- Final Stock: [Actual Value]
- Expected Stock: 60 units
- Status: [PASS/FAIL]

## Phase Results

### Phase 1: Stock In ✓/✗
- Recorded: 100 units
- Status: [PASS/FAIL]
- Evidence: [Screenshot/Log]

### Phase 2: Verify Entry ✓/✗
- Entry visible: [YES/NO]
- Data correct: [YES/NO]
- Status: [PASS/FAIL]

### Phase 3: Stock Out - Meesho ✓/✗
- Recorded: 20 units OUT
- Balance after: 80 units
- Status: [PASS/FAIL]

... [Additional phases]

## Issues Found
[List any issues]

## Recommendations
[List recommendations]
```

---

## 🚀 Performance Baseline

Expected times (from localhost):
- Stock In submission: < 1s
- Stock Movements page load: < 2s
- Pagination navigation: < 500ms
- Filter application: < 500ms

---

**End of Technical Guide**
