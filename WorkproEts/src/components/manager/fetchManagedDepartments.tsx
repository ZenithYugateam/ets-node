import axios from "axios";

// Fetch managed departments by user ID
export const fetchManagedDepartments = async (userId: string): Promise<string[]> => {
  const response = await axios.get(`http://localhost:5001/api/user/${userId}`);
  if (response.status === 200) {
    return response.data.departments || []; // Return departments or an empty array
  }
  throw new Error(response.data.message || "Failed to fetch departments");
};
