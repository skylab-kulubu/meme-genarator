// app/api/nft/route.ts
import { NextResponse } from 'next/server';
import { getAddress } from '@chopinframework/next';
import { mint } from '@/lib/nft';

export async function POST(request: Request) {
  try {
    const { memeImage, title, description } = await request.json();

    // Get the current user’s address
    const owner = getAddress();

    // Use your default collection (e.g. collection id 1)
    const collection_id = 1;

    // Prepare metadata as a JSON object.
    const metadata = {
      image: memeImage,
      title,
      description,
    };

    // Mint the NFT
    await mint(collection_id, owner, metadata);

    return NextResponse.json({
      success: true,
      message: 'NFT minted successfully'
    });
  } catch (error: any) {
    console.error('Error minting NFT:', error);
    return NextResponse.json({
      success: false,
      error: error.message
    });
  }
}
