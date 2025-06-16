import { getFirstName, getLastName, getName } from "../helper/getNmae";

const Navbar = () => {
  return (
    <div>
      {/* Navbar */}
      <nav className="relative z-50 text-white dark:text-red-200 dark:bg-emerald-700">
        <div className="container mx-auto px-4 py-3 flex justify-center md:justify-between items-center">
          {/* Logo */}
          <div className="text-2xl font-bold font-exo">
            {getFirstName()}
            <span className="text-yellow-300 dark:text-yellow-500">
              {getLastName()}
            </span>
          </div>
        </div>
      </nav>
    </div>
  );
};

export default Navbar;
