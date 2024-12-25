import "./App.css";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Navigation from "./components/Navigation";
import { FC, useEffect } from "react";
import NotFound from "./components/NotFound";
import { useSelector } from "react-redux";
const App: FC = () => {
  const theme = useSelector((state: any) => state.theme.mode);

  useEffect(() => {
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [theme]);

  return (
    <Router>
      <Navigation />
      <Routes>
        <Route path="/" element={<h1>Home</h1>} />
        <Route path="/profile" element={<h1>Profile</h1>} />
        <Route path="/home" element={<Navigate to="/" replace />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
};

export default App;
