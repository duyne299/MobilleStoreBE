"use client";

import { forwardRef } from "react";
import { componentVariants } from "@/lib/themes";
import { cn } from "@/lib/utils";

export interface TableProps extends React.HTMLAttributes<HTMLTableElement> {
  striped?: boolean;
  hoverable?: boolean;
}

const Table = forwardRef<HTMLTableElement, TableProps>(
  ({ className, striped, hoverable, ...props }, ref) => {
    return (
      <div className="relative w-full overflow-auto">
        <table
          ref={ref}
          className={cn(
            "w-full caption-bottom text-sm border-collapse",
            striped && "[&_tbody_tr:nth-child(even)]:bg-muted/50",
            hoverable && "[&_tbody_tr]:hover:bg-accent/50",
            className
          )}
          {...props}
        />
      </div>
    );
  }
);

Table.displayName = "Table";

export type TableHeaderProps = React.HTMLAttributes<HTMLTableSectionElement>;

const TableHeader = forwardRef<HTMLTableSectionElement, TableHeaderProps>(
  ({ className, ...props }, ref) => (
    <thead
      ref={ref}
      className={cn(componentVariants.table.header, className)}
      {...props}
    />
  )
);

TableHeader.displayName = "TableHeader";

export type TableBodyProps = React.HTMLAttributes<HTMLTableSectionElement>;

const TableBody = forwardRef<HTMLTableSectionElement, TableBodyProps>(
  ({ className, ...props }, ref) => (
    <tbody
      ref={ref}
      className={cn("[&_tr:last-child]:border-0", className)}
      {...props}
    />
  )
);

TableBody.displayName = "TableBody";

export type TableFooterProps = React.HTMLAttributes<HTMLTableSectionElement>;

const TableFooter = forwardRef<HTMLTableSectionElement, TableFooterProps>(
  ({ className, ...props }, ref) => (
    <tfoot
      ref={ref}
      className={cn(
        "border-t bg-muted/50 font-medium [&>tr]:last:border-b-0",
        className
      )}
      {...props}
    />
  )
);

TableFooter.displayName = "TableFooter";

export type TableRowProps = React.HTMLAttributes<HTMLTableRowElement>;

const TableRow = forwardRef<HTMLTableRowElement, TableRowProps>(
  ({ className, ...props }, ref) => (
    <tr
      ref={ref}
      className={cn(
        componentVariants.table.row,
        "data-[state=selected]:bg-muted",
        className
      )}
      {...props}
    />
  )
);

TableRow.displayName = "TableRow";

export type TableHeadProps = React.ThHTMLAttributes<HTMLTableCellElement>;

const TableHead = forwardRef<HTMLTableCellElement, TableHeadProps>(
  ({ className, ...props }, ref) => (
    <th
      ref={ref}
      className={cn(
        "h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0",
        className
      )}
      {...props}
    />
  )
);

TableHead.displayName = "TableHead";

export type TableCellProps = React.TdHTMLAttributes<HTMLTableCellElement>;

const TableCell = forwardRef<HTMLTableCellElement, TableCellProps>(
  ({ className, ...props }, ref) => (
    <td
      ref={ref}
      className={cn(
        "p-4 align-middle [&:has([role=checkbox])]:pr-0",
        componentVariants.table.cell,
        className
      )}
      {...props}
    />
  )
);

TableCell.displayName = "TableCell";

export type TableCaptionProps = React.HTMLAttributes<HTMLTableCaptionElement>;

const TableCaption = forwardRef<HTMLTableCaptionElement, TableCaptionProps>(
  ({ className, ...props }, ref) => (
    <caption
      ref={ref}
      className={cn("mt-4 text-sm text-muted-foreground", className)}
      {...props}
    />
  )
);

TableCaption.displayName = "TableCaption";

export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
};
