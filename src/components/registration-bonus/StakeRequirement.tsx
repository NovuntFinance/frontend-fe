/**
 * Stake Requirement Component - Gold Design
 * Modern card with CTA button
 */

'use client';

import React from 'react';
import { TrendingUp, CheckCircle2, ArrowRight } from 'lucide-react';
import { StakeRequirementProps } from '@/types/registrationBonus';
import { formatCurrency } from '@/lib/utils';
import { useUIStore } from '@/store/uiStore';

/**
 * Stake Requirement Component
 * Shows first stake requirement with navigation CTA
 */
export function StakeRequirement({
  stakeData,
  onComplete,
}: StakeRequirementProps) {
  const { openModal } = useUIStore();
  const isComplete = stakeData.completed;

  const handleStakeClick = () => {
    // Open create stake modal
    openModal('create-stake');
  };

  if (isComplete) {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          padding: '12px',
          borderRadius: '12px',
          background: 'var(--neu-bg)',
          boxShadow: 'var(--neu-shadow-inset)',
          border: '2px solid rgba(34, 197, 94, 0.2)',
          transition: 'all 0.3s ease',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            gap: '8px',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '8px',
              flex: 1,
              minWidth: 0,
            }}
          >
            <div
              style={{
                borderRadius: '10px',
                background: 'rgba(34, 197, 94, 0.1)',
                padding: '8px',
                border: '1px solid rgba(34, 197, 94, 0.2)',
                flexShrink: 0,
              }}
            >
              <CheckCircle2
                className="h-5 w-5"
                style={{ color: 'rgb(34, 197, 94)' }}
              />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <h3
                style={{
                  fontSize: '0.8125rem',
                  fontWeight: 700,
                  marginBottom: '2px',
                  color: 'var(--neu-text-primary)',
                  lineHeight: '1.2',
                  wordBreak: 'break-word',
                }}
              >
                First Stake
              </h3>
              {stakeData.amount && (
                <p
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '3px',
                    fontSize: '0.6875rem',
                    fontWeight: 500,
                    color: 'rgb(34, 197, 94)',
                    lineHeight: '1.3',
                    wordBreak: 'break-word',
                  }}
                >
                  <CheckCircle2 className="h-3 w-3" style={{ flexShrink: 0 }} />
                  Staked {formatCurrency(stakeData.amount)}
                </p>
              )}
            </div>
          </div>
          <CheckCircle2
            className="h-4 w-4"
            style={{ flexShrink: 0, color: 'rgb(34, 197, 94)' }}
          />
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        borderRadius: '12px',
        background: 'var(--neu-bg)',
        boxShadow: 'var(--neu-shadow-inset)',
        transition: 'all 0.3s ease',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          position: 'relative',
          zIndex: 10,
          display: 'flex',
          flexDirection: 'column',
          flex: 1,
          padding: '12px',
          gap: '10px',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: '8px',
          }}
        >
          <div
            style={{
              borderRadius: '10px',
              background: 'var(--neu-bg)',
              boxShadow: 'var(--neu-shadow-inset)',
              padding: '8px',
              transition: 'all 0.3s ease',
              flexShrink: 0,
            }}
          >
            <TrendingUp
              className="h-5 w-5"
              style={{ color: 'var(--neu-accent)' }}
            />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <h3
              style={{
                fontSize: '0.8125rem',
                fontWeight: 700,
                marginBottom: '2px',
                color: 'var(--neu-text-primary)',
                lineHeight: '1.2',
                wordBreak: 'break-word',
              }}
            >
              First Stake
            </h3>
            <p
              style={{
                fontSize: '0.6875rem',
                color: 'var(--neu-text-secondary)',
                lineHeight: '1.3',
                wordBreak: 'break-word',
              }}
            >
              Stake ≥ 20 USDT
            </p>
          </div>
        </div>

        <div style={{ marginTop: 'auto' }}>
          <button
            onClick={handleStakeClick}
            style={{
              width: '100%',
              padding: '8px 12px',
              borderRadius: '10px',
              border: 'none',
              background: 'var(--neu-accent)',
              boxShadow: '0 2px 8px rgba(0, 155, 242, 0.3)',
              color: '#FFFFFF',
              fontSize: '0.75rem',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-1px)';
              e.currentTarget.style.boxShadow =
                '0 4px 12px rgba(0, 155, 242, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow =
                '0 2px 8px rgba(0, 155, 242, 0.3)';
            }}
            onMouseDown={(e) => {
              e.currentTarget.style.transform = 'scale(0.95)';
            }}
            onMouseUp={(e) => {
              e.currentTarget.style.transform = 'translateY(-1px)';
            }}
          >
            Get Started
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
