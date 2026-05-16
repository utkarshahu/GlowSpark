const mongoose = require("mongoose");
const initData = require("./product_data.js");
const Product = require("../models/product.js");
const User = require("../models/user.js");
require("dotenv").config({ path: ".env" });

const dbURL = process.env.ATLASDB_URL || "mongodb://127.0.0.1:27017/glowspark";

main()
  .then(() => {
    console.log("connected to DB");
  })
  .catch((err) => {
    console.log(err);
  });

async function main() {
  await mongoose.connect(dbURL);
}

const initDB = async () => {
  await Product.deleteMany({});
  
  // Create an admin user to own the products
  let adminUser = await User.findOne({ email: "admin@glowspark.com" });
  if (!adminUser) {
    adminUser = new User({ email: "admin@glowspark.com", username: "admin", role: "admin" });
    adminUser = await User.register(adminUser, "admin123");
  }

  // Set the owner of all products to the admin user
  initData.data = initData.data.map((obj) => ({ ...obj, owner: adminUser._id }));
  
  await Product.insertMany(initData.data);
  console.log("Product data was initialized");
  mongoose.connection.close();
};

initDB();
