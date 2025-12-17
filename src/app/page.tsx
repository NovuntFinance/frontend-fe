'use client';

import React, { useRef, useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import Image from 'next/image';
import { motion, useScroll, useTransform } from 'framer-motion';
import {
  TrendingUp,
  Shield,
  CheckCircle2,
  ArrowRight,
  Star,
  Lock,
  Target,
  Award,
} from 'lucide-react';

// Dynamically import Typing component to avoid SSR issues
const Typing = dynamic(() => import('@/components/ui/typing'), { ssr: false });

function GradientBlob({ className = '' }: { className?: string }) {
  return (
    <div
      className={`pointer-events-none absolute rounded-full opacity-60 blur-3xl ${className}`}
    />
  );
}

function AnimatedNumber({
  value,
  suffix = '',
  prefix = '',
  duration = 2000,
}: {
  value: number;
  suffix?: string;
  prefix?: string;
  duration?: number;
}) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    let startTime: number;
    const endValue = value;

    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / duration, 1);
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      setDisplayValue(Math.floor(easeOutQuart * endValue));

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setDisplayValue(endValue);
      }
    };

    requestAnimationFrame(animate);
  }, [value, duration]);

  return (
    <span>
      {prefix}
      {displayValue.toLocaleString()}
      {suffix}
    </span>
  );
}

export default function LandingPage() {
  const [mounted, setMounted] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end start'],
  });

  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const y = useTransform(scrollYProgress, [0, 0.5], [0, -100]);

  useEffect(() => {
    setMounted(true);
  }, []);

  const features = [
    {
      icon: TrendingUp,
      title: 'Up to 200% ROS',
      description: 'Maximize returns with industry-leading staking rewards',
      gradient: 'from-emerald-500/20 to-green-500/10',
      border: 'border-emerald-500/30',
      iconColor: 'text-emerald-400',
    },
    {
      icon: Shield,
      title: 'Bank-Level Security',
      description: 'Your funds protected with enterprise-grade encryption',
      gradient: 'from-blue-500/20 to-cyan-500/10',
      border: 'border-blue-500/30',
      iconColor: 'text-blue-400',
    },
    {
      icon: Target,
      title: 'Goal-Based Staking',
      description: 'Set targets and track progress toward your financial goals',
      gradient: 'from-purple-500/20 to-pink-500/10',
      border: 'border-purple-500/30',
      iconColor: 'text-purple-400',
    },
    {
      icon: Award,
      title: 'Premium Rewards',
      description: 'Access exclusive pools and bonus opportunities',
      gradient: 'from-amber-500/20 to-orange-500/10',
      border: 'border-amber-500/30',
      iconColor: 'text-amber-400',
    },
  ];

  return (
    <main
      ref={containerRef}
      className="relative min-h-screen overflow-hidden bg-gradient-to-b from-slate-950 via-indigo-950 to-slate-950 text-white"
    >
      {/* Animated Background */}
      <div className="pointer-events-none fixed inset-0 -z-10">
        <GradientBlob className="top-[-20%] left-[-10%] h-[80vh] w-[80vw] animate-pulse bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500" />
        <GradientBlob className="top-[40%] right-[-10%] h-[60vh] w-[60vw] bg-gradient-to-tr from-cyan-400 via-blue-500 to-indigo-500" />
        <GradientBlob className="bottom-[-10%] left-[20%] h-[50vh] w-[50vw] bg-gradient-to-tr from-emerald-400 via-teal-500 to-cyan-500" />
      </div>

      {/* Navigation */}
      <motion.nav
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="relative z-50 mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 sm:py-6"
      >
        <Link href="/" className="group">
          <Image
            src="/icons/novunt.png"
            alt="Novunt"
            width={140}
            height={40}
            className="h-8 w-auto object-contain brightness-0 invert transition-transform group-hover:scale-105 sm:h-10"
            priority
          />
        </Link>
        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="text-sm font-medium text-white/80 transition-colors hover:text-white"
          >
            Sign In
          </Link>
          <Link
            href="/signup"
            className="rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-indigo-500/50 transition-all hover:scale-105 hover:shadow-xl hover:shadow-indigo-500/50 active:scale-95"
          >
            Get Started
          </Link>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <motion.section
        style={{ opacity, y }}
        className="relative z-10 mx-auto max-w-7xl px-4 pt-8 pb-12 sm:px-6 sm:pt-16 lg:pt-24"
      >
        <div className="mx-auto max-w-4xl text-center">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="mb-6 inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-4 py-1.5 backdrop-blur-sm"
          >
            <Star className="h-4 w-4 text-emerald-400" />
            <span className="text-sm font-medium text-emerald-300">
              Limited Time: 10% Bonus on First Stake
            </span>
          </motion.div>

          {/* Main Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mb-6 text-4xl leading-tight font-extrabold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl"
          >
            <div className="flex min-h-[3rem] flex-col items-center justify-center gap-2 sm:min-h-[4rem] md:min-h-[5rem] lg:min-h-[8rem]">
              <span className="block bg-gradient-to-r from-white via-indigo-100 to-purple-100 bg-clip-text text-transparent">
                Build Wealth
              </span>
              {mounted && (
                <div className="flex min-h-[2.5rem] items-center justify-center sm:min-h-[3rem] md:min-h-[4rem]">
                  <Typing
                    phrases={[
                      'Without Limits',
                      'With Confidence',
                      'For Your Future',
                      'For Success',
                    ]}
                    typingSpeed={50}
                    deleteSpeed={35}
                    pause={1500}
                    className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent"
                    cursor="▌"
                    emoji=""
                  />
                </div>
              )}
            </div>
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mb-8 text-lg leading-relaxed text-white/80 sm:text-xl md:text-2xl"
          >
            Stake USDT and earn up to{' '}
            <span className="font-bold text-emerald-400">200% ROS</span>. Join
            thousands earning weekly returns with{' '}
            <span className="font-semibold">Novunt</span>.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="mb-12 flex flex-col items-center justify-center gap-4 sm:flex-row"
          >
            <Link
              href="/signup"
              className="group relative inline-flex w-full items-center justify-center gap-2 overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 px-8 py-4 text-base font-bold text-white shadow-2xl shadow-purple-500/50 transition-all hover:scale-105 hover:shadow-purple-500/70 active:scale-95 sm:w-auto"
            >
              <span className="absolute inset-0 translate-x-[-100%] bg-gradient-to-r from-white/0 via-white/20 to-white/0 transition-transform duration-1000 group-hover:translate-x-[100%]" />
              <span className="relative z-10 flex items-center gap-2">
                Start Earning Now
                <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
              </span>
            </Link>
            <Link
              href="#features"
              className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-white/20 bg-white/5 px-8 py-4 text-base font-semibold text-white backdrop-blur-sm transition-all hover:scale-105 hover:bg-white/10 active:scale-95 sm:w-auto"
            >
              Learn More
            </Link>
          </motion.div>

          {/* Trust Indicators */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="grid grid-cols-2 gap-4 sm:grid-cols-4"
          >
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
              <div className="mb-1 text-2xl font-bold text-white sm:text-3xl">
                <AnimatedNumber value={5000} suffix="+" />
              </div>
              <div className="text-xs text-white/60 sm:text-sm">
                Active Users
              </div>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
              <div className="mb-1 text-2xl font-bold text-emerald-400 sm:text-3xl">
                <AnimatedNumber value={200} suffix="%" />
              </div>
              <div className="text-xs text-white/60 sm:text-sm">
                Max Returns
              </div>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
              <div className="mb-1 text-2xl font-bold text-white sm:text-3xl">
                $<AnimatedNumber value={1000000} suffix="+" />
              </div>
              <div className="text-xs text-white/60 sm:text-sm">
                Total Staked
              </div>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
              <div className="mb-1 text-2xl font-bold text-blue-400 sm:text-3xl">
                <AnimatedNumber value={99} suffix=".9%" />
              </div>
              <div className="text-xs text-white/60 sm:text-sm">Uptime</div>
            </div>
          </motion.div>
        </div>
      </motion.section>

      {/* Features Section */}
      <section
        id="features"
        className="relative z-10 mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:py-24"
      >
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-12 text-center"
        >
          <h2 className="mb-4 text-3xl font-bold sm:text-4xl md:text-5xl">
            Why Choose{' '}
            <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
              Novunt
            </span>
            ?
          </h2>
          <p className="mx-auto max-w-2xl text-lg text-white/70">
            Everything you need to grow your wealth with confidence
          </p>
        </motion.div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="group relative overflow-hidden rounded-3xl border backdrop-blur-xl transition-all hover:scale-105 hover:shadow-2xl"
                style={{
                  background:
                    'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
                  borderColor: feature.border.includes('emerald')
                    ? 'rgba(16, 185, 129, 0.3)'
                    : feature.border.includes('blue')
                      ? 'rgba(59, 130, 246, 0.3)'
                      : feature.border.includes('purple')
                        ? 'rgba(168, 85, 247, 0.3)'
                        : 'rgba(245, 158, 11, 0.3)',
                }}
              >
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-50 transition-opacity group-hover:opacity-70`}
                />
                <div className="relative p-6 sm:p-8">
                  <div
                    className={`mb-4 inline-flex rounded-2xl bg-white/10 p-3 backdrop-blur-sm ${feature.iconColor}`}
                  >
                    <Icon className="h-6 w-6 sm:h-8 sm:w-8" />
                  </div>
                  <h3 className="mb-2 text-xl font-bold text-white sm:text-2xl">
                    {feature.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-white/70 sm:text-base">
                    {feature.description}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* Premium Benefits Section */}
      <section className="relative z-10 mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:py-24">
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Bonus Card */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="relative overflow-hidden rounded-3xl border border-emerald-500/30 bg-gradient-to-br from-emerald-500/20 to-green-500/10 p-8 backdrop-blur-xl"
          >
            <div className="absolute top-4 right-4 animate-pulse rounded-full bg-emerald-500 px-3 py-1 text-xs font-bold text-white">
              LIMITED OFFER
            </div>
            <div className="relative">
              <div className="mb-4 text-5xl">🎁</div>
              <h3 className="mb-3 text-2xl font-bold text-white sm:text-3xl">
                Earn Up to 100,000 USDT Bonus
              </h3>
              <p className="mb-6 text-white/80">
                Get an instant 10% bonus on your first stake, with potential
                rewards up to 100,000 USDT. Start earning from day one with
                Novunt&apos;s welcome offer.
              </p>
              <Link
                href="/signup"
                className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-6 py-3 font-semibold text-white transition-all hover:scale-105 hover:bg-emerald-700 active:scale-95"
              >
                Claim Bonus Now
                <ArrowRight className="h-5 w-5" />
              </Link>
            </div>
          </motion.div>

          {/* Benefits List */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-4"
          >
            {[
              {
                icon: TrendingUp,
                title: 'Weekly ROS Payouts',
                description:
                  'Receive returns directly to your Earning Wallet every week',
              },
              {
                icon: Target,
                title: 'Goal-Based Staking',
                description:
                  'Set clear financial goals with progress tracking toward 200% returns',
              },
              {
                icon: Award,
                title: 'Performance & Premium Pools',
                description:
                  'Maximize earnings by participating in exclusive reward pools',
              },
              {
                icon: TrendingUp,
                title: 'NXP to NLP Conversion',
                description:
                  'Earn experience points and convert to legacy tokens for blockchain launch',
              },
            ].map((benefit, index) => {
              const Icon = benefit.icon;
              return (
                <motion.div
                  key={benefit.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="flex gap-4 rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm transition-all hover:bg-white/10"
                >
                  <div className="flex-shrink-0">
                    <div className="rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 p-3">
                      <Icon className="h-6 w-6 text-indigo-400" />
                    </div>
                  </div>
                  <div>
                    <h4 className="mb-1 text-lg font-semibold text-white">
                      {benefit.title}
                    </h4>
                    <p className="text-sm text-white/70">
                      {benefit.description}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* Security & Trust Section */}
      <section className="relative z-10 mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:py-24">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-xl sm:p-12"
        >
          <div className="mb-8 text-center">
            <h2 className="mb-4 text-3xl font-bold sm:text-4xl">
              Your Security is Our Priority
            </h2>
            <p className="text-lg text-white/70">
              Bank-level encryption and enterprise-grade security
            </p>
          </div>
          <div className="grid gap-6 sm:grid-cols-3">
            {[
              {
                icon: Lock,
                title: 'End-to-End Encryption',
                desc: 'All transactions secured',
              },
              {
                icon: Shield,
                title: 'Multi-Layer Security',
                desc: 'Advanced threat protection',
              },
              {
                icon: CheckCircle2,
                title: 'Regulated & Compliant',
                desc: 'Industry standards followed',
              },
            ].map((item, index) => {
              const Icon = item.icon;
              return (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="text-center"
                >
                  <div className="mb-4 inline-flex rounded-2xl bg-blue-500/20 p-4">
                    <Icon className="h-8 w-8 text-blue-400" />
                  </div>
                  <h3 className="mb-2 text-xl font-semibold text-white">
                    {item.title}
                  </h3>
                  <p className="text-white/60">{item.desc}</p>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </section>

      {/* Final CTA Section */}
      <section className="relative z-10 mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:py-24">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 p-12 text-center shadow-2xl"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0" />
          <div className="relative z-10">
            <h2 className="mb-4 text-3xl font-bold text-white sm:text-4xl md:text-5xl">
              Ready to Start Earning?
            </h2>
            <p className="mb-8 text-lg text-white/90 sm:text-xl">
              Join Novunt today and start staking with up to 10% bonus rewards.
            </p>
            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link
                href="/signup"
                className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-white px-8 py-4 text-lg font-bold text-indigo-600 transition-all hover:scale-105 hover:shadow-2xl active:scale-95 sm:w-auto"
              >
                Create Free Account
                <ArrowRight className="h-5 w-5" />
              </Link>
              <a
                href="https://t.me/NovuntAssistantBot"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center text-lg font-semibold text-white transition-colors hover:text-white/80"
              >
                Contact Support
              </a>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/10 bg-black/20 py-8 backdrop-blur-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <p className="text-center text-sm text-white/60 sm:text-left">
              © {new Date().getFullYear()} Novunt — No limits to value, net
              worth and growth.
            </p>
            <div className="flex gap-4">
              {[
                { href: 'https://facebook.com', label: 'Facebook' },
                { href: 'https://instagram.com', label: 'Instagram' },
                { href: 'https://t.me', label: 'Telegram' },
                { href: 'https://youtube.com', label: 'YouTube' },
              ].map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white/60 transition-colors hover:text-white"
                  aria-label={social.label}
                >
                  <span className="sr-only">{social.label}</span>
                  <div className="h-5 w-5 rounded-full border border-white/20" />
                </a>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
