/**
 * Full demo seed — all tables, related records, single password for every user.
 * Run: npm run db:seed  (or npx tsx prisma/seed/full-demo.ts)
 *
 * Idempotent: safe to re-run; upserts users/config and syncs all passwords to DEMO_PASSWORD.
 */
import {
  PrismaClient,
  RoadType,
  ConstructionType,
  UsageCategory,
  UserRole,
  FormStatus,
  PaymentMode,
  DisputeStatus,
  GrievanceStatus,
} from "@prisma/client";
import bcrypt from "bcryptjs";

const { hash } = bcrypt;
const prisma = new PrismaClient();

export const DEMO_PASSWORD = "Change123";

const CITIZEN_NAMES: [string, string][] = [
  ["Ramesh", "Prasad"],
  ["Sita", "Kumari"],
  ["Mohan", "Lal"],
  ["Geeta", "Devi"],
  ["Suresh", "Chaudhary"],
  ["Anita", "Roy"],
  ["Vikram", "Thakur"],
  ["Meera", "Jha"],
  ["Ravi", "Shankar"],
  ["Kavita", "Mishra"],
  ["Arun", "Gupta"],
  ["Pooja", "Sinha"],
  ["Dinesh", "Pandey"],
  ["Sarita", "Das"],
  ["Nitin", "Tiwari"],
  ["Lalit", "Yadav"],
  ["Rekha", "Singh"],
];

async function seedMasterConfig() {
  let ay = await prisma.assessmentYear.findFirst({ where: { isCurrent: true } });
  if (!ay) {
    ay = await prisma.assessmentYear.create({ data: { year: "2026-2027", isCurrent: true } });
    console.log("Created assessment year 2026-2027");
  }

  if ((await prisma.ward.count()) === 0) {
    for (let i = 1; i <= 13; i++) {
      await prisma.ward.create({ data: { name: `Ward ${i}`, description: `Ward ${i} — demo area` } });
    }
    console.log("13 wards created");
  }

  if ((await prisma.road.count()) === 0) {
    const roads: [string, RoadType][] = [
      ["Hospital Road", "PRINCIPAL_MAIN_ROAD"],
      ["Main Market Road", "PRINCIPAL_MAIN_ROAD"],
      ["Station Road", "MAIN_ROAD"],
      ["NH 57 Highway", "PRINCIPAL_MAIN_ROAD"],
      ["Central Bank Sadak", "MAIN_ROAD"],
      ["Basantpur Sadak", "MAIN_ROAD"],
      ["Gol Chowk Road", "MAIN_ROAD"],
      ["Internal Lane 1", "OTHER"],
      ["Internal Lane 2", "OTHER"],
      ["Internal Lane 3", "OTHER"],
    ];
    for (const [name, roadType] of roads) {
      await prisma.road.create({ data: { name, roadType, description: name } });
    }
    console.log("10 roads created");
  }

  if ((await prisma.arvRate.count()) === 0) {
    const rts: RoadType[] = ["PRINCIPAL_MAIN_ROAD", "MAIN_ROAD", "OTHER"];
    const cts: ConstructionType[] = ["RCC_ROOF", "ASBESTOS_ROOF", "OTHER"];
    const ucs: UsageCategory[] = ["RESIDENTIAL", "COMMERCIAL", "OTHER"];
    const rates = [
      [6, 20, 15, 4, 15, 10, 3, 5, 4],
      [5, 15, 12, 3, 12, 8, 2.5, 4, 3],
      [4, 10, 8, 2.5, 8, 6, 2, 3, 2.5],
    ];
    for (let ri = 0; ri < 3; ri++) {
      for (let ci = 0; ci < 3; ci++) {
        for (let ui = 0; ui < 3; ui++) {
          await prisma.arvRate.create({
            data: {
              assessmentYearId: ay.id,
              roadType: rts[ri],
              constructionType: cts[ci],
              usageCategory: ucs[ui],
              ratePerSqFt: rates[ri][ci * 3 + ui],
            },
          });
        }
      }
    }
    console.log("27 ARV rates created");
  }

  if ((await prisma.propertyTaxRate.count()) === 0) {
    await prisma.propertyTaxRate.create({ data: { assessmentYearId: ay.id, ratePercent: 9 } });
    await prisma.occupancyTypeConfig.createMany({
      data: [
        { assessmentYearId: ay.id, occupancyType: "SELF_OCCUPIED", multiplierValue: 1 },
        { assessmentYearId: ay.id, occupancyType: "TENANT", multiplierValue: 1.5 },
      ],
    });
    await prisma.usageTypeConfig.createMany({
      data: [
        { assessmentYearId: ay.id, usageCategory: "RESIDENTIAL", multiplierValue: 70 },
        { assessmentYearId: ay.id, usageCategory: "COMMERCIAL", multiplierValue: 80 },
        { assessmentYearId: ay.id, usageCategory: "OTHER", multiplierValue: 80 },
      ],
    });
    const factors = [
      "TYPE_NURSING_PHARMACY:1.5",
      "TYPE_HOTEL_BARS:2",
      "TYPE_SMALL_SHOP:1",
      "TYPE_SHOP:1.5",
      "TYPE_COMMERCIAL_OFFICE:2",
      "TYPE_INDUSTRY:2",
      "TYPE_GOVT_WITH_COMMERCE:2",
      "TYPE_COACHING_GUIDANCE:1.5",
      "TYPE_GODOWN:1.5",
      "TYPE_PETROL_PUMP:2",
      "TYPE_CINEMA_HALL:2",
      "TYPE_BANK:2",
      "TYPE_OTHER_COMMERCIAL:1.5",
    ];
    for (const f of factors) {
      const [name, val] = f.split(":");
      await prisma.usageFactorConfig.create({
        data: { assessmentYearId: ay.id, factorName: name, multiplierValue: parseFloat(val) },
      });
    }
    await prisma.discountTypeConfig.createMany({
      data: [
        { assessmentYearId: ay.id, discountType: "REBATE", ratePercent: 5 },
        { assessmentYearId: ay.id, discountType: "RAIN_WATER_HARVESTING_DISCOUNT", ratePercent: 5 },
        { assessmentYearId: ay.id, discountType: "GOVERNMENT_ENTITY_DISCOUNT", ratePercent: 25 },
      ],
    });
    await prisma.interestRateConfig.create({ data: { assessmentYearId: ay.id, ratePercent: 1.5 } });
    await prisma.vacantLandTaxRate.createMany({
      data: [
        { assessmentYearId: ay.id, roadType: "PRINCIPAL_MAIN_ROAD", ratePerSqFt: 0.36 },
        { assessmentYearId: ay.id, roadType: "MAIN_ROAD", ratePerSqFt: 0.28 },
        { assessmentYearId: ay.id, roadType: "OTHER", ratePerSqFt: 0.19 },
      ],
    });
    await prisma.vacantLandThreshold.create({
      data: { assessmentYearId: ay.id, thresholdPercent: 70 },
    });
    console.log("Tax configuration created");
  }

  if ((await prisma.solidWasteCharge.count()) === 0) {
    const swData: [string, number][] = [
      ["Residential", 240],
      ["Residential BPL/Slum", 0],
      ["Foot Path Shop", 0],
      ["Shop/Dhaba/Coffee", 600],
      ["Restaurant/Guest House/Hostel", 1800],
      ["Star Hotel", 60000],
      ["Business Office/Govt/Bank", 3600],
      ["Hospital/Nursing Home", 6000],
      ["School/College", 1200],
      ["Cinema Hall", 6000],
      ["Petrol Pump", 3600],
      ["Godown", 1200],
      ["Industry", 6000],
      ["Other Commercial", 1200],
    ];
    for (let i = 0; i < swData.length; i++) {
      await prisma.solidWasteCharge.create({
        data: { consumerType: swData[i][0], yearlyCharge: swData[i][1], sortOrder: i + 1 },
      });
    }
  }

  if ((await prisma.systemSetting.count()) === 0) {
    await prisma.systemSetting.createMany({
      data: [
        { settingName: "fine_charges", enabled: false, description: "Fine charges" },
        { settingName: "water_usage_charges", enabled: false, description: "Water usage charges" },
        { settingName: "solid_waste_charges", enabled: true, description: "Solid waste charges" },
        { settingName: "usage_factor", enabled: true, description: "Usage factor" },
      ],
    });
  }

  return ay;
}

async function upsertUser(
  data: {
    firstName: string;
    lastName: string;
    email?: string | null;
    mobile: string;
    role: UserRole;
  },
  passwordHash: string,
) {
  const byMobile = await prisma.user.findUnique({ where: { mobile: data.mobile } });
  if (byMobile) {
    return prisma.user.update({
      where: { id: byMobile.id },
      data: { ...data, passwordHash, status: "ACTIVE" },
    });
  }
  if (data.email) {
    const byEmail = await prisma.user.findUnique({ where: { email: data.email } });
    if (byEmail) {
      return prisma.user.update({
        where: { id: byEmail.id },
        data: { ...data, passwordHash, status: "ACTIVE" },
      });
    }
  }
  return prisma.user.create({ data: { ...data, passwordHash, status: "ACTIVE" } });
}

async function seedUsers(passwordHash: string) {
  const officers: {
    firstName: string;
    lastName: string;
    email: string;
    mobile: string;
    role: UserRole;
  }[] = [
    { firstName: "Admin", lastName: "User", email: "admin@demo.com", mobile: "9999999999", role: "ADMIN" },
    { firstName: "Rajesh", lastName: "Kumar", email: "rajesh@municipality.gov", mobile: "9876543210", role: "EO" },
    { firstName: "Priya", lastName: "Sharma", email: "priya@municipality.gov", mobile: "9876543211", role: "HC" },
    { firstName: "Amit", lastName: "Singh", email: "amit@municipality.gov", mobile: "9876543212", role: "TI" },
    { firstName: "Sunita", lastName: "Devi", email: "sunita@municipality.gov", mobile: "9876543213", role: "TI" },
    { firstName: "Manoj", lastName: "Yadav", email: "manoj@municipality.gov", mobile: "9876543214", role: "GO" },
    { firstName: "Deepak", lastName: "Verma", email: "deepak@municipality.gov", mobile: "9876543215", role: "HC" },
  ];

  const officerUsers = [];
  for (const o of officers) {
    officerUsers.push(await upsertUser(o, passwordHash));
  }

  const citizens = [];
  for (let i = 0; i < CITIZEN_NAMES.length; i++) {
    const [firstName, lastName] = CITIZEN_NAMES[i];
    const mobile = `70012345${String(i + 1).padStart(2, "0")}`;
    citizens.push(
      await upsertUser({ firstName, lastName, mobile, role: "USER", email: null }, passwordHash),
    );
  }

  const wards = await prisma.ward.findMany({ orderBy: { name: "asc" } });
  const ti = officerUsers.find((u) => u.email === "amit@municipality.gov");
  const hc = officerUsers.find((u) => u.email === "priya@municipality.gov");
  const eo = officerUsers.find((u) => u.email === "rajesh@municipality.gov");

  if (ti) {
    await prisma.staff.upsert({
      where: { userId: ti.id },
      create: {
        userId: ti.id,
        assignedWards: { create: wards.slice(0, 7).map((w) => ({ wardId: w.id })) },
      },
      update: {},
    });
  }
  if (hc) {
    await prisma.staff.upsert({
      where: { userId: hc.id },
      create: {
        userId: hc.id,
        assignedWards: { create: wards.map((w) => ({ wardId: w.id })) },
      },
      update: {},
    });
  }
  if (eo) {
    await prisma.staff.upsert({
      where: { userId: eo.id },
      create: { userId: eo.id },
      update: {},
    });
  }

  console.log(`Users: ${officerUsers.length} officers, ${citizens.length} citizens (password: ${DEMO_PASSWORD})`);
  return { officerUsers, citizens, admin: officerUsers[0] };
}

type PropertySeed = {
  propertyId: string;
  ownerIdx: number;
  wardIdx: number;
  roadIdx: number;
  type: "LAND_AND_BUILDING" | "VACANT_LAND";
  construction: ConstructionType | null;
  occupancy: "SELF_OCCUPIED" | "TENANT";
  usage: UsageCategory;
  usageFactor?: string;
  solidWaste?: string;
  plotArea: number;
  builtUp: number;
  address: string;
  verified: boolean;
  formStatus: FormStatus;
  paid: boolean;
  partialPay?: boolean;
};

const PROPERTY_SEEDS: PropertySeed[] = [
  { propertyId: "10000001", ownerIdx: 0, wardIdx: 0, roadIdx: 0, type: "LAND_AND_BUILDING", construction: "RCC_ROOF", occupancy: "SELF_OCCUPIED", usage: "RESIDENTIAL", solidWaste: "Residential", plotArea: 1200, builtUp: 800, address: "House No. 45, Hospital Road", verified: true, formStatus: "APPROVED", paid: true },
  { propertyId: "10000002", ownerIdx: 1, wardIdx: 1, roadIdx: 1, type: "LAND_AND_BUILDING", construction: "RCC_ROOF", occupancy: "TENANT", usage: "COMMERCIAL", usageFactor: "TYPE_SHOP", solidWaste: "Shop/Dhaba/Coffee", plotArea: 2000, builtUp: 1500, address: "Shop No. 12, Main Market", verified: true, formStatus: "APPROVED", paid: true },
  { propertyId: "10000003", ownerIdx: 2, wardIdx: 2, roadIdx: 2, type: "LAND_AND_BUILDING", construction: "ASBESTOS_ROOF", occupancy: "SELF_OCCUPIED", usage: "RESIDENTIAL", solidWaste: "Residential", plotArea: 800, builtUp: 600, address: "Gali No. 3, Station Road", verified: true, formStatus: "APPROVED", paid: false },
  { propertyId: "10000004", ownerIdx: 3, wardIdx: 3, roadIdx: 3, type: "VACANT_LAND", construction: null, occupancy: "SELF_OCCUPIED", usage: "OTHER", plotArea: 3000, builtUp: 0, address: "Plot No. 78, NH 57", verified: false, formStatus: "SUBMITTED", paid: false },
  { propertyId: "10000005", ownerIdx: 4, wardIdx: 4, roadIdx: 3, type: "LAND_AND_BUILDING", construction: "RCC_ROOF", occupancy: "SELF_OCCUPIED", usage: "RESIDENTIAL", plotArea: 1500, builtUp: 1000, address: "House No. 102, Station Road", verified: true, formStatus: "APPROVED", paid: true, partialPay: true },
  { propertyId: "10000006", ownerIdx: 5, wardIdx: 5, roadIdx: 1, type: "LAND_AND_BUILDING", construction: "RCC_ROOF", occupancy: "TENANT", usage: "COMMERCIAL", usageFactor: "TYPE_HOTEL_BARS", solidWaste: "Restaurant/Guest House/Hostel", plotArea: 5000, builtUp: 3500, address: "Hotel Paradise, Main Market", verified: true, formStatus: "APPROVED", paid: false },
  { propertyId: "10000007", ownerIdx: 6, wardIdx: 6, roadIdx: 0, type: "LAND_AND_BUILDING", construction: "ASBESTOS_ROOF", occupancy: "SELF_OCCUPIED", usage: "RESIDENTIAL", plotArea: 600, builtUp: 450, address: "Quarter No. 8, Hospital Road", verified: true, formStatus: "DRAFT", paid: false },
  { propertyId: "10000008", ownerIdx: 7, wardIdx: 7, roadIdx: 7, type: "LAND_AND_BUILDING", construction: "OTHER", occupancy: "SELF_OCCUPIED", usage: "RESIDENTIAL", plotArea: 500, builtUp: 350, address: "Kutcha House, Internal Lane 1", verified: false, formStatus: "REJECTED", paid: false },
  { propertyId: "10000009", ownerIdx: 8, wardIdx: 8, roadIdx: 0, type: "LAND_AND_BUILDING", construction: "RCC_ROOF", occupancy: "TENANT", usage: "COMMERCIAL", usageFactor: "TYPE_NURSING_PHARMACY", solidWaste: "Hospital/Nursing Home", plotArea: 1800, builtUp: 1200, address: "Nursing Home, Hospital Road", verified: true, formStatus: "APPROVED", paid: true },
  { propertyId: "10000010", ownerIdx: 9, wardIdx: 9, roadIdx: 5, type: "VACANT_LAND", construction: null, occupancy: "SELF_OCCUPIED", usage: "RESIDENTIAL", plotArea: 2500, builtUp: 0, address: "Empty Plot, Basantpur", verified: true, formStatus: "SUBMITTED", paid: false },
  { propertyId: "10000011", ownerIdx: 10, wardIdx: 10, roadIdx: 3, type: "LAND_AND_BUILDING", construction: "RCC_ROOF", occupancy: "SELF_OCCUPIED", usage: "COMMERCIAL", usageFactor: "TYPE_PETROL_PUMP", solidWaste: "Petrol Pump", plotArea: 3000, builtUp: 2000, address: "Petrol Pump, NH 57", verified: true, formStatus: "APPROVED", paid: true },
  { propertyId: "10000012", ownerIdx: 11, wardIdx: 11, roadIdx: 6, type: "LAND_AND_BUILDING", construction: "ASBESTOS_ROOF", occupancy: "SELF_OCCUPIED", usage: "RESIDENTIAL", plotArea: 900, builtUp: 700, address: "House No. 33, Gol Chowk", verified: true, formStatus: "APPROVED", paid: false },
  { propertyId: "10000013", ownerIdx: 12, wardIdx: 12, roadIdx: 0, type: "LAND_AND_BUILDING", construction: "RCC_ROOF", occupancy: "TENANT", usage: "COMMERCIAL", usageFactor: "TYPE_COMMERCIAL_OFFICE", solidWaste: "Business Office/Govt/Bank", plotArea: 4000, builtUp: 2800, address: "Office Complex, Hospital Road", verified: true, formStatus: "APPROVED", paid: true },
  { propertyId: "10000014", ownerIdx: 13, wardIdx: 0, roadIdx: 2, type: "LAND_AND_BUILDING", construction: "RCC_ROOF", occupancy: "SELF_OCCUPIED", usage: "RESIDENTIAL", plotArea: 1100, builtUp: 750, address: "Behind Post Office", verified: true, formStatus: "APPROVED", paid: false },
  { propertyId: "10000015", ownerIdx: 14, wardIdx: 1, roadIdx: 4, type: "LAND_AND_BUILDING", construction: "OTHER", occupancy: "SELF_OCCUPIED", usage: "RESIDENTIAL", plotArea: 700, builtUp: 500, address: "Near Bus Stand", verified: true, formStatus: "DRAFT", paid: false },
  { propertyId: "10000016", ownerIdx: 15, wardIdx: 2, roadIdx: 1, type: "LAND_AND_BUILDING", construction: "RCC_ROOF", occupancy: "TENANT", usage: "COMMERCIAL", usageFactor: "TYPE_BANK", plotArea: 2200, builtUp: 1800, address: "Bank Branch, Main Market", verified: true, formStatus: "APPROVED", paid: true },
  { propertyId: "10000017", ownerIdx: 16, wardIdx: 3, roadIdx: 8, type: "LAND_AND_BUILDING", construction: "ASBESTOS_ROOF", occupancy: "SELF_OCCUPIED", usage: "RESIDENTIAL", plotArea: 950, builtUp: 680, address: "Lane 2, Internal Lane 2", verified: false, formStatus: "SUBMITTED", paid: false },
  { propertyId: "10000018", ownerIdx: 0, wardIdx: 4, roadIdx: 1, type: "LAND_AND_BUILDING", construction: "RCC_ROOF", occupancy: "SELF_OCCUPIED", usage: "RESIDENTIAL", plotArea: 1000, builtUp: 720, address: "Second holding, Ward 5", verified: true, formStatus: "APPROVED", paid: false },
  { propertyId: "10000019", ownerIdx: 2, wardIdx: 5, roadIdx: 9, type: "VACANT_LAND", construction: null, occupancy: "SELF_OCCUPIED", usage: "OTHER", plotArea: 1800, builtUp: 0, address: "Vacant plot, Internal Lane 3", verified: true, formStatus: "APPROVED", paid: true },
  { propertyId: "10000020", ownerIdx: 4, wardIdx: 6, roadIdx: 2, type: "LAND_AND_BUILDING", construction: "RCC_ROOF", occupancy: "TENANT", usage: "COMMERCIAL", usageFactor: "TYPE_COACHING_GUIDANCE", plotArea: 3500, builtUp: 2400, address: "Coaching Centre, Station Road", verified: true, formStatus: "REJECTED", paid: false },
  { propertyId: "10000021", ownerIdx: 6, wardIdx: 7, roadIdx: 5, type: "LAND_AND_BUILDING", construction: "RCC_ROOF", occupancy: "SELF_OCCUPIED", usage: "RESIDENTIAL", plotArea: 1300, builtUp: 900, address: "Residence, Basantpur Sadak", verified: true, formStatus: "APPROVED", paid: true },
  { propertyId: "10000022", ownerIdx: 8, wardIdx: 8, roadIdx: 6, type: "LAND_AND_BUILDING", construction: "OTHER", occupancy: "SELF_OCCUPIED", usage: "RESIDENTIAL", plotArea: 850, builtUp: 600, address: "House near Gol Chowk", verified: true, formStatus: "APPROVED", paid: false, partialPay: true },
];

async function calcDemand(
  ayId: string,
  prop: {
    propertyType: string;
    builtUpAreaSqFt: number | null;
    plotAreaSqFt: number | null;
    roadId: string | null;
    constructionType: ConstructionType | null;
    occupancyType: string | null;
    usageCategory: UsageCategory | null;
  },
) {
  let totalDemand = 0;
  let arvAmount = 0;
  if (prop.propertyType === "LAND_AND_BUILDING" && prop.builtUpAreaSqFt) {
    const road = prop.roadId
      ? await prisma.road.findUnique({ where: { id: prop.roadId } })
      : null;
    const arvRate = await prisma.arvRate.findFirst({
      where: {
        assessmentYearId: ayId,
        roadType: road?.roadType || "OTHER",
        constructionType: prop.constructionType || "OTHER",
        usageCategory: prop.usageCategory || "RESIDENTIAL",
      },
    });
    arvAmount = (prop.builtUpAreaSqFt || 0) * (arvRate?.ratePerSqFt || 5);
    const taxRate = await prisma.propertyTaxRate.findFirst({ where: { assessmentYearId: ayId } });
    totalDemand = arvAmount * ((taxRate?.ratePercent || 9) / 100);
    const occ = await prisma.occupancyTypeConfig.findFirst({
      where: { assessmentYearId: ayId, occupancyType: (prop.occupancyType as "SELF_OCCUPIED") || "SELF_OCCUPIED" },
    });
    totalDemand *= occ?.multiplierValue || 1;
    const sw = await prisma.solidWasteCharge.findFirst({
      where: { consumerType: "Residential" },
    });
    if (sw) totalDemand += sw.yearlyCharge;
  } else if (prop.propertyType === "VACANT_LAND") {
    const road = prop.roadId
      ? await prisma.road.findUnique({ where: { id: prop.roadId } })
      : null;
    const vlRate = await prisma.vacantLandTaxRate.findFirst({
      where: { assessmentYearId: ayId, roadType: road?.roadType || "OTHER" },
    });
    totalDemand = (prop.plotAreaSqFt || 0) * (vlRate?.ratePerSqFt || 0.2);
    arvAmount = totalDemand;
  }
  totalDemand = Math.round(totalDemand * 100) / 100;
  arvAmount = Math.round(arvAmount * 100) / 100;
  return { totalDemand, arvAmount, propertyTax: totalDemand };
}

async function seedTransactional(
  ayId: string,
  citizens: { id: string; firstName: string; lastName: string; mobile: string }[],
  admin: { id: string },
) {
  const wards = await prisma.ward.findMany({ orderBy: { name: "asc" } });
  const roads = await prisma.road.findMany();
  const properties: { id: string; propertyId: string; ownerId: string }[] = [];

  for (const p of PROPERTY_SEEDS) {
    const owner = citizens[p.ownerIdx];
    const ward = wards[p.wardIdx % wards.length];
    const road = roads[p.roadIdx % roads.length];

    const prop = await prisma.property.upsert({
      where: { propertyId: p.propertyId },
      create: {
        propertyId: p.propertyId,
        propertyType: p.type,
        ownershipType: "SINGLE_OWNER",
        housingScheme: "NO",
        wardId: ward.id,
        roadId: road.id,
        ownerId: owner.id,
        ownerName: `${owner.firstName} ${owner.lastName}`,
        guardianName: `${owner.lastName} Sr.`,
        gender: p.ownerIdx % 2 === 0 ? "MALE" : "FEMALE",
        mobile: owner.mobile,
        email: `${owner.firstName.toLowerCase()}.${owner.lastName.toLowerCase()}@example.com`,
        propertyAddress: p.address,
        propertyCity: "Birpur",
        propertyState: "Bihar",
        propertyPincode: "854318",
        corrAddress: p.address,
        corrCity: "Birpur",
        corrState: "Bihar",
        corrPincode: "854318",
        waterConnection: p.ownerIdx % 3 === 0,
        solidWasteConsumerType: p.solidWaste,
        constructionType: p.construction ?? undefined,
        occupancyType: p.occupancy,
        usageCategory: p.usage,
        usageFactor: p.usageFactor,
        plotAreaSqFt: p.plotArea,
        builtUpAreaSqFt: p.builtUp || undefined,
        numberOfFloors: p.type === "LAND_AND_BUILDING" ? (p.builtUp > 1500 ? 2 : 1) : undefined,
        verificationStatus: p.verified ? "VERIFIED" : "PENDING",
        acquisitionDate: new Date(2012, 5, 15),
        oldHoldingNumber: `OLD-${p.propertyId}`,
        newHoldingNumber: `NH-${p.propertyId}`,
      },
      update: {
        ownerId: owner.id,
        ownerName: `${owner.firstName} ${owner.lastName}`,
        wardId: ward.id,
        roadId: road.id,
        verificationStatus: p.verified ? "VERIFIED" : "PENDING",
      },
    });
    properties.push(prop);

    const roadRecord = await prisma.road.findUnique({ where: { id: prop.roadId! } });
    const { totalDemand, arvAmount, propertyTax } = await calcDemand(ayId, {
      propertyType: prop.propertyType,
      builtUpAreaSqFt: prop.builtUpAreaSqFt,
      plotAreaSqFt: prop.plotAreaSqFt,
      roadId: prop.roadId,
      constructionType: prop.constructionType,
      occupancyType: prop.occupancyType,
      usageCategory: prop.usageCategory,
    });

    const status = p.formStatus;
    const assessment = await prisma.assessment.upsert({
      where: { assessmentYearId_propertyId: { assessmentYearId: ayId, propertyId: prop.id } },
      create: {
        assessmentYearId: ayId,
        propertyId: prop.id,
        formStatus: status,
        arvAmount,
        propertyTax,
        totalDemand,
        netPayable: totalDemand,
        createdById: admin.id,
        lastModifiedById: admin.id,
        submittedAt: status !== "DRAFT" ? new Date("2026-03-15") : undefined,
        submittedById: status !== "DRAFT" ? admin.id : undefined,
        approvedAt: status === "APPROVED" ? new Date("2026-04-01") : undefined,
        approvedById: status === "APPROVED" ? admin.id : undefined,
      },
      update: {
        formStatus: status,
        arvAmount,
        propertyTax,
        totalDemand,
        netPayable: totalDemand,
      },
    });

    if (status === "APPROVED" && totalDemand > 0) {
      const demandId = `DEM-${p.propertyId}`;
      let balance = totalDemand;
      let demandStatus = "UNPAID";
      if (p.paid) {
        demandStatus = p.partialPay ? "PARTIAL" : "PAID";
        balance = p.partialPay ? Math.round(totalDemand * 0.4 * 100) / 100 : 0;
      }

      const demand = await prisma.demand.upsert({
        where: { demandId },
        create: {
          demandId,
          assessmentId: assessment.id,
          amount: totalDemand,
          balanceAmount: balance,
          status: demandStatus,
        },
        update: { amount: totalDemand, balanceAmount: balance, status: demandStatus },
      });

      if (p.paid || p.partialPay) {
        const paidAmount = totalDemand - balance;
        const existingPay = await prisma.payment.findFirst({ where: { demandId: demand.id } });
        if (!existingPay) {
          await prisma.payment.create({
            data: {
              paymentId: `PAY-${p.propertyId}`,
              demandId: demand.id,
              amount: paidAmount,
              paymentMode: p.partialPay ? "CHEQUE" : (["CASH", "ONLINE", "NEFT"] as PaymentMode[])[p.ownerIdx % 3],
              paymentStatus: "SUCCESS",
              paymentDate: new Date("2026-04-10"),
              paidById: owner.id,
              orderCreatedById: admin.id,
              transactionRef: p.partialPay ? undefined : `TXN${p.propertyId}`,
              chequeNumber: p.partialPay ? `CHQ${p.propertyId}` : undefined,
            },
          });
        }
      }
    }
  }
  console.log(`${properties.length} properties with assessments/demands`);

  const disputeData: { propId: string; subject: string; status: DisputeStatus; withDemand?: boolean }[] = [
    { propId: "10000001", subject: "Incorrect built-up area in assessment", status: "OPEN" },
    { propId: "10000003", subject: "Wrong ward assignment on demand notice", status: "IN_PROGRESS" },
    { propId: "10000006", subject: "Commercial usage factor disputed", status: "RESOLVED", withDemand: true },
    { propId: "10000012", subject: "Double demand for same assessment year", status: "OPEN" },
    { propId: "10000014", subject: "Vacant land wrongly classified as building", status: "REJECTED" },
  ];

  for (const d of disputeData) {
    const prop = properties.find((x) => x.propertyId === d.propId);
    if (!prop) continue;
    const owner = citizens.find((c) => c.id === prop.ownerId);
    if (!owner) continue;
    const demand = d.withDemand
      ? await prisma.demand.findFirst({
          where: { assessment: { propertyId: prop.id } },
        })
      : null;
    const exists = await prisma.dispute.findFirst({
      where: { propertyId: prop.id, subject: d.subject },
    });
    if (!exists) {
      await prisma.dispute.create({
        data: {
          propertyId: prop.id,
          demandId: demand?.id,
          subject: d.subject,
          description: `${d.subject}. Property ${d.propId}. Filed for demo review.`,
          status: d.status,
          comments: d.status === "RESOLVED" ? "Area rechecked; demand revised." : undefined,
          createdById: owner.id,
        },
      });
    }
  }

  const grievanceData: {
    ownerIdx: number;
    propId?: string;
    wardIdx?: number;
    subject: string;
    status: GrievanceStatus;
  }[] = [
    { ownerIdx: 0, propId: "10000001", subject: "Delayed assessment approval", status: "OPEN" },
    { ownerIdx: 1, propId: "10000002", subject: "Online payment not reflecting", status: "IN_PROGRESS" },
    { ownerIdx: 2, wardIdx: 2, subject: "Staff unavailable at counter", status: "RESOLVED" },
    { ownerIdx: 3, propId: "10000004", subject: "Receipt not generated after payment", status: "CLOSED" },
    { ownerIdx: 5, propId: "10000006", subject: "Incorrect solid waste charge", status: "OPEN" },
    { ownerIdx: 7, wardIdx: 7, subject: "Request for property reassessment", status: "IN_PROGRESS" },
  ];

  for (const g of grievanceData) {
    const user = citizens[g.ownerIdx];
    const prop = g.propId ? properties.find((x) => x.propertyId === g.propId) : undefined;
    const exists = await prisma.grievance.findFirst({
      where: { userId: user.id, subject: g.subject },
    });
    if (!exists) {
      await prisma.grievance.create({
        data: {
          userId: user.id,
          propertyId: prop?.id,
          wardId: g.wardIdx != null ? wards[g.wardIdx % wards.length].id : undefined,
          subject: g.subject,
          message: `Dear Sir/Madam, ${g.subject}. Please resolve at earliest. — ${user.firstName} ${user.lastName}`,
          status: g.status,
        },
      });
    }
  }
  console.log("Disputes and grievances seeded");
}

async function seedCms() {
  if ((await prisma.websiteAboutUs.count()) === 0) {
    await prisma.websiteAboutUs.create({
      data: {
        content:
          "Nagar Panchayat Birpur Property Tax Management System helps citizens register properties, file assessments, pay tax, and track grievances online. This is demo content for municipal demonstrations.",
      },
    });
  }

  const contents = [
    { purpose: "GALLERY" as const, title: "Tax Awareness Campaign 2026", description: "Ward-wise awareness camps" },
    { purpose: "GALLERY" as const, title: "Municipal Office Inauguration", description: "New citizen service centre" },
    { purpose: "ANNOUNCEMENT" as const, title: "Last Date for Tax Payment", description: "Pay before 31 March for 5% rebate" },
    { purpose: "NOTICE" as const, title: "Ward Meeting Schedule", description: "Monthly meetings in all 13 wards" },
    { purpose: "BANNER" as const, title: "Pay Tax Online", description: "Use the citizen portal 24×7" },
    { purpose: "NOTICE" as const, title: "Reassessment Drive", description: "Field survey in Wards 1–7" },
  ];
  for (let i = 0; i < contents.length; i++) {
    const c = contents[i];
    const existing = await prisma.websiteContent.findFirst({ where: { title: c.title } });
    if (!existing) await prisma.websiteContent.create({ data: { ...c, isActive: true, sortOrder: i } });
  }

  const helplines = [
    { name: "Municipal Office", number: "+91-6274-123456", designation: "Main Office" },
    { name: "Tax Helpline", number: "+91-6274-123457", designation: "Tax Department" },
    { name: "Grievance Cell", number: "+91-6274-123458", designation: "Public Grievance" },
    { name: "Emergency", number: "112", designation: "Police / Fire / Ambulance" },
  ];
  for (const h of helplines) {
    if (!(await prisma.helplineNumber.findFirst({ where: { number: h.number } }))) {
      await prisma.helplineNumber.create({ data: { ...h, sortOrder: helplines.indexOf(h) } });
    }
  }

  const links = [
    { title: "Bihar Government Portal", url: "https://state.bihar.gov.in" },
    { title: "Urban Development Department", url: "https://urban.bihar.gov.in" },
    { title: "India.gov.in", url: "https://india.gov.in" },
  ];
  for (const l of links) {
    if (!(await prisma.usefulLink.findFirst({ where: { url: l.url } }))) {
      await prisma.usefulLink.create({ data: l });
    }
  }

  const officerProfiles = [
    { name: "Rajesh Kumar", designation: "Executive Officer", mobile: "9876543210", email: "rajesh@municipality.gov" },
    { name: "Priya Sharma", designation: "Head Clerk", mobile: "9876543211", email: "priya@municipality.gov" },
    { name: "Amit Singh", designation: "Tax Inspector", mobile: "9876543212", email: "amit@municipality.gov" },
    { name: "Manoj Yadav", designation: "Grievance Officer", mobile: "9876543214", email: "manoj@municipality.gov" },
  ];
  for (const o of officerProfiles) {
    if (!(await prisma.officerProfile.findFirst({ where: { mobile: o.mobile } }))) {
      await prisma.officerProfile.create({ data: { ...o, sortOrder: officerProfiles.indexOf(o) } });
    }
  }

  const services = [
    { name: "Property Tax Assessment", description: "Self and officer-assisted assessment", isKeyService: true },
    { name: "Online Tax Payment", description: "Pay via UPI, card, or net banking", isKeyService: true },
    { name: "Grievance Redressal", description: "File and track grievances", isKeyService: true },
    { name: "Property Registration", description: "Register new holdings", isKeyService: false },
    { name: "Demand Notice", description: "Download annual demand", isKeyService: false },
    { name: "Payment Receipt", description: "Download payment receipts", isKeyService: false },
  ];
  for (const s of services) {
    if (!(await prisma.websiteService.findFirst({ where: { name: s.name } }))) {
      await prisma.websiteService.create({ data: { ...s, sortOrder: services.indexOf(s) } });
    }
  }
  console.log("CMS content seeded");
}

async function seedAuditLogs(admin: { id: string; email: string | null; firstName: string; lastName: string }) {
  if ((await prisma.auditLog.count()) >= 10) return;
  const entries = [
    { action: "LOGIN_SUCCESS", entity: "User", details: "Admin login" },
    { action: "SEED_COMPLETE", entity: "System", details: "Full demo seed executed" },
    { action: "ASSESSMENT_APPROVED", entity: "Assessment", details: "Bulk approvals for FY 2026-27" },
    { action: "PAYMENT_RECORDED", entity: "Payment", details: "Offline payment batch" },
    { action: "GRIEVANCE_UPDATED", entity: "Grievance", details: "Status changed to IN_PROGRESS" },
  ];
  for (const e of entries) {
    await prisma.auditLog.create({
      data: {
        userId: admin.id,
        userEmail: admin.email,
        userName: `${admin.firstName} ${admin.lastName}`,
        userRole: "ADMIN",
        action: e.action,
        entity: e.entity,
        details: e.details,
        ipAddress: "127.0.0.1",
        userAgent: "demo-seed",
      },
    });
  }
  console.log("Audit log samples created");
}

async function main() {
  console.log(`\n=== Full demo seed (password: ${DEMO_PASSWORD}) ===\n`);
  const passwordHash = await hash(DEMO_PASSWORD, 12);

  const ay = await seedMasterConfig();
  const { citizens, admin } = await seedUsers(passwordHash);
  await seedTransactional(ay.id, citizens, admin);
  await seedCms();
  await seedAuditLogs(admin);

  await prisma.user.updateMany({ data: { passwordHash } });
  console.log("All user passwords synced to", DEMO_PASSWORD);

  const counts = {
    users: await prisma.user.count(),
    properties: await prisma.property.count(),
    assessments: await prisma.assessment.count(),
    demands: await prisma.demand.count(),
    payments: await prisma.payment.count(),
    disputes: await prisma.dispute.count(),
    grievances: await prisma.grievance.count(),
    auditLogs: await prisma.auditLog.count(),
    websiteContent: await prisma.websiteContent.count(),
    helplines: await prisma.helplineNumber.count(),
    links: await prisma.usefulLink.count(),
    officers: await prisma.officerProfile.count(),
    services: await prisma.websiteService.count(),
    aboutUs: await prisma.websiteAboutUs.count(),
  };

  console.log("\n=== SEED SUMMARY ===");
  console.log(counts);
  console.log("\n--- Demo logins (all use same password) ---");
  console.log("Officer (email): admin@demo.com, rajesh@municipality.gov, priya@..., amit@..., manoj@...");
  console.log("Citizen (mobile): 7001234501 … 7001234517");
  console.log(`Password for everyone: ${DEMO_PASSWORD}`);
  console.log("===================\n");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
