import { Box, Breadcrumbs, Typography, Divider } from "@mui/material";
import { ManageSearchRounded } from "@mui/icons-material";
import { useLocation, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { useWorkspaceContext } from "../providers/WorkspaceProvider";
import StyledAutocomplete from "./utils/StyledAutocomplete";
import CustomTextField from "./utils/CustomTextField";
import { DEFAULT_ROUTES } from "../app-data";
import type { AutocompleteValue } from "../types/workspace";
import { useNavigate } from "react-router-dom";
import AccountMenu from "./AccountMenu";

export default function AppBar() {
  const {
    workspaces,
    selectedActivity,
    setSelectedWorkspace,
    selectedWorkspace,
  } = useWorkspaceContext();
  const location = useLocation();
  const navigate = useNavigate();
  const { workspace_id, project_id } = useParams();
  const [workspaceTitle, setWorkspaceTitle] = useState<string>("");
  const [projectTitle, setProjectTitle] = useState<string>("");
  const [workspaceAutocomplete, setWorkspaceAutocomplete] = useState<
    AutocompleteValue[]
  >([]);
  const defaultAutocompleteSearchValue = { id: 0, label: "Find workspace" };

  const handleCreateWorkspace = (v: AutocompleteValue | null) => {
    setSelectedWorkspace(v ?? defaultAutocompleteSearchValue);
    if (v) {
      navigate(`/workspace/${v?.id}`);
    }
  };

  useEffect(() => {
    if (workspaces) {
      const autocomplete = workspaces.map((w) => ({
        id: w.id,
        label: w.title,
      }));

      setWorkspaceAutocomplete(autocomplete);
      setSelectedWorkspace(defaultAutocompleteSearchValue);
    }

    if (workspace_id) {
      const workspace = workspaces?.find((w) => w.id === workspace_id);

      if (workspace) {
        setWorkspaceTitle(workspace?.title ?? "Loading...");
      }

      if (project_id) {
        const project = workspace?.projects?.find((p) => p.id === project_id);

        setProjectTitle(project?.title ?? "Loading...");
      } else {
        setProjectTitle("");
      }
    }
  }, [workspace_id, project_id, workspaces]);

  const path = location.pathname;

  return (
    <>
      <Box
        sx={{
          px: 1,
          py: 1,
          backgroundColor: "#fff",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          position: "sticky",
        }}
      >
        <Box
          sx={{ width: "50%", display: "flex", gap: 1, alignItems: "center" }}
        >
          <StyledAutocomplete
            size="small"
            options={workspaceAutocomplete ?? []}
            value={selectedWorkspace}
            renderInput={(params) => (
              <CustomTextField
                params={params}
                name="workspace"
                size="small"
                value={selectedWorkspace?.label ?? null}
              />
            )}
            onChange={(_, v) => {
              handleCreateWorkspace(v);
            }}
            isOptionEqualToValue={(option, value) =>
              value === undefined || option.id === value.id
            }
          />
          <ManageSearchRounded fontSize="large" color="action" />
        </Box>
        <Box>
          <AccountMenu />
        </Box>
      </Box>
      <Divider />
      <Box sx={{ py: 0.5, px: 2, backgroundColor: "#fff" }}>
        {path.startsWith("/workspace/") ? (
          <Breadcrumbs
            sx={{
              color: "#aaa",
              "& .MuiBreadcrumbs-separator": { color: "#aaa" },
            }}
          >
            <Typography color="#333" variant="body2">
              Workspace
            </Typography>
            <Typography color="#333" variant="body2">
              {workspaceTitle}
            </Typography>
            <Typography color="#333" variant="body2">
              {projectTitle}
            </Typography>
          </Breadcrumbs>
        ) : (
          <>
            {DEFAULT_ROUTES.some((r) => r.children.length > 0) && (
              <>
                {path.startsWith("/settings/") && (
                  <Breadcrumbs
                    sx={{
                      color: "#aaa",
                      "& .MuiBreadcrumbs-separator": { color: "#aaa" },
                    }}
                  >
                    <Typography color="#333" variant="body2">
                      Settings
                    </Typography>
                    <Typography color="#333" variant="body2">
                      {
                        DEFAULT_ROUTES.find(
                          (r) => r.path === "/settings"
                        )?.children?.find((r) => r.path === path)?.title
                      }
                    </Typography>
                  </Breadcrumbs>
                )}
              </>
            )}
            {path === "/create-workspace" && (
              <Breadcrumbs
                sx={{
                  color: "#aaa",
                  "& .MuiBreadcrumbs-separator": { color: "#aaa" },
                }}
              >
                <Typography color="#333" variant="body2">
                  Create workspace
                </Typography>
              </Breadcrumbs>
            )}
            {path.startsWith("/activity/") && (
              <Breadcrumbs
                sx={{
                  color: "#aaa",
                  "& .MuiBreadcrumbs-separator": { color: "#aaa" },
                }}
              >
                <Typography color="#333" variant="body2">
                  Activity
                </Typography>
                <Typography color="#333" variant="body2">
                  {selectedActivity?.item?.project?.workspace_title ?? ""}
                </Typography>
                <Typography color="#333" variant="body2">
                  {selectedActivity?.item?.project?.title ?? ""}
                </Typography>
              </Breadcrumbs>
            )}
            <Breadcrumbs
              sx={{
                color: "#aaa",
                "& .MuiBreadcrumbs-separator": { color: "#aaa" },
              }}
            >
              {DEFAULT_ROUTES.some((r) => r.children.length === 0) && (
                <Typography color="#333" variant="body2">
                  {DEFAULT_ROUTES.find((r) => r.path === path)?.title}
                </Typography>
              )}
            </Breadcrumbs>
          </>
        )}
      </Box>
    </>
  );
}
