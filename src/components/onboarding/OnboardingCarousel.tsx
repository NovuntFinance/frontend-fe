'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';

import {
  BsGiftFill,
  BsPeopleFill,
  BsBuildingFill,
  BsTrophyFill,
} from 'react-icons/bs';
import styles from '@/styles/onboarding.module.css';
import { MdOutlineSavings, MdWorkspacePremium } from 'react-icons/md';
import { LiaNetworkWiredSolid } from 'react-icons/lia';
import { SiWegame } from 'react-icons/si';

/* ── Slide data ────────────────────────────────────────────── */
interface SlideData {
  id: string;
  icon: React.ReactNode;
  title: string;
  subtitle: string;
}

const ICON_STYLE = { color: '#009BF2', fontSize: '5rem' };

const slides: SlideData[] = [
  {
    id: 'welcome',
    icon: (
      <Image
        src="/icons/novunt_short.png"
        alt="Novunt"
        width={80}
        height={80}
        style={{
          objectFit: 'contain',
          filter:
            'brightness(0) saturate(100%) invert(44%) sepia(69%) saturate(2688%) hue-rotate(183deg) brightness(99%) contrast(101%)',
        }}
      />
    ),
    title: 'NOVUNT',
    subtitle: 'Stake. Earn. Grow - Together.',
  },
  {
    id: 'return',
    icon: <MdOutlineSavings style={ICON_STYLE} />,
    title: '200% ROS',
    subtitle: 'Earn 200% returns on staked assets.',
  },
  {
    id: 'bonus',
    icon: <BsGiftFill style={ICON_STYLE} />,
    title: '10% Welcome Bonus',
    subtitle: 'When you complete your account setup.',
  },
  {
    id: 'team',
    icon: <LiaNetworkWiredSolid style={ICON_STYLE} />,
    title: 'Team Earnings',
    subtitle: "Earn commissions from your team's activity.",
  },
  {
    id: 'pool',
    icon: <MdWorkspacePremium style={ICON_STYLE} />,
    title: 'Pool Rewards',
    subtitle: 'Access exclusive reward pools.',
  },
  {
    id: 'nxp',
    icon: <SiWegame style={ICON_STYLE} />,
    title: 'Novunt Xperience Points',
    subtitle: 'Track your progress and earn NLP Airdrops.',
  },
];

/* ── Carousel component ────────────────────────────────────── */

interface OnboardingCarouselProps {
  onGetStarted: () => void;
}

export default function OnboardingCarousel({
  onGetStarted,
}: OnboardingCarouselProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isPressed, setIsPressed] = useState(false);

  const activeSlide = slides[currentSlide];

  const nextSlide = () => {
    if (isAnimating) return;
    if (currentSlide < slides.length - 1) {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentSlide((prev) => prev + 1);
        setIsAnimating(false);
      }, 300);
    } else {
      onGetStarted();
    }
  };

  const goToSlide = (idx: number) => {
    if (idx !== currentSlide && !isAnimating) {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentSlide(idx);
        setIsAnimating(false);
      }, 300);
    }
  };

  // Swipe handling
  const pointerStartX = useRef<number | null>(null);

  const handlePointerDown = (e: React.PointerEvent) => {
    pointerStartX.current = e.clientX;
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (pointerStartX.current === null) return;
    const diff = e.clientX - pointerStartX.current;
    const threshold = 50;

    if (Math.abs(diff) > threshold && !isAnimating) {
      setIsAnimating(true);
      if (diff < 0 && currentSlide < slides.length - 1) {
        setTimeout(() => {
          setCurrentSlide((prev) => prev + 1);
          setIsAnimating(false);
        }, 300);
      } else if (diff > 0 && currentSlide > 0) {
        setTimeout(() => {
          setCurrentSlide((prev) => prev - 1);
          setIsAnimating(false);
        }, 300);
      } else {
        setIsAnimating(false);
      }
    }
    pointerStartX.current = null;
  };

  const isLastSlide = currentSlide === slides.length - 1;

  return (
    <div
      className={`${styles.neuBase} relative flex min-h-[100dvh] flex-col items-center justify-between overflow-hidden px-6 py-10`}
    >
      {/* Subtle ambient glow */}
      <div
        className={`${styles.ambientGlow} pointer-events-none absolute top-[-30%] left-1/2 h-[500px] w-[500px] -translate-x-1/2 rounded-full opacity-[0.05] blur-[160px] transition-all duration-1000`}
      />

      {/* ── Main Content ── */}
      <div
        className="z-10 flex w-full max-w-md grow flex-col items-center justify-center gap-10"
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
      >
        {/* Raised Icon Container */}
        <div
          className={` ${styles.neuCardRaised} flex h-56 w-56 items-center justify-center rounded-[2.5rem] ${styles.neuFloat} transition-all duration-500 ${isAnimating ? 'scale-90 opacity-0' : 'scale-100 opacity-100'} `}
        >
          {/* Inset Icon Socket */}
          <div
            className={`${styles.neuSocket} flex h-36 w-36 items-center justify-center rounded-full transition-shadow duration-700`}
          >
            {activeSlide.icon}
          </div>
        </div>

        {/* Text */}
        <div
          className={`flex flex-col gap-3 text-center transition-all delay-75 duration-500 ${isAnimating ? 'translate-y-5 opacity-0' : 'translate-y-0 opacity-100'} `}
        >
          <h1
            className="text-3xl font-semibold tracking-tight"
            style={{ color: 'var(--neu-text)' }}
          >
            {activeSlide.title}
          </h1>
          <p
            className="mx-auto max-w-xs text-base leading-relaxed"
            style={{ color: 'var(--neu-text-secondary)' }}
          >
            {activeSlide.subtitle}
          </p>
        </div>
      </div>

      {/* ── Footer ── */}
      <div className="z-20 flex w-full max-w-md flex-col gap-7">
        {/* Neumorphic Indicator Track */}
        <div className="flex justify-center">
          <div
            className={`${styles.neuTrack} flex items-center gap-3 rounded-full px-5 py-2.5`}
          >
            {slides.map((slide, idx) => (
              <button
                key={slide.id}
                onClick={() => goToSlide(idx)}
                className={`cursor-pointer rounded-full border-0 p-0 transition-all duration-500 ${
                  currentSlide === idx
                    ? `h-2.5 w-8 ${styles.neuDotActive}`
                    : `h-2.5 w-2.5 ${styles.neuDot} hover:scale-110`
                } `}
                style={
                  currentSlide === idx
                    ? { backgroundColor: '#009BF2' }
                    : undefined
                }
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>
        </div>

        {/* CTA Button */}
        <button
          onClick={nextSlide}
          onMouseDown={() => setIsPressed(true)}
          onMouseUp={() => setIsPressed(false)}
          onMouseLeave={() => setIsPressed(false)}
          onTouchStart={() => setIsPressed(true)}
          onTouchEnd={() => setIsPressed(false)}
          className={`flex w-full cursor-pointer items-center justify-center rounded-xl py-5 transition-all duration-150 ${isPressed ? styles.neuBtnActive : styles.neuBtn} `}
          id="onboarding-get-started"
        >
          <span className="text-sm font-black tracking-[0.25em] uppercase">
            {isLastSlide ? 'Get Started' : 'Continue'}
          </span>
        </button>

        {/* Login Link */}
        <p className="pb-2 text-center">
          <span className="text-sm" style={{ color: 'var(--neu-text-muted)' }}>
            Already have an account?{' '}
          </span>
          <Link href="/login" className={styles.loginLink}>
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}
