/**
 * CSV Data Cleaner Script
 *
 * This script normalizes legacy CSV data by:
 * 1. Replacing null values in specific columns with legacy placeholders
 * 2. Removing unwanted columns
 *
 * Usage: node scripts/clean-legacy-data.js input.csv output.csv
 */

/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require("fs");
const path = require("path");
const ExcelJS = require("exceljs");

// Configuration
const NULL_REPLACEMENTS = {
	store_account_name: "LEGACY_ACCOUNT_NAME_NULL",
	store_bank_name: "LEGACY_BANK_NAME_NULL",
	paid_by: "LEGACY_SAPPHIRE_USER",
};

const COLUMNS_TO_REMOVE = [
	"customer_payment_status",
	"store_id",
	"store_amount_paid",
];

/**
 * Check if value is considered null/empty
 */
function isNullOrEmpty(value) {
	if (!value) return true;
	if (typeof value !== "string") return false;
	const trimmed = value.trim();
	return (
		trimmed === "" ||
		trimmed.toLowerCase() === "null" ||
		trimmed.toLowerCase() === "undefined" ||
		trimmed === "N/A" ||
		trimmed === "n/a"
	);
}

/**
 * Clean and normalize CSV/Excel data
 */
async function cleanData(inputPath, outputPath) {
	console.log("🚀 Starting data cleaning...\n");

	const workbook = new ExcelJS.Workbook();

	// Read input file (supports CSV, XLSX, XLS)
	const ext = path.extname(inputPath).toLowerCase();
	if (ext === ".csv") {
		await workbook.csv.readFile(inputPath, {
			delimiter: "\t", // Tab-delimited
			quote: '"',
			escape: '"',
		});
	} else {
		await workbook.xlsx.readFile(inputPath);
	}

	const worksheet = workbook.worksheets[0];

	if (!worksheet) {
		console.error("❌ Error: No worksheet found in input file");
		process.exit(1);
	}

	// Get headers from first row
	const headerRow = worksheet.getRow(1);
	const headers = [];
	headerRow.eachCell({ includeEmpty: true }, (cell, colNumber) => {
		headers[colNumber - 1] = cell.value ? String(cell.value).trim() : "";
	});

	console.log(`📋 Original headers (${headers.length}):`, headers.join(", "));

	// Get indices of columns to remove
	const removeIndices = new Set();
	COLUMNS_TO_REMOVE.forEach((col) => {
		const idx = headers.indexOf(col);
		if (idx !== -1) {
			removeIndices.add(idx);
		}
	});

	console.log(`🗑️  Removing columns: ${COLUMNS_TO_REMOVE.join(", ")}`);

	// Get indices of columns to replace nulls
	const replaceIndices = {};
	Object.keys(NULL_REPLACEMENTS).forEach((col) => {
		const idx = headers.indexOf(col);
		if (idx !== -1) {
			replaceIndices[idx] = NULL_REPLACEMENTS[col];
		}
	});

	console.log(
		`🔄 Replacing nulls in columns:`,
		Object.keys(NULL_REPLACEMENTS).join(", ")
	);

	// Filter headers (remove unwanted columns)
	const newHeaders = headers.filter((_, idx) => !removeIndices.has(idx));
	console.log(
		`\n📋 New headers (${newHeaders.length}):`,
		newHeaders.join(", ")
	);

	// Create new workbook for output
	const outputWorkbook = new ExcelJS.Workbook();
	const outputWorksheet = outputWorkbook.addWorksheet("Cleaned Data");

	// Set headers
	outputWorksheet.addRow(newHeaders);

	// Style header row
	outputWorksheet.getRow(1).font = { bold: true };
	outputWorksheet.getRow(1).fill = {
		type: "pattern",
		pattern: "solid",
		fgColor: { argb: "FFE0E0E0" },
	};

	// Process data rows
	let nullReplacements = {
		store_account_name: 0,
		store_bank_name: 0,
		paid_by: 0,
	};

	let rowCount = 0;
	worksheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
		if (rowNumber === 1) return; // Skip header row

		const values = [];
		row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
			values[colNumber - 1] = cell.value;
		});

		// Replace null values
		const newValues = values.map((value, idx) => {
			if (replaceIndices[idx] && isNullOrEmpty(value)) {
				const colName = headers[idx];
				if (nullReplacements[colName] !== undefined) {
					nullReplacements[colName]++;
				}
				return replaceIndices[idx];
			}
			return value;
		});

		// Filter out removed columns
		const filteredValues = newValues.filter(
			(_, idx) => !removeIndices.has(idx)
		);

		outputWorksheet.addRow(filteredValues);
		rowCount++;
	});

	// Auto-fit columns
	outputWorksheet.columns.forEach((column, idx) => {
		let maxLength = newHeaders[idx]?.length || 10;
		column.eachCell({ includeEmpty: true }, (cell) => {
			const cellLength = cell.value ? String(cell.value).length : 0;
			if (cellLength > maxLength) {
				maxLength = cellLength;
			}
		});
		column.width = Math.min(maxLength + 2, 50);
	});

	// Write output file
	const outputExt = path.extname(outputPath).toLowerCase();
	if (outputExt === ".csv") {
		await outputWorkbook.csv.writeFile(outputPath, {
			delimiter: "\t",
			quote: '"',
			escape: '"',
		});
	} else {
		await outputWorkbook.xlsx.writeFile(outputPath);
	}

	console.log("\n✅ Data cleaning completed successfully!");
	console.log(`\n📊 Statistics:`);
	console.log(`   - Total rows processed: ${rowCount}`);
	console.log(`   - Columns removed: ${removeIndices.size}`);
	console.log(`   - Null replacements:`);
	Object.entries(nullReplacements).forEach(([col, count]) => {
		console.log(`     • ${col}: ${count} replacements`);
	});
	console.log(`\n💾 Output saved to: ${outputPath}`);
}

// Main execution
if (require.main === module) {
	const args = process.argv.slice(2);

	if (args.length !== 2) {
		console.log(
			"Usage: node scripts/clean-legacy-data.js <input-file> <output-file>"
		);
		console.log("\nSupported formats: .csv, .xlsx, .xls");
		console.log("\nExample:");
		console.log(
			"  node scripts/clean-legacy-data.js data/legacy.csv data/legacy-cleaned.xlsx"
		);
		console.log(
			"  node scripts/clean-legacy-data.js data/legacy.xlsx data/legacy-cleaned.csv"
		);
		process.exit(1);
	}

	const [inputPath, outputPath] = args;

	// Validate input file exists
	if (!fs.existsSync(inputPath)) {
		console.error(`❌ Error: Input file not found: ${inputPath}`);
		process.exit(1);
	}

	// Create output directory if it doesn't exist
	const outputDir = path.dirname(outputPath);
	if (!fs.existsSync(outputDir)) {
		fs.mkdirSync(outputDir, { recursive: true });
	}

	cleanData(inputPath, outputPath)
		.then(() => {
			console.log("\n🎉 Process completed!");
		})
		.catch((error) => {
			console.error("❌ Error during processing:", error.message);
			console.error(error.stack);
			process.exit(1);
		});
}

module.exports = { cleanData, isNullOrEmpty };
