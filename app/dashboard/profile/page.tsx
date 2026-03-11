import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Building2, Calendar, Users, Mail, Share2 } from "lucide-react"
import { capTable } from "@/lib/mock-data"

export default function CompanyProfilePage() {
  const totalShares = capTable.reduce((s, m) => s + m.shares, 0)

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Company Profile</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Static company information and shareholder details
        </p>
      </div>

      {/* Company Info */}
      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="text-base font-semibold text-card-foreground">
            Company Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div className="flex items-start gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-mantra-magenta/15">
                <Building2 className="h-5 w-5 text-mantra-magenta" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Company Name</p>
                <p className="mt-0.5 text-foreground">MantraDose LLC</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted">
                <Calendar className="h-5 w-5 text-muted-foreground" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Founded</p>
                <p className="mt-0.5 text-foreground">2024</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted">
                <Share2 className="h-5 w-5 text-muted-foreground" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Structure</p>
                <p className="mt-0.5 text-foreground">Limited Liability Company (LLC)</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted">
                <Mail className="h-5 w-5 text-muted-foreground" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Contact</p>
                <p className="mt-0.5 text-foreground">team@mantradose.com</p>
              </div>
            </div>
          </div>
          <div className="mt-6 rounded-lg border border-border bg-muted/30 p-4">
            <p className="text-sm text-muted-foreground leading-relaxed">
              MantraDose is a wellness company specializing in functional mushroom
              products across multiple categories including bars, capsules, gummies,
              minis, raw extracts, and the Tantra line. Our mission is to make
              adaptogenic wellness accessible and enjoyable for everyone.
            </p>
          </div>
        </CardContent>
      </Card>


      {/* Cap Table */}
      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="text-base font-semibold text-card-foreground">
            2024 Shareholder Updated Cap Table
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="border-border hover:bg-transparent">
                <TableHead className="text-muted-foreground">Member</TableHead>
                <TableHead className="text-right text-muted-foreground">Shares</TableHead>
                <TableHead className="text-right text-muted-foreground">Ownership %</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {capTable.map((m) => (
                <TableRow key={m.member} className="border-border">
                  <TableCell className="font-medium text-foreground">{m.member}</TableCell>
                  <TableCell className="text-right text-muted-foreground">
                    {m.shares.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-right text-muted-foreground">
                    {m.ownership.toFixed(2)}%
                  </TableCell>
                </TableRow>
              ))}
              <TableRow className="border-border bg-muted/30 font-semibold">
                <TableCell className="text-foreground">Total</TableCell>
                <TableCell className="text-right text-foreground">
                  {totalShares.toLocaleString()}
                </TableCell>
                <TableCell className="text-right text-foreground">100.00%</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
