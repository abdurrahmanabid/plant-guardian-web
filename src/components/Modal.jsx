import React, { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { gsap } from "gsap";
import { X } from "lucide-react";

const modalRoot = document.getElementById("modal-root") || document.body;

const Modal = ({ isOpen, onClose, children }) => {
  const modalRef = useRef();
  const backdropRef = useRef();

  useEffect(() => {
    if (isOpen) {
      gsap.fromTo(
        modalRef.current,
        { y: 100, opacity: 0, scale: 0.9 },
        { y: 0, opacity: 1, scale: 1, duration: 0.5, ease: "back.out(1.7)" }
      );
      gsap.fromTo(
        backdropRef.current,
        { opacity: 0 },
        { opacity: 1, duration: 0.3, ease: "power1.out" }
      );
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return createPortal(
    <div
      ref={backdropRef}
      className="fixed inset-0 z-50 backdrop-blur-md bg-black/40 flex items-center justify-center"
    >
      <div
        ref={modalRef}
        className="relative rounded-2xl shadow-xl max-w-md w-full p-6 bg-[#1a1a1a] "
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 hover:text-black transition-colors"
        >
          <X size={24} />
        </button>
        {children}
      </div>
    </div>,
    modalRoot
  );
};

export default Modal;
