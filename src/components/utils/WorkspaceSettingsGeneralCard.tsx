import { Box, Typography, FormHelperText } from "@mui/material";
import CustomTextFieldPrimary from "./CustomTextFieldPrimary";
import StyledAutocomplete from "./StyledAutocomplete";
import { useWorkspaceContext } from "../../providers/WorkspaceProvider";
import { useState, useEffect } from "react";
import type { AutocompleteValue } from "../../types/workspace";

export default function WorkspaceSettingsGeneralCard() {
  const { workspaces, selectedWorkspace, setSelectedWorkspace } =
    useWorkspaceContext();
  const [workspaceAutocomplete, setWorkspaceAutocomplete] = useState<
    AutocompleteValue[]
  >([]);

  const handleCreateWorkspace = (v: AutocompleteValue | null) =>
    setSelectedWorkspace(v);

  useEffect(() => {
    if (workspaces) {
      const autocomplete = workspaces.map((w) => ({
        id: w.id,
        label: w.title,
      }));
      const defaultWorkspace = autocomplete[0];

      setWorkspaceAutocomplete(autocomplete);
      setSelectedWorkspace(defaultWorkspace);
    }
  }, [workspaces]);

  return (
    <Box
      sx={{
        p: 2,
        borderRadius: 3,
        position: "relative",
        backgroundColor: "#fff",
      }}
    >
      <Box>
        <Typography>General</Typography>
        <FormHelperText>Select workspace</FormHelperText>
        <StyledAutocomplete
          size="small"
          options={workspaceAutocomplete ?? []}
          value={selectedWorkspace}
          renderInput={(params) => (
            <CustomTextFieldPrimary
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
      </Box>
    </Box>
  );
}
