import { useState } from "react";
import "@radix-ui/themes/styles.css";
import * as Checkbox from "@radix-ui/react-checkbox";

import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import {
  Theme,
  Box,
  TextField,
  Code,
  Text,
  Table,
  Heading,
  Container,
  Select,
  Flex,
  Button,
  Popover,
} from "@radix-ui/themes";

import {
  MagnifyingGlassIcon,
  ChevronUpIcon,
  ChevronDownIcon,
  CheckIcon,
  FunnelIcon,
} from "@radix-ui/react-icons";

import { Filter } from "lucide-react";

import "./App.css";

import Sidebar from "/src/components/sidebar/Sidebar";
import { ThemeProvider } from "/src/components/sidebar/ThemeContext";
import OnlineEvents from "./components/pages/OnlineEvents";
import DoorStatus from "./components/pages/DoorStatus";
const columnOptions = ["Time Stamp", "Email", "Group"];

function App() {
  const [visibleColumns, setVisibleColumns] = useState<string[]>(columnOptions);
  const [showSelector, setShowSelector] = useState(false);

  const toggleColumn = (column: string) => {
    setVisibleColumns((prev) =>
      prev.includes(column)
        ? prev.filter((c) => c !== column)
        : [...prev, column]
    );
  };

  const showAllColumns = () => {
    setVisibleColumns(columnOptions); // Show all columns
  };
  return (
    <ThemeProvider>
      <Router>
        <div className="container">
          <Sidebar />
          <main className="main-content">
            <Routes>
              <Route path="/real-time" element={<OnlineEvents />} />
              <Route path="/door-status" element={<DoorStatus />} />
            </Routes>
          </main>
        </div>
      </Router>
    </ThemeProvider>
  );
}

export default App;
