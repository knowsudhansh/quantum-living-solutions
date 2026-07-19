export type CareerPosition = {
  slug: string;
  title: string;
  type: string;
  location: string;
  summary: string;
  highlights: string[];
  responsibilities: string[];
  requirements: string[];
};

export const careerPositions: CareerPosition[] = [
  {
    slug: 'iot-expert',
    title: 'IoT Expert',
    type: 'Full-time / Project-based',
    location: 'Gorakhpur and client sites',
    summary:
      'Own the technical design, programming, commissioning, and support of premium smart home and automation environments.',
    highlights: ['Smart home commissioning', 'IoT device integration', 'Control logic and diagnostics'],
    responsibilities: [
      'Configure and commission IoT devices, sensors, gateways, controllers, and automation scenes.',
      'Coordinate with electrical teams for safe low-voltage wiring, panel placement, and site readiness.',
      'Troubleshoot connectivity, device pairing, firmware, automation logic, and client handover issues.',
      'Document installation details, network settings, device inventory, and maintenance recommendations.',
    ],
    requirements: [
      'Hands-on experience with smart home, IoT, networking, electrical, or low-voltage systems.',
      'Comfort with WiFi, Zigbee, BLE, IP cameras, smart switches, sensors, door locks, and automation hubs.',
      'Strong problem-solving discipline and a premium customer-service mindset.',
      'Ability to travel locally for site visits, commissioning, and support calls.',
    ],
  },
];

export const otherOpportunity = {
  slug: 'other-opportunities',
  title: 'Other Opportunities',
  summary:
    'For installers, electricians, designers, consultants, project coordinators, and automation-minded specialists.',
  message: "Upload your resume. If you're the right person, we will contact you shortly.",
};
