/**
 * API Domain Template
 *
 * To use this template:
 * 1. Create a new folder in lib/api/ with your domain name (e.g., lib/api/admin/)
 * 2. Copy this file to that folder and rename it to index.ts
 * 3. Replace [DOMAIN NAME] with your actual domain name
 * 4. Update the interfaces and functions to match your API endpoints
 * 5. Add export to lib/api/index.ts: export * from "./your-domain";
 *
 * Note: This file will show import errors because it's a template.
 * The imports will work correctly once you copy it to a domain folder.
 */

import { apiCall, BaseApiResponse } from "./shared";

// ============================================================================
// [DOMAIN NAME] APIs
// Replace [DOMAIN NAME] with your domain (e.g., ADMIN, CUSTOMER, PRODUCTS, etc.)
// ============================================================================

/**
 * Example interface for your domain's data types
 */
export interface ExampleEntity {
	id: string;
	name: string;
	createdAt: string;
	updatedAt: string;
}

/**
 * Example GET request
 * @returns Promise with list of entities
 */
export async function getAllExampleEntities(): Promise<
	BaseApiResponse<ExampleEntity[]>
> {
	return apiCall("/api/your-endpoint", "GET");
}

/**
 * Example GET request with ID parameter
 * @param id - The entity ID
 * @returns Promise with a single entity
 */
export async function getExampleEntityById(
	id: string
): Promise<BaseApiResponse<ExampleEntity>> {
	return apiCall(`/api/your-endpoint/${id}`, "GET");
}

/**
 * Example POST request
 * @param data - The data to create
 * @returns Promise with created entity
 */
export async function createExampleEntity(
	data: Partial<ExampleEntity>
): Promise<BaseApiResponse<ExampleEntity>> {
	return apiCall("/api/your-endpoint", "POST", data);
}

/**
 * Example PUT/PATCH request
 * @param id - The entity ID
 * @param data - The data to update
 * @returns Promise with updated entity
 */
export async function updateExampleEntity(
	id: string,
	data: Partial<ExampleEntity>
): Promise<BaseApiResponse<ExampleEntity>> {
	return apiCall(`/api/your-endpoint/${id}`, "PATCH", data);
}

/**
 * Example DELETE request
 * @param id - The entity ID
 * @returns Promise with deletion confirmation
 */
export async function deleteExampleEntity(
	id: string
): Promise<BaseApiResponse<{ message: string }>> {
	return apiCall(`/api/your-endpoint/${id}`, "DELETE");
}

/**
 * Example with query parameters
 * You can add these as function parameters and construct the URL
 */
export async function searchExampleEntities(
	searchTerm: string
): Promise<BaseApiResponse<ExampleEntity[]>> {
	return apiCall(
		`/api/your-endpoint/search?q=${encodeURIComponent(searchTerm)}`,
		"GET"
	);
}
