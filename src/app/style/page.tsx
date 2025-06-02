'use client';
import styles from './StylePage.module.css';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import TransitionWrapper from '@/components/TransitionWrapper';

const styleOptions = [
  'Daily',
  'Girly',
  'Sporty',
  'Streetwear',
  'Cocktail Party',
  'Formal',
];

export default function StylePage() {
  const router = useRouter();

  const handleStyleClick = () => {
    router.push('/upload-image/selfie');
  };

  return (
    <TransitionWrapper>
    <div className="mobile-display">
      <div className={styles.container}>
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

        {/* Top Bar */}
        <div className={styles.topBar}>
          <div className={styles.back} onClick={() => router.push('/age')}>
            &lt;
          </div>
        </div>

        {/* Heading */}
        <h2 className={styles.heading}>Your Style?</h2>

        {/* Options */}
        <div className={styles.card}>
          {styleOptions.map((style) => (
            <button
              key={style}
              className={styles.optionButton}
              onClick={handleStyleClick}
            >
              {style}
            </button>
          ))}
        </div>

        {/* Slogan */}
        <p className={styles.slogan}>Discover your seasonal color match through fashion.</p>
      </div>
    </div>
  </TransitionWrapper>
  );
}
