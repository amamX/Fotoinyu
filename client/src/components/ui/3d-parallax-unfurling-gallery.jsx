import React, {
  useRef,
  useEffect,
  useMemo,
  useState,
  useCallback,
} from "react";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";

const IMAGES = [
  "/images/gallery-1.png",
  "/images/gallery-2.png",
  "/images/gallery-3.png",
  "/images/gallery-4.png",
  "https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=800",
  "https://images.unsplash.com/photo-1530103862676-de889221291d?q=80&w=800",
  "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=800",
  "https://images.unsplash.com/photo-1523580494112-071d16944143?q=80&w=800",
  "/images/gallery-1.png",
  "/images/gallery-2.png",
  "/images/gallery-3.png",
  "/images/gallery-4.png",
];

const ImageCard = ({ src, onLoad }) => {
  return (
    <div className="w-full h-[200px] sm:h-[300px] md:h-[400px] flex-shrink-0 bg-[#111] transition-transform duration-300 hover:scale-[1.02] cursor-pointer relative will-change-transform backface-hidden preserve-3d rounded-2xl overflow-hidden border border-white/10">
      <img
        src={src}
        alt="Gallery Asset"
        loading="lazy"
        onLoad={onLoad}
        className="w-full h-full object-cover opacity-80 hover:opacity-100 transition-opacity duration-300"
      />
    </div>
  );
};

export default function ParallaxGallery() {
  const scrollWrapperRef = useRef(null);
  const containerRef = useRef(null);
  const [isReady, setIsReady] = useState(false);
  const loadedCountRef = useRef(0);

  const handleItemLoad = useCallback(() => {
    loadedCountRef.current += 1;
    if (!isReady && loadedCountRef.current >= 1) setIsReady(true);
  }, [isReady]);

  useEffect(() => {
    const t = setTimeout(() => setIsReady(true), 1200);
    return () => clearTimeout(t);
  }, []);

  const colMedia = useMemo(() => {
    const col1Base = IMAGES.filter((_, i) => i % 4 === 0);
    const col2Base = IMAGES.filter((_, i) => i % 4 === 1);
    const col3Base = IMAGES.filter((_, i) => i % 4 === 2);
    const col4Base = IMAGES.filter((_, i) => i % 4 === 3);

    return {
      col1: [...col1Base, ...col1Base, ...col1Base],
      col2: [...col2Base, ...col2Base, ...col2Base],
      col3: [...col3Base, ...col3Base, ...col3Base],
      col4: [...col4Base, ...col4Base, ...col4Base],
    };
  }, []);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 20,
    mass: 0.5,
  });

  // Banner animations
  const bannerWidth = useTransform(smoothProgress, [0, 0.5], ["90vw", "100vw"]);
  const bannerHeight = useTransform(smoothProgress, [0, 0.5], ["80vh", "100vh"]);
  const bannerRadius = useTransform(smoothProgress, [0, 0.5], ["48px", "0px"]);
  const bannerBorderWidth = useTransform(smoothProgress, [0, 0.5], ["4px", "0px"]);

  // 3D Matrix animations
  const rotateY = useTransform(smoothProgress, [0.1, 1], [-45, 0]);
  const rotateX = useTransform(smoothProgress, [0.1, 1], [25, 0]);
  const rotateZ = useTransform(smoothProgress, [0.1, 1], [15, 0]);
  const translateZ = useTransform(smoothProgress, [0.1, 1], [-800, 0]);

  // Track columns parallax animations
  const yCol1 = useTransform(smoothProgress, [0, 1], ["0%", "-30%"]);
  const yCol2 = useTransform(smoothProgress, [0, 1], ["-20%", "5%"]);
  const yCol3 = useTransform(smoothProgress, [0, 1], ["0%", "-30%"]);
  const yCol4 = useTransform(smoothProgress, [0, 1], ["-10%", "15%"]);

  return (
    <div className="w-full bg-[#050505]">
      <section
        ref={containerRef}
        className="relative w-full h-[150vh] bg-[#050505] text-white font-sans selection:bg-white selection:text-black"
      >
        <div className="sticky top-0 h-screen w-full flex justify-center items-center overflow-hidden pt-10">
          
          <div className="absolute top-10 text-center z-30 pointer-events-none opacity-80">
            <h1 className="text-3xl font-display font-bold text-white tracking-widest uppercase mt-20">Fotoinyu Gallery</h1>
            <p className="text-gray-400 mt-2">Scroll ke bawah untuk melihat keajaiban</p>
          </div>

          <motion.div
            style={{
              width: bannerWidth,
              height: bannerHeight,
              borderRadius: bannerRadius,
              borderWidth: 0,
              borderColor: "transparent",
            }}
            className="relative bg-black overflow-hidden flex items-center justify-center max-w-[1920px] mx-auto will-change-transform backface-hidden preserve-3d"
          >
            <div
              className="absolute inset-0 flex justify-center items-center pointer-events-none"
              style={{ perspective: "1000px" }}
            >
              {/* Ambient Shadow Box Masking */}
              <div className="absolute inset-0 z-20 shadow-[inset_0_100px_150px_-50px_rgba(0,0,0,1),inset_0_-100px_150px_-50px_rgba(0,0,0,1)]" />
              <div className="absolute inset-0 z-20 shadow-[inset_150px_0_150px_-50px_rgba(0,0,0,1),inset_-150px_0_150px_-50px_rgba(0,0,0,1)]" />

              {/* Parallax Image Grid Matrix */}
              <motion.div
                style={{
                  rotateX,
                  rotateY,
                  rotateZ,
                  z: translateZ,
                  transformStyle: "preserve-3d",
                }}
                className="flex gap-4 md:gap-6 justify-center items-center w-[120vw] h-[150vh] origin-center opacity-100 will-change-transform backface-hidden"
              >
                <motion.div style={{ y: yCol1 }} className="flex flex-col gap-4 md:gap-6 w-[22vw] min-w-[200px] pointer-events-auto">
                  {colMedia.col1.map((src, index) => (
                    <ImageCard key={`col1-${index}`} src={src} onLoad={handleItemLoad} />
                  ))}
                </motion.div>

                <motion.div style={{ y: yCol2 }} className="flex flex-col gap-4 md:gap-6 w-[22vw] min-w-[200px] pointer-events-auto">
                  {colMedia.col2.map((src, index) => (
                    <ImageCard key={`col2-${index}`} src={src} onLoad={handleItemLoad} />
                  ))}
                </motion.div>

                <motion.div style={{ y: yCol3 }} className="flex flex-col gap-4 md:gap-6 w-[22vw] min-w-[200px] pointer-events-auto">
                  {colMedia.col3.map((src, index) => (
                    <ImageCard key={`col3-${index}`} src={src} onLoad={handleItemLoad} />
                  ))}
                </motion.div>

                <motion.div style={{ y: yCol4 }} className="flex flex-col gap-4 md:gap-6 w-[22vw] min-w-[200px] pointer-events-auto">
                  {colMedia.col4.map((src, index) => (
                    <ImageCard key={`col4-${index}`} src={src} onLoad={handleItemLoad} />
                  ))}
                </motion.div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
