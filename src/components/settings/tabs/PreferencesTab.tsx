import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock, Target, Bell, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

type PreferencesData = {
    dailyStudyGoal: number;
    enableReminders: boolean;
    preferredStudyTime: string;
};

export default function PreferencesTab() {
    const { user, updateUserProfile } = useAuth();
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);

    const { register, handleSubmit, reset } = useForm<PreferencesData>({
        defaultValues: {
            dailyStudyGoal: user?.progress?.daily_goal || 30,
            enableReminders: true,
            preferredStudyTime: '19:00',
        }
    });

    useEffect(() => {
        if (user) {
            reset({
                dailyStudyGoal: user.progress?.daily_goal || 30,
                enableReminders: true,
                preferredStudyTime: '19:00',
            });
        }
    }, [user, reset]);

    const onSubmit = async (data: PreferencesData) => {
        setLoading(true);
        try {
            await updateUserProfile({
                progress: { ...user?.progress, daily_goal: data.dailyStudyGoal }
            } as any);
            toast({
                title: "Settings Saved",
                description: "Your study preferences have been updated.",
            });
        } catch (error: any) {
            toast({
                title: "Error",
                description: "Failed to save preferences.",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            <section>
                <h3 className="text-xl font-bold text-[var(--foreground)] mb-2">Study Preferences</h3>
                <p className="text-sm text-[var(--muted)] mb-6">Customize your learning pace and reminders</p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card className="bg-card border-border">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium flex items-center gap-2">
                                <Target size={16} className="text-blue-500" />
                                Daily Study Goal
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center gap-4">
                                <input
                                    type="number"
                                    {...register('dailyStudyGoal')}
                                    className="input w-24"
                                    min="5"
                                    max="480"
                                />
                                <span className="text-sm text-muted-foreground">minutes / day</span>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-card border-border">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium flex items-center gap-2">
                                <Clock size={16} className="text-primary" />
                                Preferred Study Time
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <input
                                type="time"
                                {...register('preferredStudyTime')}
                                className="input w-full"
                            />
                        </CardContent>
                    </Card>
                </div>
            </section>

            <section>
                <div className="flex items-center gap-2 mb-4">
                    <Bell size={20} className="text-blue-500" />
                    <h3 className="text-xl font-bold text-[var(--foreground)]">Notification Settings</h3>
                </div>
                <div className="space-y-3">
                    <label className="flex items-center gap-4 p-5 bg-secondary/20 rounded-xl border border-border cursor-pointer hover:bg-secondary/30 transition-colors">
                        <input type="checkbox" {...register('enableReminders')} className="w-5 h-5 rounded border-blue-500 text-blue-600 focus:ring-blue-500" />
                        <div>
                            <p className="font-semibold">Reminders Toggle</p>
                            <p className="text-xs text-muted-foreground">Receive daily streak reminders and learning tips</p>
                        </div>
                    </label>
                </div>
            </section>

            <div className="pt-6 border-t border-border">
                <Button type="submit" disabled={loading} className="bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-400 px-8 font-bold">
                    {loading ? <Loader2 className="animate-spin mr-2" size={16} /> : null}
                    Save Preferences
                </Button>
            </div>
        </form>
    );
}

