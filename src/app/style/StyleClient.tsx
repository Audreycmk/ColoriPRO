'use client';

import styles from './StylePage.module.css';
import { useRouter, useSearchParams } from 'next/navigation';

const styleOptions = [
  'Daily',
  'Sporty',
  'Streetwear',
  'Girly',
  'Cocktail Party',
  'Formal',
];

export default function StyleClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const age = searchParams.get('age') || '';

  const handleStyleClick = (style: string) => {
    const query = new URLSearchParams({
      age,
      styles: style,
    }).toString();
    router.push(`/upload-image/selfie?${query}`);
  };

  return (
    <div className={styles.container}>
      <img src="/ColoriAI.svg" alt="ColoriAI Logo" className={styles.logo} />

      <div className={styles.topBar}>
        <div className={styles.back} onClick={() => router.back()}>&lt;</div>
        <button className={styles.login} onClick={() => router.push('/login')}>
          LOGIN
        </button>
      </div>

      <h2 className={styles.heading}>Favourite Outfit Style?</h2>

      <div className={styles.card}>
        {styleOptions.map((style) => (
          <button
            key={style}
            className={styles.optionButton}
            onClick={() => handleStyleClick(style)}
          >
            {style}
          </button>
        ))}
      </div>

      <p className={styles.slogan}>your Personal AI Stylist</p>
    </div>
  );
}
