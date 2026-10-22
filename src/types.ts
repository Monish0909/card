export interface WeddingEvent {
  id: string;
  name: string;
  shortDescription: string;
  date: string; // e.g. "18 Dec 2026"
  time: string; // e.g. "8:00 PM"
  extraLines?: string[]; // e.g. ["Varmala - 9:00 PM Onwards", "Rituals - 12:00 AM Onwards"]
  venueName: string;
  address: string;
  mapsUrl: string;
  wardrobeTitle: string;
  wardrobeText: string;
  videoPath: string;
  styleGuideImagePath: string;
}

export interface WeddingContent {
  elder: {
    name: string;
    subtext: string;
  };
  invitationLines: {
    line1: string;
    line2: string;
  };
  bride: {
    name: string;
    parentage: string;
  };
  groom: {
    name: string;
    parentage: string;
  };
  hashtag: string;
  weddingDateISO: string; // Drives the countdown
  weddingDateFormatted: string;
  mantraDevanagari: string;
  mantraEnglishMeaning?: string;
  events: WeddingEvent[];
  footer: {
    regards: string;
    credit: string;
    creditContactPlaceholder: string;
  };
  assets: {
    envelopeImage: string;
    envelopeVideo: string;
    bgMusic: string;
    ganpatiLogo: string;
    bgWatercolor: string;
  };
}
