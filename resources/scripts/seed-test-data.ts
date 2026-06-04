import { MeasurementType, PropertyStatus, PropertyType } from "@/lib/generated/prisma/enums";
import { prisma } from "@/lib/prisma/prisma";


async function main() {
  // 1. Get a user to act as creator
  let user = await prisma.user.findFirst();
  if (!user) {
    user = await prisma.user.create({
      data: {
        name: "Test Admin",
        email: "admin@test.com",
        role: "admin",
      },
    });
    console.log("Created test user:", user.id);
  } else {
    console.log("Using existing user:", user.id);
  }

  const userId = user.id;

  // Clear existing test data if needed (Optional: to keep it clean)
  await prisma.propertyStatusMapping.deleteMany({});
  await prisma.propertyDocument.deleteMany({});
  await prisma.property.deleteMany({});
  await prisma.requirement.deleteMany({});

  console.log("Seeding requirements...");

  // Requirement 1: Non-agricultural seeker (Should match A and B)
  await prisma.requirement.create({
    data: {
      title: "Looking for NA or Ag Land",
      propertyType: PropertyType.nonagricultural,
      location: "Anywhere",
      propertyForType: PropertyStatus.sell,
      minPrice: 1000000,
      maxPrice: 2000000,
      minMeasurement: 100,
      maxMeasurement: 200,
      measurementType: MeasurementType.sqfoot,
      createdBy: userId,
      updatedBy: userId,
    },
  });

  // Requirement 2: Plot seeker (Should match D and E because plot/tenament matched in code)
  await prisma.requirement.create({
    data: {
      title: "Looking for Plot/Tenament",
      propertyType: PropertyType.plot,
      location: "Anywhere",
      propertyForType: PropertyStatus.rent,
      minPrice: 10000,
      maxPrice: 20000,
      minMeasurement: 50,
      maxMeasurement: 100,
      measurementType: MeasurementType.sqfoot,
      createdBy: userId,
      updatedBy: userId,
    },
  });

  // Requirement 3: Flat seeker (Should match nothing or just flat)
  await prisma.requirement.create({
    data: {
      title: "Looking for Flat",
      propertyType: PropertyType.flat,
      location: "Anywhere",
      propertyForType: PropertyStatus.sell,
      minPrice: 1000000,
      maxPrice: 2000000,
      minMeasurement: 100,
      maxMeasurement: 200,
      measurementType: MeasurementType.sqfoot,
      createdBy: userId,
      updatedBy: userId,
    },
  });

  // Requirement 4: Seeker with no max measurement
  await prisma.requirement.create({
    data: {
      title: "Looking for Any Large Land",
      propertyType: PropertyType.agricultural,
      location: "Anywhere",
      propertyForType: PropertyStatus.sell,
      minPrice: 0,
      maxPrice: 100000000,
      minMeasurement: 1000,
      maxMeasurement: 0, // No max
      measurementType: MeasurementType.sqfoot,
      createdBy: userId,
      updatedBy: userId,
    },
  });

  console.log("Seeding properties...");

  // Property A: Agricultural, Sell, 1.5M, 150 sqfoot
  const propA = await prisma.property.create({
    data: {
      title: "Test Agricultural Land",
      propertyType: PropertyType.agricultural,
      address: "Test Village",
      measurementValue: 150,
      measurementType: MeasurementType.sqfoot,
      createdBy: userId,
      updatedBy: userId,
      status: {
        create: {
          status: PropertyStatus.sell,
          price: 1500000,
        },
      },
    },
  });

  // Property B: Non-agricultural, Sell, 1.2M, 120 sqfoot
  const propB = await prisma.property.create({
    data: {
      title: "Test NA Land",
      propertyType: PropertyType.nonagricultural,
      address: "City Outskirts",
      measurementValue: 120,
      measurementType: MeasurementType.sqfoot,
      createdBy: userId,
      updatedBy: userId,
      status: {
        create: {
          status: PropertyStatus.sell,
          price: 1200000,
        },
      },
    },
  });

  // Property C: Flat, Sell, 1.5M, 150 sqfoot
  const propC = await prisma.property.create({
    data: {
      title: "Test Flat",
      propertyType: PropertyType.flat,
      address: "Downtown",
      measurementValue: 150,
      measurementType: MeasurementType.sqfoot,
      createdBy: userId,
      updatedBy: userId,
      status: {
        create: {
          status: PropertyStatus.sell,
          price: 1500000,
        },
      },
    },
  });

  // Property D: Tenament, Rent, 15k, 75 sqfoot
  const propD = await prisma.property.create({
    data: {
      title: "Test Tenament",
      propertyType: PropertyType.tenament,
      address: "Suburb",
      measurementValue: 75,
      measurementType: MeasurementType.sqfoot,
      createdBy: userId,
      updatedBy: userId,
      status: {
        create: {
          status: PropertyStatus.rent,
          price: 15000,
        },
      },
    },
  });

  // Property E: Plot, Rent, 12k, 60 sqfoot
  const propE = await prisma.property.create({
    data: {
      title: "Test Plot",
      propertyType: PropertyType.plot,
      address: "Developer Site",
      measurementValue: 60,
      measurementType: MeasurementType.sqfoot,
      createdBy: userId,
      updatedBy: userId,
      status: {
        create: {
          status: PropertyStatus.rent,
          price: 12000,
        },
      },
    },
  });

  // Property F: Huge Agricultural Land, Sell, 10M, 50,000,000 sqfoot
  const propF = await prisma.property.create({
    data: {
      title: "Huge Estate",
      propertyType: PropertyType.agricultural,
      address: "Remote Area",
      measurementValue: 50000000,
      measurementType: MeasurementType.sqfoot,
      createdBy: userId,
      updatedBy: userId,
      status: {
        create: {
          status: PropertyStatus.sell,
          price: 10000000,
        },
      },
    },
  });

  console.log("Seed data created successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
