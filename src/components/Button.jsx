import { motion } from "framer-motion";
import clsx from "clsx";

const variants = {
  primary: "bg-blue-600 text-white hover:bg-blue-700",
  secondary: "bg-gray-100 text-gray-800 hover:bg-gray-200",
  outline: "border border-gray-400 text-gray-800 hover:bg-gray-100",
  danger: "bg-red-600 text-white hover:bg-red-700",
};

const MotionButton = motion.button;

const Button = ({
  children,
  variant = "primary",
  className = "",
  whileTapScale = 0.95,
  ...props
}) => {
  return (
    <MotionButton
      whileTap={{ scale: whileTapScale }}
      whileHover={{ scale: 1.03 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className={clsx(
        "px-4 py-2 rounded-2xl shadow-sm font-semibold focus:outline-none focus:ring-2 focus:ring-offset-2 active:shadow-none transition-all",
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </MotionButton>
  );
};

export default Button;
