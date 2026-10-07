import type { SVGProps } from 'react';
import {
  Accessibility as LucideAccessibility,
  AlertTriangle as LucideAlert,
  Armchair as LucideArmchair,
  ArrowRight as LucideArrowRight,
  ArrowRightLeft as LucideArrowRightLeft,
  Baby as LucideBaby,
  BedDouble as LucideBed,
  CalendarDays as LucideCalendar,
  Car as LucideCar,
  Clock as LucideClock,
  Gift as LucideGift,
  Globe as LucideGlobe,
  Headset as LucideHeadset,
  HelpCircle as LucideHelp,
  Briefcase as LucideBriefcase,
  Dumbbell as LucideDumbbell,
  Leaf as LucideLeaf,
  Luggage as LucideLuggage,
  Mail as LucideMail,
  MapPin as LucideMapPin,
  MessageCircle as LucideChat,
  Music as LucideMusic,
  Package as LucidePackage,
  PersonStanding as LucidePersonStanding,
  ShoppingBag as LucideShoppingBag,
  Phone as LucidePhone,
  Plane as LucidePlane,
  RefreshCw as LucideRefresh,
  Search as LucideSearch,
  ShieldCheck as LucideShield,
  Sparkles as LucideSparkles,
  Tag as LucideTag,
  UtensilsCrossed as LucideUtensils,
  User as LucideUser,
  Users as LucideUsers,
} from 'lucide-react';

/*
 * Icon set — Lucide (modern, professional, consistent 24px stroke grid) mapped to the app's
 * icon names so usage sites don't change. Brand/social marks stay custom (Lucide's brand
 * icons are deprecated).
 */
export const PlaneIcon = LucidePlane;
export const CalendarIcon = LucideCalendar;
export const UserIcon = LucideUser;
export const SeatIcon = LucideArmchair;
export const SearchIcon = LucideSearch;
export const SwapIcon = LucideArrowRightLeft;
export const ShieldIcon = LucideShield;
export const TagIcon = LucideTag;
export const HeadsetIcon = LucideHeadset;
export const RefreshIcon = LucideRefresh;
export const ArrowRightIcon = LucideArrowRight;
export const PinIcon = LucideMapPin;
export const GlobeIcon = LucideGlobe;
export const HelpIcon = LucideHelp;
export const PhoneIcon = LucidePhone;
export const MailIcon = LucideMail;
export const ChatIcon = LucideChat;
export const ClockIcon = LucideClock;
export const LeafIcon = LucideLeaf;
export const UsersIcon = LucideUsers;
export const SparklesIcon = LucideSparkles;
export const BriefcaseIcon = LucideBriefcase;
export const LuggageIcon = LucideLuggage;
export const UtensilsIcon = LucideUtensils;
export const PackageIcon = LucidePackage;
export const GiftIcon = LucideGift;
export const HotelIcon = LucideBed;
export const CarIcon = LucideCar;
export const ShopIcon = LucideShoppingBag;
export const ChildIcon = LucidePersonStanding;
export const AlertIcon = LucideAlert;
export const DumbbellIcon = LucideDumbbell;
export const MusicIcon = LucideMusic;
export const BabyIcon = LucideBaby;
export const AccessibilityIcon = LucideAccessibility;

/* --- Brand / social marks (kept custom) --- */
type IconProps = SVGProps<SVGSVGElement>;

function Base({ children, ...props }: IconProps & { children: React.ReactNode }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      {children}
    </svg>
  );
}

export function InstagramIcon(props: IconProps) {
  return (
    <Base {...props}>
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" />
    </Base>
  );
}

export function YoutubeIcon(props: IconProps) {
  return (
    <Base {...props}>
      <rect x="2.5" y="6" width="19" height="12" rx="3.5" />
      <path d="m10 9.5 5 2.5-5 2.5z" fill="currentColor" stroke="none" />
    </Base>
  );
}

export function LinkedinIcon(props: IconProps) {
  return (
    <Base {...props}>
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <path d="M7 10v7M7 7v.01M11 17v-4a2 2 0 0 1 4 0v4M11 17v-7" />
    </Base>
  );
}

export function XIcon(props: IconProps) {
  return (
    <Base {...props}>
      <path d="M4 4l16 16M20 4L4 20" />
    </Base>
  );
}

export function FacebookIcon(props: IconProps) {
  return (
    <Base {...props}>
      <path d="M15 4h-2.5A3.5 3.5 0 0 0 9 7.5V10H6.5v3H9v7M9 13h3.5" />
    </Base>
  );
}
