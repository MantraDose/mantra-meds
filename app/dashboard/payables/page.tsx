"use client"

import { useState } from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Plus, Clock, AlertTriangle, CheckCircle } from "lucide-react"
import { payables } from "@/lib/mock-data"

export default function PayablesPage() {
  const [open, setOpen] = useState(false)

  const pending = payables.filter((p) => p.status === "Pending")
  const overdue = payables.filter((p) => p.status === "Overdue")
  const paid = payables.filter((p) => p.status === "Paid")
  const totalPending = pending.reduce((s, p) => s + p.amount, 0) + overdue.reduce((s, p) => s + p.amount, 0)

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Accounts Payable</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Founder-only financial operations view
          </p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2 bg-mantra-magenta text-primary-foreground hover:bg-mantra-magenta/90">
              <Plus className="h-4 w-4" />
              Add Payable
            </Button>
          </DialogTrigger>
          <DialogContent className="border-border bg-card text-card-foreground">
            <DialogHeader>
              <DialogTitle className="text-foreground">Add New Payable</DialogTitle>
            </DialogHeader>
            <div className="flex flex-col gap-4 py-4">
              <div className="flex flex-col gap-2">
                <Label className="text-muted-foreground">Vendor Name</Label>
                <Input placeholder="e.g. Cacao Supply Co" className="bg-muted/50 text-foreground" />
              </div>
              <div className="flex flex-col gap-2">
                <Label className="text-muted-foreground">Amount</Label>
                <Input type="number" placeholder="e.g. 5000" className="bg-muted/50 text-foreground" />
              </div>
              <div className="flex flex-col gap-2">
                <Label className="text-muted-foreground">Due Date</Label>
                <Input type="date" className="bg-muted/50 text-foreground" />
              </div>
              <div className="flex flex-col gap-2">
                <Label className="text-muted-foreground">Category</Label>
                <Select>
                  <SelectTrigger className="border-border bg-muted/50 text-foreground">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent className="border-border bg-popover">
                    <SelectItem value="raw-materials">Raw Materials</SelectItem>
                    <SelectItem value="packaging">Packaging</SelectItem>
                    <SelectItem value="shipping">Shipping</SelectItem>
                    <SelectItem value="marketing">Marketing</SelectItem>
                    <SelectItem value="compliance">Compliance</SelectItem>
                    <SelectItem value="operations">Operations</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-2">
                <Label className="text-muted-foreground">Notes</Label>
                <Textarea placeholder="Optional notes..." className="bg-muted/50 text-foreground" />
              </div>
              <Button
                className="w-full bg-mantra-magenta text-primary-foreground hover:bg-mantra-magenta/90"
                onClick={() => setOpen(false)}
              >
                Save Payable
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card className="border-border bg-card">
          <CardContent className="flex items-center gap-4 p-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500/15">
              <Clock className="h-5 w-5 text-amber-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Pending</p>
              <p className="mt-1 text-2xl font-bold text-foreground">
                ${pending.reduce((s, p) => s + p.amount, 0).toLocaleString()}
              </p>
              <p className="text-xs text-muted-foreground">{pending.length} items</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-destructive/30 bg-card">
          <CardContent className="flex items-center gap-4 p-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-500/15">
              <AlertTriangle className="h-5 w-5 text-red-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Overdue</p>
              <p className="mt-1 text-2xl font-bold text-red-400">
                ${overdue.reduce((s, p) => s + p.amount, 0).toLocaleString()}
              </p>
              <p className="text-xs text-muted-foreground">{overdue.length} items</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border bg-card">
          <CardContent className="flex items-center gap-4 p-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/15">
              <CheckCircle className="h-5 w-5 text-emerald-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Paid</p>
              <p className="mt-1 text-2xl font-bold text-foreground">
                ${paid.reduce((s, p) => s + p.amount, 0).toLocaleString()}
              </p>
              <p className="text-xs text-muted-foreground">{paid.length} items</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Total AP Banner */}
      <Card className="border-mantra-magenta/30 bg-card">
        <CardContent className="p-6">
          <p className="text-sm font-medium text-muted-foreground">Total Outstanding AP</p>
          <p className="mt-2 text-3xl font-bold text-mantra-magenta">
            ${totalPending.toLocaleString()}
          </p>
        </CardContent>
      </Card>

      {/* Payables Table */}
      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="text-base font-semibold text-card-foreground">
            All Payables
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-border hover:bg-transparent">
                  <TableHead className="text-muted-foreground">Vendor</TableHead>
                  <TableHead className="text-muted-foreground">Category</TableHead>
                  <TableHead className="text-right text-muted-foreground">Amount</TableHead>
                  <TableHead className="text-muted-foreground">Due Date</TableHead>
                  <TableHead className="text-muted-foreground">Status</TableHead>
                  <TableHead className="text-muted-foreground">Notes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payables.map((p) => (
                  <TableRow key={p.id} className="border-border">
                    <TableCell className="font-medium text-foreground">{p.vendor}</TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="bg-muted text-muted-foreground">
                        {p.category}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-medium text-foreground">
                      ${p.amount.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-muted-foreground">{p.dueDate}</TableCell>
                    <TableCell>
                      <Badge
                        className={
                          p.status === "Paid"
                            ? "bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/20"
                            : p.status === "Overdue"
                              ? "bg-red-500/15 text-red-400 hover:bg-red-500/20"
                              : "bg-amber-500/15 text-amber-400 hover:bg-amber-500/20"
                        }
                      >
                        {p.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="max-w-[200px] truncate text-muted-foreground">
                      {p.notes}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
