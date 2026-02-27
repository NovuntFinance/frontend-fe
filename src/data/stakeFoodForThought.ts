/**
 * Food for thought statements shown on stake cards.
 * One statement per 5% progression from 0% to 200%.
 * The statement displayed is determined by the stake's current progress (floored to nearest 5%).
 */

export const STAKE_FOOD_FOR_THOUGHT: Record<number, string> = {
  0: 'Every journey begins with a single step. Your stake is that step.',
  5: 'Small progress is still progress. Keep going.',
  10: 'Consistency beats intensity. Steady gains add up.',
  15: 'Patience is not waiting; it’s how you behave while you wait.',
  20: 'You’re one-fifth of the way. Celebrate the milestone.',
  25: 'A quarter of the way there. Momentum builds from here.',
  30: 'Good habits compound. So do returns.',
  35: 'Focus on the process; the outcome will follow.',
  40: 'You’re building something real. Trust the timeline.',
  45: 'Almost halfway to the first 100%. Stay the course.',
  50: 'Halfway to 100%. You’ve proven you can stick with it.',
  55: 'The second half often feels faster. Keep the rhythm.',
  60: 'Three-fifths there. Your future self will thank you.',
  65: 'Discipline is choosing what you want most over what you want now.',
  70: 'You’re in the stretch. Small steps, big picture.',
  75: 'Three-quarters to 100%. You’re not the same person who started.',
  80: 'The last stretch to 100% takes the same effort as the first.',
  85: 'So close to 100%. Finish this leg strong.',
  90: 'One more push to 100%. You’ve got this.',
  95: 'On the doorstep of 100%. Take the last step.',
  100: 'First 100% reached. You X2ed your stake. What’s next?',
  105: 'Beyond 100%. You’re in bonus territory now.',
  110: 'Every extra percent is a vote for your future.',
  115: 'The second hundred is where discipline really shows.',
  120: 'You’re not just earning; you’re building a habit.',
  125: 'Over halfway to 200%. The system is working.',
  130: 'Consistency has brought you here. It will take you further.',
  135: 'Two-thirds to 200%. Keep the same energy.',
  140: 'Progress isn’t always linear, but it’s still progress.',
  145: 'You’re closer to 200% than you are to the start.',
  150: 'Three-quarters to 200%. The finish line is in sight.',
  155: 'Most give up before this point. You didn’t.',
  160: 'The last 40% is where the real test is.',
  165: 'Stay focused. The goal is right ahead.',
  170: 'You’ve come too far to slow down now.',
  175: 'One more quarter. Make it count.',
  180: 'So close. One push at a time.',
  185: 'The final stretch. Keep your eyes on 200%.',
  190: 'Almost there. Finish what you started.',
  195: 'One step away from 200%. Take it.',
  200: '200% achieved. You didn’t just hit a target—you built the discipline to get there.',
};

/**
 * Returns the food-for-thought statement for the given progress.
 * Progress is floored to the nearest 5% milestone (0–200).
 */
export function getFoodForThoughtForProgress(progress: number): string {
  const p = Math.max(0, Math.min(200, Number(progress)));
  const key = Math.min(Math.floor(p / 5) * 5, 200);
  return STAKE_FOOD_FOR_THOUGHT[key] ?? STAKE_FOOD_FOR_THOUGHT[200];
}
