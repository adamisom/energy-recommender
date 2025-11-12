# Plan Management Guide

Easy way to add and update energy plans in the database.

---

## Quick Start

### 1. Export Current Plans

```bash
npm run plans:export
```

This exports all existing plans to `prisma/plans.json` in an easy-to-edit JSON format.

### 2. Edit the JSON File

Open `prisma/plans.json` and:
- **Add new plans:** Add new plan objects to the `plans` array
- **Update existing plans:** Modify any plan's fields
- **Remove plans:** Delete plan objects from the array (they'll remain in DB, but won't be updated)

### 3. Import/Update Plans

```bash
npm run plans:import
```

This reads `prisma/plans.json` and:
- **Creates** new plans (if `planId` doesn't exist)
- **Updates** existing plans (if `planId` already exists)

---

## Plan Schema

Each plan object requires these fields:

```json
{
  "planId": "TX-001",              // Unique identifier (required)
  "state": "TX",                   // 'TX', 'PA', 'OH', or 'IL' (required)
  "supplierName": "TXU Energy",    // Company name (required)
  "planName": "TXU Energy Secure 12", // Plan name (required)
  "rateType": "fixed",             // 'fixed', 'variable', or 'tou' (required)
  "ratePerKwh": 0.1199,           // Rate per kWh (required)
  "monthlyFee": 9.95,              // Monthly fee (required)
  "contractLengthMonths": 12,      // Contract length, or null for month-to-month
  "earlyTerminationFee": 150,      // ETF amount (required)
  "renewablePct": 0,               // 0-100 (required)
  "supplierRating": 3.8,           // 1.0-5.0 (required)
  "onPeakRate": null,              // For TOU plans (optional)
  "offPeakRate": null,             // For TOU plans (optional)
  "planDetails": null              // JSON object (optional)
}
```

---

## Example: Adding a New Plan

1. Export plans:
   ```bash
   npm run plans:export
   ```

2. Edit `prisma/plans.json` and add to the `plans` array:
   ```json
   {
     "planId": "TX-024",
     "state": "TX",
     "supplierName": "New Energy Co",
     "planName": "Super Green 24",
     "rateType": "fixed",
     "ratePerKwh": 0.1099,
     "monthlyFee": 9.95,
     "contractLengthMonths": 24,
     "earlyTerminationFee": 200,
     "renewablePct": 100,
     "supplierRating": 4.5,
     "onPeakRate": null,
     "offPeakRate": null,
     "planDetails": null
   }
   ```

3. Import:
   ```bash
   npm run plans:import
   ```

---

## Example: Updating an Existing Plan

1. Export plans:
   ```bash
   npm run plans:export
   ```

2. Find the plan in `prisma/plans.json` and modify fields:
   ```json
   {
     "planId": "TX-001",
     "ratePerKwh": 0.1099,  // Changed from 0.1199
     // ... other fields
   }
   ```

3. Import:
   ```bash
   npm run plans:import
   ```

---

## For Production Database

To update production plans:

1. Set production `DATABASE_URL`:
   ```bash
   export DATABASE_URL="your-production-connection-string"
   ```

2. Export from production:
   ```bash
   npm run plans:export
   ```

3. Edit `prisma/plans.json`

4. Import to production:
   ```bash
   npm run plans:import
   ```

---

## Notes

- The `planId` field is used as the unique identifier
- Plans with the same `planId` will be updated, not duplicated
- The JSON file is gitignored (won't be committed)
- The script uses `upsert`, so it's safe to run multiple times

---

## Troubleshooting

**Error: "File not found"**
- Run `npm run plans:export` first to create the file

**Error: "Environment variable not found: DATABASE_URL"**
- Make sure `.env.local` exists with `DATABASE_URL`
- Or set it as an environment variable

**Error: "Missing required fields"**
- Ensure all required fields are present in the plan object
- Check the schema above for required fields

