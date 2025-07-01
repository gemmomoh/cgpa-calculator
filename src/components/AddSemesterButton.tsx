

import { Button } from "../components/ui/button"

interface AddSemesterButtonProps {
  onClick: () => void;
}

export default function AddSemesterButton({ onClick }: AddSemesterButtonProps) {
  return (
    <div className="flex justify-center my-4">
      <Button variant="default" onClick={onClick}>
        + Add Semester
      </Button>
    </div>
  );
}