import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import React from "react";

interface Semester {
  id: string;
  name: string;
}

interface SemesterTabsProps {
  semesters: Semester[];
  activeSemesterId: string;
  onSemesterChange: (id: string) => void;
  onAddSemester?: (newSemester: Semester) => void;
  children?: React.ReactNode;
}

export default function SemesterTabs({
  semesters,
  activeSemesterId,
  onSemesterChange,
  onAddSemester,
  children,
}: SemesterTabsProps) {
  return (
    <Tabs
      value={activeSemesterId}
      onValueChange={onSemesterChange}
      className='w-full space-y-4'>
      <div className='w-full flex items-center justify-between gap-4'>
        <TabsList className='flex-nowrap flex gap-2 overflow-x-auto p-1'>
          {semesters.map((semester) => (
            <TabsTrigger key={semester.id} value={semester.id}>
              {semester.name}
            </TabsTrigger>
          ))}
        </TabsList>
        <Button
          variant='outline'
          onClick={() => {
            if ((semesters?.length ?? 0) >= 3) return;
            const newId = Date.now().toString();
            const newSemester: Semester = {
              id: `sem-${newId}`,
              name: `Semester ${semesters.length + 1}`,
            };
            onAddSemester?.(newSemester);
          }}
          disabled={(semesters?.length ?? 0) >= 3}>
          + Add Semester
        </Button>
      </div>
      <TabsContent value={activeSemesterId}>
        <div className='p-4 border rounded-md bg-slate-50 dark:bg-slate-800'>
          {children}
        </div>
      </TabsContent>
    </Tabs>
  );
}
