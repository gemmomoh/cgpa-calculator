import { Button } from "./ui/button";

interface AddCourseButtonProps {
  onClick: () => void;
}

export default function AddCourseButton({ onClick }: AddCourseButtonProps) {
  return (
    <div className='flex justify-end my-4'>
      <Button variant='default' onClick={onClick}>
        + Add Course
      </Button>
    </div>
  );
}
