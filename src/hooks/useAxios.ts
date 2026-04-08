import { useMemo } from "react";
import Axios from "axios";

const REMOTE_URL = "https://api.trackmeio.com/api";
// const LOCAL_URL = "http://localhost:8000/api";

const useAxios = () => {
  const axiosInstance = useMemo(() => {
    return Axios.create({
      baseURL: REMOTE_URL,
      headers: {
        "X-Requested-With": "XMLHttpRequest",
      },
    });
  }, []);

  return axiosInstance;
};

export default useAxios;
