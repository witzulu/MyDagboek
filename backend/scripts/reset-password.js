// Import required modules
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../src/models/User'); // Adjust path to your User model

// Load environment variables from .env file
dotenv.config({ path: require('path').resolve(__dirname, '../.env') });


// --- Configuration ---
// Get email and new password from command line arguments
const email = process.argv[2];
const newPassword = process.argv[3];

// --- Validation ---
if (!email || !newPassword) {
  console.error('❌ Error: Please provide an email and a new password.');
  console.log('Usage: node reset-password.js <email> <newPassword>');
  process.exit(1);
}

if (newPassword.length < 6) {
    console.error('❌ Error: Password must be at least 6 characters long.');
    process.exit(1);
}

// --- Main Script Logic ---
const resetPassword = async () => {
  try {
    // 1. Connect to MongoDB
    console.log('Connecting to database...');
    await mongoose.connect(process.env.MONGODB_URI, {});
    console.log('✅ Database connected successfully.');

    // 2. Find the user by email
    console.log(`Searching for user with email: ${email}`);
    const user = await User.findOne({ email });

    if (!user) {
      console.error('❌ Error: User not found.');
      return; // Exit the function
    }
    console.log(`✅ User found: ${user.name} (${user.email})`);

    // 3. Set the new password
    // The 'pre-save' hook in the User model will automatically hash the password
    user.password = newPassword;
    await user.save();

    console.log('✅ Password has been successfully reset.');

  } catch (error) {
    console.error('❌ An unexpected error occurred:');
    console.error(error);
  } finally {
    // 4. Disconnect from the database
    await mongoose.disconnect();
    console.log('Database connection closed.');
  }
};

// --- Execute the script ---
resetPassword();
