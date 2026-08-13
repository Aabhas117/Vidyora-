require("dotenv").config();
const dns = require("dns");
dns.setServers(["1.1.1.1", "8.8.8.8"]);

const mongoose = require("mongoose");
const User = require("../models/User");
const Video = require("../models/Video");

const sampleVideos = [
  {
    title: "React Fundamentals",
    description: "Learn the fundamentals of React — components, props, and state.",
    videoUrl: "https://example.com/video1.mp4",
    thumbnailUrl: "https://picsum.photos/seed/seed1/400/225",
    category: "Programming",
    views: 1000,
    duration: "10:25",
  },
  {
    title: "Understanding MongoDB Relationships",
    description: "How to model references between collections in Mongoose.",
    videoUrl: "https://example.com/video2.mp4",
    thumbnailUrl: "https://picsum.photos/seed/seed2/400/225",
    category: "Programming",
    views: 542,
    duration: "14:02",
  },
  {
    title: "A Calm Morning in the Mountains",
    description: "Just birdsong and a quiet trail.",
    videoUrl: "https://example.com/video3.mp4",
    thumbnailUrl: "https://picsum.photos/seed/seed3/400/225",
    category: "Travel",
    views: 89000,
    duration: "6:40",
  },
];

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB for seeding.");

    const owner = await User.findOne();
    if (!owner) {
      console.error("No users found. Register a user first, then re-run the seed script.");
      process.exit(1);
    }

    await Video.deleteMany({});
    const videosWithOwner = sampleVideos.map((v) => ({ ...v, owner: owner._id }));
    await Video.insertMany(videosWithOwner);

    console.log(`Seeded ${videosWithOwner.length} videos, owned by ${owner.username}.`);
    process.exit(0);
  } catch (error) {
    console.error("Seeding error:", error.message);
    process.exit(1);
  }
}

seed();