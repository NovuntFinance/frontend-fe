'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { useUpdateProfilePicture } from '@/lib/mutations/profileMutations';

interface AvatarSelectorProps {
  currentAvatar?: string;
  userId: string;
  userName?: string;
  onAvatarSelected?: (url: string) => void;
}

type AvatarStyle = {
  id: string;
  name: string;
  description: string;
  color: string;
};

// Curated happy avatar styles - only the best ones!
const AVATAR_STYLES: AvatarStyle[] = [
  {
    id: 'adventurer',
    name: 'Adventurer',
    description: 'Cheerful faces',
    color: 'from-blue-500 to-cyan-500',
  },
  {
    id: 'bottts',
    name: 'Robot',
    description: 'Friendly bots',
    color: 'from-purple-500 to-pink-500',
  },
  {
    id: 'big-smile',
    name: 'Big Smile',
    description: 'Always smiling',
    color: 'from-green-500 to-emerald-500',
  },
];

// Generate avatar URL with happy mood parameters
const generateAvatarUrl = (style: string, seed: string) => {
  // Add mood parameters to ensure happy/friendly avatars
  const moodParams = {
    'adventurer': 'mood=happy',
    'big-smile': 'mood=happy',
    'bottts': 'eyes=happy',
  };
  
  const moodParam = moodParams[style as keyof typeof moodParams] || '';
  const separator = moodParam ? '&' : '';
  
  return `https://api.dicebear.com/7.x/${style}/svg?seed=${seed}${separator}${moodParam}`;
};

/**
 * Generate a consistent random default avatar for a user
 * Uses user's email and ID to ensure the same avatar is generated each time
 * Randomly selects one of the 3 avatar styles based on the user's data
 * @param userId - User ID
 * @param email - User email
 * @returns Consistent avatar URL
 */
export const generateDefaultAvatar = (userId: string, email: string): string => {
  const seed = `${email}-${userId}`;
  
  // Generate a number from the seed to pick a style
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = seed.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  // Pick one of the 3 styles based on hash
  const styleIndex = Math.abs(hash) % AVATAR_STYLES.length;
  const styleId = AVATAR_STYLES[styleIndex].id;
  
  return generateAvatarUrl(styleId, seed);
};

export function AvatarSelector({ currentAvatar, userId, userName = 'User', onAvatarSelected }: AvatarSelectorProps) {
  const [selectedStyle, setSelectedStyle] = useState<string>('adventurer');
  const [selectedAvatar, setSelectedAvatar] = useState<string | null>(null);
  const [hoveredAvatar, setHoveredAvatar] = useState<string | null>(null);
  
  const updateMutation = useUpdateProfilePicture(userId);

  // Generate 12 unique seeds for the selected style
  const variants = Array.from({ length: 12 }, (_, i) => {
    const seed = `${userName}-${selectedStyle}-${i}`;
    return {
      id: seed,
      url: generateAvatarUrl(selectedStyle, seed),
    };
  });

  const handleSelectAvatar = (url: string) => {
    setSelectedAvatar(url);
  };

  const handleSaveAvatar = async () => {
    if (!selectedAvatar) {
      toast.error('Please select an avatar');
      return;
    }

    try {
      await updateMutation.mutateAsync({ profilePicture: selectedAvatar });
      
      toast.success('Avatar updated!', {
        description: 'Your profile picture has been changed',
      });

      onAvatarSelected?.(selectedAvatar);
    } catch (error) {
      toast.error('Failed to update avatar', {
        description: error instanceof Error ? error.message : 'Please try again',
      });
    }
  };

  const handleRandomize = () => {
    const randomVariant = variants[Math.floor(Math.random() * variants.length)];
    setSelectedAvatar(randomVariant.url);
    toast.success('Random avatar selected!', {
      description: 'Click Save to apply',
    });
  };

  return (
    <div className="space-y-6">
      {/* Current Selection Preview */}
      <Card className="p-6 bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
        <div className="flex items-center gap-4">
          <div className="relative w-20 h-20 rounded-full overflow-hidden ring-4 ring-primary/30 bg-gradient-to-br from-primary/20 to-primary/40 flex items-center justify-center">
            {selectedAvatar || currentAvatar ? (
            <img
                src={selectedAvatar || currentAvatar || ''}
              alt="Avatar preview"
              className="w-full h-full object-cover"
            />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-primary font-bold text-2xl">
                {userName.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-lg">
              {selectedAvatar ? 'New Avatar Selected' : 'Current Avatar'}
            </h3>
            <p className="text-sm text-muted-foreground">
              {selectedAvatar ? 'Click Save to apply' : 'Choose a new avatar below'}
            </p>
          </div>
          {selectedAvatar && (
            <Button
              onClick={handleSaveAvatar}
              disabled={updateMutation.isPending}
              className="bg-gradient-to-r from-primary to-primary/80 hover:opacity-90 text-white shadow-lg"
            >
              {updateMutation.isPending ? 'Saving...' : 'Save Avatar'}
            </Button>
          )}
        </div>
      </Card>

      {/* Style Selector */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h4 className="font-semibold">Choose Style</h4>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRandomize}
            className="gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Random
          </Button>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {AVATAR_STYLES.map((style) => (
            <motion.div
              key={style.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Card
                className={`
                  p-4 cursor-pointer transition-all
                  ${selectedStyle === style.id
                    ? 'ring-2 ring-primary border-primary'
                    : 'hover:border-primary/50'
                  }
                `}
                onClick={() => {
                  setSelectedStyle(style.id);
                  setSelectedAvatar(null); // Reset selection when changing style
                }}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${style.color} flex items-center justify-center`}>
                    {selectedStyle === style.id && (
                      <Check className="h-6 w-6 text-white" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold truncate">{style.name}</p>
                    <p className="text-xs text-muted-foreground truncate">
                      {style.description}
                    </p>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Avatar Grid */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h4 className="font-semibold">Choose Avatar</h4>
          <Badge variant="outline">{variants.length} options</Badge>
        </div>
        <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          <AnimatePresence mode="popLayout">
            {variants.map((variant, index) => (
              <motion.div
                key={variant.id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ delay: index * 0.03 }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <div
                  className={`
                    relative w-full aspect-square rounded-xl overflow-hidden cursor-pointer
                    transition-all
                    ${selectedAvatar === variant.url
                      ? 'ring-4 ring-primary shadow-lg'
                      : hoveredAvatar === variant.url
                      ? 'ring-2 ring-primary/50'
                      : 'ring-1 ring-border'
                    }
                  `}
                  onClick={() => handleSelectAvatar(variant.url)}
                  onMouseEnter={() => setHoveredAvatar(variant.url)}
                  onMouseLeave={() => setHoveredAvatar(null)}
                >
                  <img
                    src={variant.url}
                    alt={`Avatar ${index + 1}`}
                    className="w-full h-full object-cover bg-gradient-to-br from-muted to-muted/50"
                  />
                  {selectedAvatar === variant.url && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="absolute inset-0 bg-primary/20 flex items-center justify-center"
                    >
                      <div className="bg-primary rounded-full p-1">
                        <Check className="h-4 w-4 text-white" />
                      </div>
                    </motion.div>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>

      {/* Info */}
      <Card className="p-4 bg-muted/50 border-dashed">
        <p className="text-sm text-muted-foreground text-center">
          💡 <strong>Tip:</strong> Click any avatar to select, then click Save to apply. 
          Use the Random button for a surprise!
        </p>
      </Card>
    </div>
  );
}

