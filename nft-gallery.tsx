"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { getUserNFTs } from "./actions"
import { Loader2 } from "lucide-react"

export function NFTGallery() {
  const [walletAddress, setWalletAddress] = useState("")
  const [userNFTs, setUserNFTs] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const fetchUserNFTs = async () => {
    if (!walletAddress.trim()) return

    try {
      setIsLoading(true)
      const nfts = await getUserNFTs(walletAddress)
      setUserNFTs(nfts)
    } catch (error) {
      console.error("Error fetching NFTs:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Your NFT Collection</CardTitle>
        <CardDescription>View all your minted meme NFTs</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex space-x-2">
          <div className="flex-1">
            <Input
              placeholder="Enter your wallet address"
              value={walletAddress}
              onChange={(e) => setWalletAddress(e.target.value)}
            />
          </div>
          <Button onClick={fetchUserNFTs} disabled={isLoading}>
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "View NFTs"}
          </Button>
        </div>

        <ScrollArea className="h-[400px] pr-4">
          {userNFTs.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {isLoading ? "Loading..." : "No NFTs found for this wallet address"}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {userNFTs.map((nft) => {
                const metadata = typeof nft.metadata === "string" ? JSON.parse(nft.metadata) : nft.metadata

                return (
                  <div key={nft.id} className="border rounded-lg p-4 space-y-4">
                    <div className="aspect-video relative">
                      <img
                        src={metadata.image || "/placeholder.svg"}
                        alt={metadata.name}
                        className="rounded-md w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <h3 className="font-medium">{metadata.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        NFT #{nft.id} • Collection #{nft.collection_id}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  )
}

