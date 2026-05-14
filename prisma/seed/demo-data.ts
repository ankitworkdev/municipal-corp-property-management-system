import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
const { hash } = bcrypt;

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding demo data...");

  // Get existing assessment year
  const ay = await prisma.assessmentYear.findFirst({ where: { isCurrent: true } });
  if (!ay) throw new Error("No assessment year found. Run base seed first.");

  // Get wards
  const wards = await prisma.ward.findMany({ orderBy: { name: "asc" } });
  const roads = await prisma.road.findMany();

  // ============================================
  // CREATE OFFICER USERS
  // ============================================
  const officers = [
    { firstName: "Rajesh", lastName: "Kumar", email: "rajesh@municipality.gov", mobile: "9876543210", role: "EO" as const },
    { firstName: "Priya", lastName: "Sharma", email: "priya@municipality.gov", mobile: "9876543211", role: "HC" as const },
    { firstName: "Amit", lastName: "Singh", email: "amit@municipality.gov", mobile: "9876543212", role: "TI" as const },
    { firstName: "Sunita", lastName: "Devi", email: "sunita@municipality.gov", mobile: "9876543213", role: "TI" as const },
    { firstName: "Manoj", lastName: "Yadav", email: "manoj@municipality.gov", mobile: "9876543214", role: "GO" as const },
    { firstName: "Deepak", lastName: "Verma", email: "deepak@municipality.gov", mobile: "9876543215", role: "HC" as const },
  ];

  const pw = await hash("Officer@123", 12);
  for (const o of officers) {
    const existing = await prisma.user.findUnique({ where: { email: o.email } });
    if (!existing) {
      await prisma.user.create({ data: { ...o, passwordHash: pw, status: "ACTIVE" } });
    }
  }
  console.log("Officers created (password: Officer@123)");

  // Create staff records with ward assignments
  const tiUser = await prisma.user.findUnique({ where: { email: "amit@municipality.gov" } });
  const hcUser = await prisma.user.findUnique({ where: { email: "priya@municipality.gov" } });
  if (tiUser) {
    const existing = await prisma.staff.findUnique({ where: { userId: tiUser.id } });
    if (!existing) {
      await prisma.staff.create({
        data: {
          userId: tiUser.id,
          assignedWards: { create: wards.slice(0, 6).map(w => ({ wardId: w.id })) },
        },
      });
    }
  }
  if (hcUser) {
    const existing = await prisma.staff.findUnique({ where: { userId: hcUser.id } });
    if (!existing) {
      await prisma.staff.create({
        data: {
          userId: hcUser.id,
          assignedWards: { create: wards.map(w => ({ wardId: w.id })) },
        },
      });
    }
  }
  console.log("Staff assigned to wards");

  // ============================================
  // CREATE CITIZEN USERS
  // ============================================
  const citizens = [
    { firstName: "Ramesh", lastName: "Prasad", mobile: "7001234501" },
    { firstName: "Sita", lastName: "Kumari", mobile: "7001234502" },
    { firstName: "Mohan", lastName: "Lal", mobile: "7001234503" },
    { firstName: "Geeta", lastName: "Devi", mobile: "7001234504" },
    { firstName: "Suresh", lastName: "Chaudhary", mobile: "7001234505" },
    { firstName: "Anita", lastName: "Roy", mobile: "7001234506" },
    { firstName: "Vikram", lastName: "Thakur", mobile: "7001234507" },
    { firstName: "Meera", lastName: "Jha", mobile: "7001234508" },
    { firstName: "Ravi", lastName: "Shankar", mobile: "7001234509" },
    { firstName: "Kavita", lastName: "Mishra", mobile: "7001234510" },
    { firstName: "Arun", lastName: "Gupta", mobile: "7001234511" },
    { firstName: "Pooja", lastName: "Sinha", mobile: "7001234512" },
    { firstName: "Dinesh", lastName: "Pandey", mobile: "7001234513" },
    { firstName: "Sarita", lastName: "Das", mobile: "7001234514" },
    { firstName: "Nitin", lastName: "Tiwari", mobile: "7001234515" },
  ];

  const citizenUsers: any[] = [];
  for (const c of citizens) {
    const existing = await prisma.user.findUnique({ where: { mobile: c.mobile } });
    if (existing) { citizenUsers.push(existing); continue; }
    const u = await prisma.user.create({ data: { ...c, role: "USER", status: "ACTIVE" } });
    citizenUsers.push(u);
  }
  console.log(`${citizenUsers.length} citizens created`);

  // ============================================
  // CREATE PROPERTIES
  // ============================================
  const propertyData = [
    { ownerIdx: 0, wardIdx: 0, roadIdx: 0, type: "LAND_AND_BUILDING" as const, construction: "RCC_ROOF" as const, occupancy: "SELF_OCCUPIED" as const, usage: "RESIDENTIAL" as const, plotArea: 1200, builtUp: 800, address: "House No. 45, Main Road" },
    { ownerIdx: 1, wardIdx: 1, roadIdx: 1, type: "LAND_AND_BUILDING" as const, construction: "RCC_ROOF" as const, occupancy: "TENANT" as const, usage: "COMMERCIAL" as const, plotArea: 2000, builtUp: 1500, address: "Shop No. 12, Market Complex" },
    { ownerIdx: 2, wardIdx: 2, roadIdx: 2, type: "LAND_AND_BUILDING" as const, construction: "ASBESTOS_ROOF" as const, occupancy: "SELF_OCCUPIED" as const, usage: "RESIDENTIAL" as const, plotArea: 800, builtUp: 600, address: "Gali No. 3, Near Temple" },
    { ownerIdx: 3, wardIdx: 3, roadIdx: 0, type: "VACANT_LAND" as const, construction: null, occupancy: "SELF_OCCUPIED" as const, usage: "OTHER" as const, plotArea: 3000, builtUp: 0, address: "Plot No. 78, NH Road Side" },
    { ownerIdx: 4, wardIdx: 4, roadIdx: 3, type: "LAND_AND_BUILDING" as const, construction: "RCC_ROOF" as const, occupancy: "SELF_OCCUPIED" as const, usage: "RESIDENTIAL" as const, plotArea: 1500, builtUp: 1000, address: "House No. 102, Station Road" },
    { ownerIdx: 5, wardIdx: 5, roadIdx: 1, type: "LAND_AND_BUILDING" as const, construction: "RCC_ROOF" as const, occupancy: "TENANT" as const, usage: "COMMERCIAL" as const, plotArea: 5000, builtUp: 3500, address: "Hotel Paradise, Main Market" },
    { ownerIdx: 6, wardIdx: 6, roadIdx: 4, type: "LAND_AND_BUILDING" as const, construction: "ASBESTOS_ROOF" as const, occupancy: "SELF_OCCUPIED" as const, usage: "RESIDENTIAL" as const, plotArea: 600, builtUp: 450, address: "Quarter No. 8, Hospital Road" },
    { ownerIdx: 7, wardIdx: 7, roadIdx: 2, type: "LAND_AND_BUILDING" as const, construction: "OTHER" as const, occupancy: "SELF_OCCUPIED" as const, usage: "RESIDENTIAL" as const, plotArea: 500, builtUp: 350, address: "Kutcha House, Lane 5" },
    { ownerIdx: 8, wardIdx: 8, roadIdx: 0, type: "LAND_AND_BUILDING" as const, construction: "RCC_ROOF" as const, occupancy: "TENANT" as const, usage: "COMMERCIAL" as const, plotArea: 1800, builtUp: 1200, address: "Nursing Home, Central Road" },
    { ownerIdx: 9, wardIdx: 9, roadIdx: 5, type: "VACANT_LAND" as const, construction: null, occupancy: "SELF_OCCUPIED" as const, usage: "RESIDENTIAL" as const, plotArea: 2500, builtUp: 0, address: "Empty Plot, Basantpur" },
    { ownerIdx: 10, wardIdx: 10, roadIdx: 1, type: "LAND_AND_BUILDING" as const, construction: "RCC_ROOF" as const, occupancy: "SELF_OCCUPIED" as const, usage: "COMMERCIAL" as const, plotArea: 3000, builtUp: 2000, address: "Petrol Pump, NH 57" },
    { ownerIdx: 11, wardIdx: 11, roadIdx: 3, type: "LAND_AND_BUILDING" as const, construction: "ASBESTOS_ROOF" as const, occupancy: "SELF_OCCUPIED" as const, usage: "RESIDENTIAL" as const, plotArea: 900, builtUp: 700, address: "House No. 33, Gol Chowk" },
    { ownerIdx: 12, wardIdx: 12, roadIdx: 0, type: "LAND_AND_BUILDING" as const, construction: "RCC_ROOF" as const, occupancy: "TENANT" as const, usage: "COMMERCIAL" as const, plotArea: 4000, builtUp: 2800, address: "Government Office Complex" },
    { ownerIdx: 13, wardIdx: 0, roadIdx: 2, type: "LAND_AND_BUILDING" as const, construction: "RCC_ROOF" as const, occupancy: "SELF_OCCUPIED" as const, usage: "RESIDENTIAL" as const, plotArea: 1100, builtUp: 750, address: "Behind Post Office" },
    { ownerIdx: 14, wardIdx: 1, roadIdx: 4, type: "LAND_AND_BUILDING" as const, construction: "OTHER" as const, occupancy: "SELF_OCCUPIED" as const, usage: "RESIDENTIAL" as const, plotArea: 700, builtUp: 500, address: "Near Bus Stand" },
  ];

  const properties: any[] = [];
  let propCount = await prisma.property.count();
  for (const p of propertyData) {
    propCount++;
    const propId = propCount.toString().padStart(8, "0");
    const owner = citizenUsers[p.ownerIdx];
    const ward = wards[p.wardIdx % wards.length];
    const road = roads[p.roadIdx % roads.length];

    const existing = await prisma.property.findUnique({ where: { propertyId: propId } });
    if (existing) { properties.push(existing); continue; }

    const prop = await prisma.property.create({
      data: {
        propertyId: propId,
        propertyType: p.type,
        ownershipType: "SINGLE_OWNER",
        wardId: ward.id,
        roadId: road.id,
        ownerId: owner.id,
        ownerName: `${owner.firstName} ${owner.lastName}`,
        guardianName: `${owner.lastName} Sr.`,
        mobile: owner.mobile,
        constructionType: p.construction,
        occupancyType: p.occupancy,
        usageCategory: p.usage,
        plotAreaSqFt: p.plotArea,
        builtUpAreaSqFt: p.builtUp || undefined,
        propertyAddress: p.address,
        propertyCity: "Birpur",
        propertyState: "Bihar",
        verificationStatus: Math.random() > 0.3 ? "VERIFIED" : "PENDING",
        acquisitionDate: new Date(2010 + Math.floor(Math.random() * 14), Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1),
      },
    });
    properties.push(prop);
  }
  console.log(`${properties.length} properties created`);

  // ============================================
  // CREATE ASSESSMENTS WITH DEMANDS
  // ============================================
  const adminUser = await prisma.user.findFirst({ where: { role: "ADMIN" } });
  const statuses: ("DRAFT" | "SUBMITTED" | "APPROVED")[] = ["DRAFT", "SUBMITTED", "APPROVED", "APPROVED", "APPROVED", "APPROVED", "APPROVED", "SUBMITTED", "SUBMITTED", "DRAFT"];

  for (let i = 0; i < properties.length; i++) {
    const prop = properties[i];
    const status = statuses[i % statuses.length];

    const existing = await prisma.assessment.findFirst({ where: { propertyId: prop.id, assessmentYearId: ay.id } });
    if (existing) continue;

    // Calculate tax
    let totalDemand = 0;
    if (prop.propertyType === "LAND_AND_BUILDING" && prop.builtUpAreaSqFt) {
      const arvRate = await prisma.arvRate.findFirst({
        where: { assessmentYearId: ay.id, roadType: (await prisma.road.findUnique({ where: { id: prop.roadId } }))?.roadType || "OTHER", constructionType: prop.constructionType || "OTHER", usageCategory: prop.usageCategory || "RESIDENTIAL" },
      });
      const arv = (prop.builtUpAreaSqFt || 0) * (arvRate?.ratePerSqFt || 5);
      const taxRate = await prisma.propertyTaxRate.findFirst({ where: { assessmentYearId: ay.id } });
      totalDemand = arv * ((taxRate?.ratePercent || 9) / 100);
      const occConfig = await prisma.occupancyTypeConfig.findFirst({ where: { assessmentYearId: ay.id, occupancyType: prop.occupancyType || "SELF_OCCUPIED" } });
      totalDemand *= (occConfig?.multiplierValue || 1);
    } else if (prop.propertyType === "VACANT_LAND") {
      const vlRate = await prisma.vacantLandTaxRate.findFirst({ where: { assessmentYearId: ay.id, roadType: "OTHER" } });
      totalDemand = (prop.plotAreaSqFt || 0) * (vlRate?.ratePerSqFt || 0.2);
    }
    totalDemand = Math.round(totalDemand * 100) / 100;

    const assessment = await prisma.assessment.create({
      data: {
        assessmentYearId: ay.id,
        propertyId: prop.id,
        formStatus: status,
        arvAmount: totalDemand / 0.09 || 0,
        propertyTax: totalDemand,
        totalDemand,
        netPayable: totalDemand,
        createdById: adminUser?.id,
        lastModifiedById: adminUser?.id,
        submittedAt: status !== "DRAFT" ? new Date(2026, 2, 15 + i) : undefined,
        submittedById: status !== "DRAFT" ? adminUser?.id : undefined,
        approvedAt: status === "APPROVED" ? new Date(2026, 3, 1 + i) : undefined,
        approvedById: status === "APPROVED" ? adminUser?.id : undefined,
      },
    });

    // Create demand for approved assessments
    if (status === "APPROVED" && totalDemand > 0) {
      const demandCount = await prisma.demand.count();
      await prisma.demand.create({
        data: {
          demandId: `DEM-${(demandCount + 1).toString().padStart(6, "0")}`,
          assessmentId: assessment.id,
          amount: totalDemand,
          balanceAmount: Math.random() > 0.4 ? 0 : totalDemand,
          status: Math.random() > 0.4 ? "PAID" : "UNPAID",
        },
      });
    }
  }
  console.log("Assessments and demands created");

  // ============================================
  // CREATE PAYMENTS for PAID demands
  // ============================================
  const paidDemands = await prisma.demand.findMany({ where: { status: "PAID" } });
  for (const demand of paidDemands) {
    const existingPayment = await prisma.payment.findFirst({ where: { demandId: demand.id } });
    if (existingPayment) continue;

    const modes: ("CASH" | "ONLINE" | "CHEQUE" | "NEFT")[] = ["CASH", "ONLINE", "CHEQUE", "NEFT"];
    await prisma.payment.create({
      data: {
        paymentId: `PAY-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        demandId: demand.id,
        amount: demand.amount,
        paymentMode: modes[Math.floor(Math.random() * modes.length)],
        paymentStatus: "SUCCESS",
        paymentDate: new Date(2026, 3, Math.floor(Math.random() * 28) + 1),
        paidById: citizenUsers[Math.floor(Math.random() * citizenUsers.length)].id,
        orderCreatedById: adminUser?.id,
      },
    });
  }
  console.log("Payments created for paid demands");

  // ============================================
  // CREATE DISPUTES & GRIEVANCES
  // ============================================
  const disputeSubjects = [
    "Incorrect property area measurement",
    "Wrong tax calculation",
    "Property ownership dispute",
    "Incorrect ward assignment",
    "Double taxation issue",
  ];

  for (let i = 0; i < 5; i++) {
    const prop = properties[i * 2];
    const existing = await prisma.dispute.findFirst({ where: { propertyId: prop.id } });
    if (existing) continue;

    await prisma.dispute.create({
      data: {
        propertyId: prop.id,
        subject: disputeSubjects[i],
        description: `Citizen has reported: ${disputeSubjects[i]}. Property ID: ${prop.propertyId}. Please investigate and resolve.`,
        status: ["OPEN", "IN_PROGRESS", "RESOLVED", "OPEN", "IN_PROGRESS"][i] as any,
        comments: i === 2 ? "Verified and corrected. Issue resolved." : undefined,
        createdById: citizenUsers[i * 2].id,
      },
    });
  }
  console.log("Disputes created");

  const grievanceSubjects = [
    "Delayed assessment processing",
    "Staff not available during office hours",
    "Online payment not reflecting",
    "Receipt not generated after payment",
    "Property details incorrect in records",
    "Request for reassessment",
  ];

  for (let i = 0; i < 6; i++) {
    const existing = await prisma.grievance.count();
    if (existing >= 6) break;

    await prisma.grievance.create({
      data: {
        propertyId: properties[i]?.id,
        userId: citizenUsers[i].id,
        subject: grievanceSubjects[i],
        message: `Dear Sir/Madam, I would like to report: ${grievanceSubjects[i]}. Please take necessary action. Regards, ${citizenUsers[i].firstName} ${citizenUsers[i].lastName}`,
        status: ["OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED", "OPEN", "IN_PROGRESS"][i] as any,
      },
    });
  }
  console.log("Grievances created");

  // ============================================
  // WEBSITE CONTENT
  // ============================================
  const contents = [
    { purpose: "GALLERY" as const, title: "Tax Awareness Campaign", description: "Annual property tax awareness drive in all wards" },
    { purpose: "GALLERY" as const, title: "Municipal Office Inauguration", description: "New municipal office building inaugurated" },
    { purpose: "ANNOUNCEMENT" as const, title: "Last Date for Tax Payment", description: "Pay your property tax before March 31st to avail 5% rebate" },
    { purpose: "NOTICE" as const, title: "Ward Meeting Schedule", description: "Monthly ward meetings scheduled for all 13 wards" },
    { purpose: "GALLERY" as const, title: "Road Development Project", description: "Major roads being upgraded across the municipality" },
    { purpose: "ANNOUNCEMENT" as const, title: "New Online Payment Portal", description: "Citizens can now pay property tax online through our portal" },
  ];
  for (const c of contents) {
    const existing = await prisma.websiteContent.findFirst({ where: { title: c.title } });
    if (!existing) await prisma.websiteContent.create({ data: { ...c, isActive: true, sortOrder: contents.indexOf(c) } });
  }

  const helplines = [
    { name: "Municipal Office", number: "+91-6274-123456", designation: "Main Office" },
    { name: "Tax Helpline", number: "+91-6274-123457", designation: "Tax Department" },
    { name: "Grievance Cell", number: "+91-6274-123458", designation: "Public Grievance" },
    { name: "Emergency", number: "112", designation: "Police/Fire/Ambulance" },
  ];
  for (const h of helplines) {
    const existing = await prisma.helplineNumber.findFirst({ where: { number: h.number } });
    if (!existing) await prisma.helplineNumber.create({ data: h });
  }

  const links = [
    { title: "Bihar Government Portal", url: "https://state.bihar.gov.in" },
    { title: "Urban Development Dept", url: "https://urban.bihar.gov.in" },
    { title: "National Portal of India", url: "https://india.gov.in" },
  ];
  for (const l of links) {
    const existing = await prisma.usefulLink.findFirst({ where: { url: l.url } });
    if (!existing) await prisma.usefulLink.create({ data: l });
  }

  const officerProfiles = [
    { name: "Rajesh Kumar", designation: "Executive Officer", mobile: "9876543210" },
    { name: "Priya Sharma", designation: "Head Clerk", mobile: "9876543211" },
    { name: "Amit Singh", designation: "Tax Inspector", mobile: "9876543212" },
    { name: "Manoj Yadav", designation: "Grievance Officer", mobile: "9876543214" },
  ];
  for (const o of officerProfiles) {
    const existing = await prisma.officerProfile.findFirst({ where: { mobile: o.mobile } });
    if (!existing) await prisma.officerProfile.create({ data: o });
  }

  const services = [
    { name: "Property Tax Assessment", description: "Self-assessment and officer-assisted property tax calculation", isKeyService: true },
    { name: "Online Tax Payment", description: "Pay property tax online via multiple payment modes", isKeyService: true },
    { name: "Grievance Redressal", description: "File and track complaints and grievances online", isKeyService: true },
    { name: "Property Registration", description: "Register new properties in the municipal records", isKeyService: false },
    { name: "Demand Notice Download", description: "Download your property tax demand notice", isKeyService: false },
    { name: "Payment Receipt", description: "Download payment receipts for tax payments", isKeyService: false },
  ];
  for (const s of services) {
    const existing = await prisma.websiteService.findFirst({ where: { name: s.name } });
    if (!existing) await prisma.websiteService.create({ data: s });
  }

  console.log("Website content created");

  // ============================================
  // SUMMARY
  // ============================================
  const counts = await Promise.all([
    prisma.user.count(), prisma.property.count(), prisma.assessment.count(),
    prisma.demand.count(), prisma.payment.count(), prisma.dispute.count(),
    prisma.grievance.count(), prisma.auditLog.count(),
    prisma.websiteContent.count(), prisma.helplineNumber.count(),
    prisma.usefulLink.count(), prisma.officerProfile.count(), prisma.websiteService.count(),
  ]);
  console.log("\n=== SEED SUMMARY ===");
  console.log(`Users: ${counts[0]}, Properties: ${counts[1]}, Assessments: ${counts[2]}`);
  console.log(`Demands: ${counts[3]}, Payments: ${counts[4]}, Disputes: ${counts[5]}, Grievances: ${counts[6]}`);
  console.log(`Audit logs: ${counts[7]}`);
  console.log(`Website: ${counts[8]} content, ${counts[9]} helplines, ${counts[10]} links, ${counts[11]} officers, ${counts[12]} services`);
  console.log("===================\n");
}

main().catch(console.error).finally(() => prisma.$disconnect());
