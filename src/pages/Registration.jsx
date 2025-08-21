import React, { useRef, useState } from "react";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import { useTranslation } from "react-i18next";
import api from "../hooks/api";
import LeafSpinner from "../components/LeafSpinner";
import Modal from "../components/Modal";

const RegistrationForm = () => {
  const { t } = useTranslation(["registration", "common"]);
  const containerRef = useRef(null);
  const cardRef = useRef(null);
  const itemsRef = useRef([]);
  const submitBtnRef = useRef(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMsg, setModalMsg] = useState("");
  const [errors, setErrors] = useState({});

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    address: { street: "", city: "", state: "" },
    role: "Farmer", // default
  });

  // ---------- Animations ----------
  useGSAP(() => {
    // container glass fade-in
    gsap.fromTo(
      containerRef.current,
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.6, ease: "power2.out" }
    );

    // card pop
    gsap.fromTo(
      cardRef.current,
      { opacity: 0, scale: 0.95 },
      { opacity: 1, scale: 1, duration: 0.6, ease: "back.out(1.7)", delay: 0.1 }
    );

    // inputs stagger
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

  // ---------- Helpers ----------
  const assignItemRef = (el, idx) => {
    itemsRef.current[idx] = el;
  };

  const onChange = (e) => {
    const { name, value } = e.target;
    // Nested address.{street|city|state}
    if (name.startsWith("address.")) {
      const key = name.split(".")[1];
      setFormData((prev) => ({
        ...prev,
        address: { ...prev.address, [key]: value },
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const validate = () => {
    const next = {};
    if (!formData.name.trim()) next.name = t("registration:errors.name");
    if (!formData.email.trim()) {
      next.email = t("registration:errors.email.required");
    } else if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
      next.email = t("registration:errors.email.format");
    }
    if (formData.phone && !/^\+?\d{7,15}$/.test(formData.phone)) {
      next.phone = t("registration:errors.phone");
    }
    if (!formData.password || formData.password.length < 6) {
      next.password = t("registration:errors.password");
    }
    if (!formData.role) next.role = t("registration:errors.role");

    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const shakeOnError = () => {
    gsap.fromTo(
      cardRef.current,
      { x: -6 },
      { x: 0, duration: 0.3, ease: "elastic.out(1, 0.4)", clearProps: "x" }
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

    // Build payload (optional: trim empties)
    const payload = {
      name: formData.name.trim(),
      email: formData.email.trim(),
      phone: formData.phone.trim() || null,
      password: formData.password,
      role: formData.role, // "Doctor" | "Farmer"
      address:
        formData.address.street ||
        formData.address.city ||
        formData.address.state
          ? {
              street: formData.address.street.trim(),
              city: formData.address.city.trim(),
              state: formData.address.state.trim(),
            }
          : null,
    };

    try {
      // Your API base likely set in api instance; matches your other code style
      const res = await api.post("/user/signup", payload);

      setModalMsg(
        res?.data?.message ||
          t("registration:success.default", { name: payload.name })
      );
      setModalOpen(true);

      // Subtle success pop
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

      // Optionally reset form
      setFormData({
        name: "",
        email: "",
        phone: "",
        password: "",
        address: { street: "", city: "", state: "" },
        role: "Farmer",
      });
    } catch (err) {
      // Common backend uniqueness errors
      const status = err?.response?.status;
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        t("registration:errors.server");

      if (status === 409) {
        // conflict: unique constraints
        // Try to detect which field
        const conflictField =
          err?.response?.data?.field ||
          (msg.includes("email")
            ? "email"
            : msg.includes("phone")
            ? "phone"
            : null);
        if (conflictField) {
          setErrors((prev) => ({ ...prev, [conflictField]: msg }));
        }
      }

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
          className="w-full max-w-3xl bg-[#0b061f]/40 backdrop-blur-md shadow-xl border border-white/10 rounded-2xl p-6"
        >
          <h1 className="text-2xl font-bold">{t("registration:title")}</h1>
          <p className="text-white/70 mt-1 mb-6">
            {t("registration:subtitle")}
          </p>

          <form
            onSubmit={onSubmit}
            className="grid grid-cols-1 md:grid-cols-2 gap-4"
          >
            {/* Name */}
            <div ref={(el) => assignItemRef(el, 0)}>
              <label className={labelCls} htmlFor="name">
                {t("registration:fields.name")}
              </label>
              <input
                id="name"
                name="name"
                className={baseInput}
                placeholder={t("registration:placeholders.name")}
                value={formData.name}
                onChange={onChange}
                autoComplete="name"
              />
              {errors.name && <div className={errorCls}>{errors.name}</div>}
            </div>

            {/* Email */}
            <div ref={(el) => assignItemRef(el, 1)}>
              <label className={labelCls} htmlFor="email">
                {t("registration:fields.email")}
              </label>
              <input
                id="email"
                name="email"
                type="email"
                className={baseInput}
                placeholder={t("registration:placeholders.email")}
                value={formData.email}
                onChange={onChange}
                autoComplete="email"
              />
              {errors.email && <div className={errorCls}>{errors.email}</div>}
            </div>

            {/* Phone (optional) */}
            <div ref={(el) => assignItemRef(el, 2)}>
              <label className={labelCls} htmlFor="phone">
                {t("registration:fields.phone")}
              </label>
              <input
                id="phone"
                name="phone"
                className={baseInput}
                placeholder={t("registration:placeholders.phone")}
                value={formData.phone}
                onChange={onChange}
                autoComplete="tel"
              />
              {errors.phone && <div className={errorCls}>{errors.phone}</div>}
            </div>

            {/* Password */}
            <div ref={(el) => assignItemRef(el, 3)}>
              <label className={labelCls} htmlFor="password">
                {t("registration:fields.password")}
              </label>
              <input
                id="password"
                name="password"
                type="password"
                className={baseInput}
                placeholder={t("registration:placeholders.password")}
                value={formData.password}
                onChange={onChange}
                autoComplete="new-password"
              />
              {errors.password && (
                <div className={errorCls}>{errors.password}</div>
              )}
            </div>

            {/* Address: street */}
            <div ref={(el) => assignItemRef(el, 4)}>
              <label className={labelCls} htmlFor="address.street">
                {t("registration:fields.address.street")}
              </label>
              <input
                id="address.street"
                name="address.street"
                className={baseInput}
                placeholder={t("registration:placeholders.address.street")}
                value={formData.address.street}
                onChange={onChange}
                autoComplete="address-line1"
              />
            </div>

            {/* Address: city */}
            <div ref={(el) => assignItemRef(el, 5)}>
              <label className={labelCls} htmlFor="address.city">
                {t("registration:fields.address.city")}
              </label>
              <input
                id="address.city"
                name="address.city"
                className={baseInput}
                placeholder={t("registration:placeholders.address.city")}
                value={formData.address.city}
                onChange={onChange}
                autoComplete="address-level2"
              />
            </div>

            {/* Address: state */}
            <div ref={(el) => assignItemRef(el, 6)}>
              <label className={labelCls} htmlFor="address.state">
                {t("registration:fields.address.state")}
              </label>
              <input
                id="address.state"
                name="address.state"
                className={baseInput}
                placeholder={t("registration:placeholders.address.state")}
                value={formData.address.state}
                onChange={onChange}
                autoComplete="address-level1"
              />
            </div>

            {/* Role */}
            <div ref={(el) => assignItemRef(el, 7)}>
              <label className={labelCls} htmlFor="role">
                {t("registration:fields.role")}
              </label>
              <select
                id="role"
                name="role"
                className={`${baseInput} bg-transparent`}
                value={formData.role}
                onChange={onChange}
              >
                <option className="text-black" value="Farmer">
                  {t("registration:roles.Farmer")}
                </option>
                <option className="text-black" value="Doctor">
                  {t("registration:roles.Doctor")}
                </option>
              </select>
              {errors.role && <div className={errorCls}>{errors.role}</div>}
            </div>

            {/* Submit */}
            <div className="md:col-span-2 mt-2 flex justify-end">
              <button
                ref={submitBtnRef}
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2 rounded-xl border border-white/20 bg-white/10 text-white hover:bg-white/15 disabled:opacity-60 disabled:cursor-not-allowed transition outline-none focus:outline-none focus:ring-0 focus:ring-offset-0"
              >
                {isSubmitting
                  ? t("registration:buttons.submitting")
                  : t("registration:buttons.submit")}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Modal */}
      {modalOpen && (
        <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)}>
          <h2 className="text-2xl font-bold mb-2">
            {t("registration:modal.title")}
          </h2>
          <p className="text-white/80">{modalMsg}</p>
        </Modal>
      )}
    </div>
  );
};

export default RegistrationForm;
