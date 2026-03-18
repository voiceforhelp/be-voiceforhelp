const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');

dotenv.config({ path: require('path').join(__dirname, '..', '.env') });

async function seedAdmin() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected');

    let user = await User.findOne({ email: 'hrajawat1404@gmail.com' }).select('+password');

    if (user) {
      user.name = 'Himmat';
      user.phone = '6377845721';
      user.password = 'Rajput@1234';
      user.role = 'admin';
      user.isVerified = true;
      await user.save();
      console.log('Existing user updated to admin!');
    } else {
      user = await User.create({
        name: 'Himmat',
        email: 'hrajawat1404@gmail.com',
        phone: '6377845721',
        password: 'Rajput@1234',
        role: 'admin',
        isVerified: true,
      });
      console.log('Admin user created!');
    }

    console.log(`  Name: ${user.name}`);
    console.log(`  Email: ${user.email}`);
    console.log(`  Phone: ${user.phone}`);
    console.log(`  Role: ${user.role}`);
    console.log(`  Verified: ${user.isVerified}`);
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

seedAdmin();
