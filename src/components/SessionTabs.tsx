import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import React from "react";
import { Pencil } from "lucide-react";

interface Semester {
  id: string;
  name: string;
}

interface Session {
  id: string;
  name: string;
  semesters: Semester[];
}

interface SessionTabsProps {
  sessions: Session[];
  activeSessionId: string;
  onSessionChange: (id: string) => void;
  onRenameSession: (id: string, name: string) => void;
  children?: React.ReactNode;
}

function formatSessionName(session: Session, index: number) {
  const baseYear = 2020 + index;
  return `${baseYear}/${baseYear + 1}`;
}

export default function SessionTabs({
  sessions,
  activeSessionId,
  onSessionChange,
  onRenameSession,
  children,
}: SessionTabsProps) {
  const [editingSessionId, setEditingSessionId] = React.useState<string | null>(
    null
  );

  React.useEffect(() => {
    setEditingSessionId(null);
  }, [activeSessionId]);

  return (
    <Tabs
      value={activeSessionId}
      onValueChange={onSessionChange}
      className='w-full space-y-4'>
      <TabsList className='w-full flex-nowrap flex justify-start gap-2 overflow-x-auto p-1'>
        {sessions.map((session, index) => (
          <TabsTrigger key={session.id} value={session.id}>
            {activeSessionId === session.id ? (
              <div className='flex items-center gap-2'>
                {editingSessionId === session.id ? (
                  <input
                    type='text'
                    value={session.name}
                    onChange={(e) =>
                      onRenameSession(session.id, e.target.value)
                    }
                    onClick={(e) => e.stopPropagation()}
                    onBlur={() => setEditingSessionId(null)}
                    onFocus={(e) => e.target.select()}
                    className='bg-transparent border border-input rounded px-2 py-1 text-sm max-w-[120px]'
                  />
                ) : (
                  <>
                    <span>{formatSessionName(session, index)}</span>
                    <span
                      role='button'
                      tabIndex={0}
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingSessionId(session.id);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          setEditingSessionId(session.id);
                        }
                      }}
                      className='text-muted-foreground hover:text-foreground cursor-pointer'
                      aria-label='Edit session name'>
                      <Pencil className='w-4 h-4' />
                    </span>
                  </>
                )}
              </div>
            ) : (
              <span>{formatSessionName(session, index)}</span>
            )}
          </TabsTrigger>
        ))}
      </TabsList>
      <TabsContent value={activeSessionId}>{children}</TabsContent>
    </Tabs>
  );
}
