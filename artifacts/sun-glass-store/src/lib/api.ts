import { setAuthTokenGetter } from "@workspace/api-client-react";

// Read token from localStorage for admin requests
export function setupApiClient() {
  setAuthTokenGetter(() => {
    return localStorage.getItem("admin_token");
  });
}
