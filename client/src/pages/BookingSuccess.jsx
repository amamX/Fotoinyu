import { useState, useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { CheckCircle, Clock, FileText, Smartphone, Copy, Check } from 'lucide-react';
import { supabase } from '../lib/supabase';

export default function BookingSuccess() {
  const { code } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [timeLeft, setTimeLeft] = useState(24 * 60 * 60); // 24 hours in seconds
  const [isCopied, setIsCopied] = useState(false);
  const [booking, setBooking] = useState(null);

  useEffect(() => {
    // Poll data from Supabase
    const fetchBooking = async () => {
      const { data, error } = await supabase.from('bookings').select('*').eq('code', code).single();
      if (data) {
        setBooking(data);
      } else if (location.state?.booking) {
        setBooking(location.state.booking);
      }
    };

    fetchBooking(); // initial fetch
    const pollTimer = setInterval(fetchBooking, 3000); // poll every 3 seconds

    // Countdown timer
    const countdownTimer = setInterval(() => {
      setTimeLeft(prev => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => {
      clearInterval(pollTimer);
      clearInterval(countdownTimer);
    };
  }, [code, location.state]);

  // Prevent accidental refresh
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      e.preventDefault();
      e.returnValue = ''; // Standard browser refresh warning
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, []);

  const [hasPrinted, setHasPrinted] = useState(false);

  useEffect(() => {
    if (!booking || hasPrinted) return;
    // Auto print jika dipanggil oleh admin
    if (new URLSearchParams(location.search).get('print') === 'true') {
      setHasPrinted(true);
      setTimeout(() => {
        window.print();
        // Hapus ?print=true dari URL agar tidak terulang jika di-refresh/polling
        navigate(location.pathname, { replace: true });
      }, 1000);
    }
  }, [booking, location.search, hasPrinted, navigate]);

  if (!booking) {
    return <div className="min-h-screen flex items-center justify-center">Loading data pesanan...</div>;
  }

  const hours = Math.floor(timeLeft / 3600);
  const minutes = Math.floor((timeLeft % 3600) / 60);
  const seconds = timeLeft % 60;

  const waText = encodeURIComponent(
    `Halo Admin Fotoinyu!\n` +
    `Saya ingin mengkonfirmasi pembayaran DP untuk pesanan photobooth saya.\n\n` +
    `[ DETAIL PESANAN / INVOICE ]\n` +
    `----------------------------------------\n` +
    `* Kode Booking : ${booking.code}\n` +
    `* Nama Pemesan : ${booking.customerName}\n` +
    `* No. WhatsApp : ${booking.waNumber || '-'}\n` +
    `* Paket Dipilih: ${booking.packageName}\n` +
    `* Tanggal Acara: ${booking.date} | Pukul ${booking.time}\n` +
    `* Lokasi/Venue : ${booking.venue}\n` +
    `----------------------------------------\n\n` +
    `[ RINCIAN PEMBAYARAN ]\n` +
    `> TOTAL HARGA PAKET : Rp ${booking.totalPrice.toLocaleString('id-ID')}\n` +
    `> NOMINAL DP DITRANSFER : Rp ${booking.dpAmount.toLocaleString('id-ID')}\n` +
    `> SISA PELUNASAN NANTI  : Rp ${(booking.totalPrice - booking.dpAmount).toLocaleString('id-ID')}\n\n` +
    `Berikut saya lampirkan foto/screenshot bukti transfernya. Terima kasih!`
  );

  const handleCopy = () => {
    navigator.clipboard.writeText('901272909806');
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  if (booking.status === 'confirmed' || booking.status === 'completed') {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pt-32 pb-12 px-4 sm:px-6 lg:px-8 transition-colors duration-300 print:bg-white print:pt-10">
        <div className="max-w-2xl mx-auto">
          {/* Invoice Container */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl border border-green-500/30 p-8 md:p-12 relative overflow-hidden print:shadow-none print:border-slate-300 print:rounded-none">
            
            <div className="text-center">
              <div className="w-24 h-24 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-green-500/20 print:hidden">
                <CheckCircle size={48} />
              </div>
              <h1 className="text-3xl md:text-4xl font-display font-bold text-slate-900 dark:text-white mb-2 print:text-black">
                {booking.status === 'completed' ? 'INVOICE LUNAS (FULL)' : 'INVOICE LUNAS (DP)'}
              </h1>
              <p className="text-slate-500 mb-8 print:text-black">
                {booking.status === 'completed' ? 'Terima kasih, acara Anda telah selesai.' : 'Terima kasih, pembayaran DP Anda telah kami terima.'}
              </p>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800 p-6 rounded-2xl mb-8 border border-slate-100 dark:border-slate-700 print:border-none print:bg-transparent print:p-0">
              <div className="flex justify-between items-center mb-6 pb-6 border-b border-slate-200 dark:border-slate-700 print:border-slate-300">
                <div>
                  <div className="text-sm text-slate-500 dark:text-slate-400 print:text-slate-600">Kode Booking</div>
                  <div className="font-bold text-slate-900 dark:text-white text-lg print:text-black">{booking.code}</div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-slate-500 dark:text-slate-400 print:text-slate-600">Tanggal Transaksi</div>
                  <div className="font-medium text-slate-900 dark:text-white print:text-black">{new Date(booking.createdAt || Date.now()).toLocaleDateString('id-ID')}</div>
                </div>
              </div>

              <div className="space-y-4 mb-6">
                <div className="flex justify-between">
                  <span className="text-slate-600 dark:text-slate-400 print:text-black">Nama Pemesan</span>
                  <span className="font-medium text-slate-900 dark:text-white print:text-black">{booking.customerName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600 dark:text-slate-400 print:text-black">Paket Terpilih</span>
                  <span className="font-medium text-slate-900 dark:text-white print:text-black">{booking.packageName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600 dark:text-slate-400 print:text-black">Tanggal & Jam Acara</span>
                  <span className="font-medium text-slate-900 dark:text-white print:text-black">{booking.date} | {booking.time}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600 dark:text-slate-400 print:text-black">Total Harga Paket</span>
                  <span className="font-medium text-slate-900 dark:text-white print:text-black">Rp {booking.totalPrice.toLocaleString('id-ID')}</span>
                </div>
              </div>

              <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-xl border border-green-200 dark:border-green-800/50 print:bg-transparent print:border-t print:border-slate-300 print:rounded-none">
                {booking.status === 'completed' ? (
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-blue-700 dark:text-blue-400 font-bold print:text-black">LUNAS KESELURUHAN</span>
                    <span className="text-2xl font-bold text-blue-700 dark:text-blue-400 print:text-black">Rp {booking.totalPrice.toLocaleString('id-ID')}</span>
                  </div>
                ) : (
                  <>
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-green-700 dark:text-green-400 font-bold print:text-black">UANG MUKA (DP) DIBAYARKAN</span>
                      <span className="text-2xl font-bold text-green-700 dark:text-green-400 print:text-black">Rp {booking.dpAmount.toLocaleString('id-ID')}</span>
                    </div>
                    <div className="flex justify-between items-center border-t border-green-200/50 dark:border-green-800/50 pt-4 print:border-slate-300">
                      <span className="text-slate-700 dark:text-slate-300 font-bold print:text-black">SISA PEMBAYARAN (PELUNASAN)</span>
                      <span className="text-xl font-bold text-slate-800 dark:text-white print:text-black">Rp {(booking.totalPrice - booking.dpAmount).toLocaleString('id-ID')}</span>
                    </div>
                    <div className="text-sm text-green-600 mt-4 print:text-slate-600">*Sisa pelunasan dibayarkan maksimal H-1 sebelum acara.</div>
                  </>
                )}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center print:hidden">
              <button onClick={() => window.print()} className="flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-900 text-white px-6 py-3 rounded-xl font-bold transition-colors">
                <FileText size={20} /> Cetak Invoice PDF
              </button>
              <button onClick={() => navigate('/')} className="bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white px-8 py-3 rounded-xl font-bold hover:bg-slate-200 transition-colors">
                Kembali ke Beranda
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Rejected State
  if (booking.status === 'rejected') {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pt-32 pb-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center transition-colors duration-300">
        <div className="max-w-md w-full bg-white dark:bg-slate-900 rounded-3xl shadow-xl border border-red-500/30 p-8 text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-red-600 to-red-400"></div>
          <div className="w-20 h-20 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-red-500/20">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-10 h-10" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Pesanan Dibatalkan</h1>
          <p className="text-slate-600 dark:text-slate-400 mb-8 leading-relaxed">
            Maaf, pesanan Anda (Kode: <strong>{booking.code}</strong>) telah dibatalkan atau ditolak oleh Admin. Silakan buat pesanan baru atau hubungi tim kami jika ada kendala.
          </p>
          <div className="flex flex-col gap-3">
            <button onClick={() => navigate('/booking')} className="w-full bg-slate-900 hover:bg-slate-800 dark:bg-slate-700 dark:hover:bg-slate-600 text-white font-bold py-4 rounded-xl transition-colors">
              Buat Pesanan Baru
            </button>
            <a href="https://wa.me/6281253776037" target="_blank" rel="noreferrer" className="w-full bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 font-bold py-4 rounded-xl hover:bg-green-100 dark:hover:bg-green-900/40 transition-colors border border-green-200 dark:border-green-800/50">
              Hubungi CS via WhatsApp
            </a>
          </div>
        </div>
      </div>
    );
  }

  // Pending State
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pt-32 pb-12 px-4 sm:px-6 lg:px-8 transition-colors duration-300">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl border border-slate-100 dark:border-slate-800 p-8 md:p-12 text-center relative overflow-hidden">
          
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-600 to-cyan-500"></div>

          <div className="w-20 h-20 bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 rounded-full flex items-center justify-center mx-auto mb-6">
            <Clock size={40} />
          </div>
          
          <h1 className="text-3xl md:text-4xl font-display font-bold text-slate-900 dark:text-white mb-4">Menunggu Pembayaran</h1>
          <p className="text-slate-600 dark:text-slate-400 mb-8 max-w-md mx-auto">Satu langkah lagi. Silakan transfer DP untuk mengunci jadwal Anda sebelum waktu habis.</p>

          <div className="flex items-center justify-center gap-4 bg-orange-50 dark:bg-orange-950/30 text-orange-700 dark:text-orange-400 p-4 rounded-xl mb-8 font-mono font-bold text-xl border border-orange-200 dark:border-orange-900/50">
            <Clock size={24} />
            <span>{hours.toString().padStart(2, '0')}:{minutes.toString().padStart(2, '0')}:{seconds.toString().padStart(2, '0')}</span>
          </div>

          <div className="bg-slate-50 dark:bg-slate-800 p-6 rounded-2xl mb-8 text-left border border-slate-100 dark:border-slate-700">
            <div className="flex justify-between items-center mb-6 pb-6 border-b border-slate-200 dark:border-slate-700">
              <div>
                <div className="text-sm text-slate-500 dark:text-slate-400">Kode Booking</div>
                <div className="font-bold text-slate-900 dark:text-white">{booking.code}</div>
              </div>
              <div className="text-right">
                <div className="text-sm text-slate-500 dark:text-slate-400">Tanggal Transaksi</div>
                <div className="font-medium text-slate-900 dark:text-white">{new Date(booking.createdAt || Date.now()).toLocaleDateString('id-ID')}</div>
              </div>
            </div>

            <div className="space-y-4 mb-6">
              <div className="flex justify-between">
                <span className="text-slate-600 dark:text-slate-400">Paket Terpilih</span>
                <span className="font-medium text-slate-900 dark:text-white">{booking.packageName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600 dark:text-slate-400">Nama Pemesan</span>
                <span className="font-medium text-slate-900 dark:text-white">{booking.customerName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600 dark:text-slate-400">Total Harga</span>
                <span className="font-medium text-slate-900 dark:text-white">Rp {booking.totalPrice.toLocaleString('id-ID')}</span>
              </div>
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl border border-blue-100 dark:border-blue-800/50">
              <div className="text-sm text-blue-600 dark:text-blue-400 mb-1">Total DP yang harus ditransfer</div>
              <div className="text-3xl font-bold text-blue-700 dark:text-blue-400 mb-2">Rp {booking.dpAmount.toLocaleString('id-ID')}</div>
              <div className="text-sm text-blue-600/90 dark:text-blue-300/80 font-bold mt-2 border-t border-blue-200 dark:border-blue-800/50 pt-2">
                PENTING: Pastikan transfer TEPAT senilai Rp {booking.dpAmount.toLocaleString('id-ID')} (tidak dikurangi/dilebihkan) agar sistem otomatis dapat memverifikasi pembayaran Anda.
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-bold text-slate-900 dark:text-white mb-2">Rekening Pembayaran</h3>
            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 flex justify-between items-center bg-white dark:bg-slate-900">
              <div className="text-left">
                <div className="font-bold text-slate-900 dark:text-white text-lg">Seabank</div>
                <div className="text-slate-500 dark:text-slate-400 text-sm">a.n Defi Afriyanti</div>
              </div>
              <div className="flex items-center gap-3">
                <div className="font-mono text-xl font-bold text-blue-600 dark:text-blue-400">
                  9012 7290 9806
                </div>
                <button 
                  onClick={handleCopy}
                  className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors"
                  title="Copy rekening"
                >
                  {isCopied ? <Check size={20} className="text-green-500" /> : <Copy size={20} />}
                </button>
              </div>
            </div>
          </div>

          <div className="mt-10 pt-8 border-t border-slate-100 dark:border-slate-800">
            <a
              href={`https://wa.me/6281253776037?text=${waText}`}
              target="_blank"
              rel="noreferrer"
              className="w-full flex items-center justify-center gap-3 bg-green-500 hover:bg-green-600 text-white px-8 py-4 rounded-xl font-bold transition-colors shadow-lg shadow-green-500/30"
            >
              <Smartphone size={24} />
              Konfirmasi via WhatsApp Sekarang
            </a>
            <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">
              CS kami akan memvalidasi pembayaran Anda dalam waktu maksimal 10 menit.
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}
