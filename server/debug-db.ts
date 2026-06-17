import mongoose from 'mongoose';
import { Product } from './src/models/Product.js';
import { config } from './src/config.js';

async function check() {
  await mongoose.connect(config.mongodbUri);
  const products = await Product.find().lean();
  console.log("Product count:", products.length);
  
  console.log("Categories:", products.map((p) => p.category).join(", "));
  
  await mongoose.disconnect();
  process.exit(0);
}
check();
