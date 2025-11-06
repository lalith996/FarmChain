/**
 * Role-based Theme Configuration
 * Provides consistent theming across the platform for each user role
 */

export interface RoleTheme {
  role: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    surface: string;
    text: string;
    textSecondary: string;
  };
  gradients: {
    primary: string;
    secondary: string;
    card: string;
  };
  shadows: {
    small: string;
    medium: string;
    large: string;
  };
}

export const roleThemes: Record<string, RoleTheme> = {
  FARMER: {
    role: 'FARMER',
    colors: {
      primary: '#10B981',       // Emerald-500
      secondary: '#059669',     // Emerald-600
      accent: '#F59E0B',        // Amber-500
      background: '#F0FDF4',    // Green-50
      surface: '#FFFFFF',
      text: '#065F46',          // Green-800
      textSecondary: '#047857', // Green-700
    },
    gradients: {
      primary: 'from-emerald-500 to-green-600',
      secondary: 'from-green-400 to-emerald-500',
      card: 'from-green-50 to-emerald-50',
    },
    shadows: {
      small: 'shadow-sm shadow-green-100',
      medium: 'shadow-md shadow-green-200',
      large: 'shadow-lg shadow-green-300',
    },
  },

  DISTRIBUTOR: {
    role: 'DISTRIBUTOR',
    colors: {
      primary: '#3B82F6',       // Blue-500
      secondary: '#2563EB',     // Blue-600
      accent: '#0EA5E9',        // Sky-500
      background: '#EFF6FF',    // Blue-50
      surface: '#FFFFFF',
      text: '#1E40AF',          // Blue-800
      textSecondary: '#1D4ED8', // Blue-700
    },
    gradients: {
      primary: 'from-blue-500 to-blue-600',
      secondary: 'from-sky-400 to-blue-500',
      card: 'from-blue-50 to-sky-50',
    },
    shadows: {
      small: 'shadow-sm shadow-blue-100',
      medium: 'shadow-md shadow-blue-200',
      large: 'shadow-lg shadow-blue-300',
    },
  },

  RETAILER: {
    role: 'RETAILER',
    colors: {
      primary: '#F59E0B',       // Amber-500
      secondary: '#D97706',     // Amber-600
      accent: '#F97316',        // Orange-500
      background: '#FFFBEB',    // Amber-50
      surface: '#FFFFFF',
      text: '#92400E',          // Amber-800
      textSecondary: '#B45309', // Amber-700
    },
    gradients: {
      primary: 'from-amber-500 to-orange-500',
      secondary: 'from-yellow-400 to-amber-500',
      card: 'from-amber-50 to-orange-50',
    },
    shadows: {
      small: 'shadow-sm shadow-amber-100',
      medium: 'shadow-md shadow-amber-200',
      large: 'shadow-lg shadow-amber-300',
    },
  },

  CONSUMER: {
    role: 'CONSUMER',
    colors: {
      primary: '#8B5CF6',       // Purple-500
      secondary: '#7C3AED',     // Purple-600
      accent: '#EC4899',        // Pink-500
      background: '#FAF5FF',    // Purple-50
      surface: '#FFFFFF',
      text: '#6B21A8',          // Purple-800
      textSecondary: '#7E22CE', // Purple-700
    },
    gradients: {
      primary: 'from-purple-500 to-pink-500',
      secondary: 'from-violet-400 to-purple-500',
      card: 'from-purple-50 to-pink-50',
    },
    shadows: {
      small: 'shadow-sm shadow-purple-100',
      medium: 'shadow-md shadow-purple-200',
      large: 'shadow-lg shadow-purple-300',
    },
  },

  ADMIN: {
    role: 'ADMIN',
    colors: {
      primary: '#6366F1',       // Indigo-500
      secondary: '#4F46E5',     // Indigo-600
      accent: '#8B5CF6',        // Purple-500
      background: '#EEF2FF',    // Indigo-50
      surface: '#FFFFFF',
      text: '#3730A3',          // Indigo-800
      textSecondary: '#4338CA', // Indigo-700
    },
    gradients: {
      primary: 'from-indigo-500 to-purple-600',
      secondary: 'from-blue-500 to-indigo-600',
      card: 'from-indigo-50 to-purple-50',
    },
    shadows: {
      small: 'shadow-sm shadow-indigo-100',
      medium: 'shadow-md shadow-indigo-200',
      large: 'shadow-lg shadow-indigo-300',
    },
  },

  SUPER_ADMIN: {
    role: 'SUPER_ADMIN',
    colors: {
      primary: '#6366F1',       // Indigo-500
      secondary: '#4F46E5',     // Indigo-600
      accent: '#EC4899',        // Pink-500
      background: '#EEF2FF',    // Indigo-50
      surface: '#FFFFFF',
      text: '#3730A3',          // Indigo-800
      textSecondary: '#4338CA', // Indigo-700
    },
    gradients: {
      primary: 'from-indigo-600 to-purple-600',
      secondary: 'from-purple-500 to-pink-600',
      card: 'from-indigo-50 to-purple-50',
    },
    shadows: {
      small: 'shadow-sm shadow-indigo-100',
      medium: 'shadow-md shadow-indigo-200',
      large: 'shadow-lg shadow-indigo-300',
    },
  },
};

/**
 * Get theme for a specific role
 */
export function getRoleTheme(role: string): RoleTheme {
  return roleThemes[role] || roleThemes.CONSUMER;
}

/**
 * Get CSS variables for a role theme
 */
export function getRoleThemeCSSVars(role: string): Record<string, string> {
  const theme = getRoleTheme(role);
  return {
    '--color-primary': theme.colors.primary,
    '--color-secondary': theme.colors.secondary,
    '--color-accent': theme.colors.accent,
    '--color-background': theme.colors.background,
    '--color-surface': theme.colors.surface,
    '--color-text': theme.colors.text,
    '--color-text-secondary': theme.colors.textSecondary,
  };
}

/**
 * Hook to use role theme
 */
export function useRoleTheme(role?: string) {
  // In a real implementation, this would get role from auth context
  return getRoleTheme(role || 'CONSUMER');
}
