'use client';

import Image from 'next/image';
import Link from 'next/link';
import styles from './ReportPage.module.css';
import { useState, useRef, useEffect } from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import Navigation from '@/components/Navigation';
import { useUser } from '@clerk/nextjs';

interface ColorExtraction {
  label: string;
  hex: string;
}

interface ColorPalette {
  name: string;
  hex: string;
}

interface MakeupProduct {
  brand: string;
  product: string;
  shade: string;
  hex: string;
  url?: string;
}

export default function ReportPage() {
  const { user } = useUser();
  const faceColor = '#edc1a8';
  const eyeColor = '#6a5554';
  const hairColor = '#3c3334';
  const seasonType = 'Soft Autumn';
  const reportRef = useRef<HTMLDivElement>(null);
  const [showPopup, setShowPopup] = useState<string | null>(null);
  const popupRef = useRef<HTMLDivElement>(null);
  const [analysisData, setAnalysisData] = useState<{
    seasonType: string;
    colorExtraction: ColorExtraction[];
    colorPalette: ColorPalette[];
    jewelryTone: { name: string; hex: string };
    hairColors: { name: string; hex: string }[];
    makeup: {
      foundations: MakeupProduct[];
      cushion: MakeupProduct;
      lipsticks: MakeupProduct[];
      blushes: MakeupProduct[];
      eyeshadows: MakeupProduct[];
    };
    celebrities: string[];
  } | null>(null);

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

  useEffect(() => {
    const reportResult = localStorage.getItem('reportResult');
    if (reportResult) {
      try {
        // Parse the Gemini response
        const lines = reportResult.split('\n');
        let currentSection = '';
        const data: any = {
          colorExtraction: [],
          colorPalette: [],
          hairColors: [],
          makeup: {
            foundations: [],
            cushion: null,
            lipsticks: [],
            blushes: [],
            eyeshadows: []
          },
          celebrities: []
        };

        for (const line of lines) {
          const trimmedLine = line.trim();
          if (!trimmedLine) continue;

          if (trimmedLine.includes('**Seasonal Color Type:**')) {
            const parts = trimmedLine.split('**Seasonal Color Type:**');
            if (parts[1]) {
              data.seasonType = parts[1].trim();
            }
          }
          else if (trimmedLine.includes('**Color Extraction (CSV):**')) {
            currentSection = 'colorExtraction';
          }
          else if (trimmedLine.includes('**9-Color Seasonal Palette (CSV):**')) {
            currentSection = 'colorPalette';
          }
          else if (trimmedLine.includes('**Jewelry Tone:**')) {
            const parts = trimmedLine.split('**Jewelry Tone:**');
            if (parts[1]) {
              const [name, hex] = parts[1].trim().split(',');
              if (name && hex) {
                data.jewelryTone = { name: name.trim(), hex: hex.trim() };
              }
            }
          }
          else if (trimmedLine.includes('**2 Flattering Hair Colors (CSV):**')) {
            currentSection = 'hairColors';
          }
          else if (trimmedLine.includes('**Foundations:**')) {
            currentSection = 'foundations';
          }
          else if (trimmedLine.includes('**Korean Cushion:**')) {
            currentSection = 'cushion';
          }
          else if (trimmedLine.includes('**Lipsticks:**')) {
            currentSection = 'lipsticks';
          }
          else if (trimmedLine.includes('**Blushes:**')) {
            currentSection = 'blushes';
          }
          else if (trimmedLine.includes('**Eyeshadow Palettes:**')) {
            currentSection = 'eyeshadows';
          }
          else if (trimmedLine.includes('**2 Similar Celebrities:**')) {
            currentSection = 'celebrities';
          }
          else if (!trimmedLine.startsWith('**')) {
            if (currentSection === 'colorExtraction' && trimmedLine.includes(',')) {
              const [label, hex] = trimmedLine.split(',');
              if (label && hex && label !== 'Label' && hex !== 'HEX') {
                data.colorExtraction.push({ label: label.trim(), hex: hex.trim() });
              }
            }
            else if (currentSection === 'colorPalette' && trimmedLine.includes(',')) {
              const [name, hex] = trimmedLine.split(',');
              if (name && hex && name !== 'Name' && hex !== 'HEX') {
                data.colorPalette.push({ name: name.trim(), hex: hex.trim() });
              }
            }
            else if (currentSection === 'hairColors' && trimmedLine.includes(',')) {
              const [name, hex] = trimmedLine.split(',');
              if (name && hex && name !== 'Name' && hex !== 'HEX') {
                data.hairColors.push({ name: name.trim(), hex: hex.trim() });
              }
            }
            else if (currentSection === 'foundations' && trimmedLine.includes(',')) {
              const parts = trimmedLine.split(',');
              if (parts.length >= 4 && parts[0] !== 'Brand') {
                data.makeup.foundations.push({
                  brand: parts[0].trim(),
                  product: parts[1]?.trim() || '',
                  shade: parts[2]?.trim() || '',
                  hex: parts[3].trim(),
                  url: parts[4]?.trim()
                });
              }
            }
            else if (currentSection === 'cushion' && trimmedLine.includes(',')) {
              const parts = trimmedLine.split(',');
              if (parts.length >= 3 && parts[0] !== 'Brand') {
                data.makeup.cushion = {
                  brand: parts[0].trim(),
                  product: parts[1]?.trim() || '',
                  shade: '',
                  hex: parts[2].trim(),
                  url: parts[3]?.trim()
                };
              }
            }
            else if (currentSection === 'lipsticks' && trimmedLine.includes(',')) {
              const [brand, hex] = trimmedLine.split(',');
              if (brand && hex && brand !== 'Brand') {
                data.makeup.lipsticks.push({
                  brand: brand.trim(),
                  product: '',
                  shade: '',
                  hex: hex.trim()
                });
              }
            }
            else if (currentSection === 'blushes' && trimmedLine.includes(',')) {
              const [brand, hex] = trimmedLine.split(',');
              if (brand && hex && brand !== 'Brand') {
                data.makeup.blushes.push({
                  brand: brand.trim(),
                  product: '',
                  shade: '',
                  hex: hex.trim()
                });
              }
            }
            else if (currentSection === 'eyeshadows' && trimmedLine.includes(',')) {
              const parts = trimmedLine.split(',');
              if (parts.length >= 3 && parts[0] !== 'Brand') {
                data.makeup.eyeshadows.push({
                  brand: parts[0].trim(),
                  product: parts[1]?.trim() || '',
                  shade: '',
                  hex: parts[2].trim()
                });
              }
            }
            else if (currentSection === 'celebrities' && trimmedLine.startsWith('-')) {
              const name = trimmedLine.replace('-', '').trim();
              if (name) {
                data.celebrities.push(name);
              }
            }
          }
        }

        // Validate required data
        if (!data.seasonType || !data.colorExtraction.length || !data.colorPalette.length) {
          throw new Error('Missing required data in Gemini response');
        }

        setAnalysisData(data);
      } catch (error) {
        console.error('Error parsing Gemini result:', error);
        // Set default data if parsing fails
        setAnalysisData({
          seasonType: 'Soft Autumn',
          colorExtraction: [
            { label: 'Face', hex: '#edc1a8' },
            { label: 'Eye', hex: '#6a5554' },
            { label: 'Hair', hex: '#3c3334' }
          ],
          colorPalette: palette,
          jewelryTone: { name: 'Rose Gold', hex: '#B76E79' },
          hairColors: [
            { name: 'Warm Brown', hex: '#8B4513' },
            { name: 'Copper Red', hex: '#B87333' }
          ],
          makeup: {
            foundations: [],
            cushion: {
              brand: 'Laneige',
              product: 'Neo Cushion Matte',
              shade: '21N',
              hex: '#F5D0C5',
              url: 'https://laneige.com'
            },
            lipsticks: [],
            blushes: [],
            eyeshadows: []
          },
          celebrities: ['Liu Wen', 'Tang Wei']
        });
      }
    }
  }, []);

  const showInfo = (id: string) => {
    setShowPopup(prev => (prev === id ? null : id));
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(event.target as Node)) {
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
      const currentPopup = showPopup;
      setShowPopup(null);
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
      pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
  
      while (imgHeight - position > pageHeight) {
        position -= pageHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
      }
  
      setShowPopup(currentPopup);
      pdf.save('ColoriAI_Report.pdf');
    } catch (err) {
      console.error('PDF generation failed:', err);
      alert('Failed to generate PDF. Please try again.');
    }
  };

  if (!analysisData) {
    return <div>Loading...</div>;
  }

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
      {analysisData.colorExtraction.map(({ label, hex }) => (
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
  {analysisData.seasonType.toUpperCase()}
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
  {analysisData.colorPalette.map((c) => (
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
      {analysisData.celebrities.map((name) => (
        <div key={name} className="grid grid-cols-[100px_1fr] items-center pl-[35px]">
          <Image
            src={`/celeb${name.replace(' ', '').toLowerCase()}.png`}
            alt={name}
            height={100}
            width={100}
            style={{ height: '100px', width: 'auto' }}
            className="rounded-md mx-auto"
          />
          <div className="text-left">
            <p className="font-medium text-sm">{name}</p>
          </div>
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