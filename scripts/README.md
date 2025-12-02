# Data Cleaning Scripts

## clean-legacy-data.js

A Node.js script to normalize legacy CSV data with the following operations:

### Features

1. **Null Value Replacement**: Replaces null/empty values in specific columns:

   - `store_account_name` → `LEGACY_ACCOUNT_NAME_NULL`
   - `store_bank_name` → `LEGACY_BANK_NAME_NULL`
   - `paid_by` → `LEGACY_SAPPHIRE_USER`

2. **Column Removal**: Removes unwanted columns:

   - `customer_payment_status`
   - `store_id`
   - `store_amount_paid`

3. **CSV Handling**: Properly handles:
   - Tab-separated values (TSV format)
   - Quoted values containing special characters
   - Various null representations (empty, "null", "N/A", etc.)

### Usage

```bash
node scripts/clean-legacy-data.js <input-file> <output-file>
```

### Example

```bash
# Clean the legacy data file
node scripts/clean-legacy-data.js data/legacy-claims.csv data/legacy-claims-cleaned.csv
```

### Expected Input Format

Tab-separated CSV file with headers:

```
sn	device_id	imei	first_name	last_name	email	phone	state	store_id	device_fault	device_fault_price	customer_cost	customer_payment_status	sapphire_cost	sapphire_payment_status	store_payment_mode	store_account_number	store_account_name	store_bank_name	store_amount_paid	paid_by	paid_date	service_center_id	repair_status	approved_by	rejected_by	reject_reason	authorized_by	repair_status_date	date_created
```

### Output

The script will:

1. Display processing statistics
2. Show number of null replacements per column
3. Generate a cleaned CSV file with:
   - Removed columns excluded
   - Null values replaced with legacy placeholders
   - Same tab-separated format

### Sample Output

```
🚀 Starting CSV data cleaning...

📋 Original headers (29): sn, device_id, imei, first_name, ...
🗑️  Removing columns: customer_payment_status, store_id, store_amount_paid
🔄 Replacing nulls in columns: store_account_name, store_bank_name, paid_by

📋 New headers (26): sn, device_id, imei, first_name, ...

✅ Data cleaning completed successfully!

📊 Statistics:
   - Total rows processed: 1250
   - Columns removed: 3
   - Null replacements:
     • store_account_name: 87 replacements
     • store_bank_name: 87 replacements
     • paid_by: 45 replacements

💾 Output saved to: data/legacy-claims-cleaned.csv
```

### Notes

- The script treats the following as null: empty strings, "null", "undefined", "N/A" (case-insensitive)
- Input file must be tab-separated
- Output maintains the same tab-separated format
- Creates output directory if it doesn't exist
