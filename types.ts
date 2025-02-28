export interface TextElement {
  id: string
  text: string
  x: number
  y: number
  rotation: number
  fontSize: number
  color: string
}

export interface MemeTemplate {
  id: string
  name: string
  url: string
  thumbnail?: string
}

export interface SavedMeme {
  id: string
  name: string
  imageUrl: string
  textElements: TextElement[]
  createdAt: string
}

export interface NFT {
  id: number
  collection_id: number
  owner: string
  metadata: {
    name: string
    image: string
    description: string
    attributes: Array<{
      trait_type: string
      value: string | number
    }>
    textElements?: TextElement[]
  }
}

