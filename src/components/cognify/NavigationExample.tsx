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
        { label: 'Video Lectures', href: '/videos', ariaLabel: 'View Video Lectures' },
        { label: 'Practice Papers', href: '/practice-quizzes', ariaLabel: 'View Practice Papers' },
        { label: 'Formula Sheets', href: '#formulas', ariaLabel: 'View Formula Sheets' },
      ]
    },
    {
      label: 'Analytics',
      bgColor: '#ffffff',
      textColor: '#2563EB',
      links: [
        { label: 'Progress Tracker', href: '/progress-analytics', ariaLabel: 'View Progress Tracker' },
        { label: 'Weak Area Analysis', href: '#weaknesses', ariaLabel: 'View Weak Area Analysis' },
        { label: 'Performance Reports', href: '#reports', ariaLabel: 'View Performance Reports' },
      ]
    },
    {
      label: 'Community',
      bgColor: '#ffffff',
      textColor: '#2563EB',
      links: [
        { label: 'Leaderboard', href: '#leaderboard', ariaLabel: 'View Leaderboard' },
        { label: 'Study Groups', href: '#groups', ariaLabel: 'View Study Groups' },
        { label: 'Discussions', href: '#discussions', ariaLabel: 'View Discussions' },
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
