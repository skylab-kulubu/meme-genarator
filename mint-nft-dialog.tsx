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
import { Loader2 } from "lucide-react"
import { mint, createCollection } from "./actions"
import { useToast } from "@/components/ui/use-toast"

interface MintNFTDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  memeImageUrl: string
  memeName: string
  textElements: any[]
}

export function MintNFTDialog({ open, onOpenChange, memeImageUrl, memeName, textElements }: MintNFTDialogProps) {
  const [walletAddress, setWalletAddress] = useState("")
  const [collectionId, setCollectionId] = useState("1")
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const handleMint = async () => {
    if (!walletAddress.trim()) {
      toast({
        title: "Error",
        description: "Please enter a wallet address",
        variant: "destructive",
      })
      return
    }

    try {
      setIsLoading(true)

      // Create metadata for the NFT
      const metadata = {
        name: memeName,
        image: memeImageUrl,
        description: `Meme created with Meme Generator`,
        attributes: [
          {
            trait_type: "Text Elements",
            value: textElements.length,
          },
        ],
        textElements: textElements,
      }

        await sql`INSERT INTO users(address) VALUES (${walletAddress})`


      // Mint the NFT
      const nftId = await mint(walletAddress, metadata)

      toast({
        title: "Success!",
        description: `Your meme has been minted as NFT #${nftId}`,
      })

      onOpenChange(false)
    } catch (error) {
      console.error("Error minting NFT:", error)
      toast({
        title: "Error",
        description: "Failed to mint NFT. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Mint as NFT</DialogTitle>
          <DialogDescription>Convert your meme into an NFT on the blockchain</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="wallet">Wallet Address</Label>
            <Input
              id="wallet"
              value={walletAddress}
              onChange={(e) => setWalletAddress(e.target.value)}
              placeholder="Enter your wallet address"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="collection">Collection ID</Label>
            <Input
              id="collection"
              value={collectionId}
              onChange={(e) => setCollectionId(e.target.value)}
              placeholder="Enter collection ID"
              type="number"
            />
          </div>
          <div className="aspect-video relative">
            <img
              src={memeImageUrl || "/placeholder.svg"}
              alt={memeName}
              className="rounded-md w-full h-full object-contain border"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleMint} disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Minting...
              </>
            ) : (
              "Mint NFT"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

