'use client';
import styles from './AgePage.module.css';
import { useRouter } from 'next/navigation';


const ageOptions = [
  'Under 18',
  '18-25',
  '26 - 35',
  '36-50',
  '50+',
  'Prefer not to say'
];

export default function AgePage() {
  const router = useRouter();

  const handleAgeClick = (age: string) => {
    router.push(`/style?age=${encodeURIComponent(age)}`);
  };

  return (
    <div className="mobile-display">
    <div className={styles.container}>
      <img src="/ColoriAI.svg" alt="ColoriAI Logo" className={styles.logo} />

      <div className={styles.topBar}>
        <div className={styles.back} onClick={() => router.back()}>&lt;</div>
        <button className={styles.login} onClick={() => router.push('/login')}>LOGIN</button>
      </div>

      <h2 className={styles.heading}>Your Age Group</h2>

      <div className={styles.card}>
        {ageOptions.map((age) => (
          <button
            key={age}
            className={styles.optionButton}
            onClick={() => handleAgeClick(age)}
          >
            {age}
          </button>
        ))}
      </div>

      <p className={styles.slogan}>your Personal AI Stylist</p>
    </div>
    </div>
  );
}
