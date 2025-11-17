'use client';

import { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';

type TypingProps = {
  phrases: string[];
  typingSpeed?: number; // ms per char
  deleteSpeed?: number; // ms per char when deleting
  pause?: number; // pause after full word
  className?: string;
  emoji?: string;
  cursor?: string;
};

export default function Typing({
  phrases,
  typingSpeed = 60,
  deleteSpeed = 35,
  pause = 1400,
  className = '',
  emoji = '🪙',
  cursor = '|',
}: TypingProps) {
  const [index, setIndex] = useState(0);
  const [subIndex, setSubIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const reduceMotion = useReducedMotion();

  // blinking cursor
  const [showCursor, setShowCursor] = useState(true);
  useEffect(() => {
    const interval = setInterval(() => setShowCursor((v) => !v), 500);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!phrases || phrases.length === 0) return;
    const current = phrases[index];

    if (!isDeleting && subIndex === current.length) {
      // pause then delete
      const t = setTimeout(() => setIsDeleting(true), pause);
      return () => clearTimeout(t);
    }

    if (isDeleting && subIndex === 0) {
      // move to next
      setIsDeleting(false);
      setIndex((i) => (i + 1) % phrases.length);
      return;
    }

    const delay = isDeleting ? deleteSpeed : typingSpeed;
    const id = setTimeout(() => {
      setSubIndex((s) => s + (isDeleting ? -1 : 1));
    }, delay);

    return () => clearTimeout(id);
  }, [subIndex, index, isDeleting, phrases, typingSpeed, deleteSpeed, pause]);

  const text = phrases[index].slice(0, subIndex);

  const longestPhrase = useMemo(() => {
    if (!phrases || phrases.length === 0) {
      return '';
    }
    return phrases.reduce((longest, phrase) => (phrase.length > longest.length ? phrase : longest), '');
  }, [phrases]);

  const variants = {
    initial: { opacity: 0, y: 6 },
    enter: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -6 },
  };

  return (
    <span className="inline-flex items-center gap-2" aria-live="polite">
      {/* Emoji - keep this gold and separate from the text gradient */}
      <span className="text-3xl leading-none text-amber-400 drop-shadow-md" aria-hidden>
        {emoji}
      </span>

      <span className="relative inline-flex items-center">
        <span
          aria-hidden
          className="invisible pointer-events-none select-none whitespace-pre"
        >
          {longestPhrase || 'placeholder-text'}
        </span>
        <AnimatePresence mode="wait">
          <motion.span
            key={index}
            className={`absolute inset-0 inline-flex items-center ${className}`}
            initial={reduceMotion ? false : 'initial'}
            animate={reduceMotion ? false : 'enter'}
            exit={reduceMotion ? undefined : 'exit'}
            variants={reduceMotion ? undefined : variants}
            transition={{ duration: reduceMotion ? 0 : 0.32 }}
          >
            <span className="whitespace-pre">{text}</span>
            <span className="ml-1" aria-hidden>
              <span className={showCursor ? '' : 'opacity-0'}>{cursor}</span>
            </span>
          </motion.span>
        </AnimatePresence>
      </span>
    </span>
  );
}
