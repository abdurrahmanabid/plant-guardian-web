import React, { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { SplitText } from "gsap/all";
import leftLeaf from "../assets/img/hero-left-leaf.png";
import rightLeaf from "../assets/img/hero-right-leaf.png";
import Button from "../components/Button";
import api from "../hooks/api";
import Modal from "../components/Modal";
import LeafSpinner from "../components/LeafSpinner";
import { getImageUrl, getFileNameFromPath } from "../utils/getImagePath";

// ---------- One-time GSAP plugin registration ----------
if (!gsap.core.globals()._searchPagePluginsRegistered) {
  gsap.registerPlugin(SplitText);
  gsap.core.globals({ _searchPagePluginsRegistered: true });
}

const Search = () => {
  const { t } = useTranslation(["search", "saved", "profile", "auth", "common"]);
  
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [results, setResults] = useState([]);
  const [selected, setSelected] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isExplaining, setIsExplaining] = useState(false);
  const [gptText, setGptText] = useState("");
  const [gptErr, setGptErr] = useState("");

  const titleRef = useRef(null);
  const contentRef = useRef(null);

  const formatDate = (iso) => {
    try {
      if (!iso) return '-';
      const d = new Date(iso);
      if (isNaN(d.getTime())) return '-';
      return d.toLocaleString();
    } catch { 
      return '-';
    }
  };

  const fetchByDisease = async (name) => {
    if (!name.trim()) return;
    const q = name.trim().toLowerCase();
    try {
      setError(null);
      setLoading(true);
      if (!isLoggedIn) { 
        setLoading(false); 
        return; 
      }
      
      const [imgRes, soilRes, soilImgRes] = await Promise.all([
        api.get('/model/image/recent', { withCredentials: true }),
        api.get('/soil-model/saved', { withCredentials: true }),
        api.get('/soil-and-image-model/saved', { withCredentials: true }),
      ]);
      
      const images = (imgRes?.data?.data || imgRes?.data || []).map((x) => ({ ...x, kind: 'image' }));
      const soils = (soilRes?.data?.data || soilRes?.data || []).map((x) => ({ ...x, kind: 'soil' }));
      const soilImages = (soilImgRes?.data?.data || soilImgRes?.data || []).map((x) => ({ ...x, kind: 'soilImage' }));
      const combined = [...images, ...soils, ...soilImages];
      
      const filtered = combined.filter((item) => {
        if (item.kind === 'image') {
          return (item.diseaseName || '').toLowerCase().includes(q) || (item.treatment || '').toLowerCase().includes(q);
        }
        if (item.kind === 'soil') {
          return (item.cropType || '').toLowerCase().includes(q) || (item.predictedFertilizer || '').toLowerCase().includes(q) || (item.predictedTreatment || '').toLowerCase().includes(q);
        }
        return (
          (item.cropType || '').toLowerCase().includes(q) ||
          (item.diseaseDetected || '').toLowerCase().includes(q) ||
          (item.recommendedFertilizer || '').toLowerCase().includes(q) ||
          (item.treatmentSuggestion || '').toLowerCase().includes(q)
        );
      });
      
      setResults(filtered.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()));
    } catch (e) {
      setError(e?.response?.data?.message || e?.message || t('search:error'));
    } finally {
      setLoading(false);
    }
  };

  const fetchRecent = async () => {
    try {
      setError(null);
      setLoading(true);
      if (!isLoggedIn) { 
        setLoading(false); 
        return; 
      }
      
      const [imgRes, soilRes, soilImgRes] = await Promise.all([
        api.get('/model/image/recent', { withCredentials: true }),
        api.get('/soil-model/saved', { withCredentials: true }),
        api.get('/soil-and-image-model/saved', { withCredentials: true }),
      ]);
      
      const images = (imgRes?.data?.data || imgRes?.data || []).map((x) => ({ ...x, kind: 'image' }));
      const soils = (soilRes?.data?.data || soilRes?.data || []).map((x) => ({ ...x, kind: 'soil' }));
      const soilImages = (soilImgRes?.data?.data || soilImgRes?.data || []).map((x) => ({ ...x, kind: 'soilImage' }));
      const combined = [...images, ...soils, ...soilImages];
      
      setResults(combined.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()));
    } catch (e) {
      setError(e?.response?.data?.message || e?.message || t('search:error'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Check if user is logged in
    const loginStatus = localStorage.getItem('Login');
    const isLoggedInStatus = !!loginStatus;
    setIsLoggedIn(isLoggedInStatus);
    
    if (isLoggedInStatus) {
      fetchRecent();
    }
  }, []);

  const onRefresh = async () => {
    try {
      setRefreshing(true);
      if (query.trim()) await fetchByDisease(query);
      else await fetchRecent();
    } finally {
      setRefreshing(false);
    }
  };

  const openModal = (item) => {
    const record = item.kind === 'image'
      ? { kind: 'image', data: item }
      : item.kind === 'soil'
        ? { kind: 'soil', data: item }
        : { kind: 'soilImage', data: item };
    setSelected(record);
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setSelected(null);
    setGptText("");
    setGptErr("");
  };

  const onExplain = async () => {
    if (!selected) return;
    setIsExplaining(true);
    setGptErr("");
    try {
      const isBengali = localStorage.getItem('lang') === 'bn';
      let content = '';
      
      if (selected.kind === 'image') {
        content = `Analyze leaf disease prediction result. Disease: ${selected.data.diseaseName}. Confidence: ${selected.data.confidence || 'N/A'}. Treatment: ${selected.data.treatment || 'N/A'}.`;
      } else if (selected.kind === 'soil') {
        content = `Analyze soil analysis result. Crop: ${selected.data.cropType || 'N/A'}. Fertilizer: ${selected.data.predictedFertilizer || 'N/A'}. Treatment: ${selected.data.predictedTreatment || 'N/A'}. Confidence: ${selected.data.confidence || 'N/A'}.`;
      } else if (selected.kind === 'soilImage') {
        content = `Analyze combined soil and image analysis result. Crop: ${selected.data.cropType || 'N/A'}. Disease: ${selected.data.diseaseDetected || 'N/A'}. Fertilizer: ${selected.data.recommendedFertilizer || 'N/A'}. Treatment: ${selected.data.treatmentSuggestion || 'N/A'}. Confidence: ${selected.data.confidence || 'N/A'}.`;
      }

      const req = {
        content: content,
        systemMessage: `You're an agriculture expert. Explain simply for farmers. in json {benefit, tips, ${selected.data.treatment || selected.data.predictedTreatment || selected.data.treatmentSuggestion ? 'whyTreatment' : ''}} provide in ${isBengali ? 'bangla' : 'english'}`,
      };
      
      const res = await api.post('/gpt/gpt-explain', req, { timeout: 30000 });
      const raw = res?.data?.response;
      let parsed = {};
      if (typeof raw === 'string') {
        try {
          parsed = JSON.parse(raw);
        } catch {
          parsed = {};
        }
      } else if (raw && typeof raw === 'object') {
        parsed = raw;
      }
      const { benefit, tips, whyTreatment } = parsed || {};
      const out = `${whyTreatment ? `${t('soil-result:results.explainedFields.whyTreatment')}:\n${whyTreatment}\n\n` : ''}${benefit ? `${t('soil-result:results.explainedFields.benefit')}:\n${benefit}\n\n` : ''}${tips ? `${t('soil-result:results.explainedFields.tips')}:\n${tips}` : ''}`.trim();
      setGptText(out || '');
    } catch (e) {
      console.error(e);
      setGptErr(t('saved:explanation.error'));
    } finally {
      setIsExplaining(false);
    }
  };

  // ---------- Animations ----------
  useGSAP(() => {
    // Title animation
    if (titleRef.current) {
      const split = new SplitText(titleRef.current, { type: "chars, words" });
      split.chars.forEach((c) => c.classList.add("text-gradient"));
      gsap.from(split.chars, {
        yPercent: 100,
        duration: 1.1,
        ease: "expo.out",
        stagger: 0.04,
      });
    }

    // Content animation
    if (contentRef.current) {
      gsap.fromTo(
        contentRef.current.children,
        {
          opacity: 0,
          scale: 0.9,
        },
        {
          opacity: 1,
          scale: 1,
          duration: 0.6,
          stagger: 0.05,
          ease: "back.out(1.7)",
          delay: 0.5,
        }
      );
    }

    // Floating leaves animation
    gsap.to(".right-leaf", {
      y: 220,
      scrollTrigger: {
        trigger: "#search-page",
        start: "top bottom",
        end: "bottom top",
        scrub: true,
      },
    });

    gsap.to(".left-leaf", {
      y: -220,
      scrollTrigger: {
        trigger: "#search-page",
        start: "top bottom",
        end: "bottom top",
        scrub: true,
      },
    });
  }, []);

  const CardRow = ({ label, children }) => (
    <div className="mt-2">
      <p className="text-white/70 text-xs">{label}</p>
      {children}
    </div>
  );

  return (
    <section
      id="search-page"
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
        <h1
          ref={titleRef}
          className="title text-[40px] md:text-[72px] leading-[0.9]"
        >
          {t("search:title")}
        </h1>
        <p className="mt-3 md:mt-4 text-lg opacity-90 max-w-3xl">
          {t("search:subtitle")}
        </p>

        <div ref={contentRef} className="mt-8">
          {!isLoggedIn ? (
            <div className="rounded-2xl p-6 border border-white/10 bg-white/5 dark:bg-black/20">
              <h3 className="text-white text-2xl font-semibold text-center">
                {t("profile:noProfile.title")}
              </h3>
              <p className="text-white/80 text-center mt-2">
                {t("profile:noProfile.message")}
              </p>
              <div className="flex gap-3 mt-5">
                <Button
                  thickness={3}
                  speed="5s"
                  onClick={() => window.location.href = '/login'}
                  className="flex-1"
                >
                  {t("auth:signin.button")}
                </Button>
                <Button
                  thickness={3}
                  speed="5s"
                  onClick={() => window.location.href = '/registration'}
                  variant="outline"
                  className="flex-1"
                >
                  {t("auth:signup.button")}
                </Button>
              </div>
            </div>
          ) : (
            <div className="rounded-2xl p-4 border border-white/10 bg-white/5 dark:bg-black/20">
              <p className="text-white/70 text-xs">{t("search:byDisease")}</p>
              <div className="flex items-center gap-2 mt-2">
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={t("search:diseasePlaceholder")}
                  className="flex-1 px-4 py-3 rounded-xl text-white bg-white/10 border border-white/20 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  onKeyPress={(e) => e.key === 'Enter' && fetchByDisease(query)}
                />
                <Button
                  thickness={2}
                  speed="5s"
                  onClick={() => fetchByDisease(query)}
                  disabled={loading || !query.trim()}
                  className="px-4 py-3"
                >
                  {loading ? (
                    <span className="flex items-center">
                      <LeafSpinner />
                      <span className="ml-2">{t("search:searchBtn")}</span>
                    </span>
                  ) : (
                    t("search:searchBtn")
                  )}
                </Button>
              </div>

              <Button
                thickness={2}
                speed="5s"
                onClick={fetchRecent}
                disabled={loading}
                variant="outline"
                className="mt-3 w-full"
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <LeafSpinner />
                    <span className="ml-2">{t("search:recentBtn")}</span>
                  </span>
                ) : (
                  t("search:recentBtn")
                )}
              </Button>
            </div>
          )}

          {error && (
            <div className="rounded-2xl p-4 mt-4 border border-red-400/20 bg-red-500/10">
              <p className="text-red-300">{error}</p>
            </div>
          )}

          {/* Results */}
          <div className="mt-6">
            <h3 className="text-white text-lg font-semibold mb-4">{t("search:resultsTitle")}</h3>
            {results.length === 0 ? (
              <p className="text-slate-400">{t("search:empty")}</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {results.map((item) => (
                  <div
                    key={`${item.kind}-${item.id}`}
                    onClick={() => openModal(item)}
                    className="rounded-2xl p-4 border border-white/10 bg-white/5 dark:bg-black/20 cursor-pointer hover:bg-white/10 transition-all duration-300 hover:scale-105 hover:shadow-lg"
                  >
                    {item.kind !== 'soil' && item.imageUrl && (
                      <div className="w-full aspect-square rounded-xl overflow-hidden mb-4 relative">
                        <img
                          src={getImageUrl(getFileNameFromPath(item.imageUrl))}
                          alt="Search result"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    
                    {/* Header row showing type */}
                    <div className="mb-2">
                      <p className="text-white/60 text-xs">
                        {item.kind === 'image' ? 'Image Analysis' : item.kind === 'soil' ? 'Soil Analysis' : 'Combined Analysis'}
                      </p>
                    </div>

                    {item.kind === 'image' && (
                      <div className="grid grid-cols-2 gap-3">
                        <CardRow label={t("saved:labels.disease")}>
                          <p className="text-white font-semibold">{item.diseaseName || '-'}</p>
                        </CardRow>
                        <CardRow label={t("saved:labels.confidence")}>
                          <p className="text-white font-semibold">
                            {typeof item.confidence === 'number' ? `${Math.round(item.confidence * 100)}%` : '-'}
                          </p>
                        </CardRow>
                      </div>
                    )}

                    {item.kind === 'soil' && (
                      <div>
                        <CardRow label={t("saved:labels.crop")}>
                          <p className="text-white font-semibold">{item.cropType || '-'}</p>
                        </CardRow>
                        {item.predictedFertilizer && (
                          <CardRow label={t("saved:labels.fertilizer")}>
                            <p className="text-white/90">{item.predictedFertilizer}</p>
                          </CardRow>
                        )}
                      </div>
                    )}

                    {item.kind === 'soilImage' && (
                      <div className="grid grid-cols-2 gap-3">
                        <CardRow label={t("saved:labels.crop")}>
                          <p className="text-white font-semibold">{item.cropType || '-'}</p>
                        </CardRow>
                        <CardRow label={t("saved:labels.disease")}>
                          <p className="text-white font-semibold">{item.diseaseDetected || '-'}</p>
                        </CardRow>
                      </div>
                    )}

                    {item.kind === 'image' && item.treatment && (
                      <CardRow label={t("saved:labels.treatment")}>
                        <p className="text-white/90">{item.treatment}</p>
                      </CardRow>
                    )}

                    <CardRow label={t("search:labels.savedAt")}>
                      <p className="text-white/90">{formatDate(item.createdAt)}</p>
                    </CardRow>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Details Modal */}
      {modalVisible && selected && (
        <Modal isOpen={modalVisible} onClose={closeModal}>
          <h2 className="text-2xl font-bold mb-4">{t("saved:details.title")}</h2>
          <div className="space-y-4">
            {selected.kind === 'image' && (
              <>
                <div>
                  <p className="text-sm text-gray-600">{t("saved:labels.disease")}</p>
                  <p className="text-lg font-semibold">{selected.data.diseaseName}</p>
                </div>
                {selected.data.confidence && (
                  <div>
                    <p className="text-sm text-gray-600">{t("saved:labels.confidence")}</p>
                    <p className="text-lg">{Math.round(selected.data.confidence * 100)}%</p>
                  </div>
                )}
                {selected.data.treatment && (
                  <div>
                    <p className="text-sm text-gray-600">{t("saved:labels.treatment")}</p>
                    <p className="text-lg">{selected.data.treatment}</p>
                  </div>
                )}
              </>
            )}
            {selected.kind === 'soil' && (
              <>
                <div>
                  <p className="text-sm text-gray-600">{t("saved:labels.crop")}</p>
                  <p className="text-lg font-semibold">
                    {selected.data.cropType ? t(`soilInput:crops.${selected.data.cropType}`) : '-'}
                  </p>
                </div>
                {selected.data.predictedFertilizer && (
                  <div>
                    <p className="text-sm text-gray-600">{t("saved:labels.fertilizer")}</p>
                    <p className="text-lg">{selected.data.predictedFertilizer}</p>
                  </div>
                )}
                {selected.data.predictedTreatment && (
                  <div>
                    <p className="text-sm text-gray-600">{t("saved:labels.treatment")}</p>
                    <p className="text-lg">{selected.data.predictedTreatment}</p>
                  </div>
                )}
              </>
            )}
            {selected.kind === 'soilImage' && (
              <>
                <div>
                  <p className="text-sm text-gray-600">{t("saved:labels.crop")}</p>
                  <p className="text-lg font-semibold">
                    {selected.data.cropType ? t(`soilInput:crops.${selected.data.cropType}`) : '-'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">{t("saved:labels.disease")}</p>
                  <p className="text-lg font-semibold">{selected.data.diseaseDetected || '-'}</p>
                </div>
                {selected.data.recommendedFertilizer && (
                  <div>
                    <p className="text-sm text-gray-600">{t("saved:labels.fertilizer")}</p>
                    <p className="text-lg">{selected.data.recommendedFertilizer}</p>
                  </div>
                )}
                {selected.data.treatmentSuggestion && (
                  <div>
                    <p className="text-sm text-gray-600">{t("saved:labels.treatment")}</p>
                    <p className="text-lg">{selected.data.treatmentSuggestion}</p>
                  </div>
                )}
              </>
            )}

            {/* AI Explanation Section */}
            <div className="mt-6 pt-4 border-t border-gray-200">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">{t("saved:explanation.title")}</h3>
                <Button
                  thickness={2}
                  speed="5s"
                  onClick={onExplain}
                  disabled={isExplaining}
                  className="px-4 py-2"
                >
                  {isExplaining ? (
                    <span className="flex items-center">
                      <LeafSpinner />
                      <span className="ml-2">{t("saved:buttons.generating")}</span>
                    </span>
                  ) : (
                    t("saved:buttons.explain")
                  )}
                </Button>
              </div>
              
              {gptErr && (
                <div className="p-3 bg-red-100 border border-red-300 rounded-lg">
                  <p className="text-red-600 text-sm">{gptErr}</p>
                </div>
              )}
              
              {gptText && (
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-gray-700 whitespace-pre-wrap text-sm leading-relaxed">
                    {gptText}
                  </p>
                </div>
              )}
            </div>
          </div>
          
          <div className="flex justify-end mt-6">
            <Button thickness={3} speed="5s" onClick={closeModal}>
              {t("saved:buttons.close")}
            </Button>
          </div>
        </Modal>
      )}
    </section>
  );
};

export default Search;
