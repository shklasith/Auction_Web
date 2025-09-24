import { useEffect, useRef, useState } from 'react';

// Custom hook for scroll animations
export const useScrollAnimation = (threshold = 0.1) => {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef();

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          // Disconnect after first intersection to avoid re-triggering
          observer.disconnect();
        }
      },
      { threshold }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [threshold]);

  return [ref, isVisible];
};

// Custom hook for staggered animations
export const useStaggeredAnimation = (delay = 100) => {
  const [animatedItems, setAnimatedItems] = useState(new Set());
  const containerRef = useRef();

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const children = Array.from(entry.target.children);
            children.forEach((child, index) => {
              setTimeout(() => {
                child.classList.add('stagger-item');
                setAnimatedItems(prev => new Set([...prev, child]));
              }, index * delay);
            });
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, [delay]);

  return containerRef;
};

// Animation utility functions
export const animationUtils = {
  // Add ripple effect to buttons
  addRippleEffect: (element, event) => {
    const ripple = document.createElement('span');
    const rect = element.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = event.clientX - rect.left - size / 2;
    const y = event.clientY - rect.top - size / 2;
    
    ripple.style.width = ripple.style.height = `${size}px`;
    ripple.style.left = `${x}px`;
    ripple.style.top = `${y}px`;
    ripple.classList.add('ripple');
    
    element.appendChild(ripple);
    
    setTimeout(() => {
      ripple.remove();
    }, 600);
  },

  // Smooth scroll to element
  scrollToElement: (elementId, offset = 0) => {
    const element = document.getElementById(elementId);
    if (element) {
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  },

  // Add shake animation
  shake: (element) => {
    element.classList.add('wobble');
    setTimeout(() => {
      element.classList.remove('wobble');
    }, 600);
  },

  // Add success pulse animation
  successPulse: (element) => {
    element.classList.add('bid-success-feedback');
    setTimeout(() => {
      element.classList.remove('bid-success-feedback');
    }, 800);
  },

  // Add error shake animation
  errorShake: (element) => {
    element.classList.add('bid-error-feedback');
    setTimeout(() => {
      element.classList.remove('bid-error-feedback');
    }, 600);
  }
};

// Loading component with enhanced animations
export const LoadingSpinner = ({ size = 'medium', text = 'Loading...' }) => {
  const sizeClasses = {
    small: 'loading-spinner-sm',
    medium: 'loading-spinner-md',
    large: 'loading-spinner-lg'
  };

  return (
    <div className="loading-container">
      <div className="loading-dots">
        <div className="loading-dot"></div>
        <div className="loading-dot"></div>
        <div className="loading-dot"></div>
      </div>
      {text && <p className="loading-text mt-3">{text}</p>}
    </div>
  );
};

// Enhanced card component with hover effects
export const AnimatedCard = ({ children, className = '', hoverEffect = 'lift', ...props }) => {
  const hoverClasses = {
    lift: 'hover-lift',
    grow: 'hover-grow',
    shadow: 'hover-shadow'
  };

  return (
    <div 
      className={`card card-enhanced ${hoverClasses[hoverEffect]} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

// Enhanced button component with ripple effect
export const AnimatedButton = ({ 
  children, 
  className = '', 
  variant = 'primary', 
  onClick, 
  disabled = false,
  ...props 
}) => {
  const handleClick = (event) => {
    if (!disabled) {
      animationUtils.addRippleEffect(event.currentTarget, event);
      if (onClick) {
        onClick(event);
      }
    }
  };

  return (
    <button
      className={`btn btn-${variant}-animated ${className}`}
      onClick={handleClick}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
};

// Notification component with slide animations
export const AnimatedNotification = ({ 
  message, 
  type = 'info', 
  duration = 5000, 
  onClose 
}) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onClose, 300);
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  return (
    <div className={`notification notification-${type} ${isVisible ? 'notification-enter-active' : 'notification-exit-active'}`}>
      <div className="notification-content">
        {message}
      </div>
      <button 
        className="notification-close"
        onClick={() => setIsVisible(false)}
      >
        ×
      </button>
    </div>
  );
};

export default {
  useScrollAnimation,
  useStaggeredAnimation,
  animationUtils,
  LoadingSpinner,
  AnimatedCard,
  AnimatedButton,
  AnimatedNotification
};
