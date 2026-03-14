'use client';

import { useState, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User, Shield, Lock, Bell, CreditCard,
  BookOpen, Brain, Target, Database, Link2, Search
} from 'lucide-react';
import { SettingsProvider, useAdvancedSettings } from './advanced/SettingsContext';

// Import New Sections
import ProfileSection from './sections/ProfileSection';
import SecuritySection from './sections/SecuritySection';
import PrivacySection from './sections/PrivacySection';
import NotificationsSection from './sections/NotificationsSection';
import BillingSection from './sections/BillingSection';
import LearningPreferencesSection from './sections/LearningPreferencesSection';
import AIPreferencesSection from './sections/AIPreferencesSection';
import ExamTargetsSection from './sections/ExamTargetsSection';
import DataTransparencySection from './sections/DataTransparencySection';
import ConnectedServicesSection from './sections/ConnectedServicesSection';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from '@/components/ui/accordion';

const TABS = [
  {
    group: 'Account',
    items: [
      { id: 'profile', label: 'Profile', icon: User, component: ProfileSection },
      { id: 'security', label: 'Security', icon: Shield, component: SecuritySection },
      { id: 'privacy', label: 'Privacy', icon: Lock, component: PrivacySection },
      { id: 'notifications', label: 'Notifications', icon: Bell, component: NotificationsSection },
    ]
  },
  {
    group: 'Platform',
    items: [
      { id: 'billing', label: 'Subscription & Billing', icon: CreditCard, component: BillingSection },
      { id: 'learning', label: 'Learning Preferences', icon: BookOpen, component: LearningPreferencesSection },
      { id: 'ai', label: 'AI Preferences', icon: Brain, component: AIPreferencesSection },
      { id: 'targets', label: 'Exam Targets', icon: Target, component: ExamTargetsSection },
    ]
  },
  {
    group: 'Advanced',
    items: [
      { id: 'data', label: 'Data & Transparency', icon: Database, component: DataTransparencySection },
      { id: 'connected', label: 'Connected Services', icon: Link2, component: ConnectedServicesSection },
    ]
  }
];

// Flat list of all tabs for easy lookup
const ALL_TABS = TABS.flatMap(g => g.items);

function SettingsContent() {
  const searchParams = useSearchParams();
  const initialTab = searchParams.get('tab') || 'profile';
  const [activeTab, setActiveTab] = useState(initialTab);
  const [searchQuery, setSearchQuery] = useState('');

  const { isLoading, isSaving } = useAdvancedSettings();

  // Search filtering logic
  const filteredGroups = useMemo(() => {
    if (!searchQuery) return TABS;
    const lowerQ = searchQuery.toLowerCase();

    return TABS.map(group => ({
      ...group,
      items: group.items.filter(t =>
        t.label.toLowerCase().includes(lowerQ) || t.id.includes(lowerQ)
      )
    })).filter(group => group.items.length > 0);
  }, [searchQuery]);

  const flatFilteredTabs = filteredGroups.flatMap(g => g.items);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-32">
        <div className="w-8 h-8 rounded-full border-4 border-blue-500 border-t-transparent animate-spin"></div>
      </div>
    );
  }

  const ActiveComponent = ALL_TABS.find(t => t.id === activeTab)?.component || ProfileSection;

  return (
    <div className="px-4 py-6 md:py-8 md:px-8 text-gray-900 dark:text-white">
      {/* Header & Search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl md:text-3xl font-black text-gray-900 dark:text-white tracking-tight">Settings</h1>
          <AnimatePresence>
            {isSaving && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="px-2 py-1 bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-400 text-xs font-bold rounded-md"
              >
                Saving...
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="relative w-full md:w-72 lg:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search settings..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl pl-9 pr-4 py-2.5 text-sm text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm transition-all"
          />
        </div>
      </div>

      {/* Desktop Layout (2-Column) */}
      <div className="hidden lg:flex gap-8 relative items-start">
        {/* Left Sidebar Menu */}
        <div className="w-64 flex-shrink-0 sticky top-24 space-y-6">
          {filteredGroups.map((group, groupIdx) => (
            <div key={group.group} className="space-y-1">
              <h3 className="px-3 text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">
                {group.group}
              </h3>
              <div className="space-y-0.5">
                {group.items.map((tab) => {
                  const isActive = activeTab === tab.id;
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${isActive
                        ? 'text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-500/15 shadow-sm'
                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-gray-200'
                        }`}
                    >
                      <Icon size={18} className={isActive ? 'text-blue-500' : 'opacity-70'} />
                      {tab.label}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
          {filteredGroups.length === 0 && (
            <div className="text-sm text-gray-400 px-3">No matching settings found.</div>
          )}
        </div>

        {/* Right Content Pane */}
        <div className="flex-1 min-w-0 min-h-[600px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="w-full"
            >
              <ActiveComponent />
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Mobile / Tablet Layout (Accordion) */}
      <div className="lg:hidden pb-20">
        <Accordion type="single" collapsible value={activeTab} onValueChange={(val) => val && setActiveTab(val)} className="space-y-4">
          {flatFilteredTabs.map((tab) => {
            const Icon = tab.icon;
            const Component = tab.component;
            return (
              <AccordionItem
                key={tab.id}
                value={tab.id}
                className="border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 rounded-2xl px-4 overflow-hidden shadow-sm"
              >
                <AccordionTrigger className="text-base font-semibold py-5 hover:no-underline [&[data-state=open]>div>svg]:text-blue-500 [&[data-state=open]]:text-blue-600 dark:[&[data-state=open]]:text-blue-400">
                  <div className="flex items-center gap-3">
                    <Icon className="text-gray-400 transition-colors" size={20} />
                    {tab.label}
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pb-6 pt-2">
                  <Component />
                </AccordionContent>
              </AccordionItem>
            );
          })}
          {flatFilteredTabs.length === 0 && (
            <div className="text-center py-8 text-sm text-gray-500">No settings found for "{searchQuery}"</div>
          )}
        </Accordion>
      </div>
    </div>
  );
}

export default function SettingsLayout() {
  return (
    <SettingsProvider>
      <SettingsContent />
    </SettingsProvider>
  );
}

