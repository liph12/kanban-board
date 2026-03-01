import { useParams } from "react-router-dom";
import LoginLayout from "./layouts/LoginLayout";
import RegistrationLayout from "./layouts/RegistrationLayout";

export default function Auth() {
  const { auth_type } = useParams();
  return (
    <>
      {auth_type === "login" && <LoginLayout />}
      {auth_type === "register" && <RegistrationLayout />}
    </>
  );
}
