import { Outlet } from "react-router";
import { Toaster } from "sonner@2.0.3";

export default function Root() {
  return (
    <>
      <Outlet />
      <Toaster position="top-right" />
    </>
  );
}
