'use client';

import { motion } from 'framer-motion';
import { FileUp, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { IngestionLog } from '@/lib/teacher-service';

interface RecentPDFImportsProps {
  logs: IngestionLog[];
  loading: boolean;
}

export default function RecentPDFImports({ logs, loading }: RecentPDFImportsProps) {
  const statusIcon = (status: IngestionLog['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-emerald-500" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-destructive" />;
      case 'processing':
        return <Loader2 className="h-4 w-4 text-primary animate-spin" />;
    }
  };

  const statusBadge = (status: IngestionLog['status']) => {
    const map = {
      completed: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30',
      failed: 'bg-destructive/10 text-destructive border-destructive/30',
      processing: 'bg-primary/10 text-primary border-primary/30',
    };
    return map[status];
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
      <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <FileUp className="h-5 w-5 text-primary" />
            Recent PDF Imports
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-16 bg-muted animate-pulse rounded-lg" />
              ))}
            </div>
          ) : logs.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground text-sm">
              <FileUp className="h-8 w-8 mx-auto mb-2 opacity-40" />
              No imports yet. Upload a PDF to get started.
            </div>
          ) : (
            <div className="space-y-3">
              {logs.map((log) => (
                <div
                  key={log.id}
                  className="flex items-start gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted/80 transition-colors"
                >
                  <div className="mt-0.5">{statusIcon(log.status)}</div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm text-foreground truncate">{log.filename}</p>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-xs text-muted-foreground">
                      <span>{log.questionsExtracted} extracted</span>
                      <span>{log.questionsValidated} validated</span>
                      <span>{log.questionsInserted} inserted</span>
                    </div>
                  </div>
                  <Badge variant="outline" className={statusBadge(log.status)}>
                    {log.status}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
