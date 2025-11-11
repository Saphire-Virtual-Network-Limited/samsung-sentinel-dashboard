import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL =
	process.env.NEXT_PUBLIC_API_URL ||
	"https://dev-samsung-portal.connectwithsapphire.com/api/v1";

const DEBUG_PROXY = process.env.NEXT_PUBLIC_DEBUG_PROXY === "true";

export async function GET(
	request: NextRequest,
	{ params }: { params: Promise<{ path: string[] }> }
) {
	const { path } = await params;
	return proxyRequest(request, path, "GET");
}

export async function POST(
	request: NextRequest,
	{ params }: { params: Promise<{ path: string[] }> }
) {
	const { path } = await params;
	return proxyRequest(request, path, "POST");
}

export async function PUT(
	request: NextRequest,
	{ params }: { params: Promise<{ path: string[] }> }
) {
	const { path } = await params;
	return proxyRequest(request, path, "PUT");
}

export async function PATCH(
	request: NextRequest,
	{ params }: { params: Promise<{ path: string[] }> }
) {
	const { path } = await params;
	return proxyRequest(request, path, "PATCH");
}

export async function DELETE(
	request: NextRequest,
	{ params }: { params: Promise<{ path: string[] }> }
) {
	const { path } = await params;
	return proxyRequest(request, path, "DELETE");
}

async function proxyRequest(
	request: NextRequest,
	path: string[],
	method: string
) {
	const apiPath = path.join("/");
	const url = `${BACKEND_URL}/${apiPath}`;

	// Get search params
	const searchParams = request.nextUrl.searchParams.toString();
	const fullUrl = searchParams ? `${url}?${searchParams}` : url;

	// Get request body if not GET
	let body = undefined;
	let parsedBody = undefined;
	if (method !== "GET" && method !== "DELETE") {
		try {
			body = await request.text();
			parsedBody = body ? JSON.parse(body) : undefined;
		} catch (e) {
			// No body or not JSON
		}
	}

	// Log request details on server console
	console.log(`\n[PROXY ${method}] ${fullUrl}`);
	if (parsedBody) {
		console.log(`[PROXY BODY]`, parsedBody);
	}

	try {
		// Forward headers
		const headers: HeadersInit = {};
		request.headers.forEach((value, key) => {
			// Skip host and other headers that shouldn't be forwarded
			if (
				!key.toLowerCase().startsWith("host") &&
				!key.toLowerCase().startsWith("connection") &&
				!key.toLowerCase().startsWith("content-length")
			) {
				headers[key] = value;
			}
		});

		// Make request to backend
		const response = await fetch(fullUrl, {
			method,
			headers,
			body,
			// Add timeout
			signal: AbortSignal.timeout(30000), // 30 seconds
		});

		// Get response body
		const responseData = await response.text();
		let parsedResponse = undefined;
		try {
			parsedResponse = JSON.parse(responseData);
		} catch (e) {
			// Not JSON
		}

		// Log response on server console
		console.log(
			`[PROXY RESPONSE ${response.status}]`,
			parsedResponse || responseData
		);

		// If debug mode is enabled, add debug info to response
		if (DEBUG_PROXY && parsedResponse) {
			parsedResponse._debug = {
				endpoint: fullUrl,
				method,
				requestBody: parsedBody,
				responseStatus: response.status,
				timestamp: new Date().toISOString(),
			};

			// Create response with debug info
			const nextResponse = NextResponse.json(parsedResponse, {
				status: response.status,
				statusText: response.statusText,
			});

			// Add CORS headers
			nextResponse.headers.set("Access-Control-Allow-Origin", "*");
			nextResponse.headers.set(
				"Access-Control-Allow-Methods",
				"GET, POST, PUT, PATCH, DELETE, OPTIONS"
			);
			nextResponse.headers.set(
				"Access-Control-Allow-Headers",
				"Content-Type, Authorization, X-Requested-With"
			);

			return nextResponse;
		}

		// Create response with CORS headers (no debug)
		const nextResponse = new NextResponse(responseData, {
			status: response.status,
			statusText: response.statusText,
		});

		// Copy response headers (but exclude compression-related headers to avoid decoding errors)
		response.headers.forEach((value, key) => {
			const lowerKey = key.toLowerCase();
			// Skip compression and transfer encoding headers
			if (
				lowerKey !== "content-encoding" &&
				lowerKey !== "content-length" &&
				lowerKey !== "transfer-encoding"
			) {
				nextResponse.headers.set(key, value);
			}
		});

		// Add CORS headers
		nextResponse.headers.set("Access-Control-Allow-Origin", "*");
		nextResponse.headers.set(
			"Access-Control-Allow-Methods",
			"GET, POST, PUT, PATCH, DELETE, OPTIONS"
		);
		nextResponse.headers.set(
			"Access-Control-Allow-Headers",
			"Content-Type, Authorization, X-Requested-With"
		);

		return nextResponse;
	} catch (error: any) {
		// Log error details on server console
		console.error(`\n[PROXY ERROR] ${method} ${fullUrl}`);
		console.error(`[PROXY ERROR DETAILS]`, error);
		if (parsedBody) {
			console.error(`[PROXY ERROR BODY]`, parsedBody);
		}

		return NextResponse.json(
			{
				error: "Proxy request failed",
				message: error.message,
				...(DEBUG_PROXY && {
					_debug: {
						endpoint: fullUrl,
						method,
						requestBody: parsedBody,
						errorMessage: error.message,
						errorStack: error.stack,
						timestamp: new Date().toISOString(),
					},
				}),
			},
			{ status: 500 }
		);
	}
}

// Handle OPTIONS for CORS preflight
export async function OPTIONS(request: NextRequest) {
	return new NextResponse(null, {
		status: 200,
		headers: {
			"Access-Control-Allow-Origin": "*",
			"Access-Control-Allow-Methods": "GET, POST, PUT, PATCH, DELETE, OPTIONS",
			"Access-Control-Allow-Headers":
				"Content-Type, Authorization, X-Requested-With",
			"Access-Control-Max-Age": "86400",
		},
	});
}
