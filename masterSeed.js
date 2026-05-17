const mongoose = require('mongoose');
const User = require('./models/user');
const Product = require('./models/product');
const Order = require('./models/order');
const Review = require('./models/review');
const Coupon = require('./models/coupon');
require('dotenv').config();

const DB_URL = process.env.ATLASDB_URL || 'mongodb://127.0.0.1:27017/glowspark';

const productImages = [
    "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?q=80&w=800",
    "https://images.unsplash.com/photo-1594035910387-fea47794261f?q=80&w=800",
    "https://images.unsplash.com/photo-1615397323282-31121d51a6df?q=80&w=800",
    "https://images.unsplash.com/photo-1556228578-0d85b1a4d571?q=80&w=800",
    "https://images.unsplash.com/photo-1580870059869-2a9675841cb6?q=80&w=800",
    "https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?q=80&w=800",
    "https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?q=80&w=800",
    "https://images.unsplash.com/photo-1629198688000-71f23e745b6e?q=80&w=800",
    "https://images.unsplash.com/photo-1571781526291-c477eb311dc6?q=80&w=800",
    "https://images.unsplash.com/photo-1611078489935-0cb964de46d6?q=80&w=800",
    "https://images.unsplash.com/photo-1556228720-1c2f0f4a8679?q=80&w=800",
    "https://images.unsplash.com/photo-1601049541289-9b1b7bb17d0c?q=80&w=800",
    "https://images.unsplash.com/photo-1629198725890-50b37f48b52e?q=80&w=800",
    "https://images.unsplash.com/photo-1596462502278-27bf85033e5a?q=80&w=800",
    "https://images.unsplash.com/photo-1599305090598-fe179d501227?q=80&w=800",
];

const userAvatars = [
    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=200&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=200&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=200&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?q=80&w=200&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=200&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=200&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?q=80&w=200&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1520813792240-56fc4a3765a7?q=80&w=200&auto=format&fit=crop"
];

const productNames = [
    "Lumière Night Cream", "Velvet Rose Elixir", "Aura Botanicals Serum", "Glow Essence", 
    "Silk Touch Lotion", "Midnight Recovery Oil", "Celestial Eye Cream", "Pure Radiance Cleanser",
    "Rosewater Toner", "Golden Hour Sunscreen", "Diamond Exfoliant", "Hydra-Plump Mask",
    "Vitality Face Mist", "Amber Woods Perfume", "Jasmine Blossom EDP", "Neroli Body Wash",
    "Shea Butter Soufflé", "Argan Repair Shampoo", "Keratin Smooth Conditioner", "Scalp Detox Scrub",
    "Volumizing Mousse", "Matte Finish Foundation", "Dewy Glow Highlighter", "Satin Lipstick",
    "Velvet Lip Tint", "Precision Eyeliner", "Lengthening Mascara", "Blush Duo Palette",
    "Bronzing Powder", "Makeup Setting Spray"
];

const brands = ["Lumière", "Aura Botanicals", "Velvet Touch", "GlowSpark Exclusives", "Pure Essence"];
const categories = ["Skincare", "Makeup", "Haircare", "Fragrance", "Bath & Body"];

async function seedDatabase() {
    try {
        await mongoose.connect(DB_URL);
        console.log("Connected to MongoDB...");
        
        console.log("Clearing old data...");
        await User.deleteMany({});
        await Product.deleteMany({});
        await Order.deleteMany({});
        await Review.deleteMany({});
        await Coupon.deleteMany({});
        
        console.log("Creating Admin User...");
        const adminUser = new User({ email: 'admin@glowspark.com', username: 'GlowAdmin', role: 'admin' });
        await User.register(adminUser, 'admin123');
        
        console.log("Creating 10 Customers...");
        const customers = [];
        for (let i = 0; i < 10; i++) {
            const user = new User({
                email: `customer${i + 1}@example.com`,
                username: `BeautyLover${i + 1}`,
                role: 'customer',
                profilePhoto: { url: userAvatars[i], filename: `avatar_${i}` },
                addresses: [{ 
                    houseNo: `${Math.floor(Math.random() * 900) + 100}`, 
                    street: `Glow Street, Apt ${i+1}`, 
                    city: 'Mumbai', 
                    state: 'Maharashtra', 
                    pincode: '400001', 
                    isDefault: true 
                }],
                phoneNumber: `+1555010${i}`
            });
            const registeredUser = await User.register(user, 'password123');
            customers.push(registeredUser);
        }

        console.log("Creating 30 Products...");
        const createdProducts = [];
        for (let i = 0; i < 30; i++) {
            const product = new Product({
                title: productNames[i],
                description: `Experience the luxury of ${productNames[i]}. Formulated with premium ingredients to enhance your natural beauty. Clinically tested, cruelty-free, and perfect for all skin types.`,
                price: Math.floor(Math.random() * 8000) + 1500, // Price between 1500 and 9500 INR
                stock: Math.floor(Math.random() * 150) + 20,
                brand: brands[Math.floor(Math.random() * brands.length)],
                category: categories[Math.floor(Math.random() * categories.length)],
                image: { url: productImages[i % productImages.length], filename: `product_${i}` },
                ratingAverage: 0,
                reviewCount: 0,
                orderCount: 0,
                soldCount: 0
            });
            await product.save();
            createdProducts.push(product);
        }

        console.log("Seeding Reviews...");
        const reviewTexts = [
            "Absolutely love this! It changed my routine.", "Smells heavenly and feels so luxurious.", 
            "A bit pricey, but worth every penny.", "My skin has never looked better.", 
            "The packaging is gorgeous and the product works.", "Will definitely repurchase this.", 
            "Good, but I expected slightly more hydration.", "Five stars! A must-have."
        ];
        
        for (let product of createdProducts) {
            const numReviews = Math.floor(Math.random() * 4) + 2; // 2 to 5 reviews per product
            let totalRating = 0;
            
            for (let i = 0; i < numReviews; i++) {
                const randomUser = customers[Math.floor(Math.random() * customers.length)];
                const rating = Math.floor(Math.random() * 2) + 4; // 4 or 5 stars mostly
                
                const review = new Review({
                    comment: reviewTexts[Math.floor(Math.random() * reviewTexts.length)],
                    rating: rating,
                    author: randomUser._id,
                    helpfulCount: Math.floor(Math.random() * 20)
                });
                
                await review.save();
                product.reviews.push(review._id);
                totalRating += rating;
            }
            
            product.reviewCount = numReviews;
            product.ratingAverage = totalRating / numReviews;
            await product.save();
        }

        console.log("Seeding 100 Orders for rich analytics...");
        const statuses = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Delivered', 'Delivered'];
        
        for (let i = 0; i < 100; i++) {
            const randomUser = customers[Math.floor(Math.random() * customers.length)];
            
            // Random date within the last 6 months
            const pastDate = new Date();
            pastDate.setMonth(pastDate.getMonth() - Math.floor(Math.random() * 6));
            pastDate.setDate(Math.floor(Math.random() * 28) + 1);

            const numItems = Math.floor(Math.random() * 4) + 1;
            const orderProducts = [];
            let totalAmount = 0;

            for (let j = 0; j < numItems; j++) {
                const p = createdProducts[Math.floor(Math.random() * createdProducts.length)];
                const qty = Math.floor(Math.random() * 3) + 1;
                
                orderProducts.push({
                    product: p._id,
                    name: p.title,
                    image: p.image?.url,
                    quantity: qty,
                    price: p.price
                });
                totalAmount += p.price * qty;
                
                // Simulate sales metrics
                p.orderCount += 1;
                p.soldCount += qty;
                await p.save();
            }

            const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
            let returnStatus = 'None';
            let returnReason = '';
            
            // 15% chance of return if delivered
            if (randomStatus === 'Delivered' && Math.random() < 0.15) {
                const returnOptions = ['Requested', 'Approved', 'Refunded', 'Rejected'];
                returnStatus = returnOptions[Math.floor(Math.random() * returnOptions.length)];
                returnReason = "Changed my mind / Didn't suit me";
            }

            const addr = randomUser.addresses[0];
            const addressString = `${addr.houseNo}, ${addr.street}, ${addr.city}, ${addr.state} - ${addr.pincode}`;

            const order = new Order({
                user: randomUser._id,
                products: orderProducts,
                totalAmount: totalAmount,
                status: randomStatus,
                shippingAddress: addressString,
                createdAt: pastDate,
                returnStatus: returnStatus,
                returnReason: returnReason
            });

            await order.save();
        }

        console.log("Creating Sample Coupons...");
        const c1 = new Coupon({ code: 'WELCOME50', type: 'percentage', discountValue: 50, minCartValue: 5000, expiresAt: new Date(Date.now() + 30*24*60*60*1000) });
        const c2 = new Coupon({ code: 'FLAT500', type: 'fixed', discountValue: 500, minCartValue: 2000, expiresAt: new Date(Date.now() + 15*24*60*60*1000) });
        await c1.save();
        await c2.save();

        console.log("Database seeded successfully! Ready for production analytics.");
        process.exit(0);
    } catch (err) {
        console.error("Seeding failed:", err);
        process.exit(1);
    }
}

seedDatabase();
