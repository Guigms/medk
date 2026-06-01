import nextJest from 'next/jest.js'

const createJestConfig = nextJest({
  // Mostra ao Next.js onde está o diretório do app para carregar os arquivos .env
  dir: './',
})

// Configurações customizadas do Jest
/** @type {import('jest').Config} */
const config = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'jest-environment-jsdom',
  moduleNameMapper: {
    // Configura o alias '@/' para o Jest entender suas importações
    '^@/(.*)$': '<rootDir>/$1',
  },
}

export default createJestConfig(config)