'use client';

import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Gift,
  TrendingUp,
  Users,
  Calendar,
  DollarSign,
  Check,
  Clock,
  Star,
} from 'lucide-react';
import { format } from 'date-fns';
import Confetti from 'react-confetti';
import { useBonusHistory, useClaimBonus } from '@/lib/queries';
import { formatCurrency, cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';

// Bonus type definitions
interface Bonus {
  id: string;
  type: 'deposit' | 'referral' | 'ranking' | 'redistribution' | 'special';
  amount: number;
  status: 'pending' | 'claimable' | 'claimed';
  title: string;
  description: string;
  metadata?: {
    depositAmount?: number;
    referralLevel?: number;
    oldRank?: string;
    newRank?: string;
    poolAmount?: number;
  };
  claimedAt?: string;
  expiresAt?: string;
  createdAt: string;
}

/**
 * Bonuses & Rewards Page
 * Display and claim bonuses with celebration animations
 */
export default function BonusesPage() {
  const [showConfetti, setShowConfetti] = useState(false);
  const [claimingBonusId, setClaimingBonusId] = useState<string | null>(null);

  // Fetch bonuses
  const { data: bonuses = [], isLoading } = useBonusHistory();
  const claimBonusMutation = useClaimBonus();

  // Separate claimable and claimed bonuses
  const claimableBonuses = bonuses.filter((b: Bonus) => b.status === 'claimable');
  const claimedBonuses = bonuses.filter((b: Bonus) => b.status === 'claimed');
  const pendingBonuses = bonuses.filter((b: Bonus) => b.status === 'pending');

  // Calculate stats
  const stats = useMemo(() => {
    const totalEarned = bonuses
      .filter((b) => b.status === 'claimed')
      .reduce((sum, b) => sum + b.amount, 0);
    
    const totalPending = bonuses
      .filter((b) => b.status === 'claimable')
      .reduce((sum, b) => sum + b.amount, 0);
    
    const thisMonth = bonuses.filter((b) => {
      const bonusDate = new Date(b.createdAt);
      const now = new Date();
      return (
        bonusDate.getMonth() === now.getMonth() &&
        bonusDate.getFullYear() === now.getFullYear() &&
        b.status === 'claimed'
      );
    }).reduce((sum, b) => sum + b.amount, 0);

    return {
      totalEarned,
      totalPending,
      thisMonth,
      claimableCount: claimableBonuses.length,
    };
  }, [bonuses, claimableBonuses]);

  // Claim bonus
  const handleClaimBonus = async (bonusId: string) => {
    try {
      setClaimingBonusId(bonusId);
      await claimBonusMutation.mutateAsync(bonusId);
      
      // Show celebration
      setShowConfetti(true);
      toast.success('Bonus Claimed!', { description: 'Your bonus has been added to your earnings wallet' });
      
      // Hide confetti after 5 seconds
      setTimeout(() => setShowConfetti(false), 5000);
    } catch {
      toast.error('Claim Failed', { description: 'Failed to claim bonus. Please try again.' });
    } finally {
      setClaimingBonusId(null);
    }
  };

  // Get bonus icon
  const getBonusIcon = (type: Bonus['type']) => {
    switch (type) {
      case 'deposit':
        return <DollarSign className="h-6 w-6" />;
      case 'referral':
        return <Users className="h-6 w-6" />;
      case 'ranking':
        return <Gift className="h-6 w-6" />;
      case 'redistribution':
        return <TrendingUp className="h-6 w-6" />;
      case 'special':
        return <Star className="h-6 w-6" />;
      default:
        return <Gift className="h-6 w-6" />;
    }
  };

  // Get bonus color
  const getBonusColor = (type: Bonus['type']) => {
    switch (type) {
      case 'deposit':
        return 'from-emerald-500 to-green-600';
      case 'referral':
        return 'from-purple-500 to-pink-600';
      case 'ranking':
        return 'from-amber-500 to-orange-600';
      case 'redistribution':
        return 'from-blue-500 to-indigo-600';
      case 'special':
        return 'from-rose-500 to-red-600';
      default:
        return 'from-gray-500 to-gray-600';
    }
  };

  // Bonus card component
  const BonusCard = ({ bonus, index }: { bonus: Bonus; index: number }) => {
    const isClaimable = bonus.status === 'claimable';
    const isClaimed = bonus.status === 'claimed';
    const isPending = bonus.status === 'pending';
    const isClaiming = claimingBonusId === bonus.id;

    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3, delay: index * 0.05 }}
      >
        <Card
          className={cn(
            'relative overflow-hidden transition-all duration-300',
            isClaimable && 'border-primary shadow-lg hover:shadow-xl'
          )}
        >
          {/* Gradient Background */}
          {isClaimable && (
            <div
              className={cn(
                'absolute inset-0 bg-gradient-to-br opacity-5',
                getBonusColor(bonus.type)
              )}
            />
          )}

          <CardContent className="relative pt-6">
            <div className="flex items-start justify-between">
              {/* Icon */}
              <div
                className={cn(
                  'flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br text-white',
                  getBonusColor(bonus.type)
                )}
              >
                {getBonusIcon(bonus.type)}
              </div>

              {/* Status Badge */}
              {isClaimed && (
                <Badge variant="success" className="gap-1">
                  <Check className="h-3 w-3" />
                  Claimed
                </Badge>
              )}
              {isPending && (
                <Badge variant="warning" className="gap-1">
                  <Clock className="h-3 w-3" />
                  Pending
                </Badge>
              )}
              {isClaimable && (
                <Badge variant="default" className="gap-1 animate-pulse">
                  <Star className="h-3 w-3" />
                  Claimable
                </Badge>
              )}
            </div>

            {/* Content */}
            <div className="mt-4 space-y-2">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">{bonus.title}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{bonus.description}</p>
                </div>
              </div>

              {/* Amount */}
              <div className="flex items-baseline gap-1">
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 200, delay: index * 0.05 + 0.2 }}
                  className="text-3xl font-bold text-primary"
                >
                  {formatCurrency(bonus.amount)}
                </motion.span>
                {isClaimable && (
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <Star className="h-5 w-5 fill-amber-400 text-amber-400" />
                  </motion.div>
                )}
              </div>

              {/* Metadata */}
              {bonus.metadata && (
                <div className="space-y-1 text-sm text-muted-foreground">
                  {bonus.metadata.depositAmount && (
                    <p>• Deposit: {formatCurrency(bonus.metadata.depositAmount)}</p>
                  )}
                  {bonus.metadata.referralLevel && (
                    <p>• Level {bonus.metadata.referralLevel} Referral</p>
                  )}
                  {bonus.metadata.oldRank && bonus.metadata.newRank && (
                    <p>
                      • Rank Up: {bonus.metadata.oldRank} → {bonus.metadata.newRank}
                    </p>
                  )}
                  {bonus.metadata.poolAmount && (
                    <p>• Pool Share: {formatCurrency(bonus.metadata.poolAmount)}</p>
                  )}
                </div>
              )}

              {/* Footer */}
              <div className="flex items-center justify-between pt-3 border-t">
                <p className="text-xs text-muted-foreground">
                  {isClaimed && bonus.claimedAt
                    ? `Claimed ${format(new Date(bonus.claimedAt), 'MMM dd, yyyy')}`
                    : `Issued ${format(new Date(bonus.createdAt), 'MMM dd, yyyy')}`}
                </p>

                {isClaimable && (
                  <Button
                    onClick={() => handleClaimBonus(bonus.id)}
                    disabled={isClaiming}
                    className="gap-2"
                  >
                    {isClaiming ? (
                      <>
                        <Clock className="h-4 w-4 animate-spin" />
                        Claiming...
                      </>
                    ) : (
                      <>
                        <Star className="h-4 w-4" />
                        Claim Now
                      </>
                    )}
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Confetti */}
      {showConfetti && (
        <Confetti
          width={window.innerWidth}
          height={window.innerHeight}
          recycle={false}
          numberOfPieces={500}
        />
      )}

      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Bonuses & Rewards</h1>
        <p className="text-muted-foreground mt-2">
          Claim your bonuses and track your rewards
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Earned</p>
                  <p className="text-3xl font-bold text-primary">{formatCurrency(stats.totalEarned)}</p>
                </div>
                <Gift className="h-10 w-10 text-primary" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <Card className="border-amber-500/20 bg-gradient-to-br from-amber-500/5 to-amber-500/10">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Claimable</p>
                  <p className="text-3xl font-bold text-amber-600">{formatCurrency(stats.totalPending)}</p>
                  <p className="text-xs text-muted-foreground mt-1">{stats.claimableCount} bonuses</p>
                </div>
                <Star className="h-10 w-10 text-amber-600" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">This Month</p>
                  <p className="text-3xl font-bold">{formatCurrency(stats.thisMonth)}</p>
                </div>
                <Calendar className="h-10 w-10 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
        >
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Bonuses</p>
                  <p className="text-3xl font-bold">{bonuses.length}</p>
                </div>
                <Gift className="h-10 w-10 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="claimable" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="claimable" className="gap-2">
            <Star className="h-4 w-4" />
            Claimable
            {claimableBonuses.length > 0 && (
              <Badge variant="secondary" className="ml-1">
                {claimableBonuses.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="claimed" className="gap-2">
            <Check className="h-4 w-4" />
            Claimed
          </TabsTrigger>
          <TabsTrigger value="pending" className="gap-2">
            <Clock className="h-4 w-4" />
            Pending
          </TabsTrigger>
        </TabsList>

        {/* Claimable Bonuses */}
        <TabsContent value="claimable" className="space-y-4">
          {isLoading ? (
            <div className="grid gap-4 md:grid-cols-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <Card key={i}>
                  <CardContent className="pt-6">
                    <div className="space-y-3">
                      <Skeleton className="h-14 w-14 rounded-full" />
                      <Skeleton className="h-6 w-3/4" />
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-10 w-32" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : claimableBonuses.length === 0 ? (
            <Card>
              <CardContent className="py-16 text-center">
                <Star className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-4 text-lg font-semibold">No bonuses to claim</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Keep earning to unlock more bonuses and rewards
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {claimableBonuses.map((bonus, index) => (
                <BonusCard key={bonus.id} bonus={bonus} index={index} />
              ))}
            </div>
          )}
        </TabsContent>

        {/* Claimed Bonuses */}
        <TabsContent value="claimed" className="space-y-4">
          {isLoading ? (
            <div className="grid gap-4 md:grid-cols-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <Card key={i}>
                  <CardContent className="pt-6">
                    <div className="space-y-3">
                      <Skeleton className="h-14 w-14 rounded-full" />
                      <Skeleton className="h-6 w-3/4" />
                      <Skeleton className="h-4 w-full" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : claimedBonuses.length === 0 ? (
            <Card>
              <CardContent className="py-16 text-center">
                <Check className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-4 text-lg font-semibold">No claimed bonuses</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Your claimed bonuses will appear here
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {claimedBonuses.map((bonus, index) => (
                <BonusCard key={bonus.id} bonus={bonus} index={index} />
              ))}
            </div>
          )}
        </TabsContent>

        {/* Pending Bonuses */}
        <TabsContent value="pending" className="space-y-4">
          {isLoading ? (
            <div className="grid gap-4 md:grid-cols-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <Card key={i}>
                  <CardContent className="pt-6">
                    <div className="space-y-3">
                      <Skeleton className="h-14 w-14 rounded-full" />
                      <Skeleton className="h-6 w-3/4" />
                      <Skeleton className="h-4 w-full" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : pendingBonuses.length === 0 ? (
            <Card>
              <CardContent className="py-16 text-center">
                <Clock className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-4 text-lg font-semibold">No pending bonuses</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Your pending bonuses will appear here
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {pendingBonuses.map((bonus, index) => (
                <BonusCard key={bonus.id} bonus={bonus} index={index} />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
