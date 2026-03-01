import { Box, Typography, Badge, IconButton } from "@mui/material";
import {
  ChevronRight,
  ExpandMoreRounded,
  SourceOutlined,
  AutoAwesomeMosaicOutlined,
} from "@mui/icons-material";
import { Link, useLocation } from "react-router-dom";
import React, { useState } from "react";
import { useWorkspaceContext } from "../providers/WorkspaceProvider";
import { DEFAULT_ROUTES } from "../app-data";

export default function SideBar() {
  const { workspaces, activityCount } = useWorkspaceContext();
  const location = useLocation();
  const currentPath = location.pathname;
  const [routes, setRoutes] = useState([...DEFAULT_ROUTES]);
  const projects = workspaces?.flatMap((w) => w.projects);

  const handleExpand = (path: string) =>
    setRoutes((prev) =>
      prev.map((r) => (r.path === path ? { ...r, expanded: !r.expanded } : r))
    );

  return (
    <Box
      sx={{
        backgroundColor: "rgb(35, 34, 34)",
        borderRight: "0.5px solid rgb(53, 52, 52)",
        width: 300,
        height: "100vh",
      }}
    >
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Box></Box>
        <IconButton>
          <AutoAwesomeMosaicOutlined sx={{ color: "#aaa" }} />
        </IconButton>
      </Box>
      <Box sx={{ my: 1.5 }}>
        <>
          <Box sx={{ mb: 3 }}>
            {routes.map((r, key) => {
              const Icon = r.icon;
              const active =
                (currentPath === r.path ||
                  currentPath.startsWith(r.path + "/")) &&
                !r.expandable;

              return (
                <React.Fragment key={key}>
                  <Box
                    component={r.expandable ? "div" : Link}
                    onClick={() => handleExpand(r.path)}
                    to={r.path}
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      textDecoration: "none",
                      px: 1,
                      py: 1,
                      width: "auto",
                      cursor: "pointer",
                      backgroundColor: active ? "#333" : "transparent",
                      ":hover": {
                        backgroundColor: "#333",
                      },
                    }}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        gap: 1,
                        alignItems: "center",
                      }}
                    >
                      {r.path === "/activity" ? (
                        <Badge
                          badgeContent={activityCount}
                          color="error"
                          variant="standard"
                          overlap="circular"
                        >
                          <Icon
                            fontSize="small"
                            sx={{ color: active ? "info.main" : "#ccc" }}
                          />
                        </Badge>
                      ) : (
                        <Icon
                          fontSize="small"
                          sx={{ color: active ? "info.main" : "#ccc" }}
                        />
                      )}

                      <Typography
                        sx={{
                          color: active ? "info.main" : "#ccc",
                          fontWeight: 500,
                        }}
                        variant="body2"
                      >
                        {r.title}
                      </Typography>
                    </Box>
                    {r.expandable && (
                      <>
                        <Box>
                          {r.expanded ? (
                            <ExpandMoreRounded
                              sx={{ color: "#ccc" }}
                              fontSize="small"
                            />
                          ) : (
                            <ChevronRight
                              sx={{ color: "#ccc" }}
                              fontSize="small"
                            />
                          )}
                        </Box>
                      </>
                    )}
                  </Box>
                  {r.expanded && r.expandable && r.path === "/projects" && (
                    <Box
                      sx={{
                        pl: 2,
                        transition: "0.2s",
                      }}
                    >
                      <Box>
                        {projects?.map((p) => {
                          const path = `/workspace/${p.workspace_id}/${p.id}`;
                          const _active = currentPath === path;

                          return (
                            <Box
                              component={Link}
                              to={path}
                              key={p.id}
                              sx={{
                                display: "flex",
                                gap: 1,
                                alignItems: "center",
                                textDecoration: "none",
                                px: 1,
                                py: 1,
                                width: "auto",
                                cursor: "pointer",
                                backgroundColor: _active
                                  ? "#333"
                                  : "transparent",
                                ":hover": {
                                  backgroundColor: "#333",
                                },
                              }}
                            >
                              <SourceOutlined
                                sx={{ color: _active ? "info.main" : "#ccc" }}
                                fontSize="small"
                              />
                              <Typography
                                variant="body2"
                                sx={{ color: _active ? "info.main" : "#ccc" }}
                              >
                                {p.title}
                              </Typography>
                            </Box>
                          );
                        })}
                      </Box>
                    </Box>
                  )}
                  {r.expanded && r.expandable && r.path === "/settings" && (
                    <Box
                      sx={{
                        pl: 2,
                        transition: "0.2s",
                      }}
                    >
                      <Box>
                        {r.children?.map((s, k) => {
                          const _active = currentPath === s.path;
                          const Icon = s.icon;

                          return (
                            <Box
                              component={Link}
                              to={s.path}
                              key={k}
                              sx={{
                                display: "flex",
                                gap: 1,
                                alignItems: "center",
                                textDecoration: "none",
                                px: 1,
                                py: 1,
                                width: "auto",
                                cursor: "pointer",
                                backgroundColor: _active
                                  ? "#333"
                                  : "transparent",
                                ":hover": {
                                  backgroundColor: "#333",
                                },
                              }}
                            >
                              <Icon
                                sx={{ color: _active ? "info.main" : "#ccc" }}
                                fontSize="small"
                              />
                              <Typography
                                variant="body2"
                                sx={{ color: _active ? "info.main" : "#ccc" }}
                              >
                                {s.title}
                              </Typography>
                            </Box>
                          );
                        })}
                      </Box>
                    </Box>
                  )}
                </React.Fragment>
              );
            })}
          </Box>
        </>
      </Box>
    </Box>
  );
}
