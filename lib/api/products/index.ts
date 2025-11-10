import { apiCall, BaseApiResponse, ProductStatus } from "../shared";

// ============================================================================
// PRODUCTS APIs
// ============================================================================

// Types & Interfaces
export interface Product {
	id: string;
	name: string;
	sapphire_cost: number;
	repair_cost: number;
	status: ProductStatus;
	created_at: string;
	updated_at: string;
}

export interface CreateProductDto {
	name: string;
	sapphire_cost: number;
	repair_cost: number;
}

export interface UpdateProductDto {
	name?: string;
	sapphire_cost?: number;
	repair_cost?: number;
}

export interface GetProductsParams {
	status?: ProductStatus;
	search?: string;
	page?: number;
	limit?: number;
}

// API Functions

/**
 * Create new product
 * @summary Create a new device product. Admin only.
 * @tag Products
 */
export async function createProduct(
	data: CreateProductDto
): Promise<BaseApiResponse<Product>> {
	return apiCall("/api/v1/products", "POST", data);
}

/**
 * Get all products
 * @summary Retrieve all products with optional filters and pagination
 * @tag Products
 */
export async function getAllProducts(params?: GetProductsParams): Promise<{
	data: Product[];
	total: number;
	page: number;
	limit: number;
	totalPages: number;
}> {
	const queryParams = new URLSearchParams(
		params as Record<string, string>
	).toString();
	return apiCall(`/api/v1/products?${queryParams}`, "GET");
}

/**
 * Get product by ID
 * @summary Retrieve a single product by its ID
 * @tag Products
 */
export async function getProductById(
	id: string
): Promise<BaseApiResponse<Product>> {
	return apiCall(`/api/v1/products/${id}`, "GET");
}

/**
 * Update product
 * @summary Update product details. Admin only.
 * @tag Products
 */
export async function updateProduct(
	id: string,
	data: UpdateProductDto
): Promise<BaseApiResponse<Product>> {
	return apiCall(`/api/v1/products/${id}`, "PATCH", data);
}

/**
 * Delete product
 * @summary Permanently delete a product. Admin only.
 * @tag Products
 */
export async function deleteProduct(id: string): Promise<BaseApiResponse> {
	return apiCall(`/api/v1/products/${id}`, "DELETE");
}

/**
 * Activate product
 * @summary Activate a deactivated product. Admin only.
 * @tag Products
 */
export async function activateProduct(id: string): Promise<BaseApiResponse> {
	return apiCall(`/api/v1/products/${id}/activate`, "POST");
}

/**
 * Deactivate product
 * @summary Deactivate a product. No new claims can be created for deactivated products. Admin only.
 * @tag Products
 */
export async function deactivateProduct(id: string): Promise<BaseApiResponse> {
	return apiCall(`/api/v1/products/${id}/deactivate`, "POST");
}
