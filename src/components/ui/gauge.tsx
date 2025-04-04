interface GaugeProps {
  value: number // Percentage value for the gauge arc
  max: number   // Max value for the percentage calculation (usually 100)
  size?: "sm" | "md" | "lg"
  showCounts?: boolean // Control showing correct/total counts text
  correctCount?: number // Number of correct items
  totalCount?: number   // Total number of items
  // color and subtitle props are not used, removed from this specific implementation
}

const Gauge = ({ value, max = 100, size = "md", showCounts = false, correctCount = 0, totalCount = 0 }: GaugeProps) => {
  // Ensure percentage calculation is safe for max=0
  // Use 'value' and 'max' for the visual percentage calculation
  const percentage = max > 0 ? Math.round((value / max) * 100) : 0;
  const radius = size === "sm" ? 40 : size === "md" ? 60 : 80
  const strokeWidth = size === "sm" ? 8 : size === "md" ? 10 : 12
  const circumference = 2 * Math.PI * radius
  // Ensure strokeDashoffset doesn't exceed circumference
  const offsetPercentage = Math.max(0, Math.min(100, percentage));
  const strokeDashoffset = circumference - (offsetPercentage / 100) * circumference

  // Determine color based on percentage
  const getColorByPercentage = (percent: number) => {
    if (percent < 50) return "#ef4444" // red-500
    if (percent < 70) return "#f97316" // orange-500
    if (percent < 80) return "#eab308" // yellow-500
    if (percent < 90) return "#84cc16" // lime-500 (adjusted from light green for better visibility)
    return "#22c55e" // green-500 (adjusted from dark green)
  }

  const color = getColorByPercentage(percentage)

  return (
    <div className="relative inline-flex flex-col items-center justify-center">
      <svg
        className="transform -rotate-90"
        width={radius * 2 + strokeWidth * 2}
        height={radius * 2 + strokeWidth * 2}
        viewBox={`0 0 ${radius * 2 + strokeWidth * 2} ${radius * 2 + strokeWidth * 2}`}
      >
        {/* Background circle */}
        <circle
          cx={radius + strokeWidth}
          cy={radius + strokeWidth}
          r={radius}
          fill="none"
          stroke="#e5e7eb" // Change to light gray (e.g., gray-200)
          strokeWidth={strokeWidth}
        />
        {/* Foreground circle (gauge value) */}
        <circle
          cx={radius + strokeWidth}
          cy={radius + strokeWidth}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 0.5s ease-out, stroke 0.5s ease-out' }} // Add transition for color too
        />
      </svg>
      <div className="absolute flex flex-col items-center justify-center">
        {/* Display percentage inside the gauge */}
        <span className={`font-bold ${size === "sm" ? "text-xl" : size === "md" ? "text-3xl" : "text-5xl"}`}>
          {percentage}%
        </span>
         {/* Optionally show value/max below percentage */}
        {showCounts && (
           <span
             className={`text-muted-foreground ${size === "sm" ? "text-xs" : size === "md" ? "text-sm" : "text-base"}`}
           >
             {/* Use correctCount and totalCount for the text display */}
             {correctCount} / {totalCount}
           </span>
        )}
      </div>
    </div>
  )
}

export default Gauge;

// Keep the interface export if needed elsewhere
export type { GaugeProps };