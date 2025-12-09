import React from "react";
import { motion } from "framer-motion";

const Marquee = ({ children, direction = 1 }) => {
  return (
    <div className="flex overflow-hidden relative z-0">
      <motion.div
        initial={{ x: direction > 0 ? -1000 : 0 }}
        animate={{ x: direction > 0 ? 0 : -1000 }}
        transition={{ ease: "linear", duration: 30, repeat: Infinity }}
        className="flex flex-shrink-0 gap-6 pr-6"
      >
        {children}
        {children}
      </motion.div>
    </div>
  );
};

export default Marquee;
