const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const envPath = path.join(process.cwd(), ".env.local");
if (fs.existsSync(envPath)) {
  for (const line of fs.readFileSync(envPath, "utf8").split(/\r?\n/)) {
    const match = line.match(/^([^#=]+)=(.*)$/);
    if (match && !process.env[match[1]])
      process.env[match[1]] = match[2].replace(/^"|"$/g, "");
  }
}

const users = [
  {
    firstName: "مدیر ارشد",
    lastName: "فراز",
    mobile: "09127351124",
    password: "SuperAdmin@2026!",
    role: "super_admin",
  },
  {
    firstName: "ادمین",
    lastName: "فراز",
    mobile: "09120000002",
    password: "Admin@2026!",
    role: "admin",
  },
];

async function seed() {
  if (!process.env.MONGODB_URI)
    throw new Error("MONGODB_URI is not configured");
  await mongoose.connect(process.env.MONGODB_URI);
  const collection = mongoose.connection.collection("users");

  const existingSuperAdmin = await collection.findOne({
    role: "super_admin",
    mobile: "09120000001",
  });
  const targetSuperAdmin = await collection.findOne({
    role: "super_admin",
    mobile: "09127351124",
  });
  if (existingSuperAdmin && !targetSuperAdmin) {
    await collection.updateOne(
      { _id: existingSuperAdmin._id },
      { $set: { mobile: "09127351124", updatedAt: new Date() } },
    );
  }

  for (const user of users) {
    const password = await bcrypt.hash(user.password, 12);
    await collection.updateOne(
      { mobile: user.mobile },
      {
        $set: { ...user, password, updatedAt: new Date() },
        $setOnInsert: { createdAt: new Date() },
      },
      { upsert: true },
    );
    console.log(`${user.role}: ${user.mobile} / ${user.password}`);
  }
}

seed().finally(() => mongoose.disconnect());
