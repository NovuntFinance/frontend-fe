'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUp, ArrowUpRight, ChevronDown, ChevronUp, Calendar } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export function WeeklyROSCard() {
    const [isExpanded, setIsExpanded] = useState(false);

    // Mock weekly data
    const weeklyData = [
        { week: 'Current Week', value: '+2.4%', isPositive: true },
        { week: 'Last Week', value: '+1.8%', isPositive: true },
        { week: '2 Weeks Ago', value: '+0.9%', isPositive: true },
        { week: '3 Weeks Ago', value: '-0.2%', isPositive: false },
    ];

    return (
        <Card className="relative overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 border-0 bg-card/50 backdrop-blur-sm group">
            {/* Animated Gradient Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-green-500/20 via-emerald-500/10 to-transparent" />

            {/* Animated Floating Blob */}
            <motion.div
                animate={{
                    x: [0, 15, 0],
                    y: [0, -10, 0],
                    scale: [1, 1.1, 1],
                }}
                transition={{
                    duration: 5,
                    repeat: Infinity,
                    ease: 'easeInOut',
                }}
                className="absolute -top-12 -right-12 w-24 h-24 bg-green-500/30 rounded-full blur-2xl"
            />

            <CardHeader className="relative pb-2">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <motion.div
                            whileHover={{ scale: 1.1, rotate: 10 }}
                            className="p-3 rounded-xl bg-gradient-to-br from-green-500/30 to-emerald-500/20 backdrop-blur-sm shadow-lg"
                        >
                            <TrendingUp className="h-6 w-6 text-green-500" />
                        </motion.div>
                        <div>
                            <CardTitle className="text-lg font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                                Return on Stake
                            </CardTitle>
                            <CardDescription className="text-xs">Weekly Performance</CardDescription>
                        </div>
                    </div>

                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="gap-1 h-8 text-xs"
                    >
                        {isExpanded ? 'Hide Details' : 'Show Details'}
                        {isExpanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                    </Button>
                </div>
            </CardHeader>

            <CardContent className="relative">
                <div className="flex items-baseline gap-3 mb-3">
                    <motion.span
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.9 }}
                        className="text-5xl font-black bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent"
                    >
                        24.8%
                    </motion.span>
                    <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white border-none shadow-lg hover:shadow-xl">
                        <ArrowUpRight className="h-3 w-3 mr-1" />
                        +5.2%
                    </Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                    Total Return on Stake (All Time)
                </p>

                {/* Collapsible Details */}
                <AnimatePresence>
                    {isExpanded && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3, ease: 'easeInOut' }}
                            className="overflow-hidden"
                        >
                            <div className="space-y-3 pt-3 border-t border-border/50">
                                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Recent Performance</h4>
                                <div className="space-y-2">
                                    {weeklyData.map((item, index) => (
                                        <div key={index} className="flex items-center justify-between text-sm p-2 rounded-lg bg-background/50 hover:bg-background/80 transition-colors">
                                            <div className="flex items-center gap-2">
                                                <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                                                <span>{item.week}</span>
                                            </div>
                                            <span className={`font-bold ${item.isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-500'}`}>
                                                {item.value}
                                            </span>
                                        </div>
                                    ))}
                                </div>

                                {/* Progress bar */}
                                <div className="mt-4">
                                    <div className="flex justify-between text-xs mb-1">
                                        <span>Monthly Goal</span>
                                        <span>75%</span>
                                    </div>
                                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: '75%' }}
                                            transition={{ delay: 0.2, duration: 1 }}
                                            className="h-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-full"
                                        />
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </CardContent>
        </Card>
    );
}
