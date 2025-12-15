/**
 * Pool Declaration Types
 * Based on backend API specification
 */

export interface PoolQualifiersResponse {
  success: boolean;
  data: {
    performancePool: {
      totalQualifiers: number;
      byRank: Record<string, number>;
      description: string;
    };
    premiumPool: {
      totalQualifiers: number;
      byRank: Record<string, number>;
      description: string;
    };
    note: string;
  };
}

export interface PreviewDistributionRequest {
  performancePoolAmount: number;
  premiumPoolAmount: number;
}

export interface RankDistribution {
  rank: string;
  eligibleUsers: number;
  totalAmount: number;
  perUserAmount: number;
}

export interface PreviewDistributionResponse {
  success: boolean;
  data: {
    performancePool: {
      totalAmount: number;
      totalQualifiers: number;
      perQualifierAmount: number;
      byRank: RankDistribution[];
      totalToDistribute: number;
    };
    premiumPool: {
      totalAmount: number;
      totalQualifiers: number;
      perQualifierAmount: number;
      byRank: RankDistribution[];
      totalToDistribute: number;
    };
    totalAmount: number;
    totalQualifiers: number;
  };
}

export interface DeclarePoolRequest {
  performancePoolAmount: number;
  premiumPoolAmount: number;
  autoDistribute?: boolean;
  notes?: string;
}

export interface PoolDeclaration {
  performancePoolAmount: number;
  premiumPoolAmount: number;
  totalAmount: number;
  declaredBy: string;
  declaredAt: string;
  notes?: string;
}

export interface PoolQualifiers {
  performancePool: {
    total: number;
    description: string;
  };
  premiumPool: {
    total: number;
    description: string;
  };
}

export interface PoolDistribution {
  distributed: boolean;
  distributedAt?: string;
  performancePool?: {
    distributed: number;
    totalDistributed: number;
  };
  premiumPool?: {
    distributed: number;
    totalDistributed: number;
  };
  totalDistributed?: number;
}

export interface DeclarePoolResponse {
  success: boolean;
  message: string;
  data: {
    declaration: PoolDeclaration;
    qualifiers: PoolQualifiers;
    distribution: PoolDistribution | null;
    note?: string;
  };
}

export interface DistributePoolRequest {
  performancePoolAmount: number;
  premiumPoolAmount: number;
}

export interface DistributionDetail {
  userId: string;
  username: string;
  rank: string;
  bonusAmount: number;
  distributionId: string;
}

export interface DistributePoolResponse {
  success: boolean;
  message: string;
  data: {
    performancePool: {
      amount: number;
      distributedTo: number;
      totalDistributed: number;
      distributions: DistributionDetail[];
    };
    premiumPool: {
      amount: number;
      distributedTo: number;
      totalDistributed: number;
      distributions: DistributionDetail[];
    };
    totalDistributed: number;
    distributedAt: string;
  };
}
