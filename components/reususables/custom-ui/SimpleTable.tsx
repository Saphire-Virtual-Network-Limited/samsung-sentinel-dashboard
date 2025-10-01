import React from "react";
import {
	Table,
	TableHeader,
	TableColumn,
	TableBody,
	TableRow,
	TableCell,
	Input,
	Spinner,
} from "@heroui/react";
import { SearchIcon } from "lucide-react";

interface Column {
	key: string;
	label: string;
	render?: (item: any) => React.ReactNode;
}

interface SimpleTableProps {
	data: any[];
	columns: Column[];
	searchable?: boolean;
	searchPlaceholder?: string;
	searchValue?: string;
	onSearchChange?: (value: string) => void;
	isLoading?: boolean;
	emptyMessage?: string;
	selectable?: boolean;
}

const SimpleTable: React.FC<SimpleTableProps> = ({
	data,
	columns,
	searchable = false,
	searchPlaceholder = "Search...",
	searchValue = "",
	onSearchChange,
	isLoading = false,
	emptyMessage = "No data found",
	selectable = false,
}) => {
	const [internalSearch, setInternalSearch] = React.useState("");

	const searchTerm = searchValue || internalSearch;
	const handleSearchChange = onSearchChange || setInternalSearch;

	// Filter data based on search
	const filteredData =
		searchable && searchTerm
			? data.filter((item) =>
					Object.values(item).some((value) =>
						String(value).toLowerCase().includes(searchTerm.toLowerCase())
					)
			  )
			: data;

	const renderCellContent = (item: any, column: Column) => {
		if (column.render) {
			return column.render(item);
		}
		return item[column.key];
	};

	return (
		<div className="space-y-4">
			{searchable && (
				<Input
					placeholder={searchPlaceholder}
					value={searchTerm}
					onValueChange={handleSearchChange}
					startContent={<SearchIcon size={16} />}
					className="max-w-sm"
				/>
			)}

			<Table
				aria-label="Data table"
				selectionMode={selectable ? "multiple" : "none"}
			>
				<TableHeader>
					{columns.map((column) => (
						<TableColumn key={column.key}>{column.label}</TableColumn>
					))}
				</TableHeader>
				<TableBody
					isLoading={isLoading}
					loadingContent={<Spinner label="Loading..." />}
					emptyContent={emptyMessage}
				>
					{filteredData.map((item, index) => (
						<TableRow key={item.id || index}>
							{columns.map((column) => (
								<TableCell key={column.key}>
									{renderCellContent(item, column)}
								</TableCell>
							))}
						</TableRow>
					))}
				</TableBody>
			</Table>
		</div>
	);
};

export default SimpleTable;
