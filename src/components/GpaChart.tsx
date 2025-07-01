import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Line } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface GpaChartProps {
  gpaData: number[];
  cgpaData: number[];
  semesterLabels: string[];
  sessionSemesters?: string[];
  sessionName?: string;
}

export default function GpaChart({
  gpaData,
  cgpaData,
  semesterLabels,
  sessionSemesters,
  sessionName,
}: GpaChartProps) {
  const filteredLabels: string[] = [];
  const filteredGpa: number[] = [];
  const filteredCgpa: number[] = [];

  if (sessionSemesters && sessionSemesters.length > 0) {
    sessionSemesters.forEach((semesterId) => {
      const index = semesterLabels.findIndex((label) =>
        label.includes(semesterId)
      );
      if (index !== -1) {
        filteredLabels.push(semesterLabels[index]);
        filteredGpa.push(gpaData[index]);
        filteredCgpa.push(cgpaData[index]);
      }
    });
  } else {
    // fallback to full data if no session filtering provided
    filteredLabels.push(...semesterLabels);
    filteredGpa.push(...gpaData);
    filteredCgpa.push(...cgpaData);
  }

  const data = {
    labels: filteredLabels,
    datasets: [
      {
        label: "GPA",
        data: filteredGpa,
        borderColor: "rgb(75, 192, 192)",
        backgroundColor: "rgba(75, 192, 192, 0.2)",
        tension: 0.3,
      },
      {
        label: "CGPA",
        data: filteredCgpa,
        borderColor: "rgb(153, 102, 255)",
        backgroundColor: "rgba(153, 102, 255, 0.2)",
        tension: 0.3,
      },
    ],
  };

  return (
    <div className='w-full max-w-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-lg p-6'>
      <h3 className='text-lg font-bold mb-4 text-slate-800 dark:text-white'>
        Grade Point Average (GPA) {sessionName ? `(${sessionName})` : ""}
      </h3>
      <Line data={data} />
    </div>
  );
}
