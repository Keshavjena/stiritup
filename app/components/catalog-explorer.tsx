"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Search,
  ExternalLink,
  ShieldCheck,
  Sparkles,
  Users,
  Image as ImageIcon,
  PlusCircle,
  X,
  ChevronLeft,
  ChevronRight,
  Info,
  Check,
  AlertTriangle,
  Flag,
  Trash2,
  RefreshCw,
  SlidersHorizontal,
  CheckCircle2,
  XCircle
} from "lucide-react"
import { Person, NormalizedPersonCandidate, ImageMatchResult } from "@/lib/catalog/types"

interface CatalogExplorerProps {
  isOpen: boolean
  onClose: () => void
}

export function CatalogExplorer({ isOpen, onClose }: CatalogExplorerProps) {
  const [activeTab, setActiveTab] = useState<"catalog" | "discover" | "submit" | "moderation">("catalog")
  const [people, setPeople] = useState<Person[]>([])
  const [loading, setLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalCount, setTotalCount] = useState(0)

  // Discovery state
  const [discoverQuery, setDiscoverQuery] = useState("")
  const [candidates, setCandidates] = useState<NormalizedPersonCandidate[]>([])
  const [discovering, setDiscovering] = useState(false)
  const [importingQid, setImportingQid] = useState<string | null>(null)
  const [importSuccess, setImportSuccess] = useState<string | null>(null)

  // Community submission state
  const [submitName, setSubmitName] = useState("")
  const [submitCategory, setSubmitCategory] = useState("hollywood")
  const [submitImageUrl, setSubmitImageUrl] = useState("")
  const [submitProfileUrl, setSubmitProfileUrl] = useState("")
  const [submitterName, setSubmitterName] = useState("")
  const [consentConfirmed, setConsentConfirmed] = useState(false)
  const [isPrivateIndividual, setIsPrivateIndividual] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [submitSuccess, setSubmitSuccess] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  // Moderation state
  const [submissionsForReview, setSubmissionsForReview] = useState<any[]>([])
  const [moderationLoading, setModerationLoading] = useState(false)
  const [moderationActionMsg, setModerationActionMsg] = useState<string | null>(null)

  // Matching Pipeline Modal state
  const [matchingModalOpen, setMatchingModalOpen] = useState(false)
  const [matchingPerson, setMatchingPerson] = useState<Person | null>(null)
  const [matchingResult, setMatchingResult] = useState<ImageMatchResult | null>(null)
  const [matchingLoading, setMatchingLoading] = useState(false)

  // Reporting / Takedown Modal state
  const [reportModalOpen, setReportModalOpen] = useState(false)
  const [reportTarget, setReportTarget] = useState<{ id: string; name: string; type: "person" | "image" } | null>(null)
  const [reportReason, setReportReason] = useState("incorrect_identity")
  const [reportDetails, setReportDetails] = useState("")
  const [reporterEmail, setReporterEmail] = useState("")
  const [reportSubmitting, setReportSubmitting] = useState(false)
  const [reportSuccess, setReportSuccess] = useState(false)

  // Fetch local catalog people
  const fetchPeople = async (p = page, cat = selectedCategory, q = searchQuery) => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      params.set("page", String(p))
      params.set("limit", "12")
      if (cat !== "all") params.set("category", cat)
      if (q.trim()) params.set("q", q.trim())

      const res = await fetch(`/api/catalog/people?${params.toString()}`)
      const json = await res.json()
      if (json.success) {
        setPeople(json.items || [])
        setTotalPages(json.totalPages || 1)
        setTotalCount(json.total || 0)
      }
    } catch (err) {
      console.error("Failed to load catalog people:", err)
    } finally {
      setLoading(false)
    }
  }

  // Fetch moderation queue
  const fetchModerationQueue = async () => {
    setModerationLoading(true)
    try {
      const res = await fetch("/api/catalog/moderation?status=pending")
      const json = await res.json()
      if (json.success) {
        setSubmissionsForReview(json.submissions || [])
      }
    } catch (err) {
      console.error("Failed to load moderation queue:", err)
    } finally {
      setModerationLoading(false)
    }
  }

  useEffect(() => {
    if (isOpen) {
      if (activeTab === "catalog") {
        fetchPeople(page, selectedCategory, searchQuery)
      } else if (activeTab === "moderation") {
        fetchModerationQueue()
      }
    }
  }, [isOpen, page, selectedCategory, activeTab])

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setPage(1)
    fetchPeople(1, selectedCategory, searchQuery)
  }

  // Handle Wikidata discovery
  const handleDiscover = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    if (!discoverQuery.trim()) return

    setDiscovering(true)
    setCandidates([])
    try {
      const res = await fetch(`/api/catalog/discover?q=${encodeURIComponent(discoverQuery.trim())}&limit=6`)
      const json = await res.json()
      if (json.success) {
        setCandidates(json.candidates || [])
      }
    } catch (err) {
      console.error("Wikidata discovery failed:", err)
    } finally {
      setDiscovering(false)
    }
  }

  // Handle importing discovered candidate into catalog
  const handleImportCandidate = async (candidate: NormalizedPersonCandidate) => {
    setImportingQid(candidate.externalId)
    try {
      const res = await fetch("/api/catalog/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ candidate })
      })
      const json = await res.json()
      if (json.success) {
        setImportSuccess(candidate.externalId)
        setTimeout(() => setImportSuccess(null), 3000)
        fetchPeople(1, "all", "")
      }
    } catch (err) {
      console.error("Import failed:", err)
    } finally {
      setImportingQid(null)
    }
  }

  // Handle running source-aware matching pipeline for a person
  const handleRunMatchingPipeline = async (person: Person) => {
    setMatchingPerson(person)
    setMatchingModalOpen(true)
    setMatchingLoading(true)
    setMatchingResult(null)

    try {
      const res = await fetch("/api/catalog/matching", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ personId: person.id, autoAttachHighConfidence: false })
      })
      const json = await res.json()
      if (json.success) {
        setMatchingResult(json.data)
      }
    } catch (err) {
      console.error("Matching pipeline error:", err)
    } finally {
      setMatchingLoading(false)
    }
  }

  // Handle rejecting a suggested match to avoid repeatedly suggesting it
  const handleRejectMatchCandidate = async (candidate: any, reason: string) => {
    if (!matchingPerson) return
    try {
      await fetch("/api/catalog/matching/reject", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          personId: matchingPerson.id,
          provider: candidate.candidate.provider || "wikidata",
          externalId: candidate.candidate.externalId,
          url: candidate.candidate.primaryCandidateImage?.url || "https://example.com/rejected",
          reason
        })
      })
      // Re-run matching pipeline
      handleRunMatchingPipeline(matchingPerson)
    } catch (err) {
      console.error("Failed to reject match candidate:", err)
    }
  }

  // Handle community suggestion submission
  const handleSubmitSuggestion = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitError(null)

    if (!consentConfirmed) {
      setSubmitError("Consent confirmation is required to submit.")
      return
    }

    setSubmitting(true)
    try {
      const res = await fetch("/api/catalog/submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          submissionType: "person",
          proposedData: {
            name: submitName.trim(),
            category: submitCategory,
            imageUrl: submitImageUrl.trim() || undefined,
            profileUrl: submitProfileUrl.trim() || undefined,
            consentConfirmed: true,
            isPrivateIndividual
          },
          submitterName: submitterName.trim() || undefined
        })
      })
      const json = await res.json()
      if (json.success) {
        setSubmitSuccess(true)
        setSubmitName("")
        setSubmitImageUrl("")
        setSubmitProfileUrl("")
        setConsentConfirmed(false)
        setIsPrivateIndividual(false)
        setTimeout(() => setSubmitSuccess(false), 4000)
      } else {
        setSubmitError(json.error || "Submission failed.")
      }
    } catch (err: any) {
      setSubmitError(err.message || "Failed to submit.")
    } finally {
      setSubmitting(false)
    }
  }

  // Handle moderation actions (Approve / Reject)
  const handleModerationAction = async (action: "approve" | "reject", submissionId: string) => {
    try {
      const res = await fetch("/api/catalog/moderation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action,
          submissionId,
          reason: action === "reject" ? "Declined by reviewer" : undefined
        })
      })
      const json = await res.json()
      if (json.success) {
        setModerationActionMsg(`Submission successfully ${action}d!`)
        setTimeout(() => setModerationActionMsg(null), 3000)
        fetchModerationQueue()
        fetchPeople(1, selectedCategory, "")
      }
    } catch (err) {
      console.error("Moderation action failed:", err)
    }
  }

  // Handle Filing a Report / Takedown
  const handleFileReport = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!reportTarget) return

    setReportSubmitting(true)
    try {
      const res = await fetch("/api/catalog/report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          targetType: reportTarget.type,
          targetId: reportTarget.id,
          reason: reportReason,
          details: reportDetails,
          reporterEmail
        })
      })
      const json = await res.json()
      if (json.success) {
        setReportSuccess(true)
        setTimeout(() => {
          setReportSuccess(false)
          setReportModalOpen(false)
          setReportTarget(null)
          fetchPeople(page, selectedCategory, searchQuery)
        }, 2000)
      }
    } catch (err) {
      console.error("Failed to file report:", err)
    } finally {
      setReportSubmitting(false)
    }
  }

  if (!isOpen) return null

  const categories = [
    { id: "all", label: "All" },
    { id: "scientists", label: "Scientists & Thinkers" },
    { id: "tech", label: "Tech Pioneers" },
    { id: "bollywood", label: "Bollywood" },
    { id: "hollywood", label: "Hollywood" },
    { id: "popstars", label: "Pop Stars" },
    { id: "anime", label: "Anime" },
    { id: "fantasy", label: "Fantasy & Heroes" },
    { id: "athletes", label: "Athletes" },
    { id: "history", label: "History" },
    { id: "adultstars", label: "Adult Stars" }
  ]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-5xl h-full sm:h-[90vh] bg-neutral-950 border-0 sm:border border-zinc-800 rounded-none sm:rounded-3xl flex flex-col shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-3 sm:px-6 py-3 sm:py-4 border-b border-zinc-900 bg-zinc-950/60 pt-safe">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <div className="p-1.5 bg-zinc-900 border border-zinc-800 rounded-xl flex-shrink-0 flex items-center justify-center">
              <img src="/StirItUp.png" alt="Stir It Up" className="w-6 h-6 object-contain" />
            </div>
            <div className="min-w-0">
              <h2 className="text-sm sm:text-lg font-extrabold uppercase tracking-tight text-white flex items-center gap-1.5 truncate">
                <span className="truncate">People Catalog</span>
                <Badge variant="outline" className="border-zinc-800 text-zinc-400 text-[9px] uppercase font-bold flex-shrink-0">
                  Image-Backed
                </Badge>
              </h2>
              <p className="text-[10px] sm:text-xs text-zinc-400 truncate">
                Shared catalog for KMK, Would You Rather, and party games
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            onClick={onClose}
            className="rounded-xl h-9 w-9 p-0 hover:bg-zinc-900 text-zinc-400 hover:text-white flex-shrink-0"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1 sm:gap-2 px-3 sm:px-6 pt-2 sm:pt-3 border-b border-zinc-900 bg-neutral-950 overflow-x-auto whitespace-nowrap scrollbar-none touch-pan-x">
          <button
            onClick={() => setActiveTab("catalog")}
            className={`pb-2.5 sm:pb-3 px-2 sm:px-3 text-[11px] sm:text-xs font-bold uppercase tracking-wider transition-colors relative flex-shrink-0 ${
              activeTab === "catalog" ? "text-white" : "text-zinc-500 hover:text-zinc-300"
            }`}
          >
            Catalog ({totalCount})
            {activeTab === "catalog" && (
              <motion.div layoutId="catalogTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-zinc-100" />
            )}
          </button>
          <button
            onClick={() => setActiveTab("discover")}
            className={`pb-2.5 sm:pb-3 px-2 sm:px-3 text-[11px] sm:text-xs font-bold uppercase tracking-wider transition-colors relative flex items-center gap-1.5 flex-shrink-0 ${
              activeTab === "discover" ? "text-white" : "text-zinc-500 hover:text-zinc-300"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            Wikidata Discovery
            {activeTab === "discover" && (
              <motion.div layoutId="catalogTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-zinc-100" />
            )}
          </button>
          <button
            onClick={() => setActiveTab("submit")}
            className={`pb-2.5 sm:pb-3 px-2 sm:px-3 text-[11px] sm:text-xs font-bold uppercase tracking-wider transition-colors relative flex items-center gap-1.5 flex-shrink-0 ${
              activeTab === "submit" ? "text-white" : "text-zinc-500 hover:text-zinc-300"
            }`}
          >
            <PlusCircle className="w-3.5 h-3.5 text-zinc-400" />
            Add Person
            {activeTab === "submit" && (
              <motion.div layoutId="catalogTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-zinc-100" />
            )}
          </button>
          <button
            onClick={() => setActiveTab("moderation")}
            className={`pb-2.5 sm:pb-3 px-2 sm:px-3 text-[11px] sm:text-xs font-bold uppercase tracking-wider transition-colors relative flex items-center gap-1.5 flex-shrink-0 ${
              activeTab === "moderation" ? "text-white" : "text-zinc-500 hover:text-zinc-300"
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            Review Queue
            {submissionsForReview.length > 0 && (
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
            )}
            {activeTab === "moderation" && (
              <motion.div layoutId="catalogTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-zinc-100" />
            )}
          </button>
        </div>

        {/* Tab Body */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-6 pb-safe">
          {activeTab === "catalog" && (
            <div className="space-y-4 sm:space-y-6">
              {/* Category Pills & Search */}
              <div className="flex flex-col md:flex-row gap-2.5 sm:gap-3 justify-between items-start md:items-center">
                <div className="flex overflow-x-auto pb-1 md:pb-0 md:flex-wrap gap-1.5 w-full md:w-auto scrollbar-none touch-pan-x">
                  {categories.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => {
                        setSelectedCategory(cat.id)
                        setPage(1)
                      }}
                      className={`text-[10px] sm:text-[11px] font-bold uppercase tracking-wider px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg transition-colors border whitespace-nowrap flex-shrink-0 ${
                        selectedCategory === cat.id
                          ? "bg-zinc-100 text-black border-zinc-100 font-extrabold"
                          : "bg-zinc-900/60 text-zinc-400 border-zinc-800 hover:text-white"
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>

                <form onSubmit={handleSearchSubmit} className="flex gap-2 w-full md:w-auto">
                  <div className="relative flex-1 md:w-64">
                    <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-3" />
                    <Input
                      placeholder="Search catalog..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="bg-zinc-900/60 border-zinc-800 rounded-xl pl-9 h-10 text-base sm:text-xs text-white"
                    />
                  </div>
                  <Button type="submit" variant="outline" className="border-zinc-800 text-xs h-10 px-4 rounded-xl font-bold uppercase">
                    Search
                  </Button>
                </form>
              </div>

              {/* People Grid */}
              {loading ? (
                <div className="py-24 text-center text-zinc-500 text-xs uppercase tracking-wider">
                  Loading catalog people...
                </div>
              ) : people.length === 0 ? (
                <div className="py-24 text-center space-y-2">
                  <p className="text-zinc-400 text-sm">No people found matching your filter.</p>
                  <Button
                    onClick={() => {
                      setSelectedCategory("all")
                      setSearchQuery("")
                      setPage(1)
                      fetchPeople(1, "all", "")
                    }}
                    variant="outline"
                    className="border-zinc-800 text-xs rounded-xl"
                  >
                    Reset Filters
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                  {people.map((person) => {
                    const primaryImg = person.primaryImage || person.images?.[0]
                    const hasVerifiedImage = primaryImg && primaryImg.verificationStatus === "verified"

                    return (
                      <div
                        key={person.id}
                        className="group bg-zinc-900/40 border border-zinc-800/80 hover:border-zinc-700 rounded-2xl overflow-hidden transition-all flex flex-col justify-between"
                      >
                        {/* Image Preview Container */}
                        <div className="relative aspect-square w-full bg-zinc-950 overflow-hidden">
                          <img
                            src={primaryImg?.thumbnailUrl || primaryImg?.url || "/placeholder-user.jpg"}
                            alt={person.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            onError={(e) => {
                              ;(e.target as HTMLImageElement).src = "/placeholder-user.jpg"
                            }}
                          />
                          <div className="absolute top-2 right-2">
                            <Badge
                              variant="secondary"
                              className="bg-black/70 backdrop-blur-md border border-zinc-800 text-zinc-300 text-[9px] uppercase font-bold px-2 py-0.5"
                            >
                              {person.category}
                            </Badge>
                          </div>
                          {person.provider === "wikidata" && (
                            <div className="absolute top-2 left-2">
                              <Badge
                                variant="outline"
                                className="bg-amber-950/80 border-amber-800 text-amber-300 text-[8px] font-bold px-1.5 py-0.2"
                              >
                                Wikidata
                              </Badge>
                            </div>
                          )}
                        </div>

                        {/* Person Info & Attribution */}
                        <div className="p-3.5 flex flex-col justify-between flex-1 space-y-2">
                          <div>
                            <h4 className="font-bold text-sm text-white line-clamp-1 group-hover:text-amber-300 transition-colors">
                              {person.name}
                            </h4>
                            {person.description && (
                              <p className="text-[11px] text-zinc-400 line-clamp-1 mt-0.5">
                                {person.description}
                              </p>
                            )}
                          </div>

                          {/* Image Provenance & Licensing Badge */}
                          <div className="pt-2 border-t border-zinc-900 flex flex-col gap-1 text-[10px] text-zinc-400">
                            <div className="flex items-center justify-between">
                              <span className="flex items-center gap-1 font-medium text-zinc-400">
                                <ShieldCheck className="w-3 h-3 text-emerald-400" />
                                {primaryImg?.license || "Local Seed"}
                              </span>
                              {primaryImg?.sourceUrl && primaryImg.sourceUrl !== "/placeholder-user.jpg" && (
                                <a
                                  href={primaryImg.sourceUrl}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="text-zinc-500 hover:text-white flex items-center gap-0.5"
                                  title="View Wikimedia Commons source page"
                                >
                                  Provenance
                                  <ExternalLink className="w-2.5 h-2.5" />
                                </a>
                              )}
                            </div>
                            {primaryImg?.author && (
                              <p className="text-[9px] text-zinc-500 line-clamp-1 truncate" title={primaryImg.author}>
                                Credit: {primaryImg.author}
                              </p>
                            )}

                            {/* Card Action Controls: Matching Pipeline & Report */}
                            <div className="pt-2 flex gap-1.5 justify-between">
                              <button
                                onClick={() => handleRunMatchingPipeline(person)}
                                className="text-[9px] uppercase font-bold tracking-wider px-2 py-1 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white flex items-center gap-1"
                                title="Run source-aware image matching pipeline"
                              >
                                <SlidersHorizontal className="w-2.5 h-2.5 text-amber-400" />
                                Match
                              </button>
                              <button
                                onClick={() => {
                                  setReportTarget({ id: person.id, name: person.name, type: "person" })
                                  setReportModalOpen(true)
                                }}
                                className="text-[9px] uppercase font-bold tracking-wider px-2 py-1 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-red-400 flex items-center gap-1"
                                title="Report mismatched identity or request removal"
                              >
                                <Flag className="w-2.5 h-2.5" />
                                Report
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between pt-4 border-t border-zinc-900">
                  <span className="text-xs text-zinc-500">
                    Showing Page {page} of {totalPages} ({totalCount} total personalities)
                  </span>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page <= 1}
                      variant="outline"
                      className="border-zinc-800 rounded-xl h-9 text-xs px-3"
                    >
                      <ChevronLeft className="w-4 h-4 mr-1" />
                      Previous
                    </Button>
                    <Button
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                      disabled={page >= totalPages}
                      variant="outline"
                      className="border-zinc-800 rounded-xl h-9 text-xs px-3"
                    >
                      Next
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === "discover" && (
            <div className="space-y-6">
              <div className="bg-zinc-900/30 border border-zinc-800/80 p-5 rounded-2xl space-y-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <h3 className="font-bold text-sm uppercase tracking-wider text-white">
                    Live Wikidata & Wikimedia Discovery
                  </h3>
                </div>
                <p className="text-xs text-zinc-400 max-w-2xl leading-relaxed">
                  Search millions of real-world personalities. Stir It Up retrieves entity metadata, Commons candidate portraits, and license provenance directly from Wikidata.
                </p>

                <form onSubmit={handleDiscover} className="flex flex-col sm:flex-row gap-2 pt-2">
                  <Input
                    placeholder="Enter name (e.g. Shah Rukh Khan, Zendaya, Ada Lovelace, Bad Bunny)..."
                    value={discoverQuery}
                    onChange={(e) => setDiscoverQuery(e.target.value)}
                    className="bg-zinc-900 border-zinc-800 rounded-xl text-base sm:text-xs text-white placeholder-zinc-500 h-11 flex-1"
                  />
                  <Button
                    type="submit"
                    disabled={discovering || !discoverQuery.trim()}
                    className="h-11 px-6 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-black font-bold uppercase tracking-wider text-xs border-0 flex-shrink-0"
                  >
                    {discovering ? "Searching..." : "Discover"}
                  </Button>
                </form>
              </div>

              {/* Discovery Candidates */}
              {discovering ? (
                <div className="py-20 text-center text-zinc-500 text-xs uppercase tracking-wider">
                  Querying Wikidata and Wikimedia Commons APIs...
                </div>
              ) : candidates.length > 0 ? (
                <div className="space-y-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                    Discovered Candidates ({candidates.length})
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                    {candidates.map((cand) => {
                      const img = cand.primaryCandidateImage
                      const isImported = importSuccess === cand.externalId

                      return (
                        <div
                          key={cand.externalId}
                          className="bg-zinc-900/40 border border-zinc-800 p-3 sm:p-4 rounded-2xl flex flex-col sm:flex-row gap-3 sm:gap-4 items-start justify-between"
                        >
                          <div className="flex gap-3 sm:gap-3.5 flex-1 min-w-0">
                            <div className="relative w-16 h-16 sm:w-20 sm:h-20 bg-zinc-950 rounded-xl overflow-hidden flex-shrink-0 border border-zinc-800">
                              <img
                                src={img?.thumbnailUrl || "/placeholder-user.jpg"}
                                alt={cand.name}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  ;(e.target as HTMLImageElement).src = "/placeholder-user.jpg"
                                }}
                              />
                              {!cand.hasPortrait && (
                                <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-[8px] uppercase font-bold text-zinc-400 text-center px-1">
                                  No Portrait
                                </div>
                              )}
                            </div>

                            <div className="space-y-1 flex-1 min-w-0">
                              <div className="flex items-center gap-1.5 sm:gap-2">
                                <h5 className="font-bold text-xs sm:text-sm text-white truncate">{cand.name}</h5>
                                <Badge variant="outline" className="text-[8px] sm:text-[9px] uppercase border-zinc-800 text-zinc-400 flex-shrink-0">
                                  {cand.category}
                                </Badge>
                              </div>
                              <p className="text-[10px] sm:text-[11px] text-zinc-400 line-clamp-1">{cand.description || "Wikidata personality"}</p>
                              <div className="flex flex-wrap gap-1.5 sm:gap-2 text-[9px] sm:text-[10px] text-zinc-500 pt-0.5">
                                <span>ID: {cand.externalId}</span>
                                <span>•</span>
                                <span>Gender: {cand.gender}</span>
                              </div>

                              {img && (
                                <div className="pt-1 flex items-center gap-2 text-[9px] text-zinc-400">
                                  <span className="text-emerald-400 font-semibold">{img.license}</span>
                                  {img.author && <span className="truncate">• by {img.author}</span>}
                                  {img.sourcePageUrl && (
                                    <a
                                      href={img.sourcePageUrl}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="text-zinc-500 hover:text-white flex items-center gap-0.5 ml-auto flex-shrink-0"
                                    >
                                      Provenance
                                      <ExternalLink className="w-2.5 h-2.5" />
                                    </a>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="w-full sm:w-auto flex-shrink-0">
                            <Button
                              onClick={() => handleImportCandidate(cand)}
                              disabled={importingQid === cand.externalId || isImported}
                              variant={isImported ? "secondary" : "outline"}
                              className={`w-full sm:w-auto rounded-xl text-xs h-10 sm:h-9 px-3 ${
                                isImported
                                  ? "bg-emerald-950/60 border-emerald-800 text-emerald-300"
                                  : "border-zinc-800 text-zinc-200 hover:bg-zinc-800"
                              }`}
                            >
                              {isImported ? (
                                <>
                                  <Check className="w-3.5 h-3.5 mr-1 text-emerald-400" />
                                  Imported
                                </>
                              ) : importingQid === cand.externalId ? (
                                "Importing..."
                              ) : (
                                "Add to Catalog"
                              )}
                            </Button>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              ) : null}
            </div>
          )}

          {activeTab === "submit" && (
            <div className="max-w-xl mx-auto space-y-5 sm:space-y-6 py-2 sm:py-4">
              <div className="space-y-1.5 sm:space-y-2">
                <h3 className="font-bold text-sm sm:text-base uppercase tracking-tight text-white flex items-center gap-2">
                  <PlusCircle className="w-4 h-4 text-amber-400" />
                  Community Person Submission
                </h3>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Submit a personality or authorized portrait. Community submissions enter the review queue and <strong>never enter public games before approval</strong>.
                </p>
              </div>

              {submitSuccess && (
                <div className="p-3.5 sm:p-4 bg-emerald-950/60 border border-emerald-800/80 rounded-2xl flex items-center gap-3 text-emerald-300 text-xs">
                  <Check className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                  <span>Submission received in pending state! Our moderators will review and approve it.</span>
                </div>
              )}

              {submitError && (
                <div className="p-3.5 sm:p-4 bg-red-950/60 border border-red-800/80 rounded-2xl flex items-center gap-3 text-red-300 text-xs">
                  <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0" />
                  <span>{submitError}</span>
                </div>
              )}

              <form onSubmit={handleSubmitSuggestion} className="space-y-3 sm:space-y-4">
                <div>
                  <label className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-zinc-400 block mb-1">
                    Personality Name *
                  </label>
                  <Input
                    required
                    placeholder="e.g. Pedro Pascal, Billie Eilish, Gojo Satoru"
                    value={submitName}
                    onChange={(e) => setSubmitName(e.target.value)}
                    className="bg-zinc-900 border-zinc-800 rounded-xl text-base sm:text-xs text-white h-11"
                  />
                </div>

                <div>
                  <label className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-zinc-400 block mb-1">
                    Category *
                  </label>
                  <select
                    value={submitCategory}
                    onChange={(e) => setSubmitCategory(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl text-base sm:text-xs text-white h-11 px-3 focus:outline-none focus:border-zinc-700"
                  >
                    <option value="hollywood">Hollywood</option>
                    <option value="bollywood">Bollywood</option>
                    <option value="popstars">Pop Stars & Music</option>
                    <option value="fantasy">Anime & Fantasy</option>
                    <option value="adultstars">Adult Stars & Models</option>
                    <option value="athletes">Athletes</option>
                    <option value="other">Other / Meme</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-zinc-400 block mb-1">
                    Authorized Image URL (Optional)
                  </label>
                  <Input
                    placeholder="https://upload.wikimedia.org/... or authorized image"
                    value={submitImageUrl}
                    onChange={(e) => setSubmitImageUrl(e.target.value)}
                    className="bg-zinc-900 border-zinc-800 rounded-xl text-base sm:text-xs text-white h-11"
                  />
                </div>

                <div>
                  <label className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-zinc-400 block mb-1">
                    Profile / Source URL (Optional)
                  </label>
                  <Input
                    placeholder="https://en.wikipedia.org/... or official bio"
                    value={submitProfileUrl}
                    onChange={(e) => setSubmitProfileUrl(e.target.value)}
                    className="bg-zinc-900 border-zinc-800 rounded-xl text-base sm:text-xs text-white h-11"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 block mb-1.5">
                    Your Name / Submitter Handle
                  </label>
                  <Input
                    placeholder="Your handle or gamer tag"
                    value={submitterName}
                    onChange={(e) => setSubmitterName(e.target.value)}
                    className="bg-zinc-900 border-zinc-800 rounded-xl text-base sm:text-xs text-white h-11"
                  />
                </div>

                {/* Privacy & Consent Controls */}
                <div className="pt-2 space-y-2 border-t border-zinc-900">
                  <label className="flex items-start gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={consentConfirmed}
                      onChange={(e) => setConsentConfirmed(e.target.checked)}
                      className="mt-1 accent-amber-400"
                    />
                    <span className="text-xs text-zinc-400 leading-snug">
                      I confirm that this person is a public figure or that explicit authorization and consent has been obtained for inclusion in game prompts.
                    </span>
                  </label>

                  <label className="flex items-start gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isPrivateIndividual}
                      onChange={(e) => setIsPrivateIndividual(e.target.checked)}
                      className="mt-1 accent-amber-400"
                    />
                    <span className="text-xs text-zinc-400 leading-snug">
                      Check if this is a private individual (enforces immediate takedown compliance rights and privacy retention policies).
                    </span>
                  </label>
                </div>

                <Button
                  type="submit"
                  disabled={submitting || !submitName.trim() || !consentConfirmed}
                  className="w-full h-11 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-black font-bold uppercase tracking-wider text-xs border-0 mt-2"
                >
                  {submitting ? "Submitting..." : "Submit for Moderation"}
                </Button>
              </form>
            </div>
          )}

          {activeTab === "moderation" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold uppercase tracking-tight text-white flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    Pending Community Submissions
                  </h3>
                  <p className="text-xs text-zinc-400">
                    Review submissions and check auto-detected duplicate candidates before approving for public game catalog.
                  </p>
                </div>
                <Button
                  onClick={fetchModerationQueue}
                  variant="outline"
                  className="border-zinc-800 text-xs rounded-xl h-9"
                >
                  <RefreshCw className="w-3.5 h-3.5 mr-1" />
                  Refresh
                </Button>
              </div>

              {moderationActionMsg && (
                <div className="p-3 bg-emerald-950/60 border border-emerald-800 rounded-xl text-emerald-300 text-xs flex items-center gap-2">
                  <Check className="w-4 h-4" />
                  <span>{moderationActionMsg}</span>
                </div>
              )}

              {moderationLoading ? (
                <div className="py-20 text-center text-zinc-500 text-xs uppercase tracking-wider">
                  Loading review queue...
                </div>
              ) : submissionsForReview.length === 0 ? (
                <div className="py-24 text-center text-zinc-500 text-xs uppercase tracking-wider">
                  No submissions pending review!
                </div>
              ) : (
                <div className="space-y-4">
                  {submissionsForReview.map((item) => {
                    const sub = item.submission
                    const data = sub.proposedData || {}
                    const dups = item.duplicateSuggestions || []

                    return (
                      <div
                        key={sub.id}
                        className="bg-zinc-900/40 border border-zinc-800 p-4 rounded-2xl space-y-3"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="font-extrabold text-sm text-white">{data.name}</h4>
                              <Badge variant="outline" className="text-[9px] uppercase border-zinc-800">
                                {data.category}
                              </Badge>
                              <Badge className="bg-amber-500/10 border-amber-500/30 text-amber-400 text-[9px] uppercase">
                                Pending Review
                              </Badge>
                            </div>
                            <p className="text-[11px] text-zinc-400 pt-1">
                              Submitted by: {sub.submitterName || "Anonymous"} • Submitted on: {new Date(sub.createdAt).toLocaleDateString()}
                            </p>
                          </div>

                          <div className="flex gap-2">
                            <Button
                              onClick={() => handleModerationAction("approve", sub.id)}
                              className="h-8 px-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-bold uppercase"
                            >
                              <Check className="w-3.5 h-3.5 mr-1" /> Approve
                            </Button>
                            <Button
                              onClick={() => handleModerationAction("reject", sub.id)}
                              variant="outline"
                              className="h-8 px-3 rounded-xl border-zinc-800 hover:bg-zinc-800 text-red-400 text-xs font-bold uppercase"
                            >
                              <X className="w-3.5 h-3.5 mr-1" /> Reject
                            </Button>
                          </div>
                        </div>

                        {/* Duplicate Detection Alert for Reviewer */}
                        {dups.length > 0 && (
                          <div className="p-3 bg-amber-950/30 border border-amber-800/60 rounded-xl space-y-1">
                            <span className="text-[10px] font-bold uppercase text-amber-400 flex items-center gap-1">
                              <AlertTriangle className="w-3 h-3" />
                              Potential Existing Duplicate Detected:
                            </span>
                            <div className="flex flex-wrap gap-2 pt-0.5">
                              {dups.map((d: any) => (
                                <Badge key={d.person.id} variant="secondary" className="text-[10px] bg-black/60 border border-zinc-800">
                                  {d.person.name} ({d.person.category}) - {d.matchType}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </motion.div>

      {/* Matching Pipeline Modal */}
      {matchingModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="bg-neutral-950 border border-zinc-800 rounded-2xl max-w-xl w-full p-6 space-y-4 max-h-[85vh] overflow-y-auto shadow-2xl">
            <div className="flex justify-between items-center border-b border-zinc-900 pb-3">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-amber-400" />
                <h3 className="font-extrabold text-sm uppercase text-white">
                  Source-Aware Image Matching: {matchingPerson?.name}
                </h3>
              </div>
              <Button
                variant="ghost"
                onClick={() => setMatchingModalOpen(false)}
                className="h-7 w-7 p-0 text-zinc-400"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            {matchingLoading ? (
              <div className="py-16 text-center text-xs text-zinc-500 uppercase tracking-wider">
                Searching providers and scoring identity candidates...
              </div>
            ) : matchingResult ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-zinc-900/50 border border-zinc-800 rounded-xl">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-zinc-400 block">Pipeline Status</span>
                    <span className="text-xs font-black uppercase text-white">{matchingResult.status}</span>
                  </div>
                  <Badge
                    className={
                      matchingResult.status === "matched"
                        ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                        : matchingResult.status === "ambiguous_review_needed"
                        ? "bg-amber-500/20 text-amber-400 border-amber-500/30"
                        : "bg-red-500/20 text-red-400 border-red-500/30"
                    }
                  >
                    {matchingResult.status === "ambiguous_review_needed"
                      ? "Flagged for Human Review"
                      : matchingResult.status}
                  </Badge>
                </div>

                <div className="space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                    Ranked Identity Candidates ({matchingResult.rankedCandidates.length})
                  </h4>

                  {matchingResult.rankedCandidates.map((cand, idx) => (
                    <div
                      key={cand.candidate.externalId}
                      className="p-3 bg-zinc-900/30 border border-zinc-800 rounded-xl space-y-2 text-xs"
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex gap-2.5 items-center">
                          <img
                            src={cand.candidate.primaryCandidateImage?.thumbnailUrl || "/placeholder-user.jpg"}
                            className="w-12 h-12 object-cover rounded-lg border border-zinc-800"
                            alt={cand.candidate.name}
                          />
                          <div>
                            <span className="font-bold text-white block">{cand.candidate.name}</span>
                            <span className="text-[10px] text-zinc-400">{cand.candidate.description || "No description"}</span>
                          </div>
                        </div>

                        <div className="text-right">
                          <span className="font-black text-sm text-amber-400">{cand.score}/100</span>
                          <span className="block text-[9px] uppercase text-zinc-500">{cand.confidence}</span>
                        </div>
                      </div>

                      <p className="text-[10px] text-zinc-400 leading-relaxed bg-zinc-950 p-2 rounded-lg">
                        <strong>Reasoning:</strong> {cand.reasoning}
                      </p>

                      <div className="flex justify-end gap-2 pt-1">
                        <Button
                          onClick={() => handleRejectMatchCandidate(cand, "Mismatched person identity")}
                          size="sm"
                          variant="outline"
                          className="border-zinc-800 text-[10px] h-7 text-red-400 hover:bg-zinc-900"
                        >
                          Reject Match
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        </div>
      )}

      {/* Reporting & Takedown Modal */}
      {reportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="bg-neutral-950 border border-zinc-800 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex justify-between items-center border-b border-zinc-900 pb-3">
              <div className="flex items-center gap-2">
                <Flag className="w-4 h-4 text-red-400" />
                <h3 className="font-extrabold text-sm uppercase text-white">
                  Report or Request Removal
                </h3>
              </div>
              <Button
                variant="ghost"
                onClick={() => setReportModalOpen(false)}
                className="h-7 w-7 p-0 text-zinc-400"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            {reportSuccess ? (
              <div className="py-8 text-center space-y-2">
                <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
                <p className="text-xs text-white font-bold">Report Filed Successfully</p>
                <p className="text-[11px] text-zinc-400">Content has been queued for immediate review or takedown.</p>
              </div>
            ) : (
              <form onSubmit={handleFileReport} className="space-y-3.5">
                <div>
                  <label className="text-[10px] uppercase font-bold text-zinc-400 block mb-1">
                    Reporting Target
                  </label>
                  <p className="text-xs font-bold text-white bg-zinc-900/60 p-2.5 rounded-xl border border-zinc-800">
                    {reportTarget?.name}
                  </p>
                </div>

                <div>
                  <label className="text-[10px] uppercase font-bold text-zinc-400 block mb-1">
                    Reason *
                  </label>
                  <select
                    value={reportReason}
                    onChange={(e) => setReportReason(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-white h-10 px-3 focus:outline-none"
                  >
                    <option value="incorrect_identity">Incorrect portrait / Wrong person</option>
                    <option value="privacy_violation">Privacy violation / Private individual</option>
                    <option value="copyright_infringement">Copyright infringement / DMCA</option>
                    <option value="non_consensual_image">Non-consensual image</option>
                    <option value="inappropriate_content">Inappropriate content</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] uppercase font-bold text-zinc-400 block mb-1">
                    Details
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Provide context or link to correct information..."
                    value={reportDetails}
                    onChange={(e) => setReportDetails(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-white p-3 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-[10px] uppercase font-bold text-zinc-400 block mb-1">
                    Your Contact Email (Optional)
                  </label>
                  <Input
                    type="email"
                    placeholder="name@example.com"
                    value={reporterEmail}
                    onChange={(e) => setReporterEmail(e.target.value)}
                    className="bg-zinc-900 border-zinc-800 text-xs text-white h-10"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={reportSubmitting}
                  className="w-full h-10 bg-red-600 hover:bg-red-500 text-white font-bold uppercase text-xs rounded-xl border-0"
                >
                  {reportSubmitting ? "Submitting..." : "Submit Report / Takedown"}
                </Button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
