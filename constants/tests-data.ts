import images from "@/constants/tests-images";

const TESTS_DATA = [
  {
    title: "Emergency Kit",
    data: [
      {
        id: "kit-checklist",
        title: "Build a Wildfire Go-Bag",
        prompt: "Check off what belongs in a wildfire go-bag.",
        type: "Checklist",
        image: images.testImageOne,
        checklistItems: [
          {
            id: "water",
            label: "Water (at least for 24 hours)",
            done: false,
            isCorrect: true,
          },
          {
            id: "mask",
            label: "N95/FFP2 masks",
            done: false,
            isCorrect: true,
          },
          {
            id: "docs",
            label: "ID & key documents",
            done: false,
            isCorrect: true,
          },
          {
            id: "cloth",
            label: "Basic clothing",
            done: false,
            isCorrect: true,
          },
          {
            id: "perfume",
            label: "Perfume/cologne",
            done: false,
            isCorrect: false,
          },
        ],
      },
      {
        id: "kit-order",
        title: "Evacuation Pack Order",
        prompt: "Put these actions in the safest order.",
        type: "Drag",
        image: images.testImageTwo,
        dragItems: [
          { key: "alerts", label: "Check official alerts" },
          { key: "gobag", label: "Grab go-bag + documents" },
          { key: "pets", label: "Secure pets / carriers" },
          { key: "shoes", label: "Put on closed-toe shoes" },
        ],
        correctOrderKeys: ["alerts", "gobag", "pets", "shoes"],
      },
    ],
  },

  {
    title: "Home Safety",
    data: [
      {
        id: "home-defensible-space",
        title: "Safe Home Checklist",
        prompt: "Check what helps reduce wildfire risk around your home.",
        type: "Checklist",
        image: images.testImageThree,
        checklistItems: [
          {
            id: "gutters",
            label: "Clear leaves from gutters",
            done: false,
            isCorrect: true,
          },
          {
            id: "deck",
            label: "Remove items under decks/porches",
            done: false,
            isCorrect: true,
          },
          {
            id: "firewood-wall",
            label: "Stack firewood against the house wall",
            done: false,
            isCorrect: false,
          },
          {
            id: "roof",
            label: "Clear debris from roof",
            done: false,
            isCorrect: true,
          },
          {
            id: "plants",
            label: "Trim plants close from structures",
            done: false,
            isCorrect: true,
          },
        ],
      },
      {
        id: "home-prep-order",
        title: "Prepare Your Home",
        prompt: "Order these steps from most urgent to least urgent.",
        type: "Drag",
        image: images.testImageFive,
        dragItems: [
          { key: "close", label: "Close all windows and doors" },
          { key: "hoses", label: "Connect hoses and fill buckets" },
          { key: "move", label: "Move flammable furniture away from windows" },
          { key: "shutoff", label: "Shut off gas if instructed" },
        ],
        correctOrderKeys: ["close", "move", "hoses", "shutoff"],
      },
    ],
  },

  {
    title: "Evacuation Safety",
    data: [
      {
        id: "evac-vehicle-check",
        title: "Vehicle Evacuation Checklist",
        prompt: "Check what you should do before leaving by car.",
        type: "Checklist",
        image: images.testImageSeven,
        checklistItems: [
          {
            id: "fuel",
            label: "Fuel tank at least half full",
            done: false,
            isCorrect: true,
          },
          {
            id: "map",
            label: "Offline maps downloaded",
            done: false,
            isCorrect: true,
          },
          {
            id: "routes",
            label: "Identify 2 evacuation routes",
            done: false,
            isCorrect: true,
          },
          {
            id: "windows-open",
            label: "Drive with windows open for fresh air",
            done: false,
            isCorrect: false,
          },
          {
            id: "lights",
            label: "Headlights on for visibility",
            done: false,
            isCorrect: true,
          },
          {
            id: "kids",
            label: "Child seats secured",
            done: false,
            isCorrect: true,
          },
        ],
      },
      {
        id: "evac-escape-order",
        title: "Evacuation Exit Plan",
        prompt: "Put these actions in the safest order.",
        type: "Drag",
        image: images.testImageSix,
        dragItems: [
          { key: "shoes", label: "Put on long pants and closed-toe shoes" },
          { key: "pets", label: "Secure pets into carriers/leashes" },
          { key: "leave", label: "Leave immediately when told" },
          { key: "notify", label: "Message family: “Evacuating now”" },
        ],
        correctOrderKeys: ["shoes", "pets", "notify", "leave"],
      },
    ],
  },

  {
    title: "Smoke and Air Quality",
    data: [
      {
        id: "air-smoke-protection",
        title: "Smoke Protection Checklist",
        prompt: "Check what helps protect you from wildfire smoke.",
        type: "Checklist",
        image: images.testImageNine,
        checklistItems: [
          {
            id: "mask",
            label: "Wear N95/FFP2 outside",
            done: false,
            isCorrect: true,
          },
          {
            id: "indoors",
            label: "Stay indoors with windows closed",
            done: false,
            isCorrect: true,
          },
          {
            id: "purifier",
            label: "Run HEPA air purifier",
            done: false,
            isCorrect: true,
          },
          {
            id: "burn-candles",
            label: "Burn candles/incense to “clean the air”",
            done: false,
            isCorrect: false,
          },
          {
            id: "car",
            label: "Use car recirculation mode",
            done: false,
            isCorrect: true,
          },
          {
            id: "exercise",
            label: "Avoid outdoor exercise",
            done: false,
            isCorrect: true,
          },
        ],
      },
      {
        id: "aqi-level-order",
        title: "Respond to AQI Levels Plan",
        prompt: "Drag the responses in order from lowest AQI to highest AQI.",
        type: "Drag",
        image: images.testImageEight,
        dragItems: [
          { key: "good", label: "Good: open windows if needed" },
          { key: "moderate", label: "Moderate: limit long outdoor exertion" },
          { key: "unhealthy", label: "Unhealthy: stay inside / use purifier" },
          { key: "hazardous", label: "Hazardous: avoid going outside completely" },
        ],
        correctOrderKeys: ["good", "moderate", "unhealthy", "hazardous"],
      },
    ],
  },
];

export default TESTS_DATA;
