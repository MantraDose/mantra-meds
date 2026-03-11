"use client"

import { useState, useEffect, useMemo, Fragment } from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Search, ArrowUpDown, ArrowUp, ArrowDown, ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { ApiProduct } from "@/lib/types/product"

const PAGE_SIZE = 20

type SortKey = "quantitySold" | "amount"

function formatQuantitySold(value: number | null | undefined): string {
  if (value == null || Number.isNaN(value)) return "—"
  return Number(value).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

function formatAmount(value: number | null | undefined): string {
  if (value == null || Number.isNaN(value)) return "—"
  return `$${Number(value).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`
}

export default function ProductsPage() {
  const [products, setProducts] = useState<ApiProduct[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState("")
  const [sortBy, setSortBy] = useState<SortKey | null>(null)
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc")
  const [page, setPage] = useState(1)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)
    fetch("/api/inventory/products")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load products")
        return res.json()
      })
      .then((data: ApiProduct[]) => {
        if (!cancelled) setProducts(Array.isArray(data) ? data : [])
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : "Unable to load products. Please try again.")
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  const filtered = useMemo(() => {
    if (!search.trim()) return products
    const q = search.trim().toLowerCase()
    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        (p.sku?.toLowerCase().includes(q))
    )
  }, [products, search])

  const sorted = useMemo(() => {
    if (!sortBy) return filtered
    const key = sortBy
    const dir = sortDir === "asc" ? 1 : -1
    return [...filtered].sort((a, b) => {
      const av = a[key] ?? null
      const bv = b[key] ?? null
      const aNull = av == null || Number.isNaN(Number(av))
      const bNull = bv == null || Number.isNaN(Number(bv))
      if (aNull && bNull) return 0
      if (aNull) return 1
      if (bNull) return -1
      return (Number(av) - Number(bv)) * dir
    })
  }, [filtered, sortBy, sortDir])

  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE))
  const paginated = useMemo(
    () => sorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
    [sorted, page]
  )

  function handleSortHeader(key: SortKey) {
    if (sortBy === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"))
    } else {
      setSortBy(key)
      setSortDir("asc")
    }
  }

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Products</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Product-level performance analytics
        </p>
      </div>

      <Card className="border-border bg-card">
        <CardContent>
          <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search products..."
                value={search}
                onChange={(e) => {
                setSearch(e.target.value)
                setPage(1)
              }}
                className="bg-muted/50 pl-9 text-foreground placeholder:text-muted-foreground"
              />
            </div>
          </div>

          {error && (
            <div className="py-12 text-center text-sm text-muted-foreground">
              Unable to load products. Please try again later.
            </div>
          )}

          {!error && loading && (
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-12 w-full rounded-md" />
              ))}
            </div>
          )}

          {!error && !loading && filtered.length > 0 && (
            <>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-border hover:bg-transparent">
                    <TableHead className="text-muted-foreground">Product</TableHead>
                    <TableHead className="text-right text-muted-foreground">Price</TableHead>
                    <TableHead
                      className="cursor-pointer select-none text-right text-muted-foreground hover:text-foreground"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleSortHeader("quantitySold")
                      }}
                    >
                      <span className="inline-flex items-center gap-1">
                        Quantity Sold
                        {sortBy === "quantitySold" ? (
                          sortDir === "asc" ? (
                            <ArrowUp className="h-4 w-4" />
                          ) : (
                            <ArrowDown className="h-4 w-4" />
                          )
                        ) : (
                          <ArrowUpDown className="h-4 w-4 opacity-50" />
                        )}
                      </span>
                    </TableHead>
                    <TableHead
                      className="cursor-pointer select-none text-right text-muted-foreground hover:text-foreground"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleSortHeader("amount")
                      }}
                    >
                      <span className="inline-flex items-center gap-1">
                        Amount
                        {sortBy === "amount" ? (
                          sortDir === "asc" ? (
                            <ArrowUp className="h-4 w-4" />
                          ) : (
                            <ArrowDown className="h-4 w-4" />
                          )
                        ) : (
                          <ArrowUpDown className="h-4 w-4 opacity-50" />
                        )}
                      </span>
                    </TableHead>
                    <TableHead className="text-muted-foreground">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginated.map((product, index) => (
                    <Fragment key={`${product.id}-${index}`}>
                      <TableRow className="border-border transition-colors hover:bg-muted/30">
                        <TableCell className="font-medium text-foreground">
                          <div className="flex flex-col">
                            <span>{product.name}</span>
                            <span className="text-sm font-normal text-muted-foreground">
                              {product.sku ?? "—"}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right text-muted-foreground">
                          {product.price != null
                            ? `$${Number(product.price).toFixed(2)}`
                            : "—"}
                        </TableCell>
                        <TableCell className="text-right text-muted-foreground">
                          {formatQuantitySold(product.quantitySold)}
                        </TableCell>
                        <TableCell className="text-right text-muted-foreground">
                          {formatAmount(product.amount)}
                        </TableCell>
                        <TableCell>
                          <Badge
                            className={
                              product.status === "active"
                                ? "bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/20"
                                : "bg-red-500/15 text-red-400 hover:bg-red-500/20"
                            }
                          >
                            {product.status === "active" ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    </Fragment>
                  ))}
                </TableBody>
              </Table>
            </div>
            <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-border pt-4">
              <p className="text-sm text-muted-foreground">
                Showing {(page - 1) * PAGE_SIZE + 1}–
                {Math.min(page * PAGE_SIZE, sorted.length)} of {sorted.length}
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8 border-border"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1}
                  aria-label="Previous page"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-sm text-muted-foreground">
                  Page {page} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8 border-border"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page >= totalPages}
                  aria-label="Next page"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
            </>
          )}

          {!error && !loading && filtered.length === 0 && (
            <div className="py-12 text-center text-sm text-muted-foreground">
              {search.trim()
                ? "No products match your search."
                : "No products found."}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
