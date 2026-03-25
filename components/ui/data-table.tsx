"use client";

import * as React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

export type DataTableColumn<T> = {
  id: string;
  header: React.ReactNode;
  cell: (row: T) => React.ReactNode;
  headerClassName?: string;
  cellClassName?: string;
};

type DataTableProps<T> = {
  data: T[];
  columns: DataTableColumn<T>[];
  rowKey: (row: T, index: number) => string;
  emptyMessage?: string;
  wrapperClassName?: string;
  rowClassName?: string;
};

export function DataTable<T>({
  data,
  columns,
  rowKey,
  emptyMessage = "No records found",
  wrapperClassName,
  rowClassName,
}: DataTableProps<T>) {
  return (
    <div className={cn("overflow-x-auto rounded-md border", wrapperClassName)}>
      <Table>
        <TableHeader>
          <TableRow>
            {columns.map((col) => (
              <TableHead key={col.id} className={col.headerClassName}>
                {col.header}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>

        <TableBody>
          {data.length === 0 ? (
            <TableRow>
              <TableCell colSpan={columns.length} className="text-center py-8">
                {emptyMessage}
              </TableCell>
            </TableRow>
          ) : (
            data.map((row, index) => (
              <TableRow key={rowKey(row, index)} className={rowClassName}>
                {columns.map((col) => (
                  <TableCell key={col.id} className={col.cellClassName}>
                    {col.cell(row)}
                  </TableCell>
                ))}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
