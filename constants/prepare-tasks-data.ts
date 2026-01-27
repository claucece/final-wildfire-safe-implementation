export interface PrepareTaskType {
    id: number;
    title: string;
    description: string;
    why: string;
    steps: string;
}


export const PREPARE_TASK_DATA: PrepareTaskType[] = [
    {
        id: 1,
        title: "Understand Wildfire Risk",
        description:
	"Let's understand wildfire!\n\nHere, you will build a clear picture of your wildfire exposure: local fuels, terrain, seasonal patterns, and how warnings are issued where you live. Understanding your risk ahead of time helps you make fast, confident decisions during fire weather and reduces the chance of delayed evacuation.",
        why:
          "Wildfires can spread quickly and unpredictably due to wind, slope, and fuel conditions. Risk awareness reduces uncertainty and supports timely, calm action, especially when warnings and information arrive quickly.\n\nLet's now explore steps you can take when wildfires come.",
        steps: [
          "Identify your location and note nearby vegetation (grassland, scrubs) and slopes.",
          "Check whether your area has a defined wildfire season and what months are highest risk.",
          "Find at least two trusted local sources for fire updates (fire service, meteorology).",
          "Decide a simple household rule for alerts: 'If an evacuation warning is issued, we prepare to leave immediately'.",
          "Write down one primary and one backup meeting point for household members.",
        ],
        tips: [
          "Keep risk information simple: focus on where you are, how you would leave, and who you would contact.",
          "Avoid information overload: choose a small number of trusted sources and ignore rumor-driven updates.",
          "If you live with others, align expectations early: shared plans reduce stress later.",
        ],
    },
    {
        id: 2,
        title: "Create an Emergency Kit",
        description: "Prepare a compact emergency kit so you can leave quickly and stay safe for at least 24–72 hours. A good kit covers essentials like water, food, medications, documents, communication, and basic first aid, so evacuation is faster and less stressful.",
        why: "During wildfire evacuations, time is limited and services may be disrupted. Smoke and stress can also worsen health conditions. Having a ready kit reduces panic, prevents forgotten essentials (like medication), and helps you stay safe and informed if roads are blocked or power and mobile networks fail.",
    steps: [
      "Choose your kit format: one backpack per person or one household grab-bin.",
      "Pack essentials for 24–72 hours: water, non-perishable food, flashlight, power bank + charging cable, and a battery radio.",
      "Add health and safety supplies: first aid kit, N95/FFP2 masks, hand sanitizer, wipes, and any personal medical items.",
      "Include critical documents: IDs, insurance, emergency contacts, and any medical/allergy notes.",
      "Pack clothing basics: warm layer, socks, sturdy shoes, and a hat; include a small blanket if space allows.",
    ],
    tips: [
      "Prepare a pet kit if needed: food, water bowl, leash/carrier, vaccination records, and waste bags.",
      "Place the kit near the exit and do a quick seasonal check (replace expired meds/food, recharge power banks).",
      "Prioritize medications: missing essential meds is one of the most common evacuation problems.",
      "Include at least one N95/FFP2 mask per person: smoke exposure can be severe even far from the fire.",
    ],
    },
    {
    id: 3,
    title: "Prepare your Home",
    description: "Reduce the chance your home is harmed during a wildfire by limiting ember entry points and removing flammable materials near it. Small actions (cleaning gutters and clearing the first few meters around your home) can significantly improve safety and reduce damage risk.",
    why: "Most homes harmed in wildfires ignite from wind-driven embers rather than direct flames. Embers can travel far ahead of the fire front and accumulate on roofs, decks, vents, and near doors. Preparing your home in advance makes it more resilient and also gives firefighters a safer structure to defend.",
    steps: [
      "Clear the immediate area around your home: remove dry leaves, wood piles, cardboard, and flammable furniture.",
      "Clean gutters, roof edges, and corners where debris collects; remove any dead vegetation touching the house.",
      "Check vents and openings: ensure vents are ember-resistant, and seal obvious gaps under eaves, decks, and around siding.",
      "Create safer defensible space: trim low branches, space shrubs, and keep grass short and hydrated during fire season.",
    ],
    tips: [
      "Prepare access: ensure house numbers are visible and keep gates unlocked or easily opened for emergency access.",
      "Focus first on the 'ember zone' closest to the home: small flammable items near walls often cause ignition.",
      "Gravel or stone is safer than mulch right next to the building.",
      "Do seasonal maintenance: a 15-minute gutter and yard check before high-wind days can make a big difference.",
      "If you rent: you can still reduce risk by clearing balconies and nearby vegetation, and by keeping evacuation paths clear.",
    ],
  },
  {
    id: 4,
    title: "Plan Evacuation & Communication",
    description:
      "Make a simple evacuation plan so everyone in your household knows when to leave, where to go, and how to reconnect if separated. Planning ahead reduces panic, prevents delays, and helps you act quickly when wildfire warnings escalate.",
    why:
      "Wildfire evacuations can happen fast, and official alerts may come with limited time to react. Roads can become congested or blocked, and phone networks may fail. A clear plan (routes, meeting points, and communication rules) helps your household evacuate earlier and more safely.",
    steps: [
      "Choose two evacuation routes: a primary route and a backup route in case roads are blocked or traffic is heavy.",
      "Set two meeting points: one nearby (local) and one outside the area (safer fallback).",
      "Pick an out-of-area contact person that everyone can message or call to share location updates.",
      "Define a household 'leave trigger': 'At evacuation Level 2, we leave immediately'.",
      "Practice a quick drill: time how long it takes to gather pets, grab go-bags, and get in the car.",
    ],
    tips: [
      "Leave early when possible: most evacuation danger comes from waiting too long.",
      "Don't rely only on mobile data: SMS and paper contact lists are more reliable during outages.",
      "If you have pets, plan transport in advance (carrier/leash ready) to avoid last-minute delays.",
      "Keep your car at least half-full during fire season, especially on high wind or heat days.",
    ],
  },
  {
    id: 5,
    title: "Health, Smoke & Air Quality Safety",
    description:
      "Prepare to protect your health during wildfire smoke events by reducing indoor pollution, using proper masks, and monitoring air quality. Smoke can travel far from fires and may affect breathing, sleep, and heart health even when evacuation is not required.",
    why:
      "Wildfire smoke contains fine particles (PM2.5) that can irritate lungs and worsen asthma, allergies, and cardiovascular conditions. Smoke exposure is often longer-lasting than the fire itself. Planning ahead helps you act early (before symptoms appear) and protects vulnerable people such as children, older adults, and those with respiratory conditions.",
    steps: [
      "Learn how to check air quality where you live (AQI / PM2.5) using a trusted app or official meteorology source.",
      "Prepare a clean-air space at home: choose one room, close windows, and use a HEPA air purifier if possible.",
      "Stock high-quality masks (N95 / FFP2 / FFP3) and store them in an easy-to-reach place.",
      "If air quality becomes dangerous, limit outdoor activity and consider temporarily relocating to cleaner air if safe and feasible.",
    ],
    tips: [
      "Cloth masks don't protect well against smoke: use N95/FFP2 masks for best protection.",
      "If you feel dizzy, short of breath, or have chest pain, treat it seriously and seek medical advice.",
      "Keep windows closed but stay cool: use fans/AC carefully and avoid bringing outdoor air inside when smoke is high.",
      "Pets are affected too: reduce their outdoor time and watch for coughing or fatigue.",
    ],
  },
  {
    id: 6,
    title: "Stay Informed & Act Calmly",
    description:
      "Set up a simple system to receive reliable wildfire alerts and respond without panic. During fire events, information changes fast: having trusted sources and clear rules helps you act early and avoid confusion or rumor-driven decisions.",
    why:
      "Wildfire emergencies often involve uncertainty, conflicting information, and rapidly changing conditions. Stress and information overload can delay evacuation or lead to unsafe choices. A calm, structured approach (trusted alerts and predefined actions) reduces risk and helps your household make faster, safer decisions.",
    steps: [
      "Choose two trusted official information sources and enable push notifications.",
      "Agree on a household communication rule: who checks updates, who contacts others, and where information is shared (group chat).",
      "Keep devices ready: charge phone, keep the car fueled, and ensure emergency contacts are saved and written down.",
      "During a fire event, limit information intake to scheduled check-ins unless alerts escalate.",
    ],
    tips: [
      "Avoid rumor-driven sources: social media can help but should never replace official alerts.",
      "When stressed, follow pre-made rules: decision fatigue is real during emergencies.",
      "Share one clear message with household members: where you are going and how to reach you.",
      "If it feels unsafe to stay, leave early even if you have not received an official order.",
    ],
  }
];
