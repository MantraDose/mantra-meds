"use client"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { topProducts } from "@/lib/mock-data"

export function TopProductsTable() {
  return (
    <Card className="border-border bg-card">
      <CardHeader>
        <CardTitle className="text-base font-semibold text-card-foreground">
          Top Products
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow className="border-border hover:bg-transparent">
              <TableHead className="text-muted-foreground">Product</TableHead>
              <TableHead className="text-muted-foreground">Category</TableHead>
              <TableHead className="text-right text-muted-foreground">Units Sold</TableHead>
              <TableHead className="text-right text-muted-foreground">Revenue</TableHead>
              <TableHead className="text-right text-muted-foreground">Avg Price</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {topProducts.map((product) => (
              <TableRow key={product.id} className="border-border">
                <TableCell className="font-medium text-foreground">{product.name}</TableCell>
                <TableCell>
                  <Badge variant="secondary" className="bg-muted text-muted-foreground">
                    {product.category}
                  </Badge>
                </TableCell>
                <TableCell className="text-right text-muted-foreground">
                  {product.unitsSold.toLocaleString()}
                </TableCell>
                <TableCell className="text-right font-medium text-foreground">
                  ${product.revenue.toLocaleString()}
                </TableCell>
                <TableCell className="text-right text-muted-foreground">
                  ${product.avgPrice.toFixed(2)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
