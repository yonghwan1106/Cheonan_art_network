module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.ts'],
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    '\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$': 'jest-transform-stub'
  },
  transform: {
    '^.+\\.(ts|tsx)$': 'ts-jest',
    '^.+\\.(js|jsx)$': 'babel-jest',
  },
  transformIgnorePatterns: [
    'node_modules/(?!(.*\\.mjs$|@testing-library|@babel))'
  ],
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/main.tsx',
    '!src/vite-env.d.ts',
    '!src/test-utils/**',
    '!src/**/*.stories.{ts,tsx}',
    '!src/**/__tests__/**',
    '!src/**/*.test.{ts,tsx}',
  ],
  coverageReporters: [
    'text',
    'lcov',
    'html',
    'json-summary'
  ],
  coverageDirectory: 'coverage',
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  },
  testMatch: [
    '<rootDir>/src/**/__tests__/**/*.{ts,tsx}',
    '<rootDir>/src/**/*.{test,spec}.{ts,tsx}'
  ],
  testPathIgnorePatterns: [
    '/node_modules/',
    '/dist/',
    '/build/'
  ],
  watchPathIgnorePatterns: [
    '/node_modules/',
    '/dist/',
    '/build/',
    '/coverage/'
  ],
  moduleFileExtensions: [
    'ts',
    'tsx',
    'js',
    'jsx',
    'json'
  ],
  globals: {
    'ts-jest': {
      tsconfig: {
        jsx: 'react-jsx'
      }
    }
  },
  testTimeout: 10000,
  maxWorkers: '50%',
  clearMocks: true,
  restoreMocks: true,
  resetMocks: true,
  verbose: true,
  errorOnDeprecated: true,
  
  // Test suites organization
  projects: [
    {
      displayName: 'unit',
      testMatch: [
        '<rootDir>/src/components/**/__tests__/**/*.test.{ts,tsx}',
        '<rootDir>/src/hooks/**/__tests__/**/*.test.{ts,tsx}',
        '<rootDir>/src/utils/**/__tests__/**/*.test.{ts,tsx}',
        '<rootDir>/src/services/**/__tests__/**/*.test.{ts,tsx}'
      ]
    },
    {
      displayName: 'integration',
      testMatch: [
        '<rootDir>/src/__tests__/integration/**/*.test.{ts,tsx}',
        '<rootDir>/src/pages/**/__tests__/**/*.test.{ts,tsx}'
      ]
    },
    {
      displayName: 'e2e',
      testMatch: [
        '<rootDir>/src/__tests__/e2e/**/*.test.{ts,tsx}'
      ]
    },
    {
      displayName: 'performance',
      testMatch: [
        '<rootDir>/src/__tests__/performance/**/*.test.{ts,tsx}'
      ]
    }
  ],
  
  // Custom reporters
  reporters: [
    'default',
    [
      'jest-html-reporters',
      {
        publicPath: './coverage/html-report',
        filename: 'report.html',
        expand: true,
        hideIcon: false,
        pageTitle: 'Congestion Prediction Service - Test Report'
      }
    ],
    [
      'jest-junit',
      {
        outputDirectory: './coverage',
        outputName: 'junit.xml',
        ancestorSeparator: ' › ',
        uniqueOutputName: 'false',
        suiteNameTemplate: '{filepath}',
        classNameTemplate: '{classname}',
        titleTemplate: '{title}'
      }
    ]
  ],
  
  // Performance monitoring
  slowTestThreshold: 5,
  
  // Snapshot testing
  snapshotSerializers: [
    '@emotion/jest/serializer'
  ],
  
  // Custom matchers
  setupFilesAfterEnv: [
    '<rootDir>/src/setupTests.ts',
    '@testing-library/jest-dom/extend-expect'
  ],
  
  // Environment variables for tests
  testEnvironmentOptions: {
    url: 'http://localhost:3000'
  },
  
  // Mock specific modules
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    '\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$': 'jest-transform-stub',
    '^react-router-dom$': '<rootDir>/src/__mocks__/react-router-dom.js',
    '^axios$': '<rootDir>/src/__mocks__/axios.js'
  },
  
  // Global setup and teardown
  globalSetup: '<rootDir>/src/test-utils/globalSetup.js',
  globalTeardown: '<rootDir>/src/test-utils/globalTeardown.js',
  
  // Cache configuration
  cacheDirectory: '<rootDir>/node_modules/.cache/jest',
  
  // Bail configuration
  bail: false,
  
  // Notify configuration for watch mode
  notify: true,
  notifyMode: 'failure-change',
  
  // Watch plugins
  watchPlugins: [
    'jest-watch-typeahead/filename',
    'jest-watch-typeahead/testname'
  ]
};