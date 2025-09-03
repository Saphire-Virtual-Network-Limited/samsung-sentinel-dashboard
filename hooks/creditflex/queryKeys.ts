// Creditflex query keys for React Query/SWR
export const creditflexQueryKeys = {
	// All loans
	allLoans: (filters?: any) => ["creditflex", "loans", "all", filters],
	disbursedLoans: (filters?: any) => [
		"creditflex",
		"loans",
		"disbursed",
		filters,
	],

	// Loan products
	loanProducts: () => ["creditflex", "loan-products"],

	// Repayments
	repayments: (filters?: any) => ["creditflex", "repayments", filters],

	// Invoices
	invoices: (filters?: any) => ["creditflex", "invoices", filters],

	// Liquidation requests
	liquidationRequests: (filters?: any) => [
		"creditflex",
		"liquidation-requests",
		filters,
	],

	// Topup requests
	topupRequests: (filters?: any) => ["creditflex", "topup-requests", filters],

	// Telesales agents
	telesalesAgents: (filters?: any) => [
		"creditflex",
		"telesales-agents",
		filters,
	],

	// Dashboard stats
	dashboardStats: () => ["creditflex", "dashboard", "stats"],

	// Telemarketers
	telemarketers: (search?: string, status?: string) => [
		"creditflex",
		"telemarketers",
		search,
		status,
	],

	// Customers
	customers: (search?: string, status?: string) => [
		"creditflex",
		"customers",
		search,
		status,
	],
} as const;
