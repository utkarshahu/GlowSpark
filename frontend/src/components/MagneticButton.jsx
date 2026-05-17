import React, { useRef, useEffect } from 'react';
import gsap from 'gsap';

const MagneticButton = ({ children, className = '', onClick }) => {
  const magneticRef = useRef(null);
  const textRef = useRef(null);

  useEffect(() => {
    const btn = magneticRef.current;
    const text = textRef.current;

    const onMouseMove = (e) => {
      const { left, top, width, height } = btn.getBoundingClientRect();
      const x = (e.clientX - left - width / 2) * 0.4; // Magnetic strength
      const y = (e.clientY - top - height / 2) * 0.4;

      gsap.to(btn, {
        x: x,
        y: y,
        duration: 1,
        ease: 'power3.out',
      });
      
      gsap.to(text, {
        x: x * 0.5,
        y: y * 0.5,
        duration: 1,
        ease: 'power3.out',
      });
    };

    const onMouseLeave = () => {
      gsap.to(btn, {
        x: 0,
        y: 0,
        duration: 1,
        ease: 'elastic.out(1, 0.3)',
      });
      
      gsap.to(text, {
        x: 0,
        y: 0,
        duration: 1,
        ease: 'elastic.out(1, 0.3)',
      });
    };

    btn.addEventListener('mousemove', onMouseMove);
    btn.addEventListener('mouseleave', onMouseLeave);

    return () => {
      btn.removeEventListener('mousemove', onMouseMove);
      btn.removeEventListener('mouseleave', onMouseLeave);
    };
  }, []);

  return (
    <button 
      ref={magneticRef}
      onClick={onClick}
      className={`relative inline-flex items-center justify-center ${className}`}
    >
      <span ref={textRef} className="block relative z-10 w-full h-full">
        {children}
      </span>
    </button>
  );
};

export default MagneticButton;
