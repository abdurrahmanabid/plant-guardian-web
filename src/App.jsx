import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Outlet,
  useNavigate,
} from "react-router-dom";
import Home from "./pages/Home";
import Navbar from "./components/Navbar";
import AnimatedForm from "./components/AnimatedForm";
import Registration from "./pages/Registration";
import RegistrationForm from "./pages/Registration";
import LoginForm from "./pages/Login";
import Footer from "./components/Footer";
import avatarFarmar from "./assets/img/avatar-farmar.png";
import Avatar from "./components/Avatar";
import Profile from "./components/Profile";
import LeafDiseasePage from "./pages/LeafDiseasePage";
import SoilAnalysisResult from "./pages/SoilAnalysisResult";
const App = () => {
  const AppLayout = () => {
    const navigate = useNavigate();
    return (
      <>
        <Navbar />
        {/* <div className="h-30" /> */}
        <Outlet />
        <Footer />
        {localStorage.getItem("Login") && (
          <Avatar
            src={avatarFarmar}
            variant="glass-card"
            onClick={() => navigate("/profile")}
          />
        )}
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
          <Route path="/profile" element={<Profile />} />
          <Route path="/leaf-disease-predict" element={<LeafDiseasePage />} />
          <Route path="/soil-analysis-result" element={<SoilAnalysisResult />} />
        </Route>
      </Routes>
    </Router>
  );
};

export default App;
