require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/user'); // Ensure path is correct

// Use ATLASDB_URL if you are using Atlas, otherwise use local DB URL
const DB_URL = process.env.ATLASDB_URL || 'mongodb://127.0.0.1:27017/airbnb_clone';

mongoose.connect(DB_URL)
  .then(() => console.log('Connected to DB for Admin Creation'))
  .catch(err => console.error('DB Connection Error:', err));

const createAdmin = async () => {
  try {
    const adminEmail = 'admin@glowspark.com'; // Change this to your preferred admin email
    const adminPassword = 'adminpassword123'; // Change this to your preferred password

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: adminEmail });
    if (existingAdmin) {
      console.log('Admin already exists with this email!');
      mongoose.connection.close();
      return;
    }

    // Create new admin user
    const newAdmin = new User({
      email: adminEmail,
      username: adminEmail, // passport-local-mongoose uses this
      role: 'admin',
      isVerified: true
    });

    // Register with passport-local-mongoose
    await User.register(newAdmin, adminPassword);

    console.log(`\n✅ Super Admin created successfully!`);
    console.log(`Email: ${adminEmail}`);
    console.log(`Password: ${adminPassword}`);
    console.log(`\nYou can now log in via the normal login page to access the /admin dashboard.\n`);

  } catch (err) {
    console.error('Error creating admin:', err);
  } finally {
    mongoose.connection.close();
  }
};

createAdmin();
