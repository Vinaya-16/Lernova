import { jwtDecode } from "jwt-decode";

const getCurrentStudentId = () => {
  const token = localStorage.getItem("token");
  if (!token) return null;

  try {
    const decoded = jwtDecode(token);
    return decoded.id || null;
  } catch (error) {
    console.error("Failed to decode token:", error);
    return null;
  }
};

export default getCurrentStudentId;