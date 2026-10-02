export async function signOut(): Promise<void> {
  const response = await fetch("/api/auth/logout", { method: "POST" });
  if (!response.ok) {
    throw new Error("Could not log out. Please try again.");
  }

  localStorage.removeItem("token");
  localStorage.removeItem("user");
  window.location.replace("/login");
}
