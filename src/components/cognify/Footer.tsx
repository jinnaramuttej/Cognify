'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Github, Twitter, Linkedin, Facebook, Youtube, Mail, MapPin, Phone, Rocket } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Footer() {
  const socialLinks = [
    { name: 'LinkedIn', href: 'https://linkedin.com/company/cognify', icon: Linkedin },
    { name: 'Twitter', href: 'https://twitter.com/cognify', icon: Twitter },
    { name: 'Instagram', href: 'https://instagram.com/cognify', icon: Youtube },
    { name: 'Facebook', href: 'https://facebook.com/cognify', icon: Facebook },
  ];

  const productLinks = [
    { href: '/features', label: 'Features' },
    { href: '/pricing', label: 'Pricing' },
    { href: '/tests', label: 'Practice Tests' },
    { href: '/analytics', label: 'Progress Analytics' },
  ];

  const companyLinks = [
    { href: '/about', label: 'About Us' },
    { href: '/blog', label: 'Blog' },
    { href: '/careers', label: 'Careers' },
    { href: '/contact', label: 'Contact' },
    { href: '/partners', label: 'Partners' },
  ];

  const legalLinks = [
    { href: '/privacy-policy', label: 'Privacy Policy' },
    { href: '/terms-of-service', label: 'Terms of Service' },
    { href: '/cookie-policy', label: 'Cookie Policy' },
    { href: '/data-protection', label: 'Data Protection' },
    { href: '/compliance', label: 'Compliance' },
  ];

  const pathname = usePathname();
  const isAppPage = [
    '/dashboard', '/settings', '/leaderboard', '/tests',
    '/admin', '/lectures', '/analytics', '/recommendations',
    '/library', '/cogni', '/teacher', '/arena'
  ].some(path => pathname?.startsWith(path));

  if (isAppPage) return null;

  return (
    <footer className={`bg-[var(--background)] text-[var(--foreground)] border-t border-[var(--border)] transition-colors duration-300 mt-auto`}>
      <div className="container mx-auto px-4 md:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-5 gap-8 mb-12">
          {/* Column 1: Company Info */}
          <div className="md:col-span-2 lg:col-span-1">
            <h3 className="text-[var(--primary)] font-bold text-lg mb-4">Cognify</h3>
            <p className="text-[var(--muted-foreground)] text-sm mb-6">
              Empowering education through AI. Learn smarter, achieve more.
            </p>
            <div className="flex gap-4">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[var(--muted-foreground)] hover:text-[var(--primary)] transition-colors hover:scale-110 transform"
                  aria-label={social.name}
                >
                  <social.icon size={20} />
                </a>
              ))}
            </div>
          </div>

          {/* Column 2: Product */}
          <div>
            <h3 className="text-[var(--foreground)] font-bold text-sm mb-4">Product</h3>
            <ul className="space-y-3">
              {productLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-[var(--muted-foreground)] text-sm hover:text-[var(--primary)] transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Company */}
          <div>
            <h3 className="text-[var(--foreground)] font-bold text-sm mb-4">Company</h3>
            <ul className="space-y-3">
              {companyLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-[var(--muted-foreground)] text-sm hover:text-[var(--primary)] transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4: Legal */}
          <div>
            <h3 className="text-[var(--foreground)] font-bold text-sm mb-4">Legal</h3>
            <ul className="space-y-3">
              {legalLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-[var(--muted-foreground)] text-sm hover:text-[var(--primary)] transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 5: Contact & Demo */}
          <div>
            <h3 className="text-[var(--foreground)] font-bold text-sm mb-4">Contact</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-2 text-[var(--muted-foreground)]">
                <Mail size={16} className="text-[var(--primary)] flex-shrink-0 mt-0.5" />
                <a href="mailto:support@cognify.com" className="hover:text-[var(--primary)] transition-colors">
                  support@cognify.com
                </a>
              </li>
              <li className="flex items-start gap-2 text-[var(--muted-foreground)]">
                <Phone size={16} className="text-[var(--primary)] flex-shrink-0 mt-0.5" />
                <a href="tel:+917207842641" className="hover:text-[var(--primary)] transition-colors">
                  +91 7207842641
                </a>
              </li>
              <li className="flex items-start gap-2 text-[var(--muted-foreground)]">
                <MapPin size={16} className="text-[var(--primary)] flex-shrink-0 mt-0.5" />
                <span>Medchal, Telangana</span>
              </li>
            </ul>
          </div>
        </div>


        {/* Bottom Bar */}
        <div className="border-t border-[var(--border)] pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-[var(--muted-foreground)] text-xs text-center md:text-left">
            © {new Date().getFullYear()} Cognify. All rights reserved. | Founder: Jinnaram Uttej
          </p>
          <div className="flex gap-4">
            <Link href="/privacy-policy" className="text-[var(--muted-foreground)] text-xs hover:text-[var(--primary)] transition-colors">
              Privacy
            </Link>
            <Link href="/terms-of-service" className="text-[var(--muted-foreground)] text-xs hover:text-[var(--primary)] transition-colors">
              Terms
            </Link>
            <Link href="/cookie-policy" className="text-[var(--muted-foreground)] text-xs hover:text-[var(--primary)] transition-colors">
              Cookies
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
