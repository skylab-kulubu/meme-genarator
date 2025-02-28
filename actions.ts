"use server"

import { sql } from "@vercel/postgres"

export async function mint( owner: string, metadata: object) {
  await sql`INSERT INTO nfts ( owner, metadata)
        VALUES ( ${owner}, ${metadata})`

  // Get the ID of the newly minted NFT
  const result = await sql`
        SELECT id 
        FROM nfts 
         
        AND owner = ${owner} 
        ORDER BY id DESC 
        LIMIT 1`

  return result[0]?.id
}

export async function createCollection(name: string, symbol: string, base_uri?: string) {
      await sql`INSERT INTO collections (name, symbol, base_uri) 
          VALUES (${name}, ${symbol}, ${base_uri})`;
  }

export async function getOwner(collection_id: number, id: number) {
  const result = await sql`
        SELECT owner 
        FROM nfts 
       
        AND id = ${id}`
  return result[0]?.owner
}

export async function getUserNFTs(owner: string) {
  const result = await sql`
        SELECT id, metadata 
        FROM nfts 
        WHERE owner = ${owner}
        ORDER BY id DESC`
  return result
}

