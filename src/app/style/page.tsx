// import dynamic from 'next/dynamic';
// import { Suspense } from 'react';

// // ✅ This disables SSR for the component that uses useSearchParams()
// const StyleClient = dynamic(() => import('./StyleClient'), { ssr: false });

// export default function StylePage() {
//   return (
//     <div className="mobile-display">
//       <Suspense fallback={<div>Loading style page...</div>}>
//         <StyleClient />
//       </Suspense>
//     </div>
//   );
// }
