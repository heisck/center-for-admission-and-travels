"use client";

import { useCallback, useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";

interface Testimonial {
  name: string;
  role?: string;
  content: string;
}

interface TestimonialsCustomProps {
  testimonials: Testimonial[];
  title?: string;
  subtitle?: string;
}

export default function TestimonialsCustom({
  testimonials,
  title = "Success Stories",
  subtitle = "Hear from our satisfied clients about their transformative journeys",
}: TestimonialsCustomProps) {
  const [active, setActive] = useState(0);
  const [autoplay] = useState(false);

  const handleNext = useCallback(() => {
    setActive((prev) => (prev + 1) % testimonials.length);
  }, [testimonials.length]);

  const handlePrev = () => {
    setActive((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  const isActive = (index: number) => index === active;

  useEffect(() => {
    if (autoplay) {
      const interval = setInterval(handleNext, 5000);
      return () => clearInterval(interval);
    }
  }, [autoplay, handleNext]);

  if (!testimonials || testimonials.length === 0) return null;

  return (
    <section className="mb-42 sm:mb-30 md:mb-10 lg:mb-0">
      <div className="min-h-auto py-12">
        <div className="max-w-6xl mx-auto px-6">
          <motion.div
            className="mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-12">
              <div className="flex flex-col justify-center">
                <h2 className="text-foreground mb-4 text-3xl md:text-4xl font-semibold">{title}</h2>
                <p className="text-foreground/70 text-lg text-balance">{subtitle}</p>
              </div>

              <div className="relative flex min-h-fit flex-col items-end">
                <div className="mb-4 flex justify-center gap-2">
                  <motion.button
                    onClick={handlePrev}
                    className="group/button bg-background flex h-8 w-8 items-center justify-center rounded-full border shadow transition-all duration-200 hover:scale-110"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: 0.2 }}
                    type="button"
                  >
                    <ChevronLeft className="text-foreground h-5 w-5" />
                  </motion.button>
                  <motion.button
                    onClick={handleNext}
                    className="group/button bg-background flex h-8 w-8 items-center justify-center rounded-full border shadow transition-all duration-200 hover:scale-110"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: 0.2 }}
                    type="button"
                  >
                    <ChevronRight className="text-foreground h-5 w-5" />
                  </motion.button>
                </div>

                <div className="relative h-full w-full max-w-md">
                  <AnimatePresence>
                    {testimonials.map((t, index) => (
                      <motion.div
                        key={`${t.name}-${index}`}
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{
                          opacity: isActive(index) ? 1 : 0,
                          scale: isActive(index) ? 1 : 0.98,
                          y: isActive(index) ? 0 : 20,
                        }}
                        exit={{ opacity: 0, scale: 0.95, y: -20 }}
                        transition={{ duration: 0.35, ease: "easeInOut" }}
                        className={`absolute inset-0 min-h-fit ${isActive(index) ? "z-10" : "z-0"}`}
                      >
                        <div className="bg-background rounded-2xl border px-6 py-6 shadow transition-all duration-200">
                          <motion.p
                            key={index}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.28 }}
                            className="text-foreground mb-6 text-lg"
                          >
                            {t.content}
                          </motion.p>

                          <div className="flex flex-col">
                            <div className="text-foreground font-semibold">{t.name}</div>
                            {t.role && <span className="text-muted-foreground text-sm">{t.role}</span>}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
