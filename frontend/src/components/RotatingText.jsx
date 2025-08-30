'use client';

import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useState,
} from 'react';
import { motion } from 'framer-motion';

function cn(...classes) {
  return classes.filter(Boolean).join(' ');
}

const RotatingText = forwardRef((props, ref) => {
  const {
    texts,
    transition = { type: 'spring', damping: 25, stiffness: 300 },
    initial = { y: '100%', opacity: 0 },
    animate = { y: 0, opacity: 1 },
    staggerDuration = 0,
    staggerFrom = 'first',
    loop = true,
    auto = true,
    splitBy = 'characters',
    rotationInterval = 2000,
    onNext,
    mainClassName,
    splitLevelClassName,
    elementLevelClassName,
    ...rest
  } = props;

  const [currentTextIndex, setCurrentTextIndex] = useState(0);

  const splitIntoCharacters = (text) => {
    if (typeof Intl !== 'undefined' && Intl.Segmenter) {
      const segmenter = new Intl.Segmenter('en', { granularity: 'grapheme' });
      return Array.from(segmenter.segment(text), (segment) => segment.segment);
    }
    return Array.from(text);
  };

  const elements = useMemo(() => {
    const currentText = texts[currentTextIndex];
    if (splitBy === 'characters') {
      const words = currentText.split(' ');
      return words.map((word, i) => ({
        characters: splitIntoCharacters(word),
        needsSpace: i !== words.length - 1,
      }));
    }
    return currentText.split(' ').map((word, i, arr) => ({
      characters: [word],
      needsSpace: i !== arr.length - 1,
    }));
  }, [texts, currentTextIndex, splitBy]);

  const getStaggerDelay = useCallback(
    (index, totalChars) => {
      const total = totalChars;
      if (staggerFrom === 'first') return index * staggerDuration;
      if (staggerFrom === 'last') return (total - 1 - index) * staggerDuration;
      if (staggerFrom === 'center') {
        const center = Math.floor(total / 2);
        return Math.abs(center - index) * staggerDuration;
      }
      return index * staggerDuration;
    },
    [staggerFrom, staggerDuration]
  );

  const next = useCallback(() => {
    const nextIndex =
      currentTextIndex === texts.length - 1
        ? loop
          ? 0
          : currentTextIndex
        : currentTextIndex + 1;
    if (nextIndex !== currentTextIndex) {
      setCurrentTextIndex(nextIndex);
      if (onNext) onNext(nextIndex);
    }
  }, [currentTextIndex, texts.length, loop, onNext]);

  useEffect(() => {
    if (!auto) return;
    const interval = setInterval(next, rotationInterval);
    return () => clearInterval(interval);
  }, [auto, next, rotationInterval]);

  return (
    <motion.span
      className={cn('flex flex-wrap whitespace-pre-wrap', mainClassName)}
      {...rest}
    >
      <span className="sr-only">{texts[currentTextIndex]}</span>
      <motion.div
        key={currentTextIndex}
        className="flex flex-wrap"
        initial={initial}
        animate={animate}
        transition={transition}
      >
        {elements.map((wordObj, wordIndex, array) => {
          const previousCharsCount = array
            .slice(0, wordIndex)
            .reduce((sum, word) => sum + word.characters.length, 0);
          return (
            <span
              key={wordIndex}
              className={cn('inline-flex', splitLevelClassName)}
            >
              {wordObj.characters.map((char, charIndex) => (
                <motion.span
                  key={charIndex}
                  initial={initial}
                  animate={animate}
                  transition={{
                    ...transition,
                    delay: getStaggerDelay(
                      previousCharsCount + charIndex,
                      array.reduce(
                        (sum, word) => sum + word.characters.length,
                        0
                      )
                    ),
                  }}
                  className={cn('inline-block', elementLevelClassName)}
                >
                  {char}
                </motion.span>
              ))}
              {wordObj.needsSpace && <span className="whitespace-pre"> </span>}
            </span>
          );
        })}
      </motion.div>
    </motion.span>
  );
});

RotatingText.displayName = 'RotatingText';
export default RotatingText;