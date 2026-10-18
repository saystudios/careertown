import type { SfxName } from '../engine/sfx';
import { ACCESSORIES, TOY_IDS } from './accessories';
import { KPOP_PROPS } from './kpopProps';
import pCouch from '../assets/furniture/couch.webp';
import pArmchair from '../assets/furniture/armchair.webp';
import pTv from '../assets/furniture/tv.webp';
import pLamp from '../assets/furniture/lamp.webp';
import pBookshelf from '../assets/furniture/bookshelf.webp';
import pDoor from '../assets/furniture/door.webp';
import pRug from '../assets/furniture/rug.webp';
import pPlant from '../assets/furniture/plant.webp';
import pBed from '../assets/furniture/bed.webp';
import pCloset from '../assets/furniture/closet.webp';
import pToybox from '../assets/furniture/toybox.webp';
import pDoorPink from '../assets/furniture/door-pink.webp';
import pStudyDesk from '../assets/furniture/studydesk.webp';
import pLampPink from '../assets/furniture/lamp-pink.webp';
import pBathtub from '../assets/furniture/bathtub.webp';
import pToiletW from '../assets/furniture/toilet-white.webp';
import pBathSink from '../assets/furniture/bath-sink.webp';
import pBathMirror from '../assets/furniture/bath-mirror.webp';
import pDoorWhite from '../assets/furniture/door-white.webp';
import pBathmat from '../assets/furniture/bathmat.webp';
import pTowel from '../assets/furniture/towel-rack.webp';
import pBasket from '../assets/furniture/laundry-basket.webp';
import pBathShelf from '../assets/furniture/bath-shelf.webp';
import pBathCart from '../assets/furniture/bath-cart.webp';
import pTrash from '../assets/furniture/trash-can.webp';
import pStool from '../assets/furniture/step-stool.webp';

// Tags drive the interaction engine (engine/interactions.ts).
export type ItemTag =
  | 'food' | 'cookable' | 'washable' | 'small' | 'toy' | 'tool' | 'medical'
  | 'seat' | 'bed' | 'table' | 'stove' | 'sink' | 'door' | 'behind'
  | 'block' | 'floor' | 'shower' | 'petfood' | 'brush' | 'decor' | 'groom' | 'wall' | 'float';

export type TapAction =
  | { type: 'toggle'; sfx?: SfxName }
  | { type: 'spawn'; items: string[]; toggle?: boolean }
  | { type: 'wardrobe' }
  | { type: 'custom'; id: string }
  | { type: 'anim'; anim: string; sfx?: SfxName; bubble?: string[] }
  | { type: 'secret'; secretId: string; taps: number; anim?: string; sfx?: SfxName }
  | { type: 'roll'; bubble?: string[]; sfx?: SfxName }
  | { type: 'pop' };

export interface ItemDef {
  id: string;
  name: string;
  w: number;            // room units
  h: number;
  emoji?: string;       // small props are drawn as emoji stickers
  img?: string;         // hand-drawn sticker art
  wear?: import('./accessories').WearSlot; // characters with layered art can wear it
  art?: string;         // big furniture is drawn as SVG (components/art/Furniture.tsx)
  paint?: string;       // painted furniture picture (used instead of the SVG art)
  tags: ItemTag[];
  fixed?: boolean;      // can't be dragged, only tapped
  tap?: TapAction;
  cooksInto?: string;
  medical?: 'thermometer' | 'stethoscope' | 'bandage';
  seatLift?: number;    // how far above the item's base a sitter's feet go
  front?: number;       // painted art: from this fraction down, the front is drawn over whoever is inside (bathtub)
}

const food = (id: string, name: string, emoji: string, extra: Partial<ItemDef> = {}): ItemDef => ({
  id, name, emoji, w: 62, h: 62, tags: ['food', 'small', 'washable'], ...extra,
});
const prop = (id: string, name: string, emoji: string, tags: ItemTag[], extra: Partial<ItemDef> = {}): ItemDef => ({
  id, name, emoji, w: 70, h: 70, tags: ['small', ...tags], ...extra,
});
/** A box you tap to take things out of (only real item ids are kept). */
const box = (id: string, name: string, emoji: string, items: string[]): ItemDef => ({
  id, name, emoji, w: 100, h: 100, tags: ['decor'], tap: { type: 'spawn', toggle: false, items },
});

export const ITEMS: Record<string, ItemDef> = Object.fromEntries(
  ([
    // ── Food ──────────────────────────────────────────
    food('apple', 'Apple', '🍎'),
    food('banana', 'Banana', '🍌'),
    food('carrot', 'Carrot', '🥕'),
    food('broccoli', 'Broccoli', '🥦'),
    food('cheese', 'Cheese', '🧀', { tags: ['food', 'small'] }),
    food('milk', 'Milk', '🥛', { tags: ['food', 'small'] }),
    food('egg', 'Egg', '🥚', { tags: ['food', 'small', 'cookable'], cooksInto: 'friedegg' }),
    food('friedegg', 'Fried egg', '🍳', { tags: ['food', 'small'] }),
    food('corn', 'Corn', '🌽', { tags: ['food', 'small', 'cookable', 'washable'], cooksInto: 'popcorn' }),
    food('popcorn', 'Popcorn', '🍿', { tags: ['food', 'small'] }),
    food('batter', 'Pancake mix', '🥣', { tags: ['food', 'small', 'cookable'], cooksInto: 'pancakes' }),
    food('pancakes', 'Pancakes', '🥞', { tags: ['food', 'small'] }),
    food('cupcake', 'Cupcake', '🧁', { tags: ['food', 'small'] }),
    food('juice', 'Juice box', '🧃', { tags: ['food', 'small'] }),
    food('cookie', 'Golden cookie', '🍪', { tags: ['food', 'small'] }),
    food('dough', 'Pizza dough', '🫓', { tags: ['food', 'small', 'cookable'], cooksInto: 'pizza' }),
    food('pizza', 'Pizza', '🍕', { tags: ['food', 'small'] }),
    food('tomato', 'Tomato', '🍅'),
    food('pepper', 'Pepper', '🫑'),
    food('mushroom', 'Mushroom', '🍄'),
    { id: 'petfood', name: 'Pet food', emoji: '🦴', w: 60, h: 60, tags: ['petfood', 'small'] },

    // ── Small props ───────────────────────────────────
    prop('plate', 'Plate', '🍽️', ['washable']),
    prop('cup', 'Cup', '☕', ['washable']),
    prop('toothbrush', 'Toothbrush', '🪥', ['brush']),
    prop('backpack', 'Backpack', '🎒', ['tool']),
    prop('book', 'Book', '📘', ['toy']),
    prop('teddy', 'Teddy bear', '🧸', ['toy'], { tap: { type: 'anim', anim: 'hop', sfx: 'pop', bubble: ['Hug me!', 'I love you!', 'Squishy!'] } }),
    prop('ball', 'Ball', '⚽', ['toy'], { tap: { type: 'roll', sfx: 'pop' } }),
    prop('yarn', 'Yarn ball', '🧶', ['toy']),
    prop('train', 'Toy train', '🚂', ['toy'], { tap: { type: 'roll', sfx: 'ring', bubble: ['Choo choo!', 'All aboard!'] } }),
    prop('paints', 'Paint set', '🎨', ['toy']),
    prop('duck', 'Rubber duck', '🦆', ['toy'], { tap: { type: 'anim', anim: 'shake', sfx: 'beep', bubble: ['Squeak!', 'Quack quack!'] } }),
    prop('balloon', 'Balloon', '🎈', ['toy', 'float'], { tap: { type: 'pop' } }),
    prop('drum', 'Drum', '🥁', ['toy'], { tap: { type: 'anim', anim: 'shake', sfx: 'bang', bubble: ['Boom boom!', 'Ba-dum tss!'] } }),
    prop('soap', 'Soap', '🧼', ['tool']),
    prop('clock', 'Alarm clock', '⏰', ['tool'], { tap: { type: 'anim', anim: 'shake', sfx: 'ring', bubble: ['Rise and shine!'] } }),
    prop('globe', 'Globe', '🌍', ['toy'], { tap: { type: 'anim', anim: 'spin', sfx: 'whoosh' } }),
    prop('bell', 'School bell', '🔔', ['tool'], { tap: { type: 'anim', anim: 'shake', sfx: 'ring', bubble: ['Class is starting!'] } }),
    prop('pencil', 'Pencils', '✏️', ['tool']),
    prop('ruler', 'Ruler', '📐', ['tool']),
    prop('thermometer', 'Thermometer', '🌡️', ['tool', 'medical'], { medical: 'thermometer' }),
    prop('stethoscope', 'Stethoscope', '🩺', ['tool', 'medical'], { medical: 'stethoscope' }),
    prop('bandage', 'Bandage', '🩹', ['tool', 'medical'], { medical: 'bandage' }),
    prop('gavel', 'Gavel', '🔨', ['tool'], { tap: { type: 'secret', secretId: 'gavel', taps: 5, anim: 'bang', sfx: 'bang' } }),
    prop('magnifier', 'Magnifying glass', '🔍', ['tool']),
    prop('folder', 'Case file', '📁', ['tool']),
    prop('scroll', 'Evidence note', '📜', ['tool']),
    prop('wrench', 'Wrench', '🔧', ['tool']),
    prop('gear', 'Gear', '⚙️', ['tool']),
    prop('toolbox', 'Toolbox', '🧰', ['tool']),
    prop('cookiejar', 'Cookie jar', '🫙', ['tool'], { fixed: true, tap: { type: 'secret', secretId: 'cookiejar', taps: 3, anim: 'shake', sfx: 'pop' } }),

    // ── Animal hospital & tech lab props ──────────────
    prop('petbrush', 'Pet brush', '🪮', ['tool', 'groom']),
    prop('keyboard', 'Keyboard', '⌨️', ['tool']),
    prop('headset', 'Headphones', '🎧', ['tool']),
    prop('floppy', 'Save disk', '💾', ['toy']),
    prop('minibot', 'Mini robot', '🤖', ['toy', 'decor'], { tap: { type: 'anim', anim: 'dance', sfx: 'beep', bubble: ['Beep boop!', 'Forward, turn, repeat!'] } }),


    // ── More things for every room (Oct 2026) ─────────
    food('strawberry', 'Strawberry', '🍓'),
    food('grapes', 'Grapes', '🍇'),
    food('watermelon', 'Watermelon', '🍉'),
    food('bread', 'Bread', '🍞', { tags: ['food', 'small'] }),
    food('potato', 'Potato', '🥔', { tags: ['food', 'small', 'cookable', 'washable'], cooksInto: 'fries' }),
    food('fries', 'Fries', '🍟', { tags: ['food', 'small'] }),
    food('icecream', 'Ice cream', '🍦', { tags: ['food', 'small'] }),
    food('donut', 'Donut', '🍩', { tags: ['food', 'small'] }),
    food('lollipop', 'Lollipop', '🍭', { tags: ['food', 'small'] }),
    food('pineapple', 'Pineapple', '🍍'),
    food('olive', 'Olives', '🫒'),
    food('onion', 'Onion', '🧅'),
    { id: 'hay', name: 'Hay', emoji: '🌾', w: 60, h: 60, tags: ['petfood', 'small'] },
    prop('kettle', 'Kettle', '🫖', ['tool'], { tap: { type: 'anim', anim: 'shake', sfx: 'ring', bubble: ['Wheeee! The water is hot.', 'Tea time!'] } }),
    prop('spoon', 'Spoon', '🥄', ['washable']),
    prop('salt', 'Salt', '🧂', ['tool'], { tap: { type: 'anim', anim: 'shake', sfx: 'tick', bubble: ['Just a pinch!'] } }),
    prop('guitar', 'Guitar', '🎸', ['toy'], { tap: { type: 'anim', anim: 'shake', sfx: 'sparkle', bubble: ['Strum strum! 🎶', 'La la la!'] } }),
    prop('piggybank', 'Piggy bank', '🐷', ['toy', 'decor'], { tap: { type: 'anim', anim: 'shake', sfx: 'coin', bubble: ['Oink! Saving up!', 'Clink clink!'] } }),
    prop('dino', 'Toy dino', '🦖', ['toy'], { tap: { type: 'anim', anim: 'hop', sfx: 'bang', bubble: ['RAWR!', 'Stomp stomp!'] } }),
    prop('kite', 'Kite', '🪁', ['toy', 'float']),
    prop('puzzle', 'Puzzle', '🧩', ['toy']),
    prop('rocket', 'Toy rocket', '🚀', ['toy'], { tap: { type: 'anim', anim: 'hop', sfx: 'whoosh', bubble: ['3, 2, 1… blast off!'] } }),
    prop('unicorn', 'Unicorn plush', '🦄', ['toy'], { tap: { type: 'anim', anim: 'hop', sfx: 'sparkle', bubble: ['Sparkle magic!', 'Neigh!'] } }),
    prop('gamepad', 'Game controller', '🎮', ['toy'], { tap: { type: 'anim', anim: 'shake', sfx: 'beep', bubble: ['Level up!', 'Player two, ready?'] } }),
    prop('books', 'Stack of books', '📚', ['toy']),
    prop('photo', 'Family photo', '🖼️', ['decor', 'wall'], { tap: { type: 'anim', anim: 'shine', sfx: 'sparkle', bubble: ['Say cheese!', 'What a happy day!'] } }),
    prop('shampoo', 'Shampoo', '🧴', ['tool']),
    prop('sponge', 'Sponge', '🧽', ['tool']),
    prop('bubbles', 'Bubbles', '🫧', ['toy', 'float'], { tap: { type: 'pop' } }),
    prop('crayons', 'Crayons', '🖍️', ['tool']),
    prop('abacus', 'Abacus', '🧮', ['tool'], { tap: { type: 'anim', anim: 'shake', sfx: 'tick', bubble: ['1, 2, 3… counting is fun!'] } }),
    prop('microscope', 'Microscope', '🔬', ['tool'], { tap: { type: 'anim', anim: 'shine', sfx: 'sparkle', bubble: ['Tiny things look HUGE!', 'Scientists look closely.'] } }),
    prop('scissors', 'Safety scissors', '✂️', ['tool']),
    prop('clipboard', 'Clipboard', '📋', ['tool']),
    prop('icepack', 'Ice pack', '🧊', ['tool'], { tap: { type: 'anim', anim: 'shake', sfx: 'tick', bubble: ['Brrr! Cold helps bumps feel better.'] } }),
    prop('xray', 'X-ray', '🩻', ['decor', 'wall'], { tap: { type: 'anim', anim: 'shine', sfx: 'click', bubble: ['X-rays show the bones inside you!', 'Grown-ups have 206 bones.'] } }),
    prop('camera', 'Camera', '📷', ['tool'], { tap: { type: 'anim', anim: 'shine', sfx: 'click', bubble: ['Click! Photo evidence.'] } }),
    prop('notebook', 'Notebook', '📓', ['tool']),
    prop('footprints', 'Footprints', '👣', ['tool'], { tap: { type: 'anim', anim: 'shine', sfx: 'click', bubble: ['Muddy footprints… a clue!'] } }),
    prop('key', 'Key', '🔑', ['tool']),
    prop('tennisball', 'Tennis ball', '🎾', ['toy'], { tap: { type: 'roll', sfx: 'pop' } }),
    prop('mousetoy', 'Squeaky mouse', '🐭', ['toy'], { tap: { type: 'anim', anim: 'shake', sfx: 'beep', bubble: ['Squeak!'] } }),
    prop('orderbell', 'Order bell', '🛎️', ['tool'], { tap: { type: 'anim', anim: 'shake', sfx: 'ring', bubble: ['Order up!', 'Ding ding!'] } }),
    prop('laptop', 'Laptop', '💻', ['tool'], { tap: { type: 'anim', anim: 'shine', sfx: 'beep', bubble: ['Booting up…', 'Hello, world!'] } }),
    prop('joystick', 'Joystick', '🕹️', ['toy'], { tap: { type: 'anim', anim: 'shake', sfx: 'beep', bubble: ['Up, up, down, down!'] } }),
    prop('battery', 'Battery', '🔋', ['tool']),
    prop('magnet', 'Magnet', '🧲', ['tool'], { tap: { type: 'anim', anim: 'shake', sfx: 'click', bubble: ['Magnets pull metal things close!'] } }),
    prop('screwdriver', 'Screwdriver', '🪛', ['tool']),
    prop('bolts', 'Nuts and bolts', '🔩', ['tool']),
    prop('ladder', 'Ladder', '🪜', ['tool'], { w: 90, h: 130 }),


    // ── Outdoor places and shops (free play, Oct 2026) ─
    ...([
      ['tree', 'Tree', '🌳', 220], ['pine', 'Pine tree', '🌲', 240], ['palm', 'Palm tree', '🌴', 240], ['fountain', 'Fountain', '⛲', 200],
      ['umbrella', 'Beach umbrella', '⛱️', 200], ['tent', 'Tent', '⛺', 190], ['sandcastle', 'Sandcastle', '🏰', 130], ['rock', 'Rock', '🪨', 110],
      ['safe', 'Bank safe', '🔐', 150], ['dress', 'Dress', '👗', 150], ['tshirt', 'T-shirt', '👕', 140], ['handbag', 'Handbag', '👜', 130],
    ] as [string, string, string, number][]).map(([id, name, emoji, h]): ItemDef => ({ id, name, emoji, w: h, h, tags: ['decor'],
      tap: { type: 'anim', anim: 'shake', sfx: 'whoosh', bubble: ({ tree: ['Rustle rustle!', 'Birds live up here.'], pine: ['Smells like the forest!'], palm: ['Coconuts!'], fountain: ['Splish splash!', 'Make a wish!'],
        umbrella: ['Nice and shady!'], tent: ['Camping time!', 'Cozy in here!'], sandcastle: ['A castle for crabs!'], rock: ['A smooth rock!'], safe: ['Locked tight! Money is safe here.'],
        dress: ['So pretty!'], tshirt: ['Comfy!'], handbag: ['Lots of pockets!'] } as Record<string, string[]>)[id] } })),
    { id: 'slide', name: 'Slide', emoji: '🛝', w: 230, h: 230, tags: ['seat', 'decor'], seatLift: 120, tap: { type: 'anim', anim: 'shake', sfx: 'whoosh', bubble: ['Wheee!', 'Down we go!'] } },
    { id: 'carousel', name: 'Merry-go-round', emoji: '🎠', w: 210, h: 210, tags: ['seat', 'decor'], seatLift: 90, tap: { type: 'anim', anim: 'spin', sfx: 'whoosh', bubble: ['Round and round!'] } },
    { id: 'bench', name: 'Bench', emoji: '🪑', w: 130, h: 130, tags: ['seat', 'decor'], seatLift: 55 },
    { id: 'boat', name: 'Rowboat', emoji: '🛶', w: 240, h: 150, tags: ['seat', 'decor'], seatLift: 50, tap: { type: 'anim', anim: 'shake', sfx: 'splash', bubble: ['Row row row your boat!'] } },
    { id: 'towel', name: 'Beach towel', art: 'starrug', w: 240, h: 60, tags: ['floor', 'decor'] },
    prop('shell', 'Seashell', '🐚', ['toy'], { tap: { type: 'anim', anim: 'shake', sfx: 'splash', bubble: ['I can hear the ocean!'] } }),
    prop('crab', 'Crab', '🦀', ['toy'], { tap: { type: 'anim', anim: 'hop', sfx: 'pop', bubble: ['Pinch pinch!', 'I walk sideways!'] } }),
    prop('volleyball', 'Beach ball', '🏐', ['toy'], { tap: { type: 'roll', sfx: 'pop' } }),
    prop('bucket', 'Bucket', '🪣', ['tool']),
    prop('sandbucket', 'Sand toys', '🪣', ['toy']),
    prop('picnic', 'Picnic basket', '🧺', ['tool'], { tap: { type: 'spawn', toggle: false, items: ['apple', 'banana', 'strawberry', 'grapes', 'cookie', 'juice', 'cheese', 'bread', 'watermelon'] } }),
    prop('flowers', 'Flowers', '🌷', ['decor'], { tap: { type: 'anim', anim: 'shake', sfx: 'sparkle', bubble: ['Smells sweet!'] } }),
    prop('frisbee', 'Flying disc', '🥏', ['toy'], { tap: { type: 'roll', sfx: 'whoosh' } }),
    prop('bird', 'Bird', '🐦', ['toy', 'float'], { tap: { type: 'anim', anim: 'hop', sfx: 'sparkle', bubble: ['Tweet tweet!'] } }),
    prop('fishrod', 'Fishing rod', '🎣', ['tool'], { tap: { type: 'anim', anim: 'shake', sfx: 'splash', bubble: ['Cast the line… wait… a nibble!'] } }),
    { id: 'fish', name: 'Fish', emoji: '🐟', w: 60, h: 60, tags: ['petfood', 'small'], tap: { type: 'anim', anim: 'hop', sfx: 'splash', bubble: ['Blub!'] } },
    prop('tacklebox', 'Tackle box', '🧰', ['tool'], { tap: { type: 'spawn', toggle: false, items: ['fish', 'fishrod', 'bucket', 'shell', 'crab', 'duck', 'juice'] } }),
    // play boxes: tap to pull out lots of things for each place (Oct 2026)
    box('beachbag', 'Beach bag', '👜', ['shell', 'crab', 'volleyball', 'bucket', 'sandbucket', 'icecream', 'frisbee', 'juice', 'watermelon']),
    box('toybin', 'Toy bin', '📦', ['ball', 'basketball', 'volleyball', 'tennisball', 'jumprope', 'frisbee', 'kite', 'sandbucket', 'balloon', 'bubbles']),
    box('hikepack', 'Hiking bag', '🎒', ['compass', 'binoculars', 'trailmap', 'magnifier', 'camera', 'apple', 'juice', 'flowers', 'butterfly']),
    box('treatcase', 'Treat case', '🧁', ['croissant', 'waffle', 'cake', 'cupcake', 'cookie', 'donut', 'icecream', 'juice', 'cup', 'plate']),
    box('shoprack', 'Shop shelf', '🛍️', ['dress', 'tshirt', 'handbag', 'sneaker', 'cap', 'shoppingbag', 'coins']),
    box('coindrawer', 'Coin drawer', '🗃️', ['coins', 'moneybag', 'piggybank', 'key', 'notebook', 'pencil', 'calculator']),
    box('propbox', 'Prop box', '🎁', ['kp-mic', 'kp-lightstick', 'kp-bottle', 'kp-bunny', 'kp-trophy', 'guitar', 'drum', 'balloon']),
    box('gadgetbox', 'Gadget box', '🔌', ['keyboard', 'headset', 'floppy', 'laptop', 'joystick', 'battery', 'minibot', 'magnet']),
    prop('basketball', 'Basketball', '🏀', ['toy'], { tap: { type: 'roll', sfx: 'pop' } }),
    prop('jumprope', 'Jump rope', '🪢', ['toy'], { tap: { type: 'anim', anim: 'hop', sfx: 'tick', bubble: ['1, 2, 3, jump!'] } }),
    prop('butterfly', 'Butterfly', '🦋', ['toy', 'float'], { tap: { type: 'anim', anim: 'hop', sfx: 'sparkle', bubble: ['Flutter flutter!'] } }),
    prop('squirrel', 'Squirrel', '🐿️', ['toy'], { tap: { type: 'anim', anim: 'hop', sfx: 'pop', bubble: ['Got any nuts?'] } }),
    prop('compass', 'Compass', '🧭', ['tool'], { tap: { type: 'anim', anim: 'spin', sfx: 'tick', bubble: ['The needle points north!'] } }),
    prop('trailmap', 'Trail map', '🗺️', ['tool']),
    prop('binoculars', 'Telescope', '🔭', ['tool'], { tap: { type: 'anim', anim: 'shine', sfx: 'sparkle', bubble: ['I spy an owl!'] } }),
    food('croissant', 'Croissant', '🥐'),
    food('waffle', 'Waffle', '🧇'),
    food('cake', 'Cake', '🍰', { tags: ['food', 'small'] }),
    prop('sneaker', 'Sneakers', '👟', ['tool']),
    prop('cap', 'Cap', '🧢', ['tool']),
    prop('shoppingbag', 'Shopping bags', '🛍️', ['tool'], { tap: { type: 'anim', anim: 'shake', sfx: 'pop', bubble: ['Shopping day!'] } }),
    prop('coins', 'Coins', '🪙', ['tool'], { tap: { type: 'anim', anim: 'shake', sfx: 'coin', bubble: ['Clink clink!'] } }),
    prop('moneybag', 'Money bag', '💰', ['tool'], { tap: { type: 'anim', anim: 'shake', sfx: 'coin', bubble: ['Saving for something big!'] } }),
    ...(['mic', 'lightstick', 'folder', 'trophy', 'planner', 'bottle', 'phone', 'bunny'] as const).map((k, i): ItemDef => ({
      id: `kp-${k}`, name: ({ mic: 'Microphone', lightstick: 'Lightstick', folder: 'Music folder', trophy: 'Trophy', planner: 'Dance planner', bottle: 'Water bottle', phone: 'Phone', bunny: 'Bunny plush' } as Record<string, string>)[k],
      img: KPOP_PROPS[i], w: 70, h: 90, tags: ['small', 'toy'],
      ...(k === 'mic' ? { tap: { type: 'anim', anim: 'shake', sfx: 'sparkle', bubble: ['La la laaa! 🎤', 'Hello, everyone!'] } as TapAction } : k === 'lightstick' ? { tap: { type: 'anim', anim: 'shine', sfx: 'sparkle', bubble: ['Wave it high! ✨'] } as TapAction } : {}),
    })),

    // ── Building blocks (engineering free play) ───────
    { id: 'block-red', name: 'Red block', art: 'block', w: 90, h: 70, tags: ['block', 'small'], },
    { id: 'block-blue', name: 'Blue block', art: 'block', w: 90, h: 70, tags: ['block', 'small'] },
    { id: 'block-yellow', name: 'Yellow block', art: 'block', w: 90, h: 70, tags: ['block', 'small'] },
    { id: 'block-roof', name: 'Roof block', art: 'roofblock', w: 90, h: 60, tags: ['block', 'small'] },

    // ── Furniture: home ───────────────────────────────
    { id: 'fridge', name: 'Fridge', art: 'fridge', w: 165, h: 310, tags: [],
      tap: { type: 'spawn', toggle: true, items: ['apple', 'banana', 'strawberry', 'grapes', 'watermelon', 'egg', 'milk', 'cheese', 'bread', 'carrot', 'potato', 'corn', 'batter', 'broccoli', 'onion', 'pineapple', 'olive', 'cupcake', 'donut', 'icecream', 'juice', 'petfood'] } },
    { id: 'stove', name: 'Stove', art: 'stove', w: 160, h: 175, tags: ['stove'] },
    { id: 'counter', name: 'Sink', art: 'kitchensink', w: 190, h: 175, tags: ['sink', 'table'] },
    { id: 'cupboard', name: 'Cupboard', art: 'cupboard', w: 230, h: 110, tags: ['wall'],
      tap: { type: 'spawn', toggle: true, items: ['plate', 'cup', 'spoon', 'kettle', 'salt', 'cupcake'] } },
    { id: 'table', name: 'Table', art: 'table', w: 280, h: 125, tags: ['table'] },
    { id: 'chair', name: 'Chair', art: 'chair', w: 90, h: 150, tags: ['seat'], seatLift: 62, tap: { type: 'anim', anim: 'spin', sfx: 'whoosh' } },
    { id: 'bed', name: 'Bed', art: 'bed', paint: pBed, w: 300, h: 263, tags: ['bed'], tap: { type: 'anim', anim: 'shake', sfx: 'pop', bubble: ['So fluffy!', 'Boing boing!'] } },
    { id: 'closet', name: 'Closet', art: 'closet', paint: pCloset, w: 262, h: 250, tags: [], tap: { type: 'wardrobe' } },
    { id: 'toybox', name: 'Toy box', art: 'toybox', paint: pToybox, w: 170, h: 140, tags: [],
      tap: { type: 'spawn', toggle: true, items: ['teddy', 'train', 'balloon', 'drum', 'dino', 'unicorn', 'rocket', 'kite', 'puzzle', 'guitar', ...TOY_IDS, 'paints', 'book', 'yarn'] } },
    { id: 'lamp', name: 'Lamp', art: 'lamp', paint: pLamp, w: 92, h: 200, tags: ['decor'], tap: { type: 'toggle', sfx: 'click' } },
    { id: 'tv', name: 'TV', art: 'tv', paint: pTv, w: 240, h: 160, tags: [], tap: { type: 'toggle', sfx: 'click' } },
    { id: 'window', name: 'Window', art: 'window', w: 200, h: 165, fixed: true, tags: [], tap: { type: 'toggle', sfx: 'whoosh' } },
    { id: 'rug', name: 'Rug', art: 'rug', paint: pRug, w: 300, h: 108, tags: ['floor'] },
    { id: 'couch', name: 'Couch', art: 'couch', paint: pCouch, w: 380, h: 144, tags: ['seat'], seatLift: 66, tap: { type: 'anim', anim: 'shake', sfx: 'pop', bubble: ['Comfy!', 'Pillow fort time?'] } },
    { id: 'armchair', name: 'Armchair', art: 'couch', paint: pArmchair, w: 170, h: 146, tags: ['seat'], seatLift: 64, tap: { type: 'anim', anim: 'shake', sfx: 'pop', bubble: ['So soft!', 'My reading chair!'] } },
    { id: 'bookshelf', name: 'Bookshelf', art: 'bookshelf', paint: pBookshelf, w: 150, h: 280, tags: [],
      tap: { type: 'spawn', toggle: false, items: ['book', 'books', 'puzzle', 'gamepad', 'paints', 'clock'] } },
    { id: 'shower', name: 'Bath & shower', art: 'shower', paint: pBathtub, w: 286, h: 243, front: 0.62, tags: ['shower'] },
    { id: 'toilet', name: 'Toilet', art: 'toilet', paint: pToiletW, w: 94, h: 160, tags: ['seat'], seatLift: 76 },
    { id: 'bathsink', name: 'Bathroom sink', art: 'bathsink', paint: pBathSink, w: 211, h: 112, tags: ['sink'],
      tap: { type: 'spawn', toggle: false, items: ['toothbrush', 'soap', 'shampoo', 'sponge', 'bubbles', 'duck'] } },
    { id: 'mirror', name: 'Mirror', art: 'mirror', paint: pBathMirror, w: 211, h: 133, tags: ['wall'], tap: { type: 'anim', anim: 'shine', sfx: 'sparkle', bubble: ['Looking great!', 'Who is that? It\'s you!'] } },
    { id: 'door-white', name: 'Door', art: 'door', paint: pDoorWhite, w: 164, h: 275, fixed: true, tags: ['door'] },
    { id: 'bathmat', name: 'Bath mat', art: 'rug', paint: pBathmat, w: 200, h: 102, tags: ['floor'] },
    { id: 'towel-rack', name: 'Towel rack', art: 'mirror', paint: pTowel, w: 101, h: 68, tags: ['decor'], tap: { type: 'anim', anim: 'shake', sfx: 'whoosh', bubble: ['Fluffy towel!', 'All dry!'] } },
    { id: 'laundry-basket', name: 'Laundry basket', art: 'toybox', paint: pBasket, w: 88, h: 82, tags: ['decor'], tap: { type: 'anim', anim: 'shake', sfx: 'pop', bubble: ['Laundry day!', 'Socks go here!'] } },
    { id: 'bath-shelf', name: 'Bathroom shelf', art: 'bookshelf', paint: pBathShelf, w: 111, h: 154, tags: ['decor'], tap: { type: 'spawn', toggle: false, items: ['soap', 'duck', 'toothbrush'] } },
    { id: 'bath-cart', name: 'Bath cart', art: 'toybox', paint: pBathCart, w: 102, h: 118, tags: ['decor'], tap: { type: 'anim', anim: 'shake', sfx: 'pop', bubble: ['Squeaky wheels!', 'Bubbles and lotion!'] } },
    { id: 'trash-can', name: 'Trash can', art: 'toybox', paint: pTrash, w: 52, h: 78, tags: ['decor'], tap: { type: 'anim', anim: 'shake', sfx: 'click', bubble: ['Ding!'] } },
    { id: 'step-stool', name: 'Step stool', art: 'toybox', paint: pStool, w: 95, h: 55, tags: ['seat', 'decor'], seatLift: 40 },
    { id: 'door', name: 'Door', art: 'door', paint: pDoor, w: 150, h: 275, fixed: true, tags: ['door'] },
    { id: 'door-pink', name: 'Door', art: 'door', paint: pDoorPink, w: 174, h: 275, fixed: true, tags: ['door'] },
    { id: 'lamp-pink', name: 'Table lamp', art: 'lamp', paint: pLampPink, w: 96, h: 143, tags: ['decor'], tap: { type: 'toggle', sfx: 'click' } },
    { id: 'studydesk', name: 'Study desk', art: 'desk', paint: pStudyDesk, w: 236, h: 217, tags: ['table', 'decor'], tap: { type: 'anim', anim: 'shake', sfx: 'pop', bubble: ['Homework time! ✏️', 'Let’s draw something!', 'So tidy!'] } },
    { id: 'secretspot', name: 'Sparkle', art: 'sparkle', w: 70, h: 50, fixed: true, tags: [],
      tap: { type: 'secret', secretId: 'underbed', taps: 1, sfx: 'sparkle' } },

    // ── Shop / reward decor ───────────────────────────
    { id: 'plant', name: 'Leafy plant', art: 'plant', paint: pPlant, w: 125, h: 123, tags: ['decor'], tap: { type: 'anim', anim: 'shake', sfx: 'whoosh', bubble: ['Rustle rustle', 'Thanks for the water!'] } },
    { id: 'beanbag', name: 'Beanbag', art: 'beanbag', w: 140, h: 100, tags: ['seat', 'decor'], seatLift: 38 },
    { id: 'fishbowl', name: 'Fishbowl', art: 'fishbowl', w: 110, h: 110, tags: ['decor'], tap: { type: 'anim', anim: 'shake', sfx: 'splash', bubble: ['Blub blub!'] } },
    { id: 'starrug', name: 'Star rug', art: 'starrug', w: 300, h: 70, tags: ['floor', 'decor'] },
    { id: 'rocketposter', name: 'Rocket poster', art: 'rocketposter', w: 130, h: 160, tags: ['decor', 'wall'] },
    { id: 'trophy', name: 'Gold trophy', emoji: '🏆', w: 80, h: 80, tags: ['small', 'decor'] },
    { id: 'petbed', name: 'Pet bed', art: 'petbed', w: 150, h: 70, tags: ['bed', 'decor'] },

    // ── Furniture: school ─────────────────────────────
    { id: 'chalkboard', name: 'Chalkboard', art: 'chalkboard', w: 440, h: 220, fixed: true, tags: [], tap: { type: 'custom', id: 'draw' } },
    { id: 'desk', name: 'Desk', art: 'desk', w: 170, h: 135, tags: ['seat', 'behind'], seatLift: 30 },
    { id: 'teacherdesk', name: 'Teacher desk', art: 'teacherdesk', w: 270, h: 140, tags: ['table'],
      tap: { type: 'spawn', toggle: false, items: ['crayons', 'pencil', 'ruler', 'scissors', 'abacus', 'microscope', 'book', 'apple'] } },
    { id: 'schoolclock', name: 'Clock', art: 'wallclock', w: 100, h: 100, fixed: true, tags: [],
      tap: { type: 'secret', secretId: 'schoolclock', taps: 3, anim: 'spin', sfx: 'tick' } },

    // ── Furniture: hospital ───────────────────────────
    { id: 'exambed', name: 'Exam bed', art: 'exambed', w: 320, h: 160, tags: ['bed'] },
    { id: 'medcabinet', name: 'Supply cabinet', art: 'medcabinet', w: 165, h: 230, tags: [],
      tap: { type: 'spawn', toggle: true, items: ['thermometer', 'stethoscope', 'bandage', 'icepack', 'clipboard', 'juice', 'lollipop', 'teddy'] } },
    { id: 'heartposter', name: 'Heart poster', art: 'heartposter', w: 140, h: 170, fixed: true, tags: [],
      tap: { type: 'anim', anim: 'pulse', sfx: 'heartbeat', bubble: ['Your heart pumps blood all around your body!', 'A resting kid heart beats about 70–110 times a minute.'] } },

    // ── Furniture: courthouse ─────────────────────────
    { id: 'judgebench', name: 'Judge bench', art: 'judgebench', w: 400, h: 180, tags: ['seat', 'behind'], seatLift: 70 },
    { id: 'witnessstand', name: 'Witness stand', art: 'witnessstand', w: 175, h: 150, tags: ['seat', 'behind'], seatLift: 45 },
    { id: 'jurybox', name: 'Jury box', art: 'jurybox', w: 300, h: 135, tags: ['seat', 'behind'], seatLift: 35 },
    { id: 'lawtable', name: 'Lawyer table', art: 'lawtable', w: 250, h: 120, tags: ['table'],
      tap: { type: 'spawn', toggle: false, items: ['folder', 'scroll', 'magnifier', 'camera', 'notebook', 'footprints', 'key'] } },
    { id: 'scales', name: 'Scales sign', art: 'scales', w: 130, h: 130, fixed: true, tags: [],
      tap: { type: 'anim', anim: 'tilt', sfx: 'click', bubble: ['Fair means listening to every side.'] } },

    // ── Furniture: animal hospital ────────────────────
    { id: 'petcabinet', name: 'Pet supplies', art: 'medcabinet', w: 165, h: 230, tags: [],
      tap: { type: 'spawn', toggle: true, items: ['stethoscope', 'thermometer', 'bandage', 'petbrush', 'petfood', 'hay', 'carrot', 'ball', 'tennisball', 'mousetoy', 'yarn'] } },
    { id: 'pawposter', name: 'Paw poster', art: 'pawposter', w: 140, h: 170, fixed: true, tags: [],
      tap: { type: 'anim', anim: 'pulse', sfx: 'pop', bubble: ['Pets need food, water, exercise, sleep and love.', 'Bunnies’ teeth never stop growing! Hay keeps them short.'] } },

    // ── Furniture: tech lab ───────────────────────────
    { id: 'computer', name: 'Computer', art: 'computer', w: 230, h: 190, tags: [], tap: { type: 'toggle', sfx: 'beep' } },
    { id: 'serverrack', name: 'Server rack', art: 'serverrack', w: 140, h: 270, tags: [],
      tap: { type: 'anim', anim: 'pulse', sfx: 'beep', bubble: ['Servers are computers that store websites and games.'] } },
    { id: 'codeposter', name: 'Code poster', art: 'codeposter', w: 230, h: 160, fixed: true, tags: [],
      tap: { type: 'anim', anim: 'shine', sfx: 'click', bubble: ['Computers follow steps in order. That’s a sequence!', 'A loop repeats steps so you don’t have to write them again.'] } },

    // ── Furniture: engineering lab ────────────────────
    { id: 'workbench', name: 'Workbench', art: 'workbench', w: 310, h: 145, tags: ['table'],
      tap: { type: 'spawn', toggle: false, items: ['wrench', 'screwdriver', 'magnet', 'bolts', 'gear', 'battery', 'toolbox'] } },
    { id: 'blueprint', name: 'Blueprint board', art: 'blueprint', w: 250, h: 170, fixed: true, tags: [],
      tap: { type: 'anim', anim: 'shine', sfx: 'click', bubble: ['Ask → Imagine → Plan → Build → Test → Improve!'] } },
    { id: 'robot', name: 'Robot helper', art: 'robot', w: 120, h: 165, tags: [],
      tap: { type: 'secret', secretId: 'robot', taps: 3, anim: 'dance', sfx: 'beep' } },
    { id: 'blockbin', name: 'Block bin', art: 'blockbin', w: 170, h: 110, tags: [],
      tap: { type: 'spawn', toggle: false, items: ['block-red', 'block-blue', 'block-yellow', 'block-roof'] } },
    // ── Hand-drawn accessories & toys ────────────────
    ...ACCESSORIES.map((a): ItemDef => ({ id: a.id, name: a.name, img: a.img, w: a.w, h: a.h, wear: a.wear, tags: a.food ? ['food', 'small'] : a.toy ? ['small', 'toy'] : ['small'] })),
  ] as ItemDef[]).map((d) => [d.id, d]),
);

export const has = (def: ItemDef | undefined, tag: ItemTag) => !!def && def.tags.includes(tag);

// play boxes may list things defined later in this file: drop any id that doesn't exist
for (const d of Object.values(ITEMS)) if (d.tap?.type === 'spawn') d.tap.items = d.tap.items.filter((id) => ITEMS[id]);
