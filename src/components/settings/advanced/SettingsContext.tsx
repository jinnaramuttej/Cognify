'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

// Define the exact type based on our implementation plan
export type AdvancedSettings = {
    learning_intelligence: {
        adaptive_mode: 'strict' | 'balanced' | 'manual';
        difficulty_bias: number;
        hint_style: 'minimal' | 'socratic' | 'step_by_step' | 'full';
        pace_preference: 'quick' | 'deep';
        error_tolerance: number;
        learning_mode: 'exam' | 'concept' | 'speed' | 'revision';
    };
    ai_personality: {
        personality: 'calm' | 'strict' | 'friendly' | 'competitive';
        voice_style: string | null;
        animation_intensity: number;
        explanation_depth: number;
    };
    transparency: {
        save_chat_history: boolean;
        allow_data_training: boolean;
    };
    focus_controls: {
        focus_mode_on: boolean;
        auto_start_timer: boolean;
        background_theme: 'animated_gradient' | 'minimal' | 'solid';
        sound_effects: boolean;
    };
    exam_target: {
        target_score: number;
        timeline_date: string;
        weak_subjects_emphasis: number;
    };
};

const defaultSettings: AdvancedSettings = {
    learning_intelligence: {
        adaptive_mode: 'balanced',
        difficulty_bias: 50,
        hint_style: 'socratic',
        pace_preference: 'deep',
        error_tolerance: 2,
        learning_mode: 'exam',
    },
    ai_personality: {
        personality: 'calm',
        voice_style: null,
        animation_intensity: 50,
        explanation_depth: 50,
    },
    transparency: {
        save_chat_history: true,
        allow_data_training: false,
    },
    focus_controls: {
        focus_mode_on: false,
        auto_start_timer: true,
        background_theme: 'animated_gradient',
        sound_effects: true,
    },
    exam_target: {
        target_score: 300,
        timeline_date: new Date().toISOString(),
        weak_subjects_emphasis: 50,
    }
};

type SettingsContextType = {
    settings: AdvancedSettings;
    updateSetting: <K extends keyof AdvancedSettings, T extends keyof AdvancedSettings[K]>(
        section: K,
        key: T,
        value: AdvancedSettings[K][T]
    ) => void;
    isLoading: boolean;
    isSaving: boolean;
};

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
    const [settings, setSettings] = useState<AdvancedSettings>(defaultSettings);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const supabase = createClientComponentClient({
        options: {
            auth: {
                autoRefreshToken: false,
                persistSession: false,
                detectSessionInUrl: false,
            },
        },
    });

    // Load preferences on mount
    useEffect(() => {
        const loadSettings = async () => {
            try {
                const { data: { session } } = await supabase.auth.getSession();
                if (!session?.user?.id) return;

                const { data, error } = await supabase
                    .from('profiles')
                    .select('preferences')
                    .eq('id', session.user.id)
                    .single();

                if (error) throw error;

                if (data && data.preferences) {
                    // Merge with defaults in case of new fields
                    setSettings((prev) => ({
                        ...prev,
                        ...data.preferences,
                    }));
                }
            } catch (err) {
                console.error('Error loading settings:', err);
            } finally {
                setIsLoading(false);
            }
        };
        loadSettings();
    }, [supabase]);

    // Debounced save to Supabase
    const saveToSupabase = useCallback(
        async (newSettings: AdvancedSettings) => {
            setIsSaving(true);
            try {
                const { data: { session } } = await supabase.auth.getSession();
                if (!session?.user?.id) return;

                const { error } = await supabase
                    .from('profiles')
                    .update({ preferences: newSettings })
                    .eq('id', session.user.id);

                if (error) throw error;
            } catch (err) {
                console.error('Error saving settings:', err);
            } finally {
                setTimeout(() => setIsSaving(false), 500); // UI breathing room
            }
        },
        [supabase]
    );

    const updateSetting = <K extends keyof AdvancedSettings, T extends keyof AdvancedSettings[K]>(
        section: K,
        key: T,
        value: AdvancedSettings[K][T]
    ) => {
        setSettings((prev) => {
            const newSettings = {
                ...prev,
                [section]: {
                    ...prev[section],
                    [key]: value,
                },
            };

            // Debounce the save call (simplistic approach for now)
            // In a real prod environment we'd use lodash.debounce on the callback
            // We will handle specific debounce inside the effect or use a global timeout
            clearTimeout((window as any)._settingsSaveTimeout);
            (window as any)._settingsSaveTimeout = setTimeout(() => {
                saveToSupabase(newSettings);
            }, 1000);

            return newSettings;
        });

        // Special case handling for global Focus Mode
        if (section === 'focus_controls' && key === 'focus_mode_on') {
            if (value) {
                document.body.classList.add('focus-mode');
            } else {
                document.body.classList.remove('focus-mode');
            }
        }
    };

    return (
        <SettingsContext.Provider value={{ settings, updateSetting, isLoading, isSaving }}>
            {children}
        </SettingsContext.Provider>
    );
}

export const useAdvancedSettings = () => {
    const context = useContext(SettingsContext);
    if (context === undefined) {
        throw new Error('useAdvancedSettings must be used within a SettingsProvider');
    }
    return context;
};

