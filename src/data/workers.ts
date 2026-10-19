import type { BuildingId, PaperLook } from '../engine/types';
import { NPC_PAPER } from './dollLooks';

/** Someone who works in each building. Tap them to hear about their job, one line per tap. */
export interface Worker { name: string; job: string; look: PaperLook; lines: string[] }

const A = (look: Omit<PaperLook, 'base' | 'acc'>): PaperLook => ({ base: 'adult', acc: {}, ...look });

export const WORKERS: Partial<Record<BuildingId, Worker>> = {
  school: {
    name: 'Ms. Park', job: 'Teacher', look: A({ tone: 1, hair: 'sleekbob', hairColor: 'black', top: 'mom-blue-bow-blouse', bottom: 'mom-beige-skirt', shoes: 'mom-pink-flats' }),
    lines: [
      'Good morning, class! I’m Ms. Park, the teacher.',
      'Teachers plan lessons, read stories, and help every student learn in their own way.',
      'My favourite part? When someone says “Oh, now I get it!”',
      'Try it: seat kids at the desks, tap the chalkboard to draw, or be Teacher for a Day.',
    ],
  },
  hospital: {
    name: 'Nurse Rae', job: 'Nurse', look: A({ tone: 3, hair: 'sleekbob', hairColor: 'black', top: 'mom-pink-sweater', bottom: 'gray-trousers', shoes: 'mom-white-sneakers' }),
    lines: [
      'Hi! I’m Nurse Rae. I help doctors take care of patients.',
      'Nurses check temperatures, give medicine, and help people feel calm and safe.',
      'Washing your hands is the number one way to stop germs!',
      'Try it: drag the thermometer onto someone, or give Pip a check-up mission.',
    ],
  },
  courthouse: {
    name: 'Judge Rivera', job: 'Judge', look: NPC_PAPER.judge,
    lines: [
      'Order in the court! I’m Judge Rivera.',
      'Judges listen to both sides, look at the evidence, and decide what’s fair.',
      'Lawyers help people tell their side of the story clearly.',
      'Try it: solve the Missing Science Trophy mystery, or tap the gavel.',
    ],
  },
  engineering: {
    name: 'Max', job: 'Engineer', look: A({ tone: 2, hair: 'dadshort', hairColor: 'brown', top: 'dad-navy-hoodie', bottom: 'gray-trousers', shoes: 'mom-white-sneakers' }),
    lines: [
      'Hey, builder! I’m Max, an engineer.',
      'Engineers design bridges, buildings and machines, and test them to make them strong.',
      'If something breaks, that’s a clue! We try again and make it better.',
      'Try it: stack blocks 4 high, or build a bridge that holds 5 cars.',
    ],
  },
  'animal-hospital': {
    name: 'Dr. Lee', job: 'Vet', look: A({ tone: 0, hair: 'lowbun', hairColor: 'brown', top: 'mom-pink-cardigan', bottom: 'mom-blue-jeans', shoes: 'mom-white-sneakers' }),
    lines: [
      'Welcome! I’m Dr. Lee, the animal doctor.',
      'Vets care for pets and animals. Our patients can’t talk, so we watch and listen carefully.',
      'Gentle hands and a calm voice help nervous pets feel better.',
      'Try it: brush Clover the bunny, or give her a full check-up.',
    ],
  },
  'tech-lab': {
    name: 'Priya', job: 'Software engineer', look: A({ tone: 2, hair: 'momwaves', hairColor: 'black', top: 'mom-pink-sweater', bottom: 'mom-blue-jeans', shoes: 'mom-white-sneakers' }),
    lines: [
      'Hi, coder! I’m Priya. I write programs for computers and robots.',
      'Code is a list of steps. Computers follow them exactly, in order.',
      'When code doesn’t work, we “debug” it: find the mistake and fix it.',
      'Try it: program Bolt the robot to reach the charger.',
    ],
  },
  restaurant: {
    name: 'Chef Sunny', job: 'Chef', look: NPC_PAPER.sunny,
    lines: [
      'Welcome to Café Sunny! I’m the head chef.',
      'Chefs plan menus, cook yummy food, and keep the kitchen clean and safe.',
      'Taste as you go! That’s how chefs know a dish is just right.',
      'Try it: bake a pizza on the stove, or serve the pizza party.',
    ],
  },
};
