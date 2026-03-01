import { useMemo } from "react";
import Axios from "axios";

// https://api.taskmastersystem.ph/api/v1/

const useAxios = () => {
  const axiosInstance = useMemo(() => {
    return Axios.create({
      baseURL: "http://127.0.0.1:8000/api/v1",
      headers: {
        "X-Requested-With": "XMLHttpRequest",
      },
    });
  }, []);

  return axiosInstance;
};

export default useAxios;
