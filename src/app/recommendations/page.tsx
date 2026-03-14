'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
    Sparkles,
    Briefcase,
    TrendingUp,
    Clock,
    MapPin,
    DollarSign,
    Heart,
    ExternalLink,
    Star,
    Zap
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

/**
 * RecommendationsPage - AI-powered career recommendations
 * Features: Career cards, match scores, detailed information
 */
const RecommendationsPage: React.FC = () => {
    // Animation variants
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
            },
        },
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 },
    };

    // Mock career recommendations
    const recommendations = [
        {
            id: 1,
            title: 'Software Engineer',
            company: 'Tech Industry',
            matchScore: 95,
            salary: '$80k - $150k',
            location: 'Remote / Hybrid',
            growth: 'High Demand',
            skills: ['JavaScript', 'React', 'Node.js', 'Python'],
            description: 'Build innovative software solutions and applications that impact millions of users.',
            favorite: true,
        },
        {
            id: 2,
            title: 'Data Scientist',
            company: 'Analytics & AI',
            matchScore: 88,
            salary: '$90k - $160k',
            location: 'Flexible',
            growth: 'Rapid Growth',
            skills: ['Python', 'Machine Learning', 'SQL', 'Statistics'],
            description: 'Analyze complex datasets to drive business decisions and build predictive models.',
            favorite: false,
        },
        {
            id: 3,
            title: 'Product Manager',
            company: 'Product Development',
            matchScore: 82,
            salary: '$100k - $180k',
            location: 'On-site / Hybrid',
            growth: 'Stable',
            skills: ['Strategy', 'Leadership', 'Analytics', 'Communication'],
            description: 'Lead cross-functional teams to build products that solve real user problems.',
            favorite: false,
        },
        {
            id: 4,
            title: 'UX Designer',
            company: 'Design & Creative',
            matchScore: 78,
            salary: '$70k - $130k',
            location: 'Remote',
            growth: 'Growing',
            skills: ['Figma', 'User Research', 'Prototyping', 'UI Design'],
            description: 'Create beautiful, intuitive user experiences that delight customers.',
            favorite: false,
        },
    ];

    const getMatchColor = (score: number) => {
        if (score >= 90) return 'text-green-500 bg-green-500/10';
        if (score >= 80) return 'text-blue-500 bg-blue-500/10';
        if (score >= 70) return 'text-yellow-500 bg-yellow-500/10';
        return 'text-[var(--muted-foreground)] bg-[var(--muted)]';
    };

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-8"
        >
            {/* Page Header */}
            <motion.div variants={itemVariants} className="space-y-2">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-[var(--primary)]/10 rounded-xl">
                        <Sparkles className="w-6 h-6 text-[var(--primary)]" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Career Recommendations</h1>
                        <p className="text-[var(--muted-foreground)]">
                            AI-powered suggestions based on your profile and interests
                        </p>
                    </div>
                </div>
            </motion.div>

            {/* Filters Placeholder */}
            <motion.div variants={itemVariants}>
                <Card>
                    <CardContent className="p-4">
                        <div className="flex flex-wrap items-center gap-2">
                            <Badge variant="secondary" className="cursor-pointer hover:bg-[var(--primary)] hover:text-[var(--primary-foreground)] transition-colors">
                                All Careers
                            </Badge>
                            <Badge variant="outline" className="cursor-pointer hover:bg-[var(--accent)] transition-colors">
                                Technology
                            </Badge>
                            <Badge variant="outline" className="cursor-pointer hover:bg-[var(--accent)] transition-colors">
                                Business
                            </Badge>
                            <Badge variant="outline" className="cursor-pointer hover:bg-[var(--accent)] transition-colors">
                                Creative
                            </Badge>
                            <Badge variant="outline" className="cursor-pointer hover:bg-[var(--accent)] transition-colors">
                                Healthcare
                            </Badge>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>

            {/* AI Insight Banner */}
            <motion.div variants={itemVariants}>
                <Card className="bg-gradient-to-r from-[var(--primary)]/10 via-[var(--background)] to-[var(--accent)] border-[var(--primary)]/20 overflow-hidden relative">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--primary)]/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                    <CardContent className="p-6 relative">
                        <div className="flex items-center gap-3 mb-3">
                            <Zap className="w-5 h-5 text-[var(--primary)]" />
                            <span className="font-medium">AI Insight</span>
                        </div>
                        <p className="text-[var(--muted-foreground)]">
                            Based on your analytical skills and interest in technology, you're an excellent
                            match for <span className="text-[var(--foreground)] font-medium">Software Engineering</span> roles.
                            Consider developing your skills in cloud computing to increase your market value.
                        </p>
                    </CardContent>
                </Card>
            </motion.div>

            {/* Recommendations Grid */}
            <motion.div variants={itemVariants} className="grid gap-6 md:grid-cols-2">
                {recommendations.map((career, index) => (
                    <motion.div
                        key={career.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        whileHover={{ y: -4 }}
                        className="group"
                    >
                        <Card className="h-full hover:shadow-lg transition-all duration-300 hover:border-[var(--primary)]/50">
                            <CardHeader className="pb-4">
                                <div className="flex items-start justify-between">
                                    <div className="space-y-1">
                                        <CardTitle className="text-xl group-hover:text-[var(--primary)] transition-colors">
                                            {career.title}
                                        </CardTitle>
                                        <CardDescription className="flex items-center gap-2">
                                            <Briefcase className="w-4 h-4" />
                                            {career.company}
                                        </CardDescription>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button className="p-2 rounded-full hover:bg-[var(--destructive)]/10 transition-colors">
                                            <Heart
                                                className={`w-5 h-5 transition-colors ${career.favorite
                                                        ? 'text-[var(--destructive)] fill-[var(--destructive)]'
                                                        : 'text-[var(--muted-foreground)] hover:text-[var(--destructive)]'
                                                    }`}
                                            />
                                        </button>
                                        <div className={`px-3 py-1.5 rounded-full font-semibold text-sm ${getMatchColor(career.matchScore)}`}>
                                            <div className="flex items-center gap-1">
                                                <Star className="w-4 h-4" />
                                                {career.matchScore}%
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <p className="text-[var(--muted-foreground)] text-sm leading-relaxed">
                                    {career.description}
                                </p>

                                {/* Meta Info */}
                                <div className="grid grid-cols-2 gap-3 text-sm">
                                    <div className="flex items-center gap-2 text-[var(--muted-foreground)]">
                                        <DollarSign className="w-4 h-4" />
                                        <span>{career.salary}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-[var(--muted-foreground)]">
                                        <MapPin className="w-4 h-4" />
                                        <span>{career.location}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-[var(--muted-foreground)] col-span-2">
                                        <TrendingUp className="w-4 h-4" />
                                        <span>{career.growth}</span>
                                    </div>
                                </div>

                                {/* Skills */}
                                <div className="flex flex-wrap gap-2">
                                    {career.skills.map((skill) => (
                                        <Badge key={skill} variant="secondary" className="text-xs">
                                            {skill}
                                        </Badge>
                                    ))}
                                </div>

                                {/* Action Button */}
                                <Button className="w-full gap-2 group/btn">
                                    Learn More
                                    <ExternalLink className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                                </Button>
                            </CardContent>
                        </Card>
                    </motion.div>
                ))}
            </motion.div>

            {/* Load More */}
            <motion.div variants={itemVariants} className="flex justify-center">
                <Button variant="outline" size="lg">
                    Load More Recommendations
                </Button>
            </motion.div>
        </motion.div>
    );
};

export default RecommendationsPage;
