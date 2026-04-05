'use client';

/**
 * System Configuration Page
 * 
 * Displays setup instructions and environment status
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Copy,
  ExternalLink,
  Key,
  Database,
  Settings,
  Zap,
} from 'lucide-react';
import { toast } from 'sonner';

interface ConfigItem {
  name: string;
  key: string;
  status: 'configured' | 'missing' | 'unknown';
  required: boolean;
  description: string;
  setupLink?: string;
}

export default function SystemConfigPage() {
  const [config, setConfig] = useState<ConfigItem[]>([]);
  const [loading, setLoading] = useState(true);

  function getFrontendConfig(): ConfigItem[] {
    return [
      {
        name: 'Featherless API Key',
        key: 'FEATHERLESS_API_KEY',
        status: 'unknown',
        required: true,
        description: 'Required for AI-powered features (Cogni tutor, notes conversion, question parsing)',
        setupLink: 'https://featherless.ai',
      },
      {
        name: 'Supabase URL',
        key: 'NEXT_PUBLIC_SUPABASE_URL',
        status: 'unknown',
        required: true,
        description: 'Database connection URL',
        setupLink: 'https://supabase.com/dashboard',
      },
      {
        name: 'Supabase Anon Key',
        key: 'NEXT_PUBLIC_SUPABASE_ANON_KEY',
        status: 'unknown',
        required: true,
        description: 'Public API key for Supabase',
      },
      {
        name: 'Database Schema',
        key: 'DATABASE_MIGRATIONS',
        status: 'unknown',
        required: true,
        description: 'Run db/migrations/001_add_role_and_study_packs.sql in Supabase',
      },
    ];
  }

  async function checkConfiguration() {
    setLoading(true);
    try {
      const response = await fetch('/api/system/config-status');
      if (response.ok) {
        const data = await response.json();
        setConfig(data.config || []);
      } else {
        // Fallback to frontend-only check
        setConfig(getFrontendConfig());
      }
    } catch (error) {
      // Fallback
      setConfig(getFrontendConfig());
    }
    setLoading(false);
  }

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void checkConfiguration();
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, []);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };

  const getStatusIcon = (status: ConfigItem['status']) => {
    switch (status) {
      case 'configured':
        return <CheckCircle2 size={20} className="text-green-500" />;
      case 'missing':
        return <XCircle size={20} className="text-red-500" />;
      default:
        return <AlertTriangle size={20} className="text-amber-500" />;
    }
  };

  const getStatusBadge = (status: ConfigItem['status']) => {
    switch (status) {
      case 'configured':
        return <Badge className="bg-green-500/10 text-green-500 border-green-500/20">Configured</Badge>;
      case 'missing':
        return <Badge className="bg-red-500/10 text-red-500 border-red-500/20">Missing</Badge>;
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-background p-6 space-y-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
              <Settings size={32} className="text-primary" />
              System Configuration
            </h1>
            <p className="text-muted-foreground mt-2">
              Setup guide for Cognify platform features
            </p>
          </div>
          <Button onClick={checkConfiguration} variant="outline" disabled={loading}>
            <Zap size={16} className="mr-2" />
            {loading ? 'Checking...' : 'Recheck Status'}
          </Button>
        </div>

        {/* Quick Setup Alert */}
        <Alert className="border-blue-500/30 bg-blue-500/5 mb-6">
          <AlertDescription className="text-sm">
            <strong>⚡ Quick Start:</strong> Add these environment variables to your <code className="bg-blue-500/20 px-2 py-1 rounded">.env.local</code> file in the project root.
          </AlertDescription>
        </Alert>

        {/* Configuration Items */}
        <div className="space-y-4">
          {config.map((item) => (
            <Card key={item.key} className="border-border bg-card">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div>{getStatusIcon(item.status)}</div>
                    <div>
                      <CardTitle className="text-lg flex items-center gap-2">
                        {item.name}
                        {item.required && <Badge variant="destructive" className="text-xs">Required</Badge>}
                      </CardTitle>
                      <CardDescription className="mt-1">{item.description}</CardDescription>
                    </div>
                  </div>
                  {getStatusBadge(item.status)}
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2 bg-muted p-3 rounded-lg font-mono text-sm">
                  <code className="flex-1">{item.key}=your_value_here</code>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => copyToClipboard(item.key)}
                  >
                    <Copy size={16} />
                  </Button>
                </div>
                {item.setupLink && (
                  <Button
                    variant="link"
                    className="text-blue-500 p-0 h-auto"
                    onClick={() => window.open(item.setupLink, '_blank')}
                  >
                    Get API Key <ExternalLink size={14} className="ml-1" />
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Database Migration Instructions */}
        <Card className="border-amber-500/30 bg-amber-500/5 mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
              <Database size={24} />
              Database Migration Required
            </CardTitle>
            <CardDescription>
              Run the migration script to add new tables and fields
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-background p-4 rounded-lg border border-border">
              <p className="text-sm text-muted-foreground mb-2">1. Open your Supabase project SQL Editor</p>
              <p className="text-sm text-muted-foreground mb-2">2. Copy and run the migration file:</p>
              <code className="block bg-muted p-3 rounded text-sm font-mono">
                db/migrations/001_add_role_and_study_packs.sql
              </code>
            </div>
            <div className="text-sm text-muted-foreground">
              <p>This migration adds:</p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li><code className="bg-muted px-2 py-0.5 rounded">role</code> field to profiles table</li>
                <li><code className="bg-muted px-2 py-0.5 rounded">study_pack_generations</code> table for notes converter</li>
                <li>Row Level Security policies</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Feature Status */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Feature Availability</CardTitle>
            <CardDescription>What works with current configuration</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3">
              <FeatureStatus
                name="Cogni AI Tutor"
                enabled={config.find(c => c.key === 'FEATHERLESS_API_KEY')?.status === 'configured'}
                requirement="Requires FEATHERLESS_API_KEY"
              />
              <FeatureStatus
                name="Notes Converter"
                enabled={config.find(c => c.key === 'FEATHERLESS_API_KEY')?.status === 'configured'}
                requirement="Requires FEATHERLESS_API_KEY"
              />
              <FeatureStatus
                name="Question Ingestion (OCR)"
                enabled={config.find(c => c.key === 'FEATHERLESS_API_KEY')?.status === 'configured'}
                requirement="Requires FEATHERLESS_API_KEY"
              />
              <FeatureStatus
                name="Tests & Practice"
                enabled={true}
                requirement="Always available"
              />
              <FeatureStatus
                name="Leaderboard & Arena"
                enabled={true}
                requirement="Always available"
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function FeatureStatus({ name, enabled, requirement }: { name: string; enabled: boolean; requirement: string }) {
  return (
    <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
      <div>
        <p className="font-medium text-sm">{name}</p>
        <p className="text-xs text-muted-foreground">{requirement}</p>
      </div>
      {enabled ? (
        <Badge className="bg-green-500/10 text-green-500 border-green-500/20">
          <CheckCircle2 size={14} className="mr-1" />
          Available
        </Badge>
      ) : (
        <Badge variant="secondary">
          <XCircle size={14} className="mr-1" />
          Disabled
        </Badge>
      )}
    </div>
  );
}
