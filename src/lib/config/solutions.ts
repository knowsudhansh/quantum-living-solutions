export interface Solution {
  slug: string;
  title: string;
  shortDescription: string;
  detailedOverview: string;
  capabilities: string[];
  integrationNotes: string;
}

export const solutions: Record<string, Solution> = {
  'residential-automation': {
    slug: 'residential-automation',
    title: 'Residential Automation',
    shortDescription: 'Custom smart spaces designed for luxury living comfort.',
    detailedOverview: 'Integrated environmental coordination designed to automate interior lighting, climate boundaries, and media distribution systems throughout residential spaces.',
    capabilities: [
      'Centralized control of lighting scenes and occupancy routing.',
      'Schedule-based system presets matching natural daylight cycles.',
      'Usability-first physical keypads and silent motorized actuators.'
    ],
    integrationNotes: 'System designs separate high-performance media arrays from low-energy building subsystem controls, preserving backup controls for physical interfaces.'
  },
  'commercial-automation': {
    slug: 'commercial-automation',
    title: 'Commercial Automation',
    shortDescription: 'Seamless system controls for modern workspaces.',
    detailedOverview: 'High-performance subsystem automation designed to coordinate shared conference rooms, workspaces, and building security grids.',
    capabilities: [
      'Zone-based lighting controls and automated presence detection.',
      'Shared media distribution and display scheduling systems.',
      'Centralized admin controls for office subsystem profiles.'
    ],
    integrationNotes: 'Integrates local security policies and enterprise network isolation, ensuring public navigation layers remain decoupled from administrative subsystems.'
  },
  'lighting-automation': {
    slug: 'lighting-automation',
    title: 'Lighting Automation',
    shortDescription: 'Natural light mapping and dynamic scene management.',
    detailedOverview: 'Precision lighting control mapped to natural day-to-night transitions, rejecting artificial glowing designs in favor of restrained architectural illumination.',
    capabilities: [
      'Dynamic day-to-night scene transitions mapped to astronomical clocks.',
      'Astronomical solar tracking and blind coordination.',
      'High-contrast baseboard illumination guidelines for night safety.'
    ],
    integrationNotes: 'Emitters map directly to local low-voltage drivers, keeping power footprints minimal and avoiding high-frequency electronic noise.'
  },
  'curtains-and-blinds': {
    slug: 'curtains-and-blinds',
    title: 'Curtains and Blinds',
    shortDescription: 'Motorized blind controls designed for solar harvesting.',
    detailedOverview: 'Motorized window coverings integrated to manage thermal gains and optimize natural light entry throughout the day.',
    capabilities: [
      'Automated blind positioning coordinated with Solar heat harvesting.',
      'Precise motor alignment and silent actuator operation.',
      'Manual override controls via physical wall switches.'
    ],
    integrationNotes: 'Motor grids utilize low-noise relays isolated from building communication mesh networks to prevent signal interference.'
  },
  'climate-control': {
    slug: 'climate-control',
    title: 'Climate Control',
    shortDescription: 'High-precision temperature monitoring and zone control.',
    detailedOverview: 'Energy-efficient climate stabilization mapped to occupancy zones and external thermal sensors.',
    capabilities: [
      'Multi-zone HVAC scheduling and active humidity control.',
      'Solar thermal balancing and outdoor air ventilation routing.',
      'Local control lockouts matching building safety profiles.'
    ],
    integrationNotes: 'Dampers and heating loops interface via standard BACnet/IP gateways, separating local control loops from public data paths.'
  },
  'security-and-surveillance': {
    slug: 'security-and-surveillance',
    title: 'Security and Surveillance',
    shortDescription: 'Surveillance profiles, locking gates, and presence triggers.',
    detailedOverview: 'Comprehensive security boundary automation designed to safeguard property entries, window locks, and structural zones.',
    capabilities: [
      'Automated lock status verification and evening secure mode.',
      'Presence-based baseboard lighting paths for secure guidance.',
      'Non-intrusive security status indicators matching architectural finishes.'
    ],
    integrationNotes: 'Door locking systems utilize physical failsafes and are decoupled from network-facing data relays to preserve security isolation.'
  },
  'audio-video-entertainment': {
    slug: 'audio-video-entertainment',
    title: 'Audio/Video Entertainment',
    shortDescription: 'Distributed architectural media arrays and soundscapes.',
    detailedOverview: 'High-fidelity audio-video distribution systems designed to disappear into architectural spaces without visible visual clutter.',
    capabilities: [
      'Distributed multi-room audio matrices with hidden speakers.',
      'Projector and screen coordination tied to scenic environment triggers.',
      'Local volume limiters and acoustic room profile configurations.'
    ],
    integrationNotes: 'Central matrix distribution routing runs over dedicated fiber loops to separate high-bandwidth streaming from control signals.'
  },
  'energy-management': {
    slug: 'energy-management',
    title: 'Energy Management',
    shortDescription: 'Low-energy smart profiles for structural systems.',
    detailedOverview: 'System-wide energy conservation profiles designed to monitor, track, and optimize power draw during structural dormant states.',
    capabilities: [
      'Dormant state automation mapping and vampire load isolation.',
      'Solar energy storage allocation and off-peak load shifting.',
      'Real-time power monitoring across subsystem distribution panels.'
    ],
    integrationNotes: 'Energy monitoring meters communicate via local Modbus connections, ensuring data collection runs within isolated hardware networks.'
  }
};

export function getAllSolutions(): Solution[] {
  return Object.values(solutions);
}

export function getSolutionBySlug(slug: string): Solution | undefined {
  return solutions[slug];
}

export function isValidSolutionSlug(slug: string): boolean {
  return slug in solutions;
}
