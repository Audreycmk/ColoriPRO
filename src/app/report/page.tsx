'use client';

import Image from 'next/image';
import Link from 'next/link';
import styles from './ReportPage.module.css';
import { useState, useRef, useEffect } from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import Navigation from '@/components/Navigation';
import { useUser } from '@clerk/nextjs';
import Cookies from 'js-cookie';

// Define explicit interfaces for better type safety
interface ColorExtraction {
  label: string;
  hex: string;
}

interface ColorPalette {
  name: string;
  hex: string;
}

interface HairColor {
  name: string;
  hex: string;
}

interface JewelryTone {
  name: string;
  hex: string;
}

interface MakeupProduct {
  brand: string;
  product: string;
  shade?: string; // Shade can be optional as not always provided
  hex?: string;   // Hex can be optional for eyeshadows without specific shades
  url?: string;
}

interface MakeupCushion {
  brand: string;
  product: string;
  shade?: string;
  hex?: string;
  url?: string;
}

interface AnalysisData {
  seasonType: string;
  colorExtraction: ColorExtraction[];
  colorPalette: ColorPalette[];
  hairColors: HairColor[];
  jewelryTone: JewelryTone | null;
  makeup: {
    foundations: MakeupProduct[];
    cushion: MakeupCushion | null;
    lipsticks: MakeupProduct[];
    blushes: MakeupProduct[];
    eyeshadows: MakeupProduct[];
  };
  celebrities: string[];
  imagePrompt?: string;
  generatedImageUrl?: string; // This property is updated from localStorage directly
}


export default function ReportPage() {
  const { user } = useUser();
  const reportRef = useRef<HTMLDivElement>(null);
const [showPopup, setShowPopup] = useState<string | null>(null);
const popupRef = useRef<HTMLDivElement>(null);
  const [analysisData, setAnalysisData] = useState<AnalysisData | null>(null);
  const [styleOption, setStyleOption] = useState<string>('');
  const [outfitImageUrl, setOutfitImageUrl] = useState<string | null>(null); // State for the generated outfit image URL
  const [imageError, setImageError] = useState(false); // State for image loading error
  const [selectedStyle, setSelectedStyle] = useState<string>('Sporty');

  useEffect(() => {
    // Get style option from cookies
    const savedStyle = Cookies.get('styleOption');
    if (savedStyle) {
      setStyleOption(savedStyle.toUpperCase());
    }

    // Get the latest report result from localStorage
    const reportResult = localStorage.getItem('reportResult');
    if (reportResult) {
      try {
        console.log('Raw Gemini Result:', reportResult); // Debug log

        const parseGeminiResponse = (responseText: string): AnalysisData => {
          const lines = responseText.split('\n');
          const data: AnalysisData = {
            seasonType: 'Unknown',
            colorExtraction: [],
            colorPalette: [],
            hairColors: [],
            makeup: { foundations: [], cushion: null, lipsticks: [], blushes: [], eyeshadows: [] },
            celebrities: [],
            jewelryTone: null
          };

          let currentSection = '';

          for (const line of lines) {
            const trimmedLine = line.trim();
            if (!trimmedLine) continue;

            // Check for section headers
            if (trimmedLine.includes('1. **Seasonal Color Type:**')) {
              data.seasonType = trimmedLine.split('**Seasonal Color Type:**')[1]?.trim() || 'Unknown';
            }
            else if (trimmedLine.includes('2. **Color Extraction (CSV):**')) {
              currentSection = 'colorExtraction';
            }
            else if (trimmedLine.includes('3. **9-Color Seasonal Palette (CSV):**')) {
              currentSection = 'colorPalette';
            }
            else if (trimmedLine.includes('4. **Jewelry Tone:**')) {
              const parts = trimmedLine.split('**Jewelry Tone:**')[1]?.trim().split(',');
              if (parts && parts.length >= 2) {
                data.jewelryTone = { name: parts[0].trim(), hex: parts[1].trim() };
              }
            }
            else if (trimmedLine.includes('5. **2 Flattering Hair Colors (CSV):**')) {
              currentSection = 'hairColors';
            }
            else if (trimmedLine.includes('6. **Makeup Suggestions:**')) {
              currentSection = 'makeup';
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
            else if (trimmedLine.includes('7. **2 Similar Celebrities:**')) {
              currentSection = 'celebrities';
            }
            // Skip header rows
            else if (trimmedLine.toLowerCase().includes('label,hex') || 
                     trimmedLine.toLowerCase().includes('name,hex') ||
                     trimmedLine.toLowerCase().includes('brand,product,shade,hex,url')) {
              continue;
            }
            // Process data rows
            else if (currentSection === 'colorExtraction' && trimmedLine.includes(',')) {
              const [label, hex] = trimmedLine.split(',').map(s => s.trim());
              if (label && hex) {
                data.colorExtraction.push({ label, hex });
              }
            }
            else if (currentSection === 'colorPalette' && trimmedLine.includes(',')) {
              const [name, hex] = trimmedLine.split(',').map(s => s.trim());
              if (name && hex) {
                data.colorPalette.push({ name, hex });
              }
            }
            else if (currentSection === 'hairColors' && trimmedLine.includes(',')) {
              const [name, hex] = trimmedLine.split(',').map(s => s.trim());
              if (name && hex) {
                data.hairColors.push({ name, hex });
              }
            }
            else if (currentSection === 'foundations' && trimmedLine.startsWith('-')) {
              const parts = trimmedLine.replace('-', '').split(',').map(s => s.trim());
              if (parts.length >= 4) {
                const url = parts[4]?.match(/\[([^\]]+)\]\(([^)]+)\)/)?.[2] || '';
                data.makeup.foundations.push({
                  brand: parts[0],
                  product: parts[1],
                  shade: parts[2],
                  hex: parts[3],
                  url
                });
              }
            }
            else if (currentSection === 'cushion' && trimmedLine.startsWith('-')) {
              const parts = trimmedLine.replace('-', '').split(',').map(s => s.trim());
              if (parts.length >= 3) {
                const url = parts[3]?.match(/\[([^\]]+)\]\(([^)]+)\)/)?.[2] || '';
                data.makeup.cushion = {
                  brand: parts[0],
                  product: parts[1],
                  shade: parts[2],
                  hex: parts[3],
                  url
                };
              }
            }
            else if (currentSection === 'lipsticks' && trimmedLine.startsWith('-')) {
              const parts = trimmedLine.replace('-', '').split(',').map(s => s.trim());
              if (parts.length >= 3) {
                const url = parts[3]?.match(/\[([^\]]+)\]\(([^)]+)\)/)?.[2] || '';
                data.makeup.lipsticks.push({
                  brand: parts[0],
                  product: parts[1],
                  shade: parts[2],
                  hex: parts[3],
                  url
                });
              }
            }
            else if (currentSection === 'blushes' && trimmedLine.startsWith('-')) {
              const parts = trimmedLine.replace('-', '').split(',').map(s => s.trim());
              if (parts.length >= 3) {
                const url = parts[3]?.match(/\[([^\]]+)\]\(([^)]+)\)/)?.[2] || '';
                data.makeup.blushes.push({
                  brand: parts[0],
                  product: parts[1],
                  shade: parts[2],
                  hex: parts[3],
                  url
                });
              }
            }
            else if (currentSection === 'eyeshadows' && trimmedLine.startsWith('-')) {
              const parts = trimmedLine.replace('-', '').split(',').map(s => s.trim());
              if (parts.length >= 2) {
                const url = parts[2]?.match(/\[([^\]]+)\]\(([^)]+)\)/)?.[2] || '';
                data.makeup.eyeshadows.push({
                  brand: parts[0],
                  product: parts[1],
                  url
                });
              }
            }
            else if (currentSection === 'celebrities' && trimmedLine.startsWith('-')) {
              const name = trimmedLine.replace('-', '').trim();
              if (name && !data.celebrities.includes(name)) {
                data.celebrities.push(name);
              }
            }
          }

          console.log('Parsed Data:', data);
          return data;
        };

        const parsedData = parseGeminiResponse(reportResult);
        console.log('Parsed Analysis Data:', parsedData); // Debug log

        // Update the state with new data
        setAnalysisData(parsedData);
      } catch (error) {
        console.error('Error parsing Gemini result:', error);
      }
    } else {
      console.warn('No report result found in localStorage');
    }

    // --- Image URL Handling ---
    // Initialize image state
    setOutfitImageUrl(null); // Clear previous image
    setImageError(false); // Reset error state

    const checkForOutfitImage = () => {
      const storedImageUrl = localStorage.getItem('generatedImageUrl');
      if (storedImageUrl && storedImageUrl !== outfitImageUrl) {
        console.log('New outfit image URL detected:', storedImageUrl); // Debug log
        setOutfitImageUrl(storedImageUrl);
      }
    };

    // Check immediately
    checkForOutfitImage();

    // Set up interval to check for image (in case it loads after initial render)
    const intervalId = setInterval(checkForOutfitImage, 1000); // Check every second

    // Clear interval on component unmount
    return () => clearInterval(intervalId);
  }, []); // Empty dependency array means this runs once on mount


  // Function to handle showing/hiding popups
  const showInfo = (popupType: string) => {
    setShowPopup(showPopup === popupType ? null : popupType);
  };

  // Function to handle downloading the report as PDF
  const handleDownload = async () => {
    if (reportRef.current) {
      try {
        // Temporarily hide elements that shouldn't appear in the PDF if necessary
        const navigationElement = document.querySelector(`.${styles.back}, .${styles.logo}, .${styles.seasonalColorReport}, .mobile-display`);
        // Example: If these elements are outside reportRef, you don't need to hide them for html2canvas
        // If they are *inside* reportRef and you want to exclude them, you'd need more complex logic
        // For simplicity, assuming reportRef contains only the report content to be captured.

      const canvas = await html2canvas(reportRef.current, {
          scale: 2, // Increase scale for better quality PDF
          allowTaint: true, // Allow images from other origins
          useCORS: true, // Enable CORS for images
          logging: false, // Disable logging
          backgroundColor: '#FCF2DF', // Match the background color of the report body
          scrollY: -window.scrollY, // Correct scrolling if the page is scrolled
          windowWidth: reportRef.current.scrollWidth, // Capture full width
          windowHeight: reportRef.current.scrollHeight, // Capture full height
        });

        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'a4'); // 'p' for portrait, 'mm' for millimeters, 'a4' size
        const imgWidth = 210; // A4 width in mm
        const pageHeight = 297; // A4 height in mm
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        let heightLeft = imgHeight;
      let position = 0;
  
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
  
        while (heightLeft >= 0) {
          position = heightLeft - imgHeight;
        pdf.addPage();
          pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
          heightLeft -= pageHeight;
        }

        pdf.save('ColoriAI_Seasonal_Color_Report.pdf');

        // Restore any hidden elements (if you implemented hiding logic)
        // if (navigationElement) { /* Revert changes */ }

      } catch (error) {
        console.error('Error generating PDF:', error);
      alert('Failed to generate PDF. Please try again.');
      }
    }
  };


  useEffect(() => {
    // Close popup if clicked outside
    const handleClickOutside = (event: MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(event.target as Node)) {
        setShowPopup(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [popupRef]);


  if (!analysisData) {
    return <div>Loading Report...</div>;
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

              {/* Info popup box (kept the first one) */}
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

              {/* Color Extraction display */}
  <div className="mt-[10px] flex gap-[40px] items-center mb-2 justify-center">
                {analysisData?.colorExtraction?.map((color: ColorExtraction) => (
                  <div key={color.label} className="text-center">
        <div
          className={"w-[40px] h-[40px] rounded-full mx-auto"}
                      style={{ backgroundColor: color.hex }}
        />
        <div className={styles.colorHex}>
                      {color.label}<br />{color.hex}
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
                  className="p-0 bg-transparent border-none outline-none cursor-pointer"
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
    
              {/* Color Palette display */}
<div className="grid grid-cols-3" style={{ width: '240px', margin: '0 auto' }}>
                {analysisData?.colorPalette?.map((c: ColorPalette) => (
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
        <p className={styles.reportTitle}>STYLE: {selectedStyle.toUpperCase()}</p>
              <div className="relative flex flex-col items-center justify-center min-h-[350px]">
                {!outfitImageUrl ? (
                  <div className="flex flex-col items-center justify-center h-[350px] w-full">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mb-4"></div>
                    <p className="text-gray-600">Generating your outfit...</p>
                  </div>
                ) : (
                  <a
                    href={outfitImageUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block hover:opacity-90 transition-opacity w-full flex flex-col items-center"
                  >
                    <div className="w-full flex justify-center">
        <Image
                        src={outfitImageUrl}
                        alt={`${styleOption} Style Outfit`}
            width={200}
            height={350}
                        className="rounded-lg mb-[50px] object-contain"
                        onError={() => {
                          setImageError(true);
                        }}
                        priority // Prioritize loading of this image
        />
        </div>
                    <span className="text-sm text-blue-600 hover:underline">Click to view full size</span>
                  </a>
                )}
                {imageError && (
                  <div className="text-red-500 mt-4">
                    Failed to load image. Please try refreshing the page.
                  </div>
                )}
              </div>
            </div>

            {/* Jewelry Tone */}
            {analysisData.jewelryTone && (
                <div className="mb-8">
                    <p className={styles.reportTitle}>JEWELRY TONE</p>
                    <div className="text-center mt-2">
                        <p className="font-Quicksand font-medium text-lg capitalize">
                            {analysisData.jewelryTone.name} ({analysisData.jewelryTone.hex})
                        </p>
                        <div
                            className="w-[50px] h-[50px] rounded-full mx-auto mt-2"
                            style={{ backgroundColor: analysisData.jewelryTone.hex }}
                        ></div>
                    </div>
                </div>
            )}

            {/* Hair Colors */}
            {analysisData.hairColors && analysisData.hairColors.length > 0 && (
                <div className="mb-8">
                    <p className={styles.reportTitle}>FLATTERING HAIR COLORS</p>
                    <div className="flex justify-center gap-8 mt-2">
                        {analysisData.hairColors.map((hairColor: HairColor) => (
                            <div key={hairColor.hex} className="text-center">
                                <div
                                    className="w-[50px] h-[50px] rounded-full mx-auto"
                                    style={{ backgroundColor: hairColor.hex }}
                                ></div>
                                <div className={styles.colorHex}>
                                    {hairColor.name}<br />{hairColor.hex}
        </div>
      </div>
    ))}
  </div>
                </div>
            )}

            {/* Makeup Suggestions */}
            <div className="mt-[20px] mb-8">
              <p className={styles.reportTitle}>MAKEUP SUGGESTIONS</p>

              {/* Foundations */}
              {analysisData.makeup.foundations.length > 0 && (
                <div className="mb-4">
                  <h3 className="font-semibold text-base mb-2">Foundations:</h3>
                  {analysisData.makeup.foundations.map((item: MakeupProduct, index: number) => (
                    <div key={index} className="flex items-center gap-2 mb-1">
                      <div
                        className="w-[20px] h-[20px] rounded-full"
                        style={{ backgroundColor: item.hex || '#CCCCCC' }} // Default grey if no hex
                      ></div>
                      <p className="text-sm">
                        {item.brand}, {item.product}, {item.shade} ({item.hex})
                        {item.url && <a href={item.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline ml-2 text-xs">(Link)</a>}
                      </p>
                    </div>
                  ))}
                </div>
              )}

              {/* Korean Cushion */}
              {analysisData.makeup.cushion && (
                <div className="mb-4">
                  <h3 className="font-semibold text-base mb-2">Korean Cushion:</h3>
                  <div className="flex items-center gap-2 mb-1">
                    <div
                      className="w-[20px] h-[20px] rounded-full"
                      style={{ backgroundColor: analysisData.makeup.cushion.hex || '#CCCCCC' }}
                    ></div>
                    <p className="text-sm">
                      {analysisData.makeup.cushion.brand}, {analysisData.makeup.cushion.product}, {analysisData.makeup.cushion.shade} ({analysisData.makeup.cushion.hex})
                      {analysisData.makeup.cushion.url && <a href={analysisData.makeup.cushion.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline ml-2 text-xs">(Link)</a>}
                    </p>
                  </div>
                </div>
              )}

              {/* Lipsticks */}
              {analysisData.makeup.lipsticks.length > 0 && (
                <div className="mb-4">
                  <h3 className="font-semibold text-base mb-2">Lipsticks:</h3>
                  {analysisData.makeup.lipsticks.map((item: MakeupProduct, index: number) => (
                    <div key={index} className="flex items-center gap-2 mb-1">
                      <div
                        className="w-[20px] h-[20px] rounded-full"
                        style={{ backgroundColor: item.hex || '#CCCCCC' }}
                      ></div>
                      <p className="text-sm">
                        {item.brand}, {item.product}, {item.shade} ({item.hex})
                        {item.url && <a href={item.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline ml-2 text-xs">(Link)</a>}
                      </p>
                    </div>
                  ))}
                </div>
              )}

              {/* Blushes */}
              {analysisData.makeup.blushes.length > 0 && (
                <div className="mb-4">
                  <h3 className="font-semibold text-base mb-2">Blushes:</h3>
                  {analysisData.makeup.blushes.map((item: MakeupProduct, index: number) => (
                    <div key={index} className="flex items-center gap-2 mb-1">
                      <div
                        className="w-[20px] h-[20px] rounded-full"
                        style={{ backgroundColor: item.hex || '#CCCCCC' }}
                      ></div>
                      <p className="text-sm">
                        {item.brand}, {item.product}, {item.shade} ({item.hex})
                        {item.url && <a href={item.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline ml-2 text-xs">(Link)</a>}
                      </p>
                    </div>
                  ))}
                </div>
              )}

              {/* Eyeshadow Palettes */}
              {analysisData.makeup.eyeshadows.length > 0 && (
                <div className="mb-4">
                  <h3 className="font-semibold text-base mb-2">Eyeshadow Palettes:</h3>
                  {analysisData.makeup.eyeshadows.map((item: MakeupProduct, index: number) => (
                    <div key={index} className="flex items-start gap-2 mb-1"> {/* Changed to items-start for multi-line products */}
                      {/* No color swatch for palettes directly as hex is often missing */}
                      <p className="text-sm">
                        {item.brand}, {item.product}
                        {item.url && <a href={item.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline ml-2 text-xs">(Link)</a>}
                      </p>
                    </div>
                  ))}
                </div>
              )}
</div>


            {/* Makeup Suggestion - Celebrities */}
            <div className="mt-[20px] mb-8">
              <p className={styles.reportTitle}>SIMILAR CELEBRITIES</p>

              <div className="flex flex-col gap-4 font-Quicksand mt-4">
                {analysisData.celebrities.map((name: string, index: number) => (
                  <div key={`${name}-${index}`} className="flex items-center pl-[35px]">
                    {/* Placeholder for celebrity image - you might add a logic to fetch celeb images */}
                    <div className="w-[80px] h-[80px] rounded-md mr-4 bg-gray-100 flex items-center justify-center text-center text-xs text-gray-500 p-1">
                      {name.split(' ')[0]} {/* Display first name initial or full name if no image */}
                    </div>
                    <div className="text-left">
                      <p className="font-medium text-base">{name}</p>
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
    
    </div>
    </div>
    </>
  );
}