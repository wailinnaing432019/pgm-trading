import { PrismaClient } from "@prisma/client"
import { createHash } from "crypto"

const prisma = new PrismaClient()

async function main() {
  console.log("Seeding database…")

  const passwordHash = createHash("sha256").update("admin123").digest("hex")

  const admin = await prisma.user.upsert({
    where: { email: "admin@pgm-trading.com" },
    update: {},
    create: {
      name: "Super Admin",
      email: "admin@pgm-trading.com",
      passwordHash,
      role: "SUPER_ADMIN",
    },
  })

  const categories = await Promise.all(
    [
      { name: "Fresh Crops", slug: "fresh-crops", description: "Rice, pulses, maize, sesame & seasonal produce." },
      { name: "Fertilizers", slug: "fertilizers", description: "NPK blends, urea, bio-fertilizers & soil conditioners." },
      { name: "Machinery", slug: "machinery", description: "Tractors, harvesters, irrigation systems & spare parts." },
      { name: "Grains & Pulses", slug: "grains-pulses", description: "Bulk grain, pulses and animal feed ingredients." },
      { name: "Logistics & Storage", slug: "logistics-storage", description: "Cold-chain warehousing and freight solutions." },
    ].map((c) =>
      prisma.category.upsert({
        where: { slug: c.slug },
        update: {},
        create: c,
      })
    )
  )

  const [fresh, machinery] = categories
  const featured = await prisma.product.findMany({ take: 1 })

  if (featured.length === 0 && fresh && machinery) {
    await prisma.product.createMany({
      data: [
        {
          title: "Myanmar Jasmine Rice",
          slug: "myanmar-jasmine-rice",
          summary: "Premium 25% broken Jasmine rice, export grade.",
          description:
            "Long-grain fragrant Myanmar Jasmine rice grown in the Ayeyarwady delta, milled to export specification and shipped worldwide in 1kg–25kg retail and 50kg bulk bags.",
          categoryId: fresh.id,
          tradeType: "EXPORT",
          origin: "Myanmar",
          unit: "MT",
          price: "720",
          status: "PUBLISHED",
          availability: 500,
          isFeatured: true,
          specs: {
            packaging: "1kg / 5kg / 25kg retail, 50kg bulk PP bags",
            moisture: "≤ 14%",
            purity: "95% min",
            certification: "GAP, HACCP",
          },
        },
        {
          title: "Mung Beans (Green Gram)",
          slug: "mung-beans-green-gram",
          summary: "FAQ machine-cleaned mung beans for export.",
          description:
            "Clean, uniform, high-protein mung beans ideal for sprouting and processing, machine-cleaned with strict moisture control.",
          categoryId: fresh.id,
          tradeType: "EXPORT",
          origin: "Myanmar",
          unit: "MT",
          price: "1150",
          status: "PUBLISHED",
          isFeatured: true,
          specs: {
            packaging: "25kg / 50kg PP bags",
            moisture: "≤ 12%",
            purity: "99% min",
          },
        },
        {
          title: "Walk-Behind Tractor",
          slug: "walk-behind-tractor",
          summary: "8 HP diesel power tiller for small-to-medium farms.",
          description:
            "Durable 8 HP diesel tiller with reversible operation, ideal for paddy and upland farms. Supplied with spare parts kit and 12-month warranty.",
          categoryId: machinery.id,
          tradeType: "IMPORT",
          origin: "China (distributed in Myanmar)",
          unit: "Unit",
          price: "1850",
          status: "PUBLISHED",
          isFeatured: true,
          specs: {
            engine: "8 HP, 200cc single cylinder air-cooled diesel",
            gearbox: "3F + 1R",
            attachment: "Rota-cultivator, trailer coupling",
          },
        },
      ],
    })
  }

  const homeSections: { key: string; title: string; subtitle?: string; body?: string }[] = [
    {
      key: "hero",
      title: "From Myanmar Fields to Global Markets",
      subtitle:
        "Pacific Global Myanmar links farmers, processors and international buyers through transparent import, export, trading and cold-chain distribution.",
    },
    {
      key: "story",
      title: "Rooted in the Land, Geared for Trade",
      body:
        "Founded in Yangon, PGM builds resilient supply chains that move Myanmar's finest produce and agro-inputs across borders — reliably, traceably, sustainably.",
    },
    {
      key: "storyQuote",
      title: "We build supply chains that respect the farmer, protect the produce, and deliver certainty to the buyer.",
      subtitle: "Managing Director, PGM",
    },
    {
      key: "servicesHeading",
      title: "One partner for the whole agri value chain",
      body: "From grower contracts and warehousing to customs clearance and international freight — managed end-to-end.",
      subtitle: "Core Services",
    },
    {
      key: "productHeading",
      title: "Commodities moving right now",
      body: "A selection of our in-demand export and import products — graded, milled and shipped to specification.",
      subtitle: "Featured Products",
    },
    {
      key: "supplyChain",
      title: "Designed to move, engineered to stay fresh",
      body: "A single orchestrated corridor from Myanmar's growing regions to receiving ports worldwide.",
      subtitle: "Global Supply Chain",
    },
    {
      key: "newsHeading",
      title: "Trade updates from the paddy fields",
      body: "Export market movements, harvest outlooks and company announcements.",
      subtitle: "News & Insights",
    },
    {
      key: "cta",
      title: "Ready to trade? Let's talk specifications, pricing and shipping windows.",
      subtitle: "Our export desk responds within one business day with grades, load availability and freight quotes.",
    },
    {
      key: "newsletter",
      title: "Market insights, straight to your inbox",
      body: "Seasonal produce updates, export price outlooks and trade alerts — weekly, no spam.",
    },
  ]

  for (const s of homeSections) {
    await prisma.pageSection.upsert({
      where: { page_key: { page: "home", key: s.key } },
      update: {},
      create: { page: "home", key: s.key, title: s.title, subtitle: s.subtitle, body: "body" in s ? s.body : null },
    })
  }

  const aboutSections: { key: string; title: string; subtitle?: string; body?: string }[] = [
    {
      key: "hero",
      title: "Rooted in the land, geared for trade",
      subtitle: "About Us",
    },
    {
      key: "story",
      title: "Our story",
      body:
        "Founded in Yangon, Pacific Global Myanmar builds resilient supply chains that move Myanmar's finest produce and agro-inputs across borders — reliably, traceably, sustainably.",
    },
    {
      key: "mission",
      title: "Our Mission",
      body: "Connect Myanmar's agricultural heartland with world markets through dependable logistics and fair, transparent trade.",
    },
    {
      key: "vision",
      title: "Our Vision",
      body: "A Myanmar agri-trade hub trusted by every link of the chain — from smallholder farmers to global food companies.",
    },
    {
      key: "valuesHeading",
      title: "What we stand behind",
      body: undefined,
      subtitle: "Core Values",
    },
    {
      key: "milestonesHeading",
      title: "Our growth, season by season",
      body: "Key moments in the PGM journey.",
      subtitle: "Milestones",
    },
    {
      key: "certificationsHeading",
      title: "Certified at every step",
      body: "Compliance badges we maintain across farming, milling, warehousing and export.",
      subtitle: "Quality & Compliance",
    },
  ]

  for (const s of aboutSections) {
    await prisma.pageSection.upsert({
      where: { page_key: { page: "about", key: s.key } },
      update: {},
      create: { page: "about", key: s.key, title: s.title, subtitle: s.subtitle, body: "body" in s && s.body ? s.body : null },
    })
  }

  const servicesSections: { key: string; title: string; subtitle?: string; body?: string }[] = [
    {
      key: "hero",
      title: "Services & global logistics",
      subtitle: "Services",
      body:
        "A single partner for sourcing, trading, warehousing and delivery — built around Myanmar's growing regions and export corridors.",
    },
    {
      key: "servicesHeading",
      title: "Core service lines",
      subtitle: "What we do",
    },
    {
      key: "capabilitiesHeading",
      title: "What's included in every shipment",
      body: "We absorb the paperwork so you can focus on the trade.",
      subtitle: "Full-service trading",
    },
    {
      key: "quote",
      title: "Give us the origin and the destination — we'll build the route.",
      subtitle: "Head of Logistics, PGM",
    },
  ]

  for (const s of servicesSections) {
    await prisma.pageSection.upsert({
      where: { page_key: { page: "services", key: s.key } },
      update: {},
      create: { page: "services", key: s.key, title: s.title, subtitle: s.subtitle, body: "body" in s && s.body ? s.body : null },
    })
  }

  const contactSections: { key: string; title: string; subtitle?: string; body?: string }[] = [
    {
      key: "hero",
      title: "Let's move crops & cargo",
      subtitle: "Contact",
      body:
        "Tell us what you want to buy or sell, and our trade desk will bring you pricing, grades and logistics within one business day.",
    },
  ]

  for (const s of contactSections) {
    await prisma.pageSection.upsert({
      where: { page_key: { page: "contact", key: s.key } },
      update: {},
      create: { page: "contact", key: s.key, title: s.title, subtitle: s.subtitle, body: "body" in s && s.body ? s.body : null },
    })
  }

  const stats = [
    { label: "Tons Exported", value: 480_000, suffix: "+" },
    { label: "Partner Countries", value: 24, suffix: "" },
    { label: "Farming Families Served", value: 12_500, suffix: "+" },
    { label: "Cold Storage Capacity", value: 18, suffix: "k MT" },
  ]

  for (const [i, s] of stats.entries()) {
    await prisma.stat.upsert({
      where: { id: `${i}` },
      update: {},
      create: { ...s, id: `${i}`, position: i },
    })
  }

  const services = [
    {
      title: "Import & Export Logistics",
      slug: "import-export-logistics",
      description: "End-to-end documentation, customs clearance, inspection and freight for agro-commodities.",
      icon: "Ship",
      position: 0,
    },
    {
      title: "Cold-Chain Distribution",
      slug: "cold-chain-distribution",
      description: "18,000 MT of temperature-controlled warehousing with real-time stock visibility and last-mile delivery.",
      icon: "Snowflake",
      position: 1,
    },
    {
      title: "Contract Farming & Sourcing",
      slug: "contract-farming-sourcing",
      description: "Grower contracts, input supply and buy-back programmes across Myanmar's key production regions.",
      icon: "Sprout",
      position: 2,
    },
    {
      title: "Bulk Commodity Trading",
      slug: "bulk-commodity-trading",
      description: "Rice, pulses, oilseeds and maize traded in bulk with transparent grading and competitive pricing.",
      icon: "Boxes",
      position: 3,
    },
    {
      title: "Customs & Compliance",
      slug: "customs-compliance",
      description: "SGS coordination, phytosanitary certification, fumigation and certificate-of-origin handling.",
      icon: "FileCheck2",
      position: 4,
    },
    {
      title: "Warehousing & Inventory",
      slug: "warehousing-inventory",
      description: "Bulk and retail storage with pest control, quality monitoring and digital stock reporting.",
      icon: "Warehouse",
      position: 5,
    },
  ]

  for (const s of services) {
    await prisma.service.upsert({
      where: { slug: s.slug },
      update: {},
      create: { ...s, isActive: true },
    })
  }

  const offices = [
    {
      id: "office-yangon",
      name: "Head Office — Yangon",
      address: "No. 45, Merchant Road, Kyauktada Tsp, Yangon, Myanmar",
      phone: "+95 1 234 5678",
      email: "trade@pgm-trading.com",
      whatsapp: "+959 123 456 789",
      position: 0,
    },
    {
      id: "office-mandalay",
      name: "Branch — Mandalay",
      address: "No. 12, 89th Street, Chanayethazan Tsp, Mandalay, Myanmar",
      phone: "+95 2 456 7890",
      position: 1,
    },
    {
      id: "office-thilawa",
      name: "Port & Distribution Hub — Thilawa",
      address: "Zone A, Thilawa SEZ, Thanlyin Tsp, Yangon, Myanmar",
      phone: "+95 1 888 4455",
      position: 2,
    },
  ]

  for (const office of offices) {
    await prisma.office.upsert({
      where: { id: office.id },
      update: {},
      create: office,
    })
  }

  const values = [
    { id: "value-1", title: "Integrity", description: "Contracts honoured, weights verified, specs met — every single shipment.", icon: "HeartHandshake", position: 0 },
    { id: "value-2", title: "Traceability", description: "Every lot is traceable from the farm gate to the buyer's dock.", icon: "Eye", position: 1 },
    { id: "value-3", title: "Quality First", description: "Grading, milling and inspection against international export standards.", icon: "Award", position: 2 },
    { id: "value-4", title: "Sustainability", description: "Long-term grower partnerships and reduced post-harvest loss.", icon: "Leaf", position: 3 },
  ]

  for (const value of values) {
    await prisma.companyValue.upsert({
      where: { id: value.id },
      update: {},
      create: value,
    })
  }

  const supplySteps = [
    { id: "step-1", title: "Inspection & Documentation", description: "Pre-shipment grading, phytosanitary certification and export paperwork handled in-house.", icon: "FileCheck2", position: 0 },
    { id: "step-2", title: "Inland Haulage", description: "Coordinated trucking from farm clusters and millers to port, coast or border gateways.", icon: "Route", position: 1 },
    { id: "step-3", title: "Cold-Chain & Warehousing", description: "18,000 MT of temperature-controlled storage with real-time stock visibility.", icon: "Container", position: 2 },
    { id: "step-4", title: "Ocean & Air Freight", description: "FCL / LCL and airfreight booking across 24+ partner countries with live tracking.", icon: "Anchor", position: 3 },
  ]

  for (const step of supplySteps) {
    await prisma.supplyStep.upsert({
      where: { id: step.id },
      update: {},
      create: step,
    })
  }

  const capabilities = [
    "Customs brokerage & export documentation",
    "SGS / third-party inspection coordination",
    "Fumigation, phytosanitary & certificate of origin",
    "FCL / LCL container loading supervision",
    "Banking & letter-of-credit support",
    "Buyer-side receiving logistics",
  ]

  for (const [i, title] of capabilities.entries()) {
    await prisma.checklistItem.upsert({
      where: { id: `cap-${i + 1}` },
      update: {},
      create: { id: `cap-${i + 1}`, group: "capabilities", title, position: i },
    })
  }

  const certifications = [
    "ISO 22000:2018 Food Safety",
    "GlobalG.A.P. Certified Farms",
    "Organic (OCS) Product Lines",
    "HACCP Milling & Warehousing",
    "Myanmar Good Agriculture Practice",
  ]

  for (const [i, title] of certifications.entries()) {
    await prisma.checklistItem.upsert({
      where: { id: `cert-${i + 1}` },
      update: {},
      create: { id: `cert-${i + 1}`, group: "certifications", title, position: i },
    })
  }

  const milestones = [
    { id: "milestone-2012", year: 2012, title: "Founded in Yangon", description: "Started as a small exporter of pulses to regional markets.", position: 0 },
    { id: "milestone-2016", year: 2016, title: "First cold-chain facility", description: "Opened 6,000 MT temperature-controlled warehouse in Thilawa.", position: 1 },
    { id: "milestone-2020", year: 2020, title: "24 export markets", description: "Expanded to direct contracts across Asia, the Middle East and Europe.", position: 2 },
    { id: "milestone-2024", year: 2024, title: "Full value-chain services", description: "Added contract farming, distribution and customs brokerage.", position: 3 },
  ]

  for (const milestone of milestones) {
    await prisma.milestone.upsert({
      where: { id: milestone.id },
      update: {},
      create: milestone,
    })
  }

  await prisma.siteSetting.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      meta: {
        companyName: "Pacific Global Myanmar",
        legalName: "Pacific Global Myanmar Co., Ltd.",
        shortName: "PGM",
        tagline: "From Myanmar Fields to Global Markets",
        description:
          "Pacific Global Myanmar links farmers, processors and international buyers through transparent import, export, trading and cold-chain distribution.",
        url: "http://localhost:3000",
        email: "trade@pgm-trading.com",
        phone: "+95 1 234 5678",
        whatsapp: "+959 123 456 789",
        facebook: "https://facebook.com/pgmtrading",
        linkedin: "https://linkedin.com/company/pgmtrading",
      },
    },
  })

  await prisma.newsletter.upsert({
    where: { email: "newsletter@example.com" },
    update: {},
    create: { email: "newsletter@example.com" },
  })

  console.log(`Seeded. Admin login: ${admin.email} / admin123`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })