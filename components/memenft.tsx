'use client';
import React, { useState } from 'react';

interface MemeNFTProps {
  memeUrl: string;
}

export default function MemeNFT({ memeUrl }: MemeNFTProps) {
  const [isMinting, setIsMinting] = useState(false);
  const [mintResult, setMintResult] = useState<any>(null);

  const handleMint = async () => {
    setIsMinting(true);
    try {
      const res = await fetch('/api/nft', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          memeImage: memeUrl,
          title: 'Meme NFT',
          description: 'A meme turned into an NFT'
        })
      });
      const data = await res.json();
      setMintResult(data);
    } catch (error) {
      console.error('Error minting NFT:', error);
    } finally {
      setIsMinting(false);
    }
  };

  return (
    <div>
      <img src={memeUrl} alt="Meme" style={{ maxWidth: '100%' }} />
      <button onClick={handleMint} disabled={isMinting}>
        {isMinting ? 'Minting NFT...' : 'Mint NFT'}
      </button>
      {mintResult && (
        <div>
          {mintResult.success ? (
            <>
              <h2>NFT Minted Successfully!</h2>
              <p>{mintResult.message}</p>
            </>
          ) : (
            <>
              <h2>Minting Failed</h2>
              <p>Error: {mintResult.error}</p>
            </>
          )}
        </div>
      )}
    </div>
  );
}
