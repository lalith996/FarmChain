// RBAC Components Export Index
// Phase 6: Frontend RBAC Implementation
// All components ready for use in the FarmChain application

// Authentication & Authorization
export { AuthProvider, useAuth } from './contexts/AuthContext';
export type { User, AuthContextType, RegisterData } from './contexts/AuthContext';

// Guards
export { RoleGuard } from './components/guards/RoleGuard';
export { PermissionGuard, HasPermission } from './components/guards/PermissionGuard';

// KYC Components
export { KYCSubmissionForm } from './components/kyc/KYCSubmissionForm';

// Admin Components
export { AdminDashboard } from './components/admin/AdminDashboard';
export { UserManagementPanel } from './components/admin/UserManagementPanel';
export { RoleSelector } from './components/admin/RoleSelector';

// API Client
export { default as apiClient, authAPI, verificationAPI, rbacAdminAPI } from './lib/api';
