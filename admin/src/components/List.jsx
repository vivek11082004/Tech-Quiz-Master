import React, { useState, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { listPageStyles } from "../assets/dummyStyles.jsx";
import { useNavigate } from "react-router-dom";
import { useApi } from "../services/api/api.js";

import {
  AlertCircle,
  CheckCircle,
  Search,
  X,
  XCircle,
  Filter,
  Cpu,
  Trash2,
  Clock,
  FileText,
  Calendar,
} from "lucide-react";

const List = () => {
  const [technologies, setTechnologies] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLevel, setSelectedLevel] = useState("All");
  const [animateBorder, setAnimateBorder] = useState(true);

  const [confirmDelete, setConfirmDelete] = useState({
    open: false,
    techId: null,
    techName: "",
  });

  const [toast, setToast] = useState({
    visible: false,
    message: "",
  });

  const toastTimerRef = useRef(null);

  const navigate = useNavigate();
  const location = useLocation();

  const { request } = useApi();

  // Fetch quizzes from backend
  useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        const data = await request("/admin/quizzes");
        const formatted = (data?.quizzes || []).map((q) => ({
          id: q._id || q.id,
          name: q.technology || q.name,
          level: q.level,
          timeLimit: q.timeLimit,
          questions: q.totalQuestions || (q.questions ? q.questions.length : 0),
          uploadDate: q.createdAt || q.uploadDate,
          color: "bg-gradient-to-r from-cyan-500 to-blue-500",
          icon: <Cpu className="w-5 h-5" />,
        }));
        setTechnologies(formatted);
      } catch (err) {
        setTechnologies([]);
      }
    };
    fetchQuizzes();
  }, [location]);

  // DELETE
  const deleteTechnology = async (id) => {
    try {
      await request(`/admin/quiz/${id}`, "DELETE");
      setTechnologies((prev) => prev.filter((tech) => tech.id !== id));
      setToast({ visible: true, message: "Deleted successfully!" });
      toastTimerRef.current = setTimeout(() => setToast((prev) => ({ ...prev, visible: false })), 2000);
    } catch (err) {
      setToast({ visible: true, message: "Delete failed!" });
      toastTimerRef.current = setTimeout(() => setToast((prev) => ({ ...prev, visible: false })), 2000);
    }
  };

  const formatDate = (date) => {
    const d = new Date(date);
    return `${d.getDate()} ${d.toLocaleString("en-US", {
      month: "short",
    })}, ${d.getFullYear()}`;
  };

  const getLevelColor = (level) => {
    if (level === "Basic") return "bg-emerald-50 text-emerald-700";
    if (level === "Intermediate") return "bg-amber-50 text-amber-700";
    if (level === "Advanced") return "bg-rose-50 text-rose-700";
    return "";
  };

  const getLevelIcon = (level) => {
    if (level === "Basic") return <CheckCircle className="w-4 h-4" />;
    if (level === "Intermediate") return <AlertCircle className="w-4 h-4" />;
    if (level === "Advanced") return <XCircle className="w-4 h-4" />;
  };

  const filteredTechnologies = technologies.filter((t) => {
    const matchSearch = t.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());

    const matchLevel =
      selectedLevel === "All" || t.level === selectedLevel;

    return matchSearch && matchLevel;
  });

  const levelOptions = [
    { value: "All", label: "All Levels", bg: "bg-purple-100", border: "border-b-2 border-purple-200", text: "text-slate-700 font-bold" },
    { value: "Basic", label: "Basic", bg: "bg-emerald-50", border: "border-b-2 border-emerald-100", text: "text-emerald-700" },
    { value: "Intermediate", label: "Intermediate", bg: "bg-amber-50", border: "border-b-2 border-amber-100", text: "text-amber-700" },
    { value: "Advanced", label: "Advanced", bg: "bg-rose-50", border: "", text: "text-rose-700" },
  ];

  const [showDropdown, setShowDropdown] = useState(false);

  return (
    <div className={listPageStyles.page}>
      <style>{listPageStyles.customCSS}</style>

      <div className={listPageStyles.container}>
        {/* HEADER */}
        <div className="max-w-7xl mx-auto w-full">
          <h1
            className="text-4xl md:text-5xl font-extrabold text-center mb-2 tracking-tight animate-gradient-move"
            style={{
              background: "linear-gradient(90deg, #a21caf 0%, #ec4899 50%, #6366f1 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              color: "transparent",
              backgroundSize: "200% 200%",
            }}
          >
            Tech Quiz Master
          </h1>
          <style>{`
            @keyframes gradient-move {
              0% { background-position: 0% 50%; }
              50% { background-position: 100% 50%; }
              100% { background-position: 0% 50%; }
            }
            .animate-gradient-move {
              background-size: 200% 200%;
              animation: gradient-move 3s ease-in-out infinite;
            }
          `}</style>
          <p className="text-center text-lg md:text-xl font-medium text-slate-600 mb-8 mt-2 px-2 md:px-0" style={{letterSpacing: '0.01em', maxWidth: 700, margin: '0 auto'}}>
            Empower your learning journey! Effortlessly create, manage, and review technology quizzes with a beautiful, intuitive, and responsive interface.
          </p>
        </div>

        {/* SEARCH & FILTER */}
        <div className="w-full flex justify-center mb-10 relative">
          <div className="relative bg-white rounded-2xl shadow p-2 flex items-center w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search Technologies..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-40 py-3 bg-transparent rounded-xl outline-none text-slate-700 font-medium text-base focus:ring-2 focus:ring-purple-200 transition"
            />
            {/* Custom Dropdown */}
            <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2 z-20">
              <div className="relative">
                <button
                  className="flex items-center bg-gradient-to-r from-purple-100 to-blue-100 border border-purple-200 rounded-xl px-3 py-1 shadow-sm hover:shadow-md transition cursor-pointer min-w-[110px] text-purple-700 font-semibold text-base focus:outline-none"
                  onClick={() => setShowDropdown((prev) => !prev)}
                  type="button"
                >
                  <Filter className="w-5 h-5 text-purple-500 mr-2" />
                  {levelOptions.find((opt) => opt.value === selectedLevel)?.label || "All Levels"}
                  <svg className="ml-2 w-4 h-4 text-purple-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M19 9l-7 7-7-7" /></svg>
                </button>
                {showDropdown && (
                  <div className="absolute right-0 mt-2 w-48 rounded-xl shadow-2xl border border-slate-200 bg-white overflow-hidden animate-fade-in">
                    {levelOptions.map((opt, idx) => (
                      <div
                        key={opt.value}
                        className={`cursor-pointer px-5 py-3 ${opt.bg} ${opt.text} ${opt.border} hover:bg-purple-50 transition-all duration-150`}
                        onClick={() => {
                          setSelectedLevel(opt.value);
                          setShowDropdown(false);
                        }}
                        style={{ fontWeight: selectedLevel === opt.value ? "bold" : "normal" }}
                      >
                        {opt.label}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <style>{`
              @keyframes fade-in {
                from { opacity: 0; transform: translateY(-8px); }
                to { opacity: 1; transform: translateY(0); }
              }
              .animate-fade-in {
                animation: fade-in 0.18s cubic-bezier(.4,0,.2,1);
              }
            `}</style>
          </div>
        </div>

        {/* CARDS OR EMPTY STATE */}
        {filteredTechnologies.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 animate-fade-in">
            <div className="w-20 h-20 mb-4 flex items-center justify-center rounded-2xl bg-gradient-to-r from-slate-100 to-blue-100 shadow">
              <svg width="48" height="48" fill="none" stroke="#6366f1" strokeWidth="2" viewBox="0 0 24 24"><rect x="4" y="4" width="16" height="16" rx="3"/><path d="M9 9h6M9 13h6"/></svg>
            </div>
            <h2 className="text-xl font-bold text-slate-800 mb-2">No technologies found</h2>
            <p className="text-slate-600 mb-6">Get Started by creating your first technology quiz.</p>
            <button
              className="px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-2xl hover:from-blue-600 hover:to-indigo-600 hover:shadow-xl transition-all duration-300 font-bold text-sm flex items-center gap-2"
              onClick={() => navigate("/dashboard")}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 4v16m8-8H4"/></svg>
              Create First Quiz
            </button>
            <style>{`
              @keyframes fade-in {
                from { opacity: 0; transform: scale(0.96); }
                to { opacity: 1; transform: scale(1); }
              }
              .animate-fade-in {
                animation: fade-in 0.25s cubic-bezier(.4,0,.2,1);
              }
            `}</style>
          </div>
        ) : (
          <div className={listPageStyles.grid}>
            {filteredTechnologies.map((tech) => (
              <div key={tech.id} className={listPageStyles.cardGroup}>
                <div className={listPageStyles.card}>
                  {/* HEADER */}
                  <div className={`${listPageStyles.cardHeader} ${tech.color}`}>
                    <div className={listPageStyles.cardHeaderInner}>
                      <div className={listPageStyles.cardHeaderLeft}>
                        <div className={listPageStyles.iconWrapper}>
                          {tech.icon}
                        </div>
                        <h3 className={listPageStyles.techName}>{tech.name}</h3>
                      </div>
                      <span className={`${listPageStyles.levelBadgeBase} ${getLevelColor(tech.level)}`}>
                        {getLevelIcon(tech.level)} {tech.level}
                      </span>
                    </div>
                  </div>
                  {/* BODY */}
                  <div className={listPageStyles.cardBody}>
                    <div className={listPageStyles.cardBodyContent}>
                      <div className={listPageStyles.statsGrid}>
                        {/* TIME */}
                        <div className={`${listPageStyles.statCardBase} ${listPageStyles.statCardTime}`}>
                          <div className="flex items-center gap-3">
                            <div className={`${listPageStyles.statIconBox} ${listPageStyles.statIconBoxBlue}`}>
                              <Clock className={`${listPageStyles.statIcon} ${listPageStyles.statIconBlue}`} />
                            </div>
                            <div>
                              <p className={listPageStyles.statLabel}>Time</p>
                              <p className={listPageStyles.statValue}>{tech.timeLimit} min</p>
                            </div>
                          </div>
                        </div>
                        {/* QUESTIONS */}
                        <div className={`${listPageStyles.statCardBase} ${listPageStyles.statCardQuestions}`}>
                          <div className="flex items-center gap-3">
                            <div className={`${listPageStyles.statIconBox} ${listPageStyles.statIconBoxEmerald}`}>
                              <FileText className={`${listPageStyles.statIcon} ${listPageStyles.statIconEmerald}`} />
                            </div>
                            <div>
                              <p className={listPageStyles.statLabel}>Questions</p>
                              <p className={listPageStyles.statValue}>{tech.questions}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                      {/* DATE */}
                      <div className={`${listPageStyles.statCardBase} ${listPageStyles.statCardDate}`}>
                        <div className="flex items-center gap-3">
                          <div className={`${listPageStyles.statIconBox} ${listPageStyles.statIconBoxPurple}`}>
                            <Calendar className={`${listPageStyles.statIcon} ${listPageStyles.statIconPurple}`} />
                          </div>
                          <div>
                            <p className={listPageStyles.statLabel}>Uploaded</p>
                            <p className={listPageStyles.statValue}>{formatDate(tech.uploadDate)}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                    {/* DELETE */}
                    <div className={listPageStyles.cardFooter}>
                      <button
                        onClick={() =>
                          setConfirmDelete({
                            open: true,
                            techId: tech.id,
                            techName: tech.name,
                          })
                        }
                        className={listPageStyles.deleteButton}
                      >
                        <Trash2 className={listPageStyles.trashIcon} />
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        {/* MODAL */}
        {confirmDelete.open && (
          <div className="fixed inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm z-50 transition-all">
            <div className="bg-white rounded-2xl p-8 w-[90%] max-w-xs shadow-2xl border border-slate-100 animate-fade-in">
              <h3 className="text-lg font-semibold mb-2 text-slate-800">Delete Quiz?</h3>
              <p className="text-sm text-slate-600 mb-6">
                Are you sure you want to delete <span className="font-semibold text-rose-600">{confirmDelete.techName}</span>? This action cannot be undone.
              </p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setConfirmDelete({ open: false })}
                  className="px-4 py-2 rounded-lg border border-slate-200 bg-white text-slate-700 font-semibold hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    deleteTechnology(confirmDelete.techId);
                    setConfirmDelete({ open: false });
                  }}
                  className="px-4 py-2 rounded-lg bg-rose-500 text-white font-semibold shadow hover:bg-rose-600 transition"
                >
                  Delete
                </button>
              </div>
            </div>
            <style>{`
              @keyframes fade-in {
                from { opacity: 0; transform: scale(0.96); }
                to { opacity: 1; transform: scale(1); }
              }
              .animate-fade-in {
                animation: fade-in 0.25s cubic-bezier(.4,0,.2,1);
              }
            `}</style>
          </div>
        )}
      </div>
    </div>
  );
};

export default List;
