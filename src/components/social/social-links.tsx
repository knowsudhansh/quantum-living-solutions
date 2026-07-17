'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { createLucideIcon, type LucideIcon } from 'lucide-react';

type SocialPlatform = {
  name: string;
  href: string;
  Icon: LucideIcon;
};

type SocialLinksProps = {
  size?: 'sm' | 'md' | 'lg';
  showLabels?: boolean;
  className?: string;
};

const Facebook = createLucideIcon('Facebook', [
  ['path', { d: 'M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z', key: 'facebook-f' }],
]);

const Instagram = createLucideIcon('Instagram', [
  ['rect', { width: '16', height: '16', x: '4', y: '4', rx: '4', key: 'instagram-frame' }],
  ['circle', { cx: '12', cy: '12', r: '3.5', key: 'instagram-lens' }],
  ['path', { d: 'M16.5 7.5h.01', key: 'instagram-dot' }],
]);

const LinkedIn = createLucideIcon('LinkedIn', [
  ['path', { d: 'M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-4 0v7h-4v-7a6 6 0 0 1 6-6z', key: 'linkedin-n' }],
  ['rect', { width: '4', height: '12', x: '2', y: '9', key: 'linkedin-i' }],
  ['circle', { cx: '4', cy: '4', r: '2', key: 'linkedin-dot' }],
]);

const socialPlatforms: SocialPlatform[] = [
  {
    name: 'Facebook',
    href: 'https://www.facebook.com/profile.php?id=61590581041484',
    Icon: Facebook,
  },
  {
    name: 'Instagram',
    href: 'https://www.instagram.com/quantum_living_solutions?igsh=MXRncXFoM215eWFuNA==',
    Icon: Instagram,
  },
  {
    name: 'LinkedIn',
    href: 'https://www.linkedin.com/company/quantum-living-solutions/?viewAsMember=true',
    Icon: LinkedIn,
  },
];

const sizeClasses = {
  sm: {
    link: 'h-10 w-10',
    icon: 'h-4 w-4',
    label: 'text-[10px]',
  },
  md: {
    link: 'h-12 w-12',
    icon: 'h-5 w-5',
    label: 'text-[10px]',
  },
  lg: {
    link: 'h-16 w-16 sm:h-18 sm:w-18',
    icon: 'h-6 w-6 sm:h-7 sm:w-7',
    label: 'text-xs',
  },
} as const;

export function SocialLinks({ size = 'md', showLabels = false, className = '' }: SocialLinksProps) {
  const reducedMotion = useReducedMotion();
  const styles = sizeClasses[size];

  return (
    <div className={`flex flex-wrap items-center gap-3 ${className}`} aria-label="Official social media links">
      {socialPlatforms.map(({ name, href, Icon }) => (
        <motion.a
          key={name}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Follow Quantum Living Solutions on ${name}`}
          className={`group inline-flex items-center justify-center gap-3 border border-white/10 bg-white/[0.03] text-zinc-300 transition-colors duration-300 hover:border-[color:var(--gold-bright)]/70 hover:text-white hover:shadow-[0_0_26px_rgba(185,145,82,0.28)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[color:var(--gold-bright)] ${showLabels ? 'min-w-36 px-4' : styles.link}`}
          whileHover={reducedMotion ? undefined : { y: -3, scale: 1.03 }}
          whileTap={reducedMotion ? undefined : { scale: 0.98 }}
          transition={{ type: 'spring', stiffness: 260, damping: 18 }}
        >
          <Icon className={`${styles.icon} text-[color:var(--gold-bright)] transition-transform duration-300 group-hover:scale-110`} aria-hidden />
          {showLabels && (
            <span className={`${styles.label} font-mono uppercase tracking-[0.16em] text-zinc-300 transition-colors group-hover:text-white`}>
              {name}
            </span>
          )}
        </motion.a>
      ))}
    </div>
  );
}
