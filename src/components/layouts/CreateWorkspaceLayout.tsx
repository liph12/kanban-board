import { Box, Typography, Button } from "@mui/material";
import CustomTextField from "../utils/CustomTextField";
import useAxios from "../../hooks/useAxios";
import { useState, type ChangeEvent, type FormEvent } from "react";
import { getUserJson } from "../../helpers";
import { useNavigate } from "react-router-dom";
import { useWorkspaceContext } from "../../providers/WorkspaceProvider";

export default function CreateWorkspaceLayout() {
  const { setWorkspaces } = useWorkspaceContext();
  const user = getUserJson();
  const axios = useAxios();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleCreate = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setLoading(true);

    try {
      const response = await axios.post(
        `/workspaces`,
        { title, description },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${user.auth_token}`,
          },
        }
      );
      const { data } = response.data;

      setWorkspaces((prev) => (prev ? [...prev, data] : []));
      navigate(`/workspace/${data.id}`);
    } catch (e) {
      console.log(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        backgroundColor: "#fff",
        padding: 2,
        borderRadius: 3,
        width: 400,
      }}
      component="form"
      onSubmit={handleCreate}
    >
      <Box sx={{ mb: 2 }}>
        <Typography variant="h6" color="#333" fontWeight={700}>
          Create a new workspace
        </Typography>
        <Typography variant="body2" color="gray">
          Organize pages, tasks, permissions and members.
        </Typography>
      </Box>
      <Box sx={{ mb: 2 }}>
        <Typography color="#aaa" variant="body2">
          Title
        </Typography>
        <CustomTextField
          placeholder="Workspace title"
          onChange={(e: ChangeEvent<HTMLInputElement>) =>
            setTitle(e.target.value)
          }
        />
      </Box>
      <Box sx={{ mb: 2 }}>
        <Typography color="#aaa" variant="body2">
          Description
        </Typography>
        <CustomTextField
          placeholder="Details about your workspace"
          multiline
          rows={3}
          onChange={(e: ChangeEvent<HTMLInputElement>) =>
            setDescription(e.target.value)
          }
        />
      </Box>
      <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
        <Button
          type="submit"
          sx={{ borderRadius: 2, textTransform: "none" }}
          variant="contained"
          size="small"
          loading={loading}
          disableElevation
        >
          Create workspace
        </Button>
      </Box>
    </Box>
  );
}
