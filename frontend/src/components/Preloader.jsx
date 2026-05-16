import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';

const Preloader = ({ onComplete }) => {
  const containerRef = useRef(null);
  const textRef = useRef(null);
  const percentRef = useRef(null);
  const loaderBgRef = useRef(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    document.body.style.overflow = 'hidden';

    const tl = gsap.timeline();

    // Cinematic staggering text entrance
    const textChars = textRef.current.innerText.split('');
    textRef.current.innerHTML = '';
    textChars.forEach((char) => {
      const span = document.createElement('span');
      span.innerText = char === ' ' ? '\u00A0' : char;
      span.style.opacity = '0';
      span.style.display = 'inline-block';
      span.style.transform = 'translateY(20px)';
      textRef.current.appendChild(span);
    });

    tl.to(textRef.current.children, {
      opacity: 1,
      y: 0,
      duration: 0.8,
      stagger: 0.05,
      ease: "power3.out"
    });

    let currentProgress = 0;
    const interval = setInterval(() => {
      currentProgress += Math.floor(Math.random() * 10) + 2;
      if (currentProgress > 100) currentProgress = 100;
      setProgress(currentProgress);

      if (currentProgress === 100) {
        clearInterval(interval);
        
        // Outro cinematic exit
        tl.to(textRef.current.children, {
          opacity: 0,
          y: -20,
          duration: 0.5,
          stagger: 0.02,
          ease: "power3.in"
        }, "+=0.5")
        .to(percentRef.current, {
          opacity: 0,
          scale: 0.8,
          duration: 0.5,
          ease: "power3.in"
        }, "-=0.5")
        .to(loaderBgRef.current, {
          height: 0,
          duration: 1.2,
          ease: "power4.inOut"
        })
        .to(containerRef.current, {
          opacity: 0,
          duration: 0.5,
          onComplete: () => {
            document.body.style.overflow = '';
            onComplete();
          }
        }, "-=0.5");
      }
    }, 100);

    return () => {
      clearInterval(interval);
      document.body.style.overflow = '';
    };
  }, [onComplete]);

  return (
    <div 
      ref={containerRef}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-transparent pointer-events-none"
    >
      <div 
        ref={loaderBgRef}
        className="absolute bottom-0 left-0 w-full bg-brand-900 pointer-events-auto origin-bottom"
        style={{ height: '100vh' }}
      ></div>
      
      <div className="relative z-10 flex flex-col items-center justify-center pointer-events-auto">
        <h1 
          ref={textRef}
          className="text-4xl md:text-6xl font-serif font-bold tracking-widest text-brand-100 uppercase mb-8 overflow-hidden"
        >
          Glow Spark
        </h1>
        <div 
          ref={percentRef} 
          className="text-5xl md:text-8xl font-light font-sans tracking-tight text-brand-300 flex items-end gap-2"
        >
          {progress}<span className="text-2xl md:text-4xl mb-2 md:mb-4 opacity-50">%</span>
        </div>
      </div>
    </div>
  );
};

export default Preloader;
