const sampleProducts = [
  {
    title: "Radiance Vitamin C Serum",
    description: "Brighten and even out your skin tone with our potent Vitamin C serum. Formulated with hyaluronic acid for deep hydration.",
    brand: "Glow Naturals",
    category: "Skincare",
    price: 1499,
    stock: 50,
    ingredients: "Vitamin C (L-Ascorbic Acid), Hyaluronic Acid, Ferulic Acid, Vitamin E",
    image: {
      filename: "glow-serum",
      url: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?q=80&w=600&auto=format&fit=crop"
    }
  },
  {
    title: "Hydrating Night Cream",
    description: "A rich, deeply moisturizing night cream that repairs your skin's barrier while you sleep. Wake up to plump, glowing skin.",
    brand: "Lumiere",
    category: "Skincare",
    price: 2100,
    stock: 30,
    ingredients: "Ceramides, Peptides, Niacinamide, Shea Butter",
    image: {
      filename: "night-cream",
      url: "https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?q=80&w=600&auto=format&fit=crop"
    }
  },
  {
    title: "Velvet Matte Lipstick - Crimson",
    description: "Highly pigmented, long-lasting matte lipstick that doesn't dry out your lips. Perfect for a bold evening look.",
    brand: "Aura Cosmetics",
    category: "Makeup",
    price: 850,
    stock: 100,
    ingredients: "Vitamin E, Jojoba Oil, Mineral Pigments",
    image: {
      filename: "matte-lipstick",
      url: "https://images.unsplash.com/photo-1586495777744-4413f21062fa?q=80&w=600&auto=format&fit=crop"
    }
  },
  {
    title: "Rosewater Facial Toner",
    description: "A refreshing, alcohol-free toner that balances pH levels and prepares skin for moisturizers.",
    brand: "Botanica",
    category: "Skincare",
    price: 650,
    stock: 80,
    ingredients: "Pure Rosewater, Witch Hazel, Aloe Vera",
    image: {
      filename: "rose-toner",
      url: "https://images.unsplash.com/photo-1615397323282-31121d51a6df?q=80&w=600&auto=format&fit=crop"
    }
  },
  {
    title: "Midnight Orchid Perfume",
    description: "A luxurious fragrance blending dark orchid, black truffle, and patchouli for a mysterious and sensual scent.",
    brand: "Essence",
    category: "Fragrance",
    price: 4500,
    stock: 15,
    ingredients: "Alcohol Denat., Fragrance (Parfum), Water (Aqua)",
    image: {
      filename: "orchid-perfume",
      url: "https://images.unsplash.com/photo-1594035910387-fea47794261f?q=80&w=600&auto=format&fit=crop"
    }
  },
  {
    title: "Nourishing Hair Oil",
    description: "A blend of 7 essential oils to reduce hair fall, promote growth, and add incredible shine to dull hair.",
    brand: "Silk Tresses",
    category: "Haircare",
    price: 999,
    stock: 45,
    ingredients: "Argan Oil, Almond Oil, Coconut Oil, Castor Oil",
    image: {
      filename: "hair-oil",
      url: "https://images.unsplash.com/photo-1608248593842-8021f618bc32?q=80&w=600&auto=format&fit=crop"
    }
  }
];

module.exports = { data: sampleProducts };
