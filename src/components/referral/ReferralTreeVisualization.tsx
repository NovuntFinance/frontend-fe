'use client';

import React, { useMemo, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users,
  ChevronDown,
  ChevronRight,
  Search,
  Filter,
  Bug,
} from 'lucide-react';
import { NovuntPremiumCard } from '@/components/ui/NovuntPremiumCard';
import { ReferralTreeNode, TreeNode } from './ReferralTreeNode';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { formatCurrency } from '@/lib/utils';
import type { ReferralTreeEntry } from '@/types/referral';
import { REFERRAL_COMMISSION_RATES } from '@/types/referral';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface ReferralTreeVisualizationProps {
  treeEntries: ReferralTreeEntry[];
  stats?: {
    totalReferrals: number;
    activeReferrals: number;
    totalEarned: number;
    currentBalance: number;
  };
  isLoading?: boolean;
  maxLevels?: number;
}

/**
 * Builds a hierarchical tree structure from flat array of entries
 * (Currently unused - tree is built inline in useMemo)
 */
function _buildTree(entries: ReferralTreeEntry[]): TreeNode[] {
  // Create a map of referral ID to node
  const nodeMap = new Map<string, TreeNode>();

  // First pass: create all nodes
  entries.forEach((entry) => {
    nodeMap.set(entry.referral, {
      entry,
      children: [],
    });
  });

  // Second pass: build parent-child relationships
  const rootNodes: TreeNode[] = [];

  entries.forEach((entry) => {
    const node = nodeMap.get(entry.referral);
    if (!node) return;

    // If this entry's referrer is in the map, add as child
    if (entry.referrer && nodeMap.has(entry.referrer)) {
      const parentNode = nodeMap.get(entry.referrer);
      if (parentNode) {
        parentNode.children.push(node);
      }
    } else {
      // This is a root node (direct referral of current user)
      rootNodes.push(node);
    }
  });

  return rootNodes;
}

/**
 * Flattens tree for search filtering
 */
function flattenTree(nodes: TreeNode[]): TreeNode[] {
  const result: TreeNode[] = [];

  function traverse(node: TreeNode) {
    result.push(node);
    node.children.forEach(traverse);
  }

  nodes.forEach(traverse);
  return result;
}

/**
 * ReferralTreeVisualization Component
 *
 * Displays a hierarchical tree visualization of the referral network
 * with tree traversal capabilities (expand/collapse, search, filter)
 */
export function ReferralTreeVisualization({
  treeEntries,
  stats,
  isLoading,
  maxLevels = 5,
}: ReferralTreeVisualizationProps) {
  // Initialize with level 1 nodes expanded by default
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(() => {
    const initial = new Set<string>();
    // Expand all level 1 nodes by default
    if (treeEntries && treeEntries.length > 0) {
      treeEntries
        .filter((e) => e.level === 1)
        .forEach((e) => initial.add(e.referral));
    }
    return initial;
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [filterActive, setFilterActive] = useState<
    'all' | 'active' | 'inactive'
  >('all');
  const [showDebug, setShowDebug] = useState(false);
  const [auditEmail, setAuditEmail] = useState('olaitanismail87@gmail.com');
  const [auditResults, setAuditResults] = useState<{
    userFound: boolean;
    userEntry?: ReferralTreeEntry;
    directDownlines: ReferralTreeEntry[];
    totalDownlines: number;
    treeChildren: number;
    rawDataCount: number;
    treeStructureCount: number;
  } | null>(null);

  // Update expanded nodes when treeEntries change
  useEffect(() => {
    if (treeEntries && treeEntries.length > 0) {
      setExpandedNodes((prev) => {
        const updated = new Set(prev);
        // Add all level 1 nodes if not already expanded
        treeEntries
          .filter((e) => e.level === 1)
          .forEach((e) => updated.add(e.referral));
        return updated;
      });
    }
  }, [treeEntries]);

  // Build tree structure from flat entries
  const treeStructure = useMemo(() => {
    if (!treeEntries || treeEntries.length === 0) return [];

    // Debug: Log all entries to see what we're working with
    if (process.env.NODE_ENV === 'development') {
      console.log('[Tree Debug] All tree entries received:', {
        totalCount: treeEntries.length,
        entries: treeEntries.map((e) => ({
          email: e.email,
          username: e.username,
          level: e.level,
          referrer: e.referrer,
          referral: e.referral,
          hasQualifyingStake: e.hasQualifyingStake,
        })),
        entriesByLevel: treeEntries.reduce(
          (acc, e) => {
            acc[e.level] = (acc[e.level] || 0) + 1;
            return acc;
          },
          {} as Record<number, number>
        ),
      });
    }

    // Group entries by level to find root nodes (level 1)
    const level1Entries = treeEntries.filter((e) => e.level === 1);

    // Build tree starting from level 1 entries
    const trees: TreeNode[] = [];

    level1Entries.forEach((level1Entry) => {
      const rootNode: TreeNode = {
        entry: level1Entry,
        children: [],
      };

      // Recursively build children
      function buildChildren(
        parentEntry: ReferralTreeEntry,
        parentNode: TreeNode,
        currentLevel: number
      ) {
        if (currentLevel >= maxLevels) return;

        // Find all children where referrer matches parent's referral ID
        // IMPORTANT: We match by referrer ID, not by level, to ensure we don't miss any children
        // The level check is secondary - if referrer matches, it's a child regardless of level
        const childrenEntries = treeEntries.filter(
          (e) => e.referrer === parentEntry.referral
        );

        // Debug logging for specific email
        if (
          parentEntry.email.toLowerCase().includes('olaitanismail87') ||
          process.env.NODE_ENV === 'development'
        ) {
          console.log(
            `[Tree Debug] Building children for ${parentEntry.email}:`,
            {
              parentReferralId: parentEntry.referral,
              parentLevel: parentEntry.level,
              currentLevel,
              maxLevels,
              childrenFound: childrenEntries.length,
              children: childrenEntries.map((c) => ({
                email: c.email,
                username: c.username,
                level: c.level,
                referrer: c.referrer,
                referral: c.referral,
              })),
              allEntriesWithThisReferrer: treeEntries.filter(
                (e) => e.referrer === parentEntry.referral
              ).length,
              allTreeEntries: treeEntries.map((e) => ({
                email: e.email,
                referrer: e.referrer,
                referral: e.referral,
                level: e.level,
              })),
            }
          );
        }

        childrenEntries.forEach((childEntry) => {
          // Skip if this child would exceed maxLevels
          if (childEntry.level > maxLevels) return;

          const childNode: TreeNode = {
            entry: childEntry,
            children: [],
          };

          parentNode.children.push(childNode);
          // Use the child's actual level for next iteration, not currentLevel + 1
          // This handles cases where levels might not be sequential
          buildChildren(childEntry, childNode, childEntry.level);
        });
      }

      buildChildren(level1Entry, rootNode, 1);
      trees.push(rootNode);
    });

    // Debug: Log total entries and tree structure
    if (process.env.NODE_ENV === 'development') {
      console.log('[Tree Debug] Tree Structure Built:', {
        totalEntries: treeEntries.length,
        level1Entries: level1Entries.length,
        treesBuilt: trees.length,
        totalNodesInTree: flattenTree(trees).length,
        entriesByLevel: treeEntries.reduce(
          (acc, e) => {
            acc[e.level] = (acc[e.level] || 0) + 1;
            return acc;
          },
          {} as Record<number, number>
        ),
      });
    }

    return trees;
  }, [treeEntries, maxLevels]);

  // Audit function to count downlines for a specific user
  const auditDownlines = useMemo(() => {
    if (!treeEntries || treeEntries.length === 0 || !auditEmail) return null;

    const emailLower = auditEmail.toLowerCase().trim();

    // Find the user by email
    const userEntry = treeEntries.find(
      (e) => e.email.toLowerCase() === emailLower
    );

    if (!userEntry) {
      return {
        userFound: false,
        directDownlines: [],
        totalDownlines: 0,
        treeChildren: 0,
        rawDataCount: 0,
        treeStructureCount: 0,
      };
    }

    // Count direct downlines from raw data
    const directDownlines = treeEntries.filter(
      (e) => e.referrer === userEntry.referral
    );

    // Count all downlines recursively (including indirect)
    function countAllDownlines(
      userId: string,
      visited = new Set<string>()
    ): number {
      if (visited.has(userId)) return 0; // Prevent cycles
      visited.add(userId);

      const direct = treeEntries.filter((e) => e.referrer === userId);
      let count = direct.length;

      direct.forEach((child) => {
        count += countAllDownlines(child.referral, visited);
      });

      return count;
    }

    const totalDownlines = countAllDownlines(userEntry.referral);

    // Find user in tree structure and count children
    function findNodeInTree(
      nodes: TreeNode[],
      userId: string
    ): TreeNode | null {
      for (const node of nodes) {
        if (node.entry.referral === userId) return node;
        const found = findNodeInTree(node.children, userId);
        if (found) return found;
      }
      return null;
    }

    function countTreeChildren(node: TreeNode): number {
      let count = node.children.length;
      node.children.forEach((child) => {
        count += countTreeChildren(child);
      });
      return count;
    }

    const userNode = findNodeInTree(treeStructure, userEntry.referral);
    const treeChildren = userNode ? countTreeChildren(userNode) : 0;

    return {
      userFound: true,
      userEntry,
      directDownlines,
      totalDownlines,
      treeChildren,
      rawDataCount: directDownlines.length,
      treeStructureCount: userNode?.children.length || 0,
    };
  }, [treeEntries, auditEmail, treeStructure]);

  useEffect(() => {
    if (auditEmail && treeEntries.length > 0) {
      setAuditResults(auditDownlines);
    }
  }, [auditEmail, treeEntries, auditDownlines]);

  // Filter tree based on search and active filter
  const filteredTree = useMemo(() => {
    if (!searchQuery && filterActive === 'all') return treeStructure;

    const allNodes = flattenTree(treeStructure);
    const filteredSet = new Set(
      allNodes
        .filter((node) => {
          const matchesSearch =
            !searchQuery ||
            node.entry.username
              .toLowerCase()
              .includes(searchQuery.toLowerCase()) ||
            node.entry.email.toLowerCase().includes(searchQuery.toLowerCase());

          const matchesFilter =
            filterActive === 'all' ||
            (filterActive === 'active' && node.entry.hasQualifyingStake) ||
            (filterActive === 'inactive' && !node.entry.hasQualifyingStake);

          return matchesSearch && matchesFilter;
        })
        .map((n) => n.entry.referral)
    );

    // Rebuild tree with filtered nodes (include parents of filtered nodes)
    function buildFilteredTree(nodes: TreeNode[]): TreeNode[] {
      const result: TreeNode[] = [];

      function shouldInclude(node: TreeNode): boolean {
        if (filteredSet.has(node.entry.referral)) return true;
        // Include if any descendant is in filtered set
        return node.children.some((child) => shouldInclude(child));
      }

      function buildFilteredNode(node: TreeNode): TreeNode | null {
        if (!shouldInclude(node)) return null;

        const filteredChildren = node.children
          .map(buildFilteredNode)
          .filter((n): n is TreeNode => n !== null);

        return {
          entry: node.entry,
          children: filteredChildren,
        };
      }

      nodes.forEach((root) => {
        const filtered = buildFilteredNode(root);
        if (filtered) result.push(filtered);
      });

      return result;
    }

    return buildFilteredTree(treeStructure);
  }, [treeStructure, searchQuery, filterActive]);

  const toggleNode = (nodeId: string) => {
    setExpandedNodes((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(nodeId)) {
        newSet.delete(nodeId);
      } else {
        newSet.add(nodeId);
      }
      return newSet;
    });
  };

  const expandAll = () => {
    const allNodeIds = new Set<string>();
    flattenTree(filteredTree).forEach((node) => {
      if (node.children.length > 0) {
        allNodeIds.add(node.entry.referral);
      }
    });
    setExpandedNodes(allNodeIds);
  };

  const collapseAll = () => {
    setExpandedNodes(new Set());
  };

  const renderTreeNode = (
    node: TreeNode,
    level: number = 1,
    parentId?: string,
    isLastChild: boolean = false
  ): React.ReactNode => {
    const nodeId = node.entry.referral;
    const isExpanded = expandedNodes.has(nodeId);
    const hasChildren = node.children.length > 0;
    const shouldShow = level === 1 || expandedNodes.has(parentId || '');

    if (level > 1 && !shouldShow) return null;

    // Level-specific styling
    const levelColors = {
      1: 'border-purple-500/30 bg-purple-500/5',
      2: 'border-blue-500/30 bg-blue-500/5',
      3: 'border-emerald-500/30 bg-emerald-500/5',
      4: 'border-orange-500/30 bg-orange-500/5',
      5: 'border-yellow-500/30 bg-yellow-500/5',
    };
    const levelColor =
      levelColors[Math.min(level, 5) as keyof typeof levelColors] ||
      levelColors[5];

    return (
      <div key={nodeId} className="relative">
        {/* Level Indicator Badge */}
        <div
          className={`border-background absolute top-4 -left-2 z-20 flex h-6 w-6 items-center justify-center rounded-full border-2 text-xs font-bold ${levelColor}`}
        >
          {level}
        </div>

        {/* Connector Lines */}
        {level > 1 && (
          <>
            {/* Vertical line from parent */}
            <div
              className="bg-border absolute top-0 -left-2 w-0.5"
              style={{
                height: '1.5rem',
              }}
              aria-hidden="true"
            />
            {/* Horizontal line to node */}
            <div
              className="bg-border absolute top-6 -left-2 w-4"
              style={{
                height: '0.5px',
              }}
              aria-hidden="true"
            />
            {/* Vertical line down (if not last child) */}
            {!isLastChild && (
              <div
                className="bg-border absolute top-6 -left-2 w-0.5"
                style={{
                  height: '100%',
                }}
                aria-hidden="true"
              />
            )}
          </>
        )}

        <div className={level > 1 ? 'mt-4 ml-8' : 'mt-0'}>
          <ReferralTreeNode
            node={node}
            level={level}
            isExpanded={isExpanded}
            onToggle={() => toggleNode(nodeId)}
            hasChildren={hasChildren}
          />

          {/* Children */}
          <AnimatePresence>
            {hasChildren && isExpanded && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="mt-4 space-y-4"
              >
                {node.children.map((child, index) =>
                  renderTreeNode(
                    child,
                    level + 1,
                    nodeId,
                    index === node.children.length - 1
                  )
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <NovuntPremiumCard
        title="Referral Tree"
        subtitle="Loading your referral network..."
        icon={Users}
        colorTheme="purple"
      >
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </div>
      </NovuntPremiumCard>
    );
  }

  if (!treeEntries || treeEntries.length === 0) {
    return (
      <NovuntPremiumCard
        title="Referral Tree"
        subtitle="Start building your network"
        icon={Users}
        colorTheme="purple"
        tooltip="Your referral tree will appear here once you have referrals"
      >
        <div className="py-12 text-center">
          <Users className="text-muted-foreground/30 mx-auto mb-4 h-16 w-16" />
          <p className="text-muted-foreground mb-2 text-lg font-medium">
            No referrals yet
          </p>
          <p className="text-muted-foreground text-sm">
            Share your referral link to start building your network
          </p>
        </div>
      </NovuntPremiumCard>
    );
  }

  return (
    <NovuntPremiumCard
      title="Referral Tree"
      subtitle={`${stats?.totalReferrals || 0} total referrals • ${stats?.activeReferrals || 0} active`}
      icon={Users}
      colorTheme="purple"
      tooltip={`Visualize your referral network up to ${maxLevels} levels deep`}
    >
      <div className="space-y-6">
        {/* Stats Summary */}
        {stats && (
          <div className="bg-muted/30 border-border/50 grid grid-cols-2 gap-4 rounded-lg border p-4">
            <div>
              <p className="text-muted-foreground mb-1 text-xs">Total Earned</p>
              <p className="text-foreground text-xl font-bold">
                {formatCurrency(stats.totalEarned)}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground mb-1 text-xs">
                Current Balance
              </p>
              <p className="text-xl font-bold text-emerald-400">
                {formatCurrency(stats.currentBalance)}
              </p>
            </div>
          </div>
        )}

        {/* Controls */}
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
            <Input
              placeholder="Search by username or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-background/50 pl-9"
            />
          </div>

          <div className="flex gap-2">
            <Button
              variant={filterActive === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilterActive('all')}
            >
              All
            </Button>
            <Button
              variant={filterActive === 'active' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilterActive('active')}
            >
              Active
            </Button>
            <Button
              variant={filterActive === 'inactive' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilterActive('inactive')}
            >
              Inactive
            </Button>
          </div>
        </div>

        {/* Tree Controls */}
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={expandAll}
            className="text-xs"
          >
            <ChevronDown className="mr-1 h-3 w-3" />
            Expand All
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={collapseAll}
            className="text-xs"
          >
            <ChevronRight className="mr-1 h-3 w-3" />
            Collapse All
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowDebug(!showDebug)}
            className="text-xs"
          >
            <Bug className="mr-1 h-3 w-3" />
            {showDebug ? 'Hide' : 'Show'} Debug
          </Button>
        </div>

        {/* Debug Panel */}
        {showDebug && (
          <Card className="border-yellow-500/20 bg-yellow-500/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm">
                <Bug className="h-4 w-4" />
                Downline Audit Tool
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-muted-foreground mb-2 block text-sm font-medium">
                  Email to Audit:
                </label>
                <Input
                  value={auditEmail}
                  onChange={(e) => setAuditEmail(e.target.value)}
                  placeholder="Enter email address"
                  className="bg-background/50"
                />
              </div>

              {auditResults && (
                <div className="bg-background/50 space-y-3 rounded-lg border border-yellow-500/20 p-4">
                  {!auditResults.userFound ? (
                    <div className="text-muted-foreground text-sm">
                      ❌ User not found in referral tree
                    </div>
                  ) : (
                    <>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-muted-foreground mb-1 text-xs">
                            User Found:
                          </p>
                          <p className="text-sm font-semibold">
                            {auditResults.userEntry?.username} (
                            {auditResults.userEntry?.email})
                          </p>
                          <p className="text-muted-foreground mt-1 text-xs">
                            Level: {auditResults.userEntry?.level} • Referral
                            ID: {auditResults.userEntry?.referral}
                          </p>
                        </div>
                        <div>
                          <p className="text-muted-foreground mb-1 text-xs">
                            Referrer ID:
                          </p>
                          <p className="font-mono text-sm">
                            {auditResults.userEntry?.referrer || 'Root'}
                          </p>
                        </div>
                      </div>

                      <div className="border-t border-yellow-500/20 pt-3">
                        <h4 className="text-muted-foreground mb-2 text-xs font-semibold uppercase">
                          Downline Counts
                        </h4>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-muted-foreground mb-1 text-xs">
                              Direct Downlines (Raw Data):
                            </p>
                            <p className="text-lg font-bold text-yellow-400">
                              {auditResults.rawDataCount}
                            </p>
                          </div>
                          <div>
                            <p className="text-muted-foreground mb-1 text-xs">
                              Direct Downlines (Tree Structure):
                            </p>
                            <p
                              className={`text-lg font-bold ${
                                auditResults.treeStructureCount ===
                                auditResults.rawDataCount
                                  ? 'text-green-400'
                                  : 'text-red-400'
                              }`}
                            >
                              {auditResults.treeStructureCount}
                            </p>
                          </div>
                          <div>
                            <p className="text-muted-foreground mb-1 text-xs">
                              Total Downlines (All Levels):
                            </p>
                            <p className="text-lg font-bold text-blue-400">
                              {auditResults.totalDownlines}
                            </p>
                          </div>
                          <div>
                            <p className="text-muted-foreground mb-1 text-xs">
                              Total in Tree Structure:
                            </p>
                            <p
                              className={`text-lg font-bold ${
                                auditResults.treeChildren ===
                                auditResults.totalDownlines
                                  ? 'text-green-400'
                                  : 'text-red-400'
                              }`}
                            >
                              {auditResults.treeChildren}
                            </p>
                          </div>
                        </div>
                      </div>

                      {auditResults.directDownlines.length > 0 && (
                        <div className="border-t border-yellow-500/20 pt-3">
                          <h4 className="text-muted-foreground mb-2 text-xs font-semibold uppercase">
                            Direct Downlines List
                          </h4>
                          <div className="max-h-40 space-y-1 overflow-y-auto">
                            {auditResults.directDownlines.map(
                              (downline, idx) => (
                                <div
                                  key={downline.referral}
                                  className="bg-background/30 rounded px-2 py-1 text-xs"
                                >
                                  {idx + 1}. {downline.username} (
                                  {downline.email}) - Level {downline.level}
                                </div>
                              )
                            )}
                          </div>
                        </div>
                      )}

                      {(auditResults.treeStructureCount !==
                        auditResults.rawDataCount ||
                        auditResults.treeChildren !==
                          auditResults.totalDownlines) && (
                        <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-3">
                          <p className="text-sm font-semibold text-red-400">
                            ⚠️ Mismatch Detected!
                          </p>
                          <p className="text-muted-foreground mt-1 text-xs">
                            The tree structure count doesn&apos;t match the raw
                            data count. This could indicate a bug in the tree
                            building logic.
                          </p>
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Level Legend */}
        {filteredTree.length > 0 && (
          <div className="bg-muted/30 border-border/50 rounded-lg border p-3">
            <p className="text-muted-foreground mb-2 text-xs font-semibold uppercase">
              Level Legend
            </p>
            <div className="flex flex-wrap gap-3">
              {[1, 2, 3, 4, 5].map((lvl) => {
                const levelColors = {
                  1: 'border-purple-500/30 bg-purple-500/5 text-purple-400',
                  2: 'border-blue-500/30 bg-blue-500/5 text-blue-400',
                  3: 'border-emerald-500/30 bg-emerald-500/5 text-emerald-400',
                  4: 'border-orange-500/30 bg-orange-500/5 text-orange-400',
                  5: 'border-yellow-500/30 bg-yellow-500/5 text-yellow-400',
                };
                const color = levelColors[lvl as keyof typeof levelColors];
                const commissionRate =
                  REFERRAL_COMMISSION_RATES[
                    `level${lvl}` as keyof typeof REFERRAL_COMMISSION_RATES
                  ] || 0;
                return (
                  <div
                    key={lvl}
                    className={`flex items-center gap-2 rounded-md border px-2 py-1 text-xs ${color}`}
                  >
                    <span className="font-bold">L{lvl}</span>
                    <span className="text-muted-foreground">
                      {commissionRate}%
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Tree Visualization */}
        <div className="space-y-4 pt-4">
          {filteredTree.length === 0 ? (
            <div className="py-12 text-center">
              <Filter className="text-muted-foreground/30 mx-auto mb-4 h-12 w-12" />
              <p className="text-muted-foreground mb-2 font-medium">
                No referrals match your filters
              </p>
              <p className="text-muted-foreground text-sm">
                Try adjusting your search or filter criteria
              </p>
            </div>
          ) : (
            <div className="relative">
              {/* Tree Container with better visual hierarchy */}
              <div className="space-y-4">
                {filteredTree.map((rootNode, index) => (
                  <div key={rootNode.entry.referral}>
                    {renderTreeNode(
                      rootNode,
                      1,
                      undefined,
                      index === filteredTree.length - 1
                    )}
                  </div>
                ))}
              </div>

              {/* Performance indicator for large trees */}
              {treeEntries.length > 100 && (
                <div className="bg-muted/30 border-border/50 mt-4 rounded-lg border p-2 text-center">
                  <p className="text-muted-foreground text-xs">
                    Showing {filteredTree.length} root branches •{' '}
                    {flattenTree(filteredTree).length} visible nodes •{' '}
                    {treeEntries.length} total referrals
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </NovuntPremiumCard>
  );
}
