const mongoose = require('mongoose');
const User = require('./models/user');
const Product = require('./models/product');
const Order = require('./models/order');
const Review = require('./models/review');
const Coupon = require('./models/coupon');
require('dotenv').config();

const DB_URL = process.env.ATLASDB_URL || 'mongodb://127.0.0.1:27017/glowspark';

const productImages = [
    "https://i.pinimg.com/736x/94/f6/a8/94f6a8df40b0a8e2ef56cda30b99938b.jpg",
    "https://imgpro.staticdj.com/4ac8d6a798743dc5484cedafbc123c6e_2056x.jpeg",
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
    "https://images.unsplash.com/photo-1617897903246-719242758050?q=80&w=800",
    "https://images.unsplash.com/photo-1631214500515-e411c66e6672?q=80&w=800",
    "https://images.unsplash.com/photo-1616683693504-3ea7e9ad6fec?q=80&w=800",
    "https://images.unsplash.com/photo-1590156546946-cb5af32230a1?q=80&w=800"
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
    "https://images.unsplash.com/photo-1520813792240-56fc4a3765a7?q=80&w=200&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=200&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?q=80&w=200&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1554151228-14d9def656e4?q=80&w=200&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?q=80&w=200&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1552374196-c4e7ffc6e126?q=80&w=200&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1517365830460-955ce3ccd263?q=80&w=200&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1546961329-78bef0414d7c?q=80&w=200&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1514315384763-ba401779410f?q=80&w=200&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1557053910-d9eadeed1c58?q=80&w=200&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1489424731084-a5d8b219a5bb?q=80&w=200&auto=format&fit=crop"
];

const userProfiles = [
    { name: 'Priya Sharma', email: 'p@p.com' },
    { name: 'Ananya Verma', email: 'a@a.in' },
    { name: 'Kavya Singh', email: 'kavya@example.com' },
    { name: 'Sneha Kapoor', email: 'sneha@example.com' },
    { name: 'Riya Mehta', email: 'riya@example.com' },
    { name: 'Aditi Joshi', email: 'aditi@example.com' },
    { name: 'Simran Kaur', email: 'simran@example.com' },
    { name: 'Neha Agarwal', email: 'neha@example.com' },
    { name: 'Pooja Yadav', email: 'pooja@example.com' },
    { name: 'Ishita Malhotra', email: 'ishita@example.com' },
    { name: 'Deepika Patel', email: 'deepika@example.com' },
    { name: 'Shruti Desai', email: 'shruti@example.com' },
    { name: 'Tanvi Reddy', email: 'tanvi@example.com' },
    { name: 'Ayesha Khan', email: 'ayesha@example.com' },
    { name: 'Manya Gupta', email: 'manya@example.com' },
    { name: 'Nisha Bhatia', email: 'nisha@example.com' },
    { name: 'Sonal Tiwari', email: 'sonal@example.com' },
    { name: 'Ritika Jain', email: 'ritika@example.com' },
    { name: 'Kritika Sen', email: 'kritika@example.com' },
    { name: 'Anushka Das', email: 'anushka@example.com' }
];

const productsData = [
    { title: "Vitamin C Radiance Serum", cat: "Skincare", brand: "Minimalist" },
    { title: "Matte Liquid Lipstick - Crimson", cat: "Makeup", brand: "Sugar Cosmetics" },
    { title: "Argan Oil Hair Mask", cat: "Haircare", brand: "Mamaearth" },
    { title: "SPF 50 PA+++ Sunscreen", cat: "Skincare", brand: "Plum" },
    { title: "Intense Black Kajal", cat: "Makeup", brand: "Lakme" },
    { title: "Ocean Breeze Perfume", cat: "Fragrance", brand: "Bella Vita" },
    { title: "Tea Tree Face Wash", cat: "Skincare", brand: "Nykaa" },
    { title: "Vanilla Body Mist", cat: "Fragrance", brand: "Plum" },
    { title: "Keratin Smooth Shampoo", cat: "Haircare", brand: "Tresemme" },
    { title: "Deep Hydration Conditioner", cat: "Haircare", brand: "L'Oreal" },
    { title: "Fit Me Matte Foundation", cat: "Makeup", brand: "Maybelline" },
    { title: "Lash Sensational Mascara", cat: "Makeup", brand: "Maybelline" },
    { title: "Onion Hair Oil", cat: "Haircare", brand: "WOW" },
    { title: "Ceramide Moisturizer", cat: "Skincare", brand: "Dot & Key" },
    { title: "Rose Water Toner", cat: "Skincare", brand: "Plum" },
    { title: "Golden Glow Highlighter", cat: "Makeup", brand: "Sugar Cosmetics" },
    { title: "Night Repair Elixir", cat: "Skincare", brand: "Minimalist" },
    { title: "Volume Boost Hair Spray", cat: "Haircare", brand: "Tresemme" },
    { title: "Floral Romance EDP", cat: "Fragrance", brand: "Bella Vita" },
    { title: "Peachy Blush Duo", cat: "Makeup", brand: "Nykaa" },
    { title: "Coffee Body Scrub", cat: "Skincare", brand: "WOW" },
    { title: "Lip Sleeping Mask", cat: "Skincare", brand: "Dot & Key" },
    { title: "Silk Infusion Hair Serum", cat: "Haircare", brand: "L'Oreal" },
    { title: "Matte Finish Setting Spray", cat: "Makeup", brand: "Maybelline" },
    { title: "Ubtan Face Mask", cat: "Skincare", brand: "Mamaearth" },
    { title: "Liquid Eyeliner Pen", cat: "Makeup", brand: "Lakme" },
    { title: "Oud & Wood Perfume", cat: "Fragrance", brand: "Bella Vita" },
    { title: "Color Protect Shampoo", cat: "Haircare", brand: "L'Oreal" },
    { title: "Niacinamide Face Serum", cat: "Skincare", brand: "Minimalist" },
    { title: "Creamy Matte Lipstick - Nude", cat: "Makeup", brand: "Lakme" }
];

const reviewComments = [
    "Amazing product for daily skincare routine",
    "Perfect for Indian skin",
    "Loved the fragrance",
    "Packaging was premium",
    "Worth every rupee",
    "My skin feels so smooth",
    "Definitely buying again",
    "Hair feels silky after use",
    "Long lasting fragrance",
    "Best lipstick shade ever",
    "Very hydrating and lightweight",
    "Could be better, but good for the price",
    "Not sticky at all, absorbs quickly",
    "Smells absolutely heavenly!",
    "My holy grail product now."
];

function randomDate(start, end) {
    return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

async function seedDatabase() {
    try {
        await mongoose.connect(DB_URL);
        console.log("Connected to MongoDB...");
        
        console.log("Clearing old collections...");
        await User.deleteMany({});
        await Product.deleteMany({});
        await Order.deleteMany({});
        await Review.deleteMany({});
        await Coupon.deleteMany({});
        
        console.log("Creating Admin User...");
        const adminUser = new User({ email: 'admin@glowspark.com', username: 'Admin', role: 'admin' });
        await User.register(adminUser, 'admin123');
        
        console.log("Creating 20 Verified Female Customers...");
        const customers = [];
        for (let i = 0; i < 20; i++) {
            const user = new User({
                email: userProfiles[i].email,
                username: userProfiles[i].name,
                role: 'customer',
                profilePhoto: { url: userAvatars[i % userAvatars.length], filename: `avatar_${i}` },
                addresses: [{ 
                    houseNo: `${Math.floor(Math.random() * 900) + 100}`, 
                    street: `Sector ${Math.floor(Math.random() * 50) + 1} Road`, 
                    city: ['Mumbai', 'Delhi', 'Bangalore', 'Pune', 'Hyderabad', 'Chennai'][Math.floor(Math.random() * 6)], 
                    state: 'India State', 
                    pincode: `40000${Math.floor(Math.random() * 9)}`, 
                    isDefault: true 
                }],
                phoneNumber: `+9198${Math.floor(Math.random() * 90000000) + 10000000}`,
                isVerified: true,
                createdAt: randomDate(new Date(2023, 0, 1), new Date()),
                profileCompletion: 100,
                savedPaymentMethods: [{ provider: 'stripe', last4: '4242', expMonth: 12, expYear: 2028, isDefault: true }]
            });
            const registeredUser = await User.register(user, 'pass123');
            customers.push(registeredUser);
        }

        console.log("Creating 30 Products...");
        const createdProducts = [];
        for (let i = 0; i < 30; i++) {
            const pData = productsData[i];
            const pDate = randomDate(new Date(2023, 0, 1), new Date());
            
            const product = new Product({
                title: pData.title,
                description: `Experience the luxury of ${pData.title} by ${pData.brand}. Formulated with premium ingredients to enhance your natural beauty. Clinically tested, cruelty-free, and perfect for daily use.`,
                price: Math.floor(Math.random() * 2500) + 299, 
                stock: Math.floor(Math.random() * 500) + 50,
                brand: pData.brand,
                category: pData.cat,
                images: [{ url: productImages[i % productImages.length], filename: `product_${i}` }],
                thumbnailIndex: 0,
                ratingAverage: 0,
                reviewCount: 0,
                orderCount: 0,
                soldCount: 0,
                isFeatured: Math.random() > 0.8,
                isNewArrival: Math.random() > 0.7,
                ingredients: "Aqua, Glycerin, Natural Extracts, Essential Oils",
                owner: adminUser._id,
                createdAt: pDate,
                updatedAt: pDate
            });
            await product.save();
            createdProducts.push(product);
        }

        console.log("Seeding Reviews...");
        for (let product of createdProducts) {
            const numReviews = Math.floor(Math.random() * 6) + 5; // 5 to 10 reviews
            let totalRating = 0;
            
            for (let i = 0; i < numReviews; i++) {
                const randomUser = customers[Math.floor(Math.random() * customers.length)];
                const rating = Math.floor(Math.random() * 3) + 3; // 3 to 5 stars
                
                const review = new Review({
                    comment: reviewComments[Math.floor(Math.random() * reviewComments.length)],
                    rating: rating,
                    verifiedPurchase: true,
                    likes: [customers[Math.floor(Math.random() * customers.length)]._id, customers[Math.floor(Math.random() * customers.length)]._id],
                    dislikes: [],
                    author: randomUser._id,
                    createdAt: randomDate(product.createdAt, new Date())
                });
                
                await review.save();
                product.reviews.push(review._id);
                totalRating += rating;
            }
            
            product.reviewCount = numReviews;
            product.ratingAverage = totalRating / numReviews;
            await product.save();
        }

        console.log("Seeding Wishlist & Cart for Users...");
        for (let user of customers) {
            // 10-12 wishlist items
            const wishCount = Math.floor(Math.random() * 3) + 10;
            const shuffled = [...createdProducts].sort(() => 0.5 - Math.random());
            user.wishlist = shuffled.slice(0, wishCount).map(p => p._id);
            
            // 8-10 cart items
            const cartCount = Math.floor(Math.random() * 3) + 8;
            const cartShuffled = [...createdProducts].sort(() => 0.5 - Math.random());
            user.cart = cartShuffled.slice(0, cartCount).map(p => ({
                product: p._id,
                quantity: Math.floor(Math.random() * 3) + 1
            }));
            await user.save();
        }

        console.log("Seeding Orders...");
        const statuses = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Delivered', 'Delivered', 'Cancelled'];
        
        for (let i = 0; i < 150; i++) {
            const randomUser = customers[Math.floor(Math.random() * customers.length)];
            const pastDate = randomDate(new Date(2023, 6, 1), new Date());
            const numItems = Math.floor(Math.random() * 5) + 1;
            const orderProducts = [];
            let totalAmount = 0;

            for (let j = 0; j < numItems; j++) {
                const p = createdProducts[Math.floor(Math.random() * createdProducts.length)];
                const qty = Math.floor(Math.random() * 3) + 1;
                
                orderProducts.push({
                    product: p._id,
                    name: p.title,
                    image: p.images && p.images[p.thumbnailIndex || 0] ? p.images[p.thumbnailIndex || 0].url : '',
                    quantity: qty,
                    price: p.price
                });
                totalAmount += p.price * qty;
                
                p.orderCount += 1;
                p.soldCount += qty;
                await p.save();
            }

            const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
            let returnStatus = 'None';
            let returnReason = '';
            
            if (randomStatus === 'Delivered' && Math.random() < 0.2) { // 20% return rate
                const returnOptions = ['Requested', 'Approved', 'Refunded', 'Rejected'];
                returnStatus = returnOptions[Math.floor(Math.random() * returnOptions.length)];
                returnReason = "Not suitable for my skin type / Changed mind";
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
                updatedAt: new Date(pastDate.getTime() + 86400000), // +1 day
                returnStatus: returnStatus,
                returnReason: returnReason
            });

            await order.save();
        }

        console.log("Creating Realistic Coupons...");
        const couponsData = [
            { code: 'GLOW20', discountPercent: 20, minOrderValue: 1000 },
            { code: 'MAKEUP30', discountPercent: 30, minOrderValue: 2000 },
            { code: 'FIRSTBUY', flatDiscount: 500, minOrderValue: 1500 },
            { code: 'BEAUTY50', discountPercent: 50, minOrderValue: 5000 },
            { code: 'SKINLOVE', flatDiscount: 200, minOrderValue: 800 },
            { code: 'HAIRCARE25', discountPercent: 25, minOrderValue: 1200 },
            { code: 'PERFUME10', discountPercent: 10, minOrderValue: 500 }
        ];

        for (const c of couponsData) {
            const coupon = new Coupon({
                ...c,
                expiresAt: new Date(Date.now() + 90*24*60*60*1000),
                active: true,
                usageLimit: 1000,
                usedCount: Math.floor(Math.random() * 500)
            });
            await coupon.save();
        }

        console.log("Database seeded successfully with PRODUCTION-LEVEL data!");
        process.exit(0);
    } catch (err) {
        console.error("Seeding failed:", err);
        process.exit(1);
    }
}

seedDatabase();
