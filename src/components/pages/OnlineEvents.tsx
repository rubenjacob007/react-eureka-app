import { useEffect, useState } from "react";
import axios from "axios";
import "@radix-ui/themes/styles.css";
import * as Checkbox from "@radix-ui/react-checkbox";
import {
  Box,
  Text,
  Table,
  Heading,
  Select,
  Flex,
  Button,
  Popover,
} from "@radix-ui/themes";

import {
  ChevronUpIcon,
  ChevronDownIcon,
  CheckIcon,
  FunnelIcon,
} from "@radix-ui/react-icons";

import { Filter } from "lucide-react";

import Sidebar from "/src/components/sidebar/Sidebar";
import { ThemeProvider } from "/src/components/sidebar/ThemeContext";
import * as ScrollArea from "@radix-ui/react-scroll-area";

import { fetchData } from "/src/services/api"; // Import API function

function OnlineEvents() {
  //Show hide column options
  const columnOptions = [
    "Time Stamp",
    "Event Name",
    "Floor Name",
    "Access Point",
    "Key Holder",
    "Building",
    "Details",
  ];
  const rowsPerPageOptions = [10, 20, 50];

  const [visibleColumns, setVisibleColumns] = useState<string[]>(columnOptions);
  const [showSelector, setShowSelector] = useState(false);

  const [data, setData] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  //getting details from api online events
  useEffect(() => {
    const loadData = async () => {
      try {
        const result = await fetchData();
        setData(result);
        setError(null);
      } catch (err) {
        setError("Failed to load events. Try again later.");
      }
    };

    loadData();
  }, []);

  const toggleColumn = (column: string) => {
    setVisibleColumns((prev) =>
      prev.includes(column)
        ? prev.filter((c) => c !== column)
        : [...prev, column]
    );
  };
  //date formatting function starts here
  const formatDateLocal = (isoString) => {
    const date = new Date(isoString);
    return date
      .toLocaleString("en-CA", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
      })
      .replace(",", "");
  };
  //date formatting function ends here

  //sorting function starts here
  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortOrder("asc");
    }
  };

  const sortedData = [...data].sort((a, b) => {
    if (!sortColumn) return 0; // No sorting applied

    const aValue = a[sortColumn as keyof typeof a];
    const bValue = b[sortColumn as keyof typeof b];

    if (typeof aValue === "string" && typeof bValue === "string") {
      return sortOrder === "asc"
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    } else if (typeof aValue === "number" && typeof bValue === "number") {
      return sortOrder === "asc" ? aValue - bValue : bValue - aValue;
    }

    return 0;
  });
  //sorting function ends here

  //pagination starts here
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const totalPages = Math.ceil(data.length / rowsPerPage);
  const paginatedData = sortedData.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );
  //pagination ends here
  return (
    <div>
      <Box my="2">
        <Heading mb="5" size="6" color="gray">
          Ambiance Monitoring System
        </Heading>
      </Box>

      <Box>
        <Flex justify="between" mb="4">
          <Heading size="4" color="gray">
            Online Events
          </Heading>
          <Popover.Root open={showSelector} onOpenChange={setShowSelector}>
            <Popover.Trigger>
              <Button>
                <Filter />
              </Button>
            </Popover.Trigger>
            <Popover.Content align="end">
              <Box p="3" style={{ width: "200px" }}>
                <Flex direction="column" gap="2">
                  {columnOptions.map((col) => (
                    <Flex key={col} align="center" gap="2">
                      <Checkbox.Root
                        checked={visibleColumns.includes(col)}
                        onCheckedChange={() => toggleColumn(col)}
                        id={col} // Associate with label
                        style={{
                          width: 20,
                          height: 20,
                          border: "2px solid black",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <Checkbox.Indicator>
                          <CheckIcon />
                        </Checkbox.Indicator>
                      </Checkbox.Root>
                      <label htmlFor={col}>{col}</label>
                    </Flex>
                  ))}
                </Flex>
              </Box>
            </Popover.Content>
          </Popover.Root>
        </Flex>
        <ScrollArea.Root className="w-full h-96 border rounded-lg overflow-hidden">
          <ScrollArea.Viewport className="w-full h-full overflow-auto">
            <Table.Root variant="surface" className="w-full border-collapse">
              <Table.Header className="bg-gray-200 sticky top-0 z-10">
                <Table.Row>
                  {visibleColumns.includes("Time Stamp") && (
                    <Table.ColumnHeaderCell
                      onClick={() => handleSort("timeStamp")}
                      style={{ cursor: "pointer" }}
                    >
                      Time Stamp
                      {sortColumn === "timeStamp" &&
                        (sortOrder === "asc" ? (
                          <ChevronUpIcon />
                        ) : (
                          <ChevronDownIcon />
                        ))}
                    </Table.ColumnHeaderCell>
                  )}
                  {visibleColumns.includes("Event Name") && (
                    <Table.ColumnHeaderCell
                      onClick={() => handleSort("eventName")}
                      style={{ cursor: "pointer" }}
                    >
                      Event Name
                      {sortColumn === "eventName" &&
                        (sortOrder === "asc" ? (
                          <ChevronUpIcon />
                        ) : (
                          <ChevronDownIcon />
                        ))}
                    </Table.ColumnHeaderCell>
                  )}
                  {visibleColumns.includes("Floor Name") && (
                    <Table.ColumnHeaderCell
                      onClick={() => handleSort("floorName")}
                      style={{ cursor: "pointer" }}
                    >
                      Floor Name
                      {sortColumn === "floorName" &&
                        (sortOrder === "asc" ? (
                          <ChevronUpIcon />
                        ) : (
                          <ChevronDownIcon />
                        ))}
                    </Table.ColumnHeaderCell>
                  )}
                  {visibleColumns.includes("Access Point") && (
                    <Table.ColumnHeaderCell
                      onClick={() => handleSort("accessPointName")}
                      style={{ cursor: "pointer" }}
                    >
                      Access Point
                      {sortColumn === "accessPointName" &&
                        (sortOrder === "asc" ? (
                          <ChevronUpIcon />
                        ) : (
                          <ChevronDownIcon />
                        ))}
                    </Table.ColumnHeaderCell>
                  )}
                  {visibleColumns.includes("Key Holder") && (
                    <Table.ColumnHeaderCell>Key Holder</Table.ColumnHeaderCell>
                  )}
                  {visibleColumns.includes("Building") && (
                    <Table.ColumnHeaderCell>Building </Table.ColumnHeaderCell>
                  )}
                  {visibleColumns.includes("Details") && (
                    <Table.ColumnHeaderCell>Details </Table.ColumnHeaderCell>
                  )}
                </Table.Row>
              </Table.Header>

              <Table.Body>
                {paginatedData.map((item, index) => (
                  <Table.Row key={index} align="center">
                    {visibleColumns.includes("Time Stamp") && (
                      <Table.RowHeaderCell>
                        <Text>{formatDateLocal(item.timeStamp)}</Text>
                      </Table.RowHeaderCell>
                    )}

                    {visibleColumns.includes("Event Name") && (
                      <Table.Cell>
                        <Text>{item.eventName}</Text>
                      </Table.Cell>
                    )}
                    {visibleColumns.includes("Floor Name") && (
                      <Table.Cell>
                        <Text>{item.floorName}</Text>
                      </Table.Cell>
                    )}
                    {visibleColumns.includes("Access Point") && (
                      <Table.Cell>
                        <Text>{item.accessPointName}</Text>
                      </Table.Cell>
                    )}
                    {visibleColumns.includes("Key Holder") && (
                      <Table.Cell>
                        <Text>{item.keyHolderName}</Text>
                      </Table.Cell>
                    )}
                    {visibleColumns.includes("Building") && (
                      <Table.Cell>
                        <Text>{item.buildingName}</Text>
                      </Table.Cell>
                    )}
                    {visibleColumns.includes("Details") && (
                      <Table.Cell>
                        <Text>{item.details}</Text>
                      </Table.Cell>
                    )}
                  </Table.Row>
                ))}
              </Table.Body>
            </Table.Root>
          </ScrollArea.Viewport>
          <ScrollArea.Scrollbar
            className="h-2 bg-gray-300"
            orientation="horizontal"
          />
          <ScrollArea.Scrollbar
            className="w-2 bg-gray-300"
            orientation="vertical"
          />
        </ScrollArea.Root>

        <Flex justify="between" mt="4">
          <Select.Root
            value={rowsPerPage.toString()}
            onValueChange={(value) => {
              setRowsPerPage(Number(value));
              setCurrentPage(1);
            }}
          >
            <Select.Trigger />
            <Select.Content>
              {rowsPerPageOptions.map((option) => (
                <Select.Item key={option} value={option.toString()}>
                  {option}
                </Select.Item>
              ))}
            </Select.Content>
          </Select.Root>

          <Flex gap="2" align="center">
            <Button
              variant="outline"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            >
              Previous
            </Button>
            <Text size="2" color="gray">
              Page {currentPage} of {totalPages}
            </Text>

            <Button
              variant="outline"
              disabled={currentPage === totalPages}
              onClick={() =>
                setCurrentPage((prev) => Math.min(prev + 1, totalPages))
              }
            >
              Next
            </Button>
          </Flex>
        </Flex>
      </Box>
    </div>
  );
}

export default OnlineEvents;
