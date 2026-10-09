const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  console.log("Seeding initial Pune community reports...");

  // Clear existing
  await prisma.communityReport.deleteMany({});

  const sampleReports = [
    {
      category: "pothole",
      title: "Deep pothole near FC Road Starbucks",
      description:
        "Large pothole in the left lane causing two-wheelers to swerve dangerously during peak evening traffic.",
      locationAddress: "Fergusson College Road, Shivajinagar, Pune 411004",
      latitude: 18.5201,
      longitude: 73.8423,
      observationTime: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
      status: "Pending verification",
    },
    {
      category: "waterlogging",
      title: "Monsoon water accumulation near Alka Talkies Chowk",
      description:
        "Storm drain blocked with silt; approx 6 inches of waterlogging across the intersection after evening shower.",
      locationAddress: "LBS Road, Alka Talkies Chowk, Sadashiv Peth, Pune 411030",
      latitude: 18.5135,
      longitude: 73.8478,
      observationTime: new Date(Date.now() - 14 * 60 * 60 * 1000), // 14 hours ago
      status: "Verified",
    },
    {
      category: "streetlight",
      title: "Damaged streetlight pole near Saras Baug Gate 2",
      description:
        "Light bulb unit shattered and dangling from wire. Area is completely dark after 7 PM.",
      locationAddress: "Saras Baug Road, Sadashiv Peth, Pune 411030",
      latitude: 18.5015,
      longitude: 73.8542,
      observationTime: new Date(Date.now() - 28 * 60 * 60 * 1000), // 28 hours ago
      status: "Resolved",
    },
    {
      category: "obstruction",
      title: "Fallen tree branch obstructing pedestrian lane",
      description:
        "Large bough snapped off during wind; blocking pedestrian walkway and half of the cycling track on JM Road.",
      locationAddress: "Jangali Maharaj Road, Shivajinagar, Pune 411005",
      latitude: 18.5267,
      longitude: 73.8492,
      observationTime: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      status: "Pending verification",
    },
    {
      category: "cleanliness",
      title: "Overflowing civic dumpster near Pune Railway Station",
      description:
        "Dumpster hasn't been cleared for 2 days; waste spilling onto road near exit gate.",
      locationAddress: "Station Road, Agarkar Nagar, Pune 411001",
      latitude: 18.5289,
      longitude: 73.8744,
      observationTime: new Date(Date.now() - 8 * 60 * 60 * 1000), // 8 hours ago
      status: "Verified",
    },
  ];

  for (const report of sampleReports) {
    await prisma.communityReport.create({ data: report });
  }

  console.log(`Successfully seeded ${sampleReports.length} community reports.`);
}

main()
  .catch((e) => {
    console.error("Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
