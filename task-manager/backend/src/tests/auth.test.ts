// backend/src/tests/auth.test.ts
import { AuthService } from '../services/auth.service';
import { prisma } from '../lib/prisma';

const authService = new AuthService();

describe('Auth System Tests', () => {
  // Allow 30 seconds for Supabase to respond (prevents timeouts)
  jest.setTimeout(30000);

  // 🧹 CLEANUP: Close connection after tests finish
  afterAll(async () => {
    await prisma.$disconnect();
  });

  // ✅ TEST 1: Registration
  it('should successfully register a new user', async () => {
    // Generate a random email so we never hit "User already exists"
    const randomEmail = `test_user_${Date.now()}@test.com`;
    
    const result = await authService.register({
      email: randomEmail,
      password: 'password123',
      name: 'Test Unit User'
    });

    // Check if we got a token back
    expect(result).toHaveProperty('token');
    expect(result.user.email).toBe(randomEmail);
    console.log("✅ Registration Test Passed for:", randomEmail);
  });

  // ✅ TEST 2: Login
  it('should login an existing user', async () => {
    // 1. Create a user first
    const email = `login_test_${Date.now()}@test.com`;
    await authService.register({
      email,
      password: 'securePass123',
      name: 'Login Tester'
    });

    // 2. Try to login
    const result = await authService.login({
      email,
      password: 'securePass123'
    });

    expect(result).toHaveProperty('token');
    expect(result.user.name).toBe('Login Tester');
    console.log("✅ Login Test Passed");
  });

  // ✅ TEST 3: Security Check
  it('should reject login if password is wrong', async () => {
    const email = `hacker_${Date.now()}@test.com`;
    await authService.register({
      email,
      password: 'correct-password',
      name: 'Security User'
    });

    // 2. Try login with WRONG password
    await expect(authService.login({
      email,
      password: 'WRONG-PASSWORD'
    })).rejects.toThrow('Invalid credentials');
    
    console.log("✅ Security Test Passed (Wrong password rejected)");
  });
});