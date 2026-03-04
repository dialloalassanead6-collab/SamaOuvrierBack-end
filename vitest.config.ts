// ============================================================================
// VITEST CONFIGURATION
// ============================================================================
// Configuration complète pour les tests avec Vitest
// ============================================================================

import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  // Chemins des fichiers de test
  test: {
    // Répertoires à surveiller pour les tests
    include: [
      'tests/**/*.test.ts',
      'tests/**/*.spec.ts',
    ],
    
    // Fichiers à exclure
    exclude: [
      '**/node_modules/**',
      '**/dist/**',
      '**/coverage/**',
    ],
    
    // Environment de test
    environment: 'node',
    
    // Timeout pour les tests (en ms)
    testTimeout: 30000,
    
    // Timeout pour les hooks (en ms)
    hookTimeout: 30000,
    
    // Configuration des reporters
    reporters: ['default', 'verbose'],
    
    // Couverture de code
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov', 'html', 'json'],
      reportsDirectory: 'coverage',
      exclude: [
        'node_modules/',
        'dist/',
        'coverage/',
        '**/*.config.*',
        '**/*.d.ts',
        'tests/',
        'prisma/',
        'src/**/*.interface.ts',
        'src/**/*.type.ts',
        'src/**/*.enum.ts',
        'src/**/index.ts',
      ],
      include: [
        'src/**/*.ts',
      ],
      thresholds: {
        lines: 70,
        functions: 70,
        branches: 70,
        statements: 70,
      },
    },
    
    // Pool options pour les workers
    pool: 'forks',
    poolOptions: {
      forks: {
        singleFork: true,
      },
    },
    
    // Mode watch pour développement
    watch: false,
    
    //清理 mocks
    clearMocks: true,
    
    //模拟计时器
    fakeTimers: {
      now: 0,
    },
  },
  
  // Résolution des modules
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@modules': path.resolve(__dirname, './src/modules'),
      '@shared': path.resolve(__dirname, './src/shared'),
      '@prisma/client': path.resolve(__dirname, './node_modules/@prisma/client'),
    },
  },
  
  // Extensions de fichiers
  esbuild: {
    target: 'node18',
  },
  
  // Optimisation
  optimizeDeps: {
    include: [],
  },
});
