import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import gsap from 'gsap';
import MagneticButton from '../components/MagneticButton';
import Navbar from '../components/Navbar';

const NotFound = () => {
  const textRef = useRef(null);

  useEffect(() => {
    gsap.fromTo(textRef.current.children,
      { y: 50, opacity: 0, scale: 0.9 },
      { y: 0, opacity: 1, scale: 1, duration: 1, stagger: 0.2, ease: "power4.out", delay: 0.2 }
    );
  }, []);

  return (
    <div className="bg-brand-50 min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-1 flex flex-col items-center justify-center text-center px-4 relative overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 z-0 opacity-30 pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-brand-200 rounded-full mix-blend-multiply filter blur-3xl animate-blob"></div>
          <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-brand-300 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000"></div>
          <div className="absolute bottom-1/4 left-1/3 w-96 h-96 bg-brand-100 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-4000"></div>
        </div>

        <div ref={textRef} className="relative z-10">
          <h1 className="text-[12rem] md:text-[18rem] font-serif font-bold text-transparent bg-clip-text bg-gradient-to-br from-brand-900 to-brand-400 leading-none tracking-tighter">
            404
          </h1>
          <h2 className="text-3xl md:text-5xl font-serif text-brand-900 mb-6 mt-[-2rem]">
            Page Not Found
          </h2>
          <p className="text-gray-600 font-light mb-12 max-w-md mx-auto text-lg">
            The beauty you are looking for seems to have vanished. Let's get you back to the collection.
          </p>
          <MagneticButton>
            <Link to="/products" className="inline-block bg-brand-900 hover:bg-black text-white px-10 py-4 rounded-full font-medium transition-all shadow-xl hover:shadow-2xl uppercase tracking-widest text-sm">
              Return to Store
            </Link>
          </MagneticButton>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
