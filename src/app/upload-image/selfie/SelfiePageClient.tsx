'use client';

import { useState, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import styles from './SelfiePage.module.css';
import Link from 'next/link';

export default function SelfiePageClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const age = searchParams.get('age') || '';
  const ethnicity = searchParams.get('ethnicity') || '';
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
    setLoading(true);

    const formData = new FormData();
    formData.append('file', imageFile);

    const uploadRes = await fetch('/api/upload-image', {
      method: 'POST',
      body: formData,
    });

    const { imageUrl } = await uploadRes.json();

    const promptRes = await fetch('/api/generate-prompt', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ age, ethnicity, style: stylesParam.split(','), imageUrl }),
    });

    const { imagePrompt } = await promptRes.json();
    setLoading(false);

    router.push(`/report?imageUrl=${encodeURIComponent(imageUrl)}&prompt=${encodeURIComponent(imagePrompt)}`);
  };

  return (
    <div className="mobile-display">
    <div className={`${styles.container} ${imageSrc ? styles.confirmBackground : styles.uploadBackground}`}>
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
        <div className={styles.back} onClick={() => {
          if (imageSrc) {
            setImageSrc(null);
            setImageFile(null);
          } else {
            router.back();
          }
        }}>
          &lt;
        </div>
      </div>

      {/* Logo */}
      <img src="/ColorAI.png" alt="ColoriAI Logo" className={styles.logo} />

      {/* Heading - only if no image yet */}
      {!imageSrc && <h2 className={styles.heading}>Upload a photo</h2>}

      {imageSrc ? (
        <>
          <div className={styles.photoContainer}>
            <img
              src={imageSrc}
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
            <img src="/camera.svg" alt="Camera Icon" />
          </label>

          <button className={styles.uploadBtn} onClick={handleClickChooseAgain}>
            Upload
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
