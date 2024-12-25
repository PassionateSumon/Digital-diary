import { FC } from "react";
import { FaMoon } from "react-icons/fa";
import { IoSunnyOutline } from "react-icons/io5";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { toggleTheme } from "../redux/slices/themeSlice";

const Navigation: FC = () => {
  const theme = useSelector((state: any) => state.theme.mode);
  const dispatch = useDispatch();

  return (
    <nav className="bg-background text-text transition-all duration-200 flex items-center justify-between px-4 py-2">
      <button onClick={() => dispatch(toggleTheme())}>
        {theme === "dark" ? <IoSunnyOutline /> : <FaMoon />}
      </button>
      <Link to="/" className="hover:underline">
        Home
      </Link>
      <Link to="/profile" className="hover:underline">
        Profile
      </Link>
    </nav>
  );
};

export default Navigation;
