import React, { useState, useEffect, useMemo, useRef } from "react";
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
if (!gsap.core.globals()._savedPagePluginsRegistered) {
  gsap.registerPlugin(SplitText);
  gsap.core.globals({ _savedPagePluginsRegistered: true });
}

const Saved = () => {
  const { t } = useTranslation(["saved", "soilInput", "soil-result", "common", "profile", "auth"]);
  
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);
  const [imageOnly, setImageOnly] = useState([]);
  const [soilOnly, setSoilOnly] = useState([]);
  const [soilImage, setSoilImage] = useState([]);
  const [activeTab, setActiveTab] = useState('image');
  const [refreshing, setRefreshing] = useState(false);
  const [imageLoading, setImageLoading] = useState({});
  const [selected, setSelected] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isExplaining, setIsExplaining] = useState(false);
  const [gptText, setGptText] = useState("");
  const [gptErr, setGptErr] = useState("");

  const titleRef = useRef(null);
  const statsRef = useRef(null);
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

  const fetchAll = async (showLoader = true) => {
    try {
      setErr(null);
      if (showLoader) setLoading(true);
      
      console.log('fetchAll called, isLoggedIn:', isLoggedIn);
      
      if (!isLoggedIn) {
        console.log('User not logged in, skipping API calls');
        setLoading(false);
        return;
      }

      console.log('Making API calls...');
      const [imgRes, soilRes, soilImgRes] = await Promise.all([
        api.get('/model/image', { withCredentials: true }),
        api.get('/soil-model/saved', { withCredentials: true }),
        api.get('/soil-and-image-model/saved', { withCredentials: true }),
      ]);
      
      console.log('API responses:', { imgRes, soilRes, soilImgRes });

      const imgList = imgRes?.data?.data || imgRes?.data || [];
      const soilList = soilRes?.data?.data || soilRes?.data || [];
      const soilImgList = soilImgRes?.data?.data || soilImgRes?.data || [];
      
      setImageOnly(imgList);
      setSoilOnly(soilList);
      setSoilImage(soilImgList);
    } catch (e) {
      setErr(e?.response?.data?.message || e?.message || t('saved:error'));
    } finally {
      if (showLoader) setLoading(false);
    }
  };

  useEffect(() => {
    // Check if user is logged in
    const loginStatus = localStorage.getItem('Login');
    const isLoggedInStatus = !!loginStatus;
    console.log('Login status:', loginStatus, 'isLoggedIn:', isLoggedInStatus);
    setIsLoggedIn(isLoggedInStatus);
    
    if (isLoggedInStatus) {
      fetchAll();
    } else {
      setLoading(false);
    }
  }, []);

  // Fetch data when isLoggedIn changes
  useEffect(() => {
    if (isLoggedIn) {
      fetchAll();
    }
  }, [isLoggedIn]);

  const onRefresh = async () => {
    try {
      setRefreshing(true);
      await fetchAll(false);
    } finally {
      setRefreshing(false);
    }
  };

  const openModal = (record) => {
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

  const onDelete = async (type, id) => {
    try {
      const confirm = window.confirm(t('saved:deleteConfirm'));
      if (!confirm) return;

      if (type === 'image') await api.delete(`/model/image/${id}`, { withCredentials: true });
      if (type === 'soil') await api.delete(`/soil-model/saved/${id}`, { withCredentials: true });
      if (type === 'soilImage') await api.delete(`/soil-and-image-model/saved/${id}`, { withCredentials: true });
      
      fetchAll();
    } catch (e) {
      alert(e?.response?.data?.message || e?.message || t('saved:deleteFailed'));
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

    // Stats animation
    if (statsRef.current) {
      gsap.fromTo(
        statsRef.current.children,
        {
          opacity: 0,
          y: 30,
        },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          stagger: 0.1,
          ease: "back.out(1.7)",
          delay: 0.5,
        }
      );
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
          delay: 0.8,
        }
      );
    }

    // Floating leaves animation
    gsap.to(".right-leaf", {
      y: 220,
      scrollTrigger: {
        trigger: "#saved-page",
        start: "top bottom",
        end: "bottom top",
        scrub: true,
      },
    });

    gsap.to(".left-leaf", {
      y: -220,
      scrollTrigger: {
        trigger: "#saved-page",
        start: "top bottom",
        end: "bottom top",
        scrub: true,
      },
    });
  }, []);

  const Stat = ({ label, value }) => (
    <div className="flex-1 p-4 rounded-xl border border-white/10 bg-white/5 dark:bg-black/20">
      <p className="text-white/60 text-xs">{label}</p>
      <p className="text-white text-xl mt-1 font-bold">{value}</p>
    </div>
  );

  const CardRow = ({ label, children }) => (
    <div className="mt-2">
      <p className="text-white/70 text-xs">{label}</p>
      {children}
    </div>
  );


  return (
    <section
      id="saved-page"
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
          {t("saved:title")}
        </h1>
        <p className="mt-3 md:mt-4 text-lg opacity-90 max-w-3xl">
          {t("saved:subtitle")}
        </p>

        {/* Stats */}
        <div ref={statsRef} className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <Stat label={t("saved:stats.imageOnly")} value={imageOnly.length} />
          <Stat label={t("saved:stats.soilOnly")} value={soilOnly.length} />
          <Stat label={t("saved:stats.soilImage")} value={soilImage.length} />
        </div>

        {/* Tabs */}
        <div className="mt-8 flex rounded-xl overflow-hidden border border-white/10 bg-white/5 dark:bg-black/20">
          <button
            onClick={() => setActiveTab('image')}
            className={`flex-1 px-4 py-3 text-center ${
              activeTab === 'image' ? 'bg-white/10' : 'transparent'
            }`}
          >
            <span className="text-white font-semibold">
              {t("saved:tabs.imageOnly")} ({imageOnly.length})
            </span>
          </button>
          <button
            onClick={() => setActiveTab('soil')}
            className={`flex-1 px-4 py-3 text-center ${
              activeTab === 'soil' ? 'bg-white/10' : 'transparent'
            }`}
          >
            <span className="text-white font-semibold">
              {t("saved:tabs.soilOnly")} ({soilOnly.length})
            </span>
          </button>
          <button
            onClick={() => setActiveTab('soilImage')}
            className={`flex-1 px-4 py-3 text-center ${
              activeTab === 'soilImage' ? 'bg-white/10' : 'transparent'
            }`}
          >
            <span className="text-white font-semibold">
              {t("saved:tabs.soilImage")} ({soilImage.length})
            </span>
          </button>
        </div>

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
          ) : loading ? (
            <div className="flex items-center justify-center py-16">
              <LeafSpinner />
              <span className="text-white/80 ml-3">{t("saved:loading")}</span>
            </div>
          ) : err ? (
            <div className="rounded-2xl p-4 border border-red-400/20 bg-red-500/10">
              <p className="text-red-300">{err}</p>
            </div>
          ) : (
            <>
              {/* Image Only */}
              {activeTab === 'image' && (
                <div>
                  <h3 className="text-white text-lg font-semibold mb-4">
                    {t("saved:sections.imageOnly")}
                  </h3>
                  {imageOnly.length === 0 ? (
                    <p className="text-slate-400">{t("saved:empty")}</p>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {imageOnly.map((item) => (
                        <div
                          key={item.id}
                          onClick={() => openModal({ kind: 'image', data: item })}
                          className="rounded-2xl p-4 border border-white/10 bg-white/5 dark:bg-black/20 cursor-pointer hover:bg-white/10 transition-all duration-300 hover:scale-105 hover:shadow-lg"
                        >
                          {item.imageUrl && (
                            <div className="w-full aspect-square rounded-xl overflow-hidden mb-4 relative">
                              <img
                                src={getImageUrl(getFileNameFromPath(item.imageUrl))}
                                alt="Saved image"
                                className="w-full h-full object-cover"
                                onLoad={() => setImageLoading(prev => ({ ...prev, [item.id]: false }))}
                                onError={() => setImageLoading(prev => ({ ...prev, [item.id]: false }))}
                              />
                              {imageLoading[item.id] && (
                                <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                                  <LeafSpinner />
                                </div>
                              )}
                            </div>
                          )}
                          <CardRow label={t("saved:labels.disease")}>
                            <p className="text-white font-semibold">{item.diseaseName}</p>
                          </CardRow>
                          {typeof item.confidence === 'number' && (
                            <CardRow label={t("saved:labels.confidence")}>
                              <p className="text-white/90">{Math.round(item.confidence * 100)}%</p>
                            </CardRow>
                          )}
                          {item.treatment && (
                            <CardRow label={t("saved:labels.treatment")}>
                              <p className="text-white/90">{item.treatment}</p>
                            </CardRow>
                          )}
                          <div className="flex justify-end mt-4">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onDelete('image', item.id);
                              }}
                              className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-sm font-medium transition-colors duration-200 hover:shadow-lg"
                            >
                              {t("saved:delete")}
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Soil Only */}
              {activeTab === 'soil' && (
                <div>
                  <h3 className="text-white text-lg font-semibold mb-4">
                    {t("saved:sections.soilOnly")}
                  </h3>
                  {soilOnly.length === 0 ? (
                    <p className="text-slate-400">{t("saved:empty")}</p>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {soilOnly.map((item) => (
                        <div
                          key={item.id}
                          onClick={() => openModal({ kind: 'soil', data: item })}
                          className="rounded-2xl p-4 border border-white/10 bg-white/5 dark:bg-black/20 cursor-pointer hover:bg-white/10 transition-all duration-300 hover:scale-105 hover:shadow-lg"
                        >
                          <CardRow label={t("saved:labels.crop")}>
                            <p className="text-white font-semibold">
                              {item.cropType ? t(`soilInput:crops.${item.cropType}`) : '-'}
                            </p>
                          </CardRow>
                          {item.predictedFertilizer && (
                            <CardRow label={t("saved:labels.fertilizer")}>
                              <p className="text-white/90">{item.predictedFertilizer}</p>
                            </CardRow>
                          )}
                          {item.predictedTreatment && (
                            <CardRow label={t("saved:labels.treatment")}>
                              <p className="text-white/90">{item.predictedTreatment}</p>
                            </CardRow>
                          )}
                          {typeof item.confidence === 'number' && (
                            <CardRow label={t("saved:labels.confidence")}>
                              <p className="text-white/90">{Math.round(item.confidence * 100)}%</p>
                            </CardRow>
                          )}
                          <div className="flex justify-end mt-4">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onDelete('soil', item.id);
                              }}
                              className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-sm font-medium transition-colors duration-200 hover:shadow-lg"
                            >
                              {t("saved:delete")}
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Soil + Image */}
              {activeTab === 'soilImage' && (
                <div>
                  <h3 className="text-white text-lg font-semibold mb-4">
                    {t("saved:sections.soilImage")}
                  </h3>
                  {soilImage.length === 0 ? (
                    <p className="text-slate-400">{t("saved:empty")}</p>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {soilImage.map((item) => (
                        <div
                          key={item.id}
                          onClick={() => openModal({ kind: 'soilImage', data: item })}
                          className="rounded-2xl p-4 border border-white/10 bg-white/5 dark:bg-black/20 cursor-pointer hover:bg-white/10 transition-all duration-300 hover:scale-105 hover:shadow-lg"
                        >
                          {item.imageUrl && (
                            <div className="w-full aspect-square rounded-xl overflow-hidden mb-4 relative">
                              <img
                                src={getImageUrl(getFileNameFromPath(item.imageUrl))}
                                alt="Saved image"
                                className="w-full h-full object-cover"
                                onLoad={() => setImageLoading(prev => ({ ...prev, [item.id]: false }))}
                                onError={() => setImageLoading(prev => ({ ...prev, [item.id]: false }))}
                              />
                              {imageLoading[item.id] && (
                                <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                                  <LeafSpinner />
                                </div>
                              )}
                            </div>
                          )}
                          <div className="grid grid-cols-2 gap-4">
                            <CardRow label={t("saved:labels.crop")}>
                              <p className="text-white font-semibold">
                                {item.cropType ? t(`soilInput:crops.${item.cropType}`) : '-'}
                              </p>
                            </CardRow>
                            <CardRow label={t("saved:labels.disease")}>
                              <p className="text-white font-semibold">{item.diseaseDetected || '-'}</p>
                            </CardRow>
                          </div>
                          {item.recommendedFertilizer && (
                            <CardRow label={t("saved:labels.fertilizer")}>
                              <p className="text-white/90">{item.recommendedFertilizer}</p>
                            </CardRow>
                          )}
                          {item.treatmentSuggestion && (
                            <CardRow label={t("saved:labels.treatment")}>
                              <p className="text-white/90">{item.treatmentSuggestion}</p>
                            </CardRow>
                          )}
                          {typeof item.confidence === 'number' && (
                            <CardRow label={t("saved:labels.confidence")}>
                              <p className="text-white/90">{Math.round(item.confidence * 100)}%</p>
                            </CardRow>
                          )}
                          <div className="flex justify-end mt-4">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onDelete('soilImage', item.id);
                              }}
                              className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-sm font-medium transition-colors duration-200 hover:shadow-lg"
                            >
                              {t("saved:delete")}
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </>
          )}
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

export default Saved;
