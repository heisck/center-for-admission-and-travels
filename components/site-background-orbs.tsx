/**
 * Soft orange circular accents behind the UI on every page.
 * Absolute (not fixed) so they scroll with the page.
 * Sparse — not too many.
 */
export default function SiteBackgroundOrbs() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 z-0 min-h-full overflow-hidden"
    >
      {/* Large soft orbs — spaced down the page so longer routes still show accents */}
      <div className="absolute -top-16 -left-10 h-[22rem] w-[22rem] rounded-full bg-orange-400/25 blur-2xl" />
      <div className="absolute top-[22%] -right-20 h-[26rem] w-[26rem] rounded-full bg-orange-500/20 blur-2xl" />
      <div className="absolute top-[48%] left-[8%] h-[18rem] w-[18rem] rounded-full bg-orange-300/20 blur-2xl" />
      <div className="absolute top-[72%] right-[12%] h-[20rem] w-[20rem] rounded-full bg-red-400/12 blur-2xl" />
      <div className="absolute bottom-0 left-[25%] h-[16rem] w-[16rem] rounded-full bg-orange-400/15 blur-2xl" />

      {/* Medium / small clean circles */}
      <div className="absolute top-[12%] right-[14%] h-36 w-36 rounded-full border-2 border-orange-400/30 bg-orange-400/15" />
      <div className="absolute top-[38%] left-[5%] h-24 w-24 rounded-full border border-orange-500/25 bg-orange-500/12" />
      <div className="absolute top-[58%] right-[8%] h-20 w-20 rounded-full bg-orange-500/18" />
      <div className="absolute top-[68%] left-[40%] h-14 w-14 rounded-full border border-orange-400/30 bg-orange-400/10" />
      <div className="absolute top-[85%] right-[30%] h-28 w-28 rounded-full border-2 border-orange-300/25 bg-orange-300/12" />
    </div>
  )
}
