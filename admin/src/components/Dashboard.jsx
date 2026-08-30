import React, { useEffect, useRef, useState } from 'react'
import { useApi } from '../services/api/api.js';
import { dashboardStyles } from '../assets/dummyStyles.jsx';
import { AlertCircle } from 'lucide-react';
import { useNavigate } from "react-router-dom";

// Helper functions
const levels = [
  { value: "Basic", color: "text-green-600", bg: "bg-green-50" },
  { value: "Intermediate", color: "text-yellow-600", bg: "bg-yellow-50" },
  { value: "Advanced", color: "text-red-600", bg: "bg-red-50" },
];

const letterForIndex = (i) => ["A", "B", "C", "D"][i] || "";

// CSV parsing function
function parseCSVText(csvText) {
  const rows = [];
  let current = "";
  let row = [];
  let inQuotes = false;

  for (let i = 0; i < csvText.length; i++) {
    const char = csvText[i];
    const next = csvText[i + 1];

    if (char === '"') {
      if (inQuotes && next === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (char === "," && !inQuotes) {
      row.push(current);
      current = "";
      continue;
    }

    if ((char === "\n" || char === "\r") && !inQuotes) {
      if (current !== "" || row.length > 0) {
        row.push(current);
        rows.push(row);
      }
      current = "";
      row = [];
      if (char === "\r" && csvText[i + 1] === "\n") i++;
      continue;
    }

    current += char;
  }

  if (current !== "" || row.length > 0) {
    row.push(current);
    rows.push(row);
  }

  return rows.map((r) => r.map((c) => c.trim()));
}

const Dashboard = () => {
    
  const [technology, setTechnology] = useState("");
  const [level, setLevel] = useState("Basic");
  const [timeLimit, setTimeLimit] = useState(30); // in minutes
  const [questions, setQuestions] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [toast, setToast] = useState({
    show: false,
    type: "success",
    message: "",
  });
  const [showPreview, setShowPreview] = useState(false);  // preview for uploaded questions
  const [validationErrors, setValidationErrors] = useState({});
  const fileInputRef = useRef(null);

  const [adminStats, setAdminStats] = useState({
    totalUsers: 0,
    totalLoggedIn: 0,
    loggedInPercentage: 0,
  });
  const { request } = useApi();
  const navigate = useNavigate();

//   Total users
  useEffect(() => {
    const loadStats = async () => {
      try {
        const data = await request("/admin/stats");
        console.log("ADMIN STATS:", data);
        setAdminStats({
          totalUsers: data.totalUsers || 0,
          totalLoggedIn: data.loggedInUsers || 0,
          loggedInPercentage: data.loggedInPercentage || 0,
        });
      } catch (err) {
        console.log("Stats error:", err);
      }
    };

    loadStats();
  }, []);

//   Toast timer
  useEffect(() => {
    if (toast.show) {
      const timer = setTimeout(() => {
        setToast((prev) => ({ ...prev, show: false }));
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [toast.show]);

//   Form validation
  const validateForm = () => {
    const errors = {};

    if (!technology.trim()) {
      errors.technology = "Technology name is required";
    }

    if (!level) {
      errors.level = "Level is required";
    }

    if (!timeLimit || timeLimit < 1) {
      errors.timeLimit = "Time limit must be at least 1 minute";
    }

    if (questions.length === 0) {
      errors.questions = "Please upload CSV with questions";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  }; // to drag and drop the csv file

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file && file.type === "text/csv") {
      processCSVFile(file);
    } else {
      setToast({
        show: true,
        type: "error",
        message: "Please upload a valid CSV file",
      });
    }
  };

  const handleFileUpload = (event) => {
    const file = event.target.files?.[0];
    if (file) {
      processCSVFile(file);
    }
  }; // to upload the csv file using file input

  const processCSVFile = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target.result;
      processCSVText(text);
    };
    reader.readAsText(file);
  }; // to render the csv file

  const processCSVText = (csvText) => {
    if (!csvText) return;

    const rows = parseCSVText(csvText);
    if (rows.length === 0) {
      setToast({
        show: true,
        type: "error",
        message: "Uploaded CSV is empty or invalid",
      });
      return;
    }

    const header = rows[0].map((c) => c.toLowerCase());
    let startIdx = 0;

    const hasQuestionHeader = header.some(
      (h) => h.includes("question") || h.includes("q."),
    );
    const hasAnswerHeader = header.some(
      (h) => h.includes("answer") || h.includes("correct"),
    );
    const hasOptionsHeader = header.some(
      (h) => h.includes("option") || h.includes("choice"),
    );

    if (hasQuestionHeader && (hasAnswerHeader || hasOptionsHeader)) {
      startIdx = 1;
    }

    const parsedQuestions = [];
    for (let i = startIdx; i < rows.length; i++) {
      const row = rows[i];

      if (row.length === 0 || row.every((cell) => !cell.trim())) {
        continue;
      }

      const paddedRow = [...row];
      while (paddedRow.length < 6) {
        paddedRow.push("");
      }

      const question = paddedRow[0] || "";
      const options = [
        paddedRow[1] || "",
        paddedRow[2] || "",
        paddedRow[3] || "",
        paddedRow[4] || "",
      ];
      const answerRaw = (paddedRow[5] || "").trim().toUpperCase();

      let answerKey = "";
      let answerText = "";

      let foundAnswer = false;

      if (["A", "B", "C", "D"].includes(answerRaw)) {
        answerKey = answerRaw;
        const idx = ["A", "B", "C", "D"].indexOf(answerRaw);
        answerText = options[idx] || answerRaw;
        foundAnswer = true;
      }

      if (!foundAnswer && ["1", "2", "3", "4"].includes(answerRaw)) {
        const idx = parseInt(answerRaw) - 1;
        answerKey = ["A", "B", "C", "D"][idx];
        answerText = options[idx] || answerRaw;
        foundAnswer = true;
      }

      if (!foundAnswer) {
        for (let j = 0; j < options.length; j++) {
          if (options[j].trim().toLowerCase() === answerRaw.toLowerCase()) {
            answerKey = ["A", "B", "C", "D"][j];
            answerText = options[j];
            foundAnswer = true;
            break;
          }
        }
      }

      if (!foundAnswer) {
        for (let j = 0; j < options.length; j++) {
          if (
            options[j].trim().toLowerCase().includes(answerRaw.toLowerCase()) ||
            answerRaw.toLowerCase().includes(options[j].trim().toLowerCase())
          ) {
            answerKey = ["A", "B", "C", "D"][j];
            answerText = options[j];
            foundAnswer = true;
            break;
          }
        }
      }

      if (!foundAnswer && options[0]) {
        answerKey = "A";
        answerText = options[0];
      }

      if (question.trim()) {
        parsedQuestions.push({
          question: question.trim(),
          options: options.map((opt) => opt.trim()),
          answerKey,
          answerText,
        });
      }
    }

    if (parsedQuestions.length === 0) {
      setToast({
        show: true,
        type: "error",
        message: "No valid questions found in CSV",
      });
      return;
    }

    setQuestions(parsedQuestions);
    setShowPreview(true);
    setValidationErrors((prev) => ({ ...prev, questions: "" }));

    setToast({
      show: true,
      type: "success",
      message: `${parsedQuestions.length} questions loaded successfully`,
    });
  }; // This function will open the CSV file and
 // show the ques, ans options

  const handleSubmit = async () => {
    if (!validateForm()) {
      setToast({
        show: true,
        type: "error",
        message: "Please fill all required fields",
      });
      return;
    }

    try {
      const payload = {
        technology: technology.trim(),
        level,
        timeLimit: parseInt(timeLimit),
        questions,
        totalQuestions: questions.length,
      };

      const res = await request(
        "/admin/upload-quiz",
        "POST",
        payload,
      );

      setToast({
        show: true,
        type: "success",
        message: `Quiz "${technology}" created successfully`,
      });

      resetForm();
      // Navigate to quiz giving page after creation
      // After quiz creation, redirect to home/landing page
      window.location.href = "http://localhost:5174";
    } catch (err) {
      console.log("UPLOAD ERROR:", err);

      setToast({
        show: true,
        type: "error",
        message: err.message || "Quiz upload failed",
      });
    }
  };

  // back to the initial state after successful upload
  const resetForm = () => {
    setTechnology("");
    setLevel("Basic");
    setTimeLimit(30);
    setQuestions([]);
    setShowPreview(false);
    setValidationErrors({});
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const isFormValid =
    technology.trim() && level && timeLimit >= 1 && questions.length > 0;


  return (
    <div className={dashboardStyles.page}>
      <div className={dashboardStyles.container}>
        <div className={dashboardStyles.headerWrapper}>
          <div className={dashboardStyles.headerInner}>
            <h1 className={dashboardStyles.title}>Tech Quiz Master</h1>
          </div>
        </div>
        <div className={dashboardStyles.grid}>
          {/* Main Column */}
          <div className={dashboardStyles.mainColumn}>
            <div className={dashboardStyles.card}>
              <h2 className={dashboardStyles.cardTitle}>Create New Quiz</h2>
              <div className={dashboardStyles.formFields}>
                {/* Technology Input */}
                <div>
                  <label className={dashboardStyles.label}>
                    Technology Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={technology}
                    onChange={(e) => {
                      setTechnology(e.target.value);
                      setValidationErrors((prev) => ({ ...prev, technology: "" }));
                    }}
                    placeholder="e.g:- JavaScript, React, Python"
                    className={`${dashboardStyles.inputBase} ${
                      validationErrors.technology
                        ? dashboardStyles.inputErrorBorder
                        : dashboardStyles.inputNormalBorder
                    }`}
                  />
                  {validationErrors.technology && (
                    <p className={dashboardStyles.errorMessage}>
                      <AlertCircle className={dashboardStyles.errorIcon} />
                      {validationErrors.technology}
                    </p>
                  )}
                </div>

                {/* Level Selection */}
                <div>
                  <label className={dashboardStyles.label}>Level <span className="text-red-500">*</span></label>
                  <div className={dashboardStyles.levelGrid}>
                    {levels.map((lvl) => (
                      <button
                        key={lvl.value}
                        type="button"
                        className={`${dashboardStyles.levelButtonBase} ${
                          level === lvl.value
                            ? `${lvl.bg} ${lvl.color} border-2 border-current`
                            : "bg-white border-gray-200 text-gray-700"
                        }`}
                        onClick={() => {
                          setLevel(lvl.value);
                          setValidationErrors((prev) => ({ ...prev, level: "" }));
                        }}
                      >
                        <span className={dashboardStyles.levelButtonTextBase}>{lvl.value}</span>
                      </button>
                    ))}
                  </div>
                  {validationErrors.level && (
                    <p className={dashboardStyles.errorMessage}>
                      <AlertCircle className={dashboardStyles.errorIcon} />
                      {validationErrors.level}
                    </p>
                  )}
                </div>

                {/* Time Limit */}
                <div>
                  <label className={dashboardStyles.label}>Time Limit (minutes) <span className="text-red-500">*</span></label>
                  <div className={dashboardStyles.timeContainer}>
                    <div className={dashboardStyles.timeInputWrapper}>
                      <input
                        type="number"
                        min={1}
                        value={timeLimit}
                        onChange={(e) => {
                          setTimeLimit(Number(e.target.value));
                          setValidationErrors((prev) => ({ ...prev, timeLimit: "" }));
                        }}
                        className={dashboardStyles.timeInputBase}
                      />
                    </div>
                    <span className={dashboardStyles.timeDisplay}>{timeLimit} min</span>
                  </div>
                  {validationErrors.timeLimit && (
                    <p className={dashboardStyles.errorMessage}>
                      <AlertCircle className={dashboardStyles.errorIcon} />
                      {validationErrors.timeLimit}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-1 mt-2 text-sm text-gray-400">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" /><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01" /></svg>
                  <span>Time allocated per participant to complete the quiz</span>
                </div>

                {/* CSV Upload Dropzone */}
                <div>
                  <label className={dashboardStyles.label}>Upload Questions (CSV) <span className="text-red-500">*</span></label>
                  <div
                    className={`${dashboardStyles.dropzoneBase} ${
                      isDragging
                        ? dashboardStyles.dropzoneDragging
                        : validationErrors.questions
                        ? dashboardStyles.dropzoneError
                        : dashboardStyles.dropzoneNormal
                    }`}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current && fileInputRef.current.click()}
                  >
                    <input
                      type="file"
                      accept=".csv"
                      ref={fileInputRef}
                      className={dashboardStyles.hiddenInput}
                      onChange={handleFileUpload}
                    />
                    <div className={dashboardStyles.uploadIconNormal}>
                      <svg className="w-12 h-12 mx-auto mb-3" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 16V4m0 12l-4-4m4 4l4-4m-8 8h8a2 2 0 002-2V7a2 2 0 00-2-2H6a2 2 0 00-2 2v9a2 2 0 002 2z" /></svg>
                    </div>
                    <div className={dashboardStyles.dropzoneTextPrimary}>Drag & drop or click to upload CSV</div>
                    <div className={dashboardStyles.dropzoneTextSecondary}>Format: Question, Option A, Option B, Option C, Option D, Answer</div>
                  </div>
                  {validationErrors.questions && (
                    <p className={dashboardStyles.errorMessage}>
                      <AlertCircle className={dashboardStyles.errorIcon} />
                      {validationErrors.questions}
                    </p>
                  )}
                  {questions.length > 0 && (
                    <div className={dashboardStyles.successContainer}>
                      <div className={dashboardStyles.successInner}>
                        <div className={dashboardStyles.successLeft}>
                          <svg className={dashboardStyles.successIcon} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                          <span className={dashboardStyles.successText}>{questions.length} questions loaded</span>
                        </div>
                        <button
                          className={dashboardStyles.previewToggleButton}
                          type="button"
                          onClick={() => setShowPreview((prev) => !prev)}
                        >
                          {showPreview ? (
                            <>
                              {/* Eye-off icon */}
                              <svg className={dashboardStyles.previewIcon} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M17.94 17.94A10.06 10.06 0 0112 20c-5.05 0-9.27-3.38-10-8 .21-1.38.77-2.68 1.62-3.77m2.1-2.1A9.97 9.97 0 0112 4c5.05 0 9.27 3.38 10 8-.18 1.18-.6 2.3-1.22 3.28M9.88 9.88a3 3 0 104.24 4.24" />
                                <path strokeLinecap="round" strokeLinejoin="round" d="M3 3l18 18" />
                              </svg>
                              <span>Hide Preview</span>
                            </>
                          ) : (
                            <>
                              {/* Eye icon */}
                              <svg className={dashboardStyles.previewIcon} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M1.5 12S5 5 12 5s10.5 7 10.5 7-3.5 7-10.5 7S1.5 12 1.5 12z" />
                                <circle cx="12" cy="12" r="3.5" />
                              </svg>
                              <span>Show Preview</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Submit Button */}
                <button
                  className={`${dashboardStyles.submitBase} ${
                    technology.trim() && level && timeLimit >= 1 && questions.length > 0
                      ? dashboardStyles.submitValid
                      : dashboardStyles.submitInvalid
                  }`}
                  onClick={handleSubmit}
                  disabled={!(technology.trim() && level && timeLimit >= 1 && questions.length > 0)}
                >
                  <span className={dashboardStyles.submitInner}>
                    <svg className={dashboardStyles.submitIcon} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                    Create Quiz
                  </span>
                </button>
              </div>
            </div>

            {/* Preview Section */}
            {showPreview && questions.length > 0 && (
              <div className={dashboardStyles.previewCard}>
                <div className={dashboardStyles.previewHeader}>
                  <div>
                    <div className={dashboardStyles.previewTitle}>Preview Questions</div>
                    <div className={dashboardStyles.previewSubtitle}>{questions.length} questions</div>
                  </div>
                  <div className={dashboardStyles.previewRight}>
                    <span className={dashboardStyles.timeBadge}>
                      <svg className={dashboardStyles.timeBadgeIcon} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3" /><circle cx="12" cy="12" r="10" /></svg>
                      <span className={dashboardStyles.timeBadgeText}>{timeLimit} min</span>
                    </span>
                    <span className={dashboardStyles.countBadge}>{questions.length} Qs</span>
                  </div>
                </div>
                <div className={dashboardStyles.previewList}>
                  {questions.map((q, idx) => (
                    <div key={idx} className={dashboardStyles.previewItem}>
                      <div className="flex gap-4 items-start">
                        <div className={dashboardStyles.previewNumber}>{idx + 1}</div>
                        <div className={dashboardStyles.previewContent}>
                          <div className={dashboardStyles.previewQuestion}>{q.question}</div>
                          <div className={dashboardStyles.optionsGrid}>
                            {q.options.map((opt, i) => (
                              <div
                                key={i}
                                className={`${dashboardStyles.optionItemBase} ${
                                  q.answerKey === letterForIndex(i)
                                    ? dashboardStyles.optionItemCorrect
                                    : dashboardStyles.optionItemIncorrect
                                }`}
                              >
                                <span
                                  className={`${dashboardStyles.optionLetterBase} ${
                                    q.answerKey === letterForIndex(i)
                                      ? dashboardStyles.optionLetterCorrect
                                      : dashboardStyles.optionLetterIncorrect
                                  }`}
                                >
                                  {letterForIndex(i)}
                                </span>
                                <span
                                  className={
                                    q.answerKey === letterForIndex(i)
                                      ? dashboardStyles.optionTextCorrect
                                      : dashboardStyles.optionTextIncorrect
                                  }
                                >
                                  {opt || <span className={dashboardStyles.optionEmptyText}>Empty</span>}
                                </span>
                                {q.answerKey === letterForIndex(i) && (
                                  <svg className={dashboardStyles.correctIconSvg} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                                )}
                              </div>
                            ))}
                          </div>
                          <div className={dashboardStyles.optionFooter}>
                            <span className={dashboardStyles.answerBadge}>
                              <svg className={dashboardStyles.answerBadgeIcon} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                              <span className={dashboardStyles.answerBadgeText}>Correct: {q.answerKey} - {q.answerText}</span>
                            </span>
                            <span className={dashboardStyles.positionText}>Q{idx + 1} of {questions.length}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Tips & Summary */}
          <div className={dashboardStyles.rightColumn}>
            {/* Platform Stats Card */}
            {/* <div style={{background:'#fff',borderRadius:'16px',boxShadow:'0 2px 8px 0 rgba(31,41,55,0.06)',border:'1px solid #f1f5f9',padding:'24px',marginBottom:'18px'}}>
              <div style={{fontWeight:'bold',fontSize:'1.15rem',marginBottom:'18px',color:'#222',display:'flex',alignItems:'center',gap:'8px'}}>
                <svg width="22" height="22" fill="none" stroke="#a78bfa" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 01.88 7.88M15 19h5v-2a4 4 0 00-3-3.87M9 20H4v-2a4 4 0 013-3.87" /></svg>
                Platform Stats
              </div>
              <div style={{marginBottom:'8px',display:'flex',justifyContent:'space-between',alignItems:'center',fontSize:'15px'}}>
                <span style={{display:'flex',alignItems:'center',gap:'7px',color:'#444',fontWeight:500}}>
                  <svg width="18" height="18" fill="none" stroke="#94a3b8" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" /></svg>
                  Total Registered Users
                </span>
                <span style={{fontWeight:'bold',color:'#222'}}>{adminStats.totalUsers}</span>
              </div>
              <div style={{marginBottom:'8px',display:'flex',justifyContent:'space-between',alignItems:'center',fontSize:'15px'}}>
                <span style={{display:'flex',alignItems:'center',gap:'7px',color:'#444',fontWeight:500}}>
                  <svg width="18" height="18" fill="none" stroke="#94a3b8" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                  Total Logged In Users
                </span>
                <span style={{fontWeight:'bold',color:'#222'}}>{adminStats.totalLoggedIn}</span>
              </div>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',fontSize:'15px'}}>
                <span style={{display:'flex',alignItems:'center',gap:'7px',color:'#444',fontWeight:500}}>
                  <svg width="18" height="18" fill="none" stroke="#4ade80" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 17a4 4 0 004 4h10a4 4 0 004-4V7a4 4 0 00-4-4H7a4 4 0 00-4 4v10z" /></svg>
                  Login Rate
                </span>
                <span style={{fontWeight:'bold',color:'#16a34a'}}>{adminStats.totalUsers > 0 ? `${((adminStats.totalLoggedIn / adminStats.totalUsers) * 100).toFixed(2)}%` : '0%'}</span>
              </div>
            </div> */}

            {/* Quick Tips Card */}
            <div style={{background:'#eaf3fb',borderRadius:'16px',border:'1px solid #bae6fd',padding:'24px',marginBottom:'18px'}}>
              <div style={{fontWeight:'bold',fontSize:'1.15rem',marginBottom:'14px',color:'#1e293b',display:'flex',alignItems:'center',gap:'8px'}}>
                <svg width="20" height="20" fill="none" stroke="#f472b6" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M17 7V3a1 1 0 00-2 0v4M7 7V3a1 1 0 00-2 0v4M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                Quick Tips
              </div>
              <div style={{display:'flex',flexDirection:'column',gap:'8px',fontSize:'15px'}}>
                <div style={{display:'flex',alignItems:'center',gap:'8px'}}><span style={{width:24,height:24,background:'#dbeafe',color:'#2563eb',borderRadius:'9999px',display:'flex',alignItems:'center',justifyContent:'center',fontWeight:'bold',fontSize:14}}>1</span>All fields marked with * are required</div>
                <div style={{display:'flex',alignItems:'center',gap:'8px'}}><span style={{width:24,height:24,background:'#dbeafe',color:'#2563eb',borderRadius:'9999px',display:'flex',alignItems:'center',justifyContent:'center',fontWeight:'bold',fontSize:14}}>2</span>Preview questions before creating quiz</div>
                <div style={{display:'flex',alignItems:'center',gap:'8px'}}><span style={{width:24,height:24,background:'#dbeafe',color:'#2563eb',borderRadius:'9999px',display:'flex',alignItems:'center',justifyContent:'center',fontWeight:'bold',fontSize:14}}>3</span>Set appropriate time limit based on difficulty level</div>
              </div>
            </div>

            {/* Summary Card */}
            <div className={dashboardStyles.summaryCard}>
              <div className={dashboardStyles.summaryTitle}>Quiz Summary</div>
              <div className={dashboardStyles.summaryRows}>
                <div className={dashboardStyles.summaryRow}>
                  <span className={dashboardStyles.summaryLabel}>Technology</span>
                  <span className={dashboardStyles.summaryValue}>{technology || '-'}</span>
                </div>
                <div className={dashboardStyles.summaryRow}>
                  <span className={dashboardStyles.summaryLabel}>Level</span>
                  <span className={dashboardStyles.summaryValue}>{level}</span>
                </div>
                <div className={dashboardStyles.summaryRow}>
                  <span className={dashboardStyles.summaryLabel}>Time Limit</span>
                  <span className={dashboardStyles.summaryValue}>{timeLimit} min</span>
                </div>
                <div className={dashboardStyles.summaryRow}>
                  <span className={dashboardStyles.summaryLabel}>Questions</span>
                  <span className={dashboardStyles.summaryValue}>{questions.length}</span>
                </div>
              </div>
              <div className={dashboardStyles.summaryStatusRow}>
                <span className={`${dashboardStyles.statusBadgeBase} ${
                  technology.trim() && level && timeLimit >= 1 && questions.length > 0
                    ? dashboardStyles.statusBadgeReady
                    : dashboardStyles.statusBadgeIncomplete
                }`}>
                  {technology.trim() && level && timeLimit >= 1 && questions.length > 0
                    ? "Ready to Submit"
                    : "Incomplete"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Toast Notification */}
        <div
          className={`${dashboardStyles.toastOuter} ${toast.show ? dashboardStyles.toastVisible : dashboardStyles.toastHidden}`}
          style={{ pointerEvents: toast.show ? "auto" : "none" }}
        >
          <div
            className={`${dashboardStyles.toastInner} ${
              toast.type === "success"
                ? dashboardStyles.toastSuccess
                : toast.type === "error"
                ? dashboardStyles.toastError
                : dashboardStyles.toastInfo
            }`}
          >
            <span>
              {toast.type === "success" && (
                <svg className={dashboardStyles.toastIconSuccess} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
              )}
              {toast.type === "error" && (
                <svg className={dashboardStyles.toastIconError} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 9l-6 6m0-6l6 6" /></svg>
              )}
              {toast.type === "info" && (
                <svg className={dashboardStyles.toastIconInfo} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" /><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01" /></svg>
              )}
            </span>
            <span
              className={`${dashboardStyles.toastTextBase} ${
                toast.type === "success"
                  ? dashboardStyles.toastTextSuccess
                  : toast.type === "error"
                  ? dashboardStyles.toastTextError
                  : dashboardStyles.toastTextInfo
              }`}
            >
              {toast.message}
            </span>
            <button
              className={dashboardStyles.toastCloseButton}
              onClick={() => setToast((prev) => ({ ...prev, show: false }))}
              style={{ marginLeft: "auto" }}
            >
              <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard
