import { useEffect, useRef, useState } from 'react';

const Reveal = ({ children, className = "reveal", threshold = 0.1, delay = 0 }) => {
  const [isVisible, setIsVisible] = useState(false);
  const domRef = useRef();

  useEffect(() => {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      });
    }, { threshold });

    const { current } = domRef;
    if (current) {
        observer.observe(current);
    }

    return () => {
        if (current) {
            observer.unobserve(current);
        }
    };
  }, [threshold]);

  return (
    <div
      ref={domRef}
      className={`${className} ${isVisible ? 'visible' : ''}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
};

export default Reveal;
