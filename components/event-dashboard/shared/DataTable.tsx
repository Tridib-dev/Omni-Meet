import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export interface DataTableColumn<T> {
    key: string;
    header: string;
    cell: (row: T) => React.ReactNode;
    className?: string;
}

export default function DataTable<T>({
    title,
    columns,
    rows,
    emptyMessage = "No rows to display.",
}: {
    title?: string;
    columns: DataTableColumn<T>[];
    rows: T[];
    emptyMessage?: string;
}) {
    return (
        <Card className="overflow-hidden">
            {title && (
                <CardHeader>
                    <CardTitle>{title}</CardTitle>
                </CardHeader>
            )}
            <CardContent className="p-0">
                <ScrollArea className="w-full">
                    <Table className="min-w-[640px]">
                        <TableHeader>
                            <TableRow>
                                {columns.map((column) => (
                                    <TableHead key={column.key} className={column.className}>
                                        {column.header}
                                    </TableHead>
                                ))}
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {rows.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={columns.length} className="py-10 text-center text-slate-500">
                                        {emptyMessage}
                                    </TableCell>
                                </TableRow>
                            ) : (
                                rows.map((row, index) => (
                                    <TableRow key={index}>
                                        {columns.map((column) => (
                                            <TableCell key={column.key} className={column.className}>
                                                {column.cell(row)}
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </ScrollArea>
            </CardContent>
        </Card>
    );
}
