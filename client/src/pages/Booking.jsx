import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Camera, Calendar, User, CheckCircle, ArrowRight, ArrowLeft } from 'lucide-react';
import { supabase } from '../lib/supabase';
import Swal from 'sweetalert2';

export default function Booking() {
  const location = useLocation();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    packageId: '',
    date: '',
    time: '',
    customerName: '',
    waNumber: '',
    eventType: '',
    customEvent: '',
    venue: '',
  });

  const [packages, setPackages] = useState([]);

  // Prevent accidental close
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (step > 1 && step < 4) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [step]);

  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [existingBookings, setExistingBookings] = useState([]);

  useEffect(() => {
    const fetchPackages = async () => {
      const { data, error } = await supabase.from('packages').select('*').order('id', { ascending: true });
      if (data && data.length > 0) {
        setPackages(data);
      }
    };
    fetchPackages();
  }, []);

  useEffect(() => {
    if (location.state?.selectedPackage) {
      setFormData(prev => ({ ...prev, packageId: location.state.selectedPackage }));
      setStep(2); // Langsung ke step 2 (Jadwal) jika paket sudah dipilih
    }
  }, [location.state]);

  const nextStep = () => setStep(s => Math.min(3, s + 1));
  const prevStep = () => setStep(s => Math.max(1, s - 1));

  const submitBooking = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    const selectedPkg = packages.find(p => p.name === formData.packageId);
    const price = selectedPkg ? selectedPkg.price : 0;

    const uniqueCode = Math.floor(Math.random() * 900) + 100;
    const dpAmount = 300000 + uniqueCode;
    const randomInv = Math.floor(Math.random() * 1000).toString().padStart(4, '0');
    const invoiceCode = `INV-FI-2026-10-${randomInv}`;

    const bookingData = {
      code: invoiceCode,
      customerName: formData.customerName,
      waNumber: formData.waNumber || '-',
      packageName: formData.packageId,
      totalPrice: price,
      dpAmount: dpAmount,
      venue: formData.venue,
      date: formData.date,
      time: formData.time,
      status: 'pending',
      createdAt: new Date().toISOString()
    };

    const { error } = await supabase.from('bookings').insert([bookingData]);

    if (!error) {
      setTimeout(() => {
        setIsLoading(false);
        navigate(`/booking/${invoiceCode}`, { state: { booking: bookingData } });
      }, 1000);
    } else {
      setIsLoading(false);
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: 'Gagal membuat pesanan, silakan coba lagi.',
        confirmButtonColor: '#3085d6'
      });
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-gray-950 pt-24 pb-12 px-4 sm:px-6 lg:px-8 transition-colors duration-300">
      <div className="max-w-3xl mx-auto">

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between relative">
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-gray-200 dark:bg-gray-800 -z-10 rounded-full"></div>
            <div className={`absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-[var(--color-primary)] -z-10 rounded-full transition-all duration-500`} style={{ width: `${((step - 1) / 2) * 100}%` }}></div>

            {[1, 2, 3].map((i) => (
              <div key={i} className={`w-10 h-10 rounded-full flex items-center justify-center font-bold border-4 border-[#f8fafc] dark:border-gray-950 ${step >= i ? 'bg-[var(--color-primary)] text-white' : 'bg-gray-200 dark:bg-gray-800 text-gray-500 dark:text-gray-400'}`}>
                {i === 1 && <Camera size={18} />}
                {i === 2 && <Calendar size={18} />}
                {i === 3 && <User size={18} />}
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-2 text-xs font-semibold text-gray-500 px-1">
            <span>Pilih Paket</span>
            <span>Jadwal</span>
            <span>Data Diri</span>
          </div>
        </div>

        {/* Form Container */}
        <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-xl border border-slate-100 dark:border-gray-800 p-6 md:p-10 transition-colors duration-300">

          {step === 1 && (
            <div className="animate-fade-in">
              <h2 className="text-2xl font-display font-bold text-[var(--color-primary-dark)] dark:text-blue-400 mb-6">Pilih Paket Photobooth</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {packages.length === 0 ? (
                  <div className="col-span-full text-center py-8 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                    <p className="text-gray-500 dark:text-gray-400">Belum ada paket yang tersedia saat ini.</p>
                  </div>
                ) : (
                  packages.map((pkg) => (
                    <label key={pkg.id} className={`border-2 rounded-xl p-5 transition-all ${pkg.disabled ? 'border-gray-200 bg-gray-100 opacity-60 cursor-not-allowed grayscale' : formData.packageId === pkg.name ? 'border-[var(--color-primary)] bg-blue-50/50 dark:bg-slate-900/30 cursor-pointer shadow-md' : 'border-gray-100 dark:border-gray-800 hover:border-blue-200 dark:hover:border-blue-900 cursor-pointer'}`}>
                      <input type="radio" name="package" className="hidden" disabled={pkg.disabled} checked={formData.packageId === pkg.name} onChange={() => setFormData({ ...formData, packageId: pkg.name })} />
                      <div className="flex justify-between items-start mb-2">
                        <div className="font-bold text-gray-800 dark:text-gray-200 text-lg">{pkg.name}</div>
                        {pkg.disabled && <span className="bg-red-100 text-red-600 text-[10px] font-bold px-2 py-0.5 rounded uppercase">Habis</span>}
                      </div>
                      <div className="text-sm text-[var(--color-primary)] font-bold mb-3">Rp {pkg.price.toLocaleString('id-ID')}</div>
                      <ul className="text-xs text-gray-500 dark:text-gray-400 space-y-1.5">
                        {pkg.features.map((f,i) => <li key={i}>• {f}</li>)}
                      </ul>
                    </label>
                  ))
                )}
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="animate-fade-in">
              <h2 className="text-2xl font-display font-bold text-[var(--color-primary-dark)] dark:text-blue-400 mb-2">Tentukan Tanggal & Jam Acara</h2>
              <p className="text-sm text-gray-500 mb-6">Anda bebas memilih jam. Pesanan akan direview oleh Admin dan diinformasikan melalui WA.</p>
              <div className="grid sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Pilih Tanggal</label>
                  <input 
                    type="date" 
                    value={formData.date} 
                    min={new Date().toLocaleDateString('en-CA')} // format YYYY-MM-DD local
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })} 
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Jam Mulai Standby</label>
                  <input 
                    type="time" 
                    value={formData.time} 
                    onChange={(e) => setFormData({ ...formData, time: e.target.value })} 
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white" 
                  />
                </div>
              </div>

              {/* Visual Calendar */}
              {(() => {
                const year = formData.date ? new Date(formData.date).getFullYear() : new Date().getFullYear();
                const month = formData.date ? new Date(formData.date).getMonth() : new Date().getMonth();
                const daysInMonth = new Date(year, month + 1, 0).getDate();
                const firstDay = new Date(year, month, 1).getDay();
                
                const days = [];
                for (let i = 0; i < firstDay; i++) days.push(<div key={`empty-${i}`}></div>);
                for (let i = 1; i <= daysInMonth; i++) {
                  const dStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
                  const bookingsOnDate = existingBookings.filter(b => b.date === dStr && b.status !== 'rejected' && b.status !== 'refunded');
                  const count = bookingsOnDate.length;
                  
                  let bgColor = 'bg-slate-50 dark:bg-slate-800/50 text-slate-400';
                  if (count > 0) bgColor = 'bg-blue-50 text-blue-700 font-bold border-blue-200';
                  if (count >= 2) bgColor = 'bg-orange-50 text-orange-700 font-bold border-orange-200';
                  if (count >= 3) bgColor = 'bg-red-50 text-red-700 font-bold border-red-200';
                  
                  const isSelected = formData.date === dStr;

                  days.push(
                    <div key={i} className={`flex flex-col items-center justify-center p-1 md:p-2 rounded-lg border ${isSelected ? 'ring-2 ring-[var(--color-primary)] border-transparent bg-blue-50 text-blue-700 shadow-sm' : bgColor} transition-all`}>
                      <span className="text-sm">{i}</span>
                      {count > 0 && <span className="text-[9px] leading-tight text-center mt-1 hidden md:block">{count} Acara</span>}
                      {count > 0 && <span className="w-1.5 h-1.5 rounded-full bg-current md:hidden mt-0.5"></span>}
                    </div>
                  );
                }
                
                const monthName = new Date(year, month).toLocaleString('id-ID', { month: 'long', year: 'numeric' });

                return (
                  <div className="mt-8 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 bg-white dark:bg-slate-900 shadow-sm">
                    <h4 className="font-bold text-sm text-slate-700 dark:text-slate-300 mb-4 flex items-center justify-between">
                      Visual Jadwal Tim Fotoinyu 
                      <span className="text-[var(--color-primary)] bg-blue-50 px-3 py-1 rounded-full text-xs">{monthName}</span>
                    </h4>
                    <div className="grid grid-cols-7 gap-1 md:gap-2 text-center mb-2">
                      {['Min','Sen','Sel','Rab','Kam','Jum','Sab'].map(d => <div key={d} className="text-xs font-semibold text-slate-400">{d}</div>)}
                    </div>
                    <div className="grid grid-cols-7 gap-1 md:gap-2">
                      {days}
                    </div>
                    <div className="flex flex-wrap justify-center gap-4 mt-6 text-[10px] md:text-xs text-slate-500 font-medium">
                      <div className="flex items-center gap-1.5"><div className="w-3 h-3 bg-blue-50 border border-blue-200 rounded"></div> 1 Acara</div>
                      <div className="flex items-center gap-1.5"><div className="w-3 h-3 bg-orange-50 border border-orange-200 rounded"></div> 2 Acara</div>
                      <div className="flex items-center gap-1.5"><div className="w-3 h-3 bg-red-50 border border-red-200 rounded"></div> 3+ Acara (Padat)</div>
                    </div>
                  </div>
                );
              })()}
            </div>
          )}

          {step === 3 && (
            <div className="animate-fade-in">
              <h2 className="text-2xl font-display font-bold text-[var(--color-primary-dark)] dark:text-blue-400 mb-6">Lengkapi Data Diri</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Nama Pemesan</label>
                  <input type="text" placeholder="Cth: Dinda / Panitia FEB" value={formData.customerName} onChange={(e) => setFormData({ ...formData, customerName: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">No. WhatsApp</label>
                  <input type="tel" pattern="[0-9]*" onInput={(e) => e.target.value = e.target.value.replace(/[^0-9]/g, '')} placeholder="08..." value={formData.waNumber} onChange={(e) => setFormData({ ...formData, waNumber: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Jenis Acara</label>
                  <select value={formData.eventType} onChange={(e) => setFormData({ ...formData, eventType: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white">
                    <option value="">Pilih Jenis Acara</option>
                    <option value="Wedding">Wedding</option>
                    <option value="Birthday">Birthday / Sweet 17</option>
                    <option value="Gathering">Corporate Gathering / Kampus</option>
                    <option value="Lainnya">Lainnya</option>
                  </select>
                  {formData.eventType === 'Lainnya' && (
                    <input type="text" placeholder="Ketik jenis acara Anda..." value={formData.customEvent} onChange={(e) => setFormData({ ...formData, customEvent: e.target.value })} className="w-full px-4 py-3 mt-3 rounded-xl border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white animate-fade-in" />
                  )}
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Alamat / Venue Acara</label>
                  <textarea rows="2" placeholder="Nama gedung atau alamat lengkap" value={formData.venue} onChange={(e) => setFormData({ ...formData, venue: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white"></textarea>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between items-center mt-10 pt-6 border-t border-gray-100">
            <div className="flex gap-3">
              <button
                type="button"
                onClick={prevStep}
                disabled={step === 1 || isLoading}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-colors ${step === 1 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-600 hover:bg-gray-100'}`}
              >
                <ArrowLeft size={18} /> Kembali
              </button>
              
              {step > 1 && (
                <button
                  type="button"
                  onClick={() => {
                    Swal.fire({
                      title: 'Batalkan Isian?',
                      text: "Semua data yang telah Anda isi akan dihapus.",
                      icon: 'warning',
                      showCancelButton: true,
                      confirmButtonColor: '#ef4444',
                      cancelButtonColor: '#94a3b8',
                      confirmButtonText: 'Ya, hapus!',
                      cancelButtonText: 'Batal'
                    }).then((result) => {
                      if (result.isConfirmed) {
                        setStep(1);
                        setFormData({
                          packageId: '',
                          date: '',
                          time: '',
                          customerName: '',
                          waNumber: '',
                          eventType: '',
                          customEvent: '',
                          venue: '',
                        });
                      }
                    });
                  }}
                  disabled={isLoading}
                  className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-red-500 hover:bg-red-50 transition-colors"
                >
                  Batal
                </button>
              )}
            </div>

            {step < 3 ? (
              <button
                type="button"
                onClick={nextStep}
                disabled={(step === 1 && !formData.packageId) || (step === 2 && (!formData.date || !formData.time))}
                className="flex items-center gap-2 bg-[var(--color-primary)] text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
              >
                Lanjut <ArrowRight size={18} />
              </button>
            ) : (
              <button
                type="button"
                onClick={submitBooking}
                disabled={!formData.customerName.trim() || !formData.waNumber.trim() || !formData.eventType || (formData.eventType === 'Lainnya' && !formData.customEvent.trim()) || !formData.venue.trim() || isLoading}
                className="flex items-center gap-2 bg-gradient-to-r from-[var(--color-primary-dark)] to-[var(--color-primary)] text-white px-8 py-3 rounded-xl font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
              >
                {isLoading ? 'Memproses...' : 'Selesaikan Booking'} {isLoading ? null : <CheckCircle size={18} />}
              </button>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
