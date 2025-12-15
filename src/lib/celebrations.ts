/**
 * Celebration Utilities
 * Trigger beautiful celebrations on user success moments
 */

import confetti from 'canvas-confetti';

/**
 * Standard confetti celebration
 */
export function celebrateSuccess() {
  confetti({
    particleCount: 100,
    spread: 70,
    origin: { y: 0.6 },
  });
}

/**
 * Withdrawal success - money rain
 */
export function celebrateWithdrawal() {
  const count = 200;
  const defaults = {
    origin: { y: 0.7 },
    colors: ['#10b981', '#22c55e', '#4ade80'], // Green tones
  };

  function fire(particleRatio: number, opts: confetti.Options) {
    confetti({
      ...defaults,
      ...opts,
      particleCount: Math.floor(count * particleRatio),
    });
  }

  fire(0.25, {
    spread: 26,
    startVelocity: 55,
  });

  fire(0.2, {
    spread: 60,
  });

  fire(0.35, {
    spread: 100,
    decay: 0.91,
    scalar: 0.8,
  });

  fire(0.1, {
    spread: 120,
    startVelocity: 25,
    decay: 0.92,
    scalar: 1.2,
  });

  fire(0.1, {
    spread: 120,
    startVelocity: 45,
  });
}

/**
 * Profit milestone - fireworks
 */
export function celebrateProfitMilestone() {
  const duration = 3 * 1000;
  const animationEnd = Date.now() + duration;
  const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

  function randomInRange(min: number, max: number) {
    return Math.random() * (max - min) + min;
  }

  const interval: any = setInterval(function () {
    const timeLeft = animationEnd - Date.now();

    if (timeLeft <= 0) {
      return clearInterval(interval);
    }

    const particleCount = 50 * (timeLeft / duration);

    confetti({
      ...defaults,
      particleCount,
      origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
    });
    confetti({
      ...defaults,
      particleCount,
      origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
    });
  }, 250);
}

/**
 * Rank achievement - stars
 */
export function celebrateRankAchievement() {
  const defaults = {
    spread: 360,
    ticks: 50,
    gravity: 0,
    decay: 0.94,
    startVelocity: 30,
    shapes: ['star'],
    colors: ['FFE400', 'FFBD00', 'E89400', 'FFCA6C', 'FDFFB8'],
  };

  function shoot() {
    confetti({
      ...defaults,
      particleCount: 40,
      scalar: 1.2,
      shapes: ['star'],
    });

    confetti({
      ...defaults,
      particleCount: 10,
      scalar: 0.75,
      shapes: ['circle'],
    });
  }

  setTimeout(shoot, 0);
  setTimeout(shoot, 100);
  setTimeout(shoot, 200);
}

/**
 * First stake - exciting burst
 */
export function celebrateFirstStake() {
  const end = Date.now() + 2 * 1000;
  const colors = ['#4f46e5', '#7c3aed', '#2563eb'];

  (function frame() {
    confetti({
      particleCount: 2,
      angle: 60,
      spread: 55,
      origin: { x: 0 },
      colors: colors,
    });
    confetti({
      particleCount: 2,
      angle: 120,
      spread: 55,
      origin: { x: 1 },
      colors: colors,
    });

    if (Date.now() < end) {
      requestAnimationFrame(frame);
    }
  })();
}

/**
 * Bonus received - emoji burst
 */
export function celebrateBonus() {
  const scalar = 2;
  const emoji = confetti.shapeFromText({ text: '🎁', scalar });

  confetti({
    shapes: [emoji],
    scalar,
    spread: 100,
    particleCount: 30,
    origin: { y: 0.6 },
  });

  // Follow up with regular confetti
  setTimeout(() => {
    celebrateSuccess();
  }, 300);
}

/**
 * General celebration with custom emoji
 */
export function celebrateWithEmoji(emoji: string, particleCount: number = 30) {
  const scalar = 2;
  const emojiShape = confetti.shapeFromText({ text: emoji, scalar });

  confetti({
    shapes: [emojiShape],
    scalar,
    spread: 100,
    particleCount,
    origin: { y: 0.6 },
  });
}

/**
 * Subtle success indicator
 */
export function subtleCelebration() {
  confetti({
    particleCount: 50,
    spread: 50,
    origin: { y: 0.7 },
    colors: ['#10b981', '#4ade80'],
    ticks: 100,
  });
}
