import React, { useState, useEffect } from 'react';

const FeaturesSection = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const features = [
  {
    icon: '📿',
    title: 'Daily Divine Shlokas',
    description: 'Receive handpicked Bhagavad Gita verses every morning to inspire clarity, peace, and focus.',
  },
  {
    icon: '🧭',
    title: 'Theme-Based Chat Guidance',
    description: 'Ask questions on karma, purpose, emotions, or success — and get verse-backed answers tailored to your intent.',
  },
  {
    icon: '🎤',
    title: 'Voice Interaction',
    description: 'Speak your queries aloud and let Geeta GPT reply with spiritual guidance — hands-free and intuitive.',
  },
  {
    icon: '🔔',
    title: 'Smart Notifications',
    description: 'Stay connected with daily spiritual nudges, personalized shloka alerts, and mindfulness reminders.',
  },
];


  const nextSlide = () => {
    setCurrentSlide((prevSlide) => (prevSlide + 1) % features.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prevSlide) =>
      prevSlide === 0 ? features.length - 1 : prevSlide - 1
    );
  };

  const goToSlide = (index) => {
    setCurrentSlide(index);
  };

  useEffect(() => {
    const autoSlide = setInterval(nextSlide, 4000);
    return () => clearInterval(autoSlide);
  }, [currentSlide]); // Restart interval on slide change to pause on manual interaction

  return (
    <section className="features-section-container">
      <h2 className="section-title">Sacred Features</h2>
      <p className="section-subheading">
        Discover the wisdom of the Gita through modern technology
      </p>

      <div className="carousel-wrapper">
        {/* <button onClick={prevSlide} className="carousel-control prev">
          &larr;
        </button> */}
        <div className="carousel-inner" style={{ transform: `translateX(-${currentSlide * 100}%)` }}>
          {features.map((feature, index) => (
            <div
              key={index}
              className={`feature-card ${index === currentSlide ? 'active' : ''}`}
            >
              <div className="feature-icon">{feature.icon}</div>
              <h3 className="feature-title">{feature.title}</h3>
              <p className="feature-description">{feature.description}</p>
            </div>
          ))}
        </div>
        {/* <button onClick={nextSlide} className="carousel-control next">
          &rarr;
        </button> */}
      </div>

      <div className="carousel-dots">
        {features.map((_, index) => (
          <span
            key={index}
            className={`dot ${index === currentSlide ? 'active' : ''}`}
            onClick={() => goToSlide(index)}
          ></span>
        ))}
      </div>

      <style jsx>{`
        .features-section-container {
          background-color: #fdf5e6; /* Cream */
          padding: 4rem 1rem;
          text-align: center;
          font-family: Arial, sans-serif;
        }

        .section-title {
          color: #800000; /* Maroon */
          font-size: 2.5rem;
          margin-bottom: 1rem;
        }

        .section-subheading {
          color: #694545;
          font-size: 1.2rem;
          margin-bottom: 3rem;
          max-width: 700px;
          margin-left: auto;
          margin-right: auto;
        }

        .carousel-wrapper {
          position: relative;
          overflow: hidden;
          max-width: 900px;
          margin: 0 auto;
          border-radius: 10px;
        }

        .carousel-inner {
          display: flex;
          transition: transform 0.5s ease-in-out;
            will-change: transform;
            width: 100%;
        }

        .feature-card {
          min-width: 96%;
          box-sizing: border-box;
          background-color: #ffffff;
          border-radius: 10px;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
          padding: 2rem;
          margin: 0 1rem;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }

        .feature-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
        }

        .feature-icon {
          font-size: 3rem;
          margin-bottom: 1rem;
        }

        .feature-title {
          color: #800000; /* Maroon */
          font-size: 1.8rem;
          margin-bottom: 0.8rem;
        }

        .feature-description {
          color: #333;
          font-size: 1rem;
          line-height: 1.5;
        }

        .carousel-control {
          background-color: rgba(128, 0, 0, 0.7); /* Maroon with opacity */
          color: #fff;
          border: none;
          padding: 0.8rem 1.2rem;
          border-radius: 50%;
          cursor: pointer;
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          font-size: 1.5rem;
          z-index: 10;
          transition: background-color 0.3s ease;
        }

        .carousel-control:hover {
          background-color: #800000; /* Darker maroon on hover */
        }

        .carousel-control.prev {
          left: 1rem;
        }

        .carousel-control.next {
          right: 1rem;
        }

        .carousel-dots {
          margin-top: 2rem;
          display: flex;
          justify-content: center;
        }

        .dot {
          height: 12px;
          width: 12px;
          background-color: #ccc;
          border-radius: 50%;
          display: inline-block;
          margin: 0 0.5rem;
          cursor: pointer;
          transition: background-color 0.3s ease;
        }

        .dot.active {
          background-color: #800000; /* Maroon */
        }

        /* Mobile-first design */
        @media (max-width: 480px) {
          .section-title {
            font-size: 2rem;
          }

          .section-subheading {
            font-size: 1rem;
            margin-bottom: 2rem;
          }

          .feature-card {
            padding: 1.5rem;
            margin: 0 0.5rem;
          }

          .feature-icon {
            font-size: 2.5rem;
          }

          .feature-title {
            font-size: 1.5rem;
          }

          .feature-description {
            font-size: 0.9rem;
          }

          .carousel-control {
            padding: 0.6rem 1rem;
            font-size: 1.2rem;
          }

          .carousel-control.prev {
            left: 0.5rem;
          }

          .carousel-control.next {
            right: 0.5rem;
          }
        }
      `}</style>
    </section>
  );
};

export default FeaturesSection;