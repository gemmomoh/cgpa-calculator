import GpaChart from "./components/GpaChart";
import Header from "@/components/Header";
import CGPASummary from "./components/CGPASummary";
import IntroMessage from "./components/IntroMessage";
import Footer from "@/components/Footer";
import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { getDoc, setDoc, doc } from "firebase/firestore";
import { db } from "@/firebase";
import CourseInput from "./components/CourseInput";
import AddCourseButton from "./components/AddCourseButton";
import SessionTabs from "./components/SessionTabs";
import SemesterTabs from "./components/SemesterTabs";
import { v4 as uuidv4 } from "uuid";
import { Button } from "./components/ui/button";
import AddSessionButton from "./components/AddSessionButton";
import { Trash2 } from "lucide-react";

import NotesSection from "./components/NotesSection";

interface Course {
  id: string;
  name: string;
  grade: string;
  units: number;
}

interface Semester {
  id: string;
  name: string;
}

interface Session {
  id: string;
  name: string;
  semesters: Semester[];
}

const LOCAL_STORAGE_KEY = "cgpaCalculatorData";

function loadLocalData() {
  try {
    const json = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!json) return null;
    return JSON.parse(json);
  } catch {
    return null;
  }
}

function saveLocalData(data: {
  sessions: Session[];
  semesterCourses: { [key: string]: Course[] };
}) {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data));
  } catch {
    // ignore errors
  }
}

function App() {
  const { user } = useAuth();

  const [sessions, setSessions] = useState<Session[]>([
    {
      id: "sess1",
      name: "2021/2022",
      semesters: [
        { id: "sess1-sem1", name: "Semester 1" },
        { id: "sess1-sem2", name: "Semester 2" },
      ],
    },
  ]);
  const [activeSessionId, setActiveSessionId] = useState("sess1");
  const [activeSemesterId, setActiveSemesterId] = useState("sess1-sem1");
  const [semesterCourses, setSemesterCourses] = useState<{
    [key: string]: Course[];
  }>({
    "sess1-sem1": [],
    "sess1-sem2": [],
  });
  const [sessionSemesterMap, setSessionSemesterMap] = useState<{
    [key: string]: string;
  }>({});

  const activeSession = sessions.find((s) => s.id === activeSessionId);

  // Debounce saving to Firestore or localStorage
  const saveTimeout = useRef<NodeJS.Timeout | null>(null);

  // On user or app load: load from Firestore if logged in, else localStorage
  useEffect(() => {
    async function loadData() {
      if (user) {
        try {
          const userDocRef = doc(db, "users", user.uid);
          const userDocSnap = await getDoc(userDocRef);
          if (userDocSnap.exists()) {
            const data = userDocSnap.data();
            if (data.sessions) setSessions(data.sessions);
            if (data.semesterCourses) setSemesterCourses(data.semesterCourses);
            // semesterCourses is set directly from Firestore data, so course inputs will render from saved data
            if (data.sessions && data.sessions.length > 0) {
              setActiveSessionId(data.sessions[0].id);
              if (
                data.sessions[0].semesters &&
                data.sessions[0].semesters.length > 0
              ) {
                setActiveSemesterId(data.sessions[0].semesters[0].id);
              }
            }
          } else {
            const localData = loadLocalData();
            if (
              localData &&
              localData.sessions?.length > 0 &&
              Object.keys(localData.semesterCourses || {}).some(
                (key) => (localData.semesterCourses?.[key] || []).length > 0
              )
            ) {
              await setDoc(userDocRef, {
                sessions: localData.sessions,
                semesterCourses: localData.semesterCourses,
              });
              setSessions(localData.sessions);
              setSemesterCourses(localData.semesterCourses);
              if (
                localData.sessions[0].semesters &&
                localData.sessions[0].semesters.length > 0
              ) {
                setActiveSessionId(localData.sessions[0].id);
                setActiveSemesterId(localData.sessions[0].semesters[0].id);
              }
              localStorage.removeItem(LOCAL_STORAGE_KEY);
            } else {
              // Do not overwrite Firestore with empty local data
              const newSession = {
                id: "sess1",
                name: "2021/2022",
                semesters: [
                  { id: "sess1-sem1", name: "Semester 1" },
                  { id: "sess1-sem2", name: "Semester 2" },
                ],
              };
              setSessions([newSession]);
              setSemesterCourses({ "sess1-sem1": [], "sess1-sem2": [] });
              setActiveSessionId("sess1");
              setActiveSemesterId("sess1-sem1");
            }
          }
        } catch (error) {
          console.error("Failed to load user data:", error);
        }
      } else {
        const localData = loadLocalData();
        if (localData) {
          setSessions(localData.sessions);
          setSemesterCourses(localData.semesterCourses);
          if (
            localData.sessions &&
            localData.sessions.length > 0 &&
            localData.sessions[0].semesters &&
            localData.sessions[0].semesters.length > 0
          ) {
            setActiveSessionId(localData.sessions[0].id);
            setActiveSemesterId(localData.sessions[0].semesters[0].id);
          }
        }
      }
    }
    loadData();
  }, [user]);

  // Save data on change to Firestore if logged in, else localStorage (debounced)
  useEffect(() => {
    if (saveTimeout.current) clearTimeout(saveTimeout.current);

    saveTimeout.current = setTimeout(async () => {
      try {
        const isEmptySessions = sessions.length === 0;
        const isEmptyCourses = Object.keys(semesterCourses).length === 0;

        if (user) {
          if (isEmptySessions && isEmptyCourses) return;

          const userDocRef = doc(db, "users", user.uid);
          await setDoc(userDocRef, {
            sessions,
            semesterCourses,
          });
        } else {
          saveLocalData({ sessions, semesterCourses });
        }
      } catch (error) {
        console.error("Failed to save user data:", error);
      }
    }, 1000);

    return () => {
      if (saveTimeout.current) clearTimeout(saveTimeout.current);
    };
  }, [sessions, semesterCourses, user]);

  function calculateGPA(courses: Course[]): number {
    const gradePoints: { [key: string]: number } = {
      A: 5,
      B: 4,
      C: 3,
      D: 2,
      E: 1,
      F: 0,
    };

    let totalUnits = 0;
    let totalPoints = 0;

    for (const course of courses) {
      const points = gradePoints[course.grade.toUpperCase()] ?? 0;
      totalUnits += course.units;
      totalPoints += points * course.units;
    }

    return totalUnits > 0 ? totalPoints / totalUnits : 0;
  }

  const allSemesters: Semester[] = sessions.flatMap(
    (session) => session.semesters
  );
  const gpaData = allSemesters.map((sem) =>
    calculateGPA(semesterCourses[sem.id] || [])
  );
  // Correct CGPA calculation: accumulate total points and total units up to each semester
  const cgpaData: number[] = [];
  let cumulativePoints = 0;
  let cumulativeUnits = 0;
  allSemesters.forEach((sem, idx) => {
    const courses = semesterCourses[sem.id] || [];
    const gradePoints: { [key: string]: number } = {
      A: 5,
      B: 4,
      C: 3,
      D: 2,
      E: 1,
      F: 0,
    };

    let semesterPoints = 0;
    let semesterUnits = 0;

    for (const course of courses) {
      const points = gradePoints[course.grade.toUpperCase()] ?? 0;
      semesterUnits += course.units;
      semesterPoints += points * course.units;
    }

    cumulativePoints += semesterPoints;
    cumulativeUnits += semesterUnits;

    const cgpa = cumulativeUnits > 0 ? cumulativePoints / cumulativeUnits : 0;
    cgpaData.push(cgpa);
  });
  const semesterLabels = allSemesters.map((sem) => sem.name);

  return (
    <div className='flex flex-col min-h-screen'>
      <Header />
      <main className='flex-grow p-6 flex flex-col lg:flex-row gap-6'>
        {/* Left Column */}
        <div className='w-full lg:w-1/2 space-y-4'>
          <IntroMessage />
          <SessionTabs
            sessions={sessions}
            activeSessionId={activeSessionId}
            onSessionChange={(sessionId) => {
              setActiveSessionId(sessionId);
              const lastSemesterId = sessionSemesterMap[sessionId];
              const session = sessions.find((s) => s.id === sessionId);
              if (lastSemesterId) {
                setActiveSemesterId(lastSemesterId);
              } else if (session?.semesters.length) {
                setActiveSemesterId(session.semesters[0].id);
              }
            }}
            onRenameSession={(id, name) => {
              setSessions((prevSessions) =>
                prevSessions.map((session) =>
                  session.id === id ? { ...session, name } : session
                )
              );
            }}>
            <div className='bg-white dark:bg-slate-900 rounded-lg p-4 shadow space-y-4 border border-slate-200 dark:border-slate-800'>
              <SemesterTabs
                semesters={activeSession?.semesters || []}
                activeSemesterId={activeSemesterId}
                onSemesterChange={(semesterId) => {
                  setActiveSemesterId(semesterId);
                  setSessionSemesterMap((prev) => ({
                    ...prev,
                    [activeSessionId]: semesterId,
                  }));
                }}
                onAddSemester={() => {
                  const index = activeSession?.semesters.length || 0;
                  const newSemesterId = `${activeSessionId}-sem${index + 1}`;
                  const newSemester = {
                    id: newSemesterId,
                    name: `Semester ${index + 1}`,
                  };

                  const updatedSessions = sessions.map((s) =>
                    s.id === activeSessionId
                      ? { ...s, semesters: [...s.semesters, newSemester] }
                      : s
                  );

                  setSessions(updatedSessions);
                  setSemesterCourses({
                    ...semesterCourses,
                    [newSemesterId]: [],
                  });
                  setActiveSemesterId(newSemesterId);
                }}>
                {(() => {
                  // Debug logging for why course inputs are not appearing
                  console.log("Rendering inputs for semester:", activeSemesterId);
                  console.log("Courses for semester:", semesterCourses[activeSemesterId]);
                  return (semesterCourses[activeSemesterId] || []).map(
                    (course, index) => (
                      <CourseInput
                        key={course.id}
                        course={course}
                        onChange={(updatedCourse) => {
                          const updated = [
                            ...(semesterCourses[activeSemesterId] || []),
                          ];
                          updated[index] = updatedCourse;
                          setSemesterCourses({
                            ...semesterCourses,
                            [activeSemesterId]: updated,
                          });
                        }}
                        onDelete={() => {
                          const filtered = (
                            semesterCourses[activeSemesterId] || []
                          ).filter((_, i) => i !== index);
                          setSemesterCourses({
                            ...semesterCourses,
                            [activeSemesterId]: filtered,
                          });
                        }}
                      />
                    )
                  );
                })()}
                <div className='flex justify-between items-center gap-2'>
                  <Button
                    variant='destructive'
                    onClick={() => {
                      const updatedSemesters =
                        activeSession?.semesters.filter(
                          (s) => s.id !== activeSemesterId
                        ) || [];
                      if (updatedSemesters.length === 0) return;

                      const updatedSessions = sessions.map((s) =>
                        s.id === activeSessionId
                          ? { ...s, semesters: updatedSemesters }
                          : s
                      );

                      const updatedCourses = { ...semesterCourses };
                      delete updatedCourses[activeSemesterId];

                      setSessions(updatedSessions);
                      setSemesterCourses(updatedCourses);
                      setActiveSemesterId(updatedSemesters[0].id);
                    }}>
                    <Trash2 className='w-4 h-4 mr-2' />
                    Delete Semester
                  </Button>
                  <AddCourseButton
                    onClick={() => {
                      const newCourse: Course = {
                        id: uuidv4(),
                        name: "",
                        grade: "",
                        units: 0,
                      };
                      const updated = [
                        ...(semesterCourses[activeSemesterId] || []),
                        newCourse,
                      ];
                      setSemesterCourses({
                        ...semesterCourses,
                        [activeSemesterId]: updated,
                      });
                    }}
                  />
                </div>
              </SemesterTabs>
            </div>
          </SessionTabs>
          <div className='flex justify-between'>
            <Button
              variant='destructive'
              onClick={() => {
                const remainingSessions = sessions.filter(
                  (s) => s.id !== activeSessionId
                );
                if (remainingSessions.length === 0) return;

                const updatedSemesterCourses = { ...semesterCourses };
                sessions
                  .find((s) => s.id === activeSessionId)
                  ?.semesters.forEach((sem) => {
                    delete updatedSemesterCourses[sem.id];
                  });

                const newActiveSession = remainingSessions[0];
                setSessions(remainingSessions);
                setSemesterCourses(updatedSemesterCourses);
                setActiveSessionId(newActiveSession.id);
                setActiveSemesterId(newActiveSession.semesters[0]?.id || "");
              }}>
              <Trash2 className='w-4 h-4 mr-2' />
              Delete Session
            </Button>
            <AddSessionButton
              onClick={() => {
                const newSessionId = `sess${sessions.length + 1}`;
                const newSemesterId = `${newSessionId}-sem1`;
                const newSession: Session = {
                  id: newSessionId,
                  name: `Session ${newSessionId}`,
                  semesters: [{ id: newSemesterId, name: "Semester 1" }],
                };
                setSessions([...sessions, newSession]);
                setSemesterCourses({
                  ...semesterCourses,
                  [newSemesterId]: [],
                });
                setActiveSessionId(newSessionId);
                setActiveSemesterId(newSemesterId);
              }}
            />
          </div>
        </div>

        {/* Right Column */}
        <div className='flex-1 flex justify-end'>
          <div className='w-full max-w-sm bg-white dark:bg-slate-900 rounded-lg p-4 shadow space-y-6'>
            <CGPASummary
              cgpa={
                cgpaData.length > 0
                  ? parseFloat(cgpaData[cgpaData.length - 1].toFixed(2))
                  : 0
              }
            />
            <GpaChart
              gpaData={gpaData}
              cgpaData={cgpaData}
              semesterLabels={semesterLabels}
              sessionName={activeSession?.name || ""}
            />
            <NotesSection />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default App;
