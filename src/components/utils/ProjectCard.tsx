import type { Project } from "../../types/workspace";
import { Box, Typography, Divider } from "@mui/material";
import { Link } from "react-router-dom";
import StyledButton from "./StyledButton";
import { shortenText } from "../../helpers";

interface ProjectCardProps {
  project: Project;
  workspaceId: string;
}

export default function ProjectCard({
  project,
  workspaceId,
}: ProjectCardProps) {
  const { title, description, id } = project;

  return (
    <Box
      sx={{
        p: 2,
        borderRadius: 3,
        height: 100,
        position: "relative",
        backgroundColor: "#fff",
      }}
    >
      <Typography fontWeight="bold">{title}</Typography>
      <Divider sx={{ my: 1 }} />
      <Typography variant="body2">
        {shortenText(description, 55) ?? "No description."}
      </Typography>
      <Box sx={{ position: "absolute", bottom: 5, right: 5 }}>
        <Link to={`/workspace/${workspaceId}/${id}`}>
          <StyledButton
            size="small"
            variant="outlined"
            color="info"
            sx={{ borderRadius: 2 }}
          >
            Manage
          </StyledButton>
        </Link>
      </Box>
    </Box>
  );
}
