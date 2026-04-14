'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useAuth } from '@/contexts/AuthContext';
import { useAIStore } from '@/lib/stores/ai-store';
import { useUserStore } from '@/lib/stores/user-store';
import type { StitchPageSource } from '@/lib/stitch-page-source';

type JsonRecord = Record<string, any>;

const NAV_ROUTES: Array<[RegExp, string]> = [
  [/\bdash(board)?\b/i, '/dashboard'],
  [/\btests?\b|\bquiz\b/i, '/tests'],
  [/\banalytics?\b|\bperformance\b/i, '/analytics'],
  [/\bcogni\b|\bpsychology\b/i, '/cogni'],
  [/\blib(rary)?\b|\bmenu_book\b|\blocal_library\b/i, '/library'],
  [/\bnotes?\b|\bedit_note\b|\bdescription\b/i, '/notes'],
  [/\barena\b|\bleaderboard\b|\bswords\b|\bemoji_events\b/i, '/arena'],
  [/\bsettings?\b/i, '/settings'],
];

const CACHE_TTL = 90_000;
const responseCache = new Map<string, { expires: number; value: any }>();

async function cachedJson<T>(key: string, url: string): Promise<T> {
  const cached = responseCache.get(key);
  if (cached && cached.expires > Date.now()) return cached.value as T;

  const response = await fetch(url, { cache: 'no-store' });
  if (!response.ok) throw new Error(`Request failed: ${response.status}`);
  const value = await response.json();
  responseCache.set(key, { expires: Date.now() + CACHE_TTL, value });
  return value as T;
}

function textOf(element: Element | null) {
  return element?.textContent?.replace(/\s+/g, ' ').trim() ?? '';
}

function findTextElement(root: HTMLElement, matcher: RegExp) {
  const candidates = root.querySelectorAll<HTMLElement>('h1,h2,h3,h4,h5,p,span,button,a,label,div');
  return Array.from(candidates).find((element) => {
    const text = textOf(element);
    return text.length > 0 && text.length < 120 && matcher.test(text);
  });
}

function setText(root: HTMLElement, matcher: RegExp, value: string) {
  const element = findTextElement(root, matcher);
  if (element) element.textContent = value;
}

function setInput(root: HTMLElement, matcher: RegExp, value: string) {
  const input = Array.from(root.querySelectorAll<HTMLInputElement | HTMLTextAreaElement>('input,textarea'))
    .find((element) => matcher.test(element.value || element.placeholder || ''));
  if (input) {
    input.value = value;
    input.setAttribute('value', value);
  }
}

function formatHms(seconds: number) {
  const safe = Math.max(0, Math.floor(seconds || 0));
  const h = Math.floor(safe / 3600).toString().padStart(2, '0');
  const m = Math.floor((safe % 3600) / 60).toString().padStart(2, '0');
  const s = Math.floor(safe % 60).toString().padStart(2, '0');
  return `${h}:${m}:${s}`;
}

function formatMinutes(seconds: number) {
  return `${Math.round((seconds || 0) / 60)}m`;
}

function getRouteForElement(element: HTMLElement) {
  const label = `${textOf(element)} ${element.getAttribute('title') ?? ''}`.trim();
  for (const [matcher, route] of NAV_ROUTES) {
    if (matcher.test(label)) return route;
  }
  return null;
}

function wireLinks(root: HTMLElement) {
  root.querySelectorAll<HTMLAnchorElement>('a').forEach((anchor) => {
    const route = getRouteForElement(anchor);
    if (route) anchor.setAttribute('href', route);
  });
  root.querySelectorAll<HTMLElement>('.cursor-pointer').forEach((element) => {
    if (element.closest('a,button') || element.hasAttribute('tabindex')) return;
    element.tabIndex = 0;
    element.setAttribute('role', 'button');
  });
}

function patchUser(root: HTMLElement, user: ReturnType<typeof useAuth>['user']) {
  if (!user) return;
  const fullName = user.full_name || user.name || user.email.split('@')[0];
  const shortName = fullName
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part, index) => (index === 1 ? `${part[0]}.` : part))
    .join(' ');

  setText(root, /Uttej R\.|Julian Sterling|Student/i, shortName || fullName);
  setInput(root, /Julian Sterling|Full Name/i, fullName);
  setInput(root, /j\.sterling@cognify\.edu|Email/i, user.email);

  const avatar = root.querySelector<HTMLImageElement>('img[alt*="profile" i], img[alt*="Profile" i]');
  if (avatar && user.avatar_url) avatar.src = user.avatar_url;
}

function patchSettingsTabs(root: HTMLElement, tabId: string) {
  root.querySelectorAll<HTMLElement>('[data-panel]').forEach((panel) => {
    panel.classList.toggle('active', panel.dataset.panel === tabId);
  });
  root.querySelectorAll<HTMLElement>('[data-tab]').forEach((tab) => {
    tab.classList.toggle('active', tab.dataset.tab === tabId);
  });
}

type RuntimeProps = StitchPageSource;

export default function StitchRuntimePage({ pageKey, bodyClassName, html, styles }: RuntimeProps) {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const router = useRouter();
  const { user, logout, updateUserProfile } = useAuth();
  const setProfile = useUserStore((state) => state.setProfile);
  const setStats = useUserStore((state) => state.setStats);
  const aiMessages = useAIStore((state) => state.messages);
  const addAIMessage = useAIStore((state) => state.addMessage);
  const setAITopic = useAIStore((state) => state.setTopic);
  const incrementAIStep = useAIStore((state) => state.incrementStep);
  const [busy, setBusy] = useState(false);
  const supabase = useMemo(
    () =>
      createClientComponentClient({
        options: {
          auth: {
            autoRefreshToken: false,
            persistSession: false,
            detectSessionInUrl: false,
          },
        },
      }),
    []
  );

  useEffect(() => {
    if (user) setProfile(user);
  }, [setProfile, user]);

  const hydrateDashboard = useCallback(async (root: HTMLElement) => {
    const id = user?.id || 'anonymous';
    const [dashboardRes, analyticsRes] = await Promise.allSettled([
      cachedJson<JsonRecord>(`dashboard:${id}`, `/api/dashboard?userId=${encodeURIComponent(id)}`),
      cachedJson<JsonRecord>(`analytics:${id}`, `/api/analytics?userId=${encodeURIComponent(id)}`),
    ]);

    if (dashboardRes.status === 'fulfilled') {
      const data = dashboardRes.value.data ?? dashboardRes.value;
      setStats(data);
      setText(root, /\d{2}:\d{2}:\d{2}/, formatHms(data.todayStudyTime || data.totalStudyTime || 0));
      setText(root, /\d+\s+Days/i, `${data.streak?.current_streak ?? 0} Days`);
      setText(root, /\d+\s+NODES/i, `${data.recommendations?.length ?? 0} NODES`);

      const firstRecommendation = data.recommendations?.[0];
      if (firstRecommendation?.title) {
        setText(root, /Rotational Dynamics|Calculus III|Systems Theory/i, firstRecommendation.title);
      }
    }

    if (analyticsRes.status === 'fulfilled') {
      const data = analyticsRes.value.data ?? analyticsRes.value;
      if (typeof data.overallAccuracy === 'number') {
        setText(root, /\b92\b/, String(data.overallAccuracy));
        setText(root, /\b92%/, `${data.overallAccuracy}%`);
      }
      const weakTopic = data.weakTopics?.[0]?.topic;
      if (weakTopic) setText(root, /Calculus III|Rotational Dynamics/i, weakTopic);
    }
  }, [setStats, user?.id]);

  const hydrateTests = useCallback(async (root: HTMLElement) => {
    const historyRes = await cachedJson<JsonRecord>('tests:history', '/api/tests/history').catch(() => null);
    if (historyRes?.stats) {
      setText(root, /\b\d+%\b/, `${historyRes.stats.avgAccuracy ?? historyRes.stats.averageScore ?? 0}%`);
      setText(root, /View History/i, `View History (${historyRes.stats.totalTests ?? 0})`);
    }
  }, []);

  const hydrateAnalytics = useCallback(async (root: HTMLElement) => {
    const id = user?.id || 'anonymous';
    const res = await cachedJson<JsonRecord>(`analytics:${id}`, `/api/analytics?userId=${encodeURIComponent(id)}`);
    const data = res.data ?? res;

    setText(root, /\b78%|\b82%|\b92%|Overall Accuracy/i, `${data.overallAccuracy ?? 0}%`);
    setText(root, /Rank Change/i, `Rank ${data.cohortPercentile ?? '-'}%`);
    const weakTopic = data.weakTopics?.[0];
    if (weakTopic) {
      setText(root, /Fluid Dynamics|Kinematics|Alkanes/i, weakTopic.topic);
    }
  }, [user?.id]);

  const hydrateLibrary = useCallback(async (root: HTMLElement) => {
    const res = await cachedJson<JsonRecord>('library:subjects', '/api/library');
    const subjects = res.data ?? [];
    subjects.slice(0, 4).forEach((subject: JsonRecord, index: number) => {
      const fallback = ['Physics', 'Chemistry', 'Mathematics', 'Biology'][index];
      if (subject?.name && fallback) setText(root, new RegExp(fallback, 'i'), subject.name);
    });
  }, []);

  const hydrateArena = useCallback(async (root: HTMLElement) => {
    const uid = user?.id;
    let leaderboard: JsonRecord[] = [];

    try {
      const { data } = await supabase
        .from('challenge_participants')
        .select('user_id, highest_score, profiles:user_id(full_name, avatar_url)')
        .order('highest_score', { ascending: false })
        .limit(10);
      leaderboard = data ?? [];
    } catch {
      leaderboard = [];
    }

    const currentIndex = uid ? leaderboard.findIndex((entry) => entry.user_id === uid) : -1;
    setText(root, /ELITE RANK #12|RANK #12|#12/i, `RANK #${currentIndex >= 0 ? currentIndex + 1 : '-'}`);
    const top = leaderboard[0];
    if (top?.profiles?.full_name) setText(root, /Aarav|Rahul|Priya|Champion/i, top.profiles.full_name);
  }, [supabase, user?.id]);

  const runNotesGeneration = useCallback(async (root: HTMLElement) => {
    const textarea = root.querySelector<HTMLTextAreaElement>('textarea');
    const sourceText = textarea?.value.trim() ?? '';
    if (!sourceText || busy) return;

    setBusy(true);
    setText(root, /Transform Notes|Generate|Create New/i, 'Generating...');

    try {
      const formData = new FormData();
      formData.append('text', sourceText);
      formData.append('sourceName', 'stitch-notes');
      const ingest = await fetch('/api/notes-converter/ingest', { method: 'POST', body: formData });
      const ingestJson = await ingest.json();
      if (!ingest.ok) throw new Error(ingestJson.error || 'Failed to ingest notes');

      const output = await fetch('/api/notes-converter/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ generationId: ingestJson.generationId, outputType: 'flashcards' }),
      });
      const outputJson = await output.json();
      if (!output.ok) throw new Error(outputJson.error || 'Failed to generate output');

      const count = outputJson.result?.cards?.length ?? outputJson.result?.flashcards?.length ?? 0;
      setText(root, /\d+\s+Flashcards Generated/i, `${count || 'New'} Flashcards Generated`);
      const firstCard = outputJson.result?.cards?.[0] ?? outputJson.result?.flashcards?.[0];
      if (firstCard?.front || firstCard?.question) {
        setText(root, /Active Recall Node|The Core Concept/i, firstCard.front || firstCard.question);
      }
    } catch (error) {
      setText(root, /Generating\.\.\.|Transform Notes|Generate/i, error instanceof Error ? error.message : 'Generation failed');
    } finally {
      setBusy(false);
    }
  }, [busy]);

  const sendCogniMessage = useCallback(async (root: HTMLElement) => {
    const input = root.querySelector<HTMLInputElement>('input[placeholder*="understanding" i], input[placeholder*="Ask" i]');
    const message = input?.value.trim() ?? '';
    if (!message || busy) return;

    setBusy(true);
    setText(root, /AI Consensus/i, 'Thinking');
    addAIMessage({ id: `msg_${Date.now()}`, role: 'user', content: message, timestamp: new Date().toISOString() });
    setText(root, /Can you explain.*\?/i, message);

    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message,
          history: aiMessages.slice(-10).map((msg) => ({ role: msg.role, content: msg.content })),
          userId: user?.id || 'anonymous',
        }),
      });
      const data = await response.json();
      if (!response.ok || data.status === 'error') throw new Error(data.message || 'Tutor request failed');

      addAIMessage({
        id: `msg_${Date.now() + 1}`,
        role: 'assistant',
        content: data.message,
        timestamp: new Date().toISOString(),
        structured: data.structured,
      });
      if (data.topicsDiscussed?.[0]) setAITopic(data.topicsDiscussed[0]);
      incrementAIStep();
      setText(root, /The Wave Function Evolution|Concept Overview/i, data.structured?.concept || 'Cogni Response');
      setText(root, /Schrödinger's Equation is[\s\S]{0,80}|Matter is not just[\s\S]{0,80}/i, data.message);
      if (input) input.value = '';
    } catch (error) {
      setText(root, /Thinking|AI Consensus/i, error instanceof Error ? error.message : 'Request failed');
    } finally {
      setBusy(false);
    }
  }, [addAIMessage, aiMessages, busy, incrementAIStep, setAITopic, user?.id]);

  const saveSettings = useCallback(async (root: HTMLElement) => {
    if (!user || busy) return;
    const fullNameInput = Array.from(root.querySelectorAll<HTMLInputElement>('input[type="text"]'))
      .find((input) => input.value && !/Search/i.test(input.placeholder));
    const full_name = fullNameInput?.value.trim();
    if (!full_name) return;

    setBusy(true);
    try {
      const response = await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: user.id, full_name }),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || 'Profile update failed');
      await updateUserProfile({ full_name });
      setProfile({ ...user, full_name });
      setText(root, /Save Changes/i, 'Saved');
    } catch (error) {
      setText(root, /Save Changes|Saved/i, error instanceof Error ? error.message : 'Save failed');
    } finally {
      setBusy(false);
    }
  }, [busy, setProfile, updateUserProfile, user]);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    wireLinks(root);
    patchUser(root, user);
    patchSettingsTabs(root, 'profile');

    const hydrate = async () => {
      try {
        if (pageKey === 'dashboard') await hydrateDashboard(root);
        if (pageKey === 'tests') await hydrateTests(root);
        if (pageKey === 'analytics') await hydrateAnalytics(root);
        if (pageKey === 'library') await hydrateLibrary(root);
        if (pageKey === 'arena') await hydrateArena(root);
      } catch {
        // The preserved UI remains usable with its embedded fallback data.
      }
    };

    hydrate();
  }, [hydrateAnalytics, hydrateArena, hydrateDashboard, hydrateLibrary, hydrateTests, pageKey, user]);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const onClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      const interactive = target.closest<HTMLElement>('a,button,[data-tab],.cursor-pointer');
      if (!interactive) return;

      const tabId = interactive.dataset.tab;
      if (tabId) {
        event.preventDefault();
        patchSettingsTabs(root, tabId);
        return;
      }

      const route = getRouteForElement(interactive);
      const label = textOf(interactive);

      if (route) {
        event.preventDefault();
        router.push(route);
        return;
      }

      if (/Launch Now|Start Test|Preview|Quick Create|Begin/i.test(label)) {
        event.preventDefault();
        router.push('/tests/create');
        return;
      }

      if (/View History/i.test(label)) {
        event.preventDefault();
        router.push('/tests/history');
        return;
      }

      if (/Transform|Generate|Flashcards|Create New/i.test(label) && pageKey === 'notes') {
        event.preventDefault();
        runNotesGeneration(root);
        return;
      }

      if (/Ask Cognify|New Insight/i.test(label) && pageKey === 'cogni') {
        event.preventDefault();
        sendCogniMessage(root);
        return;
      }

      if (/Save Changes/i.test(label) && pageKey === 'settings') {
        event.preventDefault();
        saveSettings(root);
        return;
      }

      if (/Logout|Sign Out/i.test(label)) {
        event.preventDefault();
        logout();
      }
    };

    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement;
      if ((event.key === 'Enter' || event.key === ' ') && target.matches('[role="button"]')) {
        event.preventDefault();
        target.click();
        return;
      }
      if (event.key !== 'Enter') return;
      if (pageKey === 'cogni' && target.matches('input')) {
        event.preventDefault();
        sendCogniMessage(root);
      }
    };

    root.addEventListener('click', onClick);
    root.addEventListener('keydown', onKeyDown);

    return () => {
      root.removeEventListener('click', onClick);
      root.removeEventListener('keydown', onKeyDown);
    };
  }, [logout, pageKey, router, runNotesGeneration, saveSettings, sendCogniMessage]);

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: styles }} />
      <div
        ref={rootRef}
        className={`stitch-scope ${bodyClassName}`}
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </>
  );
}
