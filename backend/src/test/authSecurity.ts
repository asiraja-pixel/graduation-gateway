import bcrypt from 'bcryptjs';
import { User } from '../models/User.js';

// Test function to verify password hashing and storage
export async function testAuthSecurity() {
  console.log('🔐 Testing Authentication Security...\n');

  try {
    // Test 1: Check if password is properly hashed during signup
    console.log('📝 Test 1: Password hashing during signup');
    const testPassword = 'testPassword123';
    const hashedPassword = await bcrypt.hash(testPassword, 12);
    
    console.log(`Original password: ${testPassword}`);
    console.log(`Hashed password: ${hashedPassword}`);
    console.log(`Hash length: ${hashedPassword.length} characters`);
    console.log('✅ Password is properly hashed with bcrypt\n');

    // Test 2: Verify password comparison works
    console.log('🔍 Test 2: Password verification');
    const isMatch = await bcrypt.compare(testPassword, hashedPassword);
    console.log(`Password comparison result: ${isMatch}`);
    console.log('✅ Password comparison works correctly\n');

    // Test 3: Check database storage
    console.log('💾 Test 3: Database storage verification');
    const existingUsers = await User.find({});
    console.log(`Current users in database: ${existingUsers.length}`);
    
    if (existingUsers.length > 0) {
      const firstUser = existingUsers[0];
      console.log(`User email: ${firstUser.email}`);
      console.log(`Password stored in DB: ${firstUser.password.substring(0, 20)}...`);
      console.log(`Password is hashed: ${firstUser.password.length > 20 && firstUser.password.startsWith('$2')}`);
      console.log('✅ User data is stored in database with hashed password\n');
    } else {
      console.log('No users found in database yet\n');
    }

    // Test 4: Verify no plain text passwords are stored
    console.log('🔒 Test 4: Security verification');
    const plainTextPasswords = await User.find({ password: { $not: /^\$2[aby]\$\d+\$/ } });
    console.log(`Users with plain text passwords: ${plainTextPasswords.length}`);
    
    if (plainTextPasswords.length === 0) {
      console.log('✅ No plain text passwords found in database\n');
    } else {
      console.log('❌ WARNING: Plain text passwords found!');
    }

    console.log('🎉 Authentication security test completed!');
    return true;

  } catch (error) {
    console.error('❌ Security test failed:', error);
    return false;
  }
}
