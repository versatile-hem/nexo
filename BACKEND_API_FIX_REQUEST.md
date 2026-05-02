# Backend API Fix Request: End-of-Day Operations Endpoint

**Status**: 🔴 BLOCKING  
**Issue**: `POST /api/end-of-day-operations` returning 500 Internal Server Error  
**Frontend Impact**: Daily Operations feature unable to process batch transactions  
**Priority**: High - Core inventory feature affected

---

## Problem Statement

The Daily Operations feature frontend is fully implemented and tested. When users click "Save" on completed order/return entries, the request hits the `/api/end-of-day-operations` endpoint and receives a 500 error, preventing batch inventory updates.

### Error Details
- **Endpoint**: `POST /api/end-of-day-operations`
- **Status Code**: 500 Internal Server Error
- **Error Message**: "Unexpected error"
- **Frequency**: 100% reproducible
- **Frontend Handler**: Currently catches error and continues with local save (graceful degradation), but inventory balances don't update

---

## Required Implementation

### Endpoint Contract

**Request:**
```json
POST /api/end-of-day-operations
Content-Type: application/json

{
  "operations": [
    {
      "type": "ORDER" | "RETURN",
      "productId": 123,
      "quantity": 50,
      "unit": "nos",
      "courier": "Shadowfax" | "Delhivery" | "Xpressbees" | "Ekart",
      "channel": "MEESHO" | "FLIPKART" | "OFFLINE" | "AMAZON",
      "movementTime": "2026-05-02T18:47:30.000Z"
    },
    {
      "type": "ORDER",
      "productId": 456,
      "quantity": 30,
      "unit": "nos",
      "courier": "Shadowfax",
      "channel": "MEESHO",
      "movementTime": "2026-05-02T18:48:15.000Z"
    }
  ],
  "notes": ""
}
```

**Expected Response (200 OK):**
```json
{
  "operations": [
    {
      "id": "op-1",
      "productId": 123,
      "type": "ORDER",
      "quantity": 50,
      "channel": "MEESHO",
      "timestamp": "2026-05-02T18:47:30.000Z",
      "success": true
    },
    {
      "id": "op-2",
      "productId": 456,
      "type": "ORDER",
      "quantity": 30,
      "channel": "MEESHO",
      "timestamp": "2026-05-02T18:48:15.000Z",
      "success": true
    }
  ],
  "summary": {
    "totalOperations": 2,
    "successCount": 2,
    "failureCount": 0,
    "totalQuantityProcessed": 80
  }
}
```

---

## Functional Requirements

### Processing Logic

1. **Validate Input**
   - All operations array must have productId, type, quantity, channel
   - Quantity must be > 0
   - Type must be either "ORDER" or "RETURN"
   - Channel must map to valid sales channels

2. **For Each Operation**
   - Verify product exists in inventory database
   - Apply transaction based on type:
     - **ORDER**: Decrease stock by quantity
     - **RETURN**: Increase stock by quantity
   - Record movement in `StockMovement` table with:
     - productId, type (IN/OUT), quantity, channel, reference (courier), timestamp, createdAt
   - Update product's current `revisedCount` (or balance)

3. **Database Constraints**
   - Stock cannot go negative (RETURN type should validate sufficient stock exists)
   - All operations within a batch should be atomic (all succeed or all fail)
   - Create proper audit trail in `StockMovement` table

4. **Response Handling**
   - Even if individual operations fail, return 200 with detailed status per operation
   - Include summary statistics
   - Log all failures for debugging

---

## Data Model Mapping

### Frontend → Backend Channel Mapping
```
"Meesho"   → "MEESHO"
"Flipkart" → "FLIPKART"
"Offline"  → "OFFLINE"
"Amazon"   → "AMAZON"
```

### Frontend → Backend Type Mapping
```
"ORDER"  → Stock OUT (decrease inventory)
"RETURN" → Stock IN (increase inventory) [for daily ops context]
```

### Frontend → Database Movement Type
```
"ORDER"  → type: "OUT", channel: (as provided)
"RETURN" → type: "IN", channel: (as provided)
```

---

## Testing Scenarios

### Test Case 1: Batch Order Processing
**Input**: 4 orders from Daily Operations on 2026-05-02
```
- Earendelkids (p-1): -50 units, Shadowfax, Meesho
- Silicon Corner (p-2): -30 units, Shadowfax, Meesho
- Soft & Rattle (p-3): -20 units, Xpressbees, Meesho
- Projector (p-4): -15 units, Ekart, Meesho
```
**Expected**: All 4 orders succeed, stock decreases, movements recorded

### Test Case 2: Stock Validation
**Input**: Return operation with quantity > current stock
**Expected**: Validation error, balance not updated

### Test Case 3: Mixed Batch
**Input**: 2 orders + 1 return in single batch
**Expected**: All succeed with appropriate stock adjustments

---

## Related Frontend Code

**File**: `src/services/operationsApi.ts`  
**Method**: `operationsApi.endOfDayOperations(operations, notes)`

**File**: `src/features/inventory/pages/DailyOperationsPage.tsx`  
**Line**: ~86-100 (Save handler calls this endpoint)

---

## Acceptance Criteria

- [x] Endpoint accepts and validates batch operations
- [x] Stock levels update correctly (ORDER decreases, RETURN increases)
- [x] StockMovement records created with accurate data
- [x] Product revised count reflects stock changes
- [x] Returns 200 OK with operation statuses
- [x] Handles edge cases (negative stock, invalid products)
- [x] All database changes are atomic
- [x] Audit trail maintained

---

## Rollback Plan

If endpoint cannot be implemented immediately:
1. Frontend will continue to save daily reports locally (current fallback in place)
2. Backend can provide alternative batch endpoint name/location
3. Frontend can call individual `/daily-operations` endpoint per operation (slower but functional)

---

## Questions for Backend Team

1. Should negative stock be prevented or allowed with warning?
2. Do batch operations need to be in a single transaction or can partial success be accepted?
3. Should system auto-reconcile if API fails mid-batch?
4. Is audit logging already in place for inventory changes?

---

**Submitted by**: Frontend Team  
**Date**: 2026-05-03  
**Feature Owner**: Daily Operations / Inventory Management  
**Blocking**: Yes
