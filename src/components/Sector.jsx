import React, { useEffect, useRef } from "react";
import leaf from "../assets/img/image.png";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { SplitText } from "gsap/SplitText";
import i18n from "i18next";

gsap.registerPlugin(ScrollTrigger, SplitText);

const Sector = ({ title }) => {
  const titleRef = useRef();

  useGSAP(() => {
    gsap.fromTo(
      ".section-title",
      {
        // Starting state - choto size
        scale: 0,
        opacity: 0,
      },
      {
        // Ending state - boro size
        scale: 1,
        opacity: 1,
        scrollTrigger: {
          trigger: "#f-leaf",
          start: "top 80%",
          end: "bottom center",
          scrub: true,
        },
      }
    );
  }, [i18n.language, titleRef]);

  useEffect(() => {
    gsap.to("#f-leaf", {
      scrollTrigger: {
        trigger: "#f-leaf",
        start: "top 80%",
        end: "bottom center",
        scrub: true,
      },
      x: -400,
    });

    gsap.to("#s-leaf", {
      scrollTrigger: {
        trigger: "#s-leaf",
        start: "top 80%",
        end: "bottom center",
        scrub: true,
      },
      x: 400,
    });
  }, []);

  return (
    <div className="flex justify-center mt-7 relative">
      <h1 className="text-[90px] section-title" ref={titleRef}>
        {title}
      </h1>

      <div className="absolute top-0 left-0 right-0 flex justify-center items-center">
        <img
          src={leaf}
          id="f-leaf"
          alt="leaf"
          className="object-cover h-[120px] w-[120px]"
        />
        <img
          src={leaf}
          id="s-leaf"
          alt="leaf"
          className="object-cover h-[120px] w-[120px] rotate-90"
        />
      </div>
    </div>
  );
};

export default Sector;
