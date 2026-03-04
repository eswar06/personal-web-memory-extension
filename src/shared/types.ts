export type Highlight = {
  text: string;
  createdAt: number;
};

export type PageMemory = {
  url: string;
  title: string;
  totalTimeMs: number;
  lastVisited: number;
  highlights?: Highlight[];
};
