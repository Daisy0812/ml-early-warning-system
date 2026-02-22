import { createBrowserRouter } from "react-router";
import Root from "./components/Root";
import Login from "./components/auth/Login";
import Signup from "./components/auth/Signup";
import Dashboard from "./components/dashboard/Dashboard";
import ProjectDetail from "./components/project/ProjectDetail";
import ProjectCreate from "./components/project/ProjectCreate";
import AnalysisResults from "./components/analysis/AnalysisResults";
import NotFound from "./components/NotFound";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Root,
    children: [
      { index: true, Component: Login },
      { path: "login", Component: Login },
      { path: "signup", Component: Signup },
      { path: "dashboard", Component: Dashboard },
      { path: "project/create", Component: ProjectCreate },
      { path: "project/:id", Component: ProjectDetail },
      { path: "analysis/:id", Component: AnalysisResults },
      { path: "*", Component: NotFound },
    ],
  },
]);
