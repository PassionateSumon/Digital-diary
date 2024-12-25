import { FC } from "react";
import { Link } from "react-router-dom";

const Navigation: FC = () => {
  return (
    <nav>
      <Link to="/" className="hover:underline">Home</Link>
      <Link to="/profile" className="hover:underline">Profile</Link>
    </nav>
  );
};

export default Navigation;
