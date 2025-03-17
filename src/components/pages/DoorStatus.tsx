import { useEffect, useState } from "react";
import "@radix-ui/themes/styles.css";
import {
  Box,
  TextField,
  Text,
  Table,
  Heading,
  Container,
  Select,
  Flex,
  Button,
  Badge,
  Card,
} from "@radix-ui/themes";
import {
  MagnifyingGlassIcon,
  ChevronUpIcon,
  ChevronDownIcon,
} from "@radix-ui/react-icons";
import * as ScrollArea from "@radix-ui/react-scroll-area";
import {
  fetchHubStatus,
  fetchAndMergeData,
  fetchOnlineMetric,
  fetchLockListByHubs,
} from "/src/services/api";

// Adjust PairedData to match API response or map accordingly

interface LockData {
  name: string;
  floorName: string;
  hubName: string;
  status: string;
  isOpen: boolean;
  isLatched: string;
  isAjar: string;
  isBatteryLow: string;
  isRfSignalWeak: string;
  isDeadboltThrown: string;
  lastCommunication: string;
  lastTimeOffline: string;
}

interface HubData {
  hubName: string;
  hubIpAddress: string;
  macAddress: string;
  deviceStatusName: string;
  rfStatusName: string;
  firmwareHub: string;
  lastTimeOffline: string;
}

interface MetricsData {
  totalHubs: number;
  onlineHubs: number;
  offlineHubs: number;
  onlineLocks: number;
  totalLocks: number;
  doorAjar: number;
  ajarDoors: number;
  doorOpen: number;
  lowBatteryDoors: number;
  lowBatteryDoorsPercent: number;
  ajarDoorsPercent: number;
  openDoors: number;
  onlineHubsPercent: number;
}

function DoorStatus() {
  const rowsPerPageOptions = [10, 20, 50];

  const [error, setError] = useState<string | null>(null);
  const [doorSearchQuery, setDoorSearchQuery] = useState("");
  const [doorSortColumn, setDoorSortColumn] = useState<keyof PairedData | null>(
    null
  );
  const [doorSortOrder, setDoorSortOrder] = useState<"asc" | "desc">("asc");
  const [doorCurrentPage, setDoorCurrentPage] = useState(1);
  const [doorRowsPerPage, setDoorRowsPerPage] = useState(10);

  const [pairedData, setPairedData] = useState<PairedData[]>([]);

  // Hub Status Table State
  const [hubData, setHubData] = useState<HubData[]>([]);
  const [hubSearchQuery, setHubSearchQuery] = useState("");
  const [hubSortColumn, setHubSortColumn] = useState<keyof HubData | null>(
    null
  );
  const [hubSortOrder, setHubSortOrder] = useState<"asc" | "desc">("asc");
  const [hubCurrentPage, setHubCurrentPage] = useState(1);
  const [hubRowsPerPage, setHubRowsPerPage] = useState(10);

  const [metricsData, setMetricsData] = useState<MetricsData | null>(null);
  const [metricsLoading, setMetricsLoading] = useState(true);
  const [metricsError, setMetricsError] = useState<string | null>(null);

  // Fetch Paired Data and Map to PairedData Interface
  useEffect(() => {
    const loadData = async () => {
      try {
        const result = await fetchLockListByHubs();
        // console.log("Ruben:", result);

        // Extract items array and map to PairedData
        const items = result?.items || [];
        const mappedData: PairedData[] = items.map((item: LockData) => ({
          name: item.name || "-",
          floorName: item.floorName || "-",
          HubName: item.hubName || "-",
          status: item.status || "-",
          isOpen: item.isOpen,
          isAjar: item.isAjar,
          isBatteryLow: item.isBatteryLow,
          isRfSignalWeak: item.isRfSignalWeak,
          isDeadboltThrown: item.isDeadboltThrown,
          lastCommunications: item.lastCommunication,
          hubLastOffline: item.lastTimeOffline,
        }));
        //  console.log("Rubens:", mappedData);
        setPairedData(mappedData);
      } catch (err) {
        setError("Failed to load data");
        setPairedData([]);
      }
    };
    loadData();
  }, []);

  // Fetch Hub Status Data
  useEffect(() => {
    const fetchData = async () => {
      const results = await fetchHubStatus();
      setHubData(Array.isArray(results) ? results : []);
    };
    fetchData();
  }, []);

  // Fetch Metrics Data
  useEffect(() => {
    const fetchMetricsData = async () => {
      try {
        setMetricsLoading(true);
        setMetricsError(null);
        const results = await fetchOnlineMetric();
        if (!results) {
          throw new Error("No data returned from fetchOnlineMetrics");
        }
        setMetricsData(results);
      } catch (err) {
        setMetricsError("Failed to load metrics data");
      } finally {
        setMetricsLoading(false);
      }
    };
    fetchMetricsData();
  }, []);

  // Date Formatting Function
  const formatDateLocal = (isoString: string) => {
    if (!isoString || isoString === "-") return "-";
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

  // Sorting Handlers
  const handleDoorSort = (column: keyof PairedData) => {
    if (doorSortColumn === column) {
      setDoorSortOrder(doorSortOrder === "asc" ? "desc" : "asc");
    } else {
      setDoorSortColumn(column);
      setDoorSortOrder("asc");
    }
  };

  const handleHubSort = (column: keyof HubData) => {
    if (hubSortColumn === column) {
      setHubSortOrder(hubSortOrder === "asc" ? "desc" : "asc");
    } else {
      setHubSortColumn(column);
      setHubSortOrder("asc");
    }
  };

  // Door Status Data Processing
  const sortedDoorData =
    pairedData.length > 0
      ? [...pairedData].sort((a, b) => {
          if (!doorSortColumn) return 0;
          const aValue = a[doorSortColumn];
          const bValue = b[doorSortColumn];
          if (typeof aValue === "string" && typeof bValue === "string") {
            return doorSortOrder === "asc"
              ? aValue.localeCompare(bValue)
              : bValue.localeCompare(aValue);
          }
          return 0;
        })
      : [];

  const filteredDoorData = sortedDoorData.filter((item) =>
    Object.values(item).some(
      (value) =>
        typeof value === "string" &&
        value.toLowerCase().includes(doorSearchQuery.toLowerCase())
    )
  );

  const doorTotalPages = Math.ceil(filteredDoorData.length / doorRowsPerPage);
  const paginatedDoorData = filteredDoorData.slice(
    (doorCurrentPage - 1) * doorRowsPerPage,
    doorCurrentPage * doorRowsPerPage
  );

  // Hub Status Data Processing
  const sortedHubData =
    hubData.length > 0
      ? [...hubData].sort((a, b) => {
          if (!hubSortColumn) return 0;
          const aValue = a[hubSortColumn];
          const bValue = b[hubSortColumn];
          if (typeof aValue === "string" && typeof bValue === "string") {
            return hubSortOrder === "asc"
              ? aValue.localeCompare(bValue)
              : bValue.localeCompare(aValue);
          }
          return 0;
        })
      : [];

  const filteredHubData = sortedHubData.filter((item) =>
    Object.values(item).some(
      (value) =>
        typeof value === "string" &&
        value.toLowerCase().includes(hubSearchQuery.toLowerCase())
    )
  );

  const hubTotalPages = Math.ceil(filteredHubData.length / hubRowsPerPage);
  const paginatedHubData = filteredHubData.slice(
    (hubCurrentPage - 1) * hubRowsPerPage,
    hubCurrentPage * hubRowsPerPage
  );

  return (
    <div>
      <Box my="2" mb="4">
        <Container size="4" mb="8">
          <Flex gap="3">
            {metricsData ? (
              <>
                <Box maxWidth="240px">
                  <Card>
                    <Flex
                      direction="row"
                      align="center"
                      justify="between"
                      py="3"
                    >
                      <Box mr="4">
                        <Text size="2" color="gray" weight="bold">
                          Hubs
                        </Text>
                      </Box>
                      <Flex direction="column" align="center" mr="4" gap="3">
                        <Text size="2" color="gray">
                          Total
                        </Text>
                        <Text size="4" color="gray">
                          {metricsData?.totalHubs ?? "N/A"}
                        </Text>
                      </Flex>
                      <Flex direction="column" align="center" mr="4" gap="3">
                        <Text size="2" color="gray">
                          Online
                        </Text>
                        <Text size="4" color="gray">
                          {metricsData?.onlineHubs ?? "N/A"}
                        </Text>
                      </Flex>
                      <Flex direction="column" align="center" mr="4" gap="3">
                        <Text size="2" color="gray">
                          Offline
                        </Text>
                        <Text size="4" color="gray">
                          {metricsData?.totalHubs - metricsData?.onlineHubs}
                        </Text>
                      </Flex>
                    </Flex>
                  </Card>
                </Box>
                <Box maxWidth="240px">
                  <Card>
                    <Flex
                      direction="row"
                      align="center"
                      justify="between"
                      py="3"
                    >
                      <Box mr="4">
                        <Text size="2" color="gray" weight="bold">
                          Locks
                        </Text>
                      </Box>
                      <Flex direction="column" align="center" mr="4" gap="3">
                        <Text size="2" color="gray">
                          Total
                        </Text>
                        <Text size="4" color="gray">
                          {metricsData?.totalLocks ?? "N/A"}
                        </Text>
                      </Flex>
                      <Flex direction="column" align="center" mr="4" gap="3">
                        <Text size="2" color="gray">
                          Online
                        </Text>
                        <Text size="4" color="gray">
                          {metricsData?.onlineLocks ?? "N/A"}
                        </Text>
                      </Flex>
                      <Flex direction="column" align="center" mr="4" gap="3">
                        <Text size="2" color="gray">
                          Offline
                        </Text>
                        <Text size="4" color="gray">
                          {metricsData?.totalLocks - metricsData?.onlineLocks}
                        </Text>
                      </Flex>
                    </Flex>
                  </Card>
                </Box>
                <Box maxWidth="240px">
                  <Card>
                    <Flex
                      direction="row"
                      align="center"
                      justify="center"
                      py="3"
                    >
                      <Flex direction="column" align="center" gap="3">
                        <Text size="2" color="gray">
                          Door Ajar
                        </Text>
                        <Text size="4" color="gray">
                          {metricsData?.ajarDoors ?? "N/A"}
                        </Text>
                      </Flex>
                    </Flex>
                  </Card>
                </Box>
                <Box maxWidth="240px">
                  <Card>
                    <Flex
                      direction="row"
                      align="center"
                      justify="center"
                      py="3"
                    >
                      <Flex direction="column" align="center" gap="3">
                        <Text size="2" color="gray">
                          Ajar Doors
                        </Text>
                        <Text size="4" color="gray">
                          {metricsData?.ajarDoorsPercent ?? "N/A"}%
                        </Text>
                      </Flex>
                    </Flex>
                  </Card>
                </Box>
                <Box maxWidth="240px">
                  <Card>
                    <Flex
                      direction="row"
                      align="center"
                      justify="center"
                      py="3"
                    >
                      <Flex direction="column" align="center" gap="3">
                        <Text size="2" color="gray">
                          Door Open
                        </Text>
                        <Text size="4" color="gray">
                          {metricsData?.openDoors ?? "N/A"}
                        </Text>
                      </Flex>
                    </Flex>
                  </Card>
                </Box>
                <Box maxWidth="240px">
                  <Card>
                    <Flex
                      direction="row"
                      align="center"
                      justify="center"
                      py="3"
                    >
                      <Flex direction="column" align="center" gap="3">
                        <Text size="2" color="gray">
                          Low Battery
                        </Text>
                        <Text size="4" color="gray">
                          {metricsData?.lowBatteryDoors ?? "N/A"}
                        </Text>
                      </Flex>
                    </Flex>
                  </Card>
                </Box>
                <Box maxWidth="240px">
                  <Card>
                    <Flex
                      direction="row"
                      align="center"
                      justify="center"
                      py="3"
                    >
                      <Flex direction="column" align="center" gap="3">
                        <Text size="2" color="gray">
                          Low Battery
                        </Text>
                        <Text size="4" color="gray">
                          {metricsData?.lowBatteryDoorsPercent ?? "N/A"}%
                        </Text>
                      </Flex>
                    </Flex>
                  </Card>
                </Box>
                <Box maxWidth="240px">
                  <Card>
                    <Flex
                      direction="row"
                      align="center"
                      justify="center"
                      py="3"
                    >
                      <Flex direction="column" align="center" gap="3">
                        <Text size="2" color="gray">
                          Online Hub
                        </Text>
                        <Text size="4" color="gray">
                          {metricsData?.onlineHubsPercent ?? "N/A"}%
                        </Text>
                      </Flex>
                    </Flex>
                  </Card>
                </Box>
              </>
            ) : (
              <Text size="4" color="gray">
                Loading...
              </Text>
            )}
          </Flex>
        </Container>

        {/* Door Status Table */}
        <Container size="4" mb="8">
          <Box my="2">
            <Heading mb="2" size="6" color="gray">
              Room Door Status
            </Heading>
          </Box>
          <Box>
            <ScrollArea.Root className="w-full h-96 border rounded-lg overflow-hidden">
              <ScrollArea.Viewport className="w-full h-full overflow-auto">
                {error && <Text color="red">{error}</Text>}
                <Box mb="4">
                  <TextField.Root
                    placeholder="Search Room, Floor..."
                    value={doorSearchQuery}
                    onChange={(e) => setDoorSearchQuery(e.target.value)}
                  >
                    <TextField.Slot>
                      <MagnifyingGlassIcon height="16" width="16" />
                    </TextField.Slot>
                  </TextField.Root>
                </Box>
                <Table.Root
                  variant="surface"
                  className="w-full border-collapse"
                >
                  <Table.Header className="bg-gray-200 sticky top-0 z-10">
                    <Table.Row>
                      <Table.ColumnHeaderCell
                        onClick={() => handleDoorSort("name")}
                        style={{ cursor: "pointer" }}
                      >
                        Room
                        {doorSortColumn === "name" &&
                          (doorSortOrder === "asc" ? (
                            <ChevronUpIcon />
                          ) : (
                            <ChevronDownIcon />
                          ))}
                      </Table.ColumnHeaderCell>
                      <Table.ColumnHeaderCell
                        onClick={() => handleDoorSort("FloorName")}
                        style={{ cursor: "pointer" }}
                      >
                        Floor
                        {doorSortColumn === "FloorName" &&
                          (doorSortOrder === "asc" ? (
                            <ChevronUpIcon />
                          ) : (
                            <ChevronDownIcon />
                          ))}
                      </Table.ColumnHeaderCell>
                      <Table.ColumnHeaderCell
                        onClick={() => handleDoorSort("hubName")}
                        style={{ cursor: "pointer" }}
                      >
                        Hub
                        {doorSortColumn === "hubName" &&
                          (doorSortOrder === "asc" ? (
                            <ChevronUpIcon />
                          ) : (
                            <ChevronDownIcon />
                          ))}
                      </Table.ColumnHeaderCell>
                      {/* name: string; floorName: string; hubName: string; status:
                      string; isOpen: string; isLatched: string; isAjar: string;
                      isBatteryLow: string; isRfSignalWeak: string;
                      isDeadboltThrown: string; lastCommunication: string;
                      lastTimeOffline: string; */}
                      <Table.ColumnHeaderCell
                        onClick={() => handleDoorSort("status")}
                        style={{ cursor: "pointer" }}
                      >
                        Status
                        {doorSortColumn === "status" &&
                          (doorSortOrder === "asc" ? (
                            <ChevronUpIcon />
                          ) : (
                            <ChevronDownIcon />
                          ))}
                      </Table.ColumnHeaderCell>
                      <Table.ColumnHeaderCell>Is Closed</Table.ColumnHeaderCell>
                      <Table.ColumnHeaderCell>Is Open</Table.ColumnHeaderCell>
                      <Table.ColumnHeaderCell>Door Ajar</Table.ColumnHeaderCell>
                      <Table.ColumnHeaderCell>
                        Low Battery
                      </Table.ColumnHeaderCell>
                      <Table.ColumnHeaderCell>
                        Weak Hub Signal
                      </Table.ColumnHeaderCell>
                      <Table.ColumnHeaderCell>
                        Privacy Enabled
                      </Table.ColumnHeaderCell>
                      <Table.ColumnHeaderCell>
                        Last Comm.
                      </Table.ColumnHeaderCell>
                      <Table.ColumnHeaderCell
                        onClick={() => handleDoorSort("hubLastOffline")}
                        style={{ cursor: "pointer" }}
                      >
                        Last Offline
                        {doorSortColumn === "hubLastOffline" &&
                          (doorSortOrder === "asc" ? (
                            <ChevronUpIcon />
                          ) : (
                            <ChevronDownIcon />
                          ))}
                      </Table.ColumnHeaderCell>
                    </Table.Row>
                  </Table.Header>
                  <Table.Body>
                    {paginatedDoorData.map((item, index) => (
                      <Table.Row key={index} align="center">
                        <Table.RowHeaderCell>
                          <Text>{item.name}</Text>
                        </Table.RowHeaderCell>
                        <Table.Cell>
                          <Text>{item.floorName}</Text>
                        </Table.Cell>
                        <Table.Cell>
                          <Text>{item.HubName}</Text>
                        </Table.Cell>
                        <Table.Cell>
                          <Badge
                            color={
                              ["Offline", "Unknown"].includes(item.status)
                                ? "red"
                                : "green"
                            }
                            radius="full"
                          >
                            <Text>{item.status}</Text>
                          </Badge>
                        </Table.Cell>
                        <Table.Cell>
                          <Text>
                            <Text
                              style={{
                                color: item.isOpen ? "green" : "red",
                                fontSize: "16px",
                              }}
                            >
                              {item.isOpen ? "x" : "✓"}
                            </Text>
                          </Text>
                        </Table.Cell>
                        <Table.Cell>
                          <Text>
                            <Text
                              style={{
                                color: item.isOpen ? "green" : "red",
                                fontSize: "16px",
                              }}
                            >
                              {item.isOpen ? "✓" : "✗"}
                            </Text>
                          </Text>
                        </Table.Cell>
                        <Table.Cell>
                          <Text>
                            <Text
                              style={{
                                color: item.isAjar ? "green" : "red",
                                fontSize: "16px",
                              }}
                            >
                              {item.isAjar ? "✓" : "✗"}
                            </Text>
                          </Text>
                        </Table.Cell>
                        <Table.Cell>
                          <Text>
                            <Text
                              style={{
                                color: item.isBatteryLow ? "green" : "red",
                                fontSize: "16px",
                              }}
                            >
                              {item.isBatteryLow ? "✓" : "✗"}
                            </Text>
                          </Text>
                        </Table.Cell>
                        <Table.Cell>
                          <Text>
                            <Text
                              style={{
                                color: item.isRfSignalWeak ? "green" : "red",
                                fontSize: "16px",
                              }}
                            >
                              {item.isRfSignalWeak ? "✓" : "✗"}
                            </Text>
                          </Text>
                        </Table.Cell>
                        <Table.Cell>
                          <Text>
                            <Text
                              style={{
                                color: item.isDeadboltThrown ? "green" : "red",
                                fontSize: "16px",
                              }}
                            >
                              {item.isDeadboltThrown ? "✓" : "✗"}
                            </Text>
                          </Text>
                        </Table.Cell>

                        <Table.Cell>
                          <Text>
                            {formatDateLocal(item.lastCommunications)}
                          </Text>
                        </Table.Cell>

                        <Table.Cell>
                          <Text>{formatDateLocal(item.hubLastOffline)}</Text>
                        </Table.Cell>
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
                value={doorRowsPerPage.toString()}
                onValueChange={(value) => {
                  setDoorRowsPerPage(Number(value));
                  setDoorCurrentPage(1);
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
                  disabled={doorCurrentPage === 1}
                  onClick={() =>
                    setDoorCurrentPage((prev) => Math.max(prev - 1, 1))
                  }
                >
                  Previous
                </Button>
                <Text size="2" color="gray">
                  Page {doorCurrentPage} of {doorTotalPages}
                </Text>
                <Button
                  variant="outline"
                  disabled={doorCurrentPage === doorTotalPages}
                  onClick={() =>
                    setDoorCurrentPage((prev) =>
                      Math.min(prev + 1, doorTotalPages)
                    )
                  }
                >
                  Next
                </Button>
              </Flex>
            </Flex>
          </Box>
        </Container>

        {/* Hub Status Table */}
        <Container size="4">
          <Box my="2">
            <Heading mb="2" size="6" color="gray">
              Hub Status
            </Heading>
          </Box>
          <Box>
            <ScrollArea.Root className="w-full h-96 border rounded-lg overflow-hidden">
              <ScrollArea.Viewport className="w-full h-full overflow-auto">
                <Box mb="4">
                  <TextField.Root
                    placeholder="Search hub name, Mac Address..."
                    value={hubSearchQuery}
                    onChange={(e) => setHubSearchQuery(e.target.value)}
                  >
                    <TextField.Slot>
                      <MagnifyingGlassIcon height="16" width="16" />
                    </TextField.Slot>
                  </TextField.Root>
                </Box>
                <Table.Root
                  variant="surface"
                  className="w-full border-collapse"
                >
                  <Table.Header className="bg-gray-200 sticky top-0 z-10">
                    <Table.Row>
                      <Table.ColumnHeaderCell
                        onClick={() => handleHubSort("hubName")}
                        style={{ cursor: "pointer" }}
                      >
                        Hub Name
                        {hubSortColumn === "hubName" &&
                          (hubSortOrder === "asc" ? (
                            <ChevronUpIcon />
                          ) : (
                            <ChevronDownIcon />
                          ))}
                      </Table.ColumnHeaderCell>
                      <Table.ColumnHeaderCell
                        onClick={() => handleHubSort("hubIpAddress")}
                        style={{ cursor: "pointer" }}
                      >
                        IP Address
                        {hubSortColumn === "hubIpAddress" &&
                          (hubSortOrder === "asc" ? (
                            <ChevronUpIcon />
                          ) : (
                            <ChevronDownIcon />
                          ))}
                      </Table.ColumnHeaderCell>
                      <Table.ColumnHeaderCell
                        onClick={() => handleHubSort("macAddress")}
                        style={{ cursor: "pointer" }}
                      >
                        Mac Address
                        {hubSortColumn === "macAddress" &&
                          (hubSortOrder === "asc" ? (
                            <ChevronUpIcon />
                          ) : (
                            <ChevronDownIcon />
                          ))}
                      </Table.ColumnHeaderCell>
                      <Table.ColumnHeaderCell
                        onClick={() => handleHubSort("deviceStatusName")}
                        style={{ cursor: "pointer" }}
                      >
                        Status
                        {hubSortColumn === "deviceStatusName" &&
                          (hubSortOrder === "asc" ? (
                            <ChevronUpIcon />
                          ) : (
                            <ChevronDownIcon />
                          ))}
                      </Table.ColumnHeaderCell>
                      <Table.ColumnHeaderCell
                        onClick={() => handleHubSort("rfStatusName")}
                        style={{ cursor: "pointer" }}
                      >
                        RF Status
                        {hubSortColumn === "rfStatusName" &&
                          (hubSortOrder === "asc" ? (
                            <ChevronUpIcon />
                          ) : (
                            <ChevronDownIcon />
                          ))}
                      </Table.ColumnHeaderCell>
                      <Table.ColumnHeaderCell
                        onClick={() => handleHubSort("firmwareHub")}
                        style={{ cursor: "pointer" }}
                      >
                        Firmware
                        {hubSortColumn === "firmwareHub" &&
                          (hubSortOrder === "asc" ? (
                            <ChevronUpIcon />
                          ) : (
                            <ChevronDownIcon />
                          ))}
                      </Table.ColumnHeaderCell>
                      <Table.ColumnHeaderCell
                        onClick={() => handleHubSort("lastTimeOffline")}
                        style={{ cursor: "pointer" }}
                      >
                        Last Offline
                        {hubSortColumn === "lastTimeOffline" &&
                          (hubSortOrder === "asc" ? (
                            <ChevronUpIcon />
                          ) : (
                            <ChevronDownIcon />
                          ))}
                      </Table.ColumnHeaderCell>
                    </Table.Row>
                  </Table.Header>
                  <Table.Body>
                    {paginatedHubData.map((item, index) => (
                      <Table.Row key={index} align="center">
                        <Table.RowHeaderCell>
                          <Text>{item.hubName}</Text>
                        </Table.RowHeaderCell>
                        <Table.Cell>
                          <Text>{item.hubIpAddress}</Text>
                        </Table.Cell>
                        <Table.Cell>
                          <Text>{item.macAddress}</Text>
                        </Table.Cell>
                        <Table.Cell>
                          <Badge
                            color={
                              ["Offline", "Unknown"].includes(
                                item.deviceStatusName
                              )
                                ? "red"
                                : "green"
                            }
                            radius="full"
                          >
                            <Text>{item.deviceStatusName}</Text>
                          </Badge>
                        </Table.Cell>
                        <Table.Cell>
                          <Badge
                            color={
                              ["Unknown", "Deactivated", "PairingOff"].includes(
                                item.rfStatusName
                              )
                                ? "red"
                                : "green"
                            }
                            radius="full"
                          >
                            <Text>{item.rfStatusName}</Text>
                          </Badge>
                        </Table.Cell>
                        <Table.Cell>
                          <Text>{item.firmwareHub}</Text>
                        </Table.Cell>
                        <Table.Cell>
                          <Text>{formatDateLocal(item.lastTimeOffline)}</Text>
                        </Table.Cell>
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
                value={hubRowsPerPage.toString()}
                onValueChange={(value) => {
                  setHubRowsPerPage(Number(value));
                  setHubCurrentPage(1);
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
                  disabled={hubCurrentPage === 1}
                  onClick={() =>
                    setHubCurrentPage((prev) => Math.max(prev - 1, 1))
                  }
                >
                  Previous
                </Button>
                <Text size="2" color="gray">
                  Page {hubCurrentPage} of {hubTotalPages}
                </Text>
                <Button
                  variant="outline"
                  disabled={hubCurrentPage === hubTotalPages}
                  onClick={() =>
                    setHubCurrentPage((prev) =>
                      Math.min(prev + 1, hubTotalPages)
                    )
                  }
                >
                  Next
                </Button>
              </Flex>
            </Flex>
          </Box>
        </Container>
      </Box>
    </div>
  );
}

export default DoorStatus;
