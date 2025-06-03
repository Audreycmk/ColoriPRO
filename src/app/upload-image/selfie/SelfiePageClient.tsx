'use client';

import { useState, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import styles from './SelfiePage.module.css';
import Link from 'next/link';

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
    if (!imageFile) return;
  
    const redirectParams = new URLSearchParams({ age, style: stylesParam }).toString();
    router.push(`/loading?${redirectParams}`);
  
    try {
      const formData = new FormData();
      formData.append('file', imageFile);
  
      console.log('📤 Uploading image...');
  
      const uploadRes = await fetch('/api/upload-image', {
        method: 'POST',
        body: formData,
      });
  
      if (!uploadRes.ok) {
        const text = await uploadRes.text();
        console.error('❌ Upload error:', text);
        return;
      }
  
      const { imageUrl } = await uploadRes.json();
      if (!imageUrl) throw new Error('Upload failed to return imageUrl');
  
      console.log('✅ Uploaded image URL:', imageUrl);
  
      console.log('🧠 Sending image to /api/generate-prompt...');
      const promptRes = await fetch('/api/generate-prompt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ age, style: stylesParam.split(','), imageUrl }),
      });
  
      const { result } = await promptRes.json();
      console.log('🧠 GPT Result:', result);
  
      if (!result) throw new Error('No prompt result returned');
  
      const match = result.match(/\*\*Image Prompt:\*\*\s*(.+)/i);
      const imagePrompt = match?.[1]?.trim();
  
      if (!imagePrompt || imagePrompt.length < 10) {
        console.error('❌ No valid image prompt found. GPT result was:', result);
        return;
      }
  
      console.log('🎨 Image Prompt extracted:', imagePrompt);
  
      const imageGenRes = await fetch('/api/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imagePrompt }),
      });
  
      const { imageUrl: outfitImage } = await imageGenRes.json();
      if (!outfitImage) throw new Error('Image generation failed');
  
      console.log('🖼️ Generated outfit image:', outfitImage);
  
      localStorage.setItem('reportResult', result);
      localStorage.setItem('outfitImage', outfitImage);
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
        {/* Login Button */}
        <div
          style={{
            position: 'absolute',
            top: '1rem',
            right: '1rem',
            zIndex: 10,
          }}
        >
          <Link href="/login">
            <button className="login">LOGIN</button>
          </Link>
        </div>

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
