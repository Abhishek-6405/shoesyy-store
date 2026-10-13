import { Variants, Transition } from "framer-motion";

/**
 * Standard SHOESY Motion Design Language
 * Standard easing curve: cubic-bezier(0.16, 1, 0.3, 1) - sleek athletic acceleration/deceleration
 */
export const EASING_DEFAULT = [0.16, 1, 0.3, 1] as const;
export const athleticEasing = EASING_DEFAULT;
export const EASING_SNAPPY = [0.25, 0.1, 0.25, 1] as const;

export const TRANSITION_FAST: Transition = {
  duration: 0.2,
  ease: EASING_SNAPPY,
};

export const TRANSITION_DEFAULT: Transition = {
  duration: 0.4,
  ease: EASING_DEFAULT,
};

export const TRANSITION_SLOW: Transition = {
  duration: 0.6,
  ease: EASING_DEFAULT,
};

/**
 * Fade In Up (used for page transitions, section intros, cards)
 */
export const fadeInUpVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 16,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: TRANSITION_DEFAULT,
  },
  exit: {
    opacity: 0,
    y: -10,
    transition: TRANSITION_FAST,
  },
};

/**
 * Stagger Container
 */
export const staggerContainerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.06,
      delayChildren: 0.05,
    },
  },
};

/**
 * Stagger Item
 */
export const staggerItemVariants: Variants = {
  hidden: { opacity: 0, y: 14 },
  visible: {
    opacity: 1,
    y: 0,
    transition: TRANSITION_DEFAULT,
  },
};

/**
 * Hover Micro-interactions
 */
export const buttonHoverTap = {
  whileHover: { scale: 1.02 },
  whileTap: { scale: 0.98 },
  transition: TRANSITION_FAST,
};

export const cardHoverMotion = {
  whileHover: { y: -4 },
  transition: TRANSITION_FAST,
};
