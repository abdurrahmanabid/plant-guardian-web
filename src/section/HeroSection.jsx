import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { SplitText } from "gsap/all";
import { useMediaQuery } from "react-responsive";
import leftLeaf from "../assets/img/hero-left-leaf.png";
import rightLeaf from "../assets/img/hero-right-leaf.png";
import { useTranslation } from "react-i18next";
import Button from "../components/Button";

const HeroSection = () => {
  const { t } = useTranslation();
  const { t: hero } = useTranslation("home");

  const isMobile = useMediaQuery({ maxWidth: 767 });

  useGSAP(() => {
    const heroSplit = new SplitText(".title", {
      type: "chars, words",
    });

    const paragraphSplit = new SplitText(".subtitle", {
      type: "lines",
    });

    // Apply text-gradient class once before animating
    heroSplit.chars.forEach((char) => char.classList.add("text-gradient"));

    gsap.from(heroSplit.chars, {
      yPercent: 100,
      duration: 1.8,
      ease: "expo.out",
      stagger: 0.06,
    });

    gsap.from(paragraphSplit.lines, {
      opacity: 0,
      yPercent: 100,
      duration: 1.8,
      ease: "expo.out",
      stagger: 0.06,
      delay: 1,
    });

    gsap
      .timeline({
        scrollTrigger: {
          trigger: "#hero",
          start: "top top",
          end: "bottom top",
          scrub: true,
        },
      })
      .to(".right-leaf", { y: 300 }, 0)
      .to(".left-leaf", { y: -300 }, 0)
      .to(".arrow", { y: 100 }, 0);

    const startValue = isMobile ? "top 50%" : "center 60%";
    const endValue = isMobile ? "120% top" : "bottom top";

    // let tl = gsap.timeline({
    //   scrollTrigger: {
    //     trigger: "video",
    //     start: startValue,
    //     end: endValue,
    //     scrub: true,
    //     pin: true,
    //   },
    // });

    //   videoRef.current.onloadedmetadata = () => {
    //     tl.to(videoRef.current, {
    //       currentTime: videoRef.current.duration,
    //     });
    //   };
  }, []);

  return (
    <>
      <section id="hero" className="noisy">
        <h1 className="title text-[50px] md:text-[170px]">{t("siteName")}</h1>

        <img src={leftLeaf} alt="left-leaf" className="left-leaf" />
        <img src={rightLeaf} alt="right-leaf" className="right-leaf" />

        <div className="body">
          {/* <img src="/images/arrow.png" alt="arrow" className="arrow" /> */}

          <div className="content">
            <div className="space-y-5 hidden md:block">
              <p>{hero("left-title")}</p>
              <p className="subtitle">{hero("left-text")}</p>
            </div>

            <div className="view-cocktails">
              <p className="subtitle">{hero("right-text")}</p>
              <Button speed="5s" thickness={3}>
                {hero("right-button")}
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* <div className="video absolute inset-0">
		<video
		 ref={videoRef}
		 muted
		 playsInline
		 preload="auto"
		 src="/videos/output.mp4"
		/>
	 </div> */}
    </>
  );
};

export default HeroSection;
