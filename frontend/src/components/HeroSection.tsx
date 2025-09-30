import { useEffect, useState } from "react";
import hero1 from '../assets/Hero-1.jpg';
import hero2 from '../assets/Hero-2.jpg';
import hero3 from '../assets/Hero-3.jpg';

const HeroSection = () => {
  const slides = [hero1, hero2, hero3];
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % slides.length);
    }, 5000);
    return () => clearInterval(id);
  }, [slides.length]);

  return (
    <section className="relative bg-gray-900">
      <div className="relative h-[60vh] md:h-[80vh] max-h-[750px] overflow-hidden">
        <div
          className="absolute inset-0 flex transition-transform duration-700 ease-in-out"
          style={{ transform: `translateX(-${index * 100}%)`, willChange: 'transform' }}
        >
          {slides.map((src, i) => (
            <div key={src} className="relative w-full flex-shrink-0">
              <img
                src={src}
                alt={`Slide ${i + 1}`}
                className="w-full h-full object-cover"
              />
            </div>
          ))}
        </div>
      </div>
      <div className="absolute z-10 bottom-6 left-0 right-0">
        <div className="container mx-auto px-4">
          <div className="flex justify-center space-x-2">
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => setIndex(i)}
                aria-label={`Ir para o slide ${i + 1}`}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  index === i ? 'w-10 bg-white' : 'w-8 bg-white/50 hover:bg-white/75'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;