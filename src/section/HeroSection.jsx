import React from "react";
import Orb from "../components/Orb";
const HeroSection = () => {
  return (
    <>
      <div className="flex justify-center items-center h-screen">
        {/* content div */}
        <div className="emni highlight">Content</div>
        {/* hero  */}
        <div>
          <div style={{ width: "100%", height: "600px", position: "relative" }}>
            <Orb
              hoverIntensity={0.5}
              rotateOnHover={true}
              hue={0}
              forceHoverState={false}
            />
            <div className="text-2xl"></div>
          </div>
        </div>
      </div>
    </>
  );
};

export default HeroSection;
