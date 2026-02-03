export interface FAQItem {
  id: string;
  question: string;
  answer: string;
  tag?: string; // optional label
}

export const FAQ_DATA: { title: string; items: FAQItem[] }[] = [
  {
    title: "Alerts & Evacuation",
    items: [
      {
        id: "evac-when",
        question: "When should I evacuate?",
        answer:
          "Evacuate immediately if authorities issue an evacuation order. If you feel unsafe (fast smoke, embers, strong wind), leave early—don’t wait. Keep your go-bag ready and know at least two routes out.",
        tag: "Evacuation",
      },
      {
        id: "alerts-where",
        question: "Where do I get official alerts?",
        answer:
          "Use your local emergency authority (municipality/civil protection), local fire service, and official emergency alert systems. If you’re traveling, check the region’s official alerts and road closures.",
        tag: "Alerts",
      },
      {
        id: "roads",
        question: "What if my planned route is blocked?",
        answer:
          "Don’t drive through smoke or flames. Use your backup route, follow official detours, and keep your car headlights on. If visibility is very low, pull over in a safe place and wait for instructions.",
        tag: "Evacuation",
      },
    ],
  },
  {
    title: "Go-Bag & Home Preparation",
    items: [
      {
        id: "gobag",
        question: "What should be in a wildfire go-bag?",
        answer:
          "Water, masks (N95/FFP2), key documents/ID, phone charger/power bank, medications, basic clothing, flashlight, and a small first-aid kit. Add pet supplies if needed.",
        tag: "Go-Bag",
      },
      {
        id: "home",
        question: "What quick steps help protect my home?",
        answer:
          "Clear leaves from gutters and the roof, move flammable items away from windows, close windows/doors, and remove outdoor furniture or doormats if time allows. Follow local guidance—don’t stay behind to defend property.",
        tag: "Home",
      },
    ],
  },
  {
    title: "Smoke & Air Quality",
    items: [
      {
        id: "mask",
        question: "Which masks work for wildfire smoke?",
        answer:
          "Use a well-fitted N95/FFP2 (or better). Cloth masks and surgical masks don’t filter fine smoke particles well. Fit matters: gaps reduce protection.",
        tag: "Smoke",
      },
      {
        id: "indoors",
        question: "How can I improve air indoors?",
        answer:
          "Keep windows/doors closed, run a HEPA air purifier if you have one, and avoid activities that add indoor pollution (candles, incense, frying). If you must go out, limit time and wear a proper mask.",
        tag: "Air Quality",
      },
      {
        id: "aqi",
        question: "What is AQI and what should I do when it’s high?",
        answer:
          "AQI is Air Quality Index. As AQI rises, reduce outdoor activity, stay indoors with clean air, and use filtration. If you’re sensitive (asthma, heart/lung conditions), take extra precautions and follow medical advice.",
        tag: "Air Quality",
      },
    ],
  },
{
    title: "App & Privacy",
    items: [
      {
        id: "privacy-policy",
        question: "Do you store my data?",
        answer:
          "No. The app does not retain any personal data. We don’t store your searches, alerts, or usage history. Your information stays on your device and is not saved on our servers.",
        tag: "Privacy",
      },
      {
        id: "location-use",
        question: "How does the app use my location?",
        answer:
          "Location is only used to show relevant information for your area (nearby fires). You can choose to share with us your location.",
        tag: "Privacy",
      },
      {
        id: "change-location-preferences",
        question: "How do I change location preferences in the Your Space tab?",
        answer:
          "Open the Space tab. You can toggle on/off location sharing. Changes apply immediately.",
        tag: "Space",
      },
    ],
  },
];
