import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaUser, FaEnvelope, FaPhone, FaStar, FaInfoCircle, 
  FaLightbulb, FaRocket, FaHeart 
} from 'react-icons/fa';
import Navbar from '../components/Navbar';

const groupMembers = [
  {
    id: 'agrim',
    name: 'Agrim Tiwari',
    email: 'agrimtiwari833@gmail.com',
    phoneno: '9653048750',
    contribution: 'Frontend architecture, visual design language, high-fidelity real-time socket listeners, and overall user experience.'
  },
  {
    id: 'utkarsh',
    name: 'Utkarsh Sahu',
    email: 'sahupawan@student.iul.ac.in',
    phoneno: '6392575621',
    contribution: 'Backend API architecture design, database model schema controls, and production-quality data seeding scripts.'
  },
  {
    id: 'manish',
    name: 'Manish Mallick',
    email: 'manishmallick629@gmail.com',
    phoneno: '8423836839',
    contribution: 'API route validation testing, security configurations, and live-hosting deployment optimizations.'
  },
  {
    id: 'abhishek',
    name: 'Abhishek Pandey',
    email: 'ap8084049@gmail.com',
    phoneno: '9335564327',
    contribution: 'User experience audits, rating mechanisms testing, and QA testing workflow configurations.'
  },
  {
    id: 'ajay',
    name: 'Ajay Kushwaha',
    email: 'maxxi777450@gmail.com',
    phoneno: '9519283746',
    contribution: 'Database indexes auditing, MVC pattern validation, and analytics query optimization.'
  }
];

const AboutUs = () => {
  const [activeTab, setActiveTab] = useState(groupMembers[0].id);
  const activeMember = groupMembers.find(m => m.id === activeTab);

  return (
    <div className="bg-brand-50 dark:bg-gray-900 min-h-screen pb-24 transition-colors duration-300">
      <Navbar />
      
      {/* Page Header */}
      <div className="pt-32 pb-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-100 dark:bg-brand-900/30 text-brand-700 dark:text-brand-350 text-[10px] font-bold uppercase tracking-wider">
          <FaStar className="animate-pulse text-xs text-amber-500" /> About GlowSpark
        </div>
        <h1 className="text-3xl sm:text-5xl font-serif font-bold text-gray-900 dark:text-white leading-tight">
          A Symphony of Science & Aesthetics
        </h1>
        <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 font-light max-w-2xl mx-auto leading-relaxed">
          GlowSpark represents a state-of-the-art e-commerce storefront, bringing professional organic skincare cosmetics to life with robust engineering and luxurious responsive design.
        </p>
      </div>

      {/* Website Showcase Section: Inspiration, What's New, Motivation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 mb-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Inspiration Card */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-brand-100/50 dark:border-gray-700 shadow-sm hover:shadow-md transition-all flex flex-col space-y-4">
            <div className="w-10 h-10 rounded-xl bg-brand-50 dark:bg-brand-950/20 text-brand-750 dark:text-brand-400 flex items-center justify-center text-lg">
              <FaLightbulb />
            </div>
            <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider font-serif">Inspiration</h3>
            <p className="text-xs text-gray-605 dark:text-gray-400 font-light leading-relaxed">
              We were inspired by the raw purity of organic botanicals. Our goal was to fuse natural ingredients with an ultra-premium, tactile digital flagship store. We wanted to design an online counter that feels as clean and luxurious as applying the products themselves.
            </p>
          </div>

          {/* What's New Card */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-brand-100/50 dark:border-gray-700 shadow-sm hover:shadow-md transition-all flex flex-col space-y-4">
            <div className="w-10 h-10 rounded-xl bg-brand-50 dark:bg-brand-950/20 text-brand-750 dark:text-brand-400 flex items-center justify-center text-lg">
              <FaRocket />
            </div>
            <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider font-serif">What's New</h3>
            <p className="text-xs text-gray-605 dark:text-gray-400 font-light leading-relaxed">
              Experience dynamic database seeding producing hyper-realistic catalog details, a fluid mobile-first dropdown side navigation, compact elegant cards in a 3-column product list, responsive sliding filter drawers, and a customer reviews dashboard complete with star rating breakdown meters.
            </p>
          </div>

          {/* Motivation Card */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-brand-100/50 dark:border-gray-700 shadow-sm hover:shadow-md transition-all flex flex-col space-y-4">
            <div className="w-10 h-10 rounded-xl bg-brand-50 dark:bg-brand-950/20 text-brand-750 dark:text-brand-400 flex items-center justify-center text-lg">
              <FaHeart />
            </div>
            <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider font-serif">Our Motivation</h3>
            <p className="text-xs text-gray-605 dark:text-gray-400 font-light leading-relaxed">
              To establish that high-performance engineering in MERN does not require sacrificing clean visual storytelling. We wanted to prove that a modern boutique store can offer responsive layout controls, secure payment mockups, and database models while maintaining an elegant, world-class aesthetic.
            </p>
          </div>
        </div>
      </div>

      {/* Interactive Bio Portal Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-gray-900 dark:text-white">Our Engineering Team</h2>
          <p className="text-xs text-gray-500 dark:text-gray-400 max-w-lg mx-auto mt-2">Meet the developers behind the e-commerce infrastructure, user experiences, and database models of GlowSpark.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Sidebar Tabs - The Founders */}
          <div className="lg:col-span-4 space-y-2">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-2 mb-2 block">Select Member</span>
            <div className="flex flex-row lg:flex-col overflow-x-auto lg:overflow-x-visible gap-2 pb-3 lg:pb-0 snap-x">
              {groupMembers.map(member => (
                <button
                  key={member.id}
                  onClick={() => setActiveTab(member.id)}
                  className={`snap-center shrink-0 w-56 lg:w-full text-left px-4 py-3.5 rounded-xl border transition-all duration-200 flex items-center justify-between group ${
                    activeTab === member.id 
                      ? 'bg-white dark:bg-gray-800 border-brand-500/30 dark:border-brand-500/20 shadow-md text-brand-900 dark:text-white' 
                      : 'bg-white/60 dark:bg-gray-800/40 border-gray-100 dark:border-gray-800 text-gray-600 dark:text-gray-450 hover:bg-white dark:hover:bg-gray-800'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs transition-colors ${
                      activeTab === member.id 
                        ? 'bg-brand-500 text-white' 
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 group-hover:bg-brand-50'
                    }`}>
                      {member.name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-bold text-xs sm:text-sm leading-none">{member.name}</h3>
                      <p className="text-[9px] uppercase font-bold text-brand-500 tracking-wider mt-1">{member.id === 'agrim' ? 'Frontend Architect' : member.id === 'utkarsh' ? 'Backend Architect' : 'Engineer'}</p>
                    </div>
                  </div>
                  <div className={`w-1.5 h-1.5 rounded-full transition-all ${activeTab === member.id ? 'bg-brand-500 scale-110' : 'bg-transparent'}`}></div>
                </button>
              ))}
            </div>
          </div>

          {/* Active Biography Panel Details */}
          <div className="lg:col-span-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeMember.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="bg-white dark:bg-gray-800 rounded-2xl p-6 sm:p-8 shadow-md border border-gray-100 dark:border-gray-700 space-y-6"
              >
                {/* Header Profile Title */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-gray-100 dark:border-gray-750 pb-4 gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-brand-500 text-white rounded-xl flex items-center justify-center text-xl font-serif font-black shadow-inner">
                      {activeMember.name.charAt(0)}
                    </div>
                    <div>
                      <h2 className="text-xl sm:text-2xl font-serif font-bold text-gray-900 dark:text-white leading-none">{activeMember.name}</h2>
                      <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-1 uppercase tracking-wider">GlowSpark Founder</p>
                    </div>
                  </div>
                  <span className="px-3 py-1 bg-brand-50 dark:bg-brand-950/20 border border-brand-200/50 dark:border-brand-900/30 text-brand-700 dark:text-brand-400 rounded-lg text-[9px] font-bold uppercase tracking-wider">
                    {activeMember.id === 'agrim' ? 'Member 1' : activeMember.id === 'utkarsh' ? 'Member 2' : activeMember.id === 'manish' ? 'Member 3' : activeMember.id === 'abhishek' ? 'Member 4' : 'Member 5'}
                  </span>
                </div>

                {/* Simplified Contact Card & Bio */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Name & Phone */}
                  <div className="space-y-4 bg-brand-50/40 dark:bg-gray-850 p-5 rounded-xl border border-brand-100/30 dark:border-gray-750/50">
                    <h3 className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider flex items-center gap-2 border-b border-gray-100 dark:border-gray-700/55 pb-2">
                      <FaUser className="text-brand-500" /> Identity Details
                    </h3>
                    <div className="space-y-2.5 text-xs">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-500 dark:text-gray-450">Full Name</span>
                        <span className="font-semibold text-gray-900 dark:text-gray-200">{activeMember.name}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-500 dark:text-gray-450">Phone Number</span>
                        <a href={`tel:${activeMember.phoneno}`} className="font-semibold text-brand-700 dark:text-brand-400 hover:underline">{activeMember.phoneno}</a>
                      </div>
                    </div>
                  </div>

                  {/* Email & Contact */}
                  <div className="space-y-4 bg-brand-50/40 dark:bg-gray-850 p-5 rounded-xl border border-brand-100/30 dark:border-gray-750/50">
                    <h3 className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider flex items-center gap-2 border-b border-gray-100 dark:border-gray-700/55 pb-2">
                      <FaEnvelope className="text-brand-500" /> Online Presence
                    </h3>
                    <div className="space-y-2.5 text-xs">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-500 dark:text-gray-450">Email Address</span>
                        <a href={`mailto:${activeMember.email}`} className="font-semibold text-brand-700 dark:text-brand-400 hover:underline truncate max-w-[150px] sm:max-w-[200px]">{activeMember.email}</a>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-500 dark:text-gray-450">Mobile Code</span>
                        <span className="font-semibold text-gray-900 dark:text-gray-200">+91 (India)</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Team Project Contribution */}
                <div className="space-y-3 p-5 bg-brand-500/5 dark:bg-[#1A0303]/10 border border-brand-500/20 rounded-xl">
                  <h3 className="text-xs font-bold text-brand-900 dark:text-brand-350 uppercase tracking-wider flex items-center gap-2">
                    <FaInfoCircle className="text-brand-500" /> Project Contribution & Responsibilities
                  </h3>
                  <p className="text-xs text-gray-700 dark:text-gray-300 font-light leading-relaxed">
                    {activeMember.contribution}
                  </p>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutUs;
