'use client'

import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Globe, Languages, Check, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

// Types
export type SupportedLanguage = 'en' | 'hi' | 'ta'

export interface LanguageConfig {
  code: SupportedLanguage
  name: string
  nativeName: string
  flag: string
}

// Language configurations
export const LANGUAGES: LanguageConfig[] = [
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇬🇧' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिंदी', flag: '🇮🇳' },
  { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்', flag: '🇮🇳' },
]

// Translation data type
export type TranslationKey = 
  | 'library'
  | 'subjects'
  | 'chapters'
  | 'resources'
  | 'notes'
  | 'video'
  | 'audio'
  | 'quiz'
  | 'physics'
  | 'chemistry'
  | 'mathematics'
  | 'biology'
  | 'download'
  | 'share'
  | 'bookmark'
  | 'search'
  | 'filter'
  | 'sort'
  | 'recent'
  | 'trending'
  | 'recommended'

// Simple translations (demo)
const translations: Record<SupportedLanguage, Record<TranslationKey, string>> = {
  en: {
    library: 'Library',
    subjects: 'Subjects',
    chapters: 'Chapters',
    resources: 'Resources',
    notes: 'Notes',
    video: 'Video',
    audio: 'Audio',
    quiz: 'Quiz',
    physics: 'Physics',
    chemistry: 'Chemistry',
    mathematics: 'Mathematics',
    biology: 'Biology',
    download: 'Download',
    share: 'Share',
    bookmark: 'Bookmark',
    search: 'Search',
    filter: 'Filter',
    sort: 'Sort',
    recent: 'Recent',
    trending: 'Trending',
    recommended: 'Recommended',
  },
  hi: {
    library: 'पुस्तकालय',
    subjects: 'विषय',
    chapters: 'अध्याय',
    resources: 'संसाधन',
    notes: 'नोट्स',
    video: 'वीडियो',
    audio: 'ऑडियो',
    quiz: 'प्रश्नोत्तरी',
    physics: 'भौतिकी',
    chemistry: 'रसायन विज्ञान',
    mathematics: 'गणित',
    biology: 'जीव विज्ञान',
    download: 'डाउनलोड',
    share: 'साझा करें',
    bookmark: 'बुकमार्क',
    search: 'खोजें',
    filter: 'फ़िल्टर',
    sort: 'क्रम',
    recent: 'हाल का',
    trending: 'चर्चित',
    recommended: 'अनुशंसित',
  },
  ta: {
    library: 'நூலகம்',
    subjects: 'பாடங்கள்',
    chapters: 'அத்தியாயங்கள்',
    resources: 'வளங்கள்',
    notes: 'குறிப்புகள்',
    video: 'வீடியோ',
    audio: 'ஆடியோ',
    quiz: 'வினாடி வினா',
    physics: 'இயற்பியல்',
    chemistry: 'வேதியியல்',
    mathematics: 'கணிதம்',
    biology: 'உயிரியல்',
    download: 'பதிவிறக்கு',
    share: 'பகிர்',
    bookmark: 'புக்மார்க்',
    search: 'தேடல்',
    filter: 'வடிகட்டி',
    sort: 'வரிசை',
    recent: 'சமீபத்திய',
    trending: 'பிரபலமான',
    recommended: 'பரிந்துரைக்கப்பட்ட',
  },
}

interface LanguageToggleProps {
  currentLanguage?: SupportedLanguage
  onLanguageChange?: (language: SupportedLanguage) => void
  variant?: 'default' | 'compact' | 'flag'
  showLabel?: boolean
  className?: string
}

export function LanguageToggle({
  currentLanguage = 'en',
  onLanguageChange,
  variant = 'default',
  showLabel = true,
  className,
}: LanguageToggleProps) {
  const [isFlipping, setIsFlipping] = useState(false)
  
  const currentLang = LANGUAGES.find(l => l.code === currentLanguage) || LANGUAGES[0]
  
  const handleLanguageChange = useCallback((lang: SupportedLanguage) => {
    if (lang === currentLanguage) return
    
    setIsFlipping(true)
    setTimeout(() => {
      onLanguageChange?.(lang)
      setTimeout(() => setIsFlipping(false), 150)
    }, 150)
  }, [currentLanguage, onLanguageChange])
  
  // Compact variant - just flag and dropdown
  if (variant === 'compact') {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className={cn('h-8 w-8 p-0', className)}
          >
            <motion.span
              animate={{ rotateY: isFlipping ? 180 : 0 }}
              transition={{ duration: 0.3 }}
              className="text-lg"
            >
              {currentLang.flag}
            </motion.span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-40">
          {LANGUAGES.map((lang) => (
            <DropdownMenuItem
              key={lang.code}
              onClick={() => handleLanguageChange(lang.code)}
              className="flex items-center justify-between"
            >
              <span className="flex items-center gap-2">
                <span className="text-base">{lang.flag}</span>
                <span>{lang.nativeName}</span>
              </span>
              {lang.code === currentLanguage && (
                <Check className="h-4 w-4 text-violet-500" />
              )}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    )
  }
  
  // Flag variant - circular flag button
  if (variant === 'flag') {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={cn(
              'relative w-10 h-10 rounded-full bg-gradient-to-br from-violet-500 to-purple-500',
              'flex items-center justify-center shadow-lg shadow-violet-500/20',
              'overflow-hidden cursor-pointer',
              className
            )}
          >
            <motion.div
              animate={{ rotateY: isFlipping ? 180 : 0 }}
              transition={{ duration: 0.3, type: 'spring' }}
              className="text-xl"
            >
              {currentLang.flag}
            </motion.div>
          </motion.button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <div className="px-2 py-1.5 text-xs text-gray-500 font-medium">
            Select Language / भाषा चुनें
          </div>
          {LANGUAGES.map((lang) => (
            <DropdownMenuItem
              key={lang.code}
              onClick={() => handleLanguageChange(lang.code)}
              className={cn(
                'flex items-center justify-between py-2',
                lang.code === currentLanguage && 'bg-violet-50'
              )}
            >
              <span className="flex items-center gap-2">
                <span className="text-lg">{lang.flag}</span>
                <div className="flex flex-col">
                  <span className="font-medium">{lang.nativeName}</span>
                  <span className="text-xs text-gray-500">{lang.name}</span>
                </div>
              </span>
              {lang.code === currentLanguage && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 15 }}
                >
                  <Check className="h-4 w-4 text-violet-500" />
                </motion.div>
              )}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    )
  }
  
  // Default variant - button with label
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={cn(
            'border-gray-200 hover:border-violet-300 hover:bg-violet-50',
            'transition-all duration-200',
            className
          )}
        >
          <Globe className="h-4 w-4 mr-2 text-violet-500" />
          <motion.div
            key={currentLanguage}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex items-center gap-2"
          >
            <span className="text-sm">{currentLang.flag}</span>
            {showLabel && <span className="text-sm">{currentLang.nativeName}</span>}
          </motion.div>
          <ChevronDown className="h-4 w-4 ml-1 text-gray-400" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <div className="px-2 py-1.5 text-xs text-gray-500 font-medium flex items-center gap-1">
          <Languages className="h-3 w-3" />
          Select Language
        </div>
        {LANGUAGES.map((lang) => (
          <DropdownMenuItem
            key={lang.code}
            onClick={() => handleLanguageChange(lang.code)}
            className={cn(
              'flex items-center justify-between py-2',
              lang.code === currentLanguage && 'bg-violet-50'
            )}
          >
            <span className="flex items-center gap-2">
              <span className="text-lg">{lang.flag}</span>
              <div className="flex flex-col">
                <span className="font-medium">{lang.nativeName}</span>
                <span className="text-xs text-gray-500">{lang.name}</span>
              </div>
            </span>
            {lang.code === currentLanguage && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 400, damping: 15 }}
              >
                <Check className="h-4 w-4 text-violet-500" />
              </motion.div>
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

// Resource Language Labels Component
interface ResourceLanguageLabelsProps {
  resourceId: string
  availableLanguages: SupportedLanguage[]
  currentLanguage: SupportedLanguage
  onLanguageSelect?: (lang: SupportedLanguage) => void
  className?: string
}

export function ResourceLanguageLabels({
  resourceId,
  availableLanguages,
  currentLanguage,
  onLanguageSelect,
  className,
}: ResourceLanguageLabelsProps) {
  const availableLangs = LANGUAGES.filter(l => availableLanguages.includes(l.code))
  
  if (availableLangs.length <= 1) return null
  
  return (
    <div className={cn('flex items-center gap-1.5', className)}>
      {availableLangs.map((lang) => (
        <motion.button
          key={lang.code}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onLanguageSelect?.(lang.code)}
          className={cn(
            'px-2 py-0.5 rounded-md text-xs font-medium transition-all border',
            lang.code === currentLanguage
              ? 'bg-violet-100 text-violet-700 border-violet-200'
              : 'bg-white text-gray-600 border-gray-200 hover:border-violet-300'
          )}
        >
          {lang.flag} {lang.nativeName}
        </motion.button>
      ))}
    </div>
  )
}

// Translation hook
export function useTranslation(language: SupportedLanguage = 'en') {
  const t = useCallback((key: TranslationKey): string => {
    return translations[language]?.[key] || translations.en[key] || key
  }, [language])
  
  return { t, language }
}

// Language context helper
export function getLocalizedTitle(
  title: string,
  language: SupportedLanguage,
  translations?: Partial<Record<SupportedLanguage, string>>
): string {
  if (translations && translations[language]) {
    return translations[language]
  }
  return title
}

export default LanguageToggle
