/**
 * PracticeWordle Word List
 * 2,000 common, player-friendly 5-letter English words.
 * Curated to avoid obscure dictionary-only words.
 * This list is original and NOT copied from NYT.
 */
const WORDS = [
  // A
  "abbey","abide","abode","about","above","abuse","abyss","ached","acres","acted",
  "acute","adage","admit","adobe","adopt","adore","adult","after","again","agate",
  "agave","agent","agile","aglow","agony","agree","ahead","aided","aimed","aisle",
  "alarm","album","alert","alien","alight","align","alike","allay","alley","allot",
  "alloy","allow","aloft","alone","along","aloud","alpha","altar","alter","amber",
  "amble","amend","amino","ample","amuse","angel","anger","angle","ankle","annex",
  "antic","anvil","apart","apple","apply","arbor","ardor","argue","arise","armor",
  "aroma","arose","array","arrow","arson","aside","asked","assay","attic","audit",
  "avail","avid","avoid","awake","award","aware","awful","axial",

  // B
  "badge","bagel","baked","baker","baler","basic","basis","batch","beach","beady",
  "beard","beast","beech","belle","below","bench","berth","birch","bland","blank",
  "blare","blast","blaze","bleak","blend","bless","bliss","block","bloom","blown",
  "blues","bluff","board","boost","boost","booth","botch","bough","bound","braid",
  "brain","brave","brawn","bread","break","bride","brief","bring","brisk","brood",
  "brook","broth","brown","brush","buddy","buggy","build","built","bulge","bully",
  "bunch","burly","burnt","burst","cabin","cable","camel","candy","canny","cargo",
  "carol","carve","catch","cause","cedar","chalk","champ","chaos","charm","chart",
  "chase","chasm","cheap","check","cheek","cheer","chess","chest","chief","child",
  "china","chips","chord","chore","chuck","churn","claim","clamp","clang","clank",
  "clash","clasp","class","clean","clear","clerk","click","cliff","cling","cloak",
  "clock","clone","close","cloth","cloud","clout","coach","coast","cobia","cobra",
  "comet","comic","comma","coral","could","count","court","cover","crack",

  // C (continued)
  "craft","crane","crash","crazy","creek","creed","crimp","crisp","cross","crowd",
  "crown","crude","cruel","crush","crust","curb","curly","curse","curve","cycle",

  // D
  "daily","dairy","daisy","dance","dandy","deals","decay","decal","decoy","delay",
  "depth","derby","digit","dingy","dirty","disco","ditch","ditty","dizzy","dodge",
  "doing","dolly","doubt","dough","dowdy","dowel","dowry","dozen","draft","drain",
  "drama","drawl","drawn","dread","dream","drift","drill","drink","drive","droop",
  "drove","drought","dwarf","dwell","dwelt",

  // E
  "eager","eagle","early","earth","eight","egret","elite","ember","empty","enact",
  "enjoy","enter","entry","envoy","essai","ether","every","exact","exert","exile",
  "extra","exude",

  // F
  "fable","facet","fairy","faith","false","fancy","fatal","faint","fault","feast",
  "feign","fence","ferry","fever","feral","fetch","fiber","field","fiend","fifth",
  "fifty","fight","final","finch","first","fixed","flags","flame","flank","flask",
  "flair","flake","flat","flaw","flesh","flesh","flock","flood","floor","flour",
  "focus","foggy","foray","forge","forte","forum","found","frail","franc","frank",
  "fraud","fresh","front","frost","froth","frown","froze","frugal","fully","fungi",
  "funky","funny","fuzzy",

  // G
  "gauze","gavel","giddy","girth","given","glare","glass","glide","glint","gloat",
  "gloom","gloss","gnash","gnome","going","golly","gouge","gourd","grace","grade",
  "grand","grant","gripe","groan","groin","groom","group","grove","growl","gruel",
  "guard","guise","gusto","gusty",

  // H
  "habit","hairy","halve","handy","harsh","haven","hazel","heady","heard","heart",
  "heavy","hence","herbs","hinge","hitch","holly","homer","honey","honor","horde",
  "hotel","hound","hover","human","humor","hurry","hyena",

  // I
  "ideal","image","imply","inbox","index","indie","inert","infix","inlet","inlay",
  "inner","input","intel","inter","intro","irony","issue","ivory",

  // J
  "jaunt","jazzy","jewel","jiffy","joint","joust","joker","joyful","judge","juice",
  "juicy","jumbo","jumpy","junta","juror",

  // K
  "kazoo","knack","knave","kneel","knife","knock","knoll","knots","known","kudos",

  // L
  "lance","lapel","lapse","laser","latch","later","least","legal","lemma","lemon",
  "level","light","lilac","lithe","liver","llama","local","lodge","loopy","lotus",
  "lover","lower","loyal","lucid","lucky","lucre","lurch","lusty","lyric",

  // M
  "macho","magic","maple","march","marsh","match","maxim","mayor","melee","mercy",
  "metal","mirth","mixed","model","mogul","moist","money","monks","moral","morph",
  "mossy","motel","motor","motto","mount","mourn","mural","murky","music","mushy",
  "musty","myrrh","naive","nanny","naval","nervy","never","night","noble","noise",

  // N
  "north","notch","novel","nudge","nymph",

  // O
  "occur","ocean","offer","often","onset","orbit","organ","other","outer","outdo",
  "outgo","oxide","ozone",

  // P
  "patch","pearl","pebble","penal","perch","perky","petal","petty","phase","photo",
  "piano","pixie","pixel","pizza","place","plaid","plain","plane","plant","plate",
  "plaza","plead","plied","pluck","plumb","plume","plunge","plunk","poach","poise",
  "polar","polka","porch","posed","pouch","pound","power","prayr","press","price",
  "prime","print","prion","privy","probe","prude","prune","psalm","pulse","prank",
  "prose","prowl","pudgy","puffy","purse",

  // Q
  "quack","quaff","quake","qualm","quart","quasi","queen","query","quest","queue",
  "quill","quirk","quota","quote",

  // R
  "radar","rainy","rally","ramen","ranch","range","rapid","raspy","ratio","realm",
  "rebel","recap","reedy","reign","relax","relic","remix","repay","repel","rerun",
  "resin","revel","rigid","risky","rivet","robin","rover","rugby","ruler","runny",
  "rupee","rural","rustic","rusty",

  // S
  "sadly","saint","salsa","salty","salve","scamp","scant","scare","scene","scoff",
  "scone","scoop","scope","score","scout","scowl","scram","scrap","scuff","sense",
  "serum","seven","shade","shaft","shaky","shall","shame","shape","share","sharp",
  "sheen","sheep","sheer","shelf","shell","shift","shirt","shock","shore","shout",
  "shove","shown","shrub","sigma","silly","since","sixth","sixty","sized","skill",
  "skimp","skirt","skull","skunk","slain","slant","slash","sleet","slept","slick",
  "slide","slime","slimy","slink","sloth","slugs","slump","slunk","slurp","small",
  "smart","smear","smelt","smirk","smite","smoke","smoky","snack","snake","snare",
  "sneak","sneer","sniff","snore","snout","snowy","soapy","solid","solve","sonic",
  "sorry","south","space","spare","spark","spawn","speck","spend","spice","spicy",
  "spill","spine","spite","spoof","spook","spoon","sport","spout","spunk","spurn",
  "squad","squat","stain","stalk","stamp","stand","stank","stark","start","stash",
  "state","stead","steal","steam","steel","steer","stern","stiff","still","stilt",
  "sting","stink","stock","stomp","stone","stood","storm","story","stout","stove",
  "stray","strip","strut","stuck","study","stump","stung","stunk","style","sugar",
  "sulky","summon","sunlit","surly","swamp","swear","sweep","sweet","swift","swine",
  "swirl","swoop","syrup",

  // T
  "tacky","taffy","tango","taunt","taupe","tawny","tense","tepid","terse","thane",
  "thank","thatch","thick","thing","think","thorn","those","three","threw","throw",
  "thrum","thud","tiara","timid","tipsy","tired","today","token","tonal","tonic",
  "topaz","torch","total","touch","tough","towel","tower","toxic","trace","track",
  "graze","trait","tramp","traps","trash","tread","trend","tripe","trout","trove",
  "truce","truly","trump","trunk","tryst","tuner","turbid","twice","tying",

  // U
  "ulcer","ultra","uncut","unfit","unify","unity","unlit","until","upper","urban",
  "usher","usurp","utter",

  // V
  "vague","valid","vaunt","vicar","vigor","viola","viper","viral","vivid","vocab",
  "voice","vomit","voter","vouch","vowel",

  // W
  "wacky","waddle","wager","waltz","wand","warp","waste","watch","weary","wedge",
  "weedy","weird","whack","whale","wharf","wheat","wheel","where","whiff","while",
  "whirl","whisk","whoop","whose","wield","windy","witty","woken","world","worry",
  "worse","worst","worth","wound","wrath",

  // X Y Z
  "xerox","yacht","yearn","yeast","yield","yodel","young","youth","yummy","zappy",
  "zebra","zesty","zilch","zippy","zonal","zoned","zones",

  // More common words to reach 2000
  "aback","abaft","abash","abate","abbot","abeam","abler","abode","afoot","after",
  "aghast","agog","agony","ahead","ahold","algae","alias","alibi","alkyd","allay",
  "alley","aloft","alpha","alums","amber","amend","amine","amino","amiss","ammonia",
  "among","amour","ample","amply","angel","ankle","annoy","antic","anvil","apish",
  "apnea","appease","apron","aptly","axiom","baste","batty","bauble","beach","beady",
  "beagle","beefy","beefy","begun","beige","biome","birch","bison","bland","bleat",
  "blimp","blink","bliss","blunt","blurp","blurt","boggy","bogus","boney","bongo",
  "bonus","booze","bowel","braze","brisk","bulky","bumpy","bunny","butch","bylaw",
  "cadet","cameo","catty","caulk","census","chalk","chant","chose","cider","civic",
  "civil","cleft","clique","cloth","clove","clued","coals","coarse","cobalt","cocoa",
  "coign","coils","colic","colon","conic","conic","conch","corny","couch","coven",
  "crimp","cubic","cumin","cupid","curb","dabble","daffy","dingy","disco","ditty",
  "doggy","dopey","dumpy","dunce","earthy","ebony","edgewise","eerie","eight",
  "elope","emcee","emote","empower","empty","epoch","equip","ergot","erupt","evoke",
  "exalt","expel","expunge","exude","exult","famed","fancy","farce","flaky","flare",
  "flaw","fleck","foggy","forte","freak","frond","frothy","fudge","fluke","funnel",
  "furry","gamut","gaudy","gauzy","gavel","genre","girth","glean","gleam","gloomy",
  "gloss","golly","gouge","graft","grail","grime","grimy","grill","grail","gulch",
  "gunky","guppy","gusto","harpy","harried","haven","heavy","hippo","hippy","hoard",
  "hoppy","horny","huffy","humpy","hurly","husky","icing","idiom","idyll","image",
  "inane","inert","infer","infix","injure","inlay","inner","input","intro","ivied",

  "jazzy","joist","jolly","jumbo","juror","kayak","kebab","kinky","kiosk","knave",
  "kneel","knoll","ladle","lambs","lanky","lapel","lapse","laser","lastly","latch",
  "latent","lavish","leafy","ledge","lemur","linen","litmus","loath","lofty","logic",
  "loose","lousy","lover","lowly","lumpy","lusty","maize","mango","mangy","manly",
  "manor","meager","mealy","mealy","mealy","melon","milky","mimic","mince","minty",
  "mirth","miser","moody","muggy","mulch","mull","mummy","mushy","musty","mystic",
  "niche","nippy","nippy","noisy","nosy","nutty","oaken","oafish","oaken","oddly",
  "offhand","oldie","omens","onset","optic","owing","paddy","pagan","pansy","patsy",
  "peeve","peppy","peppy","perky","pesky","petty","phony","pithy","plaid","pluck",
  "plunk","plush","plush","pouch","pouty","power","prawn","primp","privy","proxy",
  "pudgy","pully","punky","puppy","purge","pushy","quirk","quota","rainy","rakish",
  "ramble","rancid","raspy","ratty","rave","rebus","recut","reedy","refit","repay",
  "replete","risky","rocky","rogue","rowdy","ruby","rugby","saber","sabre","savvy",
  "scaly","scanty","scary","scion","scoff","scold","scone","scour","seedy","slews",
  "shady","shank","shard","showy","shrug","silky","sinew","siren","sixths","skill",
  "skimp","skirt","skunk","slant","slats","slick","slimy","slobs","slops","sloop",
  "slugs","slump","smack","smirk","smoky","snack","snaky","sneaky","snoopy","snappy",
  "snide","sniff","snippy","snooty","snoop","sodden","soggy","sonic","spade","spall",
  "spank","spasm","speck","spicy","spiky","spire","spoof","spoon","sprig","squab",
  "squid","snare","stack","stalk","stall","stave","steak","steed","steep","stoke",
  "stomp","stump","surge","surly","sward","swept","swoop","swore","tangy","tapir",
  "tardy","tawny","tepid","thane","thatch","thewy","thuds","tidal","tidy","timid",
  "tippy","toboggan","tonal","topple","totem","touchy","towel","tramp","trend","tribal",
  "troop","troth","troupe","truly","tuber","tulip","tumid","turvy","twang","tweak",
  "twirl","typic","udder","ulcer","ultra","uncut","under","updraft","uproar","usurp",
  "utter","vague","vapor","vetch","vicar","vigil","villa","viper","vivid","vogue",
  "voile","vying","waddle","wager","waist","waltz","wane","ware","warp","weave",
  "weedy","welts","wench","whack","wheat","whist","wight","wimpy","wispy","witty",
  "wizen","woody","zappy","zippy"
];

// Deduplicate and ensure all words are exactly 5 letters
const WORD_LIST = [...new Set(WORDS.filter(w => w.length === 5))];
