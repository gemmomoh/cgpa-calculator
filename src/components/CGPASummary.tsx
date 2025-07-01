import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
interface CGPASummaryProps {
  cgpa: number;
  show?: boolean;
}

export default function CGPASummary({ cgpa, show = true }: CGPASummaryProps) {
  const [visible, setVisible] = useState(show);

  return (
    <div className='w-full max-w-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-lg p-6 relative'>
      <button
        onClick={() => setVisible((prev) => !prev)}
        className='absolute top-3 right-3 text-muted-foreground hover:text-foreground'>
        {visible ? <EyeOff className='w-5 h-5' /> : <Eye className='w-5 h-5' />}
      </button>
      <h3 className='text-lg font-semibold text-slate-800 dark:text-white mb-2'>
        Cumulative GPA
      </h3>
      <p className='text-3xl font-bold text-indigo-600 dark:text-indigo-400'>
        {visible ? cgpa.toFixed(2) : "***"}
      </p>
    </div>
  );
}
