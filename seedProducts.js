require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('./models/product');

const DB_URL = process.env.ATLASDB_URL || 'mongodb://127.0.0.1:27017/airbnb_clone';

mongoose.connect(DB_URL)
  .then(() => console.log('Connected to DB for Seeding'))
  .catch(err => console.error('DB Connection Error:', err));

const products = [
  {
    title: "Luminous Night Repair Serum",
    description: "An advanced night repair serum that rejuvenates and hydrates your skin while you sleep, leaving a glowing complexion.",
    price: 4500,
    stock: 50,
    brand: "Glow Luxe",
    category: "Skincare",
    ingredients: "Hyaluronic Acid, Vitamin C, Retinol",
    image: { url: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80", filename: "seed1" }
  },
  {
    title: "Velvet Matte Liquid Lipstick",
    description: "A highly pigmented, long-lasting matte lipstick that feels incredibly lightweight and comfortable on the lips.",
    price: 1200,
    stock: 120,
    brand: "Aura Beauty",
    category: "Makeup",
    ingredients: "Vitamin E, Jojoba Oil",
    image: { url: "https://images.unsplash.com/photo-1586495777744-4413f21062fa?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80", filename: "seed2" }
  },
  {
    title: "Botanical Hair Growth Oil",
    description: "Infused with rare botanical extracts, this hair oil promotes thicker, healthier hair growth and nourishes the scalp.",
    price: 2500,
    stock: 75,
    brand: "Natura Luxe",
    category: "Haircare",
    ingredients: "Argan Oil, Rosemary Extract, Castor Oil",
    image: { url: "https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80", filename: "seed3" }
  },
  {
    title: "Midnight Rose Eau de Parfum",
    description: "A seductive and intoxicating fragrance featuring deep notes of midnight rose, amber, and dark musk.",
    price: 8900,
    stock: 30,
    brand: "Maison Blanc",
    category: "Fragrance",
    ingredients: "Alcohol Denat, Parfum, Aqua",
    image: { url: "https://images.unsplash.com/photo-1594035910387-fea47794261f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80", filename: "seed4" }
  },
  {
    title: "Hydrating Cloud Cream",
    description: "A weightless moisturizer that deeply hydrates and plumps the skin, giving it a soft, cloud-like texture.",
    price: 3200,
    stock: 85,
    brand: "Glow Luxe",
    category: "Skincare",
    ingredients: "Ceramides, Squalane",
    image: { url: "https://images.unsplash.com/photo-1611078489935-0cb964de46d6?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80", filename: "seed5" }
  },
  {
    title: "Flawless Finish Foundation",
    description: "Achieve a perfectly smooth, airbrushed look with this medium-to-full coverage liquid foundation.",
    price: 2800,
    stock: 60,
    brand: "Aura Beauty",
    category: "Makeup",
    ingredients: "Aqua, Cyclopentasiloxane, Titanium Dioxide",
    image: { url: "https://images.unsplash.com/photo-1631214500115-598fc2cb8d2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80", filename: "seed6" }
  },
  {
    title: "Silk Protein Hair Mask",
    description: "An intensive weekly treatment that repairs damaged hair, restoring brilliant shine and softness.",
    price: 1800,
    stock: 45,
    brand: "Natura Luxe",
    category: "Haircare",
    ingredients: "Silk Amino Acids, Shea Butter",
    image: { url: "https://images.unsplash.com/photo-1556228578-8d89b6acd8f1?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80", filename: "seed7" }
  },
  {
    title: "Ocean Breeze Cologne",
    description: "A fresh, invigorating scent inspired by the crisp sea breeze and citrus orchards.",
    price: 5500,
    stock: 40,
    brand: "Aqua Notes",
    category: "Fragrance",
    ingredients: "Alcohol Denat, Citrus Aurantium Dulcis",
    image: { url: "https://images.unsplash.com/photo-1585386959984-a4155224a1ad?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80", filename: "seed8" }
  },
  {
    title: "Vitamin C Brightening Toner",
    description: "A refreshing toner that sweeps away impurities and visibly brightens the skin tone.",
    price: 1500,
    stock: 100,
    brand: "Glow Luxe",
    category: "Skincare",
    ingredients: "Vitamin C, Witch Hazel, Aloe Vera",
    image: { url: "https://images.unsplash.com/photo-1556228720-192a6af4e865?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80", filename: "seed9" }
  },
  {
    title: "Golden Hour Highlighter",
    description: "A finely-milled powder highlighter that gives your cheekbones a stunning, sun-kissed glow.",
    price: 1900,
    stock: 90,
    brand: "Aura Beauty",
    category: "Makeup",
    ingredients: "Mica, Silica, Squalane",
    image: { url: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80", filename: "seed10" }
  },
  {
    title: "Revitalizing Scalp Scrub",
    description: "An exfoliating scalp treatment that removes buildup and stimulates healthy hair follicles.",
    price: 2100,
    stock: 55,
    brand: "Natura Luxe",
    category: "Haircare",
    ingredients: "Sea Salt, Peppermint Oil, Charcoal",
    image: { url: "https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80", filename: "seed11" } // reusing image for brevity
  },
  {
    title: "Amber Wood Extrait de Parfum",
    description: "A highly concentrated, luxurious fragrance with warm amber and rich cedarwood.",
    price: 12000,
    stock: 15,
    brand: "Maison Blanc",
    category: "Fragrance",
    ingredients: "Parfum, Alcohol Denat",
    image: { url: "https://images.unsplash.com/photo-1594035910387-fea47794261f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80", filename: "seed12" }
  },
  {
    title: "Peptide Eye Cream",
    description: "A rich eye cream that visibly reduces fine lines, puffiness, and dark circles.",
    price: 2600,
    stock: 70,
    brand: "Glow Luxe",
    category: "Skincare",
    ingredients: "Peptides, Caffeine, Green Tea Extract",
    image: { url: "https://images.unsplash.com/photo-1611078489935-0cb964de46d6?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80", filename: "seed13" }
  },
  {
    title: "Lengthening Mascara",
    description: "An ultra-black mascara that dramatically lengthens and separates lashes without clumping.",
    price: 900,
    stock: 150,
    brand: "Aura Beauty",
    category: "Makeup",
    ingredients: "Water, Beeswax, Carnauba Wax",
    image: { url: "https://images.unsplash.com/photo-1631214500115-598fc2cb8d2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80", filename: "seed14" }
  },
  {
    title: "Argan Oil Heat Protectant",
    description: "A lightweight spray that protects hair from heat styling up to 450 degrees.",
    price: 1400,
    stock: 110,
    brand: "Natura Luxe",
    category: "Haircare",
    ingredients: "Argan Oil, Dimethicone",
    image: { url: "https://images.unsplash.com/photo-1556228578-8d89b6acd8f1?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80", filename: "seed15" }
  },
  {
    title: "Vanilla Musk Rollerball",
    description: "A travel-friendly perfume oil featuring sweet vanilla and warm musk.",
    price: 1800,
    stock: 80,
    brand: "Aqua Notes",
    category: "Fragrance",
    ingredients: "Fractionated Coconut Oil, Parfum",
    image: { url: "https://images.unsplash.com/photo-1585386959984-a4155224a1ad?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80", filename: "seed16" }
  },
  {
    title: "Detoxifying Clay Mask",
    description: "A purifying facial mask that draws out impurities and tightens pores.",
    price: 2200,
    stock: 65,
    brand: "Glow Luxe",
    category: "Skincare",
    ingredients: "Kaolin Clay, Bentonite, Tea Tree Oil",
    image: { url: "https://images.unsplash.com/photo-1556228720-192a6af4e865?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80", filename: "seed17" }
  },
  {
    title: "Rosy Cheek Tint",
    description: "A sheer, blendable liquid blush that gives a natural flush of color.",
    price: 1300,
    stock: 95,
    brand: "Aura Beauty",
    category: "Makeup",
    ingredients: "Water, Glycerin, Carmine",
    image: { url: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80", filename: "seed18" }
  },
  {
    title: "Curl Defining Cream",
    description: "A rich styling cream that defines and holds curls while fighting frizz.",
    price: 1700,
    stock: 85,
    brand: "Natura Luxe",
    category: "Haircare",
    ingredients: "Coconut Oil, Shea Butter",
    image: { url: "https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80", filename: "seed19" }
  },
  {
    title: "Citrus Grove Body Splash",
    description: "An uplifting body mist with notes of lemon, grapefruit, and mandarin.",
    price: 1100,
    stock: 130,
    brand: "Aqua Notes",
    category: "Fragrance",
    ingredients: "Alcohol Denat, Water, Parfum",
    image: { url: "https://images.unsplash.com/photo-1594035910387-fea47794261f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80", filename: "seed20" }
  }
];

const seedDB = async () => {
  try {
    await Product.deleteMany({});
    console.log('Cleared existing products');
    
    await Product.insertMany(products);
    console.log(`Successfully seeded ${products.length} products!`);
    
  } catch (err) {
    console.error('Error seeding DB:', err);
  } finally {
    mongoose.connection.close();
  }
};

seedDB();
