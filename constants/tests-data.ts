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
          { id: "water", label: "Water (at least 24 hours)", done: false },
          { id: "mask", label: "N95/FFP2 masks", done: false },
          { id: "docs", label: "ID + key documents", done: false },
          { id: "power", label: "Power bank + charging cable", done: false },
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
        id: "kit-checklist",
        title: "Build a Wildfire Go-Bag",
        prompt: "Check off what belongs in a wildfire go-bag.",
        type: "Checklist",
        image: images.testImageThree,
        checklistItems: [
          { id: "water", label: "Water (at least 24 hours)", done: false },
          { id: "mask", label: "N95/FFP2 masks", done: false },
          { id: "docs", label: "ID + key documents", done: false },
          { id: "power", label: "Power bank + charging cable", done: false },
        ],
      },
      {
        id: "kit-order",
        title: "Evacuation Pack Order",
        prompt: "Put these actions in the safest order.",
        type: "Drag",
        image: images.testImageFour,
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
    title: "Evacuation Safety",
    data: [
      {
        id: "kit-checklist",
        title: "Build a Wildfire Go-Bag",
        prompt: "Check off what belongs in a wildfire go-bag.",
        type: "Checklist",
        image: images.testImageTwo,
        checklistItems: [
          { id: "water", label: "Water (at least 24 hours)", done: false },
          { id: "mask", label: "N95/FFP2 masks", done: false },
          { id: "docs", label: "ID + key documents", done: false },
          { id: "power", label: "Power bank + charging cable", done: false },
        ],
      },
      {
        id: "kit-order",
        title: "Evacuation Pack Order",
        prompt: "Put these actions in the safest order.",
        type: "Drag",
        image: images.testImageThree,
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
];

export default TESTS_DATA;
