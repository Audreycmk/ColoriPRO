// src/components/SelfiePageClient.tsx
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

    setLoading(true); // Set loading state

    // Redirect to loading page immediately for better UX
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

      const match = result.match(/\*\*Image Prompt:\*\*\s*(.+)/); // Remove 's' flag to fix linting error
      const imagePrompt = match?.[1]?.trim();

      if (!imagePrompt || imagePrompt.length < 10) {
        console.error('❌ No valid image prompt found. Gemini result was:', result);
        // Handle error: maybe redirect to an error page
        router.push('/error?message=Could not generate style prompt.');
        return;
      }

      console.log('🎨 Image Prompt extracted:', imagePrompt);

      // --- MODIFICATION: Call the new server-side upload route ---
      const imageGenRes = await fetch('/api/generate-and-upload-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imagePrompt }),
      });

      if (!imageGenRes.ok) {
        const errorText = await imageGenRes.text();
        console.error('❌ Image Generation/Upload API Error Response:', errorText);
        throw new Error(`Image generation/upload API failed`);
      }
      
      // --- MODIFICATION: Get the Cloudinary URL from the response ---
      const { imageUrl } = await imageGenRes.json();
      console.log('🖼️ Generated outfit image URL from Cloudinary:', imageUrl);

      // --- MODIFICATION: Save the report text and the new image URL ---
      localStorage.setItem('reportResult', result);
      localStorage.setItem('generatedImageUrl', imageUrl); // Use a consistent key

      // Now it's safe to route to the final report page
      router.push('/report');

    } catch (err) {
      console.error('❌ Error in handleContinue:', err);
      setLoading(false); // Turn off loading on error
      // Redirect to an error page or show a user-friendly message
      router.push(`/error?message=${(err as Error).message}`);
    }
  };

  return (
    <div className="mobile-display">
      <div
        className={`${styles.container} ${
          imageSrc ? styles.confirmBackground : styles.uploadBackground
        }`}
      >
        <Navigation />

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

        <img src="/ColoriAI.png" alt="ColoriAI Logo" className={styles.logo} />

        {!imageSrc && <h2 className={styles.heading}>Upload a photo</h2>}

        {imageSrc ? (
          <>
            <div className={styles.photoContainer}>
              <img
                src={imageSrc}
                alt="Selected"
                className={`${styles.photoPreview} ${styles.fadeIn}`}
              />
            </div>
            <button className={styles.chooseAgainBtn} onClick={handleClickChooseAgain}>
              Choose Again
            </button>
            <button className={styles.continueBtn} onClick={handleContinue} disabled={loading}>
              {loading ? 'ANALYZING...' : 'Continue'}
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