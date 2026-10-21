import { runIncrementalCatalogRefresh } from "../lib/catalog/refresh-service"

async function main() {
  console.log("[Catalog Refresh CLI] Starting incremental catalog refresh and image revalidation...")
  try {
    const stats = await runIncrementalCatalogRefresh({
      batchSize: 10,
      dryRun: false
    })
    console.log("[Catalog Refresh CLI] Completed successfully:")
    console.log(`- Job ID: ${stats.jobId}`)
    console.log(`- Processed: ${stats.processed}`)
    console.log(`- Verified OK: ${stats.verifiedOk}`)
    console.log(`- Broken Detected: ${stats.brokenDetected}`)
    console.log(`- Switched to Placeholder: ${stats.switchedToPlaceholder}`)
    console.log(`- Duration: ${stats.durationMs}ms`)
    process.exit(0)
  } catch (err: any) {
    console.error("[Catalog Refresh CLI] Job error:", err.message)
    process.exit(1)
  }
}

main()
