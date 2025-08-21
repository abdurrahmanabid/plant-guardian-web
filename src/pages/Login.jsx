import React, { useRef, useState } from "react";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import { useTranslation } from "react-i18next";
import { Link, useNavigate } from "react-router-dom";
import api from "../hooks/api";
import LeafSpinner from "../components/LeafSpinner";
import Modal from "../components/Modal";

const LoginForm = () => {
  const { t } = useTranslation(["login", "common"]);
  const navigate = useNavigate();

  const containerRef = useRef(null);
  const cardRef = useRef(null);
  const itemsRef = useRef([]);
  const submitBtnRef = useRef(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMsg, setModalMsg] = useState("");
  const [errors, setErrors] = useState({});

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    remember: false,
  });

  useGSAP(() => {
    gsap.fromTo(
      containerRef.current,
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.6, ease: "power2.out" }
    );
    gsap.fromTo(
      cardRef.current,
      { opacity: 0, scale: 0.95 },
      { opacity: 1, scale: 1, duration: 0.6, ease: "back.out(1.7)", delay: 0.1 }
    );
    gsap.fromTo(
      itemsRef.current,
      { opacity: 0, y: 16 },
      {
        opacity: 1,
        y: 0,
        duration: 0.5,
        stagger: 0.06,
        ease: "power2.out",
        delay: 0.2,
      }
    );
  }, []);

  const assignItemRef = (el, idx) => (itemsRef.current[idx] = el);

  const onChange = (e) => {
    const { name, type, checked, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const validate = () => {
    const next = {};
    if (!formData.email.trim()) {
      next.email = t("login:errors.email.required");
    } else if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
      next.email = t("login:errors.email.format");
    }
    if (!formData.password) next.password = t("login:errors.password.required");
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const shakeOnError = () => {
    gsap.fromTo(
      cardRef.current,
      { x: -6 },
      { x: 0, duration: 0.3, ease: "elastic.out(1, 0.4)" }
    );
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) {
      shakeOnError();
      return;
    }
    setIsSubmitting(true);
    setErrors({});

    try {
      const res = await api.post("/user/signin", {
        email: formData.email.trim(),
        password: formData.password,
      });

      const message = res?.data?.message || t("login:success.default");
      setModalMsg(message);
      setModalOpen(true);

      localStorage.setItem("Login", true);

      // যদি টোকেন ফেরত আসে, চাইলে সংরক্ষণ করো
      const token = res?.data?.token;
      if (token) {
        if (formData.remember) localStorage.setItem("token", token);
        // api.defaults.headers.common.Authorization = `Bearer ${token}`;
      }

      gsap.fromTo(
        submitBtnRef.current,
        { scale: 1 },
        {
          scale: 1.05,
          duration: 0.15,
          yoyo: true,
          repeat: 1,
          ease: "power1.out",
        }
      );

      // ইচ্ছেমতো রিডাইরেক্ট করো
      navigate("/");
      setFormData({ email: "", password: "", remember: false });
    } catch (err) {
      const status = err?.response?.status;
      const msg =
        err?.response?.data?.message ||
        (status === 401 ? t("login:errors.invalid") : t("login:errors.server"));

      setModalMsg(msg);
      setModalOpen(true);
      shakeOnError();
    } finally {
      setIsSubmitting(false);
    }
  };

  const baseInput =
    "w-full bg-white/10 text-white placeholder-white/60 border border-white/10 rounded-xl px-3 py-2 outline-none focus:outline-none focus:ring-0 focus:ring-offset-0 focus:border-white/30 transition";
  const labelCls = "text-sm text-white/80 mb-1";
  const errorCls = "text-xs text-red-300 mt-1";

  return (
    <div
      ref={containerRef}
      className="h-screen text-white relative overflow-hidden mt-[10vh]"
    >
      {isSubmitting && <LeafSpinner />}
      <div className="max-w-7xl mx-auto h-[90vh] flex items-center justify-center p-3 relative z-10">
        <div
          ref={cardRef}
          className="w-full max-w-lg bg-[#0b061f]/40 backdrop-blur-md shadow-xl border border-white/10 rounded-2xl p-6"
        >
          <h1 className="text-2xl font-bold">{t("login:title")}</h1>
          <p className="text-white/70 mt-1 mb-6">{t("login:subtitle")}</p>

          <form onSubmit={onSubmit} className="grid grid-cols-1 gap-4">
            {/* Email */}
            <div ref={(el) => assignItemRef(el, 0)}>
              <label className={labelCls} htmlFor="email">
                {t("login:fields.email")}
              </label>
              <input
                id="email"
                name="email"
                type="email"
                className={baseInput}
                placeholder={t("login:placeholders.email")}
                value={formData.email}
                onChange={onChange}
                autoComplete="email"
              />
              {errors.email && <div className={errorCls}>{errors.email}</div>}
            </div>

            {/* Password */}
            <div ref={(el) => assignItemRef(el, 1)}>
              <label className={labelCls} htmlFor="password">
                {t("login:fields.password")}
              </label>
              <input
                id="password"
                name="password"
                type="password"
                className={baseInput}
                placeholder={t("login:placeholders.password")}
                value={formData.password}
                onChange={onChange}
                autoComplete="current-password"
              />
              {errors.password && (
                <div className={errorCls}>{errors.password}</div>
              )}
            </div>

            {/* Remember + Links */}
            <div
              ref={(el) => assignItemRef(el, 2)}
              className="flex items-center justify-between"
            >
              <label className="flex items-center gap-2 text-white/80 text-sm select-none">
                <input
                  type="checkbox"
                  name="remember"
                  checked={formData.remember}
                  onChange={onChange}
                  className="appearance-none h-4 w-4 rounded border border-white/30 bg-white/10 checked:bg-white/70 checked:border-white/70 transition cursor-pointer"
                />
                {t("login:fields.remember")}
              </label>
              <div className="text-sm">
                <Link
                  to="/forgot-password"
                  className="text-accent hover:underline"
                >
                  {t("login:links.forgot")}
                </Link>
              </div>
            </div>

            {/* Submit */}
            <div className="mt-2 flex justify-end">
              <button
                ref={submitBtnRef}
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2 rounded-xl border border-white/20 bg-white/10 text-white hover:bg白/15 disabled:opacity-60 disabled:cursor-not-allowed transition outline-none focus:outline-none focus:ring-0 focus:ring-offset-0"
              >
                {isSubmitting
                  ? t("login:buttons.submitting")
                  : t("login:buttons.submit")}
              </button>
            </div>

            {/* Secondary link: register */}
            <div className="text-sm text-white/70 text-center mt-2">
              {t("login:links.noAccount")}{" "}
              <Link to="/registration" className="text-accent hover:underline">
                {t("login:links.register")}
              </Link>
            </div>
          </form>
        </div>
      </div>

      {modalOpen && (
        <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)}>
          <h2 className="text-2xl font-bold mb-2">{t("login:modal.title")}</h2>
          <p className="text-white/80">{modalMsg}</p>
        </Modal>
      )}
    </div>
  );
};

export default LoginForm;
