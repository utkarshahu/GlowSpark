import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Lenis from 'lenis';

export default function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    // Initialize Lenis smooth scroll
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      direction: 'vertical',
      gestureDirection: 'vertical',
      smooth: true,
      mouseMultiplier: 1,
      smoothTouch: false,
      touchMultiplier: 2,
      infinite: false,
    });

    window.lenis = lenis;

    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    return () => {
      lenis.destroy();
      window.lenis = null;
    };
  }, []);

  useEffect(() => {
    if (window.lenis) {
      // Scroll to top immediately on route change
      window.lenis.scrollTo(0, { immediate: true });
      // Resume scroll in case it was locked by a modal
      window.lenis.start();
      
      // Let the DOM render and compute its new height, then trigger resize
      const timeoutId = setTimeout(() => {
        if (window.lenis) {
          window.lenis.resize();
        }
      }, 100);

      return () => clearTimeout(timeoutId);
    } else {
      window.scrollTo(0, 0);
    }
  }, [pathname]);

  return null;
}
