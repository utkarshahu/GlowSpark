import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { motion } from 'framer-motion';
import Navbar from '../components/Navbar';
import MagneticButton from '../components/MagneticButton';

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
      className="bg-brand-50 min-h-screen relative overflow-hidden"
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
      <section ref={heroRef} className="relative h-[100vh] flex flex-col justify-center px-4 sm:px-8 lg:px-16 pt-20 z-10 overflow-hidden">
        <div className="absolute inset-0 z-[-1] overflow-hidden rounded-b-[4rem]">
          <img 
            ref={parallaxImgRef}
            src="https://images.unsplash.com/photo-1615397323282-31121d51a6df?q=80&w=2000&auto=format&fit=crop" 
            alt="Premium Skincare" 
            className="w-full h-[130%] object-cover opacity-80"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-brand-50 via-brand-50/20 to-transparent"></div>
        </div>
        
        <div className="max-w-7xl mx-auto w-full relative z-10 mt-20" ref={textContainerRef}>
          <div className="overflow-hidden mb-6">
            <p className="text-brand-700 font-bold tracking-[0.3em] uppercase text-sm md:text-base inline-block">The New Standard of Beauty</p>
          </div>
          <div className="overflow-hidden">
            <h1 className="text-6xl md:text-8xl lg:text-[9rem] font-serif font-bold text-brand-900 leading-[0.9] tracking-tighter mix-blend-multiply">
              Redefining <br/> <span className="italic font-light text-brand-600 block mt-2">Luxury.</span>
            </h1>
          </div>
          <div className="overflow-hidden mt-10 max-w-lg">
            <p className="text-xl md:text-2xl text-gray-800 font-light leading-relaxed">
              Experience clinically proven formulas encased in architectural, sustainable design.
            </p>
          </div>
          <div className="overflow-hidden mt-12 flex items-center gap-6">
            <MagneticButton>
              <Link to="/products" className="inline-flex items-center justify-center bg-brand-900 text-white px-10 py-5 rounded-full font-medium transition-colors hover:bg-black uppercase tracking-widest text-sm">
                Shop Collection
              </Link>
            </MagneticButton>
            <MagneticButton>
               <a href="#story" className="inline-flex items-center justify-center border border-brand-900 text-brand-900 px-10 py-5 rounded-full font-medium transition-colors hover:bg-brand-100 uppercase tracking-widest text-sm">
                  Our Story
               </a>
            </MagneticButton>
          </div>
        </div>
      </section>

      {/* Featured Grid Section */}
      <section id="story" className="py-32 px-4 sm:px-8 lg:px-16 max-w-[100rem] mx-auto relative z-10">
        <div className="flex flex-col md:flex-row justify-between items-end mb-20 gap-8">
          <h2 className="text-5xl md:text-7xl font-serif font-bold text-brand-900 max-w-2xl leading-tight">
            Curated for the modern muse.
          </h2>
          <p className="text-lg text-gray-600 font-light max-w-md">
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
             <div className="h-[calc(35vh-1rem)] rounded-[2rem] overflow-hidden group relative bg-brand-200 p-10 flex flex-col justify-center">
                <h3 className="text-3xl font-serif text-brand-900 mb-4">Clean Ingredients</h3>
                <p className="text-brand-800 font-light">Sourced ethically, formulated without compromises. Our promise to you and the planet.</p>
                <div className="mt-8">
                   <MagneticButton>
                     <span className="border-b border-brand-900 pb-1 text-sm font-bold uppercase tracking-wider text-brand-900 cursor-pointer">Learn More</span>
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
      
      {/* Cinematic Footer Hook */}
      <section className="h-[80vh] bg-brand-900 rounded-t-[4rem] flex flex-col items-center justify-center relative overflow-hidden z-10 px-4">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent"></div>
        <h2 className="text-5xl md:text-8xl font-serif text-brand-50 mb-10 text-center relative z-10">Ready to Glow?</h2>
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
