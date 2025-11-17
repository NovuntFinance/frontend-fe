/**
 * Profile Requirement Component - Gold Design
 * Modern card with gold accents
 */

'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { User, CheckCircle2, Circle } from 'lucide-react';
import { ProfileRequirementProps, ProfileFieldName } from '@/types/registrationBonus';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

/**
 * Profile Requirement Component
 * Shows profile completion status in elegant card
 */
export function ProfileRequirement({
  profileData,
  onComplete,
}: ProfileRequirementProps) {
  // Ensure we have a valid completion percentage (fallback to 0)
  const completionPercentage = typeof profileData.completionPercentage === 'number' 
    ? profileData.completionPercentage 
    : 0;
  const isComplete = completionPercentage === 100;
  
  // Debug logging in development
  if (process.env.NODE_ENV === 'development') {
    console.log('[ProfileRequirement] 🔍 Profile Debug:', {
      completionPercentage,
      rawCompletionPercentage: profileData.completionPercentage,
      details: profileData.details,
      isComplete,
    });
  }
  
  // Only show required fields: dateOfBirth, gender, profilePhoto, address
  const requiredFields: ProfileFieldName[] = ['dateOfBirth', 'gender', 'profilePhoto', 'address'];
  const filteredDetails = profileData.details.filter(field => 
    requiredFields.includes(field.fieldName)
  );

  const getFieldLabel = (fieldName: ProfileFieldName): string => {
    const labels: Record<ProfileFieldName, string> = {
      dateOfBirth: 'Date of Birth',
      gender: 'Gender',
      profilePhoto: 'Profile Photo',
      address: 'Address',
    };
    return labels[fieldName] || fieldName;
  };

  const handleFieldClick = () => {
    if (!isComplete) {
      // Dispatch custom event to open profile modal
      window.dispatchEvent(new CustomEvent('openProfileModal'));
    }
  };

  return (
    <Card
      className={cn(
        'relative overflow-hidden transition-all duration-300 border-2 cursor-pointer group h-full flex flex-col',
        isComplete
          ? 'border-green-500/30 bg-green-500/5 hover:border-green-500/50'
          : 'border-novunt-gold-500/30 bg-gradient-to-br from-novunt-gold-500/5 to-background hover:border-novunt-gold-500/50 hover:shadow-lg hover:shadow-novunt-gold-500/10'
      )}
      onClick={handleFieldClick}
    >
      {/* Gold shimmer effect when not complete */}
      {!isComplete && (
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-novunt-gold-500/10 to-transparent"
          animate={{
            x: ['-100%', '200%'],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            repeatDelay: 3,
          }}
        />
      )}

      <CardContent className="relative z-10 p-4 flex flex-col flex-1">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div
              className={cn(
                'p-2.5 rounded-lg border transition-all duration-300',
                isComplete
                  ? 'bg-green-500/20 border-green-500/30'
                  : 'bg-novunt-gold-500/20 border-novunt-gold-500/30 group-hover:bg-novunt-gold-500/30'
              )}
            >
              <User className={cn(
                'h-5 w-5 transition-colors',
                isComplete
                  ? 'text-green-600 dark:text-green-400'
                  : 'text-novunt-gold-600 dark:text-novunt-gold-500'
              )} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-foreground mb-0.5">
                Complete Profile
              </h3>
              {isComplete ? (
                <p className="text-xs text-green-600 dark:text-green-400 font-medium flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3" />
                  Auto-completed during registration
                </p>
              ) : (
                <p className="text-xs text-muted-foreground">
                  {completionPercentage}% complete
                </p>
              )}
            </div>
          </div>
          {isComplete && (
            <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400 shrink-0" />
          )}
        </div>

        {/* Profile Fields List - Only Required Fields */}
        <div className="space-y-2">
          {filteredDetails.map((field) => (
            <div
              key={field.fieldName}
              className={cn(
                'flex items-center gap-2 text-xs py-1',
                field.isCompleted ? 'text-muted-foreground' : 'text-foreground'
              )}
            >
              {field.isCompleted ? (
                <CheckCircle2 className="h-3.5 w-3.5 text-green-600 dark:text-green-400 shrink-0" />
              ) : (
                <Circle className="h-3.5 w-3.5 text-novunt-gold-500 shrink-0" />
              )}
              <span className="truncate">{getFieldLabel(field.fieldName)}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
