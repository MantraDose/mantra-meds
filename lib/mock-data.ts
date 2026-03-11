// Mock data for MantraDose Dashboard

export const categoryColors: Record<string, { bg: string; text: string }> = {
  Bars:     { bg: "rgba(221,10,139,0.15)", text: "#dd0a8b" },
  Capsules: { bg: "rgba(62,50,191,0.20)",  text: "#7c6ff7" },
  Gummies:  { bg: "rgba(34,211,238,0.15)", text: "#22d3ee" },
  Minis:    { bg: "rgba(250,204,21,0.15)", text: "#facc15" },
  RAW:      { bg: "rgba(249,115,22,0.15)", text: "#f97316" },
  Tantra:   { bg: "rgba(167,139,250,0.15)", text: "#a78bfa" },
}

export const revenueByMonth = [
  { month: "Mar 25", revenue: 42300, units: 1850 },
  { month: "Apr 25", revenue: 51200, units: 2210 },
  { month: "May 25", revenue: 48700, units: 2050 },
  { month: "Jun 25", revenue: 55400, units: 2390 },
  { month: "Jul 25", revenue: 61800, units: 2680 },
  { month: "Aug 25", revenue: 58200, units: 2510 },
  { month: "Sep 25", revenue: 64500, units: 2790 },
  { month: "Oct 25", revenue: 71200, units: 3080 },
  { month: "Nov 25", revenue: 68900, units: 2970 },
  { month: "Dec 25", revenue: 82400, units: 3560 },
  { month: "Jan 26", revenue: 76300, units: 3290 },
  { month: "Feb 26", revenue: 79800, units: 3440 },
]

export const categoryPerformance = [
  { name: "Bars", revenue: 186400, units: 8120, color: "#dd0a8b" },
  { name: "Capsules", revenue: 142800, units: 6540, color: "#3E32BF" },
  { name: "Gummies", revenue: 128300, units: 5870, color: "#22d3ee" },
  { name: "Minis", revenue: 97600, units: 4230, color: "#facc15" },
  { name: "RAW", revenue: 84200, units: 3650, color: "#f97316" },
  { name: "Tantra", revenue: 121500, units: 5410, color: "#a78bfa" },
]

export const topProducts = [
  { id: 1, name: "MantraDose Classic Bar", category: "Bars", unitsSold: 3240, revenue: 72800, avgPrice: 22.47 },
  { id: 2, name: "MantraDose Calm Capsules", category: "Capsules", unitsSold: 2890, revenue: 63580, avgPrice: 22.0 },
  { id: 3, name: "MantraDose Tantra Gummies", category: "Tantra", unitsSold: 2650, revenue: 58300, avgPrice: 22.0 },
  { id: 4, name: "MantraDose Focus Gummies", category: "Gummies", unitsSold: 2410, revenue: 50610, avgPrice: 21.0 },
  { id: 5, name: "MantraDose RAW Extract", category: "RAW", unitsSold: 2180, revenue: 47960, avgPrice: 22.0 },
]

export const channelData = [
  { month: "Mar 25", wholesale: 25380, retail: 16920 },
  { month: "Apr 25", wholesale: 30720, retail: 20480 },
  { month: "May 25", wholesale: 29220, retail: 19480 },
  { month: "Jun 25", wholesale: 33240, retail: 22160 },
  { month: "Jul 25", wholesale: 37080, retail: 24720 },
  { month: "Aug 25", wholesale: 34920, retail: 23280 },
  { month: "Sep 25", wholesale: 38700, retail: 25800 },
  { month: "Oct 25", wholesale: 42720, retail: 28480 },
  { month: "Nov 25", wholesale: 41340, retail: 27560 },
  { month: "Dec 25", wholesale: 49440, retail: 32960 },
  { month: "Jan 26", wholesale: 45780, retail: 30520 },
  { month: "Feb 26", wholesale: 47880, retail: 31920 },
]

// Deterministic "random" per index so SSR and client render the same
function seeded(i: number, maxInclusive: number, minInclusive: number) {
  const x = Math.sin(i * 9999) * 10000
  const u = x - Math.floor(x)
  return minInclusive + Math.floor(u * (maxInclusive - minInclusive + 1))
}

export const products = [
  { id: 1, name: "MantraDose Classic Bar", category: "Bars", unitsSold: 3240, revenue: 72800, avgPrice: 22.47, lastSale: "2026-02-14", status: "Active" as const },
  { id: 2, name: "MantraDose Calm Capsules", category: "Capsules", unitsSold: 2890, revenue: 63580, avgPrice: 22.0, lastSale: "2026-02-15", status: "Active" as const },
  { id: 3, name: "MantraDose Tantra Gummies", category: "Tantra", unitsSold: 2650, revenue: 58300, avgPrice: 22.0, lastSale: "2026-02-13", status: "Active" as const },
  { id: 4, name: "MantraDose Focus Gummies", category: "Gummies", unitsSold: 2410, revenue: 50610, avgPrice: 21.0, lastSale: "2026-02-12", status: "Active" as const },
  { id: 5, name: "MantraDose RAW Extract", category: "RAW", unitsSold: 2180, revenue: 47960, avgPrice: 22.0, lastSale: "2026-02-10", status: "Active" as const },
  { id: 6, name: "MantraDose Mini Bites", category: "Minis", unitsSold: 1950, revenue: 38220, avgPrice: 19.6, lastSale: "2026-02-11", status: "Active" as const },
  { id: 7, name: "MantraDose Energy Capsules", category: "Capsules", unitsSold: 1820, revenue: 40040, avgPrice: 22.0, lastSale: "2026-02-09", status: "Active" as const },
  { id: 8, name: "MantraDose Bliss Bar", category: "Bars", unitsSold: 1690, revenue: 37180, avgPrice: 22.0, lastSale: "2026-02-08", status: "Active" as const },
  { id: 9, name: "MantraDose Sleep Gummies", category: "Gummies", unitsSold: 1540, revenue: 32340, avgPrice: 21.0, lastSale: "2026-01-28", status: "Active" as const },
  { id: 10, name: "MantraDose Tantra Capsules", category: "Tantra", unitsSold: 1380, revenue: 30360, avgPrice: 22.0, lastSale: "2026-01-25", status: "Active" as const },
  { id: 11, name: "MantraDose RAW Powder", category: "RAW", unitsSold: 820, revenue: 19680, avgPrice: 24.0, lastSale: "2026-01-15", status: "Active" as const },
  { id: 12, name: "MantraDose Mini Sample Pack", category: "Minis", unitsSold: 450, revenue: 6750, avgPrice: 15.0, lastSale: "2025-12-20", status: "Inactive" as const },
]

export const capTable = [
  { member: "Mars", shares: 250000, ownership: 22.24 },
  { member: "Venus", shares: 200000, ownership: 17.79 },
  { member: "Derek", shares: 362600, ownership: 32.26 },
  { member: "Miguel", shares: 77000, ownership: 6.85 },
  { member: "Chris", shares: 77000, ownership: 6.85 },
  { member: "Andrew", shares: 22500, ownership: 2 },
]

export const dividendHistory = [
  { month: "Jan 2025", wholesaleRev: 38200, retailRev: 14800, totalDividend: 3390, status: "Paid" as const },
  { month: "Feb 2025", wholesaleRev: 41500, retailRev: 16200, totalDividend: 3695, status: "Paid" as const },
  { month: "Mar 2025", wholesaleRev: 44100, retailRev: 17800, totalDividend: 3985, status: "Paid" as const },
  { month: "Apr 2025", wholesaleRev: 48700, retailRev: 19500, totalDividend: 4385, status: "Paid" as const },
  { month: "May 2025", wholesaleRev: 46200, retailRev: 18900, totalDividend: 4200, status: "Paid" as const },
  { month: "Jun 2025", wholesaleRev: 52800, retailRev: 21600, totalDividend: 4800, status: "Paid" as const },
  { month: "Jul 2025", wholesaleRev: 56400, retailRev: 23400, totalDividend: 5160, status: "Paid" as const },
  { month: "Aug 2025", wholesaleRev: 53600, retailRev: 22200, totalDividend: 4900, status: "Paid" as const },
  { month: "Sep 2025", wholesaleRev: 58200, retailRev: 24300, totalDividend: 5340, status: "Paid" as const },
  { month: "Oct 2025", wholesaleRev: 63800, retailRev: 26400, totalDividend: 5830, status: "Paid" as const },
  { month: "Nov 2025", wholesaleRev: 61200, retailRev: 25500, totalDividend: 5610, status: "Paid" as const },
  { month: "Dec 2025", wholesaleRev: 72400, retailRev: 30000, totalDividend: 6620, status: "Paid" as const },
  { month: "Jan 2026", wholesaleRev: 68400, retailRev: 28200, totalDividend: 6240, status: "Paid" as const },
  { month: "Feb 2026", wholesaleRev: 71800, retailRev: 29600, totalDividend: 6550, status: "Pending" as const },
]

export const payables = [
  { id: 1, vendor: "Cacao Supply Co", amount: 12400, dueDate: "2026-02-28", category: "Raw Materials", status: "Pending" as const, notes: "Monthly cacao order" },
  { id: 2, vendor: "PackRight LLC", amount: 5800, dueDate: "2026-03-05", category: "Packaging", status: "Pending" as const, notes: "New label design run" },
  { id: 3, vendor: "GreenShip Logistics", amount: 3200, dueDate: "2026-02-20", category: "Shipping", status: "Overdue" as const, notes: "Warehouse transfer" },
  { id: 4, vendor: "Digital Marketing Pro", amount: 7500, dueDate: "2026-03-01", category: "Marketing", status: "Pending" as const, notes: "Q1 campaign" },
  { id: 5, vendor: "Lab Test Partners", amount: 2100, dueDate: "2026-02-18", category: "Compliance", status: "Paid" as const, notes: "Batch #2026-02 testing" },
  { id: 6, vendor: "Cacao Supply Co", amount: 11800, dueDate: "2026-01-28", category: "Raw Materials", status: "Paid" as const, notes: "January cacao order" },
  { id: 7, vendor: "CloudHost Inc", amount: 890, dueDate: "2026-02-15", category: "Operations", status: "Paid" as const, notes: "Monthly hosting" },
]

export const productMonthlySales: Record<number, number[]> = {
  1: [220, 240, 260, 280, 310, 290, 300, 320, 310, 340, 330, 340],
  2: [180, 200, 220, 240, 260, 250, 270, 280, 260, 290, 280, 310],
  3: [160, 180, 200, 220, 240, 230, 250, 260, 240, 270, 260, 290],
  4: [140, 160, 180, 200, 220, 210, 230, 240, 220, 250, 240, 270],
  5: [120, 140, 160, 180, 200, 190, 210, 220, 200, 230, 220, 250],
  6: [100, 120, 140, 160, 180, 170, 190, 200, 180, 210, 200, 230],
  7: [90, 110, 130, 150, 170, 160, 180, 190, 170, 200, 190, 220],
  8: [80, 100, 120, 140, 160, 150, 170, 180, 160, 190, 180, 210],
  9: [70, 90, 110, 130, 150, 140, 160, 170, 150, 180, 170, 200],
  10: [60, 80, 100, 120, 140, 130, 150, 160, 140, 170, 160, 190],
  11: [40, 50, 60, 70, 80, 75, 85, 90, 80, 95, 85, 100],
  12: [20, 25, 30, 35, 40, 38, 42, 45, 40, 48, 42, 50],
}
