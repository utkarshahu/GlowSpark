import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '../components/Navbar';
import MagneticButton from '../components/MagneticButton';
import HeroScene from '../components/HeroScene';
import api from '../api/axios';
import { socket } from '../api/socket';

gsap.registerPlugin(ScrollTrigger);

const pageVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 1.2, ease: "easeOut" } },
  exit: { opacity: 0, transition: { duration: 0.5, ease: "easeIn" } }
};

const Home = () => {
  const heroRef = useRef(null);
  const textContainerRef = useRef(null);
  const parallaxImgRef = useRef(null);
  const featuresRef = useRef(null);
  const bgGradientRef = useRef(null);

  const [newArrivals, setNewArrivals] = useState([]);

  useEffect(() => {
    const fetchNewArrivals = async () => {
      try {
        const res = await api.get('/products?limit=all');
        if (res.data.success) {
          const arrivals = res.data.products.filter(p => p.isNewArrival);
          setNewArrivals(arrivals);
        }
      } catch (err) {
        console.error("Failed to fetch new arrivals", err);
      }
    };
    fetchNewArrivals();

    // Socket listener for real-time reactivity
    socket.on('productUpdated', (updatedProduct) => {
      setNewArrivals((prev) => {
        const exists = prev.find(p => p._id === updatedProduct._id);
        if (updatedProduct.isNewArrival) {
          if (exists) {
            return prev.map(p => p._id === updatedProduct._id ? updatedProduct : p);
          } else {
            return [...prev, updatedProduct];
          }
        } else {
          return prev.filter(p => p._id !== updatedProduct._id);
        }
      });
    });

    socket.on('productDeleted', (deletedProductId) => {
      setNewArrivals((prev) => prev.filter(p => p._id !== deletedProductId));
    });

    return () => {
      socket.off('productUpdated');
      socket.off('productDeleted');
    };
  }, []);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Cinematic Text Reveal
      gsap.fromTo(textContainerRef.current.children, 
        { y: 150, opacity: 0, rotateX: -20 },
        { y: 0, opacity: 1, rotateX: 0, duration: 1.8, stagger: 0.15, ease: "power4.out", delay: 0.5 }
      );

      // Hero Image Parallax (tied to scroll)
      gsap.to(parallaxImgRef.current, {
        yPercent: 30,
        scale: 1.1,
        ease: "none",
        scrollTrigger: {
          trigger: heroRef.current,
          start: "top top",
          end: "bottom top",
          scrub: 1.5 // Smooth scrubbing
        }
      });

      // Interactive Mouse Follower Gradient
      const onMouseMove = (e) => {
        const { clientX, clientY } = e;
        const xPos = (clientX / window.innerWidth - 0.5) * 50;
        const yPos = (clientY / window.innerHeight - 0.5) * 50;
        
        gsap.to(bgGradientRef.current, {
          x: xPos,
          y: yPos,
          duration: 2,
          ease: "power2.out"
        });
      };
      
      window.addEventListener('mousemove', onMouseMove);

      // Featured Grid Stagger Animation
      gsap.fromTo(featuresRef.current.children,
        { y: 100, opacity: 0, scale: 0.95 },
        {
          y: 0, opacity: 1, scale: 1, duration: 1.2, stagger: 0.2, ease: "power3.out",
          scrollTrigger: {
            trigger: featuresRef.current,
            start: "top 80%",
          }
        }
      );

      return () => {
        window.removeEventListener('mousemove', onMouseMove);
      };
    });

    return () => ctx.revert();
  }, []);

  return (
    <motion.div 
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="bg-brand-50 dark:bg-gray-900 min-h-screen relative overflow-hidden transition-colors duration-300"
    >
      <Navbar />
      
      {/* Animated Background Gradient */}
      <div 
        ref={bgGradientRef}
        className="fixed inset-0 z-0 pointer-events-none opacity-40 blur-3xl"
        style={{
          background: 'radial-gradient(circle at 50% 50%, rgba(224, 206, 199, 0.8) 0%, transparent 60%)',
          width: '150vw',
          height: '150vh',
          top: '-25vh',
          left: '-25vw'
        }}
      ></div>

      {/* Hero Section */}
      <section ref={heroRef} className="relative h-[100vh] flex flex-col justify-center px-4 sm:px-8 lg:px-16 pt-20 z-10 overflow-hidden bg-brand-50 dark:bg-gray-900 transition-colors duration-300">
        <HeroScene />
        <div className="absolute inset-0 z-[-1] overflow-hidden rounded-b-[4rem]">
          <img 
            ref={parallaxImgRef}
            src="https://images.unsplash.com/photo-1615397323282-31121d51a6df?q=80&w=2000&auto=format&fit=crop" 
            alt="Premium Skincare" 
            className="w-full h-[130%] object-cover opacity-80 dark:opacity-40 transition-opacity duration-300"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-brand-50 via-brand-50/70 to-brand-50/30 dark:from-gray-900 dark:via-gray-900/80 dark:to-gray-900/40 transition-colors duration-300"></div>
        </div>
        
        <div className="max-w-7xl mx-auto w-full relative z-10 mt-20" ref={textContainerRef}>
          <div className="bg-white/60 dark:bg-black/40 backdrop-blur-xl p-8 md:p-12 rounded-3xl border border-white/50 dark:border-gray-800/50 shadow-2xl inline-block transition-colors duration-300">
            <div className="overflow-hidden mb-6">
              <p className="text-brand-700 dark:text-brand-300 font-bold tracking-[0.3em] uppercase text-sm md:text-base inline-block">The New Standard of Beauty</p>
            </div>
            <div className="overflow-hidden">
              <h1 className="text-5xl md:text-7xl lg:text-[8rem] font-serif font-bold text-gray-900 dark:text-white leading-[1] tracking-tighter mix-blend-normal">
                Redefining <br/> <span className="italic font-light text-brand-600 dark:text-brand-400 block mt-2">Luxury.</span>
              </h1>
            </div>
            <div className="overflow-hidden mt-8 max-w-lg">
              <p className="text-lg md:text-xl text-gray-800 dark:text-gray-200 font-light leading-relaxed">
                Experience clinically proven formulas encased in architectural, sustainable design.
              </p>
            </div>
            <div className="overflow-hidden mt-10 flex flex-wrap items-center gap-4 md:gap-6">
              <MagneticButton>
                <Link to="/products" className="inline-flex items-center justify-center bg-brand-900 dark:bg-brand-500 text-white px-8 md:px-10 py-4 md:py-5 rounded-full font-bold transition-all hover:bg-black dark:hover:bg-brand-400 uppercase tracking-widest text-xs md:text-sm shadow-xl hover:shadow-brand-900/20">
                  Shop Collection
                </Link>
              </MagneticButton>
              <MagneticButton>
                 <a href="#story" className="inline-flex items-center justify-center bg-white/70 dark:bg-black/50 backdrop-blur-md border border-brand-900/20 dark:border-white/20 text-brand-900 dark:text-white px-8 md:px-10 py-4 md:py-5 rounded-full font-bold transition-all hover:bg-white dark:hover:bg-gray-800 uppercase tracking-widest text-xs md:text-sm shadow-sm">
                    Our Story
                 </a>
              </MagneticButton>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Grid Section */}
      <section id="story" className="py-32 px-4 sm:px-8 lg:px-16 max-w-[100rem] mx-auto relative z-10">
        <div className="flex flex-col md:flex-row justify-between items-end mb-20 gap-8">
          <h2 className="text-5xl md:text-7xl font-serif font-bold text-brand-900 dark:text-white max-w-2xl leading-tight">
            Curated for the modern muse.
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 font-light max-w-md">
            Every product is a testament to quality, merging cutting-edge science with the purest botanical extracts.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8" ref={featuresRef}>
          <div className="md:col-span-7 h-[70vh] rounded-[2rem] overflow-hidden group relative">
             <img src="https://images.unsplash.com/photo-1620916566398-39f1143ab7be?q=80&w=1200&auto=format&fit=crop" alt="Serum" className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" />
             <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors duration-700"></div>
             <div className="absolute bottom-10 left-10 text-white">
                <p className="uppercase tracking-widest text-sm font-bold mb-2">Bestseller</p>
                <h3 className="text-4xl font-serif">The Elixir Serum</h3>
             </div>
          </div>
          <div className="md:col-span-5 flex flex-col gap-8">
             <div className="h-[calc(35vh-1rem)] rounded-[2rem] overflow-hidden group relative bg-brand-200 dark:bg-gray-800 p-10 flex flex-col justify-center transition-colors duration-300">
                <h3 className="text-3xl font-serif text-brand-900 dark:text-white mb-4">Clean Ingredients</h3>
                <p className="text-brand-800 dark:text-gray-300 font-light">Sourced ethically, formulated without compromises. Our promise to you and the planet.</p>
                <div className="mt-8">
                   <MagneticButton>
                     <Link to="/about" className="border-b border-brand-900 dark:border-white pb-1 text-sm font-bold uppercase tracking-wider text-brand-900 dark:text-white cursor-pointer block w-max transition-colors">Learn More</Link>
                   </MagneticButton>
                </div>
             </div>
             <div className="h-[calc(35vh-1rem)] rounded-[2rem] overflow-hidden group relative">
                <img src="https://images.unsplash.com/photo-1594035910387-fea47794261f?q=80&w=800&auto=format&fit=crop" alt="Perfume" className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" />
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors duration-700"></div>
                <div className="absolute bottom-8 left-8 text-white">
                  <h3 className="text-2xl font-serif">Signature Scents</h3>
                </div>
             </div>
          </div>
        </div>
      </section>

      {/* New Arrivals Section */}
      <section className="py-24 bg-white dark:bg-gray-900 border-y border-brand-100 dark:border-gray-800 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="text-brand-600 dark:text-brand-400 font-bold uppercase tracking-[0.2em] text-xs">Freshly Formulated</span>
            <h2 className="text-4xl md:text-5xl font-serif font-bold text-gray-900 dark:text-white mt-2">New Arrivals</h2>
            <div className="w-16 h-0.5 bg-brand-500 mx-auto mt-4"></div>
          </div>

          <AnimatePresence mode="popLayout">
            {newArrivals.length === 0 ? (
              <p className="text-center text-gray-500 py-10 font-light">Stay tuned! Our latest premium creations are arriving soon.</p>
            ) : (
              <motion.div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                {newArrivals.map((product) => {
                  const thumbnailUrl = product.images && product.images[product.thumbnailIndex || 0]
                    ? product.images[product.thumbnailIndex || 0].url
                    : (product.image?.url || 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?q=80&w=600');

                  return (
                    <motion.div
                      key={product._id}
                      layout
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ duration: 0.5 }}
                      className="group bg-brand-50 dark:bg-gray-850 rounded-3xl p-4 border border-brand-100/50 dark:border-gray-700 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between h-full"
                    >
                      <div className="relative aspect-square rounded-2xl overflow-hidden bg-white dark:bg-gray-950 mb-4 flex items-center justify-center p-4">
                        <img 
                          src={thumbnailUrl} 
                          alt={product.title} 
                          className="max-h-full object-contain group-hover:scale-105 transition-transform duration-500" 
                        />
                        <span className="absolute top-3 left-3 bg-brand-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">NEW</span>
                      </div>

                      <div className="flex-grow">
                        <span className="text-[10px] font-bold text-brand-500 uppercase tracking-widest block mb-1">{product.brand}</span>
                        <h3 className="font-serif font-bold text-gray-900 dark:text-white text-lg truncate mb-2">{product.title}</h3>
                        <p className="font-bold text-brand-700 dark:text-brand-300 mb-4">&#8377; {product.price.toLocaleString("en-IN")}</p>
                      </div>

                      <Link 
                        to={`/products/${product._id}`}
                        className="w-full py-3 bg-brand-900 hover:bg-black dark:bg-brand-500 text-white text-center rounded-xl font-bold transition-all text-sm uppercase tracking-wider block hover:shadow-lg"
                      >
                        View Details
                      </Link>
                    </motion.div>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>
      
      {/* Cinematic Footer Hook */}
      <section className="h-[80vh] bg-brand-900 rounded-t-[4rem] flex flex-col items-center justify-center relative overflow-hidden z-10 px-4">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent"></div>
        <h2 className="text-5xl md:text-8xl font-serif text-brand-55 mb-10 text-center relative z-10">Ready to Glow?</h2>
        <MagneticButton>
           <Link to="/products" className="relative z-10 inline-block bg-brand-50 text-brand-900 px-12 py-5 rounded-full font-bold uppercase tracking-widest hover:bg-white transition-colors text-sm shadow-2xl">
             Enter Store
           </Link>
        </MagneticButton>
      </section>
    </motion.div>
  );
};

export default Home;
