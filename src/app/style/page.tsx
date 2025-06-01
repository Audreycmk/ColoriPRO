'use client';
import styles from './StylePage.module.css';
import { useRouter } from 'next/navigation';

const styleOptions = [
  'Daily',
  'Girly',
  'Sporty',
  'Chic',
  'Elegant',
  'Edgy'
];

export default function StylePage() {
  const router = useRouter();

  const handleStyleClick = (style: string) => {
    router.push(`/upload?style=${encodeURIComponent(style)}`);
  };

  return (
    <div className="mobile-display">
      <div className={styles.container}>
        <img src="/ColoriAI.svg" alt="ColoriAI Logo" className={styles.logo} />

        <div className={styles.topBar}>
          <div className={styles.back} onClick={() => router.push('/age')}>&lt;</div>
          <button className={styles.login} onClick={() => router.push('/login')}>LOGIN</button>
        </div>

        <h2 className={styles.heading}>Select Your Style</h2>

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

        <p className={styles.slogan}>Discover your seasonal color match through fashion.</p>
      </div>
    </div>
  );
}
