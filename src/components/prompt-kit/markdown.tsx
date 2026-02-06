"use client"

import { LinkMarkdown } from "@/app/components/chat/link-markdown"
import { cn } from "@/lib/utils"
import emojiData from "emoji-datasource-apple/emoji.json"
import { memo, useId, useMemo, useRef } from "react"
import ReactMarkdown, { Components } from "react-markdown"
import remarkBreaks from "remark-breaks"
import remarkGfm from "remark-gfm"
import { ButtonCopy } from "../common/button-copy"
import {
  CodeBlock,
  CodeBlockCode,
  CodeBlockGroup,
} from "../prompt-kit/code-block"
import { HtmlPreview } from "./html-preview"

import { motion } from "motion/react"

export type MarkdownProps = {
  children: string
  id?: string
  className?: string
  components?: Partial<Components>
  isStreaming?: boolean
}

function parseCodeMeta(className?: string) {
  if (!className) return { language: "plaintext", filename: null }
  const match = className.match(/language-([\w-]+)(?::(.+))?/)
  if (!match) return { language: "plaintext", filename: null }
  return {
    language: match[1],
    filename: match[2] || null
  }
}

type EmojiDataEntry = {
  short_name: string
  short_names?: string[]
  unified?: string
}

const emojiShortcodeMap = (() => {
  const map = new Map<string, string>()
  ;(emojiData as EmojiDataEntry[]).forEach((emoji) => {
    if (!emoji.unified) return
    const filename = emoji.unified.toLowerCase()
    const shortcodes = new Set<string>([emoji.short_name, ...(emoji.short_names || [])])
    shortcodes.forEach((shortcode) => {
      if (shortcode) {
        map.set(shortcode, filename)
      }
    })
  })
  return map
})()

const SHORTCODE_ALIASES: Record<string, string> = {
  // Checkmarks & symbols
  check: "white_check_mark",
  checkmark: "white_check_mark",
  green_check: "white_check_mark",
  tick: "white_check_mark",
  heavy_check: "heavy_check_mark",
  x: "x",
  cross: "x",
  cross_mark: "x",
  exclamation: "exclamation",
  question: "question",
  plus: "heavy_plus_sign",
  minus: "heavy_minus_sign",
  multiply: "heavy_multiplication_x",
  divide: "heavy_division_sign",
  infinity: "infinity",
  recycle: "recycle",
  warning: "warning",
  no_entry: "no_entry_sign",
  prohibited: "no_entry_sign",
  stop: "octagonal_sign",
  trident: "trident",

  // Faces - happy/positive
  grin: "grinning",
  smile: "smile",
  laugh: "laughing",
  lol: "laughing",
  haha: "laughing",
  rofl: "rolling_on_the_floor_laughing",
  tears_of_joy: "joy",
  face_with_tears_of_joy: "joy",
  happy: "blush",
  star_struck: "star-struck",
  starstruck: "star-struck",
  money_mouth: "money_mouth_face",
  hugs: "hugging_face",
  hugging: "hugging_face",
  warm_smile: "smiling_face_with_three_hearts",
  love_face: "smiling_face_with_three_hearts",
  hearts_face: "smiling_face_with_three_hearts",
  halo: "innocent",
  angel: "innocent",
  wink: "wink",
  yum: "yum",
  delicious: "yum",
  cool: "sunglasses",
  smirk: "smirk",
  relieved: "relieved",
  relaxed: "relaxed",
  party_face: "partying_face",
  partying: "partying_face",
  melting: "melting_face",
  salute: "saluting_face",
  saluting: "saluting_face",

  // Faces - negative/neutral
  thinking: "thinking_face",
  hmm: "thinking_face",
  nerd: "nerd_face",
  monocle: "face_with_monocle",
  skeptical: "face_with_raised_eyebrow",
  raised_eyebrow: "face_with_raised_eyebrow",
  hand_over_mouth: "face_with_hand_over_mouth",
  shushing: "shushing_face",
  shh: "shushing_face",
  pleading: "pleading_face",
  puppy_eyes: "pleading_face",
  crying: "cry",
  loudly_crying: "sob",
  sobbing: "sob",
  cursing: "face_with_symbols_on_mouth",
  swearing: "face_with_symbols_on_mouth",
  angry: "angry",
  mad: "rage",
  furious: "rage",
  sad: "disappointed",
  worried: "worried",
  anxious: "anxious_face_with_sweat",
  scared: "fearful",
  shocked: "open_mouth",
  astonished: "astonished",
  flushed: "flushed",
  dizzy_face: "dizzy_face",
  mindblown: "exploding_head",
  exploding_head: "exploding_head",
  mind_blown: "exploding_head",
  sleeping: "sleeping",
  sleepy: "sleepy",
  drooling: "drooling_face",
  sick: "face_with_thermometer",
  vomiting: "face_vomiting",
  puke: "face_vomiting",
  sneeze: "sneezing_face",
  cold_face: "cold_face",
  hot_face: "hot_face",
  woozy: "woozy_face",
  drunk: "woozy_face",
  zany: "zany_face",
  crazy: "zany_face",
  shrug: "man_shrugging",
  facepalm: "man_facepalming",
  eye_roll: "face_with_rolling_eyes",
  rolling_eyes: "face_with_rolling_eyes",
  unamused: "unamused",
  expressionless: "expressionless",
  neutral: "neutral_face",
  zipper_mouth: "zipper_mouth_face",
  peeking: "face_with_peeking_eye",
  dotted_face: "dotted_line_face",
  disguise: "disguised_face",

  // Non-human faces
  robot: "robot_face",
  alien: "alien",
  ghost: "ghost",
  skull: "skull",
  poop: "hankey",
  shit: "hankey",
  clown: "clown_face",
  ogre: "japanese_ogre",
  goblin: "japanese_goblin",
  jack_o_lantern: "jack_o_lantern",
  pumpkin: "jack_o_lantern",

  // Hands & gestures
  thumbs_up: "+1",
  thumbsup: "+1",
  like: "+1",
  thumbsdown: "-1",
  thumbs_down: "-1",
  dislike: "-1",
  folded_hands: "pray",
  please: "pray",
  thanks: "pray",
  thank_you: "pray",
  high_five: "pray",
  clap: "clap",
  clapping: "clap",
  raised_hand: "hand",
  wave: "wave",
  hi: "wave",
  bye: "wave",
  hello: "wave",
  ok: "ok_hand",
  ok_hand: "ok_hand",
  pinch: "pinching_hand",
  pinching: "pinching_hand",
  peace: "v",
  victory: "v",
  love_you: "i_love_you_hand_sign",
  rock_on: "the_horns",
  metal: "the_horns",
  call_me: "call_me_hand",
  point_up: "point_up",
  point_down: "point_down",
  point_left: "point_left",
  point_right: "point_right",
  middle_finger: "middle_finger",
  fist: "fist",
  punch: "facepunch",
  handshake: "handshake",
  writing: "writing_hand",
  nail_polish: "nail_care",
  selfie: "selfie",
  muscle: "muscle",
  flex: "muscle",
  strong: "muscle",
  brain: "brain",

  // Hearts
  red_heart: "heart",
  love: "heart",
  heart_exclamation: "heavy_heart_exclamation_mark_ornament",
  broken_heart: "broken_heart",
  pink_heart: "pink_heart",
  orange_heart: "orange_heart",
  yellow_heart: "yellow_heart",
  green_heart: "green_heart",
  blue_heart: "blue_heart",
  purple_heart: "purple_heart",
  black_heart: "black_heart",
  white_heart: "white_heart",
  brown_heart: "brown_heart",
  sparkling_heart: "sparkling_heart",
  heartbeat: "heartbeat",
  heartpulse: "heartpulse",
  two_hearts: "two_hearts",
  revolving_hearts: "revolving_hearts",
  heart_decoration: "heart_decoration",
  cupid: "cupid",
  gift_heart: "gift_heart",
  heart_on_fire: "heart_on_fire",
  mending_heart: "mending_heart",

  // Animals
  unicorn: "unicorn_face",
  dog: "dog",
  puppy: "dog",
  cat: "cat",
  kitty: "cat",
  fox: "fox_face",
  bear: "bear",
  panda: "panda_face",
  monkey: "monkey",
  penguin: "penguin",
  chick: "hatching_chick",
  bird: "bird",
  eagle: "eagle",
  butterfly: "butterfly",
  bee: "bee",
  bug: "bug",
  ladybug: "lady_beetle",
  spider: "spider",
  snake: "snake",
  turtle: "turtle",
  octopus: "octopus",
  whale: "whale",
  dolphin: "dolphin",
  fish: "fish",
  shark: "shark",
  crab: "crab",
  shrimp: "shrimp",
  squid: "squid",
  lion: "lion_face",
  tiger: "tiger",
  horse: "horse",
  cow: "cow",
  pig: "pig",
  sheep: "sheep",
  goat: "goat",
  rabbit: "rabbit",
  frog: "frog",
  dragon: "dragon_face",
  dinosaur: "t-rex",
  trex: "t-rex",

  // Nature & weather
  sun: "sunny",
  sunshine: "sunny",
  moon: "crescent_moon",
  star: "star",
  stars: "sparkles",
  sparkle: "sparkles",
  glitter: "sparkles",
  earth: "earth_africa",
  globe: "globe_with_meridians",
  world: "earth_americas",
  wind: "dash",
  tornado: "tornado",
  rainbow: "rainbow",
  cloud: "cloud",
  rain: "cloud_with_rain",
  snow: "snowflake",
  snowflake: "snowflake",
  thunder: "cloud_with_lightning",
  lightning: "zap",
  zap: "zap",
  electric: "zap",
  comet: "comet",
  volcano: "volcano",
  wave_water: "ocean",
  ocean: "ocean",
  droplet: "droplet",
  water: "droplet",

  // Plants & flowers
  flower: "blossom",
  blossom: "cherry_blossom",
  rose: "rose",
  tulip: "tulip",
  sunflower: "sunflower",
  hibiscus: "hibiscus",
  cherry_blossom: "cherry_blossom",
  bouquet: "bouquet",
  tree: "evergreen_tree",
  palm: "palm_tree",
  cactus: "cactus",
  clover: "four_leaf_clover",
  lucky: "four_leaf_clover",
  shamrock: "shamrock",
  mushroom: "mushroom",
  leaf: "leaves",
  herb: "herb",
  seedling: "seedling",
  plant: "seedling",

  // Food & drink
  cherry: "cherries",
  apple: "apple",
  banana: "banana",
  grape: "grapes",
  watermelon: "watermelon",
  strawberry: "strawberry",
  peach: "peach",
  mango: "mango",
  pineapple: "pineapple",
  coconut: "coconut",
  avocado: "avocado",
  tomato: "tomato",
  corn: "corn",
  pepper: "hot_pepper",
  hot_pepper: "hot_pepper",
  pizza: "pizza",
  burger: "hamburger",
  hamburger: "hamburger",
  fries: "fries",
  hot_dog: "hotdog",
  hotdog: "hotdog",
  taco: "taco",
  burrito: "burrito",
  egg: "egg",
  cooking: "cooking",
  bread: "bread",
  croissant: "croissant",
  pancake: "pancakes",
  pancakes: "pancakes",
  waffle: "waffle",
  cheese: "cheese_wedge",
  salad: "green_salad",
  steak: "cut_of_meat",
  meat: "cut_of_meat",
  chicken: "poultry_leg",
  sushi: "sushi",
  ramen: "ramen",
  noodles: "ramen",
  spaghetti: "spaghetti",
  pasta: "spaghetti",
  rice: "rice",
  curry: "curry",
  cake: "cake",
  birthday_cake: "birthday",
  cupcake: "cupcake",
  pie: "pie",
  chocolate: "chocolate_bar",
  candy: "candy",
  lollipop: "lollipop",
  donut: "doughnut",
  doughnut: "doughnut",
  cookie: "cookie",
  icecream: "ice_cream",
  ice_cream: "ice_cream",
  shaved_ice: "shaved_ice",
  honey: "honey_pot",
  coffee: "coffee",
  tea: "tea",
  wine: "wine_glass",
  beer: "beer",
  beers: "beers",
  cheers: "clinking_glasses",
  cocktail: "cocktail",
  tropical_drink: "tropical_drink",
  champagne: "champagne",
  bubble_tea: "bubble_tea",
  boba: "bubble_tea",
  juice: "beverage_box",
  milk: "glass_of_milk",

  // Objects & tools
  lightbulb: "bulb",
  light_bulb: "bulb",
  idea: "bulb",
  target: "dart",
  bullseye: "dart",
  goal: "dart",
  confetti: "confetti_ball",
  balloon: "balloon",
  gift: "gift",
  present: "gift",
  trophy: "trophy",
  medal: "sports_medal",
  crown: "crown",
  king: "crown",
  queen: "crown",
  gem: "gem",
  diamond: "gem",
  ring: "ring",
  key: "key",
  lock: "lock",
  unlock: "unlock",
  pin: "pushpin",
  paperclip: "paperclip",
  scissors: "scissors",
  pencil: "memo",
  pen: "pen",
  crayon: "crayon",
  paintbrush: "paintbrush",
  palette: "art",
  art: "art",
  camera: "camera",
  photo: "camera",
  video: "video_camera",
  film: "film_frames",
  tv: "tv",
  computer: "computer",
  laptop: "computer",
  desktop: "desktop_computer",
  keyboard: "keyboard",
  mouse: "computer_mouse",
  phone: "iphone",
  mobile: "iphone",
  battery: "battery",
  plug: "electric_plug",
  search: "mag",
  magnifying: "mag",
  magnifying_glass: "mag",
  microscope: "microscope",
  telescope: "telescope",
  music: "musical_note",
  note: "musical_note",
  notes: "notes",
  guitar: "guitar",
  piano: "musical_keyboard",
  drum: "drum_with_drumsticks",
  microphone: "microphone",
  headphones: "headphones",
  speaker: "speaker",
  bell: "bell",
  megaphone: "mega",
  loudspeaker: "loudspeaker",
  mail: "e-mail",
  email: "e-mail",
  envelope: "envelope",
  inbox: "inbox_tray",
  outbox: "outbox_tray",
  package: "package",
  box: "package",
  newspaper: "newspaper",
  open_book: "book",
  books: "books",
  notebook: "notebook",
  bookmark: "bookmark",
  label: "label",
  tag: "label",
  clipboard: "clipboard",
  calendar: "calendar",
  chart: "chart_with_upwards_trend",
  graph: "chart_with_upwards_trend",
  trending_up: "chart_with_upwards_trend",
  trending_down: "chart_with_downwards_trend",
  bar_chart: "bar_chart",
  money: "money_with_wings",
  dollar: "dollar",
  cash: "money_with_wings",
  credit_card: "credit_card",
  bank: "bank",
  coin: "coin",
  receipt: "receipt",
  shopping: "shopping_cart",
  cart: "shopping_cart",
  bag: "shopping_bags",
  wrench: "wrench",
  hammer: "hammer",
  tools: "hammer_and_wrench",
  gear: "gear",
  settings: "gear",
  config: "gear",
  link: "link",
  chain: "link",
  magnet: "magnet",
  hook: "hook",
  ladder: "ladder",
  shield: "shield",
  sword: "crossed_swords",
  bomb: "bomb",
  dynamite: "firecracker",
  axe: "axe",
  dagger: "dagger_knife",
  bow: "bow_and_arrow",
  puzzle: "jigsaw",
  jigsaw: "jigsaw",
  dice: "game_die",
  chess: "chess_pawn",
  joystick: "joystick",
  controller: "video_game",
  gamepad: "video_game",
  lamp: "bulb",
  candle: "candle",
  flashlight: "flashlight",
  lantern: "izakaya_lantern",
  hourglass: "hourglass",
  timer: "timer_clock",
  alarm: "alarm_clock",
  clock: "clock1",
  watch: "watch",
  compass: "compass",
  map: "world_map",
  thermometer: "thermometer",
  umbrella: "umbrella",
  tent: "tent",
  camping: "tent",

  // Transport & places
  car: "red_car",
  taxi: "taxi",
  bus: "bus",
  truck: "truck",
  ambulance: "ambulance",
  fire_truck: "fire_engine",
  police_car: "police_car",
  bike: "bike",
  bicycle: "bike",
  motorcycle: "racing_motorcycle",
  train: "train",
  airplane: "airplane",
  plane: "airplane",
  rocket: "rocket",
  launch: "rocket",
  ship: "ship",
  boat: "sailboat",
  helicopter: "helicopter",
  satellite: "artificial_satellite",
  ufo: "flying_saucer",
  house: "house",
  home: "house",
  building: "office",
  school: "school",
  hospital: "hospital",
  church: "church",
  mosque: "mosque",
  castle: "european_castle",
  stadium: "stadium",
  ferris_wheel: "ferris_wheel",
  roller_coaster: "roller_coaster",
  camping_site: "camping",
  beach: "beach_with_umbrella",
  island: "desert_island",
  mountain: "mountain",
  night: "night_with_stars",
  sunset: "city_sunrise",
  sunrise: "sunrise",

  // Activities & sports
  soccer: "soccer",
  football: "football",
  basketball: "basketball",
  baseball: "baseball",
  tennis: "tennis",
  volleyball: "volleyball",
  rugby: "rugby_football",
  bowling: "bowling",
  golf: "golf",
  fishing: "fishing_pole_and_fish",
  skiing: "ski",
  snowboard: "snowboarder",
  surfing: "surfing_man",
  swimming: "swimming_man",
  running: "running_man",
  walking: "walking_man",
  dancing: "dancer",
  yoga: "lotus_position",
  meditation: "lotus_position",
  gym: "weight_lifting_man",
  boxing: "boxing_glove",
  martial_arts: "martial_arts_uniform",

  // Celebrations & events
  party: "tada",
  party_popper: "tada",
  celebrate: "tada",
  celebration: "tada",
  collision: "boom",
  explosion: "boom",
  firecracker: "firecracker",
  fireworks: "fireworks",
  sparkler: "sparkler",
  christmas_tree: "christmas_tree",
  xmas: "christmas_tree",
  santa: "santa",
  snowman: "snowman",
  easter: "egg",
  halloween: "jack_o_lantern",
  sweat: "sweat_drops",

  // Flags & misc
  flag: "triangular_flag_on_post",
  checkered_flag: "checkered_flag",
  pirate: "pirate_flag",
  white_flag: "white_flag",
  rainbow_flag: "rainbow-flag",

  // People
  baby: "baby",
  boy: "boy",
  girl: "girl",
  man: "man",
  woman: "woman",
  old_man: "older_man",
  old_woman: "older_woman",
  cop: "police_officer",
  detective: "detective",
  ninja: "ninja",
  astronaut: "astronaut",
  scientist: "scientist",
  technologist: "technologist",
  developer: "technologist",
  programmer: "technologist",
  coder: "technologist",
  artist: "artist",
  cook: "cook",
  chef: "cook",
  teacher: "teacher",
  student: "student",
  pilot: "pilot",
  firefighter: "firefighter",
  mage: "mage",
  wizard: "mage",
  fairy: "fairy",
  vampire: "vampire",
  zombie: "zombie",
  mermaid: "mermaid",
  elf: "elf",
  genie: "genie",
  superhero: "superhero",
  supervillain: "supervillain",

  // Tech & coding
  code: "technologist",
  terminal: "desktop_computer",
  database: "floppy_disk",
  save: "floppy_disk",
  floppy: "floppy_disk",
  cd: "cd",
  dvd: "dvd",
  usb: "electric_plug",
  wifi: "signal_strength",
  satellite_dish: "satellite_antenna",
  antenna: "satellite_antenna",
  robot_arm: "mechanical_arm",
  prosthetic: "mechanical_arm",
  dna: "dna",
  atom: "atom_symbol",
  science: "test_tube",
  experiment: "test_tube",
  petri_dish: "petri_dish",
  pill: "pill",
  syringe: "syringe",
  stethoscope: "stethoscope",
  xray: "x-ray",

  // Emotions & abstract
  fire: "fire",
  hot: "fire",
  lit: "fire",
  hundred: "100",
  perfect: "100",
  zzz: "zzz",
  sleep: "zzz",
  eyes: "eyes",
  eye: "eye",
  tongue: "tongue",
  lips: "lips",
  ear: "ear",
  nose: "nose",
  footprints: "footprints",
  bone: "bone",
  tooth: "tooth",
  speech_bubble: "speech_balloon",
  thought_bubble: "thought_balloon",
  anger: "anger",
  dizzy: "dizzy",
  hole: "hole",
  bubbles: "bubbles",
}

const replaceEmojiShortcodes = (value: string) => {
    return value.replace(/:([a-zA-Z0-9_+-]+):/g, (match, shortcode) => {
      const filename =
        emojiShortcodeMap.get(shortcode) ||
        emojiShortcodeMap.get(shortcode.replace(/_face$/, "")) ||
        emojiShortcodeMap.get(SHORTCODE_ALIASES[shortcode] || "")
      if (!filename) return match
      return `![${shortcode}](/apple-emoji/64/${filename}.png)`
    })
  }

const INITIAL_COMPONENTS: Partial<Components> = {
  code: function CodeComponent({ className, children, ...props }) {
    const isInline =
      !props.node?.position?.start.line ||
      props.node?.position?.start.line === props.node?.position?.end.line

    if (isInline) {
      return (
        <span
          className={cn(
            "bg-primary-foreground rounded-sm px-1 font-mono text-sm",
            className
          )}
          {...props}
        >
          {children}
        </span>
      )
    }

    const { language, filename } = parseCodeMeta(className)

    return (
      <CodeBlock className={className}>
        <CodeBlockGroup className="flex h-9 items-center justify-between border-b px-4">
          <div className="flex items-center gap-2">
            <div className="text-muted-foreground font-mono text-xs uppercase tracking-wider">
              {language}
            </div>
            {filename && (
              <>
                <div className="bg-border h-3 w-px" />
                <div className="text-muted-foreground font-mono text-xs italic">
                  {filename}
                </div>
              </>
            )}
          </div>
        </CodeBlockGroup>
        <div className="sticky top-16 lg:top-0">
          <div className="absolute right-0 bottom-0 flex h-9 items-center gap-1.5 pr-1.5">
            {language === "html" && <HtmlPreview code={children as string} />}
            <div className="bg-border h-4 w-px mx-0.5" />
            <ButtonCopy code={children as string} />
          </div>
        </div>
        <CodeBlockCode code={children as string} language={language} />
      </CodeBlock>
    )
  },
  a: function AComponent({ href, children, ...props }) {
    if (!href) return <span {...props}>{children}</span>

    return (
      <LinkMarkdown href={href} {...props}>
        {children}
      </LinkMarkdown>
    )
  },
  img: function ImgComponent({ src, alt }) {
    if (!src) return null
    return (
      <img
        src={src}
        alt={alt || "emoji"}
        className="inline-block h-5 w-5 align-[-0.2em]"
        loading="lazy"
        draggable={false}
      />
    )
  },
  pre: function PreComponent({ children }) {
    return <>{children}</>
  },
}

const MemoizedMarkdownBlock = memo(
  function MarkdownBlock({
    content,
    components = INITIAL_COMPONENTS,
  }: {
    content: string
    components?: Partial<Components>
  }) {
    return (
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkBreaks]}
        components={components}
      >
        {content}
      </ReactMarkdown>
    )
  },
  function propsAreEqual(prevProps, nextProps) {
    return prevProps.content === nextProps.content
  }
)

MemoizedMarkdownBlock.displayName = "MemoizedMarkdownBlock"

    function MarkdownComponent({
      children,
      id,
      className,
      components = INITIAL_COMPONENTS,
      isStreaming = false,
    }: MarkdownProps) {
      const generatedId = useId()
      const blockId = id ?? generatedId
      
      // Support for /text/ as italics (alternative)
        const processedChildren = useMemo(() => {
          if (!children) return children
          const italicized = children.replace(
            /(?<=\s|^)\/([^\/\s][^\/]*[^\/\s])\/(?=\s|$|[.,!?;])/g,
            "*$1*"
          )
          return replaceEmojiShortcodes(italicized)
        }, [children])
  
    return (
      <div className={className} key={blockId}>
        <MemoizedMarkdownBlock
          content={processedChildren}
          components={components}
        />
      </div>
    )
    }



const Markdown = memo(MarkdownComponent)
Markdown.displayName = "Markdown"

export { Markdown }
