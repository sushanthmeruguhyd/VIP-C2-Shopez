import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';
import Product from '../models/Product.js';
import Order from '../models/Order.js';
import Cart from '../models/Cart.js';
import Admin from '../models/Admin.js';
import connectDB from '../config/db.js';

dotenv.config();

connectDB();

const seedData = async () => {
  try {
    // Clear existing data
    await Order.deleteMany();
    await Product.deleteMany();
    await User.deleteMany();
    await Cart.deleteMany();
    await Admin.deleteMany();

    console.log('Database cleared.');

    // 1. Seed Users
    const adminUser = await User.create({
      name: 'Demo Admin',
      email: 'admin@shopez.com',
      password: 'password123',
      isAdmin: true,
    });

    const regularUser = await User.create({
      name: 'Demo User',
      email: 'user@shopez.com',
      password: 'password123',
      isAdmin: false,
    });

    console.log('Users seeded.');

    // 2. Seed Admin Config
    const adminConfig = await Admin.create({
      bannerImage: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?q=80&w=1200&auto=format&fit=crop',
      categories: ['Laptops', 'Audio', 'Wearables', 'Phones', 'Accessories'],
    });

    console.log('Admin configuration seeded.');

    // 3. Seed Products
    const products = [
      {
        name: 'NovaBook Pro 16',
        description: 'Vibrant visuals and peak performance. Designed for designers, developers, and heavy multitaskers.',
        price: 124900,
        category: 'Laptops',
        image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?q=80&w=600&auto=format&fit=crop',
        countInStock: 10,
        rating: 4.0,
        numReviews: 2,
        reviews: [
          {
            name: 'Alice Cooper',
            rating: 4,
            comment: 'Super fast laptop with an incredible display. Battery life could be slightly better but overall fantastic.',
            user: regularUser._id,
          },
          {
            name: 'Bob Marley',
            rating: 4,
            comment: 'The trackpad is huge and keyboard is very comfortable. Excellent for developers.',
            user: adminUser._id,
          },
        ],
      },
      {
        name: 'AeroSound Max',
        description: 'Immersive wireless over-ear headphones featuring state-of-the-art active noise cancellation and crystal clear acoustics.',
        price: 24900,
        category: 'Audio',
        image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=600&auto=format&fit=crop',
        countInStock: 15,
        rating: 4.0,
        numReviews: 1,
        reviews: [
          {
            name: 'John Smith',
            rating: 4,
            comment: 'Very comfortable for long flights. The bass is clean and noise-cancelling is premium level.',
            user: regularUser._id,
          },
        ],
      },
      {
        name: 'Quantum Watch S4',
        description: 'Track your fitness, notifications, and vital stats with a sleek, minimalist titanium watch frame and bright display.',
        price: 19900,
        category: 'Wearables',
        image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=600&auto=format&fit=crop',
        countInStock: 8,
        rating: 4.0,
        numReviews: 1,
        reviews: [
          {
            name: 'Jane Doe',
            rating: 4,
            comment: 'Simple, clean watch. Integrates well with both iOS and Android. Recommending it.',
            user: regularUser._id,
          },
        ],
      },
      {
        name: 'Apex Phone Pro',
        description: 'Revolutionary flagship smartphone with a triple-lens zoom lens, advanced neural engine, and all-day backup battery.',
        price: 79900,
        category: 'Phones',
        image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?q=80&w=600&auto=format&fit=crop',
        countInStock: 20,
        rating: 5.0,
        numReviews: 0,
        reviews: [],
      },
      {
        name: 'ChargePad Wireless',
        description: 'Fast dual wireless charger that fits on any desk. Supports simultaneous smart phone and earbud charging.',
        price: 3990,
        category: 'Accessories',
        image: 'https://images.unsplash.com/photo-1622445262465-2481c4574875?q=80&w=600&auto=format&fit=crop',
        countInStock: 30,
        rating: 4.5,
        numReviews: 0,
        reviews: [],
      },
      {
        name: 'Travel Case Lite',
        description: 'Water-resistant travel storage case. Organizes your cables, adapters, memory cards, and other gear in one compact pouch.',
        price: 2990,
        category: 'Accessories',
        image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?q=80&w=600&auto=format&fit=crop',
        countInStock: 25,
        rating: 4.2,
        numReviews: 0,
        reviews: [],
      },
      {
        name: 'NovaBook Air 13',
        description: 'Ultra-thin, feather-light laptop with state of the art performance and outstanding battery life.',
        price: 74900,
        category: 'Laptops',
        image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?q=80&w=600&auto=format&fit=crop',
        countInStock: 12,
        rating: 4.6,
        numReviews: 0,
        reviews: [],
      },
      {
        name: 'Aura Buds Live',
        description: 'True wireless noise cancelling earbuds designed for perfect fit and pure, rich sound acoustics.',
        price: 8990,
        category: 'Audio',
        image: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?q=80&w=600&auto=format&fit=crop',
        countInStock: 22,
        rating: 4.4,
        numReviews: 0,
        reviews: [],
      },
      {
        name: 'Horizon Phone 12',
        description: 'Vibrant screen, flagship processors, and gorgeous triple cameras to capture every moment in high detail.',
        price: 49900,
        category: 'Phones',
        image: 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?q=80&w=600&auto=format&fit=crop',
        countInStock: 18,
        rating: 4.7,
        numReviews: 0,
        reviews: [],
      },
      {
        name: 'Active Band Lite',
        description: 'Track daily steps, active minutes, workouts, heart rate, and sleep metrics with a lightweight water-resistant band.',
        price: 4990,
        category: 'Wearables',
        image: 'https://images.unsplash.com/photo-1575311373937-040b8e1fd5b6?q=80&w=600&auto=format&fit=crop',
        countInStock: 25,
        rating: 4.3,
        numReviews: 0,
        reviews: [],
      },
    ];

    await Product.insertMany(products);

    console.log('Products seeded.');
    console.log('Database seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error(`Error seeding database: ${error.message}`);
    process.exit(1);
  }
};

seedData();
