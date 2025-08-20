import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Outlet,
} from "react-router-dom";
import Home from "./pages/Home";
import Navbar from "./components/Navbar";
import AnimatedForm from "./components/AnimatedForm";
import Registration from "./pages/Registration";
import RegistrationForm from "./pages/Registration";
import LoginForm from "./pages/Login";
import Footer from "./components/Footer";

const App = () => {
  const AppLayout = () => {
    return (
      <>
        <Navbar />
        {/* <div className="h-30" /> */}
        <Outlet />
        <Footer />
      </>
    );
  };
  return (
    <Router>
      <Routes>
        <Route path="/" element={<AppLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/soil-analysis" element={<AnimatedForm />} />
          <Route path="/registration" element={<RegistrationForm />} />
          <Route path="/login" element={<LoginForm />} />
        </Route>
      </Routes>
    </Router>
  );
};

export default App;
