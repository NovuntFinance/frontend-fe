'use client';

import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, ChevronDown, ChevronRight, Search, Filter } from 'lucide-react';
import { NovuntPremiumCard } from '@/components/ui/NovuntPremiumCard';
import { ReferralTreeNode, TreeNode } from './ReferralTreeNode';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { formatCurrency } from '@/lib/utils';
import type { ReferralTreeEntry } from '@/types/referral';

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
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [filterActive, setFilterActive] = useState<
    'all' | 'active' | 'inactive'
  >('all');

  // Build tree structure from flat entries
  const treeStructure = useMemo(() => {
    if (!treeEntries || treeEntries.length === 0) return [];

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

        const childrenEntries = treeEntries.filter(
          (e) =>
            e.referrer === parentEntry.referral && e.level === currentLevel + 1
        );

        childrenEntries.forEach((childEntry) => {
          const childNode: TreeNode = {
            entry: childEntry,
            children: [],
          };

          parentNode.children.push(childNode);
          buildChildren(childEntry, childNode, currentLevel + 1);
        });
      }

      buildChildren(level1Entry, rootNode, 1);
      trees.push(rootNode);
    });

    return trees;
  }, [treeEntries, maxLevels]);

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
    parentId?: string
  ): React.ReactNode => {
    const nodeId = node.entry.referral;
    const isExpanded = expandedNodes.has(nodeId);
    const hasChildren = node.children.length > 0;
    const shouldShow = level === 1 || expandedNodes.has(parentId || '');

    if (level > 1 && !shouldShow) return null;

    return (
      <div key={nodeId} className="relative">
        {/* Connector Line */}
        {level > 1 && (
          <div
            className="bg-border absolute top-0 left-0 w-px"
            style={{
              height: 'calc(100% - 2rem)',
              transform: 'translateX(-1.5rem)',
            }}
            aria-hidden="true"
          />
        )}

        <div className={level > 1 ? 'mt-4 ml-8' : ''}>
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
                {node.children.map((child) =>
                  renderTreeNode(child, level + 1, nodeId)
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
        <div className="flex gap-2">
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
        </div>

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
            filteredTree.map((rootNode) => renderTreeNode(rootNode, 1))
          )}
        </div>
      </div>
    </NovuntPremiumCard>
  );
}
