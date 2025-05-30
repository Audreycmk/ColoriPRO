// src/app/upload-image/selfie/page.tsx
'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useState, useRef } from 'react';
import ColorThief from 'colorthief';

export default function UploadSelfiePage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const age = searchParams.get('age') || '';
  const ethnicity = searchParams.get('ethnicity') || '';
  const styles = searchParams.get('styles') || '';

  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [faceHex, setFaceHex] = useState<string>('');
  const [eyeHex, setEyeHex] = useState<string>('');
  const [hairHex, setHairHex] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setImageSrc(reader.result as string);
    reader.readAsDataURL(file);
  };

  const extractColor = async () => {
    if (imgRef.current) {
      const colorThief = new ColorThief();

      if (!imgRef.current.complete) {
        await new Promise((resolve) => (imgRef.current!.onload = resolve));
      }

      const [r, g, b] = colorThief.getColor(imgRef.current);
      const hex = `#${[r, g, b].map((x) => x.toString(16).padStart(2, '0')).join('')}`;

      setFaceHex(hex);
      setEyeHex(hex);
      setHairHex(hex);
    }
  };

  const handleAnalyze = async () => {
    if (!faceHex || !eyeHex || !hairHex) return;
    setLoading(true);

    const response = await fetch('/api/generate-prompt', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ faceHex, eyeHex, hairHex, age, ethnicity, style: styles.split(',') })
    });

    const data = await response.json();
    setResult(data.result);
    setLoading(false);

    // Extract the image prompt line
    const imagePrompt = data.imagePrompt;


    if (imagePrompt) {
      const imgRes = await fetch('/api/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imagePrompt })
      });

      const imgData = await imgRes.json();
      setImageUrl(imgData.imageUrl);
    }
  };

  return (
    <div style={{ padding: '2rem' }}>
      <button onClick={() => router.back()} style={{ marginBottom: '1rem' }}>← Back</button>
      <h2>Upload Selfie</h2>
      <input type="file" accept="image/*" onChange={handleImageUpload} />

      {imageSrc && (
        <>
          <img
            src={imageSrc}
            ref={imgRef}
            alt="preview"
            width="300"
            crossOrigin="anonymous"
            style={{ marginTop: '1rem', borderRadius: '10px' }}
          />
          <div style={{ marginTop: '1rem' }}>
            <button onClick={extractColor}>Extract Colors</button>
          </div>

          <div style={{ marginTop: '1rem' }}>
            <label>Face Color:</label>
            <input type="color" value={faceHex} onChange={(e) => setFaceHex(e.target.value)} />
            <span>{faceHex}</span>
          </div>
          <div>
            <label>Eye Color:</label>
            <input type="color" value={eyeHex} onChange={(e) => setEyeHex(e.target.value)} />
            <span>{eyeHex}</span>
          </div>
          <div>
            <label>Hair Color:</label>
            <input type="color" value={hairHex} onChange={(e) => setHairHex(e.target.value)} />
            <span>{hairHex}</span>
          </div>
        </>
      )}

      <div style={{ marginTop: '2rem' }}>
        <button onClick={handleAnalyze} disabled={!faceHex || !eyeHex || !hairHex || loading}>
          {loading ? 'Analyzing...' : 'Send to GPT'}
        </button>
      </div>

      {result && (
        <div style={{ marginTop: '2rem', whiteSpace: 'pre-wrap' }}>
          <h3>Result</h3>
          <p>{result}</p>
        </div>
      )}

      {imageUrl && (
        <div style={{ marginTop: '2rem' }}>
          <h3>Generated Visual Mockup</h3>
          <img src={imageUrl} alt="Color palette mockup" style={{ maxWidth: '100%' }} />
        </div>
      )}
    </div>
  );
}
