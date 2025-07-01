import { Trash } from "lucide-react";
import { Button } from "../components/ui/button";

interface Course {
  id: string;
  name: string;
  grade: string;
  units: number;
}

interface CourseInputProps {
  course: Course;
  onChange: (updatedCourse: Course) => void;
  onDelete: () => void;
}

export default function CourseInput({
  course,
  onChange,
  onDelete,
}: CourseInputProps) {
  const handleChange = (field: keyof Course, value: string | number) => {
    if (field === "units") {
      const parsed = typeof value === "string" ? parseInt(value) : value;
      onChange({ ...course, [field]: isNaN(parsed) ? 0 : parsed });
    } else {
      onChange({ ...course, [field]: value });
    }
  };

  return (
    <div className='flex flex-col md:flex-row items-start md:items-center gap-2 border p-4 rounded-md shadow-sm bg-white dark:bg-slate-900'>
      <input
        type='text'
        placeholder='Course Name'
        className='border px-3 py-2 rounded-md w-full md:w-1/3'
        value={course.name}
        onChange={(e) => handleChange("name", e.target.value)}
      />
      <select
        className='border px-3 py-2 rounded-md w-full md:w-1/4'
        value={course.grade}
        onChange={(e) => handleChange("grade", e.target.value)}>
        <option value=''>Select Grade</option>
        <option value='A'>A</option>
        <option value='B'>B</option>
        <option value='C'>C</option>
        <option value='D'>D</option>
        <option value='E'>E</option>
        <option value='F'>F</option>
      </select>
      <input
        type='number'
        placeholder='Units'
        className='border px-3 py-2 rounded-md w-full md:w-1/6'
        value={course.units}
        onChange={(e) => handleChange("units", e.target.value)}
        min={0}
      />
      <div className='hidden md:block h-6 border-l border-slate-300 dark:border-slate-700 mx-2' />
      <div className='md:ml-auto'>
        <Button variant='destructive' onClick={onDelete} size='icon'>
          <Trash className='w-4 h-4' />
        </Button>
      </div>
    </div>
  );
}
