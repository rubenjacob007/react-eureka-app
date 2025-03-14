import axios from "axios";

// API URLs
const AUTH_URL = "http://192.168.0.14/WebAPI/connect/token";
const DATA_URL =
  "http://192.168.0.14/WebAPI/api/hub/GetOnlineEvents?filter=%7B%22logic%22:%22and%22,%22filters%22:%5B%7B%22logic%22:%22and%22,%22filters%22:%5B%7B%22field%22:%22eventName%22,%22operator%22:%22neq%22,%22value%22:%22HubErrorCodeUpdated%22%7D%5D%7D%5D%7D&page=1&pageSize=100&skip=0&sort=%7B%22field%22:%22serverTime%22,%22dir%22:%22desc%22%7D&take=100";
const HUB_URL = "http://192.168.0.14/WebAPI/api/hub/GetHubList";
const ACCESS_POINT_URL = "http://192.168.0.14/WebAPI/api/AccessPoint/";
const OnlineMetrics_URL = "http://192.168.0.14/WebAPI/api/hub/getOnlineMetrics";

// User credentials
const authPayload = new URLSearchParams({
  grant_type: "password",
  username: "Admin01",
  password: "Admin@01",
  client_id: "099153c2625149bc8ecb3e85e03f0022",
  scope: "api1 offline_access",
});

// Store token in localStorage
const setToken = (token: string) => {
  localStorage.setItem("access_token", token);
};

// Get stored token
const getToken = () => localStorage.getItem("access_token");

// Authenticate and get token
export const authenticate = async (): Promise<string> => {
  try {
    const response = await axios.post(AUTH_URL, authPayload, {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "X-Time-Zone": "Asia/Kolkata",
      },
    });

    const token = response.data.access_token;
    setToken(token);
    return token;
  } catch (error) {
    console.error("Authentication failed:", error);
    throw error;
  }
};

// Fetch data with authentication
export const fetchData = async (): Promise<any> => {
  let token = getToken();

  if (!token) {
    token = await authenticate(); // Get new token if not available
  }

  try {
    const response = await axios.get(DATA_URL, {
      headers: { Authorization: `Bearer ${token}` },
    });

    return response.data.items;
  } catch (error) {
    console.error("Data fetch failed:", error);
    throw error;
  }
};

// Fetch data with authentication for hub list
export const fetchHubStatus = async (): Promise<any> => {
  let token = getToken();
  if (!token) token = await authenticate();

  try {
    const response = await axios.get(HUB_URL, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data.items;
  } catch (error) {
    console.error("fetchHub Status fetch failed:", error);
    throw error;
  }
};

// Fetch data with authentication for online metrics
export const fetchOnlineMetric = async (): Promise<any> => {
  let token = getToken();
  if (!token) token = await authenticate();

  try {
    const response = await axios.get(OnlineMetrics_URL, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    console.error("fetchHub Status fetch failed:", error);
    throw error;
  }
};

// Fetch data with authentication for online Access Points
export const fetchAccessPoints = async (): Promise<any> => {
  let token = getToken();
  if (!token) token = await authenticate();

  try {
    const response = await axios.get(ACCESS_POINT_URL, {
      headers: {
        Authorization: `Bearer ${token}`,
        "X-Time-Zone": "Asia/Kolkata",
      },
    });
    return response.data.items;
  } catch (error) {
    console.error("fetchAccessPoints fetch failed:", error);
    throw error;
  }
};

// Fetch data with merge API
export const fetchAndMergeData = async (): Promise<{
  hubs: any[];
  accessPoints: any[];
}> => {
  try {
    const [hubs, accessPoints] = await Promise.all([
      fetchHubStatus(),
      fetchAccessPoints(),
    ]);

    return { hubs, accessPoints };
  } catch (error) {
    console.error("Error fetching data:", error);
    return { hubs: [], accessPoints: [] };
  }
};

setInterval(() => {
  authenticate().then((newToken) => console.log("Token refreshed:", newToken));
}, 60000);
