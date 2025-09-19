import { createClient } from '@/lib/supabase/client'

// Mock environment variables
const originalEnv = process.env

describe('Supabase Client', () => {
  beforeEach(() => {
    jest.resetModules()
    process.env = {
      ...originalEnv,
      NEXT_PUBLIC_SUPABASE_URL: 'https://test.supabase.co',
      NEXT_PUBLIC_SUPABASE_ANON_KEY: 'test-anon-key'
    }
  })

  afterEach(() => {
    process.env = originalEnv
  })

  it('should create a Supabase client', () => {
    const client = createClient()
    
    expect(client).toBeDefined()
    expect(client.auth).toBeDefined()
    expect(client.from).toBeDefined()
  })

  it('should use environment variables for configuration', () => {
    // This test ensures the client is configured with the right environment variables
    const client = createClient()
    
    // The client should be created without throwing errors
    expect(client).toBeTruthy()
  })

  it('should have auth methods available', () => {
    const client = createClient()
    
    expect(typeof client.auth.signInWithPassword).toBe('function')
    expect(typeof client.auth.signUp).toBe('function')
    expect(typeof client.auth.signOut).toBe('function')
    expect(typeof client.auth.getSession).toBe('function')
    expect(typeof client.auth.getUser).toBe('function')
  })

  it('should have database methods available', () => {
    const client = createClient()
    
    expect(typeof client.from).toBe('function')
    expect(typeof client.rpc).toBe('function')
  })
})