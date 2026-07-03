import { motion } from "framer-motion";

const pageVariants = {
  initial: { opacity: 0, y: 12, filter: "blur(8px)" },
  animate: { opacity: 1, y: 0, filter: "blur(0px)" },
  exit: { opacity: 0, y: -12, filter: "blur(8px)" },
};

const pageTransition = {
  duration: 0.42,
  ease: [0.16, 1, 0.3, 1],
};

const PageTransition = ({ children }) => (
  <motion.div
    variants={pageVariants}
    initial="initial"
    animate="animate"
    exit="exit"
    transition={pageTransition}
    style={{ minHeight: "100vh", width: "100%" }}
  >
    {children}
  </motion.div>
);

export default PageTransition;
