// Run: node --env-file=.env prisma/seed-products.mjs
import { stat } from 'node:fs/promises';
import { join } from 'node:path';
import { PrismaClient } from '../src/generated/client/index.js';

const prisma = new PrismaClient();

const publicRoot = join(process.cwd(), 'public');

const imagePool = [
  '/images/kitchen.jpg',
  '/images/evening.jpg',
  '/images/security.jpg',
  '/images/workspace.jpg',
  '/images/morning.jpg',
  '/images/entertaining.jpg',
  '/images/cinematic/villa-arrival.png',
];

const categories = [
  { slug: 'smart-switches', name: 'Smart Switches' },
  { slug: 'lighting-control', name: 'Lighting Control' },
  { slug: 'curtain-shading', name: 'Curtain & Shading' },
  { slug: 'security-access', name: 'Security & Access' },
  { slug: 'sensors-safety', name: 'Sensors & Safety' },
  { slug: 'climate-control', name: 'Climate Control' },
  { slug: 'control-hubs', name: 'Control Hubs' },
];

const specTemplates = [
  { groupName: 'Connectivity', name: 'Protocol' },
  { groupName: 'Electrical', name: 'Power' },
  { groupName: 'Installation', name: 'Mounting' },
  { groupName: 'Control', name: 'App Support' },
  { groupName: 'Warranty', name: 'Coverage' },
];

const products = [
  {
    slug: 'smart-touch-switch',
    title: 'Smart Touch Switch',
    subtitle: 'Glass touch wall switch with scene memory',
    categorySlug: 'smart-switches',
    price: 349900,
    warrantyMonths: 24,
    extendedWarrantyAvailable: true,
    imageIndex: 1,
    specs: ['WiFi / BLE mesh', '100-240V AC', 'Standard modular wall box', 'Alexa, Google Home, mobile app', '24 months'],
    features: ['Capacitive glass touch surface', 'Scene recall for daily routines', 'Backlit status indication'],
  },
  {
    slug: 'smart-dimmer',
    title: 'Smart Dimmer',
    subtitle: 'Precision dimming module for luxury lighting scenes',
    categorySlug: 'lighting-control',
    price: 429900,
    warrantyMonths: 24,
    extendedWarrantyAvailable: true,
    imageIndex: 0,
    specs: ['WiFi / Zigbee ready', '100-240V AC phase cut', 'Behind-switch or panel mount', 'Scene scheduling and app control', '24 months'],
    features: ['Smooth low-flicker dimming', 'Preset brightness scenes', 'Retrofit-friendly module design'],
  },
  {
    slug: 'smart-curtain-controller',
    title: 'Smart Curtain Controller',
    subtitle: 'Quiet curtain and blind automation controller',
    categorySlug: 'curtain-shading',
    price: 599900,
    warrantyMonths: 24,
    extendedWarrantyAvailable: true,
    imageIndex: 4,
    specs: ['WiFi / dry-contact motor control', '100-240V AC', 'Motor junction box', 'Schedules, scenes, voice assistants', '24 months'],
    features: ['Open, close, pause and percentage control', 'Morning and privacy schedules', 'Compatible with curtain and blind motors'],
  },
  {
    slug: 'smart-door-lock',
    title: 'Smart Door Lock',
    subtitle: 'Fingerprint, PIN and mobile access lock',
    categorySlug: 'security-access',
    price: 1599900,
    warrantyMonths: 36,
    extendedWarrantyAvailable: true,
    imageIndex: 2,
    specs: ['BLE / WiFi gateway optional', 'Rechargeable lithium battery', 'Main door mortise installation', 'Fingerprint, PIN, RFID and app unlock', '36 months'],
    features: ['Multiple secure access methods', 'Temporary guest PINs', 'Low-battery and tamper alerts'],
  },
  {
    slug: 'smart-video-doorbell',
    title: 'Smart Video Doorbell',
    subtitle: 'HD visitor calling with motion alerts',
    categorySlug: 'security-access',
    price: 899900,
    warrantyMonths: 24,
    extendedWarrantyAvailable: false,
    imageIndex: 2,
    specs: ['WiFi 2.4GHz', '12-24V AC/DC or battery variant', 'Outdoor wall mount', 'Mobile app, two-way talk, motion alerts', '24 months'],
    features: ['Wide-angle HD video', 'Two-way audio', 'Visitor snapshot notifications'],
  },
  {
    slug: 'smart-wifi-camera',
    title: 'Smart WiFi Camera',
    subtitle: 'Indoor security camera with AI motion alerts',
    categorySlug: 'security-access',
    price: 549900,
    warrantyMonths: 24,
    extendedWarrantyAvailable: false,
    imageIndex: 2,
    specs: ['WiFi 2.4GHz', '5V DC adapter', 'Shelf, ceiling or wall mount', 'Mobile app and event recording', '24 months'],
    features: ['Pan and tilt viewing', 'Night vision', 'Human motion detection alerts'],
  },
  {
    slug: 'smart-motion-sensor',
    title: 'Smart Motion Sensor',
    subtitle: 'Presence-triggered automation sensor',
    categorySlug: 'sensors-safety',
    price: 249900,
    warrantyMonths: 18,
    extendedWarrantyAvailable: false,
    imageIndex: 3,
    specs: ['Zigbee / BLE mesh', 'Battery powered', 'Wall or ceiling adhesive mount', 'Automation rules and occupancy scenes', '18 months'],
    features: ['Occupancy-based lighting', 'Low-power operation', 'Security and energy-saving triggers'],
  },
  {
    slug: 'smart-smoke-detector',
    title: 'Smart Smoke Detector',
    subtitle: 'Connected smoke alarm with mobile alerts',
    categorySlug: 'sensors-safety',
    price: 329900,
    warrantyMonths: 24,
    extendedWarrantyAvailable: false,
    imageIndex: 3,
    specs: ['WiFi / Zigbee variants', 'Long-life battery', 'Ceiling mount', 'App alerts and scene automation', '24 months'],
    features: ['Audible local alarm', 'Mobile smoke alerts', 'Automation trigger for lights and exhaust'],
  },
  {
    slug: 'smart-thermostat',
    title: 'Smart Thermostat',
    subtitle: 'Climate control interface for comfort scenes',
    categorySlug: 'climate-control',
    price: 1199900,
    warrantyMonths: 24,
    extendedWarrantyAvailable: true,
    imageIndex: 5,
    specs: ['WiFi / Modbus integration', '24V or relay control variants', 'Wall mount', 'Scheduling, app and voice control', '24 months'],
    features: ['Temperature scheduling', 'Comfort and away modes', 'HVAC integration support'],
  },
  {
    slug: 'smart-lighting-controller',
    title: 'Smart Lighting Controller',
    subtitle: 'Multi-channel lighting controller for premium scenes',
    categorySlug: 'lighting-control',
    price: 1899900,
    warrantyMonths: 36,
    extendedWarrantyAvailable: true,
    imageIndex: 1,
    specs: ['KNX / DMX / relay integration', '100-240V AC controller supply', 'DIN rail or automation panel', 'Central app, keypad and scene control', '36 months'],
    features: ['Multi-zone lighting scenes', 'Panel-grade installation', 'Integrates with keypads and sensors'],
  },
  {
    slug: 'smart-ir-blaster',
    title: 'Smart IR Blaster',
    subtitle: 'Universal infrared controller for AV and AC devices',
    categorySlug: 'control-hubs',
    price: 199900,
    warrantyMonths: 18,
    extendedWarrantyAvailable: false,
    imageIndex: 5,
    specs: ['WiFi 2.4GHz', '5V USB power', 'Tabletop placement', 'App, schedules and voice assistants', '18 months'],
    features: ['Controls AC, TV and set-top boxes', 'Scene-based remote commands', 'Compact retrofit installation'],
  },
  {
    slug: 'smart-home-hub',
    title: 'Smart Home Hub',
    subtitle: 'Central automation gateway for whole-home scenes',
    categorySlug: 'control-hubs',
    price: 2499900,
    warrantyMonths: 36,
    extendedWarrantyAvailable: true,
    imageIndex: 6,
    specs: ['WiFi, Ethernet, Zigbee and BLE', '12V DC adapter', 'Network rack or shelf mount', 'Unified app, scenes and integrations', '36 months'],
    features: ['Central device orchestration', 'Local scene execution', 'Expandable ecosystem gateway'],
  },
];

function descriptionFor(product) {
  return `${product.subtitle}.\n\nDesigned for professionally installed smart homes, this product integrates into Quantum Living Solutions scenes for lighting, security, comfort and energy routines.\n\nKey features:\n${product.features.map((feature) => `- ${feature}`).join('\n')}`;
}

async function ensureMedia(fileUrl) {
  const existing = await prisma.mediaItem.findFirst({ where: { fileUrl } });
  if (existing) return existing;

  const fileName = fileUrl.split('/').pop() ?? 'product-image.jpg';
  let fileSize = 1;

  try {
    const file = await stat(join(publicRoot, fileUrl.replace(/^\//, '')));
    fileSize = file.size;
  } catch {
    fileSize = 1;
  }

  return prisma.mediaItem.create({
    data: {
      fileName,
      fileUrl,
      mimeType: fileName.endsWith('.png') ? 'image/png' : 'image/jpeg',
      fileSize,
    },
  });
}

async function ensureBrand() {
  const existing = await prisma.brand.findFirst({ where: { name: 'Quantum Living Solutions' } });
  if (existing) return existing;

  return prisma.brand.create({
    data: {
      name: 'Quantum Living Solutions',
      websiteUrl: 'https://quantumlivingsolutions.com',
      displayOrder: 0,
      isActive: true,
    },
  });
}

async function main() {
  const [brand, categoryRows, templateRows, mediaRows] = await Promise.all([
    ensureBrand(),
    Promise.all(categories.map((category) => prisma.category.upsert({
      where: { slug: category.slug },
      update: { name: category.name },
      create: category,
    }))),
    Promise.all(specTemplates.map(async (template) => {
      const existing = await prisma.specTemplate.findFirst({ where: template });
      return existing ?? prisma.specTemplate.create({ data: template });
    })),
    Promise.all(imagePool.map(ensureMedia)),
  ]);

  const categoryBySlug = new Map(categoryRows.map((category) => [category.slug, category]));

  for (const [index, product] of products.entries()) {
    const category = categoryBySlug.get(product.categorySlug);
    if (!category) throw new Error(`Missing category ${product.categorySlug}`);

    const coverImage = mediaRows[product.imageIndex % mediaRows.length];
    const galleryIds = [
      coverImage.id,
      mediaRows[(product.imageIndex + 1) % mediaRows.length].id,
      mediaRows[(product.imageIndex + 2) % mediaRows.length].id,
    ];

    const row = await prisma.product.upsert({
      where: { slug: product.slug },
      update: {
        title: product.title,
        subtitle: product.subtitle,
        description: descriptionFor(product),
        categoryId: category.id,
        brandId: brand.id,
        price: product.price,
        hidePrice: false,
        availability: 'IN_STOCK',
        warrantyMonths: product.warrantyMonths,
        extendedWarrantyAvailable: product.extendedWarrantyAvailable,
        coverImageId: coverImage.id,
        status: 'PUBLISHED',
        sortOrder: index,
        deletedAt: null,
      },
      create: {
        slug: product.slug,
        title: product.title,
        subtitle: product.subtitle,
        description: descriptionFor(product),
        categoryId: category.id,
        brandId: brand.id,
        price: product.price,
        hidePrice: false,
        availability: 'IN_STOCK',
        warrantyMonths: product.warrantyMonths,
        extendedWarrantyAvailable: product.extendedWarrantyAvailable,
        coverImageId: coverImage.id,
        status: 'PUBLISHED',
        sortOrder: index,
      },
    });

    await prisma.productSpecification.deleteMany({ where: { productId: row.id } });
    await prisma.productSpecification.createMany({
      data: templateRows.map((template, templateIndex) => ({
        productId: row.id,
        templateId: template.id,
        value: product.specs[templateIndex],
      })),
      skipDuplicates: true,
    });

    await prisma.productImage.deleteMany({ where: { productId: row.id } });
    await prisma.productImage.createMany({
      data: galleryIds.map((mediaId, sortOrder) => ({
        productId: row.id,
        mediaId,
        sortOrder,
      })),
    });
  }

  console.info(`Seeded ${products.length} published automation products.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
