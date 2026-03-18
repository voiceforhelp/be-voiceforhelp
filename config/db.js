const mongoose = require('mongoose');

const connectDB = async () => {
  let retries = 5;
  while (retries) {
    try {
      const conn = await mongoose.connect(process.env.MONGO_URI, {
        maxPoolSize: 10,
      });
      console.log(`MongoDB Connected: ${conn.connection.host}`);
      return conn;
    } catch (error) {
      console.error(`MongoDB connection error: ${error.message}`);
      retries -= 1;
      if (retries === 0) {
        console.error('Max retries reached. Exiting...');
        process.exit(1);
      }
      console.log(`Retrying in 5 seconds... (${retries} retries left)`);
      await new Promise((res) => setTimeout(res, 5000));
    }
  }
};

module.exports = connectDB;
