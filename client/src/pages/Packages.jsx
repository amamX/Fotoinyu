import { CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';

export default function Packages() {
  const [packages, setPackages] = useState([]);

  useEffect(() => {
    const savedPackages = JSON.parse(localStorage.getItem('fotoinyu_packages') || '[]');
    
    // Define a palette to map to dynamically loaded packages
    const palettes = [
      { color: 'bg-[#3b82f6]/10 border-[#3b82f6]/30', titleColor: 'text-[#3b82f6]', buttonColor: 'bg-[#3b82f6]' },
      { color: 'bg-[#2563eb]/10 border-[#2563eb]/30', titleColor: 'text-[#2563eb]', buttonColor: 'bg-[#2563eb]', popular: true },
      { color: 'bg-[#1e40af]/10 border-[#1e40af]/30', titleColor: 'text-[#1e40af]', buttonColor: 'bg-[#1e40af]' },
      { color: 'bg-[#171717]/10 border-[#171717]/30 dark:bg-gray-800 dark:border-gray-600', titleColor: 'text-[#171717] dark:text-gray-300', buttonColor: 'bg-[#171717] dark:bg-gray-700' },
      { color: 'bg-emerald-500/10 border-emerald-500/30', titleColor: 'text-emerald-600', buttonColor: 'bg-emerald-600' },
      { color: 'bg-purple-500/10 border-purple-500/30', titleColor: 'text-purple-600', buttonColor: 'bg-purple-600' }
    ];

    if (savedPackages.length > 0) {
      const enrichedPackages = savedPackages.map((pkg, i) => ({
        ...pkg,
        title: pkg.name.toUpperCase(),
        priceStr: `Rp ${pkg.price.toLocaleString('id-ID')}`,
        ...(palettes[i % palettes.length]) // Cycle through palettes
      }));
      setPackages(enrichedPackages);
    } else {
      // Fallback
      setPackages([]);
    }
  }, []);

  return (
    <div className="w-full bg-[#f8fafc] dark:bg-gray-950 min-h-screen py-32 px-4 sm:px-6 lg:px-8 transition-colors duration-300">
      <div className="max-w-7xl mx-auto text-center mb-16">
        <h1 className="text-4xl md:text-5xl font-display font-bold text-[var(--color-primary-dark)] dark:text-blue-400 mb-4">Pricelist Fotoinyu Photobooth</h1>
        <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto text-lg">Pilih durasi paket yang paling sesuai dengan kemeriahan acara Anda.</p>
      </div>

      {packages.length === 0 ? (
        <div className="text-center text-gray-500">Memuat paket...</div>
      ) : (
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
          {packages.map((pkg, i) => (
            <div key={i} className={`relative bg-white dark:bg-gray-900 rounded-3xl border ${pkg.color} p-6 shadow-xl flex flex-col transition-transform duration-300 ${pkg.disabled ? 'opacity-60 grayscale' : 'hover:-translate-y-2'}`}>
              {pkg.popular && !pkg.disabled && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-[var(--color-primary)] text-white text-xs font-bold px-4 py-1.5 rounded-full shadow-lg whitespace-nowrap z-10">
                  PALING BANYAK DIPILIH
                </div>
              )}
              {pkg.disabled && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-red-600 text-white text-xs font-bold px-4 py-1.5 rounded-full shadow-lg whitespace-nowrap z-10">
                  PAKET HABIS / DITUTUP
                </div>
              )}
              
              <div className={`p-6 rounded-2xl ${pkg.disabled ? 'bg-gray-400' : pkg.buttonColor} text-white text-center mb-6 shadow-md`}>
                <h3 className="text-xl font-display font-bold tracking-wider mb-2">{pkg.title}</h3>
                <div className="flex justify-center gap-1 mb-2">
                  <span className="text-white/80">✦</span>
                  <span className="text-white/80">✦</span>
                  <span className="text-white/80">✦</span>
                </div>
                <div className="text-2xl font-bold">{pkg.priceStr}</div>
              </div>

              <ul className="space-y-4 mb-8 text-gray-700 dark:text-gray-300 flex-grow text-sm text-left">
                {pkg.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <span className="font-bold text-gray-400 dark:text-gray-500 w-4">{idx + 1}.</span>
                    <span className="leading-snug font-medium">{feature}</span>
                  </li>
                ))}
              </ul>
              
              {pkg.disabled ? (
                <div className="w-full text-center block bg-gray-300 text-gray-600 py-4 rounded-xl font-bold shadow-md cursor-not-allowed">
                  Tidak Tersedia
                </div>
              ) : (
                <Link 
                  to="/booking" 
                  state={{ selectedPackage: pkg.name }}
                  className={`w-full text-center block ${pkg.buttonColor} text-white py-4 rounded-xl font-bold transition-all shadow-md hover:scale-105`}
                >
                  Pilih Paket Ini
                </Link>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
