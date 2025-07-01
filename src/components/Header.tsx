import React, { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { Button } from "../components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu";
import { User, LogOut, Settings } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Check, ChevronsUpDown } from "lucide-react";
import { getFirestore, doc, setDoc, getDoc } from "firebase/firestore";
import { app } from "../firebase";
import universityList from "@/data/universityList.json";

const db = getFirestore(app);

export default function Header() {
  const { user, logout, signInWithGoogle } = useAuth();
  const [showEditModal, setShowEditModal] = useState(false);
  const [open, setOpen] = useState(false);

  // Form state
  const [universityName, setUniversityName] = useState("");
  const [useCustomUniversity, setUseCustomUniversity] = useState(false);
  const [department, setDepartment] = useState("");
  const [fullName, setFullName] = useState(user?.displayName || "");
  const [level, setLevel] = useState("100");
  const [matricNumber, setMatricNumber] = useState("");
  const [session, setSession] = useState("");
  const [duration, setDuration] = useState("4");
  const [cgpaGoal, setCgpaGoal] = useState("");
  const [syncToCloud, setSyncToCloud] = useState(false);

  // University list for Combobox

  // Open modal and prefill with user data from Firestore or localStorage
  const openEditModal = async () => {
    if (syncToCloud && user) {
      try {
        const docRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setUniversityName(data.universityName || "");
          setDepartment(data.department || "");
          setFullName(data.fullName || "");
          setLevel(data.level || "100");
          setMatricNumber(data.matricNumber || "");
          setSession(data.session || "");
          setDuration(data.duration || "4");
          setCgpaGoal(data.cgpaGoal || "");
        }
      } catch (error) {
        console.error("Failed to load Firestore data:", error);
      }
    } else {
      try {
        const stored = localStorage.getItem("cgpaUserData");
        if (stored) {
          const data = JSON.parse(stored);
          setUniversityName(data.universityName || "");
          setDepartment(data.department || "");
          setFullName(data.fullName || "");
          setLevel(data.level || "100");
          setMatricNumber(data.matricNumber || "");
          setSession(data.session || "");
          setDuration(data.duration || "4");
          setCgpaGoal(data.cgpaGoal || "");
        }
      } catch (error) {
        console.error("Failed to load local data:", error);
      }
    }
    setShowEditModal(true);
  };

  const closeEditModal = () => {
    setShowEditModal(false);
  };

  const saveProfile = async () => {
    const userData = {
      fullName,
      universityName,
      department,
      level,
      matricNumber,
      session,
      duration,
      cgpaGoal,
      updatedAt: new Date().toISOString(),
    };

    if (syncToCloud && user) {
      try {
        await setDoc(doc(db, "users", user.uid), userData);
        console.log("User data saved to Firestore.");
      } catch (error) {
        console.error("Error saving to Firestore:", error);
      }
    } else {
      try {
        localStorage.setItem("cgpaUserData", JSON.stringify(userData));
        console.log("User data saved locally.");
      } catch (error) {
        console.error("Error saving locally:", error);
      }
    }

    setShowEditModal(false);
  };

  return (
    <>
      <header className='w-full px-6 py-4 border-b bg-white dark:bg-slate-950 flex items-center justify-between shadow-sm'>
        <h1 className='text-xl font-bold text-slate-900 dark:text-white'>
          🎓 Gabriel&apos;s Calculate ya GPA
        </h1>

        <nav className='flex items-center gap-2'>
          {/* Optional links */}
          <Button variant='ghost' className='text-sm font-medium'>
            About
          </Button>
          <Button variant='ghost' className='text-sm font-medium'>
            How it works
          </Button>

          {/* Login / Logout */}
          {!user ? (
            <Button
              variant='default'
              className='text-sm font-semibold'
              onClick={signInWithGoogle}>
              Login
            </Button>
          ) : (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className='focus:outline-none'>
                  <Avatar className='w-10 h-10'>
                    <AvatarImage
                      src={user.photoURL || undefined}
                      alt='Profile pic'
                    />
                    <AvatarFallback>
                      {user.displayName?.[0] || user.email?.[0]}
                    </AvatarFallback>
                  </Avatar>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align='end' className='w-48'>
                <DropdownMenuItem className='cursor-default select-none'>
                  <User className='mr-2 h-4 w-4' />
                  {user.displayName || user.email}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={openEditModal}>
                  <Settings className='mr-2 h-4 w-4' />
                  Edit Profile
                </DropdownMenuItem>
                <DropdownMenuItem onClick={logout}>
                  <LogOut className='mr-2 h-4 w-4' />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </nav>
      </header>

      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent className='bg-white dark:bg-slate-800'>
          <DialogHeader>
            <DialogTitle>Edit Profile</DialogTitle>
            <DialogDescription>
              Update your academic details below.
            </DialogDescription>
          </DialogHeader>

          <div className='space-y-4'>
            <div>
              <div className='flex items-center justify-between'>
                <label className='block text-sm font-medium text-slate-700 dark:text-gray-300'>
                  University Name
                </label>
                <Button
                  type='button'
                  variant='outline'
                  className='text-xs px-2 py-1'
                  onClick={() => setUseCustomUniversity(!useCustomUniversity)}>
                  {useCustomUniversity ? "Choose from list" : "Enter manually"}
                </Button>
              </div>
              {useCustomUniversity ? (
                <input
                  type='text'
                  className='mt-2 block w-full rounded border border-gray-300 p-2 dark:bg-slate-900 dark:text-white'
                  value={universityName}
                  onChange={(e) => setUniversityName(e.target.value)}
                  placeholder='Enter your university name'
                />
              ) : (
                <Popover open={open} onOpenChange={setOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant='outline'
                      role='combobox'
                      aria-expanded={open}
                      className='mt-2 w-full justify-between'>
                      {universityName || "Search or select your university"}
                      <ChevronsUpDown className='ml-2 h-4 w-4 shrink-0 opacity-50' />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className='w-full p-0'>
                    <Command>
                      <CommandInput placeholder='Search university...' />
                      <CommandEmpty>No university found.</CommandEmpty>
                      <CommandList>
                        <CommandGroup>
                          {universityList.map((option) => (
                            <CommandItem
                              key={option}
                              value={option}
                              onSelect={() => {
                                setUniversityName(option);
                                setOpen(false);
                              }}>
                              <Check
                                className={`mr-2 h-4 w-4 ${
                                  universityName === option
                                    ? "opacity-100"
                                    : "opacity-0"
                                }`}
                              />
                              {option}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              )}
            </div>

            <div>
              <label className='block text-sm font-medium text-slate-700 dark:text-gray-300'>
                Department
              </label>
              <input
                type='text'
                className='mt-1 block w-full rounded border border-gray-300 p-2 dark:bg-slate-900 dark:text-white'
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                placeholder='Enter your department'
              />
            </div>

            {/* Full Name */}
            <div>
              <label className='block text-sm font-medium text-slate-700 dark:text-gray-300'>
                Full Name
              </label>
              <input
                type='text'
                className='mt-1 block w-full rounded border border-gray-300 p-2 dark:bg-slate-900 dark:text-white'
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder='Enter your full name'
              />
            </div>

            {/* Level / Year of Study */}
            <div>
              <label className='block text-sm font-medium text-slate-700 dark:text-gray-300'>
                Level / Year of Study
              </label>
              <select
                className='mt-1 block w-full rounded border border-gray-300 p-2 dark:bg-slate-900 dark:text-white'
                value={level}
                onChange={(e) => setLevel(e.target.value)}>
                <option value='100'>100</option>
                <option value='200'>200</option>
                <option value='300'>300</option>
                <option value='400'>400</option>
                <option value='500'>500</option>
              </select>
            </div>

            {/* Matric Number / Student ID */}
            <div>
              <label className='block text-sm font-medium text-slate-700 dark:text-gray-300'>
                Matric Number / Student ID
              </label>
              <input
                type='text'
                className='mt-1 block w-full rounded border border-gray-300 p-2 dark:bg-slate-900 dark:text-white'
                value={matricNumber}
                onChange={(e) => setMatricNumber(e.target.value)}
                placeholder='Enter your Matric Number or Student ID'
              />
            </div>

            {/* Academic Session */}
            <div>
              <label className='block text-sm font-medium text-slate-700 dark:text-gray-300'>
                Start Year
              </label>
              <input
                type='text'
                className='mt-1 block w-full rounded border border-gray-300 p-2 dark:bg-slate-900 dark:text-white'
                value={session}
                onChange={(e) => setSession(e.target.value)}
                placeholder='e.g. 2023'
              />
            </div>

            {/* Course Duration */}
            <div>
              <label className='block text-sm font-medium text-slate-700 dark:text-gray-300'>
                Course Duration
              </label>
              <select
                className='mt-1 block w-full rounded border border-gray-300 p-2 dark:bg-slate-900 dark:text-white'
                value={duration}
                onChange={(e) => setDuration(e.target.value)}>
                <option value='4'>4 years</option>
                <option value='5'>5 years</option>
                <option value='6'>6 years</option>
              </select>
            </div>

            {/* CGPA Goal */}
            <div>
              <label className='block text-sm font-medium text-slate-700 dark:text-gray-300'>
                CGPA Goal
              </label>
              <input
                type='number'
                step='0.01'
                min='0'
                max='5'
                className='mt-1 block w-full rounded border border-gray-300 p-2 dark:bg-slate-900 dark:text-white'
                value={cgpaGoal}
                onChange={(e) => setCgpaGoal(e.target.value)}
                placeholder='e.g. 4.50'
              />
            </div>

            {/* Allow data sync to cloud */}
            <div className='flex items-center'>
              <input
                id='syncToCloud'
                type='checkbox'
                checked={syncToCloud}
                onChange={(e) => setSyncToCloud(e.target.checked)}
                className='h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 dark:bg-slate-900 dark:border-gray-600'
              />
              <label
                htmlFor='syncToCloud'
                className='ml-2 block text-sm text-slate-700 dark:text-gray-300'>
                Allow data sync to cloud
              </label>
            </div>

            <div className='flex justify-end gap-4 pt-2'>
              <Button variant='outline' onClick={() => setShowEditModal(false)}>
                Cancel
              </Button>
              <Button onClick={saveProfile}>Save</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
