import { PrismaClient, RoadType, ConstructionType, UsageCategory } from "@prisma/client";
import bcrypt from "bcryptjs";
const { hash } = bcrypt;

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding...");

  const ay = await prisma.assessmentYear.create({ data: { year: "2026-2027", isCurrent: true } });

  for (let i = 1; i <= 13; i++) {
    await prisma.ward.create({ data: { name: `Ward ${i}`, description: `Ward ${i} area` } });
  }
  console.log("13 wards created");

  const roads = [
    "Hospital Road", "Main Market Road", "Station Road", "NH 57 Highway",
    "Central Bank Sadak", "Basantpur Sadak", "Gol Chowk Road",
    "Internal Lane 1", "Internal Lane 2", "Internal Lane 3",
  ];
  const roadTypes: RoadType[] = ["PRINCIPAL_MAIN_ROAD","PRINCIPAL_MAIN_ROAD","MAIN_ROAD","PRINCIPAL_MAIN_ROAD","MAIN_ROAD","MAIN_ROAD","MAIN_ROAD","OTHER","OTHER","OTHER"];
  for (let i = 0; i < roads.length; i++) {
    await prisma.road.create({ data: { name: roads[i], roadType: roadTypes[i], description: roads[i] } });
  }
  console.log("10 roads created");

  const rts: RoadType[] = ["PRINCIPAL_MAIN_ROAD", "MAIN_ROAD", "OTHER"];
  const cts: ConstructionType[] = ["RCC_ROOF", "ASBESTOS_ROOF", "OTHER"];
  const ucs: UsageCategory[] = ["RESIDENTIAL", "COMMERCIAL", "OTHER"];
  const rates = [[6,20,15,4,15,10,3,5,4],[5,15,12,3,12,8,2.5,4,3],[4,10,8,2.5,8,6,2,3,2.5]];
  for (let ri = 0; ri < 3; ri++) {
    for (let ci = 0; ci < 3; ci++) {
      for (let ui = 0; ui < 3; ui++) {
        await prisma.arvRate.create({ data: { assessmentYearId: ay.id, roadType: rts[ri], constructionType: cts[ci], usageCategory: ucs[ui], ratePerSqFt: rates[ri][ci * 3 + ui] } });
      }
    }
  }
  console.log("27 ARV rates created");

  await prisma.propertyTaxRate.create({ data: { assessmentYearId: ay.id, ratePercent: 9 } });
  await prisma.occupancyTypeConfig.createMany({ data: [
    { assessmentYearId: ay.id, occupancyType: "SELF_OCCUPIED", multiplierValue: 1 },
    { assessmentYearId: ay.id, occupancyType: "TENANT", multiplierValue: 1.5 },
  ]});
  await prisma.usageTypeConfig.createMany({ data: [
    { assessmentYearId: ay.id, usageCategory: "RESIDENTIAL", multiplierValue: 70 },
    { assessmentYearId: ay.id, usageCategory: "COMMERCIAL", multiplierValue: 80 },
    { assessmentYearId: ay.id, usageCategory: "OTHER", multiplierValue: 80 },
  ]});

  const factors = ["TYPE_NURSING_PHARMACY:1.5","TYPE_HOTEL_BARS:2","TYPE_SMALL_SHOP:1","TYPE_SHOP:1.5","TYPE_COMMERCIAL_OFFICE:2","TYPE_INDUSTRY:2","TYPE_GOVT_WITH_COMMERCE:2","TYPE_COACHING_GUIDANCE:1.5","TYPE_GODOWN:1.5","TYPE_PETROL_PUMP:2","TYPE_CINEMA_HALL:2","TYPE_BANK:2","TYPE_OTHER_COMMERCIAL:1.5"];
  for (const f of factors) {
    const [name, val] = f.split(":");
    await prisma.usageFactorConfig.create({ data: { assessmentYearId: ay.id, factorName: name, multiplierValue: parseFloat(val) } });
  }

  await prisma.discountTypeConfig.createMany({ data: [
    { assessmentYearId: ay.id, discountType: "REBATE", ratePercent: 5 },
    { assessmentYearId: ay.id, discountType: "RAIN_WATER_HARVESTING_DISCOUNT", ratePercent: 5 },
    { assessmentYearId: ay.id, discountType: "GOVERNMENT_ENTITY_DISCOUNT", ratePercent: 25 },
  ]});
  await prisma.interestRateConfig.create({ data: { assessmentYearId: ay.id, ratePercent: 1.5 } });

  const swData = [
    ["Residential",240],["Residential BPL/Slum",0],["Foot Path Shop",0],
    ["Shop/Dhaba/Coffee",600],["Restaurant/Guest House/Hostel",1800],["Star Hotel",60000],
    ["Business Office/Govt/Bank",3600],["Hospital/Nursing Home",6000],["School/College",1200],
    ["Cinema Hall",6000],["Petrol Pump",3600],["Godown",1200],["Industry",6000],["Other Commercial",1200],
  ];
  for (let i = 0; i < swData.length; i++) {
    await prisma.solidWasteCharge.create({ data: { consumerType: swData[i][0] as string, yearlyCharge: swData[i][1] as number, sortOrder: i + 1 } });
  }

  await prisma.vacantLandTaxRate.createMany({ data: [
    { assessmentYearId: ay.id, roadType: "PRINCIPAL_MAIN_ROAD", ratePerSqFt: 0.36 },
    { assessmentYearId: ay.id, roadType: "MAIN_ROAD", ratePerSqFt: 0.28 },
    { assessmentYearId: ay.id, roadType: "OTHER", ratePerSqFt: 0.19 },
  ]});
  await prisma.vacantLandThreshold.create({ data: { assessmentYearId: ay.id, thresholdPercent: 70 } });

  await prisma.systemSetting.createMany({ data: [
    { settingName: "fine_charges", enabled: false, description: "fine charges" },
    { settingName: "water_usage_charges", enabled: false, description: "water usage charges" },
    { settingName: "solid_waste_charges", enabled: false, description: "solid waste charges" },
    { settingName: "usage_factor", enabled: true, description: "usage factor" },
  ]});

  const pw = await hash("Admin@123", 12);
  await prisma.user.create({ data: { firstName: "Admin", lastName: "User", email: "admin@demo.com", mobile: "9999999999", passwordHash: pw, role: "ADMIN", status: "ACTIVE" } });
  console.log("Admin: admin@demo.com / Admin@123");
  console.log("Seed complete!");
}

main().catch(console.error).finally(() => prisma.$disconnect());
