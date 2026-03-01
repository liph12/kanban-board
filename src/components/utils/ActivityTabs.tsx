import * as React from "react";
import Box from "@mui/material/Box";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";

interface ActivityTabProps {
  handleChange: (event: React.SyntheticEvent, newValue: number) => void;
  value: number;
}

export default function ActivityTabs({
  value,
  handleChange,
}: ActivityTabProps) {
  return (
    <Box sx={{ width: "100%" }}>
      <Tabs
        value={value}
        onChange={handleChange}
        centered
        sx={{
          minHeight: 32,
          "& .MuiTabs-indicator": {
            display: "flex",
            justifyContent: "center",
            backgroundColor: "transparent",
          },
          "& .MuiTabs-indicatorSpan": {
            maxWidth: 50,
            width: "100%",
            height: 2,
            borderRadius: 2,
            backgroundColor: "#1976d2",
          },
        }}
        TabIndicatorProps={{
          children: <span className="MuiTabs-indicatorSpan" />,
        }}
      >
        <Tab
          label="All"
          sx={{
            minHeight: 32,
            fontSize: "0.80rem",
            textTransform: "none",
            padding: "2px 0px",
          }}
        />
        <Tab
          label="Create"
          sx={{
            minHeight: 32,
            fontSize: "0.80rem",
            textTransform: "none",
            padding: "2px 0px",
          }}
        />
        <Tab
          label="Progress"
          sx={{
            minHeight: 32,
            fontSize: "0.80rem",
            textTransform: "none",
            padding: "2px 0px",
          }}
        />
      </Tabs>
    </Box>
  );
}
