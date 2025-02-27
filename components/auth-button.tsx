"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { Toaster } from "@/components/ui/toaster"

export default function AuthButton() {
  const [ipCode, setIpCode] = useState("")
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [open, setOpen] = useState(false)
  const { toast } = useToast()

  const handleAuthenticate = () => {
    // Simple validation - you can replace this with your actual validation logic
    if (ipCode.trim().length > 0) {
      setIsAuthenticated(true)
      setOpen(false)
      toast({
        title: "Authentication successful",
        description: "You are now authenticated to use the meme generator.",
      })
    } else {
      toast({
        title: "Authentication failed",
        description: "Please enter a valid IP code.",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="flex items-center">
      <Toaster />
      {isAuthenticated ? (
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-green-500"></div>
          <span className="text-sm text-green-600">Authenticated</span>
        </div>
      ) : (
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button variant="outline">Authenticate</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Authentication Required</DialogTitle>
              <DialogDescription>Enter your IP code to access the meme generator.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="ip-code" className="text-right">
                  IP Code
                </Label>
                <Input
                  id="ip-code"
                  value={ipCode}
                  onChange={(e) => setIpCode(e.target.value)}
                  className="col-span-3"
                  placeholder="Enter your IP code"
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" onClick={handleAuthenticate}>
                Authenticate
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}

