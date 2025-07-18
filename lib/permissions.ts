/**
 * Role-based Permissions System
 *
 * This system uses a "default deny" approach where all permissions default to false,
 * and you only need to specify the permissions you want to GRANT to each role.
 *
 * USAGE EXAMPLES:
 *
 * 1. Check if a user has a permission:
 *    hasPermission('sub-admin', 'canUpdateWalletBalance') // returns true
 *    hasPermission('admin', 'canUpdateWalletBalance') // returns false
 *
 * 2. Get all permissions for a role:
 *    getPermissions('dev') // returns all permissions with their values
 *
 * 3. Debug permissions for a role:
 *    debugRolePermissions('sub-admin') // logs all permissions to console
 *
 * 4. Add a new permission to a role:
 *    // Just add it to the rolePermissions object below
 *    "finance": {
 *      canViewOverDuePayments: true, // This grants the permission
 *    }
 *
 * 5. Add a new permission type:
 *    // Add it to the PermissionConfig interface and getDefaultPermissions function
 *    // Then add it to getAvailablePermissions array
 *
 * BENEFITS:
 * - Much cleaner and more readable
 * - Less error-prone (no need to remember to set everything to false)
 * - Easier to maintain and add new roles/permissions
 * - Follows security best practice of "default deny"
 */

// Role-based permissions configuration
export interface PermissionConfig {
  canUpdateWalletBalance: boolean;
  canUpdateLastPoint: boolean;
  canUpdateLoanStatus: boolean;
  canTriggerDeviceActions: boolean;
  canDeleteCustomers: boolean;
  canViewOverDuePayments: boolean;
  canViewDeviceActivityLog: boolean;
  canViewCommunicationLog: boolean;
  suspendDashboardUser: boolean;
  canCreate: boolean;
  canSync: boolean;
  canEdit: boolean;
  createDashboardUser: boolean;

  canUpdateDeviceImei: boolean;
  canAssignAgent: boolean;

  updateGuarantorStatus: boolean;
  updateAddressStatus: boolean;
  viewLoanDetails: boolean;
  viewCommissionDetails: boolean;

  // Example of how to add a new permission:
  // canManageReports: boolean;
  //   canViewSensitiveData: boolean;
  //   canManageCustomers: boolean;
  //   canManageLoans: boolean;
  //   canManageDevices: boolean;
  //   canViewReports: boolean;
  //   canManageStaff: boolean;
  //   canManageStores: boolean;
}

// Define which roles have access to which features
// Only specify permissions that are GRANTED (true)
// All other permissions default to false
const rolePermissions: Record<string, Partial<PermissionConfig>> = {
  admin: {
    // canUpdateWalletBalance: true,
    // canUpdateLastPoint: true,
    // canUpdateLoanStatus: true,
    // canTriggerDeviceActions: true,
    // canDeleteCustomers: true,
    // canViewOverDuePayments: true,
    // canViewDeviceActivityLog: true,
    // canViewCommunicationLog: true,
    createDashboardUser: true,
    suspendDashboardUser: true,
    updateGuarantorStatus: true,
    updateAddressStatus: true,
    viewLoanDetails: true,
    viewCommissionDetails: true,

    // Admin has no special permissions by default
    // All permissions default to false
  },
  "sub-admin": {
    canUpdateWalletBalance: true,
    canUpdateLastPoint: true,
    canUpdateLoanStatus: true,
    canTriggerDeviceActions: true,
    canDeleteCustomers: true,
    canViewOverDuePayments: true,
    canViewDeviceActivityLog: true,
    canViewCommunicationLog: true,
    suspendDashboardUser: true,
    createDashboardUser: true,
    canCreate: true,
    canSync: true,
    canEdit: true,

    canUpdateDeviceImei: true,
    canAssignAgent: true,

    updateGuarantorStatus: true,
    updateAddressStatus: true,
    viewLoanDetails: true,
    viewCommissionDetails: true,
  },

  "collection-admin": {
    canTriggerDeviceActions: true,
  },
  "collection-officer": {
    canViewOverDuePayments: true,
    canViewCommunicationLog: true,
    canViewDeviceActivityLog: true,
    // Collection officer has no special permissions
    // All permissions default to false
  },
  dev: {
    canUpdateWalletBalance: true,
    canUpdateLastPoint: true,
    canUpdateLoanStatus: true,
    canTriggerDeviceActions: true,
    canDeleteCustomers: true,
    canViewOverDuePayments: true,
    canViewDeviceActivityLog: true,
    canViewCommunicationLog: true,
    canUpdateDeviceImei: true,
    canAssignAgent: true,
    },
  finance: {
    // Finance has no special permissions
    // All permissions default to false
  },
  hr: {
    // HR has no special permissions
    // All permissions default to false
  },
  inventory: {
    // Inventory has no special permissions
    // All permissions default to false
  },
  sales: {
    // Sales has no special permissions
    // All permissions default to false
  },
  "scan-partner": {
    // Scan partner has no special permissions
    // All permissions default to false
  },
  support: {
    // Support has no special permissions
    // All permissions default to false
  },
  verify: {
    // Verify has no special permissions
    // All permissions default to false
  },
};

// Special user overrides (for specific users who need additional permissions)
const userOverrides: Record<string, Partial<PermissionConfig>> = {
  "timilehin@sapphirevirtual.com": {
    canUpdateWalletBalance: true,
    canUpdateLastPoint: true,
    canUpdateLoanStatus: true,
    canTriggerDeviceActions: true,
    canDeleteCustomers: true,
    canViewOverDuePayments: true,
    canViewCommunicationLog: true,
    canViewDeviceActivityLog: true,
    canUpdateDeviceImei: true,
    canAssignAgent: true,
  },
  "topeyemi33@gmail.com": {
    canUpdateWalletBalance: true,
    canUpdateLastPoint: true,
    canUpdateLoanStatus: true,
    canTriggerDeviceActions: true,
    canDeleteCustomers: true,
    canViewOverDuePayments: true,
    canViewCommunicationLog: true,
    canViewDeviceActivityLog: true,
    canCreate: true,
    canSync: true,
    canEdit: true,

    canUpdateDeviceImei: true,
    canAssignAgent: true,

    createDashboardUser: true,

  },
  "greatnessabolade@gmail.com": {
    canUpdateWalletBalance: true,
    canUpdateLastPoint: true,
    canUpdateLoanStatus: true,
    canTriggerDeviceActions: true,
    canDeleteCustomers: true,
    canViewOverDuePayments: true,
    canViewCommunicationLog: true,
    canViewDeviceActivityLog: true,
    canCreate: true,
    canSync: true,
    canEdit: true,
    canUpdateDeviceImei: true,
    canAssignAgent: true,
  },
  "seyi@sapphirevirtual.com": {
    canUpdateWalletBalance: true,
    canUpdateLastPoint: true,
    canUpdateLoanStatus: true,
    canTriggerDeviceActions: true,
    canDeleteCustomers: true,
    canViewOverDuePayments: true,
    canViewCommunicationLog: true,
    canViewDeviceActivityLog: true,
    canCreate: true,
    canSync: true,
    canEdit: true,
    canUpdateDeviceImei: true,
    canAssignAgent: true,
  },
  "olayinka@sapphirevirtual.com": {
    canCreate: true,
    // canSync: true,
    canEdit: true,
    canAssignAgent: true,


  },
};

/**
 * Get the default permissions (all false)
 */
function getDefaultPermissions(): PermissionConfig {
  return {
    canUpdateWalletBalance: false,
    canUpdateLastPoint: false,
    canUpdateLoanStatus: false,
    canTriggerDeviceActions: false,
    canDeleteCustomers: false,
    canViewOverDuePayments: false,
    canViewDeviceActivityLog: false,
    canViewCommunicationLog: false,
    suspendDashboardUser: false,
    canCreate: false,
    canSync: false,
    canEdit: false,
    createDashboardUser: false,

    canUpdateDeviceImei: false,
    canAssignAgent: false,

    updateGuarantorStatus: false,
    updateAddressStatus: false,
    viewLoanDetails: false,
    viewCommissionDetails: false,

    // Example of how to add a new permission:
    // canManageReports: false,
  };
}

/**
 * Get permissions for a specific role and user
 * @param role - The user's role
 * @param userEmail - The user's email (optional, for special overrides)
 * @returns PermissionConfig object
 */
export function getPermissions(
  role: string,
  userEmail?: string
): PermissionConfig {
  // Start with default permissions (all false)
  const defaultPermissions = getDefaultPermissions();

  // Get base permissions for the role (only granted permissions)
  const roleGrantedPermissions = rolePermissions[role] || {};

  // Merge default permissions with role permissions
  const basePermissions = {
    ...defaultPermissions,
    ...roleGrantedPermissions,
  };

  // Apply user-specific overrides if they exist
  if (userEmail && userOverrides[userEmail]) {
    return {
      ...basePermissions,
      ...userOverrides[userEmail],
    };
  }

  return basePermissions;
}

/**
 * Check if a user has a specific permission
 * @param role - The user's role
 * @param permission - The permission to check
 * @param userEmail - The user's email (optional, for special overrides)
 * @returns boolean
 */
export function hasPermission(
  role: string,
  permission: keyof PermissionConfig,
  userEmail?: string
): boolean {
  const permissions = getPermissions(role, userEmail);
  return permissions[permission] || false;
}

/**
 * Get all available roles
 * @returns Array of role names
 */
export function getAvailableRoles(): string[] {
  return Object.keys(rolePermissions);
}

/**
 * Get all available permissions
 * @returns Array of permission names
 */
export function getAvailablePermissions(): (keyof PermissionConfig)[] {
  return [
    "canUpdateWalletBalance",
    "canUpdateLastPoint",
    "canUpdateLoanStatus",
    "canTriggerDeviceActions",
    "canDeleteCustomers",
    "canViewOverDuePayments",
    "canViewDeviceActivityLog",
    "canViewCommunicationLog",
    "canCreate",
    "canSync",
    "canEdit",

    "canUpdateDeviceImei",
    "canAssignAgent",

    "updateGuarantorStatus",
    "updateAddressStatus",
    "viewLoanDetails",
    "viewCommissionDetails",

    // 'canViewSensitiveData',
    // 'canManageCustomers',
    // 'canManageLoans',
    // 'canManageDevices',
    // 'canViewReports',
    // 'canManageStaff',
    // 'canManageStores',
  ];
}

/**
 * Get all permissions for a role (useful for debugging)
 * @param role - The role to check
 * @returns Object with all permissions and their values
 */
export function getRolePermissions(role: string): PermissionConfig {
  return getPermissions(role);
}

/**
 * Check if a role exists
 * @param role - The role to check
 * @returns boolean
 */
export function roleExists(role: string): boolean {
  return role in rolePermissions;
}

/**
 * Get all roles that have a specific permission
 * @param permission - The permission to check
 * @returns Array of role names that have this permission
 */
export function getRolesWithPermission(
  permission: keyof PermissionConfig
): string[] {
  return getAvailableRoles().filter((role) => hasPermission(role, permission));
}

/**
 * Debug function to log all permissions for a role
 * @param role - The role to debug
 * @param userEmail - Optional user email for overrides
 */
export function debugRolePermissions(role: string, userEmail?: string): void {
  const permissions = getPermissions(role, userEmail);
  console.log(`Permissions for role "${role}":`, permissions);

  const grantedPermissions = Object.entries(permissions)
    .filter(([_, value]) => value === true)
    .map(([key, _]) => key);

  console.log(`Granted permissions:`, grantedPermissions);
}

/**
 * Test function to verify the permission system works correctly
 * Run this in the browser console to test: testPermissionSystem()
 */
// export function testPermissionSystem(): void {
//   console.log("=== Testing Permission System ===");

//   // Test default deny
//   console.log("1. Testing default deny:");
//   console.log("admin canUpdateWalletBalance:", hasPermission('admin', 'canUpdateWalletBalance')); // should be false
//   console.log("finance canDeleteCustomers:", hasPermission('finance', 'canDeleteCustomers')); // should be false

//   // Test granted permissions
//   console.log("\n2. Testing granted permissions:");
//   console.log("sub-admin canUpdateWalletBalance:", hasPermission('sub-admin', 'canUpdateWalletBalance')); // should be true
//   console.log("dev canDeleteCustomers:", hasPermission('dev', 'canDeleteCustomers')); // should be true

//   // Test user overrides
//   console.log("\n3. Testing user overrides:");
//   console.log("timilehin@sapphirevirtual.com (admin) canUpdateWalletBalance:",
//     hasPermission('admin', 'canUpdateWalletBalance', 'timilehin@sapphirevirtual.com')); // should be true

//   // Test collection-admin specific permission
//   console.log("\n4. Testing collection-admin:");
//   console.log("collection-admin canTriggerDeviceActions:", hasPermission('collection-admin', 'canTriggerDeviceActions')); // should be true
//   console.log("collection-admin canUpdateWalletBalance:", hasPermission('collection-admin', 'canUpdateWalletBalance')); // should be false

//   console.log("\n=== Permission System Test Complete ===");
// }
