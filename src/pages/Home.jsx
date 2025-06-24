import React from "react";
import HeroSection from "../section/HeroSection";
import SplitText from "../components/SplitText";

const Home = () => {
  const handleAnimationComplete = () => {
    console.log("All letters have animated!");
  };

  return (
    <>
      <HeroSection />
    </>
  );
};

export default Home;
