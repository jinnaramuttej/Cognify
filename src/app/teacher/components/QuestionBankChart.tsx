'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import type { SubjectDistribution } from '@/lib/teacher-service';

const COLORS = [
  'hsl(217, 91%, 60%)',   // Primary blue
  'hsl(160, 84%, 39%)',   // Emerald
  'hsl(43, 96%, 56%)',    // Amber
  'hsl(262, 83%, 58%)',   // Violet
  'hsl(346, 77%, 49%)',   // Rose
  'hsl(199, 89%, 48%)',   // Sky
];

interface QuestionBankChartProps {
  distribution: SubjectDistribution[];
}

export default function QuestionBankChart({ distribution }: QuestionBankChartProps) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={distribution} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
        <XAxis
          dataKey="subject"
          tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
          axisLine={{ stroke: 'hsl(var(--border))' }}
        />
        <YAxis
          tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
          axisLine={{ stroke: 'hsl(var(--border))' }}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: 'hsl(var(--card))',
            border: '1px solid hsl(var(--border))',
            borderRadius: '8px',
            color: 'hsl(var(--foreground))',
          }}
          formatter={(value: number) => [`${value} questions`, 'Count']}
        />
        <Bar dataKey="count" radius={[6, 6, 0, 0]} maxBarSize={60}>
          {distribution.map((_, index) => (
            <Cell key={index} fill={COLORS[index % COLORS.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
