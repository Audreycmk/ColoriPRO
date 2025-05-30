// src/app/report/page.tsx
'use client';

export default function ColorReportPage() {
  return (
    <div className="w-[375px] h-[667px] bg-[#F9F1E7] p-4 mx-auto font-sans">
      {/* Title */}
      <h1 className="text-center text-2xl font-serif text-black mb-4 tracking-wide">Soft Autumn</h1>

      {/* Base Colors */}
      <section>
        <h2 className="text-sm font-bold text-black mb-2">MY COLORS</h2>
        <div className="flex justify-between mb-4">
          {[
            { label: 'Face', hex: '#BB948B' },
            { label: 'Eye', hex: '#332724' },
            { label: 'Hair', hex: '#3E3230' },
          ].map((color) => (
            <div key={color.label} className="flex flex-col items-center">
              <div
                className="w-12 h-12 rounded-full border"
                style={{ backgroundColor: color.hex }}
              />
              <span className="text-xs mt-1">{color.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Palette Grid */}
      <section>
        <h2 className="text-sm font-bold text-black mb-2">SEASONAL PALETTE</h2>
        <div className="grid grid-cols-4 gap-2">
          {[
            { name: 'Olive Green', hex: '#6B8E23' },
            { name: 'Dusty Rose', hex: '#C08081' },
            { name: 'Mustard', hex: '#D4AF37' },
            { name: 'Warm Taupe', hex: '#D2B48C' },
            { name: 'Soft Coral', hex: '#F88379' },
            { name: 'Teal', hex: '#008080' },
            { name: 'Terracotta', hex: '#E2725B' },
            { name: 'Mocha', hex: '#3D2B1F' },
          ].map((swatch) => (
            <div key={swatch.name} className="flex flex-col items-center text-center text-[10px]">
              <div
                className="w-10 h-10 rounded border"
                style={{ backgroundColor: swatch.hex }}
              />
              <span>{swatch.name}</span>
              <span className="text-[9px]">{swatch.hex}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Outfit Section */}
      <section className="mt-6">
        <h2 className="text-sm font-bold text-black mb-2">SPORTY OUTFIT</h2>
        <ul className="text-[12px] leading-relaxed">
          <li>• Top: Soft coral hoodie</li>
          <li>• Bottom: Olive joggers</li>
          <li>• Shoes: White sneakers</li>
          <li>• Glasses: Gold round frames</li>
          <li>• Backpack: Tan leather</li>
        </ul>
      </section>
    </div>
  );
}
