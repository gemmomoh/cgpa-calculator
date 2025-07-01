import { Button } from "./ui/button";

interface AddSessionButtonProps {
  onClick: () => void;
}

export default function AddSessionButton({ onClick }: AddSessionButtonProps) {
  return (
    <div className='flex justify-end my-4'>
      <Button variant='default' onClick={onClick}>
        + Add Session
      </Button>
    </div>
  );
}
