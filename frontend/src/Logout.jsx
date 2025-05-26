import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import axios from "axios";

const Logout = () => {
  const navigate = useNavigate();

  useEffect(() => {
    Cookies.remove("token");
    delete axios.defaults.headers.common["Authorization"];
    navigate("/login", { replace: true });
  }, [navigate]);

  return null;
};

export default Logout;
