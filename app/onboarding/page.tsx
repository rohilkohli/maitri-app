"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/hooks/use-auth";
import { ConfidenceLevel, LearningStyle, Topic } from "@/types";
import { saveCourse, saveProfile } from "@/lib/firebase";
import { DEFAULT_SAMPLE_TOPICS } from "@/lib/hooks/use-topics";
import { generateTopicsForProfile } from "@/lib/subject-topics";
import { extractTextFromImage, extractTopicsFromText, fileToBase64 } from "@/lib/ocr";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Calendar,
  Camera,
  CheckCircle2,
  Clock,
  FileText,
  GraduationCap,
  Layers,
  Loader2,
  Sparkles,
  Upload,
} from "lucide-react";

export default function OnboardingPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { toast } = useToast();

  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);

  // Step 1: Subject & Goal
  const [subject, setSubject] = useState("Mathematics");
  const [customSubject, setCustomSubject] = useState("");
  const [classLevel, setClassLevel] = useState("10th Class");
  const [customClassLevel, setCustomClassLevel] = useState("");
  const [board, setBoard] = useState("CBSE");
  const [customBoard, setCustomBoard] = useState("");
  const [examGoal, setExamGoal] = useState("Board Exam");
  const [customExamGoal, setCustomExamGoal] = useState("");
  const [targetScore, setTargetScore] = useState("90%+");

  // Helper to get actual values (custom or selected)
  const getActualSubject = () => subject === "Other" ? customSubject : subject;
  const getActualClassLevel = () => classLevel === "Other" ? customClassLevel : classLevel;
  const getActualBoard = () => board === "Other" ? customBoard : board;
  const getActualExamGoal = () => examGoal === "Other" ? customExamGoal : examGoal;

  // Step 2: Timeline
  const [examDate, setExamDate] = useState("2026-11-15");
  const [studyTimePerDay, setStudyTimePerDay] = useState([45]); // minutes
  const [learningStyle, setLearningStyle] = useState<LearningStyle>(LearningStyle.PRACTICE);

  // Step 3: Self-Assessment
  const [topicConfidences, setTopicConfidences] = useState<Record<string, ConfidenceLevel>>({
    "topic-limits": ConfidenceLevel.CONFIDENT,
    "topic-derivatives-intro": ConfidenceLevel.SOMEWHAT_SURE,
    "topic-diff-rules": ConfidenceLevel.SOMEWHAT_SURE,
    "topic-related-rates": ConfidenceLevel.GUESSING,
    "topic-ftc": ConfidenceLevel.GUESSING,
  });
  const [difficultTopics, setDifficultTopics] = useState<string[]>([
    "topic-related-rates",
    "topic-u-sub",
  ]);

  // Step 4: Content & Syllabus
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [manualTopicInput, setManualTopicInput] = useState("");
  const [useSample, setUseSample] = useState(true);

  // Dynamic topics based on subject + exam
  const [dynamicTopics, setDynamicTopics] = useState<Topic[]>([]);
  const [loadingTopics, setLoadingTopics] = useState(false);

  // Camera capture
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isProcessingOCR, setIsProcessingOCR] = useState(false);
  const [extractedText, setExtractedText] = useState("");

  // Generate topics using AI - called only when user clicks Next
  const generateTopics = async () => {
    const actualSubject = getActualSubject();
    const actualClassLevel = getActualClassLevel();
    const actualBoard = getActualBoard();
    const actualExamGoal = getActualExamGoal();

    if (!actualSubject || !actualClassLevel || !actualBoard) return;

    setLoadingTopics(true);
    try {
      const topics = await generateTopicsForProfile({
        subject: actualSubject,
        classLevel: actualClassLevel,
        board: actualBoard,
        examGoal: actualExamGoal,
      });
      setDynamicTopics(topics);
      const newConfidences: Record<string, ConfidenceLevel> = {};
      topics.forEach((t) => {
        newConfidences[t.id] = ConfidenceLevel.SOMEWHAT_SURE;
      });
      setTopicConfidences(newConfidences);
      setDifficultTopics([]);
    } catch (error) {
      console.error("Failed to generate topics:", error);
      toast({
        title: "Using default topics",
        description: "AI topic generation unavailable. Using standard curriculum.",
        variant: "destructive",
      });
    } finally {
      setLoadingTopics(false);
    }
  };

  // Handle Continue button - generate topics when moving to step 3
  const handleContinue = async () => {
    if (step === 2) {
      // Generate topics when moving from step 2 to step 3
      await generateTopics();
    }
    setStep((s) => s + 1);
  };

  const toggleDifficultTopic = (id: string) => {
    setDifficultTopics((prev) =>
      prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]
    );
  };

  const handleConfidenceChange = (topicId: string, level: ConfidenceLevel) => {
    setTopicConfidences((prev) => ({ ...prev, [topicId]: level }));
  };

  const handleFileDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setSelectedFile(e.dataTransfer.files[0]);
      setUseSample(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
      setUseSample(false);
    }
  };

  // Camera capture handler
  const handleCameraCapture = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setIsProcessingOCR(true);
      setUseSample(false);

      try {
        // Convert to base64 for preview
        const reader = new FileReader();
        reader.onload = (event) => {
          setCapturedImage(event.target?.result as string);
        };
        reader.readAsDataURL(file);

        // Run OCR
        const base64 = await fileToBase64(file);
        const text = await extractTextFromImage(base64, file.type);
        setExtractedText(text);
        setManualTopicInput(text);

        toast({
          title: "Syllabus scanned!",
          description: "Text extracted from your image. Review and edit if needed.",
        });
      } catch (err) {
        console.error("OCR error:", err);
        toast({
          title: "Scan failed",
          description: "Could not extract text. Try a clearer image or enter manually.",
          variant: "destructive",
        });
      } finally {
        setIsProcessingOCR(false);
      }
    }
  };

  const handleComplete = async () => {
    setSubmitting(true);
    const userId = user?.id || "demo-user";

    try {
      // 1. Save Profile with actual values
      const actualSubject = getActualSubject();
      const actualClassLevel = getActualClassLevel();
      const actualBoard = getActualBoard();
      const actualExamGoal = getActualExamGoal();

      await saveProfile(userId, {
        subject: actualSubject,
        classLevel: actualClassLevel,
        board: actualBoard,
        examGoal: actualExamGoal,
        examDate: new Date(examDate),
        studyTimePerDay: studyTimePerDay[0],
        confidenceLevel: ConfidenceLevel.SOMEWHAT_SURE,
        preferredLearningStyle: learningStyle,
        difficultTopics,
        topicConfidences,
      });

      // Save to localStorage for chatbot personalization
      localStorage.setItem(`maitri-profile-${userId}`, JSON.stringify({
        subject: actualSubject,
        classLevel: actualClassLevel,
        board: actualBoard,
        examGoal: actualExamGoal,
      }));

      // 2. Extract or build topics
      let finalTopics: Topic[] = dynamicTopics.length > 0 ? dynamicTopics : DEFAULT_SAMPLE_TOPICS;

      if (manualTopicInput.trim()) {
        const lines = manualTopicInput
          .split("\n")
          .map((l) => l.trim())
          .filter(Boolean);
        if (lines.length > 0) {
          finalTopics = lines.map((name, i) => ({
            id: `manual-topic-${i + 1}`,
            name,
            prerequisites: i > 0 ? [`manual-topic-${i}`] : [],
            subtopics: [`Core Concepts of ${name}`],
            importance: 0.8,
            description: `Manual topic: ${name}`,
          }));
        }
      } else if (!useSample && dynamicTopics.length > 0) {
        // Use dynamic topics based on subject/exam selection
        finalTopics = dynamicTopics;
      }

      // 3. Save Course to Firebase
      await saveCourse(`course-${userId}`, {
        userId,
        title: `${actualSubject} — ${actualExamGoal}`,
        topics: finalTopics,
      });

      // 4. Save Topics to localStorage for dashboard retrieval
      localStorage.setItem(`maitri-topics-${userId}`, JSON.stringify(finalTopics));

      toast({
        title: "Personalized Roadmap Initialized!",
        description: "Proceeding to your diagnostic baseline assessment.",
      });

      router.push("/diagnostic");
    } catch (err) {
      console.error("Onboarding error:", err);
      toast({
        title: "Setup Note",
        description: "Proceeding to diagnostic test.",
      });
      router.push("/diagnostic");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-12 px-4 sm:px-6 lg:px-8 flex flex-col justify-center">
      <div className="max-w-2xl mx-auto w-full space-y-8">
        {/* Progress Bar & Header */}
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 uppercase tracking-wider">
            <span>Step {step} of 4</span>
            <span>{Math.round((step / 4) * 100)}% Completed</span>
          </div>

          <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
            <div
              className="bg-gradient-to-r from-primary to-secondary h-full transition-all duration-500 ease-out"
              style={{ width: `${(step / 4) * 100}%` }}
            />
          </div>

          <div className="text-center space-y-1 pt-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {step === 1 && "What are you studying for?"}
              {step === 2 && "Timeline & Daily Commitment"}
              {step === 3 && "Calibrate Your Baseline"}
              {step === 4 && "Add Your Course Content"}
            </h1>
            <p className="text-sm text-slate-500">
              {step === 1 && "Tell us your target subject and exam objectives."}
              {step === 2 && "We will optimize your spaced repetition schedule."}
              {step === 3 && "Tell us which topics feel solid versus difficult."}
              {step === 4 && "Upload a syllabus PDF or start with our standard verified curriculum."}
            </p>
          </div>
        </div>

        {/* Wizard Card Container */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-md p-6 sm:p-8 space-y-6 animate-in fade-in">
          {/* STEP 1: Subject & Exam Goal */}
          {step === 1 && (
            <div className="space-y-5 animate-in fade-in">
              {/* Subject Selection */}
              <div className="space-y-2">
                <Label htmlFor="subject" className="text-xs font-bold uppercase tracking-wider text-slate-600">
                  Target Subject
                </Label>
                <Select value={subject} onValueChange={(val) => { setSubject(val); if (val !== "Other") setCustomSubject(""); }}>
                  <SelectTrigger id="subject" className="py-6 rounded-xl border-slate-300">
                    <SelectValue placeholder="Select Subject" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Mathematics">Mathematics</SelectItem>
                    <SelectItem value="Physics">Physics</SelectItem>
                    <SelectItem value="Computer Science">Computer Science</SelectItem>
                    <SelectItem value="Chemistry">Chemistry</SelectItem>
                    <SelectItem value="Biology">Biology</SelectItem>
                    <SelectItem value="English">English</SelectItem>
                    <SelectItem value="Social Science">Social Science</SelectItem>
                    <SelectItem value="Hindi">Hindi</SelectItem>
                    <SelectItem value="Economics">Economics</SelectItem>
                    <SelectItem value="Accountancy">Accountancy</SelectItem>
                    <SelectItem value="Other">Other (Specify)</SelectItem>
                  </SelectContent>
                </Select>
                {subject === "Other" && (
                  <Input
                    value={customSubject}
                    onChange={(e) => setCustomSubject(e.target.value)}
                    placeholder="Enter your subject (e.g., Environmental Science, Psychology)"
                    className="py-5 rounded-xl border-slate-300 mt-2"
                    autoFocus
                  />
                )}
              </div>

              {/* Class Level & Board */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="classLevel" className="text-xs font-bold uppercase tracking-wider text-slate-600">
                    Class / Grade Level
                  </Label>
                  <Select value={classLevel} onValueChange={(val) => { setClassLevel(val); if (val !== "Other") setCustomClassLevel(""); }}>
                    <SelectTrigger id="classLevel" className="py-6 rounded-xl border-slate-300">
                      <SelectValue placeholder="Select Class" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="5th Class">5th Class</SelectItem>
                      <SelectItem value="6th Class">6th Class</SelectItem>
                      <SelectItem value="7th Class">7th Class</SelectItem>
                      <SelectItem value="8th Class">8th Class</SelectItem>
                      <SelectItem value="9th Class">9th Class</SelectItem>
                      <SelectItem value="10th Class">10th Class</SelectItem>
                      <SelectItem value="11th Class">11th Class</SelectItem>
                      <SelectItem value="12th Class">12th Class</SelectItem>
                      <SelectItem value="College / University">College / University</SelectItem>
                      <SelectItem value="Other">Other (Specify)</SelectItem>
                    </SelectContent>
                  </Select>
                  {classLevel === "Other" && (
                    <Input
                      value={customClassLevel}
                      onChange={(e) => setCustomClassLevel(e.target.value)}
                      placeholder="e.g., Graduate, PhD, Grade 4"
                      className="py-5 rounded-xl border-slate-300 mt-2"
                    />
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="board" className="text-xs font-bold uppercase tracking-wider text-slate-600">
                    Board / Curriculum
                  </Label>
                  <Select value={board} onValueChange={(val) => { setBoard(val); if (val !== "Other") setCustomBoard(""); }}>
                    <SelectTrigger id="board" className="py-6 rounded-xl border-slate-300">
                      <SelectValue placeholder="Select Board" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="CBSE">CBSE</SelectItem>
                      <SelectItem value="ICSE">ICSE</SelectItem>
                      <SelectItem value="State Board">State Board</SelectItem>
                      <SelectItem value="IB">IB (International Baccalaureate)</SelectItem>
                      <SelectItem value="Cambridge">Cambridge (IGCSE)</SelectItem>
                      <SelectItem value="AP">AP (Advanced Placement)</SelectItem>
                      <SelectItem value="GCSE">GCSE</SelectItem>
                      <SelectItem value="Other">Other (Specify)</SelectItem>
                    </SelectContent>
                  </Select>
                  {board === "Other" && (
                    <Input
                      value={customBoard}
                      onChange={(e) => setCustomBoard(e.target.value)}
                      placeholder="e.g., Maharashtra Board, NIOS"
                      className="py-5 rounded-xl border-slate-300 mt-2"
                    />
                  )}
                </div>
              </div>

              {/* Exam Goal */}
              <div className="space-y-2">
                <Label htmlFor="examGoal" className="text-xs font-bold uppercase tracking-wider text-slate-600">
                  Specific Exam Goal
                </Label>
                <Select value={examGoal} onValueChange={(val) => { setExamGoal(val); if (val !== "Other") setCustomExamGoal(""); }}>
                  <SelectTrigger id="examGoal" className="py-6 rounded-xl border-slate-300">
                    <SelectValue placeholder="Select exam goal" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Board Exam">Board Exam</SelectItem>
                    <SelectItem value="IIT JEE">IIT JEE (Main/Advanced)</SelectItem>
                    <SelectItem value="NEET">NEET</SelectItem>
                    <SelectItem value="CUET">CUET</SelectItem>
                    <SelectItem value="Olympiad">Olympiad</SelectItem>
                    <SelectItem value="AP Exam">AP Exam</SelectItem>
                    <SelectItem value="SAT">SAT</SelectItem>
                    <SelectItem value="GRE">GRE</SelectItem>
                    <SelectItem value="GMAT">GMAT</SelectItem>
                    <SelectItem value="School Test">School Test / Unit Test</SelectItem>
                    <SelectItem value="Self Study">Self Study / Learning</SelectItem>
                    <SelectItem value="Other">Other (Specify)</SelectItem>
                  </SelectContent>
                </Select>
                {examGoal === "Other" && (
                  <Input
                    value={customExamGoal}
                    onChange={(e) => setCustomExamGoal(e.target.value)}
                    placeholder="e.g., UPSC, CAT, State PSC, GATE"
                    className="py-5 rounded-xl border-slate-300 mt-2"
                  />
                )}
              </div>

              {/* Target Score */}
              <div className="space-y-2">
                <Label htmlFor="targetScore" className="text-xs font-bold uppercase tracking-wider text-slate-600">
                  Target Score / Grade Goal
                </Label>
                <Input
                  id="targetScore"
                  value={targetScore}
                  onChange={(e) => setTargetScore(e.target.value)}
                  placeholder="e.g. 5 on AP, 95%+, Top 1%"
                  className="py-6 rounded-xl border-slate-300"
                />
              </div>

              {/* Info Note */}
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 text-xs text-blue-800">
                <strong>Note:</strong> Questions and topics will be tailored specifically to your{" "}
                <span className="font-semibold">{getActualClassLevel() || "selected class"}</span> level following the{" "}
                <span className="font-semibold">{getActualBoard() || "selected board"}</span> curriculum
                {getActualSubject() && <> for <span className="font-semibold">{getActualSubject()}</span></>}.
              </div>
            </div>
          )}

          {/* STEP 2: Timeline & Availability */}
          {step === 2 && (
            <div className="space-y-6 animate-in fade-in">
              <div className="space-y-2">
                <Label htmlFor="examDate" className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                  <Calendar className="h-4 w-4 text-primary" />
                  Target Exam Date
                </Label>
                <Input
                  id="examDate"
                  type="date"
                  value={examDate}
                  onChange={(e) => setExamDate(e.target.value)}
                  className="py-6 rounded-xl border-slate-300"
                />
              </div>

              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                    <Clock className="h-4 w-4 text-primary" />
                    Daily Study Commitment
                  </Label>
                  <span className="text-sm font-bold text-primary px-3 py-1 bg-blue-50 rounded-full border border-blue-200">
                    {studyTimePerDay[0]} minutes / day
                  </span>
                </div>
                <Slider
                  value={studyTimePerDay}
                  onValueChange={setStudyTimePerDay}
                  min={15}
                  max={180}
                  step={15}
                  className="py-4"
                />
                <div className="flex justify-between text-[11px] text-slate-400">
                  <span>15 min (Quick recall)</span>
                  <span>1 hour (Steady mastery)</span>
                  <span>3 hours (Intensive sprint)</span>
                </div>
              </div>

              <div className="space-y-2 pt-2">
                <Label className="text-xs font-bold uppercase tracking-wider text-slate-600">
                  Preferred Learning Style
                </Label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { id: LearningStyle.PRACTICE, title: "Active Practice", desc: "Problems first, theory on error" },
                    { id: LearningStyle.VISUAL, title: "Step-by-Step", desc: "Worked examples & deep breakdowns" },
                  ].map((style) => (
                    <button
                      key={style.id}
                      type="button"
                      onClick={() => setLearningStyle(style.id)}
                      className={`p-3.5 rounded-xl border text-left transition-all ${
                        learningStyle === style.id
                          ? "border-primary bg-primary/5 text-primary shadow-xs ring-1 ring-primary/30"
                          : "border-slate-200 hover:bg-slate-50 text-slate-700"
                      }`}
                    >
                      <span className="text-sm font-bold block">{style.title}</span>
                      <span className="text-xs text-slate-500">{style.desc}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: Self-Assessment */}
          {step === 3 && (
            <div className="space-y-5 animate-in fade-in">
              <div className="space-y-1">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-600 block">
                  Quick Self-Confidence Rating
                </span>
                <p className="text-xs text-slate-500">
                  Topics for <span className="font-semibold text-primary">{getActualSubject()}</span> • <span className="font-medium">{getActualClassLevel()}</span> • <span className="font-medium">{getActualBoard()}</span>
                </p>
              </div>

              <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                {loadingTopics ? (
                  <div className="text-center py-8 space-y-3">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
                    <p className="text-sm text-slate-600 font-medium">AI is generating topics for your curriculum...</p>
                    <p className="text-xs text-slate-400">Tailoring to {getActualClassLevel()} • {getActualBoard()}</p>
                  </div>
                ) : dynamicTopics.length > 0 ? (
                  dynamicTopics.map((topic) => {
                    const currentLevel = topicConfidences[topic.id] || ConfidenceLevel.SOMEWHAT_SURE;
                    const isDifficult = difficultTopics.includes(topic.id);

                    return (
                      <div
                        key={topic.id}
                        className="p-3.5 rounded-xl border border-slate-200/90 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                      >
                        <div className="flex-1 min-w-0">
                          <span className="text-sm font-semibold text-slate-800 block">
                            {topic.name}
                          </span>
                          <span className="text-[10px] text-slate-400 block truncate">
                            {topic.subtopics?.slice(0, 3).join(" • ")}
                          </span>
                          <button
                            type="button"
                            onClick={() => toggleDifficultTopic(topic.id)}
                            className={`text-[11px] font-medium transition-colors mt-1 ${
                              isDifficult ? "text-red-600 font-bold" : "text-slate-400 hover:text-slate-600"
                            }`}
                          >
                            {isDifficult ? "★ Flagged as Difficult" : "+ Flag as difficult"}
                          </button>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          {[
                            { level: ConfidenceLevel.GUESSING, label: "Low", color: "bg-red-500" },
                            { level: ConfidenceLevel.SOMEWHAT_SURE, label: "Med", color: "bg-amber-500" },
                            { level: ConfidenceLevel.CONFIDENT, label: "High", color: "bg-emerald-500" },
                          ].map((btn) => (
                            <button
                              key={btn.level}
                              type="button"
                              onClick={() => handleConfidenceChange(topic.id, btn.level)}
                              className={`px-3 py-1.5 text-xs rounded-lg border font-semibold transition-all ${
                                currentLevel === btn.level
                                  ? `${btn.color} text-white border-transparent shadow-sm`
                                  : "bg-white text-slate-600 border-slate-200 hover:bg-slate-100"
                              }`}
                            >
                              {btn.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-8 text-slate-500">
                    <p>Loading topics for your selection...</p>
                  </div>
                )}
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 text-xs text-blue-800">
                <strong>Tip:</strong> Be honest! Overconfidence leads to gaps in your roadmap. When in doubt, choose "Low".
              </div>
            </div>
          )}

          {/* STEP 4: Content Upload */}
          {step === 4 && (
            <div className="space-y-6 animate-in fade-in">
              {/* Upload Options - File or Camera */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Option A: File Upload */}
                <div
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={handleFileDrop}
                  className={`p-5 border-2 border-dashed rounded-2xl text-center space-y-2 transition-colors cursor-pointer ${
                    selectedFile
                      ? "border-emerald-500 bg-emerald-50/40"
                      : "border-slate-300 hover:border-primary bg-slate-50/50"
                  }`}
                  onClick={() => document.getElementById("file-input")?.click()}
                >
                  <input
                    id="file-input"
                    type="file"
                    accept=".pdf,.txt,.docx,.png,.jpg,.jpeg"
                    onChange={handleFileSelect}
                    className="hidden"
                  />

                  <div className="h-10 w-10 rounded-xl bg-blue-100 text-primary flex items-center justify-center mx-auto">
                    <Upload className="h-5 w-5" />
                  </div>

                  {selectedFile ? (
                    <div className="space-y-0.5">
                      <p className="text-xs font-bold text-emerald-800 flex items-center justify-center gap-1">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        {selectedFile.name.slice(0, 20)}...
                      </p>
                      <p className="text-[10px] text-slate-500">
                        {(selectedFile.size / 1024).toFixed(1)} KB
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-0.5">
                      <p className="text-sm font-semibold text-slate-700">
                        Upload File
                      </p>
                      <p className="text-[10px] text-slate-400">
                        PDF, TXT, Images
                      </p>
                    </div>
                  )}
                </div>

                {/* Option B: Camera Capture (Mobile) */}
                <div
                  className={`p-5 border-2 border-dashed rounded-2xl text-center space-y-2 transition-colors cursor-pointer ${
                    capturedImage
                      ? "border-emerald-500 bg-emerald-50/40"
                      : "border-slate-300 hover:border-primary bg-slate-50/50"
                  }`}
                  onClick={() => cameraInputRef.current?.click()}
                >
                  <input
                    ref={cameraInputRef}
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={handleCameraCapture}
                    className="hidden"
                  />

                  <div className="h-10 w-10 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center mx-auto">
                    {isProcessingOCR ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      <Camera className="h-5 w-5" />
                    )}
                  </div>

                  {isProcessingOCR ? (
                    <div className="space-y-0.5">
                      <p className="text-xs font-bold text-purple-800">
                        Scanning with AI...
                      </p>
                      <p className="text-[10px] text-slate-500">
                        Extracting text from image
                      </p>
                    </div>
                  ) : capturedImage ? (
                    <div className="space-y-0.5">
                      <p className="text-xs font-bold text-emerald-800 flex items-center justify-center gap-1">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        Photo scanned!
                      </p>
                      <p className="text-[10px] text-slate-500">
                        Tap to retake
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-0.5">
                      <p className="text-sm font-semibold text-slate-700">
                        Take Photo
                      </p>
                      <p className="text-[10px] text-slate-400">
                        Snap syllabus with camera
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Captured Image Preview */}
              {capturedImage && (
                <div className="rounded-xl overflow-hidden border border-slate-200">
                  <img
                    src={capturedImage}
                    alt="Captured syllabus"
                    className="w-full max-h-40 object-contain bg-slate-100"
                  />
                </div>
              )}

              {/* Option B: Standard Verified Sample */}
              <div className="flex items-center justify-between p-4 rounded-xl border border-slate-200 bg-slate-50/80">
                <div className="flex items-center gap-3">
                  <BookOpen className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-sm font-bold text-slate-800">
                      Use Comprehensive Verified Syllabus
                    </p>
                    <p className="text-xs text-slate-500">
                      Pre-calibrated Calculus & Analysis prerequisite graph
                    </p>
                  </div>
                </div>
                <Button
                  type="button"
                  variant={useSample ? "default" : "outline"}
                  size="sm"
                  onClick={() => {
                    setUseSample(true);
                    setSelectedFile(null);
                  }}
                  className="rounded-lg text-xs"
                >
                  {useSample ? "Selected" : "Use Sample"}
                </Button>
              </div>

              {/* Option C: Manual/OCR Topics */}
              <div className="space-y-2">
                <Label htmlFor="manual-topics" className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center justify-between">
                  <span>{extractedText ? "Extracted Text (edit if needed)" : "Or enter topics manually"}</span>
                  {extractedText && (
                    <button
                      type="button"
                      onClick={() => {
                        setExtractedText("");
                        setManualTopicInput("");
                        setCapturedImage(null);
                      }}
                      className="text-red-500 text-[10px] hover:underline"
                    >
                      Clear
                    </button>
                  )}
                </Label>
                <textarea
                  id="manual-topics"
                  rows={extractedText ? 6 : 3}
                  value={manualTopicInput}
                  onChange={(e) => {
                    setManualTopicInput(e.target.value);
                    if (e.target.value) setUseSample(false);
                  }}
                  placeholder="e.g.&#10;Limits & Continuity&#10;Derivatives & Chain Rule&#10;Integrals & U-Substitution"
                  className={`w-full p-3 text-sm rounded-xl border focus:outline-none focus:ring-2 focus:ring-primary/20 ${
                    extractedText ? "border-emerald-300 bg-emerald-50/30" : "border-slate-300"
                  }`}
                />
                {extractedText && (
                  <p className="text-[10px] text-emerald-600">
                    ✓ Text extracted via AI OCR. Edit above to correct any errors.
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
            {step > 1 ? (
              <Button
                type="button"
                variant="ghost"
                onClick={() => setStep((s) => s - 1)}
                className="gap-2 text-slate-600 hover:text-slate-900"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Back</span>
              </Button>
            ) : (
              <div />
            )}

            {step < 4 ? (
              <Button
                type="button"
                onClick={handleContinue}
                disabled={loadingTopics}
                className="rounded-xl bg-primary hover:bg-primary/90 text-white font-semibold gap-2 px-6 shadow-sm"
              >
                {loadingTopics ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Generating Topics...</span>
                  </>
                ) : (
                  <>
                    <span>Continue</span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </Button>
            ) : (
              <Button
                type="button"
                onClick={handleComplete}
                disabled={submitting}
                className="rounded-xl bg-primary hover:bg-primary/90 text-white font-bold gap-2 px-8 py-6 shadow-md shadow-primary/25"
              >
                {submitting ? (
                  <span>Generating Diagnostic...</span>
                ) : (
                  <>
                    <span>Begin Diagnostic Test</span>
                    <Sparkles className="h-4 w-4" />
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
