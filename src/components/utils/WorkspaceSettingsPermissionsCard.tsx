import {
  Box,
  Typography,
  FormHelperText,
  Divider,
  Chip,
  Avatar,
} from "@mui/material";
import CustomTextFieldPrimary from "./CustomTextFieldPrimary";
import StyledAutocomplete from "./StyledAutocomplete";
import type { AutocompleteValue } from "../../types/workspace";
import { useWorkspaceContext } from "../../providers/WorkspaceProvider";
import { useState, useEffect } from "react";
import type { Contributor, Permission } from "../../types/card";
import { SaveRounded } from "@mui/icons-material";
import { getPermissionColor } from "../../helpers";
import StyledButton from "./StyledButton";
import PermissionMenu from "../PermissionMenu";
import { getUserJson } from "../../helpers";
import useAxios from "../../hooks/useAxios";

interface User {
  id: number;
  name: string;
  email: string;
  full_name: string;
  avatar: string;
}

const PERMISSIONS = {
  owner: 0,
  admin: 1,
  read: 2,
  write: 3,
};

export default function WorkspaceSettingsPermissionsCard() {
  const axios = useAxios();
  const user = getUserJson();
  const { selectedWorkspace, workspaces, socket } = useWorkspaceContext();
  const [saving, setSaving] = useState<boolean>(false);
  const [contributors, setContributors] = useState<Contributor[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [usersAutocomplete, setUsersAutocomplete] = useState<
    AutocompleteValue[]
  >([]);
  const [selectedUser, setSelectedUser] = useState<AutocompleteValue | null>(
    null
  );
  const [permission, setPermission] = useState<Permission | null>(null);
  const [workspaceOwner, setWorkspaceOwner] = useState<Contributor | null>(
    null
  );
  const [isAdmin, setIsAdmin] = useState<boolean>(false);

  const selectPermission = (p: Permission) => setPermission(p);

  const handleSelectUser = (
    v: AutocompleteValue | null,
    p: Permission = "read"
  ) => {
    setSelectedUser(v);
    setPermission(p);
  };

  const handleSelectContributor = (c: Contributor) => {
    const autocomplete: AutocompleteValue = {
      id: c.id,
      label: c.name,
    };

    handleSelectUser(autocomplete, c.permission);
  };

  const storeAndUpdateContributor = async (
    c: Contributor,
    wId: string | number
  ) => {
    try {
      setSaving(true);
      const payLoad = {
        workspace_id: wId,
        user_id: c.id,
        user_permission_id: PERMISSIONS[c.permission],
      };
      const response = await axios.post(`/store-contributor`, payLoad, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.auth_token}`,
        },
      });

      const { data } = response.data;

      socket?.emit("update_user", { ...data, userId: data.email });
    } catch (e) {
      console.log(e);
    } finally {
      setSaving(false);
    }
  };

  const handleAddContributorPermissionAsync = async () => {
    const oldUser = contributors.find((c) => c.id === selectedUser?.id);
    const getUserFromAutocomplete = users.find(
      (u) => u.id === selectedUser?.id
    );
    const newContributor = {
      ...getUserFromAutocomplete,
      permission: permission,
    } as Contributor;

    if (newContributor?.id === workspaceOwner?.id) {
      return;
    }

    if (selectedWorkspace) {
      await storeAndUpdateContributor(newContributor, selectedWorkspace?.id);

      if (!oldUser) {
        setContributors((prev) => [...prev, newContributor]);
      } else {
        if (permission) {
          setContributors((prev) =>
            prev.map((c) =>
              c.id === oldUser.id ? { ...c, permission: permission } : c
            )
          );
        }
      }
    }
  };

  useEffect(() => {
    if (selectedWorkspace) {
      const workspace = workspaces?.find((w) => w.id === selectedWorkspace.id);
      const users = workspace?.contributors ?? [];

      if (workspace) {
        const _isAdmin = users.some(
          (u) => u.email === user.email && u.permission === "admin"
        );

        setIsAdmin(_isAdmin);
        setContributors(users);
        setWorkspaceOwner(workspace.owner);
      }
    }
  }, [selectedWorkspace]);

  useEffect(() => {
    const getUsersAsync = async () => {
      const response = await axios.get(`users`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.auth_token}`,
        },
      });
      const { data } = response.data;

      const autocomplete = data.map((u: any) => ({
        id: u?.id,
        label: u?.name,
      }));

      setUsersAutocomplete(autocomplete);
      setUsers(data);
    };

    getUsersAsync();
  }, []);

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
        <Typography>Permissions</Typography>
        {workspaceOwner?.email === user.email || isAdmin ? (
          <>
            <FormHelperText>Add contributor</FormHelperText>
            <Box sx={{ display: "flex", gap: 1 }}>
              <StyledAutocomplete
                size="small"
                options={usersAutocomplete}
                value={selectedUser}
                renderInput={(params) => (
                  <CustomTextFieldPrimary
                    params={params}
                    placeholder="Seach user..."
                    name="user"
                    size="small"
                    value={selectedUser?.label ?? null}
                  />
                )}
                onChange={(_, v) => {
                  handleSelectUser(v);
                }}
                isOptionEqualToValue={(option, value) =>
                  value === undefined || option.id === value.id
                }
              />
              <PermissionMenu
                selectPermission={selectPermission}
                permission={permission}
              />
            </Box>
          </>
        ) : (
          <FormHelperText>
            Only the workspace owner or an admin can manage its permissions.
          </FormHelperText>
        )}
      </Box>
      <Divider sx={{ my: 2 }} />
      <Box sx={{ position: "relative" }}>
        <Typography variant="body2">Contributors</Typography>
        <Box
          sx={{
            height: 200,
            overflow: "auto",
            mt: 1,
          }}
        >
          {contributors.map((c, k) => (
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                py: 0.5,
                px: 1,
                mb: 1,
                borderRadius: 2,
                backgroundColor: selectedUser?.id === c.id ? "#eee" : "#fff",
                justifyContent: "space-between",
                cursor: "pointer",
                ":hover": {
                  backgroundColor: "#eee",
                  transition: "0.2s",
                },
              }}
              key={k}
              onClick={() => handleSelectContributor(c)}
            >
              <Box
                sx={{
                  display: "flex",
                  gap: 1,
                  alignItems: "center",
                }}
              >
                <Avatar
                  src={c.avatar}
                  sx={{ height: 35, width: 35, border: "2px solid #eee" }}
                />
                <Box>
                  <Typography variant="body2">{c.name}</Typography>
                  <Typography variant="caption">{c.email}</Typography>
                </Box>
              </Box>
              <Chip
                label={
                  c.email === workspaceOwner?.email ? "owner" : c.permission
                }
                size="small"
                color={getPermissionColor(
                  c.email === workspaceOwner?.email ? "owner" : c.permission
                )}
              />
            </Box>
          ))}
        </Box>
        <Divider />
        <Box sx={{ height: 40 }}>
          <Box sx={{ position: "absolute", bottom: 0, right: 0 }}>
            {(workspaceOwner?.email === user.email || isAdmin) && (
              <StyledButton
                size="small"
                variant="contained"
                sx={{ borderRadius: 2 }}
                disabled={
                  selectedUser === null ||
                  workspaceOwner?.id === selectedUser.id
                }
                startIcon={<SaveRounded />}
                onClick={handleAddContributorPermissionAsync}
                loading={saving}
              >
                Save
              </StyledButton>
            )}
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
