# ✅ Quick Reference: Stock Movement Test Checklist

**Test Date:** 2 May 2026  
**Duration:** ~30 minutes  
**Tester:** QA Engineer

---

## 🚀 Quick Start

### Before Testing
- [ ] Dev server running: `npm run dev` at `localhost:5173`
- [ ] Backend running at `localhost:8080`
- [ ] Product "SKU-001" exists in catalog
- [ ] Browser console open (F12)
- [ ] Network tab open to monitor API calls

---

## 📋 Test Sequence (15-20 min)

### ✅ Operation 1: Stock In (100 units)
```
URL: http://localhost:5173/inventory/stock-in
⏱️ Time: ~2 min

[ ] Navigate to page
[ ] Select product: SKU-001
[ ] Qty: 100
[ ] Supplier: "Test Supplier"
[ ] Batch: "BATCH-001"
[ ] Click Save
[ ] Verify toast: "Stock In recorded."
[ ] Check result display: 100 units
```

**API Check:**
```
[ ] POST /api/stock-in → 200 OK
[ ] Response: { productId: 1, quantity: 100 }
```

---

### ✅ Operation 2: Verify Entry Recorded
```
URL: http://localhost:5173/inventory/stock-movements
⏱️ Time: ~1 min

[ ] Page loaded
[ ] Entry visible in table
[ ] Type badge: GREEN (IN)
[ ] Quantity: 100
[ ] Channel: Manual
[ ] Date: Today
```

---

### ✅ Operation 3: Stock Out - Meesho (20 units)
```
URL: http://localhost:5173/inventory/daily-operations
⏱️ Time: ~2 min

[ ] Set Date: Today
[ ] Select Channel: Meesho
[ ] Add Row in Orders table
[ ] Product: SKU-001
[ ] Qty: 20
[ ] Courier: Ekart
[ ] Click Save
[ ] Confirm dialog: Click OK
[ ] Verify toast: "Daily operations saved"
```

**Verify:**
```
[ ] Stock Movements shows new entry
[ ] Type: OUT (red)
[ ] Channel: Meesho (blue)
[ ] Qty: 20
```

---

### ✅ Operation 4: Stock Out - Flipkart (15 units)
```
⏱️ Time: ~2 min

[ ] Daily Ops page (same)
[ ] Channel: Flipkart
[ ] Product: SKU-001
[ ] Qty: 15
[ ] Courier: Ekart
[ ] Save
[ ] Verify in Stock Movements
```

---

### ✅ Operation 5: Stock Out - Offline (10 units)
```
⏱️ Time: ~2 min

[ ] Daily Ops page (same)
[ ] Channel: Offline
[ ] Product: SKU-001  
[ ] Qty: 10
[ ] Courier: Counter
[ ] Save
[ ] Verify in Stock Movements
```

---

### ✅ Operation 6: Return (5 units)
```
⏱️ Time: ~2 min

[ ] Daily Ops page
[ ] Channel: Flipkart
[ ] Add row in RETURNS table (not Orders)
[ ] Product: SKU-001
[ ] Qty: 5
[ ] Save
[ ] Verify type: RETURN (red badge)
```

---

## 📊 Final Validation (5 min)

### Stock Calculation
```
Expected: 100 - 20 - 15 - 10 + 5 = 60 units

[ ] Verify final stock = 60 units
[ ] All 5 entries visible in Stock Movements table
[ ] Entries in correct order (newest first)
```

### Filter Tests
```
[ ] Type = "IN": Shows 1 entry (100)
[ ] Type = "OUT": Shows 3 entries (20+15+10)
[ ] Channel = "MEESHO": Shows 1 entry (20)
[ ] Channel = "FLIPKART": Shows 2 entries (15+5)
[ ] Channel = "OFFLINE": Shows 1 entry (10)
```

### Pagination Test
```
[ ] Set page size: 2 per page
[ ] Total pages: 3 (2+2+1)
[ ] Page navigation works
[ ] No data duplication
```

---

## 🏁 Test Summary

| Aspect | Status | Evidence |
|--------|--------|----------|
| Stock In | ✓/✗ | |
| Movements Recorded | ✓/✗ | |
| Stock Out (Meesho) | ✓/✗ | |
| Stock Out (Flipkart) | ✓/✗ | |
| Stock Out (Offline) | ✓/✗ | |
| Returns Processing | ✓/✗ | |
| Final Balance (60) | ✓/✗ | |
| Filters Working | ✓/✗ | |
| Pagination | ✓/✗ | |
| UI Updates Real-time | ✓/✗ | |

---

## 🎯 Pass/Fail Criteria

### ✅ PASS: All conditions met
- [x] Final stock = 60 units
- [x] All 5 movements recorded
- [x] Correct types (IN/OUT/RETURN)
- [x] Correct channels recorded
- [x] Filters working correctly
- [x] Pagination functional
- [x] UI updates real-time
- [x] No console errors
- [x] All API calls successful

### ❌ FAIL: Any of these occur
- Stock calculation incorrect
- Movements not recorded
- Negative stock allowed
- Duplicate entries
- Stale data displayed
- Pagination broken
- API errors
- Toast messages missing

---

## 📸 Evidence Required

```
Screenshot 1: Stock In form submitted
Screenshot 2: Stock In entry in movements table
Screenshot 3: Meesho order in movements (20 units)
Screenshot 4: Flipkart order in movements (15 units)
Screenshot 5: Offline order in movements (10 units)
Screenshot 6: Return entry in movements (5 units)
Screenshot 7: Final stock movements table with all entries
Screenshot 8: Filter by Type=OUT (3 entries showing)
Screenshot 9: Pagination page 1 (2 items)
Screenshot 10: Pagination page 2 (2 items)
```

---

## 🔍 Edge Case Quick Tests

```
[ ] Try stock out > available: Error shown
[ ] Submit without product: Error shown
[ ] Rapid button clicks: No duplicates
[ ] Page refresh: Data persists
[ ] Filter + pagination: Works together
[ ] Empty movements: "No data" message
```

---

## 🐛 If Issues Found

**Document:**
```
Issue #1
- URL: [where it happened]
- Action: [what you did]
- Expected: [what should happen]
- Actual: [what happened instead]
- Screenshot: [attach]
- Console Error: [copy/paste]
```

---

## ⏱️ Time Budget

```
Phase 1 (Stock In):        2 min ⏱️
Phase 2 (Verify):          1 min ⏱️
Phase 3 (Meesho):          2 min ⏱️
Phase 4 (Flipkart):        2 min ⏱️
Phase 5 (Offline):         2 min ⏱️
Phase 6 (Return):          2 min ⏱️
Final Validation:          5 min ⏱️
─────────────────────────
Total:                     16 min
```

---

## 🎓 Learning Outcomes

After test completion, validate:
- ✅ Understand stock movement flow
- ✅ Know batch vs individual operations
- ✅ Understand pagination logic
- ✅ Can interpret API responses
- ✅ Can validate inventory calculations

---

## 📞 Support

**If test fails:**
1. Check console for errors
2. Verify backend is running
3. Check network tab for failed requests
4. Review TECHNICAL_TEST_GUIDE.md
5. Consult QA_TEST_PLAN_STOCK_MOVEMENTS.md

---

**Status:** Ready to Execute  
**Last Updated:** 2 May 2026  
**Next Review:** After test completion

