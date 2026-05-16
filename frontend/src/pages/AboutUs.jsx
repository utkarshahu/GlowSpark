import React from 'react';
import Navbar from '../components/Navbar';
import { FaHeart, FaCode, FaPaintBrush, FaLaptopCode, FaServer } from 'react-icons/fa';

const AboutUs = () => {
  return (
    <div className="bg-brand-50 dark:bg-gray-900 min-h-screen pb-20 transition-colors duration-300">
      <Navbar />
      
      {/* Hero Section */}
      <div className="pt-32 pb-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h1 className="text-4xl md:text-6xl font-serif font-bold text-brand-900 dark:text-white mb-6">Our Story</h1>
        <p className="text-lg text-gray-600 dark:text-gray-400 font-light max-w-3xl mx-auto leading-relaxed">
          Glow Spark was not just created as a college project — it was built with passion, creativity, teamwork, and a dream to create something meaningful in the world of modern ecommerce and beauty technology.
        </p>
      </div>

      {/* The Motivation */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-white dark:bg-gray-800 rounded-3xl p-10 md:p-16 shadow-sm border border-brand-100 dark:border-gray-700">
          <h2 className="text-3xl font-serif font-bold text-brand-900 dark:text-white mb-6 text-center">The Motivation Behind Glow Spark</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
            As students passionate about technology and design, we wanted to create more than just another ecommerce website. We wanted to build a platform that felt modern, premium, interactive, and emotionally engaging.
          </p>
          <p className="text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
            Most beauty ecommerce websites focus only on selling products. Our vision was different. We imagined a digital beauty experience where users could discover skincare products beautifully, enjoy smooth cinematic animations, experience premium interactions, feel connected to the brand story, and navigate effortlessly across devices.
          </p>
          <div className="bg-brand-50 dark:bg-gray-700/50 rounded-2xl p-6 mt-8">
            <p className="text-brand-800 dark:text-brand-300 font-medium italic text-center">
              "Glow Spark became our way of combining creativity, technology, design, innovation, and teamwork into one complete experience."
            </p>
          </div>
        </div>
      </div>

      {/* Meet The Founders */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-3xl md:text-4xl font-serif font-bold text-brand-900 dark:text-white mb-12 text-center">Meet The Founders</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Agrim */}
          <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl border border-brand-100 dark:border-gray-700 text-center hover:-translate-y-2 transition-transform duration-300">
            <div className="w-16 h-16 bg-brand-100 dark:bg-brand-900/30 text-brand-600 dark:text-brand-400 rounded-full flex items-center justify-center mx-auto mb-6 text-2xl">
              <FaPaintBrush />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Agrim Tiwari</h3>
            <p className="text-sm font-medium text-brand-500 mb-4 uppercase tracking-wider">Creative Thinker & Frontend</p>
            <p className="text-gray-600 dark:text-gray-400 text-sm">Focused on designing modern UI/UX experiences, smooth animations, and premium visual interactions that make Glow Spark feel luxurious.</p>
          </div>

          {/* Utkarsh */}
          <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl border border-brand-100 dark:border-gray-700 text-center hover:-translate-y-2 transition-transform duration-300">
            <div className="w-16 h-16 bg-brand-100 dark:bg-brand-900/30 text-brand-600 dark:text-brand-400 rounded-full flex items-center justify-center mx-auto mb-6 text-2xl">
              <FaServer />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Utkarsh Sahu</h3>
            <p className="text-sm font-medium text-brand-500 mb-4 uppercase tracking-wider">Backend & Database</p>
            <p className="text-gray-600 dark:text-gray-400 text-sm">Worked on building scalable APIs, MongoDB architecture, authentication systems, and secure backend logic for the platform.</p>
          </div>

          {/* Manish */}
          <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl border border-brand-100 dark:border-gray-700 text-center hover:-translate-y-2 transition-transform duration-300">
            <div className="w-16 h-16 bg-brand-100 dark:bg-brand-900/30 text-brand-600 dark:text-brand-400 rounded-full flex items-center justify-center mx-auto mb-6 text-2xl">
              <FaLaptopCode />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Manish</h3>
            <p className="text-sm font-medium text-brand-500 mb-4 uppercase tracking-wider">Full Stack Developer</p>
            <p className="text-gray-600 dark:text-gray-400 text-sm">Handled integration between frontend and backend while optimizing performance, routing, and ecommerce functionalities.</p>
          </div>

          {/* Ajay */}
          <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl border border-brand-100 dark:border-gray-700 text-center hover:-translate-y-2 transition-transform duration-300 lg:col-start-2">
            <div className="w-16 h-16 bg-brand-100 dark:bg-brand-900/30 text-brand-600 dark:text-brand-400 rounded-full flex items-center justify-center mx-auto mb-6 text-2xl">
              <FaCode />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Ajay</h3>
            <p className="text-sm font-medium text-brand-500 mb-4 uppercase tracking-wider">UI Designer & Animation</p>
            <p className="text-gray-600 dark:text-gray-400 text-sm">Specialized in GSAP animations, cinematic transitions, loaders, interactive effects, and responsive design systems.</p>
          </div>

          {/* Abhishek */}
          <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl border border-brand-100 dark:border-gray-700 text-center hover:-translate-y-2 transition-transform duration-300">
            <div className="w-16 h-16 bg-brand-100 dark:bg-brand-900/30 text-brand-600 dark:text-brand-400 rounded-full flex items-center justify-center mx-auto mb-6 text-2xl">
              <FaHeart />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Abhishek</h3>
            <p className="text-sm font-medium text-brand-500 mb-4 uppercase tracking-wider">Project Strategist & Testing</p>
            <p className="text-gray-600 dark:text-gray-400 text-sm">Managed project planning, testing, debugging, feature optimization, and ensuring a smooth user experience across devices.</p>
          </div>
        </div>
      </div>

      {/* Journey & Vision */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <h2 className="text-3xl font-serif font-bold text-brand-900 dark:text-white mb-6">Our Journey & Vision</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-8 leading-relaxed">
          The development journey of Glow Spark started as a college project but quickly transformed into something much bigger. We faced backend errors, authentication issues, complex state management, and API debugging. But every challenge helped us learn and improve.
        </p>
        <p className="text-gray-600 dark:text-gray-400 mb-12 leading-relaxed">
          We believe technology should feel human, creative, and inspiring. Glow Spark represents student innovation, passion for development, modern web design, and future-ready ecommerce experiences. This project is not just about coding — it is about building something we are proud of together.
        </p>
        <div className="inline-block bg-black dark:bg-white text-white dark:text-black px-8 py-4 rounded-full font-bold uppercase tracking-widest text-sm shadow-xl">
          Thank you for visiting Glow Spark
        </div>
      </div>
    </div>
  );
};

export default AboutUs;
