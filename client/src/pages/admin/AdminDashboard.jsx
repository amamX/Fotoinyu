import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { LayoutDashboard, Users, Calendar, Settings, LogOut, CheckCircle, Clock, Undo2, Printer, KeyRound, Eye, EyeOff, LayoutTemplate, Download, ImagePlus, MessageSquarePlus, CheckSquare, Trash2, X, Menu, Package, XCircle, Banknote, PlusCircle } from 'lucide-react';
import Cropper from 'react-easy-crop';
import getCroppedImg from '../../utils/cropImage';
import { supabase } from '../../lib/supabase';
import Swal from 'sweetalert2';
import html2pdf from 'html2pdf.js';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('booking');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [bookings, setBookings] = useState([]);
  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  // Custom Toast State
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false }), 3500);
  };

  // Konten State
  const [galleryItems, setGalleryItems] = useState([]);
  const [testimonials, setTestimonials] = useState([]);
  const [testiName, setTestiName] = useState('');
  const [testiEvent, setTestiEvent] = useState('');
  const [testiText, setTestiText] = useState('');

  // Paket State
  const [packages, setPackages] = useState([]);
  
  // Stats State
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  // Crop State
  const [imageToCrop, setImageToCrop] = useState(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

  // New Package State
  const [newPkgName, setNewPkgName] = useState('');
  const [newPkgPrice, setNewPkgPrice] = useState('');
  const [newPkgFeatures, setNewPkgFeatures] = useState('');

  useEffect(() => {
    const fetchBookings = async () => {
      const { data } = await supabase.from('bookings').select('*').order('createdAt', { ascending: false });
      if (data) setBookings(data);
    };
    fetchBookings();

    const fetchPackages = async () => {
      const { data } = await supabase.from('packages').select('*').order('id', { ascending: true });
      if (data) setPackages(data);
    };
    fetchPackages();

    const fetchGallery = async () => {
      const { data } = await supabase.from('gallery').select('*').order('created_at', { ascending: false });
      if (data) setGalleryItems(data);
    };
    fetchGallery();

    const fetchTestimonials = async () => {
      const { data } = await supabase.from('testimonials').select('*').order('created_at', { ascending: false });
      if (data) setTestimonials(data);
    };
    fetchTestimonials();

    const bookingsSub = supabase
      .channel('bookings_channel')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'bookings' }, () => {
        showToast('Pesanan baru masuk atau status diperbarui!', 'success');
        fetchBookings();
      })
      .subscribe();

    const gallerySub = supabase
      .channel('gallery_channel')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'gallery' }, () => {
        fetchGallery();
      })
      .subscribe();

    const testiSub = supabase
      .channel('testi_channel')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'testimonials' }, () => {
        fetchTestimonials();
      })
      .subscribe();

    const pkgSub = supabase
      .channel('admin_pkg_channel')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'packages' }, () => {
        fetchPackages();
      })
      .subscribe();

    return () => { 
      supabase.removeChannel(bookingsSub); 
      supabase.removeChannel(gallerySub); 
      supabase.removeChannel(testiSub); 
      supabase.removeChannel(pkgSub); 
    };
  }, []);

  const updateBookingStatus = async (code, newStatus) => {
    const { error } = await supabase.from('bookings').update({ status: newStatus }).eq('code', code);
    if (!error) {
      setBookings(bookings.map(b => b.code === code ? { ...b, status: newStatus } : b));
      showToast('Status pesanan berhasil diperbarui');
    }
  };

  const deleteBooking = async (code) => {
    Swal.fire({
      title: 'Hapus Pesanan?',
      text: "Data booking ini akan dihapus secara permanen!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#94a3b8',
      confirmButtonText: 'Ya, hapus!',
      cancelButtonText: 'Batal'
    }).then(async (result) => {
      if (result.isConfirmed) {
        const { error } = await supabase.from('bookings').delete().eq('code', code);
        if (!error) {
          setBookings(bookings.filter(b => b.code !== code));
          showToast('Pesanan berhasil dihapus');
        }
      }
    });
  };

  const handlePrint = (code) => {
    const booking = bookings.find(b => b.code === code);
    if (!booking) return;

    showToast('Sedang membuat PDF...');

    const div = document.createElement('div');
    div.style.position = 'absolute';
    div.style.left = '-9999px';
    div.style.top = '-9999px';
    div.innerHTML = `
      <div style="padding: 40px; font-family: sans-serif; background: white; color: black; width: 800px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="font-size: 24px; font-weight: bold; margin-bottom: 10px;">
            ${booking.status === 'completed' ? 'INVOICE LUNAS (FULL)' : 'INVOICE LUNAS (DP)'}
          </h1>
          <p style="color: #64748b;">Terima kasih atas pesanan Anda.</p>
        </div>
        
        <div style="background: #f8fafc; padding: 20px; border-radius: 12px; margin-bottom: 30px;">
          <div style="display: flex; justify-content: space-between; border-bottom: 1px solid #e2e8f0; padding-bottom: 15px; margin-bottom: 15px;">
            <div>
              <div style="font-size: 12px; color: #64748b;">Kode Booking</div>
              <div style="font-size: 16px; font-weight: bold;">${booking.code}</div>
            </div>
            <div style="text-align: right;">
              <div style="font-size: 12px; color: #64748b;">Tanggal Transaksi</div>
              <div style="font-weight: 500;">${new Date(booking.createdAt || Date.now()).toLocaleDateString('id-ID')}</div>
            </div>
          </div>
          
          <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
            <span style="color: #64748b;">Nama Pemesan</span>
            <span style="font-weight: 500;">${booking.customerName}</span>
          </div>
          <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
            <span style="color: #64748b;">Paket Terpilih</span>
            <span style="font-weight: 500;">${booking.packageName}</span>
          </div>
          <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
            <span style="color: #64748b;">Tanggal & Jam Acara</span>
            <span style="font-weight: 500;">${booking.date} | ${booking.time}</span>
          </div>
          <div style="display: flex; justify-content: space-between;">
            <span style="color: #64748b;">Total Harga Paket</span>
            <span style="font-weight: 500;">Rp ${booking.totalPrice.toLocaleString('id-ID')}</span>
          </div>
        </div>
        
        <div style="background: ${booking.status === 'completed' ? '#eff6ff' : '#f0fdf4'}; padding: 20px; border-radius: 12px; border: 1px solid ${booking.status === 'completed' ? '#bfdbfe' : '#bbf7d0'};">
          ${booking.status === 'completed' ? `
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <span style="color: #1d4ed8; font-weight: bold;">LUNAS KESELURUHAN</span>
              <span style="font-size: 20px; font-weight: bold; color: #1d4ed8;">Rp ${booking.totalPrice.toLocaleString('id-ID')}</span>
            </div>
          ` : `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
              <span style="color: #15803d; font-weight: bold;">UANG MUKA (DP) DIBAYARKAN</span>
              <span style="font-size: 20px; font-weight: bold; color: #15803d;">Rp ${booking.dpAmount.toLocaleString('id-ID')}</span>
            </div>
            <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid #bbf7d0; padding-top: 15px;">
              <span style="color: #334155; font-weight: bold;">SISA PEMBAYARAN (PELUNASAN)</span>
              <span style="font-size: 18px; font-weight: bold; color: #1e293b;">Rp ${(booking.totalPrice - booking.dpAmount).toLocaleString('id-ID')}</span>
            </div>
          `}
        </div>
      </div>
    `;
    
    const opt = {
      margin:       0.5,
      filename:     `Invoice-${booking.code}.pdf`,
      image:        { type: 'jpeg', quality: 1 },
      html2canvas:  { scale: 2 },
      jsPDF:        { unit: 'in', format: 'letter', orientation: 'portrait' }
    };
    
    document.body.appendChild(div);
    
    html2pdf().set(opt).from(div).save().then(() => {
      document.body.removeChild(div);
    }).catch(err => {
      console.error(err);
      if (document.body.contains(div)) document.body.removeChild(div);
      showToast('Gagal membuat PDF', 'error');
    });
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if(newPassword.length < 6) return showToast("Password minimal 6 karakter", "error");
    
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    
    if (error) {
      showToast('Gagal mengubah password', 'error');
    } else {
      showToast('Password berhasil diubah secara permanen!');
      setNewPassword('');
      setShowPassword(false);
    }
  };

  // --- CONTENT MANAGEMENT LOGIC ---
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if(!file) return;
    const reader = new FileReader();
    reader.onload = (upload) => {
      setImageToCrop(upload.target.result);
      e.target.value = null; // reset input
    };
    reader.readAsDataURL(file);
  };

  const onCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleCropSave = async () => {
    try {
      const croppedImage = await getCroppedImg(imageToCrop, croppedAreaPixels);
      const { error } = await supabase.from('gallery').insert([{ image_url: croppedImage }]);
      if(!error) {
        showToast('Foto berhasil diunggah ke Galeri Pelanggan!');
        setImageToCrop(null);
      } else {
        showToast('Gagal menyimpan ke database', 'error');
      }
    } catch (e) {
      console.error(e);
      showToast('Gagal memotong gambar', 'error');
    }
  };

  const deleteGalleryItem = (index) => {
    Swal.fire({
      title: 'Hapus Foto?',
      text: "Foto ini akan dihapus dari galeri.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#94a3b8',
      confirmButtonText: 'Ya, hapus!',
      cancelButtonText: 'Batal'
    }).then(async (result) => {
      if (result.isConfirmed) {
        const item = galleryItems[index];
        const { error } = await supabase.from('gallery').delete().eq('id', item.id);
        if(!error) {
          showToast('Foto berhasil dihapus');
        } else {
          showToast('Gagal menghapus foto', 'error');
        }
      }
    });
  };

  const handleAddTestimonial = async (e) => {
    e.preventDefault();
    if(!testiName || !testiText) return;
    
    const { error } = await supabase.from('testimonials').insert([{ name: testiName, event: testiEvent, text: testiText }]);
    
    if(!error) {
      showToast('Testimoni berhasil ditambahkan ke Beranda!');
      setTestiName('');
      setTestiEvent('');
      setTestiText('');
    } else {
      showToast('Gagal menambah testimoni', 'error');
    }
  };

  const deleteTestimonial = (index) => {
    Swal.fire({
      title: 'Hapus Testimoni?',
      text: "Testimoni ini akan dihapus permanen.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#94a3b8',
      confirmButtonText: 'Ya, hapus!',
      cancelButtonText: 'Batal'
    }).then(async (result) => {
      if (result.isConfirmed) {
        const id = testimonials[index].id;
        const { error } = await supabase.from('testimonials').delete().eq('id', id);
        if(!error) showToast('Testimoni berhasil dihapus');
      }
    });
  };

  // --- STATS LOGIC ---
  const monthlyBookings = bookings.filter(b => {
    // If b.date is "2026-10-15", parse it. Or use b.createdAt if preferred. 
    // Usually bookings are tracked by event date
    const d = new Date(b.date || b.createdAt || Date.now());
    return d.getMonth() === selectedMonth && d.getFullYear() === selectedYear;
  });

  // Pendapatan: Jika 'confirmed' hitung DP, jika 'completed' hitung Total
  const totalPendapatanBulanIni = monthlyBookings.reduce((acc, b) => {
    if (b.status === 'completed') return acc + (b.totalPrice || 1200000);
    if (b.status === 'confirmed') return acc + (b.dpAmount || 300000);
    return acc;
  }, 0);
  
  const exportToCSV = () => {
    const period = new Date(selectedYear, selectedMonth).toLocaleString('id-ID', { month: 'long', year: 'numeric' });
    let tableStr = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
      <head>
        <meta charset="utf-8" />
        <style>
          table { border-collapse: collapse; font-family: Arial, sans-serif; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background-color: #f3f4f6; font-weight: bold; }
          .header-row th { background-color: #e5e7eb; }
          .title { font-size: 16px; font-weight: bold; text-align: center; background-color: #1e3a8a; color: white; padding: 10px; }
          .subtitle { text-align: center; font-weight: bold; background-color: #eff6ff; padding: 5px; }
          .summary-row td { background-color: #e5e7eb; font-weight: bold; }
        </style>
      </head>
      <body>
      <table>
        <tr><th colspan="8" class="title">LAPORAN KEUANGAN BOOKING FOTOINYU</th></tr>
        <tr><th colspan="8" class="subtitle">Periode: ${period}</th></tr>
        <tr><td colspan="8"></td></tr>
        <tr class="header-row">
          <th>Kode Invoice</th>
          <th>Nama Pemesan</th>
          <th>No. WA</th>
          <th>Paket</th>
          <th>Tgl Acara</th>
          <th>Status</th>
          <th>Total Harga</th>
          <th>Nominal DP</th>
        </tr>
    `;

    monthlyBookings.forEach(b => {
      tableStr += `
        <tr>
          <td>${b.code}</td>
          <td>${b.customerName}</td>
          <td>${b.waNumber || '-'}</td>
          <td>${b.packageName}</td>
          <td>${b.date}</td>
          <td>${b.status.toUpperCase()}</td>
          <td>Rp ${b.totalPrice.toLocaleString('id-ID')}</td>
          <td>Rp ${b.dpAmount.toLocaleString('id-ID')}</td>
        </tr>
      `;
    });

    tableStr += `
        <tr><td colspan="8"></td></tr>
        <tr class="summary-row">
          <td colspan="6" style="text-align: right;">TOTAL PENDAPATAN BULAN INI</td>
          <td colspan="2">Rp ${totalPendapatanBulanIni.toLocaleString('id-ID')}</td>
        </tr>
        <tr class="summary-row">
          <td colspan="6" style="text-align: right;">TOTAL PEMESANAN</td>
          <td colspan="2">${monthlyBookings.length} Pesanan</td>
        </tr>
      </table>
      </body></html>
    `;

    const blob = new Blob([tableStr], { type: 'application/vnd.ms-excel' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `Laporan_Fotoinyu_${selectedMonth+1}_${selectedYear}.xls`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const togglePackage = async (id) => {
    const pkg = packages.find(p => p.id === id);
    if(!pkg) return;
    const { error } = await supabase.from('packages').update({ disabled: !pkg.disabled }).eq('id', id);
    if(!error) {
      setPackages(packages.map(p => p.id === id ? { ...p, disabled: !p.disabled } : p));
      showToast('Status paket berhasil diperbarui');
    } else {
      showToast('Gagal update paket', 'error');
    }
  };

  const handleAddPackage = async (e) => {
    e.preventDefault();
    if (!newPkgName || !newPkgPrice || !newPkgFeatures) return;
    
    const featuresArray = newPkgFeatures.split(',').map(f => f.trim()).filter(f => f);
    const newPkg = {
      name: newPkgName,
      price: parseInt(newPkgPrice),
      features: featuresArray,
      disabled: false
    };
    
    const { data, error } = await supabase.from('packages').insert([newPkg]).select();
    if(!error && data) {
      setPackages([...packages, data[0]]);
      showToast('Paket baru berhasil ditambahkan!');
      setNewPkgName('');
      setNewPkgPrice('');
      setNewPkgFeatures('');
    } else {
      console.error("Supabase insert error:", error);
      showToast('Gagal menambah paket', 'error');
    }
  };

  const deletePackage = (id) => {
    Swal.fire({
      title: 'Hapus Paket?',
      text: "Paket ini akan dihapus permanen.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#94a3b8',
      confirmButtonText: 'Ya, hapus!',
      cancelButtonText: 'Batal'
    }).then(async (result) => {
      if (result.isConfirmed) {
        const { error } = await supabase.from('packages').delete().eq('id', id);
        if(!error) {
          setPackages(packages.filter(p => p.id !== id));
          showToast('Paket berhasil dihapus');
        } else {
          showToast('Gagal menghapus paket', 'error');
        }
      }
    });
  };

  return (
    <div className="h-screen w-full bg-slate-50 flex overflow-hidden">
      
      {/* Overlay for mobile sidebar */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 z-30 md:hidden backdrop-blur-sm"
          onClick={() => setIsMobileMenuOpen(false)}
        ></div>
      )}

      {/* Sidebar */}
      <div className={`fixed md:relative top-0 left-0 w-64 h-full bg-slate-900 text-white flex flex-col z-40 transform transition-transform duration-300 ease-in-out ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 shadow-2xl md:shadow-none`}>
        <div className="p-6 flex justify-between items-center border-b border-slate-800/50">
          <div className="flex items-center gap-3">
            <img src="/images/logo.png" alt="Fotoinyu Logo" className="w-12 h-12 object-contain bg-white rounded-lg p-1" />
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight">Admin Panel</h2>
              <p className="text-[10px] text-blue-400 uppercase tracking-wider font-bold">Fotoinyu App</p>
            </div>
          </div>
          <button className="md:hidden text-slate-400 hover:text-white" onClick={() => setIsMobileMenuOpen(false)}>
            <X size={24} />
          </button>
        </div>
        
        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          <button 
            onClick={() => { setActiveTab('booking'); setIsMobileMenuOpen(false); }}
            className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all font-medium ${activeTab === 'booking' ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'}`}
          >
            <Calendar size={20} /> Manajemen Booking
          </button>
          <button 
            onClick={() => { setActiveTab('stats'); setIsMobileMenuOpen(false); }}
            className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all font-medium ${activeTab === 'stats' ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'}`}
          >
            <LayoutDashboard size={20} /> Laporan & Statistik
          </button>
          <button 
            onClick={() => { setActiveTab('content'); setIsMobileMenuOpen(false); }}
            className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all font-medium ${activeTab === 'content' ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'}`}
          >
            <LayoutTemplate size={20} /> Konten & Paket
          </button>
          <button 
            onClick={() => { setActiveTab('settings'); setIsMobileMenuOpen(false); }}
            className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all font-medium ${activeTab === 'settings' ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'}`}
          >
            <Settings size={20} /> Pengaturan Akun
          </button>
        </nav>

        <div className="p-4 border-t border-slate-800 bg-slate-900/50">
          <button 
            onClick={() => navigate('/admin')}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors font-medium"
          >
            <LogOut size={20} /> Logout System
          </button>
        </div>
      </div>

      {/* Toast Notification */}
      <div className={`fixed bottom-6 right-6 z-50 transition-all duration-300 transform ${toast.show ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0 pointer-events-none'}`}>
        <div className={`flex items-center gap-3 px-5 py-3 rounded-xl shadow-2xl border ${toast.type === 'error' ? 'bg-red-50 border-red-200 text-red-700' : 'bg-emerald-50 border-emerald-200 text-emerald-700'}`}>
          {toast.type === 'error' ? <X size={20} /> : <CheckCircle size={20} />}
          <span className="font-medium text-sm">{toast.message}</span>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-4 md:p-8 overflow-y-auto overflow-x-hidden text-slate-800 w-full bg-slate-50 relative h-screen">
        <header className="mb-8 flex justify-between items-center bg-white md:bg-transparent p-4 md:p-0 rounded-2xl md:rounded-none shadow-sm md:shadow-none border md:border-none border-slate-200 sticky top-0 z-20 md:relative">
          <div className="flex items-center gap-4">
            <button className="md:hidden p-2 text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200" onClick={() => setIsMobileMenuOpen(true)}>
              <Menu size={24} />
            </button>
            <div>
              <h1 className="text-xl md:text-3xl font-bold text-slate-900 leading-tight">
                {activeTab === 'booking' ? 'Manajemen Booking' : activeTab === 'stats' ? 'Laporan Pendapatan' : activeTab === 'content' ? 'Manajemen Konten & Paket' : 'Pengaturan Akun'}
              </h1>
              <p className="text-xs md:text-sm text-slate-500 mt-1 hidden md:block">
                {activeTab === 'settings' ? 'Ubah password dan preferensi.' : activeTab === 'content' ? 'Kelola galeri, testimoni, dan ketersediaan paket.' : 'Kelola pesanan dan pantau performa bisnis Anda.'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 bg-white md:bg-white/60 md:backdrop-blur-md px-4 py-2 rounded-full shadow-sm border border-slate-200">
            <div className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.6)]"></div>
            <span className="text-sm font-medium text-slate-700 hidden sm:block">Admin Aktif</span>
          </div>
        </header>

        {activeTab === 'settings' && (
          <div className="max-w-md bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
            <div className="flex items-center gap-3 mb-6 text-slate-800">
              <KeyRound size={24} />
              <h3 className="text-xl font-bold text-slate-900">Ubah Password Admin</h3>
            </div>
            <form onSubmit={handleChangePassword}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-slate-700 mb-2">Password Baru</label>
                <div className="relative">
                  <input 
                    type={showPassword ? "text" : "password"} 
                    value={newPassword} 
                    onChange={(e) => setNewPassword(e.target.value)} 
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-slate-900 bg-white" 
                    placeholder="Masukkan password baru" 
                    required 
                  />
                  <button 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>
              <button type="submit" className="w-full bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700 transition-colors mt-2">
                Simpan Password
              </button>
            </form>
          </div>
        )}

        {activeTab === 'content' && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            {/* Paket Management */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col md:col-span-2 lg:col-span-3">
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-3">
                  <Package className="text-indigo-600" />
                  <h3 className="text-lg font-bold text-slate-900">Kelola Status Paket</h3>
                </div>
              </div>
              <div className="mb-6 bg-slate-50 p-4 rounded-xl border border-slate-200">
                <h4 className="font-bold text-slate-800 mb-3 text-sm flex items-center gap-2">
                  <PlusCircle size={16} className="text-indigo-600" /> Tambah Paket Baru
                </h4>
                <form onSubmit={handleAddPackage} className="grid md:grid-cols-4 gap-3">
                  <input type="text" placeholder="Nama Paket (cth: Platinum)" value={newPkgName} onChange={e=>setNewPkgName(e.target.value)} className="px-3 py-2 border border-slate-300 bg-white rounded-lg text-sm outline-none" required />
                  <input type="number" placeholder="Harga (cth: 1500000)" value={newPkgPrice} onChange={e=>setNewPkgPrice(e.target.value)} className="px-3 py-2 border border-slate-300 bg-white rounded-lg text-sm outline-none" required />
                  <input type="text" placeholder="Fitur (pisahkan dgn koma)" value={newPkgFeatures} onChange={e=>setNewPkgFeatures(e.target.value)} className="px-3 py-2 border border-slate-300 bg-white rounded-lg text-sm outline-none md:col-span-2" required />
                  <button type="submit" className="md:col-span-4 bg-indigo-600 text-white font-bold py-2 rounded-lg text-sm hover:bg-indigo-700">Simpan Paket</button>
                </form>
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                {packages.length === 0 && <div className="col-span-3 text-center text-slate-500 py-4">Belum ada paket tersedia</div>}
                {packages.map(pkg => (
                  <div key={pkg.id} className={`border rounded-xl p-4 flex flex-col justify-between ${pkg.disabled ? 'bg-slate-50 border-slate-200' : 'bg-white border-indigo-100'}`}>
                    <div>
                      <div className="flex justify-between items-start mb-2">
                        <h4 className={`font-bold ${pkg.disabled ? 'text-slate-500 line-through' : 'text-slate-900'}`}>{pkg.name}</h4>
                        <div className="flex flex-col gap-1 items-end">
                          {pkg.disabled && <span className="bg-red-100 text-red-600 text-[10px] font-bold px-2 py-0.5 rounded uppercase">Habis</span>}
                          <button onClick={() => deletePackage(pkg.id)} className="text-slate-400 hover:text-red-500" title="Hapus Paket"><Trash2 size={14} /></button>
                        </div>
                      </div>
                      <p className={`text-sm mb-4 ${pkg.disabled ? 'text-slate-400' : 'text-slate-600'}`}>Rp {pkg.price.toLocaleString('id-ID')}</p>
                      <ul className="text-xs text-slate-500 mb-4 list-disc pl-4 space-y-1">
                        {pkg.features.map((f, i) => <li key={i}>{f}</li>)}
                      </ul>
                    </div>
                    <button 
                      onClick={() => togglePackage(pkg.id)}
                      className={`w-full py-2 rounded-lg text-sm font-bold transition-colors ${pkg.disabled ? 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100' : 'bg-red-50 text-red-700 hover:bg-red-100'}`}
                    >
                      {pkg.disabled ? 'Aktifkan Kembali' : 'Tutup / Label Habis'}
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Gallery Upload */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col">
              <div className="flex items-center gap-3 mb-4">
                <ImagePlus className="text-blue-600" />
                <h3 className="text-lg font-bold text-slate-900">Upload Galeri Baru</h3>
              </div>
              <p className="text-sm text-slate-500 mb-4">Pilih file gambar untuk diunggah langsung ke Galeri Beranda pelanggan.</p>
              <div className="mb-6">
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handleFileUpload} 
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg text-slate-900 cursor-pointer file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" 
                />
              </div>
              
              <div className="mt-4 flex-1">
                <h4 className="font-semibold text-slate-700 mb-3">Foto Saat Ini ({galleryItems.length}):</h4>
                <div className="grid grid-cols-4 gap-2 overflow-y-auto max-h-[300px] pr-2">
                  {galleryItems.map((item, idx) => (
                    <div key={idx} className="relative aspect-square rounded-lg overflow-hidden border shadow-sm">
                      <img src={item.image_url} alt="" className="w-full h-full object-cover" />
                      <button 
                        onClick={() => deleteGalleryItem(idx)}
                        className="absolute top-2 right-2 bg-white/90 text-red-500 p-1.5 rounded-md hover:bg-red-500 hover:text-white transition-colors shadow-md"
                        title="Hapus Foto"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col">
              <div className="flex items-center gap-3 mb-4">
                <MessageSquarePlus className="text-green-600" />
                <h3 className="text-lg font-bold text-slate-900">Kelola Testimoni</h3>
              </div>
              <form onSubmit={handleAddTestimonial} className="space-y-3 mb-6">
                <input type="text" value={testiName} onChange={e=>setTestiName(e.target.value)} placeholder="Nama Pelanggan" className="w-full px-4 py-2 border border-slate-300 rounded-lg text-slate-900" required />
                <input type="text" value={testiEvent} onChange={e=>setTestiEvent(e.target.value)} placeholder="Jenis Acara (Contoh: Wedding)" className="w-full px-4 py-2 border border-slate-300 rounded-lg text-slate-900" required />
                <textarea value={testiText} onChange={e=>setTestiText(e.target.value)} placeholder="Isi testimoni..." className="w-full px-4 py-2 border border-slate-300 rounded-lg text-slate-900 h-24 resize-none" required></textarea>
                <button type="submit" className="w-full bg-green-600 text-white font-bold px-4 py-2 rounded-lg text-sm border hover:bg-green-700 transition-colors">
                  Tambahkan Testimoni
                </button>
              </form>

              <div className="mt-2 flex-1 overflow-y-auto max-h-[250px] pr-2 space-y-3">
                <h4 className="font-semibold text-slate-700">Daftar Testimoni ({testimonials.length}):</h4>
                {testimonials.map((t, idx) => (
                  <div key={idx} className="p-3 bg-slate-50 rounded-lg border flex justify-between items-start gap-4">
                    <div>
                      <p className="font-bold text-sm text-slate-800">{t.name} <span className="text-slate-400 font-normal">({t.event})</span></p>
                      <p className="text-xs text-slate-600 line-clamp-2 mt-1">{t.text}</p>
                    </div>
                    <button onClick={() => deleteTestimonial(idx)} className="text-red-500 hover:text-red-700 p-1 flex-shrink-0" title="Hapus">
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'stats' && (
          <div>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 bg-white p-4 rounded-2xl shadow-sm border border-slate-200">
              <div className="flex items-center gap-4 w-full md:w-auto">
                <div className="flex flex-col flex-1 md:flex-none">
                  <label className="text-xs text-slate-500 font-medium mb-1">Pilih Bulan</label>
                  <select 
                    value={selectedMonth} 
                    onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                    className="px-4 py-2 border border-slate-300 rounded-lg text-slate-900 outline-none focus:ring-2 focus:ring-blue-500 font-semibold"
                  >
                    {['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'].map((m, i) => (
                      <option key={i} value={i}>{m}</option>
                    ))}
                  </select>
                </div>
                <div className="flex flex-col">
                  <label className="text-xs text-slate-500 font-medium mb-1">Pilih Tahun</label>
                  <select 
                    value={selectedYear} 
                    onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                    className="px-4 py-2 border border-slate-300 rounded-lg text-slate-900 outline-none focus:ring-2 focus:ring-blue-500 font-semibold"
                  >
                    {[2024, 2025, 2026, 2027, 2028, 2029, 2030, 2031, 2032, 2033, 2034, 2035].map(y => (
                      <option key={y} value={y}>{y}</option>
                    ))}
                  </select>
                </div>
              </div>
              
              <button onClick={exportToCSV} className="w-full md:w-auto flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl font-bold shadow-sm transition-colors mt-2 md:mt-0 text-sm md:text-base">
                <Download size={20} /> Cetak Laporan Excel
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 border-l-4 border-l-blue-500">
                <div className="text-slate-500 text-sm font-medium mb-2">Total Pesanan Bulan Ini</div>
                <div className="text-3xl font-bold text-slate-900">{monthlyBookings.length} <span className="text-sm font-normal text-slate-400">Events</span></div>
              </div>
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 border-l-4 border-l-green-500">
                <div className="text-slate-500 text-sm font-medium mb-2">Pendapatan Bersih Bulan Ini</div>
                <div className="text-4xl font-bold text-emerald-600">Rp {totalPendapatanBulanIni.toLocaleString('id-ID')}</div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'booking' && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-6 border-b border-slate-200 flex justify-between items-center bg-slate-50/50">
              <h3 className="text-lg font-bold text-slate-900">Daftar Transaksi</h3>
            </div>
            <div className="overflow-x-auto">
              {bookings.length === 0 ? (
                <div className="p-8 text-center text-slate-500">Belum ada data pesanan. Coba lakukan booking di web!</div>
              ) : (
                <table className="w-full text-left">
                  <thead className="bg-slate-50 text-slate-500 text-sm border-b border-slate-200">
                    <tr>
                      <th className="px-6 py-4 font-medium">Kode Invoice</th>
                      <th className="px-6 py-4 font-medium">Pemesan</th>
                      <th className="px-6 py-4 font-medium">Paket</th>
                      <th className="px-6 py-4 font-medium">Tanggal Acara</th>
                      <th className="px-6 py-4 font-medium">Status DP / Pelunasan</th>
                      <th className="px-6 py-4 font-medium text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {bookings.map((b, i) => (
                      <tr key={i} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4 font-mono text-sm text-slate-700">{b.code}</td>
                        <td className="px-6 py-4 font-medium text-slate-900">{b.customerName}</td>
                        <td className="px-6 py-4 text-slate-600">{b.packageName}</td>
                        <td className="px-6 py-4 text-slate-600">{b.date}</td>
                        <td className="px-6 py-4">
                          {b.status === 'pending' ? (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-700 border border-orange-200">
                              <Clock size={14} /> Menunggu DP
                            </span>
                          ) : b.status === 'completed' ? (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700 border border-blue-200">
                              <CheckSquare size={14} /> Selesai 100%
                            </span>
                          ) : b.status === 'rejected' ? (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700 border border-red-200">
                              <XCircle size={14} /> Ditolak / Menunggu Refund
                            </span>
                          ) : b.status === 'refunded' ? (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700 border border-slate-300">
                              <Banknote size={14} /> Refund Selesai
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700 border border-green-200">
                              <CheckCircle size={14} /> DP Diterima
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex justify-end gap-2 flex-wrap max-w-[250px] ml-auto">
                            {b.status === 'pending' ? (
                              <>
                                <button onClick={() => updateBookingStatus(b.code, 'confirmed')} className="bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1 shadow-sm">
                                  <CheckCircle size={14} /> Lunas DP
                                </button>
                                <button onClick={() => updateBookingStatus(b.code, 'rejected')} className="bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1 shadow-sm">
                                  <XCircle size={14} /> Tolak Pesanan
                                </button>
                              </>
                            ) : b.status === 'confirmed' ? (
                              <>
                                <button onClick={() => updateBookingStatus(b.code, 'completed')} className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1 shadow-sm" title="Tandai Selesai">
                                  <CheckSquare size={14} /> Selesai
                                </button>
                                <button onClick={() => handlePrint(b.code)} className="bg-slate-800 hover:bg-slate-900 text-white px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1">
                                  <Printer size={14} /> Print DP
                                </button>
                                <button onClick={() => {
                                  Swal.fire({
                                    title: 'Batal & Refund?',
                                    text: "Yakin ingin membatalkan pesanan yang sudah di-DP? Pastikan Anda telah menghubungi pelanggan untuk proses Refund via WA.",
                                    icon: 'warning',
                                    showCancelButton: true,
                                    confirmButtonColor: '#ea580c',
                                    cancelButtonColor: '#94a3b8',
                                    confirmButtonText: 'Ya, Batalkan!',
                                    cancelButtonText: 'Kembali'
                                  }).then((result) => {
                                    if (result.isConfirmed) {
                                      updateBookingStatus(b.code, 'rejected');
                                    }
                                  });
                                }} className="bg-orange-50 text-orange-700 border border-orange-200 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors">
                                  Batal & Refund
                                </button>
                              </>
                            ) : b.status === 'rejected' ? (
                              <button onClick={() => updateBookingStatus(b.code, 'refunded')} className="bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1">
                                <Banknote size={14} /> Tandai Refund Selesai
                              </button>
                            ) : b.status === 'completed' || b.status === 'refunded' ? (
                              <>
                                {b.status === 'completed' && (
                                  <button onClick={() => handlePrint(b.code)} className="bg-slate-800 hover:bg-slate-900 text-white px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1 shadow-sm mr-2">
                                    <Printer size={14} /> Print Lunas
                                  </button>
                                )}
                                <button onClick={() => updateBookingStatus(b.code, 'pending')} className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1">
                                  <Undo2 size={14} /> Reset Status
                                </button>
                              </>
                            ) : null}
                            <button onClick={() => deleteBooking(b.code)} className="bg-red-50 hover:bg-red-100 text-red-600 px-2 py-1.5 rounded-lg transition-colors flex items-center border border-red-100">
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}

      </div>
      {/* Crop Modal */}
      {imageToCrop && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl overflow-hidden flex flex-col">
            <div className="p-4 border-b flex justify-between items-center">
              <h3 className="font-bold text-lg">Potong Gambar</h3>
              <button onClick={() => setImageToCrop(null)} className="text-slate-500 hover:text-slate-700"><X size={20} /></button>
            </div>
            <div className="relative h-[400px] w-full bg-slate-900">
              <Cropper
                image={imageToCrop}
                crop={crop}
                zoom={zoom}
                aspect={1}
                onCropChange={setCrop}
                onCropComplete={onCropComplete}
                onZoomChange={setZoom}
              />
            </div>
            <div className="p-4 border-t flex items-center justify-between bg-slate-50">
              <input
                type="range"
                value={zoom}
                min={1}
                max={3}
                step={0.1}
                aria-labelledby="Zoom"
                onChange={(e) => setZoom(e.target.value)}
                className="w-1/2"
              />
              <div className="flex gap-2">
                <button onClick={() => setImageToCrop(null)} className="px-4 py-2 rounded-lg font-medium text-slate-600 hover:bg-slate-200">Batal</button>
                <button onClick={handleCropSave} className="px-4 py-2 rounded-lg font-bold text-white bg-blue-600 hover:bg-blue-700">Simpan Potongan</button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
