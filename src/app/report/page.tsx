'use client';

import Image from 'next/image';
import Link from 'next/link';
import styles from './ReportPage.module.css';
import { useState, useRef, useEffect } from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import Navigation from '@/components/Navigation';
import { useUser } from '@clerk/nextjs';

export default function ReportPage() {
  const { user } = useUser();
  const faceColor = '#edc1a8';
  const eyeColor = '#6a5554';
  const hairColor = '#3c3334';
  const seasonType = 'Soft Autumn';
  const reportRef = useRef<HTMLDivElement>(null);

  const palette = [
    { name: 'Dusty Rose', hex: '#C0A6A1' },
    { name: 'Sage Green', hex: '#A9C8BD' },
    { name: 'Soft Peach', hex: '#F1C2B2' },
    { name: 'Muted Teal', hex: '#A4B6B4' },
    { name: 'Warm Taupe', hex: '#B5A99D' },
    { name: 'Burnt Sienna', hex: '#A65E2E' },
    { name: 'Olive Green', hex: '#8E7C5B' },
    { name: 'Soft Plum', hex: '#A5788D' },
    { name: 'Rosewood', hex: '#9B6C6C' },
  ];

const [showPopup, setShowPopup] = useState<string | null>(null);
const popupRef = useRef<HTMLDivElement>(null);

const showInfo = (id: string) => {
  setShowPopup(prev => (prev === id ? null : id));
};

useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        popupRef.current &&
        !popupRef.current.contains(event.target as Node)
      ) {
        setShowPopup(null);
      }
    };
  
    if (showPopup) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }
  
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showPopup]);
  
  
  const handleDownload = async () => {
    if (!reportRef.current) return;

    try {
      // Hide popups before capturing
      const currentPopup = showPopup;
      setShowPopup(null);

      // Wait for popups to be hidden
      await new Promise(resolve => setTimeout(resolve, 100));

      const canvas = await html2canvas(reportRef.current, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#FCF2DF'
      });
  
      const imgData = canvas.toDataURL('image/jpeg', 1.0);
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
  
      const imgProps = pdf.getImageProperties(imgData);
      const imgWidth = pageWidth;
      const imgHeight = (imgProps.height * imgWidth) / imgProps.width;
  
      let position = 0;
  
      // First page
      pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
  
      // If content is taller than one page, add more pages
      while (imgHeight - position > pageHeight) {
        position -= pageHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
      }
  
      // Restore popup state
      setShowPopup(currentPopup);
  
      pdf.save('ColoriAI_Report.pdf');
    } catch (err) {
      console.error('PDF generation failed:', err);
      alert('Failed to generate PDF. Please try again.');
    }
  };
  

  return (
    <>
    
    <div className="mobile-display">
    <div className="report-pdf" ref={reportRef}>
      {/* Header */}
      <div className="bg-[#FEDCB6] h-[202px] flex flex-col items-center justify-start px-4 pt-6 sticky top-0 z-10">
        <div className="w-full flex justify-between items-center">
          <Link href="/upload-image">
            <div className={styles.back}>&lt;</div>
          </Link>
          <Navigation />
        </div>

        {/* Logo */}
        <img src="/ColoriAI.png" alt="ColoriAI Logo" className={styles.logo} />

        {/* Title */}
        <p className={styles.seasonalColorReport}>
          Seasonal Color Report
        </p>
      </div>

      {/* Body */}
      <div className="p-6 text-[#3c3334] text-sm font-medium bg-[#FCF2DF] h-[calc(100vh-202px)] overflow-y-auto">
        
      {/* User Info */}
        <div className="mt-[20px] mb-[10px] flex justify-center gap-[50px] text-sm">
  <p>
    <span className="text-black font-[600] text-[18px] leading-none tracking-[1.44px] capitalize font-[Quicksand]">User:</span>{' '}
    <span className="text-black font-[400] text-[18px] leading-none tracking-[1.44px] capitalize font-[Quicksand]">
      {user?.username || user?.firstName || 'User'}
    </span>
  </p>
</div>


    {/* Color Extraction */}
    <div className="mb-8 relative">
    {/* Label and Info icon */}
    <div className="flex justify-center items-center gap-2 mb-2 text-center">
    <p className={styles.reportTitle}>
    COLOR EXTRACTION
    </p>
        <button
        onClick={() => showInfo('color-extraction')}
        className="p-0 mt-[3px] bg-transparent border-none outline-none cursor-pointer"
        style={{ appearance: 'none' }}
        >
  <Image src="/info.svg" alt="info" width={18} height={18} />
</button>

    </div>

  {/* Info popup box */}
  {showPopup === 'color-extraction' && (
  <div
    ref={popupRef}
    className="absolute left-1/2 z-[999] translate-x-[-50%] -top-[50px] text-[12px] text-center"
    style={{
      width: '250px',
      padding: '15px',
      borderRadius: '8px',
      border: '1px solid #B5A99D',
      background: '#FFFBEC',
      boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.25)',
      backdropFilter: 'blur(10px)',
      WebkitBackdropFilter: 'blur(10px)',
    }}
  >
    Colors extracted from your uploaded image.
  </div>
)}


  {/* Color Extraction */}
  <div className="mt-[10px] flex gap-[40px] items-center mb-2 justify-center">
    {[{ label: 'Face', hex: faceColor }, { label: 'Eye', hex: eyeColor }, { label: 'Hair', hex: hairColor }].map(({ label, hex }) => (
      <div key={label} className="text-center">
        <div
          className={"w-[40px] h-[40px] rounded-full mx-auto"}
          style={{ backgroundColor: hex }}
        />
        <div className={styles.colorHex}>
          {label}<br />{hex}
        </div>
      </div>
    ))}
  </div>
</div>


        {/* Seasonal Color Type */}
        <div className="mb-8">
        <div className="flex justify-center items-center gap-2 mb-2 text-center relative">
  <p className={styles.seasonalColorLabel}>Seasonal Color Type:</p>

  {/* Info button */}
  <button
    onClick={() => showInfo('season-type')}
    className="p-0 mt-[10px] bg-transparent border-none outline-none cursor-pointer"
    style={{ appearance: 'none' }}
  >
    <Image src="/info.svg" alt="info" width={18} height={18} />
  </button>

  {/* Popup box */}
  {showPopup === 'season-type' && (
    <div
    ref={popupRef}
    className="absolute left-1/2 z-[999] translate-x-[-50%] -top-[50px] text-[12px] text-center"
    style={{
      width: '250px',
      padding: '15px',
      borderRadius: '8px',
      border: '1px solid #B5A99D',
      background: '#FFFBEC',
      boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.25)',
      backdropFilter: 'blur(10px)',
      WebkitBackdropFilter: 'blur(10px)',
    }}
  >
      <strong>ColoriAI</strong> found a perfect seasonal color type for your unique skin tone.
    </div>
  )}
</div>

<h2 className={styles.colorType}>
  {seasonType.toUpperCase()}
</h2>

        </div>

        {/* Color Palette */}
        <div className="mb-8">
          <div className="flex justify-center items-center gap-2 mb-4 text-center">
            <p className={styles.reportTitle}>YOUR COLOR PALETTE</p>
        
        {/* Info button */}
  <button
    onClick={() => showInfo('color-palette')}
    className="p-0  bg-transparent border-none outline-none cursor-pointer"
    style={{ appearance: 'none' }}
  >
    <Image src="/info.svg" alt="info" width={18} height={18} />
  </button>

{/* Popup box */}
{showPopup === 'color-palette' && (
  <div
    ref={popupRef}
    className="absolute left-1/2 translate-x-[-50%] mt-2 z-10 text-[12px] text-center"
    style={{
      width: '270px',
      padding: '15px',
      borderRadius: '8px',
      border: '1px solid #B5A99D',
      background: '#FFFBEC',
      boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.25)',
      backdropFilter: 'blur(10px)',
      WebkitBackdropFilter: 'blur(10px)',
    }}
  >
    <strong>ColoriAI</strong> generates a color palette <br />
    that looks good on you, based on your Seasonal Color Type.
  </div>
)}
 </div>
    
    {/* Color Palette */}

<div className="grid grid-cols-3" style={{ width: '240px', margin: '0 auto' }}>
  {palette.map((c) => (
    <div key={c.hex} className="text-center leading-tight">
      <div
        className="w-[50px] h-[50px] rounded-[3px] mx-auto"
        style={{ backgroundColor: c.hex }}
      />
      <div className={styles.colorHex}>
        <div>{c.name}</div>
        <div>{c.hex}</div>
      </div>
    </div>
  ))}
</div>


        </div>

        
        {/* Outfit */}
        <div className="mt-[50px] mb-8 text-center">
        <p className={styles.reportTitle}>STYLE: SPORTY</p>
        <Image
            src="/outfit-demo.png"
            alt="Style Outfit"
            width={200}
            height={350}
            className="mx-auto rounded-lg mb-[50px]"
        />
        </div>


      {/* Makeup Suggestion */}
<div className="mt-[20px] mb-8">
  <p className={styles.reportTitle}>MAKEUP SUGGESTION</p>

  <div className="flex flex-col gap-[50px] font-Quicksand">
    {[
      {
        name: 'Etude Double Lasting Foundation',
        link: 'https://etude.com',
        shade: 'NC20',
        image: '/makeup/foundation.png',
      },
      {
        name: 'Laneige Neo Cushion Matte',
        link: 'https://laneige.com',
        shade: '21N',
        image: '/makeup/cushion.png',
      },
      {
        name: '3CE Lip Color - Taupe',
        link: 'https://stylenanda.com',
        shade: '15',
        image: '/makeup/Lip1.png',
      },
      {
        name: 'Rom&nd Juicy Lip - FIGFIG',
        link: 'https://romand.com',
        shade: '06',
        image: '/makeup/Lip2.png',
      },
    ].map((item) => (
      <div key={item.name} className="grid grid-cols-[100px_1fr] items-center pl-[35px]">
        <Image
          src={item.image}
          alt={item.name}
          height={100}
          width={100}
          style={{ height: '100px', width: 'auto' }}
          className="rounded-md mx-auto"
        />
        <div className="text-left">
          <p className="font-medium text-sm">{item.name}</p>
          <p className="text-sm">{item.shade}</p>
          <a
            href={item.link}
            target="_blank"
            className="text-black underline visited:text-black"
          >
            See product
          </a>
        </div>
      </div>
    ))}
  </div>
</div>


        {/* Celebrity Reference */}
        <div className="mb-[30px] mt-[70px]">
          <p className={styles.reportTitle}>CELEBRITY REFERENCE</p>
          <div className="flex gap-[60px] justify-center mt-[30px]">
            {[
              { name: 'Liu Wen', image: '/celeb1.png' },
              { name: 'Tang Wei', image: '/celeb2.png' },
            ].map((c) => (
              <div key={c.name} className="text-center">
                <Image src={c.image} alt={c.name} width={94} height={110} className="rounded-[11px] mx-auto object-cover" />
                <p className="text-xs mt-1">{c.name}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Download Button - Moved to bottom of scrollable content */}
        <div className="flex justify-center mt-[30px] mb-[50px] sticky bottom-0 bg-[#FCF2DF] py-4">
          <button 
            className={styles.downloadBtn} 
            onClick={handleDownload}
            style={{
              position: 'relative',
              zIndex: 20,
            }}
          >
            Download PDF
          </button>
        </div>
        </div>
    


      {/* Info Popup */}
      {showPopup === 'color-extraction' && (
  <div
    className="absolute left-1/2 z-[999] translate-x-[-50%] -top-[85px] px-3 py-2 text-[12px] text-center"
    style={{
      width: '250px',
      borderRadius: '8px',
      border: '1px solid #B5A99D',
      background: '#FFFBEC',
      boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.25)',
      backdropFilter: 'blur(10px)',
      WebkitBackdropFilter: 'blur(10px)',
    }}
  >
    Colors extracted from your uploaded image.
  </div>
)}
    </div>
    </div>
    </>
  );
}