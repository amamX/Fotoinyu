import { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { Camera, CalendarCheck, Image as ImageIcon, Sparkles, CheckCircle2, MessageCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';

import ParallaxGallery from '../components/ui/3d-parallax-unfurling-gallery';

const FAQItem = ({ q, a }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-slate-100 dark:border-gray-700 overflow-hidden transition-all duration-300">
      <button
        onClick={() => setOpen(!open)}
        className="w-full text-left p-6 flex justify-between items-center font-bold text-gray-800 dark:text-white focus:outline-none"
      >
        <span>{q}</span>
        <svg className={`w-5 h-5 flex-shrink-0 text-[var(--color-primary)] transition-transform duration-300 ${open ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" /></svg>
      </button>
      <div className={`px-6 overflow-hidden transition-all duration-300 ${open ? 'max-h-96 pb-6 opacity-100' : 'max-h-0 opacity-0'}`}>
        <p className="text-gray-600 dark:text-gray-300 leading-relaxed">{a}</p>
      </div>
    </div>
  );
};

export default function Home() {
  const location = useLocation();

  const [galleryItems, setGalleryItems] = useState([
    "/images/gallery-1.png", "/images/gallery-2.png", "/images/gallery-3.png",
    "/images/gallery-4.png", "/images/gallery-5.png", "/images/gallery-6.png"
  ]);
  const [testimonials, setTestimonials] = useState([
    { name: "Putri", event: "Wisuda", text: "Bagus banget Photoboothnya" },
    { name: "Ricky", event: "Wedding", text: "Makasih banyak jua kami bagus banar kak foto fotonyaa" },
    { name: "Amam", event: "Wisuda", text: "Sangat profesional dari awal setup sampai acara selesai. Harganya juga masuk akal buat fasilitas sekelas ini." }
  ]);

  useEffect(() => {
    const fetchGallery = async () => {
      const { data } = await supabase.from('gallery').select('*').order('created_at', { ascending: false });
      if (data && data.length > 0) setGalleryItems(data.map(g => g.image_url));
    };

    const fetchTestimonials = async () => {
      const { data } = await supabase.from('testimonials').select('*').order('created_at', { ascending: false });
      if (data && data.length > 0) setTestimonials(data);
    };

    fetchGallery();
    fetchTestimonials();

    const gallerySub = supabase
      .channel('home_gallery_channel')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'gallery' }, () => {
        fetchGallery();
      })
      .subscribe();

    const testiSub = supabase
      .channel('home_testi_channel')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'testimonials' }, () => {
        fetchTestimonials();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(gallerySub);
      supabase.removeChannel(testiSub);
    };
  }, []);

  // Scroll to hash
  useEffect(() => {
    if (location.hash) {
      const element = document.getElementById(location.hash.substring(1));
      if (element) element.scrollIntoView({ behavior: 'smooth' });
    }
  }, [location]);

  return (
    <div className="w-full bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      {/* 1. Hero Section (Elegant, Glassmorphism, Premium) */}
      <section className="relative min-h-[100dvh] md:min-h-[90vh] flex items-center justify-center bg-[url('/images/hero-bg.jpg')] bg-cover bg-center md:bg-fixed">
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/40 to-slate-50 dark:to-slate-950 transition-colors duration-300"></div>

        <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center pt-20">
          <div className="inline-block px-5 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs md:text-sm font-semibold tracking-widest uppercase text-white mb-8 animate-fade-in">
            Layanan Photobooth No. 1 di Banjarmasin
          </div>
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-display font-bold text-white mb-6 drop-shadow-xl leading-tight">
            Capture the Moment. <br className="hidden md:block" /> Keep the Memory.
          </h1>
          <p className="text-lg md:text-xl text-gray-200 max-w-2xl mx-auto mb-10 drop-shadow-md">
            Hadirkan memori tak terlupakan untuk Wedding, Birthday, Wisuda, dan Event Spesial Anda dengan studio mini premium kami.
          </p>
          <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
            <Link to="/booking" className="w-full sm:w-auto bg-gradient-to-r from-[var(--color-primary-dark)] to-[var(--color-primary)] text-white px-8 py-4 rounded-xl font-bold text-lg hover:shadow-[0_0_25px_rgba(244,63,94,0.5)] hover:-translate-y-1 transition-all duration-300">
              Pesan Tanggal Sekarang
            </Link>
            <Link to="/paket" className="w-full sm:w-auto bg-white/10 backdrop-blur-md border border-white/30 text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-white/20 transition-all duration-300">
              Lihat Pricelist
            </Link>
          </div>
        </div>
      </section>

      {/* 2. Layanan (Mengapa Kami) */}
      <section className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-display font-bold text-[var(--color-primary-dark)] dark:text-blue-400 mb-4">Momen Indah Anda, Kualitas Studio Kami</h2>
          <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto text-lg">Setiap paket sudah dilengkapi dengan fasilitas lengkap tanpa biaya tersembunyi.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-white dark:bg-gray-900 rounded-3xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:-translate-y-2 transition-all duration-300 border border-slate-100 dark:border-gray-800">
            <div className="w-14 h-14 bg-blue-50 dark:bg-slate-900/50 rounded-2xl flex items-center justify-center text-[var(--color-primary)] mb-6">
              <Camera size={32} />
            </div>
            <h3 className="text-xl font-bold mb-3 text-gray-800 dark:text-gray-100">Kamera & Lighting Pro</h3>
            <p className="text-gray-500 dark:text-gray-400 leading-relaxed">Hasil foto tajam dan cerah menggunakan Kamera DSLR Canon profesional dan studio lighting set.</p>
          </div>
          <div className="bg-white dark:bg-gray-900 rounded-3xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:-translate-y-2 transition-all duration-300 border border-slate-100 dark:border-gray-800">
            <div className="w-14 h-14 bg-blue-50 dark:bg-slate-900/50 rounded-2xl flex items-center justify-center text-[var(--color-primary)] mb-6">
              <ImageIcon size={32} />
            </div>
            <h3 className="text-xl font-bold mb-3 text-gray-800 dark:text-gray-100">Unlimited Cetak & File</h3>
            <p className="text-gray-500 dark:text-gray-400 leading-relaxed">Cetak foto instan sepuasnya selama durasi acara. Semua file digital langsung dikirim via barcode.</p>
          </div>
          <div className="bg-white dark:bg-gray-900 rounded-3xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:-translate-y-2 transition-all duration-300 border border-slate-100 dark:border-gray-800">
            <div className="w-14 h-14 bg-blue-50 dark:bg-slate-900/50 rounded-2xl flex items-center justify-center text-[var(--color-primary)] mb-6">
              <Sparkles size={32} />
            </div>
            <h3 className="text-xl font-bold mb-3 text-gray-800 dark:text-gray-100">Desain Template Kustom</h3>
            <p className="text-gray-500 dark:text-gray-400 leading-relaxed">Frame foto (photo strip) didesain eksklusif dan dicetak khusus sesuai dengan tema acara Anda.</p>
          </div>
        </div>
      </section>

      {/* 3. Galeri Foto */}
      <section id="galeri" className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-display font-bold text-[var(--color-primary-dark)] dark:text-white mb-4">Galeri Momen</h2>
          <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto text-lg">Koleksi memori terbaik dari berbagai event yang kami abadikan.</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {galleryItems.map((imgSrc, idx) => (
            <div key={idx} className="group relative aspect-square overflow-hidden rounded-2xl bg-gray-200 dark:bg-gray-800">
              <img
                src={imgSrc}
                alt={`Gallery ${idx + 1}`}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=500&q=60' }} // Fallback if image not found yet
              />
              <a
                href={imgSrc}
                target="_blank"
                rel="noreferrer"
                className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center cursor-pointer"
              >
                <span className="text-white font-medium border border-white/50 px-4 py-2 rounded-full backdrop-blur-sm hover:bg-white/20 transition-colors">Lihat Foto</span>
              </a>
            </div>
          ))}
        </div>
      </section>

      {/* 4. Cara Booking */}
      <section id="cara-booking" className="py-24 bg-[var(--color-primary-dark)] dark:bg-slate-900 text-white relative overflow-hidden border-y border-transparent dark:border-slate-800">
        {/* Dekorasi blur */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-500/30 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/3"></div>
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-slate-500/20 rounded-full blur-[100px] translate-y-1/3 -translate-x-1/3"></div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-display font-bold mb-16 text-white">Cara Mudah Booking</h2>

          <div className="grid md:grid-cols-4 gap-8">
            {[
              { step: '1', title: 'Pilih Jadwal', desc: 'Cek kalender ketersediaan kami dan pilih tanggal acara Anda.' },
              { step: '2', title: 'Isi Data Acara', desc: 'Lengkapi formulir singkat tentang lokasi dan jenis acara.' },
              { step: '3', title: 'Bayar DP', desc: 'Transfer Uang Muka (DP) dan kirimkan bukti via WhatsApp.' },
              { step: '4', title: 'Selesai!', desc: 'Jadwal Anda terkunci. Tim kami siap hadir memeriahkan acara!' }
            ].map((item) => (
              <div key={item.step} className="relative flex flex-col items-center">
                <div className="w-16 h-16 rounded-2xl bg-white/10 dark:bg-slate-800 backdrop-blur-sm border border-white/20 dark:border-slate-700 flex items-center justify-center text-2xl font-bold text-white mb-6 shadow-xl relative z-10">
                  {item.step}
                </div>
                {/* Garis penghubung (desktop only) */}
                {item.step !== '4' && (
                  <div className="hidden md:block absolute top-8 left-[60%] w-full h-[2px] bg-gradient-to-r from-white/20 dark:from-slate-700 to-transparent"></div>
                )}
                <h3 className="text-xl font-bold mb-3 text-white">{item.title}</h3>
                <p className="text-blue-50 dark:text-slate-300 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>

          <div className="mt-16">
            <Link to="/booking" className="inline-flex items-center gap-2 bg-white dark:bg-blue-600 text-[var(--color-primary-dark)] dark:text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-gray-50 dark:hover:bg-blue-700 transition-colors shadow-lg">
              <CalendarCheck size={24} /> Cek Ketersediaan Tanggal
            </Link>
          </div>
        </div>
      </section>

      {/* 4. Testimoni */}
      <section id="testimoni" className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-display font-bold text-[var(--color-primary-dark)] dark:text-white mb-4">Apa Kata Mereka?</h2>
          <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto text-lg">Kepercayaan ratusan klien yang telah mengundang kami.</p>
        </div>

        <div className="flex gap-6 overflow-x-auto pb-8 snap-x snap-mandatory md:grid md:grid-cols-3 md:overflow-visible md:pb-0 scrollbar-hide">
          {testimonials.map((testi, i) => (
            <div key={i} className="bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-sm border border-slate-100 dark:border-gray-700 relative flex-shrink-0 snap-center w-[85vw] md:w-full">
              <div className="text-4xl text-pink-200 dark:text-pink-900/50 absolute top-6 right-6 font-serif">"</div>
              <div className="flex items-center gap-1 text-[var(--color-primary)] mb-4">
                {[1, 2, 3, 4, 5].map(star => <svg key={star} className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>)}
              </div>
              <p className="text-gray-600 dark:text-gray-300 mb-6 italic leading-relaxed">"{testi.text}"</p>
              <div>
                <h4 className="font-bold text-gray-800 dark:text-white">{testi.name}</h4>
                <p className="text-sm text-[var(--color-primary)]">{testi.event}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 5. FAQ & Contact Section */}
      <section id="faq" className="py-24 bg-blue-50/30 dark:bg-gray-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-display font-bold text-[var(--color-primary-dark)] dark:text-white mb-4">Pertanyaan & Kontak</h2>
            <p className="text-gray-600 dark:text-gray-300 text-lg">Temukan jawaban atau hubungi kami langsung beserta lokasi studio kami.</p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-start">
            {/* Kiri: FAQ Accordion */}
            <div className="space-y-4">
              {[
                { q: "Apakah hasil cetak langsung jadi saat acara?", a: "Tentu! Mesin fotobooth kami menggunakan printer thermal berkecepatan tinggi, hasil cetak langsung keluar dalam 15 detik saja tanpa harus menunggu acara selesai." },
                { q: "Berapa lama persiapan (loading) di lokasi?", a: "Kami biasanya membutuhkan waktu sekitar 1-1,5 jam sebelum acara dimulai untuk memasang backdrop, lighting, dan kalibrasi kamera." },
                { q: "Apakah mendapat file digital fotonya juga?", a: "Ya, 100%. Setelah sesi foto selesai, tamu dapat langsung men-scan barcode yang tampil di layar monitor untuk mengunduh versi digitalnya langsung ke HP mereka." },
                { q: "Bagaimana sistem DP dan pelunasan?", a: "Booking tanggal akan terkunci secara resmi setelah Anda membayar DP. Sisa pembayaran (pelunasan) dapat dilakukan maksimal H-1 sebelum acara dimulai." }
              ].map((faq, i) => (
                <FAQItem key={i} q={faq.q} a={faq.a} />
              ))}
            </div>

            {/* Kanan: Kirim Pesan & Gmaps */}
            <div className="space-y-8">
              {/* Pesan WA */}
              <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl border border-slate-100 dark:border-gray-700 p-8">
                <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-3">Tanya via WhatsApp</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">Konsultasikan kebutuhan acara Anda secara langsung dengan tim kami. Tanpa syarat booking!</p>
                <form onSubmit={(e) => {
                  e.preventDefault();
                  const msg = e.target.pesan.value;
                  window.open(`https://wa.me/6281253776037?text=${encodeURIComponent(msg)}`, '_blank');
                }}>
                  <textarea name="pesan" rows="3" className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] mb-4 bg-gray-50 dark:bg-gray-700 dark:text-white resize-none" placeholder="Ketik pertanyaan atau detail acara Anda di sini..."></textarea>
                  <button type="submit" className="w-full bg-gradient-to-r from-[var(--color-primary-dark)] to-[var(--color-primary)] text-white font-bold py-4 rounded-xl shadow-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2">
                    <MessageCircle size={20} /> Kirim Pesan WA Sekarang
                  </button>
                </form>
              </div>

              {/* Gmaps */}
              <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl border border-slate-100 dark:border-gray-700 p-8">
                <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">Lokasi Studio Kami</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6 flex items-start gap-2">
                  <svg className="w-5 h-5 mt-0.5 flex-shrink-0 text-[var(--color-primary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                  <span>Sungai Jingah<br />Kota Banjarmasin, Kalimantan Selatan</span>
                </p>
                <div className="h-64 overflow-hidden relative group rounded-2xl">
                  <div className="absolute inset-0 bg-black/5 dark:bg-white/5 z-10 pointer-events-none group-hover:bg-transparent transition-colors rounded-2xl"></div>
                  <iframe
                    src="https://www.google.com/maps?q=-3.3017805,114.6087531&hl=id&z=15&output=embed"
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    className="rounded-2xl opacity-90 dark:opacity-75 group-hover:opacity-100 transition-opacity"
                    allowFullScreen=""
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                  ></iframe>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
