'use client';

import { useState, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import styles from './SelfiePage.module.css';
import Link from 'next/link';
import Navigation from '@/components/Navigation';

export default function SelfiePageClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const age = searchParams.get('age') || '';
  const stylesParam = searchParams.get('styles') || '';

  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleClickChooseAgain = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => setImageSrc(reader.result as string);
    reader.readAsDataURL(file);
    setImageFile(file);
  };

  const handleContinue = async () => {
    if (!imageSrc) return;
  
    const redirectParams = new URLSearchParams({ 
      age, 
      style: stylesParam,
      returnTo: '/report'
    }).toString();
    router.push(`/loading?${redirectParams}`);
  
    try {
      console.log('🧠 Sending image to /api/generate-prompt...');
      const promptRes = await fetch('/api/generate-prompt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageBase64: imageSrc }),
      });
      
      if (!promptRes.ok) {
        const errorText = await promptRes.text();
        console.error('❌ Gemini API Error Response:', errorText);
        throw new Error(`Gemini API failed with status ${promptRes.status}`);
      }
      
      const { result } = await promptRes.json();
      console.log('🧠 Gemini Result:', result);
  
      if (!result) throw new Error('No prompt result returned');
  
      const match = result.match(/\*\*Image Prompt:\*\*\s*(.+)/i);
      const imagePrompt = match?.[1]?.trim();
  
      if (!imagePrompt || imagePrompt.length < 10) {
        console.error('❌ No valid image prompt found. Gemini result was:', result);
        return;
      }
  
      console.log('🎨 Image Prompt extracted:', imagePrompt);
  
      const imageGenRes = await fetch('/api/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imagePrompt }),
      });
  
      const { imageBase64 } = await imageGenRes.json();
      const outfitImage = `data:image/png;base64,${imageBase64}`;
  
      console.log('🖼️ Generated outfit image:', outfitImage);
  
      // ✅ Save to localStorage before navigating
      localStorage.setItem('reportResult', result);
      localStorage.setItem('outfitImage', outfitImage);
  
      // 🪵 Debug: confirm saved data
      const checkReport = localStorage.getItem('reportResult');
      const checkImage = localStorage.getItem('outfitImage');
      console.log('✅ Confirm reportResult in localStorage:', checkReport?.slice(0, 100) + '...');
      console.log('✅ Confirm outfitImage saved:', checkImage?.slice(0, 30) + '...');
  
      // ✅ Now safe to route to /report
      router.push('/report');
    } catch (err) {
      console.error('❌ Error in handleContinue:', err);
    }
  };
  
  
  

  return (
    <div className="mobile-display">
      <div
        className={`${styles.container} ${
          imageSrc ? styles.confirmBackground : styles.uploadBackground
        }`}
      >
        {/* Navigation */}
        <Navigation />

        {/* Back Button */}
        <div className={styles.topBar}>
          <div
            className={styles.back}
            onClick={() => {
              if (imageSrc) {
                setImageSrc(null);
                setImageFile(null);
              } else {
                router.back();
              }
            }}
          >
            &lt;
          </div>
        </div>

        {/* Logo */}
        <img src="/ColoriAI.png" alt="ColoriAI Logo" className={styles.logo} />

        {/* Heading - only if no image yet */}
        {!imageSrc && <h2 className={styles.heading}>Upload a photo</h2>}

        {imageSrc ? (
          <>
            <div className={styles.photoContainer}>
            <img
            src={imageSrc || '/Demo photo.png'}
            onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = '/Demo photo.png';
            }}
            alt="Selected"
            className={`${styles.photoPreview} ${styles.fadeIn}`}
            crossOrigin="anonymous"
            />

            </div>

            <button className={styles.chooseAgainBtn} onClick={handleClickChooseAgain}>
              Choose Again
            </button>

            <button className={styles.continueBtn} onClick={handleContinue} disabled={loading}>
              {loading ? 'Processing...' : 'Continue'}
            </button>
          </>
        ) : (
          <>
            <label className={styles.cameraCircle} onClick={handleClickChooseAgain}>
              <img src="/Camera.svg" alt="Camera Icon" />
            </label>

            <button className={styles.uploadBtn} onClick={handleClickChooseAgain}>
              Choose a photo
            </button>
          </>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          style={{ display: 'none' }}
          onChange={handleFileSelected}
        />
      </div>
    </div>
  );
}