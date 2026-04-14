'use client';

import CardNav from './CardNav';
import Link from 'next/link';

export default function NavigationExample() {
  const navigationItems = [
    {
      label: 'Study Materials',
      bgColor: '#ffffff',
      textColor: '#2563EB',
      links: [
        { label: 'Notes Library', href: '/notes', ariaLabel: 'View Notes Library' },
        { label: 'Video Lectures', href: '/library', ariaLabel: 'View Video Lectures' },
        { label: 'Practice Papers', href: '/tests', ariaLabel: 'View Practice Papers' },
        { label: 'Formula Sheets', href: '/library', ariaLabel: 'View Formula Sheets' },
      ]
    },
    {
      label: 'Analytics',
      bgColor: '#ffffff',
      textColor: '#2563EB',
      links: [
        { label: 'Progress Tracker', href: '/analytics', ariaLabel: 'View Progress Tracker' },
        { label: 'Weak Area Analysis', href: '/analytics', ariaLabel: 'View Weak Area Analysis' },
        { label: 'Performance Reports', href: '/analytics', ariaLabel: 'View Performance Reports' },
      ]
    },
    {
      label: 'Community',
      bgColor: '#ffffff',
      textColor: '#2563EB',
      links: [
        { label: 'Leaderboard', href: '/leaderboard', ariaLabel: 'View Leaderboard' },
        { label: 'Study Groups', href: '/arena', ariaLabel: 'View Study Groups' },
        { label: 'Discussions', href: '/cogni', ariaLabel: 'View Discussions' },
      ]
    }
  ];

  return (
    <div className="relative pt-24 pb-8 px-4">
      <CardNav
        items={navigationItems}
        baseColor="#ffffff"
        menuColor="#2563EB"
        buttonBgColor="#2563EB"
        buttonTextColor="#ffffff"
        ease="power3.out"
        className="w-full"
      />
    </div>
  );
}
