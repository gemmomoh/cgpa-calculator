import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  collection,
  addDoc,
  query,
  where,
  onSnapshot,
  orderBy,
  deleteDoc,
  doc,
  Timestamp,
} from "firebase/firestore";
import { db } from "@/firebase";
import { useAuth } from "@/contexts/AuthContext";

interface Note {
  id: string;
  content: string;
  createdAt: Timestamp;
}

export default function NotesSection() {
  const { user } = useAuth();
  const [notes, setNotes] = useState<Note[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setNotes([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const notesRef = collection(db, "users", user.uid, "notes");
    const q = query(notesRef, orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const fetchedNotes: Note[] = [];
        snapshot.forEach((doc) => {
          const data = doc.data();
          fetchedNotes.push({
            id: doc.id,
            content: data.content,
            createdAt: data.createdAt,
          });
        });
        setNotes(fetchedNotes);
        setLoading(false);
      },
      (error) => {
        console.error("Error fetching notes: ", error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user]);

  const addNote = async () => {
    const trimmed = input.trim();
    if (trimmed.length === 0 || !user) return;

    const notesRef = collection(db, "users", user.uid, "notes");
    try {
      await addDoc(notesRef, {
        content: trimmed,
        createdAt: Timestamp.now(),
      });
      setInput("");
    } catch (error) {
      console.error("Error adding note: ", error);
    }
  };

  const deleteNote = async (id: string) => {
    if (!user) return;
    try {
      const noteDoc = doc(db, "users", user.uid, "notes", id);
      await deleteDoc(noteDoc);
    } catch (error) {
      console.error("Error deleting note: ", error);
    }
  };

  if (!user) {
    return (
      <Card className="notes-section bg-slate-50 dark:bg-slate-800 p-4 text-center">
        <p className="text-gray-600 dark:text-gray-400">
          Please sign in to manage your notes.
        </p>
      </Card>
    );
  }

  return (
    <Card className="notes-section bg-slate-50 dark:bg-slate-800">
      <CardHeader>
        <CardTitle>Notes</CardTitle>
      </CardHeader>
      <CardContent>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          rows={4}
          placeholder="Write your note here..."
          className="w-full rounded-md border border-gray-300 p-2 mb-2 resize-none dark:bg-slate-900 dark:text-white"
        />
        <Button
          onClick={addNote}
          disabled={input.trim().length === 0}
          className="mb-4"
        >
          Add Note
        </Button>
        {loading ? (
          <p className="text-center text-gray-500 dark:text-gray-400">Loading notes...</p>
        ) : (
          <ul className="space-y-2 max-h-48 overflow-y-auto">
            {notes.length === 0 && (
              <li className="text-gray-500">No notes yet.</li>
            )}
            {notes.map(({ id, content, createdAt }) => (
              <li
                key={id}
                className="bg-white dark:bg-slate-700 p-2 rounded shadow"
              >
                <div className="flex justify-between items-start">
                  <span className="whitespace-pre-wrap">{content}</span>
                  <Button
                    variant="destructive"
                    size="icon"
                    onClick={() => deleteNote(id)}
                    aria-label="Delete note"
                    className="ml-2"
                  >
                    &times;
                  </Button>
                </div>
                <p className="text-xs text-right text-gray-500 dark:text-gray-400 mt-1">
                  {createdAt.toDate().toLocaleDateString()}
                </p>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
