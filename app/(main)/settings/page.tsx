"use client";

import React, { useState } from "react";
import { useAuth } from "@/lib/hooks/use-auth";
import { saveProfile, deleteUserData } from "@/lib/firebase";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import {
  Bell,
  CheckCircle2,
  Clock,
  Download,
  Lock,
  Mail,
  Save,
  Settings,
  Trash2,
  User,
} from "lucide-react";

export default function SettingsPage() {
  const { user, profile, refreshProfile, logout } = useAuth();
  const { toast } = useToast();

  const [displayName, setDisplayName] = useState(user?.displayName || "Learner");
  const [examGoal, setExamGoal] = useState(profile?.examGoal || "AP Calculus BC");
  const [studyMinutes, setStudyMinutes] = useState([profile?.studyTimePerDay || 45]);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [spacedReminders, setSpacedReminders] = useState(true);

  const [saving, setSaving] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) return;

    setSaving(true);
    try {
      await saveProfile(user.id, {
        examGoal,
        studyTimePerDay: studyMinutes[0],
      });
      await refreshProfile();
      toast({
        title: "Settings Saved",
        description: "Your study preferences have been updated successfully.",
      });
    } catch (err) {
      toast({
        title: "Save Failed",
        description: "Could not update settings. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleExportData = () => {
    const data = {
      user: {
        id: user?.id,
        email: user?.email,
        displayName: user?.displayName,
      },
      profile,
      exportedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `maitri-user-data-${user?.id || "export"}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast({
      title: "Data Exported",
      description: "Your learning profile has been exported as JSON.",
    });
  };

  const handleDeleteAccount = async () => {
    if (!user?.id) return;
    setDeleting(true);
    try {
      await deleteUserData(user.id);
      await logout();
      toast({
        title: "Account Data Deleted",
        description: "Your data has been permanently removed.",
      });
      window.location.href = "/";
    } catch (err) {
      toast({
        title: "Delete Failed",
        description: "Could not delete account. Please try again.",
        variant: "destructive",
      });
      setDeleting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in">
      {/* Header */}
      <div className="border-b border-slate-200/80 pb-6">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
          <Settings className="h-7 w-7 text-primary" />
          <span>Account & Study Preferences</span>
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Manage your learning parameters, spaced notifications, and personal profile.
        </p>
      </div>

      <form onSubmit={handleSaveProfile} className="space-y-8">
        {/* Profile Card */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-6 md:p-8 space-y-6">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <User className="h-5 w-5 text-primary" />
            <span>Learner Profile</span>
          </h2>

          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16 border-2 border-slate-200">
              <AvatarImage src={user?.photoURL} />
              <AvatarFallback className="bg-primary/10 text-primary font-bold text-lg">
                {displayName.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-bold text-slate-900 text-base">{displayName}</h3>
              <p className="text-xs text-slate-500">{user?.email || "learner@maitri.ai"}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="displayName" className="text-xs font-semibold text-slate-700">
                Display Name
              </Label>
              <Input
                id="displayName"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="py-5 rounded-xl border-slate-300"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="examGoal" className="text-xs font-semibold text-slate-700">
                Target Exam / Goal
              </Label>
              <Input
                id="examGoal"
                value={examGoal}
                onChange={(e) => setExamGoal(e.target.value)}
                className="py-5 rounded-xl border-slate-300"
              />
            </div>
          </div>
        </div>

        {/* Study Preferences */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-6 md:p-8 space-y-6">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Clock className="h-5 w-5 text-primary" />
            <span>Study Rhythm & Calibration</span>
          </h2>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-semibold text-slate-700">
                Daily Study Target
              </Label>
              <span className="text-sm font-bold text-primary px-3 py-1 bg-blue-50 rounded-full border border-blue-200">
                {studyMinutes[0]} minutes / day
              </span>
            </div>
            <Slider
              value={studyMinutes}
              onValueChange={setStudyMinutes}
              min={15}
              max={180}
              step={15}
              className="py-3"
            />
          </div>

          <div className="space-y-4 pt-2 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-sm font-semibold text-slate-800 block">
                  SM-2 Spaced Retrieval Notifications
                </span>
                <span className="text-xs text-slate-500">
                  Notify when memory decay indicates cards are due for review
                </span>
              </div>
              <Switch checked={spacedReminders} onCheckedChange={setSpacedReminders} />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <span className="text-sm font-semibold text-slate-800 block">
                  Weekly Progress Digest
                </span>
                <span className="text-xs text-slate-500">
                  Receive weekly summary of curriculum mastery trajectory
                </span>
              </div>
              <Switch checked={emailNotifications} onCheckedChange={setEmailNotifications} />
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <Button
            type="submit"
            disabled={saving}
            className="rounded-xl bg-primary hover:bg-primary/90 text-white font-bold px-8 py-6 shadow-sm gap-2"
          >
            <Save className="h-4 w-4" />
            <span>{saving ? "Saving Preferences..." : "Save Preferences"}</span>
          </Button>
        </div>
      </form>

      {/* Data & Privacy Zone */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-6 md:p-8 space-y-6">
        <h2 className="text-lg font-bold text-slate-900">Data Management & Privacy</h2>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200">
          <div>
            <span className="text-sm font-bold text-slate-800 block">Export All Learning Data</span>
            <span className="text-xs text-slate-500">Download all your attempts, states, and profile in JSON format</span>
          </div>
          <Button
            type="button"
            variant="outline"
            onClick={handleExportData}
            className="rounded-xl border-slate-300 gap-2 shrink-0 text-xs font-semibold"
          >
            <Download className="h-4 w-4 text-primary" />
            <span>Export JSON</span>
          </Button>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-red-50/50 border border-red-200">
          <div>
            <span className="text-sm font-bold text-red-900 block">Delete Account & Reset Data</span>
            <span className="text-xs text-red-600">Permanently delete your profile and all learning states</span>
          </div>
          <Button
            type="button"
            variant="destructive"
            onClick={() => setDeleteDialogOpen(true)}
            className="rounded-xl bg-red-600 hover:bg-red-700 gap-2 shrink-0 text-xs font-semibold"
          >
            <Trash2 className="h-4 w-4" />
            <span>Delete Account</span>
          </Button>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md rounded-2xl p-6 md:p-8 space-y-4">
          <DialogHeader className="space-y-2">
            <DialogTitle className="text-xl font-bold text-slate-900">
              Are you absolutely sure?
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500 leading-relaxed">
              This action cannot be undone. This will permanently delete your Maitri account, all recorded attempts, topic mastery states, and scheduled spaced flashcards.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="flex gap-2 pt-2">
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
              className="rounded-xl"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteAccount}
              disabled={deleting}
              className="rounded-xl bg-red-600 hover:bg-red-700"
            >
              {deleting ? "Deleting..." : "Yes, Delete Everything"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
