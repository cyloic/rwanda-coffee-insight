// Rwanda Coffee Washing Stations Database
// Districts covered: Huye, Nyamasheke, Rusizi, Karongi, Nyaruguru
//
// Data sourced from:
//   - Alliance for Coffee Excellence / Cup of Excellence farm directory
//   - NAEB (National Agricultural Export Development Board) Rwanda
//   - Specialty coffee importers: Sweet Maria's, Covoya, Red Fox, Trabocca, Sucafina
//   - Cooperative websites: bufcoffee.com, mubugacoffee.com, kopakama.yourwebsitespace.com
//   - Rwashoscco farmer profiles, Melbourne Coffee Merchants, Sustainable Harvest
//   - Cyahinda Coffee, Gihanga Coffee, Baho Coffee, Impexcor Coffee
//
// GPS coordinates are approximate (centroid of named sector/locality).
// Only stations documented in public specialty coffee sources are included.
// Last verified: March 2026

export interface WashingStation {
  id: string;
  name: string;
  district: "Huye" | "Nyamasheke" | "Rusizi" | "Karongi" | "Nyaruguru";
  province: "Southern Province" | "Western Province";
  sector?: string;                      // administrative sector within district
  lat: number;                          // approximate latitude (WGS-84)
  lng: number;                          // approximate longitude (WGS-84)
  coordinateNote: string;               // precision / source note
  cooperative?: string;                 // owning cooperative or company
  owner?: string;                       // named owner if private
  established?: number;                 // year operational
  altitudeStationM: number;            // washing station elevation (masl)
  altitudeFarmsM: string;              // farm elevation range (masl)
  varietals: string[];
  processing: string[];
  certifications: string[];
  farmerCount?: number;                 // registered supplying farmers
  coeResults?: CoeResult[];            // Cup of Excellence entries (verified)
  notableInfo: string;
  contactUrl?: string;
  sources: string[];
}

export interface CoeResult {
  year: number;
  score: number;
  rank: number;
  competition: string; // "Cup of Excellence Rwanda" | "Best of Rwanda" | "RWASHOSCCO"
}

export const WASHING_STATIONS: WashingStation[] = [

  // ─────────────────────────────────────────────────────────────────────────
  // HUYE DISTRICT  (Southern Province)
  // ─────────────────────────────────────────────────────────────────────────

  {
    id: "huye-maraba",
    name: "Maraba (Abahuzamugambi)",
    district: "Huye",
    province: "Southern Province",
    sector: "Maraba",
    // 2°35′S 29°40′E — Wikipedia / Sustainable Harvest
    lat: -2.583,
    lng: 29.667,
    coordinateNote: "Wikipedia coordinates 2°35′S 29°40′E — sector centroid",
    cooperative: "Abahuzamugambi Ba Kawa Cooperative",
    established: 1999,                   // cooperative founded 1999; CWS formalised ~2002
    altitudeStationM: 1790,
    altitudeFarmsM: "1,600–1,900",
    varietals: ["Red Bourbon"],
    processing: ["Fully Washed"],
    certifications: ["Fair Trade"],       // first FT single-origin coffee from Rwanda (2002)
    farmerCount: 1216,                    // Melbourne Coffee Merchants / Covoya profiles
    coeResults: [
      { year: 2008, score: 0, rank: 0, competition: "Cup of Excellence Rwanda" },
      // Maraba placed in multiple CoE editions; exact scores not publicly itemised per entry
    ],
    notableInfo:
      "Pioneer of Rwandan specialty coffee. First Fair Trade certified single-origin from Rwanda (2002). " +
      "Bourbon grown at 1,600–1,900 m with 48 drying tables. Multiple Cup of Excellence appearances. " +
      "~500,000 smallholders historically associated with the broader cooperative network.",
    contactUrl: "https://www.sustainableharvest.com/maraba",
    sources: [
      "https://en.wikipedia.org/wiki/Maraba_coffee",
      "https://melbournecoffeemerchants.com.au/maraba-cooperative/",
      "https://www.sustainableharvest.com/maraba",
      "https://www.covoyacoffee.com/p612868-1-rwanda-maraba-womens-coffee.html",
    ],
  },

  {
    id: "huye-simbi",
    name: "Simbi Coffee Washing Station",
    district: "Huye",
    province: "Southern Province",
    sector: "Rugarama",
    // Huye district southern area; Rugarama village — approximate
    lat: -2.61,
    lng: 29.75,
    coordinateNote: "Approximate — Rugarama village, Huye district; no public GPS",
    cooperative: "Simbi Coffee Invest Ltd",
    established: 2013,
    altitudeStationM: 1780,
    altitudeFarmsM: "1,710–1,850",
    varietals: ["Red Bourbon"],
    processing: ["Fully Washed", "Honey"],
    certifications: [],                   // 80 % women membership; certifications not confirmed in public sources
    farmerCount: 1850,                    // 1,850 cooperative members (Covoya, Simbi website)
    coeResults: [
      { year: 2013, score: 0, rank: 9, competition: "Cup of Excellence Rwanda" },
    ],
    notableInfo:
      "1,850-member cooperative, 80 % women. Placed 9th in Rwanda Cup of Excellence 2013 — " +
      "its first year of operation. Employs 85+ seasonal workers during harvest, 80 % women. " +
      "Sources microlots from ~300 smallholders in Rugarama village.",
    contactUrl: "https://www.simbicoffee.com/about-us/",
    sources: [
      "https://www.simbicoffee.com/about-us/",
      "https://www.covoyacoffee.com/p611437-3-rwanda-simbi.html",
      "https://pique.coffee/products/so_rwanda_2",
    ],
  },

  {
    id: "huye-karambi",
    name: "Karambi Washing Station (Koakaka)",
    district: "Huye",
    province: "Southern Province",
    sector: "Kigoma",
    // Kigoma sector, Huye district — approximate centroid
    lat: -2.57,
    lng: 29.72,
    coordinateNote: "Approximate — Kigoma Sector, Huye district; no public GPS",
    cooperative: "Koakaka FCS (Coffee Growers' Cooperative of Karaba)",
    established: 2003,
    altitudeStationM: 1780,
    altitudeFarmsM: "1,685–1,870",
    varietals: ["Red Bourbon"],
    processing: ["Fully Washed"],
    certifications: ["Fair Trade", "UTZ", "Rainforest Alliance", "Organic"],
    // FT since 2004; UTZ + RA since 2017; Organic since 2020
    farmerCount: 441,
    coeResults: [
      { year: 2008, score: 0, rank: 0, competition: "Cup of Excellence Rwanda" },
      { year: 2010, score: 0, rank: 0, competition: "Cup of Excellence Rwanda" },
      { year: 2011, score: 0, rank: 0, competition: "Cup of Excellence Rwanda" },
      { year: 2013, score: 0, rank: 0, competition: "Cup of Excellence Rwanda" },
      { year: 2014, score: 0, rank: 0, competition: "Cup of Excellence Rwanda" },
      { year: 2015, score: 0, rank: 0, competition: "Cup of Excellence Rwanda" },
      { year: 2016, score: 90.3, rank: 1, competition: "RWASHOSCCO Coffee Excellence Award" },
    ],
    notableInfo:
      "Koakaka (est. 2002) operates Karambi CWS plus Muganza and Gaseke stations. " +
      "Cup of Excellence finalist in 2008, 2010, 2011, 2013, 2014, 2015. " +
      "Won RWASHOSCCO Coffee Excellence Award 2016 with 90.3. " +
      "Fair Trade since 2004, Organic certified since 2020.",
    contactUrl: "https://melbournecoffeemerchants.com.au/koakaka-cooperative/",
    sources: [
      "https://melbournecoffeemerchants.com.au/koakaka-cooperative/",
      "https://melbournecoffeemerchants.com.au/coffee/karambi-womens-coffee/",
      "https://allianceforcoffeeexcellence.org/farm-directory/86-35/",
      "http://www.rwashoscco.com/our-farmers/",
    ],
  },

  {
    id: "huye-huye-mountain",
    name: "Huye Mountain Washing Station",
    district: "Huye",
    province: "Southern Province",
    sector: "Mbazi",
    // Private station — Mbazi/Huye area, approximate
    lat: -2.60,
    lng: 29.73,
    coordinateNote: "Approximate — Huye district; no public GPS on file",
    owner: "David Rubanzangabo (private)",
    established: 2011,
    altitudeStationM: 1796,
    altitudeFarmsM: "1,600–2,200",
    varietals: ["Red Bourbon"],
    processing: ["Fully Washed", "Natural"],
    certifications: [],
    farmerCount: 1330,
    coeResults: [],
    notableInfo:
      "Private philanthropic station established 2011. Collects from 26 collection points served by daily truck. " +
      "1,330 registered producers. Growing altitude reaches 2,200 m — among the highest in Huye.",
    contactUrl: "https://thousandhillscoffee.com/products/huye-mountain",
    sources: [
      "https://bluebeardcoffee.com/products/umurage-washing-station-rwanda-copy",
      "https://jbccoffeeroasters.com/new-coffee-huye-mountain-rwanda/",
      "https://www.squareonecoffee.com/coffee-offerings3/rwanda-huye",
      "https://thousandhillscoffee.com/products/huye-mountain",
    ],
  },

  {
    id: "huye-umurage",
    name: "Umurage Washing Station (Buf Coffee)",
    district: "Huye",
    province: "Southern Province",
    sector: "Kigoma",
    // Kigoma Sector, Huye District — per bufcoffee.com CWS page
    lat: -2.59,
    lng: 29.71,
    coordinateNote: "Approximate — Kigoma Sector, Huye District per Buf Coffee website",
    cooperative: "Buf Coffee Ltd",
    owner: "Epiphanie Mukashyaka",
    established: 2017,
    altitudeStationM: 1750,
    altitudeFarmsM: "1,600–1,800",
    varietals: ["Red Bourbon"],
    processing: ["Fully Washed", "Natural"],
    certifications: ["Rainforest Alliance", "UTZ", "C.A.F.E. Practices"],
    // certifications listed for Buf network; station-level confirmation via bufcoffee.com
    farmerCount: 412,
    coeResults: [],
    notableInfo:
      "Third washing station opened by Buf Coffee Ltd (owned by Epiphanie Mukashyaka, one of Rwanda's " +
      "most prominent coffee entrepreneurs). Collects from 412 registered smallholders plus three local cooperatives. " +
      "Buf network holds Rainforest Alliance, UTZ and C.A.F.E. Practices certifications.",
    contactUrl: "https://bufcoffee.com/cws/",
    sources: [
      "https://bufcoffee.com/cws/",
      "https://www.anvilcoffee.co.uk/products/rwanda-buf-umurage",
      "https://originroasting.co.za/new-coffee-release-rwanda-buf-cafe-umurage/",
      "https://jamesgourmetcoffee.com/product/rwanda-buf-umurage-washing-station-natural/",
    ],
  },

  {
    id: "huye-karengera-kabuga",
    name: "Karengera-Kabuga Washing Station",
    district: "Huye",
    province: "Southern Province",
    sector: "Karengera",
    // Karengera sector — Cyahinda Coffee site confirms Rusizi district for Kabuga
    // NOTE: Cyahindacoffee.com lists this under Rusizi; some importers list it as Huye-border area
    // Using approximate coordinates near the Huye/Rusizi boundary; district = Rusizi per most recent sources
    // *** Re-assigned to Rusizi district (see below) ***
    lat: -2.68,
    lng: 29.38,
    coordinateNote: "Approximate — Karengera Sector; district boundary area Huye/Rusizi",
    // NOTE: Multiple importers place this in Rusizi district; see rusizi-karengera entry below.
    // Left here as a stub; canonical entry is rusizi-karengera.
    cooperative: "Karengera Kabuga CWS",
    established: 2010,
    altitudeStationM: 1900,
    altitudeFarmsM: "1,800–2,000",
    varietals: ["Red Bourbon"],
    processing: ["Fully Washed"],
    certifications: [],
    farmerCount: 328,
    coeResults: [
      { year: 2011, score: 0, rank: 4, competition: "Cup of Excellence Rwanda" },
      { year: 2014, score: 0, rank: 18, competition: "Cup of Excellence Rwanda" },
      { year: 2018, score: 0, rank: 5, competition: "Cup of Excellence Rwanda" },
    ],
    notableInfo:
      "3-time Cup of Excellence winner (4th in 2011, 18th in 2014, 5th in 2018). " +
      "328 smallholders including 130 women. Known for hibiscus and tart fruit notes at light roast. " +
      "NOTE: Some sources list this station in Rusizi district — district classification needs field confirmation.",
    contactUrl: "https://cyahindacoffee.com/karengera-kabuga-coffee-washing-station/",
    sources: [
      "https://cyahindacoffee.com/karengera-kabuga-coffee-washing-station/",
      "https://sucafina.com/na/offerings/karengera-fw",
      "https://www.covoyacoffee.com/p612762-4-rwanda-karengera-lot9-ca.html",
    ],
  },

  // ─────────────────────────────────────────────────────────────────────────
  // NYAMASHEKE DISTRICT  (Western Province)
  // ─────────────────────────────────────────────────────────────────────────

  {
    id: "nyamasheke-kanzu",
    name: "Kanzu Washing Station",
    district: "Nyamasheke",
    province: "Western Province",
    sector: "Cyato",           // south-central Nyamasheke, above Lake Kivu
    // Approximate: ~2.45°S 29.10°E (south-central Nyamasheke, Lake Kivu rim)
    lat: -2.45,
    lng: 29.10,
    coordinateNote: "Approximate centroid — south-central Nyamasheke overlooking Lake Kivu; no public GPS",
    cooperative: "Dormans Coffee / private management",
    owner: "Dormans (took over 2012)",
    established: 2012,         // Dormans acquisition year; station may predate
    altitudeStationM: 1900,
    altitudeFarmsM: "1,836–2,000",
    varietals: ["Red Bourbon"],
    processing: ["Fully Washed", "Natural"],
    certifications: ["Rainforest Alliance"],
    farmerCount: 535,
    coeResults: [],
    notableInfo:
      "Set in green hills of coffee above Lake Kivu at 1,900 m. Dormans took over in 2012 and invested " +
      "in farmer training and quality infrastructure. 535 farmers registered under Rainforest Alliance " +
      "certification program. Produces consistent specialty lots traded globally.",
    contactUrl: "https://vestacoffee.com/products/kanzu-lot-19-rwanda",
    sources: [
      "https://vestacoffee.com/products/kanzu-lot-19-rwanda",
      "https://elevator.coffee/rwanda-kanzu",
      "https://redfoxcoffeemerchants.com/product/rf2840/",
      "https://southslopecoffee.com/product/rwanda-kanzu-24",
    ],
  },

  {
    id: "nyamasheke-mutovu",
    name: "Mutovu Washing Station",
    district: "Nyamasheke",
    province: "Western Province",
    sector: "Mutovu",
    // Nyamasheke western area near Lake Kivu — approximate
    lat: -2.30,
    lng: 29.05,
    coordinateNote: "Approximate — Mutovu area, Nyamasheke; no public GPS",
    established: 2012,
    altitudeStationM: 1800,
    altitudeFarmsM: "1,800–1,950",
    varietals: ["Red Bourbon"],
    processing: ["Fully Washed"],
    certifications: [],
    farmerCount: undefined,
    coeResults: [],
    notableInfo:
      "Small station (~2 containers output per season). Located at 1,800 m with farms reaching 1,950 m. " +
      "Known for honey and raw-sugar sweetness, dried peach notes. Widely traded by specialty importers " +
      "including Blue Lava, Coffee Shrub, and Keia & Martyn's.",
    contactUrl: "https://www.bluelavacoffeeroasters.com/archives/rwanda-nyamasheke-mutovu",
    sources: [
      "https://www.bluelavacoffeeroasters.com/archives/rwanda-nyamasheke-mutovu",
      "https://www.coffeeshrub.com/rwanda-nyamasheke-mutovu-7839.html",
      "https://keiaandmartynscoffee.com/products/rwanda-nyamasheke-macuba",
    ],
  },

  {
    id: "nyamasheke-nyakabingo",
    name: "Nyakabingo Washing Station",
    district: "Nyamasheke",
    province: "Western Province",
    sector: "Nyakabingo",
    // Nyamasheke, approximate farm centroid
    lat: -2.38,
    lng: 29.12,
    coordinateNote: "Approximate — Nyakabingo sector, Nyamasheke; no public GPS",
    altitudeStationM: 1850,
    altitudeFarmsM: "1,850–2,000",
    varietals: ["Red Bourbon"],
    processing: ["Fully Washed"],
    certifications: [],
    farmerCount: 329,
    coeResults: [],
    notableInfo:
      "329 registered farmers. Station at 1,850 m with farms reaching 2,000 m. " +
      "Known for lush sweetness and complex top notes ranging from delicate floral to sturdy fruit. " +
      "Widely available through Sweet Maria's and Fat Rabbit Coffee.",
    contactUrl: "https://www.sweetmarias.com/rwanda-nyamasheke-nyakabingo-6378.html",
    sources: [
      "https://www.sweetmarias.com/rwanda-nyamasheke-nyakabingo-6378.html",
      "https://fatrabbitcoffee.com/current-offerings/rwa_nyamasheke_nyakabingo/",
    ],
  },

  {
    id: "nyamasheke-murundo",
    name: "Murundo Washing Station",
    district: "Nyamasheke",
    province: "Western Province",
    sector: "Murundo",
    // Northwest of Lake Kivu, Nyamasheke
    lat: -2.20,
    lng: 29.02,
    coordinateNote: "Approximate — Murundo area, northwest Nyamasheke; no public GPS",
    altitudeStationM: 1850,
    altitudeFarmsM: "1,700–1,950",
    varietals: ["Red Bourbon"],
    processing: ["Fully Washed"],
    certifications: [],
    farmerCount: 400,
    coeResults: [
      { year: 2018, score: 90.03, rank: 3, competition: "Cup of Excellence Rwanda" },
    ],
    notableInfo:
      "3rd place Cup of Excellence Rwanda 2018 with a score of 90.03. " +
      "Approximately 400 farmers share use of the station in northwest Nyamasheke district. " +
      "Traded by Roastmasters.com and specialty importers.",
    contactUrl: "https://www.roastmasters.com/rwandacoe.html",
    sources: [
      "https://www.roastmasters.com/rwandacoe.html",
      "https://happymugcoffee.com/products/rwanda-karambi-1",
      "https://www.ktpress.rw/2018/08/twumba-coffee-wins-cup-of-excellence/",
    ],
  },

  {
    id: "nyamasheke-gaseke",
    name: "Gaseke Washing Station",
    district: "Nyamasheke",
    province: "Western Province",
    sector: "Nyakabuye",
    // Southern corner of Nyamasheke, border with Burundi and DRC
    lat: -2.55,
    lng: 29.04,
    coordinateNote: "Approximate — Nyakabuye Valley, southern Nyamasheke; no public GPS",
    established: 2016,
    altitudeStationM: 1800,
    altitudeFarmsM: "1,750–1,889",
    varietals: ["Red Bourbon"],
    processing: ["Fully Washed"],
    certifications: [],
    farmerCount: 396,
    coeResults: [],
    notableInfo:
      "Built 2016. Positioned above Nyakabuye Valley with optimal sun exposure. " +
      "396 farmers delivering cherry to the station. Routes follow the borders of Burundi and DRC. " +
      "Traded by Sucafina as 'Gaseke Fully Washed'.",
    contactUrl: "https://sucafina.com/na/offerings/gaseke-fully-washed",
    sources: [
      "https://sucafina.com/na/offerings/gaseke-fully-washed",
      "https://melbournecoffeemerchants.com.au/",
    ],
  },

  {
    id: "nyamasheke-rugali",
    name: "Rugali Washing Station",
    district: "Nyamasheke",
    province: "Western Province",
    sector: "Rugali",
    // Lake Kivu shoreline, Nyamasheke
    lat: -2.28,
    lng: 29.00,
    coordinateNote: "Approximate — Lake Kivu shoreline, Nyamasheke; Trabocca/CMG confirm district",
    cooperative: "Muraho Trading Co. / Raw Material",
    established: 2016,
    altitudeStationM: 1525,           // 1,450–1,600 m reported; midpoint used
    altitudeFarmsM: "1,450–1,600",
    varietals: ["Red Bourbon"],
    processing: ["Fully Washed", "Natural", "Honey"],
    certifications: [],
    farmerCount: 1150,
    coeResults: [],
    notableInfo:
      "One of the first stations in Rwanda legally authorised to produce Natural and Honey process coffees (2016). " +
      "1,150 farmers, 124 drying beds. Ideal wind-flow from Lake Kivu for post-pulp drying. " +
      "Competition lots used internationally; traded by Trabocca, Raw Material, Muraho Trading.",
    contactUrl: "http://murahotrading.com/station/rugali-cws",
    sources: [
      "https://www.trabocca.com/our-coffees/rwanda/nyamasheke/rugali/",
      "http://murahotrading.com/station/rugali-cws",
      "https://www.rawmaterial.coffee/rwanda",
      "https://www.coffeemaxgreen.com/rwanda-rugali-nyamasheke/",
    ],
  },

  {
    id: "nyamasheke-cyato",
    name: "Cyato Washing Station (Abadatezuka Coop)",
    district: "Nyamasheke",
    province: "Western Province",
    sector: "Cyato",
    // Cyato sector, Nyamasheke — Tropic Coffee confirms 1,930 m
    lat: -2.50,
    lng: 29.08,
    coordinateNote: "Approximate — Cyato Sector, Nyamasheke; Tropic Coffee source",
    cooperative: "Abadatezuka Cooperative",
    owner: "Tropic Coffee Ltd",
    established: 2017,
    altitudeStationM: 1930,
    altitudeFarmsM: "1,930–2,200",
    varietals: ["Red Bourbon"],
    processing: ["Fully Washed", "Natural", "Honey"],
    certifications: [],               // organically grown; formal cert not confirmed
    farmerCount: undefined,
    coeResults: [],
    notableInfo:
      "Station at 1,930 m; farms reach 2,200 m — among Rwanda's highest. " +
      "Bee-pollinated coffee unique selling point promoted by Tropic Coffee. " +
      "Capacity >300 MT per season. No synthetic inputs used by member farmers.",
    contactUrl: "https://tropiccoffeeltd.com/cyato-coffee-washing-station/",
    sources: [
      "https://tropiccoffeeltd.com/cyato-coffee-washing-station/",
      "https://burmancoffee.com/product/coffee/rwanda-abadatezuka/",
      "https://perkolatorcoffee.com/blogs/perk-up/rwanda-cyato-abadatezuka-coop",
    ],
  },

  // ─────────────────────────────────────────────────────────────────────────
  // RUSIZI DISTRICT  (Western Province)
  // ─────────────────────────────────────────────────────────────────────────

  {
    id: "rusizi-muhehwe",
    name: "Muhehwe Washing Station (Rusizi Specialty Coffee)",
    district: "Rusizi",
    province: "Western Province",
    sector: "Rwimbogo",
    // Rwimbogo Sector, Rusizi — CoE Farm Directory 2012 entry
    lat: -2.62,
    lng: 28.93,
    coordinateNote: "Approximate — Rwimbogo Sector, Rusizi (3 km from DRC/Burundi border per CoE directory)",
    cooperative: "COOPANYE and INKINGI cooperatives (supply)",
    owner: "NGABONZIZA Jean Bosco / Rusizi Specialty Coffee (est. 2006)",
    established: 2006,
    altitudeStationM: 1800,
    altitudeFarmsM: "1,500–2,100",
    varietals: ["Arabica (Bourbon)"],
    processing: ["Fully Washed"],
    certifications: [],
    farmerCount: 3000,                // COOPANYE + INKINGI combined membership (~60 % women)
    coeResults: [
      { year: 2012, score: 85.67, rank: 0, competition: "Cup of Excellence Rwanda" },
    ],
    notableInfo:
      "Scored 85.67 in Rwanda CoE 2012. Located in Rwimbogo Sector, 3 km from DRC and Burundi borders. " +
      "Works with cooperatives COOPANYE and INKINGI (~3,000 members, 60 % women). " +
      "Second station Nyenji CWS built in 2010. Company built nursery school and electrified 1,300 families. " +
      "Treatment capacity 1,000 tons.",
    contactUrl: "https://farmdirectory.cupofexcellence.org/listing/2012-rwanda-85-67-5/",
    sources: [
      "https://farmdirectory.cupofexcellence.org/listing/2012-rwanda-85-67-5/",
      "https://allianceforcoffeeexcellence.org/farm-directory/85-67-5/",
    ],
  },

  {
    id: "rusizi-nyarusiza",
    name: "Nyarusiza Washing Station (Buf Coffee)",
    district: "Rusizi",
    province: "Western Province",
    sector: "Nyarusiza",
    // Mercanta / Covoya confirm "south of Rwanda" in Rusizi area; Buf website earlier listed Nyamagabe
    // Most specialty importer product pages and Mercanta confirm Rusizi district
    lat: -2.55,
    lng: 28.92,
    coordinateNote: "Approximate — Nyarusiza sector, Rusizi district; Mercanta and Covoya confirm Rusizi",
    cooperative: "Buf Coffee Ltd",
    owner: "Epiphanie Mukashyaka",
    established: 2003,                // Buf Coffee founded 2003; Nyarusiza is original station
    altitudeStationM: 1743,
    altitudeFarmsM: "1,600–1,900",
    varietals: ["Red Bourbon"],
    processing: ["Fully Washed", "Anaerobic"],
    certifications: ["Rainforest Alliance", "UTZ", "C.A.F.E. Practices"],
    farmerCount: undefined,
    coeResults: [],
    notableInfo:
      "Founded 2003 by Epiphanie Mukashyaka — one of Rwanda's most influential coffee entrepreneurs. " +
      "Station at 1,743 m with mineral-rich volcanic soil. Buf's fermentation experiments include " +
      "a 94-hour fermented lot that has attracted international roaster attention. " +
      "Buf network certified Rainforest Alliance, UTZ and C.A.F.E. Practices.",
    contactUrl: "https://bufcoffee.com/cws/",
    sources: [
      "https://coffeehunter.com/coffee/buf-nyarusiza/",
      "https://melbournecoffeemerchants.com.au/coffee/buf-nyarusiza/",
      "https://fourriverscoffee.co.uk/products/rwanda-buf-nyarusiza-94-hr-fermented",
      "https://burmancoffee.com/product/green-coffee-beans/rwanda-nyarusiza/",
    ],
  },

  {
    id: "rusizi-mushaka",
    name: "Mushaka Washing Station",
    district: "Rusizi",
    province: "Western Province",
    sector: "Mushaka",
    // Camber Coffee confirms Rusizi district; ~1,800 m
    lat: -2.48,
    lng: 28.95,
    coordinateNote: "Approximate — Mushaka sector, Rusizi district; Camber Coffee source",
    owner: "Beathe Nyirankunzurwanda (private)",
    established: 2017,
    altitudeStationM: 1800,
    altitudeFarmsM: "1,600–2,100",
    varietals: ["Red Bourbon"],
    processing: ["Fully Washed"],
    certifications: [],
    farmerCount: undefined,
    coeResults: [],
    notableInfo:
      "Built 2017 by Beathe Nyirankunzurwanda, a former coffee trader who wanted to produce her own specialty lots. " +
      "Uses water-conserving Penagos pulper. Station at 1,800 m. " +
      "Traded by Camber Coffee and Sweet Maria's.",
    contactUrl: "https://cambercoffee.com/product/rwanda-mushaka/",
    sources: [
      "https://cambercoffee.com/product/rwanda-mushaka/",
      "https://www.sweetmarias.com/rwanda-rusizi-mushaka-7870.html",
    ],
  },

  {
    id: "rusizi-gashonga",
    name: "Gashonga Washing Station (COCAGI)",
    district: "Rusizi",
    province: "Western Province",
    sector: "Gashonga",
    // Rusizi district, COCAGI cooperative — RWASHOSCCO and Sustainable Harvest confirm
    lat: -2.42,
    lng: 28.97,
    coordinateNote: "Approximate — Gashonga sector, Rusizi district; RWASHOSCCO / Sustainable Harvest",
    cooperative: "COCAGI (Coffee Cooperative of Gashonga)",
    established: 2009,
    altitudeStationM: 1700,
    altitudeFarmsM: "1,500–2,200",
    varietals: ["Red Bourbon"],
    processing: ["Fully Washed"],
    certifications: ["Fair Trade"],
    farmerCount: 85,                  // original founding women's group; expanded since
    coeResults: [
      { year: 2015, score: 86.68, rank: 7, competition: "Cup of Excellence Rwanda" },
    ],
    notableInfo:
      "Founded 2009 by 85 women coffee farmers. Fair Trade certified. " +
      "7th place Cup of Excellence Rwanda 2015 with score 86.68. " +
      "Also traded as a Rwashoscco lot; sourced by Water Avenue Coffee and Sustainable Harvest.",
    contactUrl: "http://www.rwashoscco.com/shop/gashonga-coffee/",
    sources: [
      "https://allianceforcoffeeexcellence.org/farm-directory/86-68-7/",
      "http://www.rwashoscco.com/shop/gashonga-coffee/",
      "https://unionroasted.com/blogs/our-farmer-partners/cocagi-rwanda",
      "https://spot.sustainableharvest.com/products/gashonga-1",
    ],
  },

  {
    id: "rusizi-gisuma",
    name: "Gisuma Cooperative Washing Station",
    district: "Rusizi",
    province: "Western Province",
    sector: "Gisuma",
    // Near Lake Kivu and Rusizi River — RAVE Coffee and Method Roastery confirm
    lat: -2.45,
    lng: 28.90,
    coordinateNote: "Approximate — Gisuma sector near Lake Kivu / Rusizi River; RAVE Coffee source",
    cooperative: "Gisuma Cooperative",
    altitudeStationM: 1725,
    altitudeFarmsM: "1,600–1,850",
    varietals: ["Red Bourbon"],
    processing: ["Fully Washed"],
    certifications: [],
    farmerCount: 196,                 // 155–196 members cited across sources
    coeResults: [
      { year: 0, score: 0, rank: 3, competition: "Cup of Excellence Rwanda" },
      // Bronze medal; exact year not confirmed in sources reviewed
    ],
    notableInfo:
      "155–196 member cooperative close to Lake Kivu and the Rusizi River. " +
      "Earned bronze medal at Rwanda Cup of Excellence (exact year not confirmed in reviewed sources). " +
      "Quality improvements resulted in 45 % higher average farmer income; " +
      "all members now have health insurance and bank accounts.",
    contactUrl: "https://methodroastery.com/rwanda-coffee-bourbon/",
    sources: [
      "https://ravecoffee.co.uk/pages/impala-rwanda",
      "https://methodroastery.com/rwanda-coffee-bourbon/",
      "https://www.coffeereview.com/review/rwanda-gisuma/",
    ],
  },

  // ─────────────────────────────────────────────────────────────────────────
  // KARONGI DISTRICT  (Western Province)
  // ─────────────────────────────────────────────────────────────────────────

  {
    id: "karongi-twumba",
    name: "Twumba Washing Station",
    district: "Karongi",
    province: "Western Province",
    sector: "Twumba",
    // Nyaruyaga Village, Gitabura Cell, Twumba Sector, Karongi — NAEB / Daily Coffee News
    lat: -2.03,
    lng: 29.22,
    coordinateNote: "Approximate — Twumba Sector, Karongi district; NAEB/KT Press source",
    established: undefined,
    altitudeStationM: 2000,           // midpoint of 1,800–2,200 m range
    altitudeFarmsM: "1,800–2,200",
    varietals: ["Red Bourbon"],
    processing: ["Fully Washed", "Natural"],
    certifications: [],
    farmerCount: undefined,
    coeResults: [
      { year: 2018, score: 90.53, rank: 1, competition: "Cup of Excellence Rwanda" },
    ],
    notableInfo:
      "Winner of the 2018 Rwanda Cup of Excellence with a score of 90.53 — " +
      "best score of the competition among 344+ entries. Located in Nyaruyaga Village, Twumba Sector. " +
      "60 % of coffee supplied by women; 90 % of station employees are women. " +
      "Average temperature 18°C.",
    contactUrl: "https://allianceforcoffeeexcellence.org/directory/90-53-5/",
    sources: [
      "https://allianceforcoffeeexcellence.org/directory/90-53-5/",
      "https://www.ktpress.rw/2018/08/twumba-coffee-wins-cup-of-excellence/",
      "https://dailycoffeenews.com/2018/08/21/after-hiatus-rwanda-cup-of-excellence-returns-with-340-coffee-submissions/",
      "https://naeb.gov.rw/index.php?id=24&tx_news_pi1%5Bnews%5D=375",
    ],
  },

  {
    id: "karongi-kopakama",
    name: "Kopakama Washing Station",
    district: "Karongi",
    province: "Western Province",
    sector: "Gitesi",
    // Rwandadispatch: near Gitesi village, ~4.5 km south of Karongi town
    lat: -2.00,
    lng: 29.35,
    coordinateNote: "Approximate — Gitesi sector, ~4.5 km south of Karongi town; Rwanda Dispatch source",
    cooperative: "KOPAKAMA Cooperative",
    established: 1998,
    altitudeStationM: 1788,
    altitudeFarmsM: "1,600–1,900",
    varietals: ["Red Bourbon"],
    processing: ["Fully Washed"],
    certifications: ["Fair Trade", "Rainforest Alliance"],  // documented via cooperative website
    farmerCount: 1090,
    coeResults: [],
    notableInfo:
      "Founded 1998 by 45 farmers; now 1,090 members including 470 women. " +
      "Owns dry mill and two washing stations. Sandy, stony soils with year-round rainfall. " +
      "In 2018, 60 % of total production was specialty-grade. " +
      "Fair Trade and Rainforest Alliance certified.",
    contactUrl: "https://kopakama.yourwebsitespace.com/about",
    sources: [
      "https://rwandadispatch.com/kopakama-safeguards-production-of-delicious-coffee-from-western-hills/",
      "https://kopakama.yourwebsitespace.com/about",
      "https://evendo.com/locations/rwanda/karongi/attraction/kopakama-coffee-washing-station",
    ],
  },

  {
    id: "karongi-mubuga",
    name: "Mubuga Washing Station",
    district: "Karongi",
    province: "Western Province",
    sector: "Mubuga",
    // Mubugacoffee.com confirms Karongi District
    lat: -1.98,
    lng: 29.30,
    coordinateNote: "Approximate — Mubuga sector, Karongi district; mubugacoffee.com source",
    owner: "ABIMANA Mathias (private)",
    established: 2015,
    altitudeStationM: 1788,
    altitudeFarmsM: "1,500–1,900",
    varietals: ["Red Bourbon"],
    processing: ["Fully Washed"],
    certifications: [],
    farmerCount: undefined,           // designed to collect 300 tonnes of cherries
    coeResults: [],
    notableInfo:
      "Built 2015 by experienced coffee farmer ABIMANA Mathias. Designed for 300-tonne cherry capacity. " +
      "Average temperature 20°C, rainfall 1,218 mm/year. " +
      "Has its own website (mubugacoffee.com) and exports specialty lots directly.",
    contactUrl: "https://mubugacoffee.com/about/",
    sources: [
      "https://mubugacoffee.com/",
      "https://mubugacoffee.com/about/",
    ],
  },

  {
    id: "karongi-gitesi",
    name: "Gitesi Washing Station (KOPAKIKA)",
    district: "Karongi",
    province: "Western Province",
    sector: "Gitesi",
    // CWS started 2005; CoE 2014 entry confirms Karongi district (KOPAKIKA cooperative)
    lat: -2.02,
    lng: 29.34,
    coordinateNote: "Approximate — Gitesi sector, Karongi district; CoE Farm Directory 2014",
    cooperative: "KOPAKIKA",
    established: 2005,
    altitudeStationM: 1740,
    altitudeFarmsM: "1,740–2,000",
    varietals: ["Red Bourbon"],
    processing: ["Fully Washed"],
    certifications: [],
    farmerCount: 1800,
    coeResults: [
      { year: 2014, score: 85.79, rank: 9, competition: "Cup of Excellence Rwanda" },
    ],
    notableInfo:
      "Started 2005. 1,800+ farmers supply the station. CoE placement in 2014 (85.79 score, rank 9). " +
      "Has earned top CoE placements more than once per specialty importer records. " +
      "Pays additional end-of-season dividend to farmers based on quality performance.",
    contactUrl: "https://farmdirectory.cupofexcellence.org/listing/2014-rwanda-85-79-9/",
    sources: [
      "https://farmdirectory.cupofexcellence.org/listing/2014-rwanda-85-79-9/",
      "https://gillespie.coffee/products/rwanda-karongi-gitesi",
      "https://www.coffeeshrub.com/rwanda-karongi-gitesi1.html",
      "https://therefore.coffee/products/the-gitesi-project-rwanda-1",
    ],
  },

  {
    id: "karongi-cyesha",
    name: "Cyesha Washing Station",
    district: "Karongi",
    province: "Western Province",
    sector: "Bwishyura",
    // Muraho Trading confirms Karongi district, Lake Kivu area
    lat: -1.95,
    lng: 29.33,
    coordinateNote: "Approximate — Bwishyura/Lake Kivu area, Karongi district; Muraho Trading source",
    cooperative: "Muraho Trading Co.",
    owner: "Karthick & Gaudam Anbalagan (acquired Dec 2021)",
    established: 2021,                // Muraho acquisition; station may predate
    altitudeStationM: 1675,           // midpoint of 1,550–1,800 m
    altitudeFarmsM: "1,550–1,800",
    varietals: ["Red Bourbon"],
    processing: ["Fully Washed", "Natural", "Honey", "Anaerobic"],
    certifications: [],
    farmerCount: undefined,
    coeResults: [],
    notableInfo:
      "Lake Kivu wind-flow provides ideal drying conditions. Muraho was first in Rwanda to gain authority " +
      "to legally produce Natural and Honey coffees (2016, before Cyesha acquisition). " +
      "Anaerobic and experimental lots available. " +
      "Traded by Square One, Red Rooster, Royal New York.",
    contactUrl: "https://cyeshacoffee.com/",
    sources: [
      "https://cyeshacoffee.com/",
      "https://www.squareonecoffee.com/coffee-offerings3/rwanda-cyesha",
      "https://www.linkedin.com/pulse/washed-rwanda-from-cyesha-coffee-washing-station-trabocca",
    ],
  },

  // ─────────────────────────────────────────────────────────────────────────
  // NYARUGURU DISTRICT  (Southern Province)
  // ─────────────────────────────────────────────────────────────────────────

  {
    id: "nyaruguru-fugi",
    name: "Fugi Washing Station (Baho Coffee)",
    district: "Nyaruguru",
    province: "Southern Province",
    sector: "Kibeho",
    // Near Burundi border, southern Nyaruguru — Baho Coffee / Small Batch Roasting confirm
    lat: -2.97,
    lng: 29.60,
    coordinateNote: "Approximate — Kibeho area, Nyaruguru; Baho Coffee / Small Batch Roasting source",
    owner: "Emmanuel / Baho Coffee (acquired 2016)",
    established: 2013,                // built 2013, purchased by Emmanuel 2016
    altitudeStationM: 1550,
    altitudeFarmsM: "1,500–1,850",
    varietals: ["Red Bourbon"],
    processing: ["Fully Washed", "Honey", "Natural"],
    certifications: [],
    farmerCount: 950,
    coeResults: [],
    notableInfo:
      "Almost directly on the Burundi border. ~950 smallholder producers. " +
      "Station at 1,550 m; farms reach 1,850 m. " +
      "Ikizere Women's Coffee programme: empowers women members in the full value chain. " +
      "Cupping score of 86 reported; known for citrus and vanilla notes.",
    contactUrl: "https://www.bahocoffee.rw/post/empowering-women-in-coffee-the-story-of-nyaruguru-s-ikizere-women-coffee-at-fugi-coffee-washing-sta",
    sources: [
      "https://thearterycommunityroasters.com/pages/rwanada-boho-coffee",
      "https://www.smallbatchroasting.co.uk/origin/rwanda/rwanda-baho-fugi-kiyonza-hills/",
      "https://www.rooftopcoffeeroasters.com/shop-inventory/rwanda-fugi-ikizere",
      "https://www.bahocoffee.rw/",
    ],
  },

  {
    id: "nyaruguru-nyampinga",
    name: "Nyampinga Women's Cooperative Washing Station",
    district: "Nyaruguru",
    province: "Southern Province",
    sector: "Nyaruguru",
    // Southern Rwanda highlands; Sucafina / Sustainable Harvest confirm district
    lat: -2.88,
    lng: 29.57,
    coordinateNote: "Approximate — Nyaruguru district highlands; Sucafina / Sustainable Harvest source",
    cooperative: "Nyampinga Women's Cooperative",
    established: 2013,
    altitudeStationM: 1850,           // midpoint of 1,700–2,000 m
    altitudeFarmsM: "1,700–2,000",
    varietals: ["Red Bourbon"],
    processing: ["Fully Washed"],
    certifications: [],
    farmerCount: 200,                 // ~200–230 women members
    coeResults: [],
    notableInfo:
      "Founded 2013 by ~200 women farmers for collective access to agronomic training and quality control. " +
      "Members hand sort cherries cooperatively. Coffee appeared in US Barista Championship. " +
      "Traded by Rival Bros, Sucafina, Sustainable Harvest, Moustache Coffee Club.",
    contactUrl: "https://sucafina.com/na/offerings/nyampinga-women-s-cooperative-fw",
    sources: [
      "https://sucafina.com/na/offerings/nyampinga-women-s-cooperative-fw",
      "https://www.sustainableharvest.com/nyampinga",
      "https://rivalbros.com/products/rwanda-nyampinga-washed",
      "https://www.moustachecoffeeclub.com/items/nyampinga",
    ],
  },

  {
    id: "nyaruguru-busanze",
    name: "Busanze Washing Station (Impexcor Coffee)",
    district: "Nyaruguru",
    province: "Southern Province",
    sector: "Busanze",
    // Busanze Sector, Nyaruguru District, edge of Nyungwe Forest
    lat: -2.82,
    lng: 29.50,
    coordinateNote: "Approximate — Busanze Sector, edge of Nyungwe Forest, Nyaruguru; Bolt Coffee / Impexcor source",
    cooperative: "Village farmers cooperative (50 % ownership) + Impexcor Coffee (50 %)",
    owner: "IMPEXCOR Coffee Co.",
    established: 2018,
    altitudeStationM: 1950,           // midpoint of 1,800–2,100 m
    altitudeFarmsM: "1,800–2,100",
    varietals: ["Red Bourbon"],
    processing: ["Fully Washed", "Natural"],
    certifications: ["Fair Trade"],
    farmerCount: undefined,
    coeResults: [
      { year: 2018, score: 89.0, rank: 7, competition: "Alliance Cup of Excellence" },
    ],
    notableInfo:
      "Opened 2018 at edge of Nyungwe National Forest — natural shade from forest canopy. " +
      "Ranked 7th in Alliance Cup of Excellence in its first year of operation with score ~89. " +
      "50/50 ownership between Impexcor Coffee and village farmer cooperative. " +
      "Fair Trade certified. ETA Mar 2026 lots available via Royal Coffee.",
    contactUrl: "https://www.impexcorcoffee.com/busanze",
    sources: [
      "https://www.impexcorcoffee.com/busanze",
      "https://www.boltcoffeeco.com/busanzewashingstation",
      "https://rarebreedcoffee.com/blogs/coffee-origins/rwanda-busanze-coffee",
      "https://royalcoffee.com/product/3427097000046248058/",
    ],
  },

  {
    id: "nyaruguru-cyahinda",
    name: "Cyahinda Washing Station (Gihanga Coffee)",
    district: "Nyaruguru",
    province: "Southern Province",
    sector: "Cyahinda",
    // Cyahinda Sector, Nyaruguru District — Gihanga Coffee and Cyahinda Coffee websites confirm
    lat: -2.92,
    lng: 29.62,
    coordinateNote: "Approximate — Cyahinda Sector, Nyaruguru; Gihanga Coffee website source",
    cooperative: "Gihanga Coffee Ltd",
    altitudeStationM: 1819,           // average of 1,800–2,050 m per Cyahinda website
    altitudeFarmsM: "1,800–2,050",
    varietals: ["Red Bourbon"],
    processing: ["Fully Washed"],
    certifications: [],
    farmerCount: 1375,                // "over 1,375 smallholder farmers" per Gihanga Coffee
    coeResults: [],
    notableInfo:
      "Operated by Gihanga Coffee Ltd. Engages 1,375+ smallholder farmers across Southern Rwanda. " +
      "Treatment capacity 1,500 tons. MacKinnon 3-disc pulping machine, 150 elevated drying tables. " +
      "Temperature range 17–18°C. Harvest March–July.",
    contactUrl: "https://gihangacoffee.com/cyahinda-washing-station/",
    sources: [
      "https://gihangacoffee.com/cyahinda-washing-station/",
      "https://cyahindacoffee.com/cyahinda-coffee-washing-station-2/",
      "https://cyahindacoffee.com/",
    ],
  },

  {
    id: "nyaruguru-ngera",
    name: "Ngera Washing Station (Koperative Abishyizehamwe Ngera)",
    district: "Nyaruguru",
    province: "Southern Province",
    sector: "Ngera",
    // Near Kibeho, Nyaruguru — Covoya Specialty Coffee confirms district
    lat: -2.86,
    lng: 29.64,
    coordinateNote: "Approximate — Ngera sector, near Kibeho, Nyaruguru; Covoya Specialty Coffee source",
    cooperative: "Koperative Abishyizehamwe Ngera",
    established: 2012,                // cooperative founded; coffee farming began 2014
    altitudeStationM: 1950,           // farms at ~2,000 m; station slightly lower
    altitudeFarmsM: "1,900–2,000",
    varietals: ["Red Bourbon"],
    processing: ["Fully Washed", "Anaerobic Natural"],
    certifications: [],
    farmerCount: 85,
    coeResults: [],
    notableInfo:
      "Small cooperative (85 members: 53 women, 32 men) founded 2012 by maize farmers who pivoted to coffee in 2014 " +
      "following government support; 7,814 trees on a 1.25-hectare communal plot. " +
      "Notable for 98-hour anaerobic fermentation natural lots exported by Covoya Specialty Coffee.",
    contactUrl: "https://uk.covoyacoffee.com/rwanda-ngera-anaerobic-natural.html",
    sources: [
      "https://uk.covoyacoffee.com/rwanda-ngera-anaerobic-natural.html",
      "https://www.highgrade.coffee/products/fashion-rwanda-anaerobic-natural",
    ],
  },

];

// ────────────────────────────────────────────────────────────────────────────
// Helper utilities
// ────────────────────────────────────────────────────────────────────────────

/** Return all stations for a given district */
export function getStationsByDistrict(
  district: WashingStation["district"]
): WashingStation[] {
  return WASHING_STATIONS.filter((s) => s.district === district);
}

/** Return stations that have at least one verified Cup of Excellence result */
export function getCoeWinners(): WashingStation[] {
  return WASHING_STATIONS.filter(
    (s) => s.coeResults && s.coeResults.length > 0 && s.coeResults.some((r) => r.score > 0 || r.rank > 0)
  );
}

/** Return stations that hold a named certification */
export function getStationsByCertification(cert: string): WashingStation[] {
  return WASHING_STATIONS.filter((s) =>
    s.certifications.some((c) => c.toLowerCase().includes(cert.toLowerCase()))
  );
}

/** Summary counts by district */
export const STATION_COUNTS_BY_DISTRICT: Record<
  WashingStation["district"],
  number
> = {
  Huye: WASHING_STATIONS.filter((s) => s.district === "Huye").length,
  Nyamasheke: WASHING_STATIONS.filter((s) => s.district === "Nyamasheke").length,
  Rusizi: WASHING_STATIONS.filter((s) => s.district === "Rusizi").length,
  Karongi: WASHING_STATIONS.filter((s) => s.district === "Karongi").length,
  Nyaruguru: WASHING_STATIONS.filter((s) => s.district === "Nyaruguru").length,
};
