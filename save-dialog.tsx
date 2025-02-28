"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface SaveDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (name: string) => void
}

export function SaveDialog({ open, onOpenChange, onSave }: SaveDialogProps) {
  const [memeName, setMemeName] = useState("")

  const handleSave = () => {
    if (!memeName.trim()) return
    onSave(memeName)
    setMemeName("")
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Save Meme</DialogTitle>
          <DialogDescription>Give your meme a name to save it to your profile</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Meme Name</Label>
            <Input
              id="name"
              value={memeName}
              onChange={(e) => setMemeName(e.target.value)}
              placeholder="Enter a name for your meme"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save Meme</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

