import { useEffect, useState } from "react";
import { getStyles } from "./utils/styleExport";
import { FaCircleChevronUp } from "react-icons/fa6";
const top=new Audio('/top.mp3');
const ScrollToTop = ({ theme = "light"}) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.scrollY > 400) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener("scroll", toggleVisibility);
    return () => window.removeEventListener("scroll", toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const { scrollToTopStyle,upstyle } = getStyles(theme);

  return (
    <button
      style={{
        ...scrollToTopStyle,
        opacity: isVisible ? 1 : 0,
        pointerEvents: isVisible ? "auto" : "none",
        bottom: isVisible ? "0.7in" : "auto",
      }}
      onClick={() => {
        top.play();
        scrollToTop();
      }}
    >
      <FaCircleChevronUp style={upstyle} />


    </button>
  );
};

export default ScrollToTop;
