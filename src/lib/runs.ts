import type { InkId } from "@/lib/inks";

export type RunArt = "lanterns" | "waves" | "ferns" | "sun" | "halves" | "map";

export type Run = {
  slug: string;
  title: string;
  client: string;
  format: string;
  inks: [InkId, InkId];
  paper: string;
  edition: number;
  art: RunArt;
  /** Width / height of the printed piece. */
  ratio: number;
  /** Card height in vh (narrow screens shrink it to fit), and where it sits vertically. */
  height: number;
  align: string;
};

export const RUNS: Run[] = [
  {
    slug: "night-market-almanac",
    title: "Night Market Almanac",
    client: "Pasar Senggol collective",
    format: "Zine, 48 pages",
    inks: ["pink", "teal"],
    paper: "Munken Print 90 g",
    edition: 300,
    art: "lanterns",
    ratio: 0.72,
    height: 52,
    align: "self-start mt-[13vh]",
  },
  {
    slug: "hujan-records",
    title: "Hujan Records sleeves",
    client: "Hujan Records",
    format: "7-inch sleeves",
    inks: ["blue", "yellow"],
    paper: "Recycled board 300 g",
    edition: 500,
    art: "waves",
    ratio: 1,
    height: 40,
    align: "self-end mb-[18vh]",
  },
  {
    slug: "a-small-index-of-ferns",
    title: "A Small Index of Ferns",
    client: "Laras Wibisono",
    format: "Book, 96 pages",
    inks: ["teal", "red"],
    paper: "Fedrigoni Arena 100 g",
    edition: 150,
    art: "ferns",
    ratio: 0.68,
    height: 56,
    align: "self-center",
  },
  {
    slug: "kopi-tubruk-club-tour",
    title: "Kopi Tubruk Club, Java tour",
    client: "Kopi Tubruk Club",
    format: "A2 gig poster",
    inks: ["red", "blue"],
    paper: "Colorplan Pristine 135 g",
    edition: 120,
    art: "sun",
    ratio: 0.707,
    height: 62,
    align: "self-start mt-[9vh]",
  },
  {
    slug: "small-weather",
    title: "Small Weather",
    client: "Rara Anindita",
    format: "Artist book, 32 pages",
    inks: ["yellow", "pink"],
    paper: "Munken Pure 120 g",
    edition: 80,
    art: "halves",
    ratio: 0.8,
    height: 44,
    align: "self-end mb-[12vh]",
  },
  {
    slug: "cihapit-walking-map",
    title: "Cihapit walking map",
    client: "Neighbourhood association",
    format: "Folded map, A3",
    inks: ["blue", "pink"],
    paper: "Newsprint 52 g",
    edition: 1000,
    art: "map",
    ratio: 1.41,
    height: 42,
    align: "self-center",
  },
];
