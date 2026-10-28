export type Gender = "female" | "male" | "non-binary" | "other" | "unknown"

export type Category = 
  | "bollywood"
  | "hollywood"
  | "actors"
  | "singers"
  | "popstars"
  | "athletes"
  | "scientists"
  | "tech"
  | "models"
  | "creators"
  | "glamour"
  | "adultstars"
  | "onlyfans"
  | "f1"
  | "combat"
  | "wwe"
  | "viral"
  | "history"
  | "writers"
  | "artists"
  | "fantasy"
  | "anime"
  | "gaming"
  | "icons"
  | "other"

export type ModerationStatus = "pending" | "approved" | "rejected" | "flagged" | "removed"

export type VerificationStatus = "verified" | "unverified" | "failed"

export type Provider = "local" | "wikidata" | "wikimedia" | "community" | "external"

export interface ImageAttribution {
  license: string
  licenseUrl?: string | null
  author?: string | null
  sourceUrl: string
  formattedAttribution: string
}

export interface PersonImage {
  id: string
  personId: string
  url: string
  thumbnailUrl?: string | null
  provider: Provider
  externalId?: string | null
  sourceUrl?: string | null
  license: string
  licenseUrl?: string | null
  author?: string | null
  attribution?: string | null
  isPrimary: boolean
  width?: number | null
  height?: number | null
  mimeType?: string | null
  fileSize?: number | null
  verificationStatus: VerificationStatus
  verificationDetails?: string | null
  moderationStatus: "pending" | "approved" | "rejected" | "removed"
  lastCheckedAt?: string | null
  httpStatus?: number | null
  isBroken?: boolean
  failureCount?: number
  createdAt: string
  updatedAt: string
}

export interface Person {
  id: string
  name: string
  normalizedName: string
  gender?: Gender | null
  category: Category
  tags: string[]
  primaryImageId?: string | null
  provider: Provider
  externalId?: string | null
  description?: string | null
  popularity?: number
  country?: string | null
  birthYear?: number | null
  occupations?: string[]
  aliases: string[]
  moderationStatus: ModerationStatus
  lastRefreshedAt?: string | null
  refreshError?: string | null
  createdAt: string
  updatedAt: string
  // Populated relations
  primaryImage?: PersonImage | null
  images?: PersonImage[]
}

export interface CommunitySubmission {
  id: string
  submissionType: "person" | "image" | "edit" | "tag"
  personId?: string | null
  proposedData: Record<string, any>
  submitterName?: string | null
  submitterIp?: string | null
  moderationStatus: "pending" | "approved" | "rejected" | "removed"
  moderationNotes?: string | null
  reviewerId?: string | null
  createdAt: string
  updatedAt: string
}

export interface NormalizedPersonCandidate {
  provider: "wikidata"
  externalId: string
  name: string
  aliases: string[]
  description?: string | null
  gender: Gender
  category: Category
  imageReferences: string[]
  hasPortrait: boolean
  isFictional?: boolean
  primaryCandidateImage?: WikimediaImageCandidate | null
}

export interface WikimediaImageCandidate {
  fileName: string
  url: string
  thumbnailUrl: string
  sourcePageUrl: string
  license: string
  licenseUrl?: string | null
  author?: string | null
  width?: number
  height?: number
  mimeType?: string
  fileSize?: number
  verificationStatus: VerificationStatus
  verificationReason?: string
  formattedAttribution: string
}

export interface CatalogSearchParams {
  query?: string
  category?: string
  gender?: string
  provider?: string
  moderationStatus?: ModerationStatus
  verifiedOnly?: boolean
  minPopularity?: number
  maxPopularity?: number
  hasImageOnly?: boolean
  sortBy?: "name" | "popularity" | "random"
  sortOrder?: "asc" | "desc"
  page?: number
  limit?: number
  includeHistoricalOrScientific?: boolean
}

export interface PaginatedResult<T> {
  items: T[]
  total: number
  page: number
  limit: number
  totalPages: number
  hasNext: boolean
  hasPrev: boolean
}

// ---------------- STIR-104: Matching Pipeline Types ----------------

export type MatchConfidence = "HIGH" | "AMBIGUOUS" | "MISMATCHED"

export interface ScoreBreakdown {
  nameMatchScore: number
  entityTypeScore: number
  categoryScore: number
  metadataScore: number
  aliasBonus: number
  penalties: number
}

export interface RankedMatchCandidate {
  candidate: NormalizedPersonCandidate
  score: number // 0 to 100
  confidence: MatchConfidence
  scoreBreakdown: ScoreBreakdown
  isRejectedPreviously: boolean
  rejectionReason?: string
  requiresHumanReview: boolean
  reasoning: string
}

export interface ImageMatchResult {
  personId: string
  personName: string
  status: "matched" | "ambiguous_review_needed" | "no_match"
  selectedCandidate?: RankedMatchCandidate | null
  rankedCandidates: RankedMatchCandidate[]
  attachedImage?: PersonImage | null
}

export interface RejectedMatch {
  id: string
  personId: string
  provider: Provider
  externalId?: string | null
  url: string
  reason?: string | null
  rejectedBy: string
  createdAt: string
}

// ---------------- STIR-105: Moderation & Reporting Types ----------------

export interface CommunitySubmissionInput {
  name: string
  category: Category
  gender?: Gender | null
  profileUrl?: string | null
  imageUrl?: string | null
  submitterName?: string | null
  consentConfirmed: boolean
  isPrivateIndividual?: boolean
  notes?: string
}

export interface CatalogReport {
  id: string
  targetType: "person" | "image"
  targetId: string
  reason: string
  details?: string | null
  reporterEmail?: string | null
  status: "pending" | "resolved" | "dismissed"
  actionTaken?: string | null
  createdAt: string
  resolvedAt?: string | null
}

// ---------------- STIR-106: Image-Backed Game Types ----------------

export interface PersonCard {
  id: string
  name: string
  category: Category
  gender: Gender | null
  imageUrl: string
  thumbnailUrl: string
  hasVerifiedPortrait: boolean
  license: string
  licenseUrl?: string | null
  author?: string | null
  sourceUrl: string
  attribution: string
}

export interface KMKGameRound {
  roundNumber: number
  scenario: string
  persons: [PersonCard, PersonCard, PersonCard]
}

export interface WYRGameRound {
  roundNumber: number
  scenario: string
  optionA: PersonCard
  optionB: PersonCard
}

// ---------------- STIR-107: Refresh & Revalidation Types ----------------

export interface RefreshOptions {
  batchSize?: number
  staleThresholdDays?: number
  forceAll?: boolean
  dryRun?: boolean
}

export interface RefreshJobStats {
  jobId: string
  startedAt: string
  completedAt: string
  durationMs: number
  totalEligible: number
  processed: number
  verifiedOk: number
  brokenDetected: number
  switchedToPlaceholder: number
  errors: number
  rateLimitDelayMs: number
}
