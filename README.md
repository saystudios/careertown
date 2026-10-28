# CareerTown

A kid-friendly (ages 6–12) open-ended town where children create characters, play pretend
in rooms, and explore careers through short missions. All art, characters and sounds are
original (SVG + synthesized WebAudio). No accounts, chat, ads or real purchases.
© Say Studios LLC

## How this repo is organised
- **`main`**: the finished game that GitHub Pages serves: `index.html` plus `assets/`, icons and the
  iPhone app workflow. This is what players see.
- **`source`**: the game's source code (React + TypeScript + Tailwind), the character art scripts and
  this README. Changes are made here, built, and the built `index.html` + `assets/` go to `main`.

## Build the iPhone / iPad app (no Mac needed)
`.github/workflows/ios-app.yml` turns the game into an iPhone and iPad app on GitHub's Mac computers
and uploads it to App Store Connect, where it shows up in TestFlight. It works the same way as Say Math.

One-time setup:
1. At developer.apple.com → *Identifiers*, register an App ID, for example `com.saystudios.careertown`.
2. In App Store Connect → *Apps*, make a new app named CareerTown with that bundle ID.
3. In this repo open *Settings → Secrets and variables → Actions* and add the same five secrets
   Say Math uses: `APPLE_TEAM_ID`, `ASC_KEY_ID`, `ASC_ISSUER_ID`, `ASC_KEY_P8`, plus `BUNDLE_ID`
   set to the new App ID.

To build: *Actions → Build iPhone app → Run workflow*, type a version (1.0) and run it.
After about 15–30 minutes the build appears in App Store Connect → TestFlight.
The app uses `index.html`, `assets/`, `app-icon.png` and `app-splash.png` from this repo.

## Run and build the source
```bash
npm install
npm run dev        # local dev server
npm run build      # production build (dist/)
npm run typecheck  # optional TypeScript check
npm test           # automated tests (tests/*.test.ts, Node's built-in test runner; no extra packages)
```
Copy `dist/index.html` and `dist/assets/` to the `main` branch to publish.
The game's fonts (Lexend, Grandstander; SIL Open Font License) ship in `src/assets/fonts/`, so the
game works offline and makes no outside requests.

Plain CSS added after Oct 2026 lives at the end of `src/index.css`, below the
"Plain CSS added Oct 2026" line. Keep Tailwind classes out of that section.

## Character art
Every dress-up piece (body, faces, 15 hairstyles, 43 clothes, the grown-up build) is drawn as SVG by
`tools/art/parts.py`. After changing it, run `python3 tools/art/gen_art.py` to rewrite
`src/data/dollArt.ts`. `tools/art/prev.py` renders preview sheets (needs Playwright).

## What's playable
- **Title screen** (every launch): the painted town drifting behind a "Welcome to CareerTown" street
  sign, the family on the sidewalk, a big "Let's go!" button, Shop, Characters and Settings. A mailbox
  holds a daily gift (sticker + coins; given on "Let's go!" if not opened). The sign is dressed for the
  season: pumpkins and bunting in October, snow in December, flower boxes the rest of the year
  (`src/data/season.ts`; preview with `?season=halloween`, `?season=winter` or `?season=none`).
- **Town map**: 8 playable buildings, 2 "Soon" buildings (Shopping Center, Bank), hidden balloon secret.
- **The YunaVerse family**: Yuna, Natalie, Brother, Nene, Mom and Dad, plus dogs Snowy and Coco.
  Everyone, family included, can be restyled in the character maker or the closet.
- **Dress-Up Studio** (🧑‍🎨 button, the title screen's Characters button, and closets/dressing tables in rooms):
  big character preview, family portraits to switch who is dressing, 8 faces, and picture tabs for Hair, Tops,
  Bottoms, Dresses, Shoes, Extras, Jobs and ♥ My looks. Every change saves straight away; Undo, Reset (back to their
  usual outfit) and ♥ Save look (up to 6 per character). See *Dress-Up Studio* below.
- **Character maker**: kids (and grown-ups for the family and mission characters), 4 skin tones,
  2 faces, 6 eye colors, 15 hairstyles, 9 hair colors, tops, bottoms, shoes, plus hats, glasses,
  headphones and bags. Career outfits (lab coat, suit jacket, safety vest, chef coat) unlock by finishing missions.
- **Home**: kitchen, bedroom, living room, bathroom. Cook on the stove (egg → fried egg, corn → popcorn,
  mix → pancakes), wash food, feed characters, sit, sleep, shower, brush teeth, walk between rooms.
- **School**: desks, chalkboard drawing (saved), bell, globe, secret clock.
- **Hospital**: exam room + *Check-up for Pip* (temperature, heartbeat counting, clean → bandage,
  body parts, healthy habits). Unlocks the lab coat and a puppy.
- **Courthouse**: courtroom + *The Missing Science Trophy* (statements, evidence, fact vs opinion,
  contradiction, questions, claim/evidence/reasoning, verdict). Unlocks the suit jacket and a kitten.
- **Engineering Lab**: block stacking + *The River Bridge* (design process, materials, budget, load test).
  Unlocks the safety vest.
- **Animal Hospital**: pet clinic + *Clover’s Clinic Visit*. Unlocks a pet bunny.
- **Technology Lab**: coding lab + *Robot to the Charger* (sequence, loops, debugging).
- **Restaurant**: Café Sunny kitchen (pizza dough bakes into pizza) + *Pizza Party at Café Sunny*
  (kitchen hygiene, recipe order, matching customer orders, oven safety, fair shares and 1/4).
  Unlocks the chef coat.
- **Missions**: a 🔊 *Read to me* button reads the instructions aloud with the device's own voice.
- **Progress**: coins, XP/levels, career levels, badges, secrets, daily challenge, shop,
  Career Passport with "What we noticed" discovery (never "you should become…").
- **Saves**: autosaves on the device. Older saves upgrade automatically; a damaged save or one from
  a newer version is kept as a backup instead of being overwritten.

## Architecture
```
src/
  engine/
    types.ts         All game types (Entity, GameState, Reward, Screen…)
    store.tsx        Reducer: entities, rewards, missions, events, daily, secrets, shop
    interactions.ts  Drop rules: what happens when X is dropped on Y (tags-driven)
    save.ts          SaveAdapter + localStorage impl, save upgrades (MIGRATIONS), backups, Supabase sketch
    sfx.ts           Synthesized sound effects
  data/              ← most expansion happens here
    items.ts         Every object: size, art, tags, tap behavior
    scenes.ts        Room backdrops + starting layouts
    buildings.ts     Map placement, rooms, missions per building
    careers.ts       Career titles, blurbs, discovery sentences
    missions.ts      Mission metadata + rewards
    catalog.ts       Shop, badges, secrets, pet accessories
    doll.ts / dollArt.ts / dollLooks.ts   Vector dress-up characters (dollArt.ts is generated)
    sprites.ts       Character sizes and rigs (kids, grown-ups, the YunaVerse family)
    daily.ts         Daily challenges
  components/
    Room.tsx         Generic drag-and-drop room engine (pointer events, touch-first)
    art/             Character, Pet, Furniture SVG renderers
  scenes/            TownMap, SceneScreen, CharacterCreator, Menus (Building, Passport, Shop)
  missions/          Lawyer, Engineer, Doctor, Vet, Robot, Chef missions + MissionShell (with Read to me)
  ui/                kit (HUD, buttons, modals, rewards), DragChip (drag-or-tap)
  fonts.ts           Loads the packaged Lexend + Grandstander fonts (no Google Fonts)
tools/art/           Python scripts that draw every character piece (see below)
```

### Add a new building / career
1. `data/careers.ts`: add or flip `available: true`.
2. `data/scenes.ts`: add a SceneId, backdrop and `initialScene` layout.
3. `data/items.ts`: add furniture (tags like `seat`, `bed`, `table` give free behaviors).
4. `data/buildings.ts`: set `playable: true`, `rooms`, `missions`.
5. Mission: add metadata in `data/missions.ts`, a component in `missions/`, and one line in
   `MISSION_VIEWS` in `App.tsx`.

### Adding Supabase later
Implement `SaveAdapter` (see the sketch in `engine/save.ts`) and pass it to
`<GameProvider adapter={…}>`. Suggested tables: `parents`, `child_profiles`, `saves`
(profile_id, state jsonb), `purchases`, with row-level security per family.

## Safety
No free-text sharing, no multiplayer, no external links, no ads, no outside requests.
Character names stay on device. Medical, legal and cooking content is pretend, simple and clearly
framed as play (with "ask a grown-up" notes where it matters).

## K-pop Training Academy rooms
Free play at the K-pop Training Academy is a 4-room building you swipe across: Dance studio, Recording booth,
Dressing room (its dressing table opens the Dress-Up Studio) and Stage. Luna and the trainees stay in the dance
studio. The booth, dressing room and stage backgrounds are drawn by `tools/rooms/kpop_rooms.py` (run it, then
`node render.cjs`, and save the PNGs as `src/assets/rooms/kpop-*.webp`); a painted 1920 x 840 picture can replace
any of them at the same path (the room is the middle 1200 px; the floor starts about 564 px down).

## Dress-Up Studio
- `src/scenes/DressUpStudio.tsx`: the screen. `src/data/wardrobe.ts`: every YunaVerse piece as a wardrobe item
  (stable id like `top:pink-hoodie`, category, bodies it fits, render layer, placement per body, what it conflicts
  with, how it unlocks), the 8 faces and the job outfits. `src/engine/outfit.ts`: the rules (put on, take off,
  dresses vs tops/bottoms, job outfits, saved looks, cleaning up old saves). The pictures still come from
  `src/data/paperArt.ts`, built from `art/yunaverse/` by `tools/paper/build_paper.py` (1024 x 1536 canvas, one
  placement box per body), so new art shows up in the Studio automatically.
- A character's look is still stored as `paper` (unchanged), plus `expression`, `paperDefault` (what Reset goes back
  to) and `looks` (saved looks). Saves are upgraded from version 1 to 2 in `src/engine/save.ts`; nothing is lost.
- Dresses (`FULL_OUTFITS` in wardrobe.ts) take the place of a top and bottoms. To make a new long top count as a
  dress, add its id there.
- Job outfits (`CAREER_PRESETS`) list their pieces per body. A job only appears for bodies that have all its art.

**Art still missing** (the Studio hides these rather than stretch other pictures):
- Lab coat, safety vest and suit jacket for the kid body (only drawn for the little-kid body), and a doctor and
  engineer outfit for grown-ups.
- Chef coat for the kid and little-kid bodies (only drawn for grown-ups).
- Back views of the characters (so there is no front/back turn button yet).
- Walking and other action poses for the YunaVerse characters (they slide and bob instead).

