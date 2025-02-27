// lib/nft.ts
import { neon } from '@neondatabase/serverless'; // Replace with your actual SQL client helper.
import { getAddress } from '@chopinframework/next';

const sql = neon(`${process.env.DATABASE_URL}`);/**
 * Create a new NFT collection.
 */
export async function createCollection(name: string, symbol: string, base_uri?: string) {
  await sql`
    INSERT INTO collections (name, symbol, base_uri) 
    VALUES (${name}, ${symbol}, ${base_uri})
  `;
}

/**
 * Mint a new NFT.
 * @param collection_id - The ID of the collection to which the NFT belongs.
 * @param owner - The owner’s address.
 * @param metadata - The metadata for the NFT (e.g. image URL, title, description).
 */
export async function mint(
  collection_id: number, 
  owner: string,
  metadata: object
) {
  await sql`
    INSERT INTO nfts (collection_id, owner, metadata)
    VALUES (${collection_id}, ${owner}, ${metadata})
  `;
}

/**
 * Get the current owner of an NFT.
 */
export async function getOwner(collection_id: number, id: number) {
  const result = await sql`
    SELECT owner 
    FROM nfts 
    WHERE collection_id = ${collection_id} AND id = ${id}
  `;
  return result[0]?.owner;
}

/**
 * Transfer an NFT from the current owner to another address.
 */
export async function transfer(
  to: string,
  collection_id: number,
  id: number
) {
  const from = getAddress();
  const owner = await getOwner(collection_id, id);
  
  if (owner !== from) {
    throw new Error('Not the owner');
  }

  await sql`
    UPDATE nfts 
    SET owner = ${to} 
    WHERE collection_id = ${collection_id} 
      AND id = ${id} 
      AND owner = ${from}
  `;
}
