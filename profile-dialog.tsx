"use client"

import { useState } from "react"
import { format } from "date-fns"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Trash2, Download, User } from "lucide-react"
import type { SavedMeme } from "./types"

interface ProfileDialogProps {
  savedMemes: SavedMeme[]
  onDeleteMeme: (id: string) => void
  onDownloadMeme: (meme: SavedMeme) => void
}

export function ProfileDialog({ savedMemes, onDeleteMeme, onDownloadMeme }: ProfileDialogProps) {
  const [open, setOpen] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon">
          <User className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl h-[80vh]">
        <DialogHeader>
          <DialogTitle>My Memes</DialogTitle>
          <DialogDescription>View and manage your saved memes</DialogDescription>
        </DialogHeader>
        <ScrollArea className="h-full pr-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-4">
            {savedMemes.length === 0 ? (
              <div className="col-span-full text-center py-8 text-muted-foreground">
                No saved memes yet. Create and save some memes to see them here!
              </div>
            ) : (
              savedMemes.map((meme) => (
                <div key={meme.id} className="border rounded-lg p-4 space-y-4">
                  <div className="aspect-video relative group">
                    <img
                      src={meme.imageUrl || "/placeholder.svg"}
                      alt={meme.name}
                      className="rounded-md w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <Button size="icon" variant="secondary" onClick={() => onDownloadMeme(meme)}>
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button size="icon" variant="destructive" onClick={() => onDeleteMeme(meme.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">{meme.name}</h3>
                      <p className="text-sm text-muted-foreground">{format(new Date(meme.createdAt), "PPP")}</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}

