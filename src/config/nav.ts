import {
  ClipboardList,
  FolderTree,
  LayoutDashboard,
  MessageSquare,
  Package,
  Settings,
  ShieldCheck,
  Users,
  type LucideIcon,
} from 'lucide-react';

type NavItem = {
  label: string;
  href: string;
};

type AdminNavItem = NavItem & {
  icon: LucideIcon;
};

type FooterGroup = {
  title: string;
  links: ReadonlyArray<NavItem>;
};

export const publicNav = [
  { label: 'Home', href: '/' },
  { label: 'Shop', href: '/shop' },
  { label: 'Services', href: '/services' },
  { label: 'About', href: '/about' },
  { label: 'Contact', href: '/contact' },
] as const satisfies ReadonlyArray<NavItem>;

export const adminNav = [
  { label: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { label: 'Products', href: '/admin/products', icon: Package },
  { label: 'Categories', href: '/admin/categories', icon: FolderTree },
  { label: 'Orders', href: '/admin/orders', icon: ClipboardList },
  { label: 'Customers', href: '/admin/customers', icon: Users },
  { label: 'Messages', href: '/admin/messages', icon: MessageSquare },
  { label: 'Settings', href: '/admin/settings', icon: Settings },
  { label: 'Audit Log', href: '/admin/audit', icon: ShieldCheck },
] as const satisfies ReadonlyArray<AdminNavItem>;

export const footerNav = [
  {
    title: 'Shop',
    links: [
      { label: 'Generators', href: '/shop/category/generators' },
      { label: 'Water Pumps', href: '/shop/category/water-pumps' },
      { label: 'Cables & Wires', href: '/shop/category/cables-wires' },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'About us', href: '/about' },
      { label: 'Services', href: '/services' },
      { label: 'Contact', href: '/contact' },
    ],
  },
  {
    title: 'Support',
    links: [
      { label: 'Help center', href: '/contact' },
      { label: 'Shipping & delivery', href: '/shipping' },
      { label: 'Track your order', href: '/orders/track' },
    ],
  },
  {
    title: 'Legal',
    links: [
      { label: 'Privacy policy', href: '/privacy' },
      { label: 'Terms of service', href: '/terms' },
      { label: 'Return policy', href: '/return-policy' },
    ],
  },
] as const satisfies ReadonlyArray<FooterGroup>;
