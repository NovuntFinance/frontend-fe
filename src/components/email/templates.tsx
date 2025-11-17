import React from 'react';
import Image from 'next/image';
import styles from '@/styles/email-template.module.css';

export function EmailTemplate({ children, preview }: { children: React.ReactNode; preview?: string }) {
  return (
    <html>
      {/* eslint-disable-next-line @next/next/no-head-element */}
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta httpEquiv="Content-Type" content="text/html; charset=UTF-8" />
        <title>Novunt</title>
        {preview && (
          <div className={styles.preview}>
            {preview}
          </div>
        )}
      </head>
      <body className={styles.body}>
        {/* Background Pattern */}
        <table role="presentation" className={styles.mainTable}>
          <tr>
            <td align="center" className={styles.mainTableCell}>
              <table role="presentation" className={styles.contentTable}>
                {/* Premium Header with Gradient */}
                <tr>
                  <td className={styles.logoCell}>
                    <Image 
                      src="https://novunt.com/icons/novunt.png" 
                      alt="Novunt Logo" 
                      width={48} 
                      height={48} 
                      className={styles.logo}
                      priority
                    />
                    <p className={styles.tagline}>
                      No Limits to Value, Net Worth & Growth
                    </p>
                  </td>
                </tr>

                {/* Content */}
                <tr>
                  <td className={styles.contentCell}>
                    {children}
                  </td>
                </tr>

                {/* Premium Footer */}
                <tr>
                  <td className={styles.footerCell}>
                    <table className={styles.footerTable}>
                      <tr>
                        <td align="center">
                          <div className={styles.linksContainer}>
                            <a href="https://novunt.com" className={styles.link}>
                              Dashboard
                            </a>
                            <span className={styles.separator}>•</span>
                            <a href="https://t.me/NovuntAssistantBot" className={styles.link}>
                              Support
                            </a>
                            <span className={styles.separator}>•</span>
                            <a href="https://novunt.com/#learn" className={styles.link}>
                              Learn
                            </a>
                          </div>
                        </td>
                      </tr>
                    </table>
                    <p className={styles.footerText}>
                      © 2025 Novunt. All rights reserved.<br />
                      Building financial freedom, one goal at a time.
                    </p>
                  </td>
                </tr>
              </table>
              
              {/* Unsubscribe - Outside main container */}
              <p className={styles.unsubscribeText}>
                This email was sent to you because you have a Novunt account.
              </p>
            </td>
          </tr>
        </table>
      </body>
    </html>
  );
}

/**
 * Email Verification Template - First touchpoint, sets the emotional tone
 */
export function VerificationEmail({ 
  name, 
  verificationCode 
}: { 
  name: string; 
  verificationCode: string;
}) {
  return (
    <EmailTemplate preview="Your journey to financial freedom starts here ✨">
      {/* Warm, personal greeting */}
      <h1 style={{ 
        fontSize: '28px', 
        fontWeight: '700', 
        background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        margin: '0 0 8px',
        lineHeight: '1.3',
      }}>
        Welcome, {name} 🌟
      </h1>

      <p style={{ 
        fontSize: '15px', 
        color: '#6b7280', 
        margin: '0 0 32px',
        fontStyle: 'italic',
      }}>
        You&apos;re one step away from joining thousands building real wealth
      </p>
      
      <p style={{ 
        fontSize: '16px', 
        color: '#1f2937', 
        margin: '0 0 24px',
        lineHeight: '1.7',
      }}>
        Every significant journey begins with a single, intentional step. Today, you&apos;ve chosen to take control of your financial future. That takes courage, and we&apos;re honored to walk alongside you.
      </p>

      {/* Premium Verification Code Card */}
      <div style={{ 
        background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)',
        border: '2px solid #3b82f6',
        borderRadius: '16px',
        padding: '32px 24px',
        textAlign: 'center',
        margin: '32px 0',
        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
      }}>
        <div style={{
          display: 'inline-block',
          backgroundColor: '#1e3a8a',
          color: '#ffffff',
          fontSize: '11px',
          fontWeight: '600',
          letterSpacing: '1px',
          textTransform: 'uppercase',
          padding: '6px 16px',
          borderRadius: '20px',
          marginBottom: '16px',
        }}>
          Verification Code
        </div>
        
        <div style={{ 
          fontSize: '48px', 
          fontWeight: '800', 
          color: '#1e3a8a',
          letterSpacing: '12px',
          margin: '16px 0',
          fontFamily: 'Monaco, Consolas, monospace',
        }}>
          {verificationCode}
        </div>

        <p style={{ 
          fontSize: '13px', 
          color: '#64748b', 
          margin: '16px 0 0',
        }}>
          Expires in <span style={{ color: '#f59e0b', fontWeight: '600' }}>10 minutes</span>
        </p>
      </div>

      {/* What happens next - builds anticipation */}
      <div style={{
        backgroundColor: '#fefce8',
        borderLeft: '4px solid #f59e0b',
        borderRadius: '8px',
        padding: '20px 24px',
        margin: '32px 0',
      }}>
        <p style={{
          fontSize: '14px',
          fontWeight: '600',
          color: '#92400e',
          margin: '0 0 8px',
        }}>
          What happens after verification? ✨
        </p>
        <p style={{
          fontSize: '14px',
          color: '#78350f',
          margin: 0,
          lineHeight: '1.6',
        }}>
          You&apos;ll get instant access to your personal dashboard, unlock a <strong>10% welcome bonus</strong> on your first stake, and join a community that&apos;s already earned millions in returns.
        </p>
      </div>

      {/* CTA Button */}
      <div style={{ textAlign: 'center', margin: '32px 0 24px' }}>
        <a 
          href="https://novunt.com/verify-email" 
          style={{ 
            background: 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%)',
            color: '#ffffff',
            padding: '16px 48px',
            borderRadius: '50px',
            textDecoration: 'none',
            fontWeight: '700',
            fontSize: '16px',
            display: 'inline-block',
            boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
          }}
        >
          Verify My Account
        </a>
      </div>

      {/* Security note - calm and reassuring */}
      <p style={{ 
        fontSize: '13px', 
        color: '#9ca3af', 
        textAlign: 'center',
        margin: '24px 0 0',
        lineHeight: '1.6',
      }}>
        Didn&apos;t create an account? No worries—just ignore this email.<br />
        Your security is our priority. 🔒
      </p>
    </EmailTemplate>
  );
}

/**
 * Password Reset Template - Empathetic, secure, reassuring
 */
export function PasswordResetEmail({ 
  name, 
  resetLink 
}: { 
  name: string; 
  resetLink: string;
}) {
  return (
    <EmailTemplate preview="Let's get you back on track securely 🔐">
      <h1 style={{ 
        fontSize: '28px', 
        fontWeight: '700', 
        color: '#1e3a8a',
        margin: '0 0 8px',
        lineHeight: '1.3',
      }}>
        We&apos;ve got you covered, {name} �️
      </h1>

      <p style={{ 
        fontSize: '15px', 
        color: '#6b7280', 
        margin: '0 0 28px',
      }}>
        Forgot your password? It happens to everyone. Let&apos;s fix this together.
      </p>
      
      <p style={{ 
        fontSize: '16px', 
        color: '#1f2937', 
        margin: '0 0 28px',
        lineHeight: '1.7',
      }}>
        Your account security is important to us. We received a request to reset your password. If this was you, simply click the button below to create a new, secure password and get back to building your wealth.
      </p>

      {/* Premium CTA Card */}
      <div style={{
        background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)',
        borderRadius: '16px',
        padding: '32px 24px',
        textAlign: 'center',
        margin: '32px 0',
        border: '1px solid #3b82f6',
      }}>
        <p style={{
          fontSize: '14px',
          color: '#1e40af',
          margin: '0 0 20px',
          fontWeight: '500',
        }}>
          This secure link expires in <span style={{ fontWeight: '700', color: '#f59e0b' }}>1 hour</span>
        </p>

        <a 
          href={resetLink}
          style={{ 
            background: 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%)',
            color: '#ffffff',
            padding: '16px 48px',
            borderRadius: '50px',
            textDecoration: 'none',
            fontWeight: '700',
            fontSize: '16px',
            display: 'inline-block',
            boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
          }}
        >
          Reset My Password
        </a>

        <p style={{
          fontSize: '12px',
          color: '#64748b',
          margin: '20px 0 0',
        }}>
          Or copy this link: <span style={{ 
            display: 'block',
            marginTop: '8px',
            color: '#3b82f6',
            wordBreak: 'break-all',
            fontSize: '11px',
            fontFamily: 'Monaco, Consolas, monospace',
          }}>{resetLink}</span>
        </p>
      </div>

      {/* What happens next */}
      <div style={{
        backgroundColor: '#f0fdf4',
        borderLeft: '4px solid #10b981',
        borderRadius: '8px',
        padding: '20px 24px',
        margin: '28px 0',
      }}>
        <p style={{
          fontSize: '14px',
          fontWeight: '600',
          color: '#065f46',
          margin: '0 0 8px',
        }}>
          After you reset your password:
        </p>
        <p style={{
          fontSize: '14px',
          color: '#047857',
          margin: 0,
          lineHeight: '1.6',
        }}>
          You&apos;ll be securely logged back into your account with instant access to all your stakes, earnings, and goals. Your financial journey continues uninterrupted.
        </p>
      </div>

      {/* Security reassurance - warm but firm */}
      <div style={{
        backgroundColor: '#fef3c7',
        border: '1px solid #fbbf24',
        borderRadius: '12px',
        padding: '20px 24px',
        margin: '28px 0',
      }}>
        <p style={{
          fontSize: '14px',
          color: '#92400e',
          margin: 0,
          lineHeight: '1.7',
        }}>
          <strong style={{ display: 'block', marginBottom: '8px' }}>🔒 Your security matters</strong>
          If you didn&apos;t request this reset, your account is still secure. Simply ignore this email, or <a href="https://t.me/NovuntAssistantBot" style={{ color: '#1e3a8a', fontWeight: '600', textDecoration: 'none' }}>contact our support team</a> if something feels wrong.
        </p>
      </div>

      <p style={{ 
        fontSize: '13px', 
        color: '#9ca3af', 
        textAlign: 'center',
        margin: '32px 0 0',
        lineHeight: '1.6',
      }}>
        Need help? Our support team is here 24/7.<br />
        We&apos;re committed to your success. 💙
      </p>
    </EmailTemplate>
  );
}

/**
 * Welcome Email Template - The most inspiring email they'll receive
 * This is where we paint the vision and ignite the journey
 */
export function WelcomeEmail({ name }: { name: string }) {
  return (
    <EmailTemplate preview="Your financial freedom journey begins now 🚀">
      {/* Hero moment */}
      <div style={{
        textAlign: 'center',
        marginBottom: '32px',
      }}>
        <div style={{
          fontSize: '48px',
          marginBottom: '16px',
        }}>🎉</div>
        <h1 style={{ 
          fontSize: '32px', 
          fontWeight: '800', 
          background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 50%, #f59e0b 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          margin: '0 0 12px',
          lineHeight: '1.2',
        }}>
          Welcome to Novunt, {name}!
        </h1>
        <p style={{
          fontSize: '16px',
          color: '#6b7280',
          margin: 0,
          fontStyle: 'italic',
        }}>
          You&apos;re officially part of something extraordinary.
        </p>
      </div>

      {/* Personal message - emotional connection */}
      <p style={{ 
        fontSize: '17px', 
        color: '#1f2937', 
        margin: '0 0 24px',
        lineHeight: '1.8',
        textAlign: 'center',
        fontWeight: '500',
      }}>
        Today marks the beginning of a journey that thousands have already started—and are winning at. Welcome to a community where your financial goals aren&apos;t just dreams, they&apos;re <strong style={{ color: '#1e3a8a' }}>plans in motion</strong>.
      </p>

      {/* The vision - what's possible */}
      <div style={{
        background: 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%)',
        borderRadius: '16px',
        padding: '32px 28px',
        margin: '32px 0',
        color: '#ffffff',
        textAlign: 'center',
      }}>
        <p style={{
          fontSize: '14px',
          textTransform: 'uppercase',
          letterSpacing: '2px',
          margin: '0 0 12px',
          opacity: 0.9,
          fontWeight: '600',
        }}>Your Special Welcome Gift</p>
        <p style={{
          fontSize: '40px',
          fontWeight: '800',
          margin: '0 0 8px',
        }}>10% Bonus</p>
        <p style={{
          fontSize: '15px',
          margin: 0,
          opacity: 0.95,
          lineHeight: '1.6',
        }}>
          On your first stake—because we believe in rewarding bold moves. That&apos;s up to <strong>$10,000 extra</strong> working for you from day one.
        </p>
      </div>

      {/* What you can do now - actionable steps */}
      <div style={{ margin: '40px 0' }}>
        <p style={{
          fontSize: '18px',
          fontWeight: '700',
          color: '#1e3a8a',
          margin: '0 0 24px',
          textAlign: 'center',
        }}>
          Here&apos;s how to make your first move:
        </p>

        {/* Step 1 */}
        <div style={{ 
          display: 'table',
          width: '100%',
          marginBottom: '20px',
          backgroundColor: '#f0fdf4',
          borderRadius: '12px',
          padding: '20px',
          border: '1px solid #86efac',
        }}>
          <div style={{ display: 'table-cell', width: '50px', verticalAlign: 'top' }}>
            <div style={{
              backgroundColor: '#10b981',
              color: '#ffffff',
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '18px',
              fontWeight: '700',
            }}>1</div>
          </div>
          <div style={{ display: 'table-cell', verticalAlign: 'top' }}>
            <p style={{ 
              margin: '0 0 6px',
              fontSize: '16px',
              fontWeight: '600',
              color: '#065f46',
            }}>Set Your First Goal</p>
            <p style={{ 
              margin: 0,
              fontSize: '14px',
              color: '#047857',
              lineHeight: '1.6',
            }}>
              Maybe it&apos;s building an emergency fund, saving for a dream vacation, or achieving financial independence. Name it. Claim it.
            </p>
          </div>
        </div>

        {/* Step 2 */}
        <div style={{ 
          display: 'table',
          width: '100%',
          marginBottom: '20px',
          backgroundColor: '#eff6ff',
          borderRadius: '12px',
          padding: '20px',
          border: '1px solid #93c5fd',
        }}>
          <div style={{ display: 'table-cell', width: '50px', verticalAlign: 'top' }}>
            <div style={{
              backgroundColor: '#3b82f6',
              color: '#ffffff',
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '18px',
              fontWeight: '700',
            }}>2</div>
          </div>
          <div style={{ display: 'table-cell', verticalAlign: 'top' }}>
            <p style={{ 
              margin: '0 0 6px',
              fontSize: '16px',
              fontWeight: '600',
              color: '#1e40af',
            }}>Create Your First Stake</p>
            <p style={{ 
              margin: 0,
              fontSize: '14px',
              color: '#1e40af',
              lineHeight: '1.6',
            }}>
              Start with any amount from $1,000. Watch it work for you daily, earning up to <strong>200% returns</strong>. Your 10% bonus is waiting.
            </p>
          </div>
        </div>

        {/* Step 3 */}
        <div style={{ 
          display: 'table',
          width: '100%',
          backgroundColor: '#fffbeb',
          borderRadius: '12px',
          padding: '20px',
          border: '1px solid #fcd34d',
        }}>
          <div style={{ display: 'table-cell', width: '50px', verticalAlign: 'top' }}>
            <div style={{
              backgroundColor: '#f59e0b',
              color: '#ffffff',
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '18px',
              fontWeight: '700',
            }}>3</div>
          </div>
          <div style={{ display: 'table-cell', verticalAlign: 'top' }}>
            <p style={{ 
              margin: '0 0 6px',
              fontSize: '16px',
              fontWeight: '600',
              color: '#92400e',
            }}>Track Your Progress</p>
            <p style={{ 
              margin: 0,
              fontSize: '14px',
              color: '#92400e',
              lineHeight: '1.6',
            }}>
              Watch your wealth grow in real-time. Earn NXP points, unlock Premium Pools, and become part of the Novunt Legacy.
            </p>
          </div>
        </div>
      </div>

      {/* CTA - compelling and action-oriented */}
      <div style={{
        textAlign: 'center',
        margin: '40px 0',
      }}>
        <a 
          href="https://novunt.com/dashboard"
          style={{ 
            background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
            color: '#1e3a8a',
            padding: '18px 56px',
            borderRadius: '50px',
            textDecoration: 'none',
            fontWeight: '800',
            fontSize: '17px',
            display: 'inline-block',
            boxShadow: '0 10px 20px -5px rgba(245, 158, 11, 0.4)',
            textTransform: 'uppercase',
            letterSpacing: '1px',
          }}
        >
          Start Building Wealth Now
        </a>
      </div>

      {/* Community aspect - you're not alone */}
      <div style={{
        backgroundColor: '#fef3c7',
        borderRadius: '12px',
        padding: '24px',
        margin: '32px 0',
        textAlign: 'center',
      }}>
        <p style={{
          fontSize: '15px',
          color: '#92400e',
          margin: '0 0 12px',
          lineHeight: '1.7',
        }}>
          <strong style={{ fontSize: '16px' }}>💡 You&apos;re joining 10,000+ stakeholders</strong><br />
          who have already earned millions in returns through Novunt. Your success story starts today.
        </p>
      </div>

      {/* Closing - inspirational */}
      <p style={{ 
        fontSize: '16px', 
        color: '#1f2937', 
        textAlign: 'center',
        margin: '32px 0 16px',
        lineHeight: '1.8',
        fontStyle: 'italic',
      }}>
        &quot;The best time to plant a tree was 20 years ago.<br />The second best time is now.&quot;
        The second best time is <strong style={{ color: '#1e3a8a' }}>right now</strong>.&quot;
      </p>

      <p style={{ 
        fontSize: '14px', 
        color: '#6b7280', 
        textAlign: 'center',
        margin: 0,
      }}>
        Welcome to Novunt. Let&apos;s build something remarkable. 🚀
      </p>
    </EmailTemplate>
  );
}

/**
 * Transaction Notification Email - Celebrating every financial milestone
 * Each transaction type gets unique messaging that connects to their goals
 */
export function TransactionEmail({ 
  name, 
  transactionType, 
  amount, 
  status,
  date 
}: { 
  name: string; 
  transactionType: 'deposit' | 'withdrawal' | 'stake' | 'reward';
  amount: string;
  status: 'success' | 'pending' | 'failed';
  date: string;
}) {
  // Unique messaging for each transaction type
  const typeConfig = {
    deposit: {
      emoji: '🚀',
      title: 'Your Capital is Ready',
      subtitle: 'The fuel for your financial engine',
      message: 'Every great journey needs a starting point. You&apos;ve just taken the decisive step of funding your future. This isn&apos;t just money in an account—it&apos;s potential waiting to multiply.',
      gradient: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
      bgColor: '#f0fdf4',
      borderColor: '#86efac',
      action: 'Start Staking',
      actionUrl: 'https://novunt.com/dashboard/stakes/new',
    },
    withdrawal: {
      emoji: '💰',
      title: 'Funds On Their Way',
      subtitle: 'Enjoying the fruits of your patience',
      message: 'This is what it&apos;s all about—turning goals into reality. Whether this withdrawal marks a milestone achieved or part of a bigger plan, you&apos;ve earned this moment.',
      gradient: 'linear-gradient(135deg, #3b82f6 0%, #1e40af 100%)',
      bgColor: '#eff6ff',
      borderColor: '#93c5fd',
      action: 'View Wallet',
      actionUrl: 'https://novunt.com/dashboard/wallets',
    },
    stake: {
      emoji: '🎯',
      title: 'Your Stake is Active',
      subtitle: 'Another step toward your goal',
      message: 'You&apos;ve committed capital to a goal that matters. From this moment, your money starts working around the clock—earning weekly returns while you focus on what matters most in life.',
      gradient: 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)',
      bgColor: '#faf5ff',
      borderColor: '#d8b4fe',
      action: 'Track Progress',
      actionUrl: 'https://novunt.com/dashboard/stakes',
    },
    reward: {
      emoji: '🎁',
      title: 'Reward Unlocked!',
      subtitle: 'Your strategy is paying off',
      message: 'Success leaves clues, and you&apos;re finding them. This reward—whether from referrals, performance pools, or bonuses—proves that smart financial decisions compound in unexpected ways.',
      gradient: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
      bgColor: '#fffbeb',
      borderColor: '#fcd34d',
      action: 'See Rewards',
      actionUrl: 'https://novunt.com/dashboard',
    },
  };

  const config = typeConfig[transactionType];

  const statusConfig = {
    success: {
      color: '#10b981',
      bgColor: '#f0fdf4',
      label: 'Completed',
      message: 'Everything went smoothly.',
    },
    pending: {
      color: '#f59e0b',
      bgColor: '#fffbeb',
      label: 'Processing',
      message: 'Your transaction is being processed securely.',
    },
    failed: {
      color: '#ef4444',
      bgColor: '#fef2f2',
      label: 'Action Needed',
      message: 'Something went wrong. Our team is here to help.',
    },
  };

  const statusInfo = statusConfig[status];

  return (
    <EmailTemplate preview={`${transactionType} ${status} - ${amount}`}>
      {/* Hero Section */}
      <div style={{
        textAlign: 'center',
        marginBottom: '32px',
      }}>
        <div style={{
          fontSize: '56px',
          marginBottom: '16px',
          lineHeight: '1',
        }}>{config.emoji}</div>
        
        <h1 style={{ 
          fontSize: '28px', 
          fontWeight: '800', 
          background: config.gradient,
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          margin: '0 0 8px',
          lineHeight: '1.2',
        }}>
          {config.title}
        </h1>
        
        <p style={{
          fontSize: '15px',
          color: '#6b7280',
          margin: 0,
          fontStyle: 'italic',
        }}>
          {config.subtitle}
        </p>
      </div>

      {/* Personal Message */}
      <p style={{ 
        fontSize: '16px', 
        color: '#1f2937', 
        margin: '0 0 32px',
        lineHeight: '1.8',
      }}>
        Hey {name}, 👋<br /><br />
        {config.message}
      </p>

      {/* Transaction Details Card */}
      <div style={{
        background: config.gradient,
        borderRadius: '16px',
        padding: '32px 28px',
        margin: '32px 0',
        color: '#ffffff',
      }}>
        <p style={{
          fontSize: '13px',
          textTransform: 'uppercase',
          letterSpacing: '2px',
          margin: '0 0 20px',
          opacity: 0.9,
          fontWeight: '600',
          textAlign: 'center',
        }}>Transaction Details</p>

        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <tr>
            <td style={{ 
              padding: '12px 0',
              fontSize: '14px',
              opacity: 0.9,
            }}>Amount:</td>
            <td style={{ 
              padding: '12px 0',
              fontSize: '32px',
              fontWeight: '800',
              textAlign: 'right',
            }}>{amount}</td>
          </tr>
          <tr>
            <td style={{ 
              padding: '12px 0',
              fontSize: '14px',
              opacity: 0.9,
            }}>Type:</td>
            <td style={{ 
              padding: '12px 0',
              fontSize: '16px',
              fontWeight: '600',
              textAlign: 'right',
              textTransform: 'capitalize',
            }}>{transactionType}</td>
          </tr>
          <tr>
            <td style={{ 
              padding: '12px 0',
              fontSize: '14px',
              opacity: 0.9,
            }}>Status:</td>
            <td style={{ 
              padding: '12px 0',
              textAlign: 'right',
            }}>
              <span style={{
                backgroundColor: 'rgba(255, 255, 255, 0.3)',
                padding: '6px 16px',
                borderRadius: '20px',
                fontSize: '13px',
                fontWeight: '700',
                textTransform: 'uppercase',
                letterSpacing: '1px',
              }}>
                {statusInfo.label}
              </span>
            </td>
          </tr>
          <tr>
            <td style={{ 
              padding: '12px 0',
              fontSize: '14px',
              opacity: 0.9,
            }}>Date:</td>
            <td style={{ 
              padding: '12px 0',
              fontSize: '14px',
              textAlign: 'right',
            }}>{date}</td>
          </tr>
        </table>
      </div>

      {/* Status-specific message */}
      <div style={{
        backgroundColor: statusInfo.bgColor,
        borderLeft: `4px solid ${statusInfo.color}`,
        borderRadius: '8px',
        padding: '20px 24px',
        margin: '28px 0',
      }}>
        <p style={{
          fontSize: '14px',
          fontWeight: '600',
          color: '#1f2937',
          margin: '0 0 8px',
        }}>
          {statusInfo.label}
        </p>
        <p style={{
          fontSize: '14px',
          color: '#4b5563',
          margin: 0,
        }}>
          {statusInfo.message}
        </p>
      </div>

      {/* Action Button - only for successful transactions */}
      {status === 'success' && (
        <div style={{
          textAlign: 'center',
          margin: '32px 0',
        }}>
          <a 
            href={config.actionUrl}
            style={{ 
              background: config.gradient,
              color: '#ffffff',
              padding: '16px 48px',
              borderRadius: '50px',
              textDecoration: 'none',
              fontWeight: '700',
              fontSize: '16px',
              display: 'inline-block',
              boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.2)',
            }}
          >
            {config.action}
          </a>
        </div>
      )}

      {/* Support for failed transactions */}
      {status === 'failed' && (
        <div style={{
          backgroundColor: '#fef2f2',
          border: '1px solid #fecaca',
          borderRadius: '12px',
          padding: '24px',
          margin: '28px 0',
          textAlign: 'center',
        }}>
          <p style={{
            fontSize: '14px',
            color: '#991b1b',
            margin: '0 0 16px',
            lineHeight: '1.6',
          }}>
            Don&apos;t worry—these things happen. Our support team is standing by to help you resolve this quickly.
          </p>
          <a 
            href="https://t.me/NovuntAssistantBot"
            style={{ 
              display: 'inline-block',
              backgroundColor: '#ef4444',
              color: '#ffffff',
              padding: '12px 32px',
              borderRadius: '50px',
              textDecoration: 'none',
              fontWeight: '600',
              fontSize: '14px',
            }}
          >
            Contact Support
          </a>
        </div>
      )}

      {/* Motivational close */}
      {status === 'success' && (
        <p style={{ 
          fontSize: '15px', 
          color: '#6b7280', 
          textAlign: 'center',
          margin: '32px 0 0',
          lineHeight: '1.7',
          fontStyle: 'italic',
        }}>
          Every transaction brings you closer to your goals.<br />
          Keep going—you&apos;re building something real. 💪
        </p>
      )}
    </EmailTemplate>
  );
}
