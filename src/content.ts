import type { WeddingContent } from './types';

/**
 * SINGLE SOURCE OF TRUTH FOR CLIENT BRANDING & CONTENT.
 * Simply edit this file to customize the whole invitation.
 */
export const weddingContent: WeddingContent = {
  elder: {
    name: "Smt. Kamla Devi Sharma",
    subtext: "(Wife of Late Shri. Ramesh Chand Sharma)",
  },
  invitationLines: {
    line1: "Cordially Invites You",
    line2: "to the Wedding Ceremony of her beloved Granddaughter",
  },
  bride: {
    name: "Aanya",
    parentage: "D/O Mrs. Neha and Mr. Rohit Sharma",
  },
  groom: {
    name: "Veer",
    parentage: "S/O Mrs. Anita & Mr. Sanjay Malhotra",
  },
  hashtag: "#AanyaVeerForever",
  weddingDateISO: "2026-12-20T19:30:00+05:30",
  weddingDateFormatted: "20 December 2026",
  mantraDevanagari: "वक्रतुण्ड महाकाय सूर्यकोटि समप्रभ। निर्विघ्नं कुरु मे देव सर्वकार्येषु सर्वदा॥",
  events: [
    {
      id: "sagan-cocktail",
      name: "Sagan & Cocktail",
      shortDescription: "An evening of royal blessings, toasts, and sparkling celebrations under the stars.",
      date: "18 December 2026",
      time: "8:00 PM",
      venueName: "Sample Palace, The Imperial Lawn",
      address: "Heritage Road, Royal Enclave, City - 110001",
      mapsUrl: "#",
      wardrobeTitle: "Black Tie & Indo-Western Glam",
      wardrobeText: "Gents in tailored bandhgalas or tuxedos; Ladies in shimmering metallic gowns or pre-draped contemporary sarees.",
      videoPath: "/assets/videos/event-sagan.mp4",
      styleGuideImagePath: "/assets/images/style-sagan.svg",
    },
    {
      id: "haldi",
      name: "Haldi",
      shortDescription: "Sun-drenched blessings, fragrant turmeric pastes, and playful marigold showers.",
      date: "19 December 2026",
      time: "12:00 Noon",
      venueName: "Sample Palace, The Courtyard",
      address: "Heritage Road, Royal Enclave, City - 110001",
      mapsUrl: "#",
      wardrobeTitle: "Sunshine Shades & Floral Splendor",
      wardrobeText: "Vibrant yellow kurtas, mustard lehengas, fresh floral jewelry, and breezy pastel accents.",
      videoPath: "/assets/videos/event-haldi.mp4",
      styleGuideImagePath: "/assets/images/style-haldi.svg",
    },
    {
      id: "mehendi-sangeet",
      name: "Mehendi & Sangeet",
      shortDescription: "Intricate henna tapestries, electrifying dance showdowns, and melodious folk dholaks.",
      date: "19 December 2026",
      time: "8:00 PM",
      venueName: "Sample Palace, The Grand Ballroom",
      address: "Heritage Road, Royal Enclave, City - 110001",
      mapsUrl: "#",
      wardrobeTitle: "Royal Festive & Jewel Tones",
      wardrobeText: "Emerald greens, royal teals, and fuchsia silks with mirror work and comfortable dancing footwear.",
      videoPath: "/assets/videos/event-mehendi.mp4",
      styleGuideImagePath: "/assets/images/style-mehendi.svg",
    },
    {
      id: "wedding",
      name: "Wedding Ceremony",
      shortDescription: "Sacred pheras, timeless Vedic chants, and eternal promises witnessed by loved ones.",
      date: "20 December 2026",
      time: "7:30 PM",
      extraLines: [
        "Varmala - 9:00 PM Onwards",
        "Rituals - 12:00 AM Onwards"
      ],
      venueName: "Sample Palace, The Royal Pavilion",
      address: "Heritage Road, Royal Enclave, City - 110001",
      mapsUrl: "#",
      wardrobeTitle: "Traditional Elegance & Heritage Silks",
      wardrobeText: "Regal sherwanis with safas for gentlemen; Royal Banarasi or Zardozi lehengas in shades of crimson, blush, and gold.",
      videoPath: "/assets/videos/event-wedding.mp4",
      styleGuideImagePath: "/assets/images/style-wedding.svg",
    },
  ],
  footer: {
    regards: "Regards, The Sharma Family & All Near and Dears",
    credit: "Website invite by MIWYN",
    creditContactPlaceholder: "contact@miwyn.design",
  },
  assets: {
    envelopeImage: "/assets/images/opener-envelope.svg",
    envelopeVideo: "/assets/videos/envelope-open.mp4",
    bgMusic: "/assets/audio/theme-song.mp3",
    ganpatiLogo: "/assets/images/ganpati-gold.svg",
    bgWatercolor: "/assets/images/bg-watercolor.svg",
  },
};
