import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { SplitText, ScrollTrigger } from "gsap/all";
import leftLeaf from "../assets/img/hero-left-leaf.png";
import rightLeaf from "../assets/img/hero-right-leaf.png";
import Button from "../components/Button";
import { useTranslation } from "react-i18next";
import LeafSpinner from "../components/LeafSpinner";
import api from "../hooks/api";
import { useNavigate, useParams } from "react-router-dom";

// ---------- One-time GSAP plugin registration ----------
if (!gsap.core.globals()._leafPagePluginsRegistered) {
  gsap.registerPlugin(SplitText, ScrollTrigger);
  gsap.core.globals({ _leafPagePluginsRegistered: true });
}

// ---------- Config ----------
const API_ENDPOINT = "/predict/leaf-upload"; // your backend upload route
const FIELD_NAME = "file"; // change if server expects 'image' or another key
const MAX_MB = 8;
const ACCEPTED = ["image/jpeg", "image/png", "image/webp"];
const USE_MOCK = false; // toggle for local testing without backend

// ---------- Mock (optional) ----------
async function mockPredict(file) {
  await new Promise((r) => setTimeout(r, 900));
  return {
    top: { label: "Potato___late_blight", confidence: 0.92 },
    treatment: {
      care: "Remove heavily infected leaves. Improve airflow and avoid overhead irrigation.",
      medicine: "Apply recommended fungicide (mancozeb/chlorothalonil).",
      raw: "Care: Remove heavily infected leaves. Improve airflow and avoid overhead irrigation. | Medicine: Apply recommended fungicide (mancozeb/chlorothalonil).",
    },
  };
}

// ---------- Map backend → UI shape ----------
// Accepts either {data:{...}} or flat {...}.
// Parses treatment string like: "Care: ... | Medicine: ..."
function mapApiToUI(apiPayload) {
  const d = apiPayload?.data ?? apiPayload ?? {};

  const prediction = d.prediction ?? d.label ?? d.top?.label ?? "-";
  const confidence =
    typeof d.confidence === "number"
      ? d.confidence
      : typeof d.top?.confidence === "number"
      ? d.top.confidence
      : undefined;

  const treatmentRaw = d.treatment ?? null;
  let care = null;
  let medicine = null;

  if (typeof treatmentRaw === "string") {
    treatmentRaw
      .split("|")
      .map((s) => s.trim())
      .forEach((part) => {
        if (/^care\s*:/i.test(part)) {
          care = part.replace(/^care\s*:/i, "").trim();
        } else if (/^medicine\s*:/i.test(part)) {
          medicine = part.replace(/^medicine\s*:/i, "").trim();
        }
      });
  }

  return {
    top: { label: prediction, confidence },
    treatment: { care, medicine, raw: treatmentRaw },
  };
}

export default function LeafDiseasePage() {
  const { t } = useTranslation("leafPredict");
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [uploadPct, setUploadPct] = useState(0);
  const [result, setResult] = useState(null);
  const inputRef = useRef(null);
  const { type } = useParams();
  const [image, setImage] = useState();
  const navigate = useNavigate();

  const classOfDiv =
    type !== "all"
      ? "mt-10 grid lg:grid-cols-[1.1fr_0.9fr] gap-8"
      : "mt-10 grid gap-8";
  // ---------- Animations ----------
  useGSAP(() => {
    const titleEl = document.querySelector(".leaf-title");
    if (!titleEl) return;
    const split = new SplitText(titleEl, { type: "chars, words" });
    split.chars.forEach((c) => c.classList.add("text-gradient"));
    gsap.from(split.chars, {
      yPercent: 100,
      duration: 1.1,
      ease: "expo.out",
      stagger: 0.04,
    });

    gsap
      .timeline({
        scrollTrigger: {
          trigger: "#leaf-page",
          start: "top bottom",
          end: "bottom top",
          scrub: true,
        },
      })
      .to(".right-leaf", { y: 220 }, 0)
      .to(".left-leaf", { y: -220 }, 0);
  }, []);

  // ---------- File select / drop ----------
  const onSelect = useCallback(
    (f) => {
      setError("");
      setResult(null);
      setUploadPct(0);

      const picked = f?.[0];
      if (!picked) return;

      if (!ACCEPTED.includes(picked.type)) {
        setError(t("errType") || "Unsupported file type.");
        return;
      }
      if (picked.size > MAX_MB * 1024 * 1024) {
        setError(t("errSize", { mb: MAX_MB }) || `Max ${MAX_MB}MB allowed.`);
        return;
      }

      if (preview) URL.revokeObjectURL(preview); // avoid memory leak
      setFile(picked);
      const url = URL.createObjectURL(picked);
      setPreview(url);
    },
    [t, preview]
  );

  const onDrop = useCallback(
    (e) => {
      e.preventDefault();
      onSelect(e.dataTransfer?.files || null);
    },
    [onSelect]
  );

  const onBrowse = () => inputRef.current?.click();

  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  const reset = () => {
    if (preview) URL.revokeObjectURL(preview);
    setFile(null);
    setPreview("");
    setResult(null);
    setError("");
    setUploadPct(0);
    if (inputRef.current) inputRef.current.value = "";
  };

  // ---------- Predict (upload → predict) ----------
  const predict = async () => {
    if (!file) return;

    try {
      setLoading(true);
      setError("");
      setUploadPct(0);

      let uiResult;

      if (USE_MOCK) {
        uiResult = await mockPredict(file);
      } else {
        // 1) Upload image
        const form = new FormData();
        form.append(FIELD_NAME, file, file.name);

        const uploadRes = await api.post(API_ENDPOINT, form, {
          headers: { "Content-Type": "multipart/form-data" },
          transformRequest: (d) => d, // keep FormData intact
          onUploadProgress: (evt) => {
            const total = (evt.total ?? 0) || 1;
            const pct = Math.round((evt.loaded / total) * 100);
            setUploadPct(pct);
          },
        });

        // Adjust this path extraction to match your server's upload response
        const imagePath =
          uploadRes?.data?.files?.path ||
          uploadRes?.data?.data?.path ||
          uploadRes?.data?.path;

        if (!imagePath) {
          throw new Error(
            "Upload succeeded but image path is missing in response."
          );
        }
        setImage(imagePath);
        console.log("image=>", imagePath);
        // 2) Predict using uploaded path
        const predictRes = await api.post("/predict/image-predict", {
          imagePath,
        });

        // 3) Map to UI shape
        uiResult = mapApiToUI(predictRes?.data);
        if (!uiResult) {
          throw new Error("Prediction response was empty or malformed.");
        }
      }

      setResult(uiResult);
      {
        type === "all" &&
          navigate("/soil-analysis", {
            state: {
              disease: uiResult.top.label,
              confidence: uiResult.top.confidence,
              image: image,
              treatment_suggestion: uiResult.treatment,
            },
          });
      }
    } catch (e) {
      setError(
        e?.response?.data?.message ||
          e?.response?.data?.error ||
          e?.message ||
          t("errUnknown") ||
          "Something went wrong."
      );
    } finally {
      setLoading(false);
    }
  };

  // Keep memo if you need derived values later
  const predicted = useMemo(() => result?.top || null, [result]);

  return (
    <section
      id="leaf-page"
      className="relative overflow-hidden noisy min-h-screen mt-36"
    >
      {/* floating leaves */}
      <img
        src={leftLeaf}
        alt="left-leaf"
        className="left-leaf pointer-events-none select-none absolute -left-10 top-20 opacity-60"
      />
      <img
        src={rightLeaf}
        alt="right-leaf"
        className="right-leaf pointer-events-none select-none absolute right-0 -top-6 opacity-60 mt-64"
      />

      <div className="container mx-auto px-4 md:px-8 py-16 md:py-24">
        <h1 className="leaf-title title text-[40px] md:text-[72px] leading-[0.9]">
          {t("title") || "Leaf Disease Prediction"}
        </h1>
        <p className="mt-3 md:mt-4 text-lg opacity-90 max-w-3xl">
          {t("subtitle") ||
            "Upload a leaf photo to detect disease and get care suggestions."}
        </p>

        <div className={classOfDiv}>
          {/* Uploader */}
          <div
            onDrop={onDrop}
            onDragOver={(e) => e.preventDefault()}
            className="rounded-2xl md:rounded-3xl p-6 md:p-8 border border-white/10 bg-white/5 dark:bg-black/20 backdrop-blur-sm"
          >
            {!preview ? (
              <div className="flex flex-col items-center justify-center text-center py-16">
                <div className="h-16 w-16 rounded-2xl bg-white/10 border border-white/15 flex items-center justify-center text-2xl font-semibold mb-4 select-none">
                  🌿
                </div>
                <p className="text-xl font-semibold">
                  {t("dropTitle") || "Drag & drop leaf image"}
                </p>
                <p className="opacity-80 mt-1">
                  {t("dropHelp") || "Or browse to select a file"}
                </p>
                <div className="mt-6 flex gap-3">
                  <input
                    ref={inputRef}
                    type="file"
                    accept={ACCEPTED.join(",")}
                    className="hidden"
                    onChange={(e) => onSelect(e.target.files)}
                  />
                  <Button thickness={3} speed="5s" onClick={onBrowse}>
                    {t("browseBtn") || "Browse image"}
                  </Button>
                </div>
                <p className="opacity-60 text-sm mt-3">
                  {t("hint", { mb: MAX_MB }) ||
                    `Accepted: JPG/PNG/WebP · Max ${MAX_MB}MB`}
                </p>
              </div>
            ) : (
              <div className="grid md:grid-cols-[1fr_auto] gap-6 items-start">
                <div className="relative">
                  <img
                    src={preview}
                    alt="preview"
                    className="rounded-xl border border-white/10 max-h-[480px] object-contain w-full"
                  />
                  <button
                    onClick={reset}
                    className="absolute top-2 right-2 px-3 py-1.5 rounded-lg text-sm bg-black/50 hover:bg-black/60 border border-white/10"
                  >
                    {t("replace") || "Replace image"}
                  </button>
                </div>
                <div className="flex flex-col gap-3">
                  <Button
                    thickness={3}
                    speed="5s"
                    onClick={predict}
                    disabled={loading || !file}
                  >
                    {t("predictBtn") || "Predict"}
                  </Button>

                  {loading && (
                    <div className="space-y-2">
                      <LeafSpinner />
                      {uploadPct > 0 && uploadPct < 100 && (
                        <div className="w-full">
                          <div className="flex justify-between text-xs mb-1 opacity-80">
                            <span>{t("uploading") || "Uploading"}</span>
                            <span>{uploadPct}%</span>
                          </div>
                          <div className="h-2 bg-white/10 rounded">
                            <div
                              className="h-full bg-white/70 dark:bg-white/80 rounded"
                              style={{ width: `${uploadPct}%` }}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {error && (
                    <div className="text-red-300 text-sm bg-red-500/10 border border-red-400/20 rounded-lg p-3">
                      {error}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Results */}
          {type !== "all" && (
            <aside className="rounded-2xl md:rounded-3xl p-6 md:p-8 border border-white/10 bg-white/5 dark:bg-black/20">
              <h3 className="text-base md:text-lg font-semibold mb-4">
                {t("results") || "Results"}
              </h3>

              {!result ? (
                <p className="opacity-70">
                  {t("noResult") || "No prediction yet."}
                </p>
              ) : (
                <div className="space-y-6">
                  {/* Predicted label */}
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] opacity-70">
                      {t("predicted") || "Predicted label"}
                    </p>
                    <p className="text-xl font-semibold mt-1">
                      {predicted?.label || "-"}
                    </p>
                    {typeof predicted?.confidence === "number" && (
                      <p className="opacity-80 text-sm">
                        {t("confidence", {
                          pct: Math.round(predicted.confidence * 100),
                        }) ||
                          `Confidence: ${Math.round(
                            predicted.confidence * 100
                          )}%`}
                      </p>
                    )}
                  </div>

                  {/* Treatment (Care + Medicine) */}
                  {((result.treatment?.care ?? null) !== null ||
                    (result.treatment?.medicine ?? null) !== null) && (
                    <div className="space-y-3">
                      <p className="text-xs uppercase tracking-[0.2em] opacity-70">
                        {t("treatment") || "Treatment"}
                      </p>

                      {result.treatment.care && (
                        <div className="rounded-lg border border-white/10 bg-white/5 dark:bg-black/30 p-3">
                          <p className="text-sm font-semibold mb-1">
                            {t("care") || "Care"}
                          </p>
                          <p className="opacity-90 text-sm leading-relaxed">
                            {result.treatment.care}
                          </p>
                        </div>
                      )}

                      {result.treatment.medicine && (
                        <div className="rounded-lg border border-white/10 bg-white/5 dark:bg-black/30 p-3">
                          <p className="text-sm font-semibold mb-1">
                            {t("medicine") || "Medicine"}
                          </p>
                          <p className="opacity-90 text-sm leading-relaxed">
                            {result.treatment.medicine}
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </aside>
          )}
        </div>
      </div>
    </section>
  );
}
