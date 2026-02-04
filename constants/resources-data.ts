import images from "@/constants/tests-images";

const RESOURCES_DATA = [
  {
    title: "External help",
    items: [
      {
        id: "alerts",
        title: "Wildfire guidance",
        description: "RedCross Wildfire safety.",
        href: "https://www.redcross.org/get-help/how-to-prepare-for-emergencies/types-of-emergencies/wildfire.html",
        image: images.testImageEleven,
      },
      {
        id: "global-fires",
        title: "Global Fires",
        description: "NASA's map of wildfires.",
        href: "https://firms.modaps.eosdis.nasa.gov/",
        image: images.testImageEight,
      },
    ],
  },
  {
    title: "Volunteering Efforts",
    items: [
      {
        id: "ngo-1",
        title: "IFRC",
        description: "Red Cross volunteering.",
        href: "https://www.ifrc.org/article/heatwaves-and-wildfires-europe-red-cross-and-red-crescent-teams-protect-people-high-risk",
        image: images.testImageTen,
      },
      {
        id: "ngo-2",
        title: "Team Rubicon",
        description: "Volunteer with Rubicon.",
        href: "https://teamrubiconusa.org/how-to-get-involved/volunteer-with-us",
        image: images.testImageTwelve,
      },
    ],
  },
  {
    title: "FAQ",
    items: [
      {
        id: "faq",
        title: "FAQ",
        description: "Let's go to the FAQ!",
        href: "/resource/faq",
        image: images.testImageThTeen,
      },
    ],
  },
];

export default RESOURCES_DATA;
