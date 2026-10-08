import { Link } from 'react-router-dom';
import ThemeToggle from './ThemeToggle';

export default function Footer() {
  return (
    <footer className="bg-white dark:bg-gray-950 border-t border-gray-100 dark:border-gray-800 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          
          {/* 1. Brand & Description */}
          <div className="space-y-6">
            <Link to="/" className="inline-block h-12 overflow-hidden bg-white/80 dark:bg-gray-200 rounded-lg px-2">
              <img 
                src="/images/logo.png" 
                alt="Fotoinyu Logo" 
                className="h-full w-auto object-contain scale-[1.5] mix-blend-multiply" 
              />
            </Link>
            <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">
              Layanan photobooth premium #1 di Banjarmasin. Hadirkan memori tak terlupakan untuk Wedding, Birthday, Wisuda, dan Event Spesial Anda dengan studio mini premium kami.
            </p>
          </div>

          {/* 2. Quick Links */}
          <div>
            <h3 className="font-bold text-gray-900 dark:text-white mb-6">Quick Links</h3>
            <ul className="space-y-4">
              {['Home', 'Galeri', 'Testimoni', 'FAQ', 'Paket'].map((link) => (
                <li key={link}>
                  <Link 
                    to={link === 'Home' ? '/' : link === 'Paket' ? '/paket' : `/#${link.toLowerCase()}`}
                    className="text-gray-500 hover:text-[var(--color-primary)] dark:text-gray-400 dark:hover:text-blue-400 transition-colors text-sm"
                  >
                    {link}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* 3. Contact Us */}
          <div>
            <h3 className="font-bold text-gray-900 dark:text-white mb-6">Contact Us</h3>
            <ul className="space-y-4 text-sm text-gray-500 dark:text-gray-400">
              <li>
                Jl. Kayutangi Ujung No. 12<br />
                Banjarmasin Utara, Kalimantan Selatan
              </li>
              <li>
                <span className="block text-gray-900 dark:text-gray-200">Phone:</span>
                <a href="https://wa.me/6281253776037" className="hover:text-[var(--color-primary)] transition-colors">+62 812 5377 6037</a>
              </li>
              <li>
                <span className="block text-gray-900 dark:text-gray-200">Email:</span>
                <a href="mailto:hello@fotoinyu.com" className="hover:text-[var(--color-primary)] transition-colors">hello@fotoinyu.com</a>
              </li>
            </ul>
          </div>

          {/* 4. Follow Us & Dark Mode */}
          <div>
            <h3 className="font-bold text-gray-900 dark:text-white mb-6">Follow Us</h3>
            <div className="flex space-x-4 mb-8">
              <a href="#" aria-label="Facebook" className="w-10 h-10 rounded-full border border-gray-200 dark:border-gray-700 flex items-center justify-center text-gray-500 hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] dark:text-gray-400 dark:hover:border-blue-400 dark:hover:text-blue-400 transition-all">
                <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>
              </a>
              <a href="#" aria-label="Twitter" className="w-10 h-10 rounded-full border border-gray-200 dark:border-gray-700 flex items-center justify-center text-gray-500 hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] dark:text-gray-400 dark:hover:border-blue-400 dark:hover:text-blue-400 transition-all">
                <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"></path></svg>
              </a>
              <a href="#" aria-label="Instagram" className="w-10 h-10 rounded-full border border-gray-200 dark:border-gray-700 flex items-center justify-center text-gray-500 hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] dark:text-gray-400 dark:hover:border-blue-400 dark:hover:text-blue-400 transition-all">
                <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
              </a>
              <a href="#" aria-label="LinkedIn" className="w-10 h-10 rounded-full border border-gray-200 dark:border-gray-700 flex items-center justify-center text-gray-500 hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] dark:text-gray-400 dark:hover:border-blue-400 dark:hover:text-blue-400 transition-all">
                <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path><rect x="2" y="9" width="4" height="12"></rect><circle cx="4" cy="4" r="2"></circle></svg>
              </a>
            </div>
            
            {/* Theme Toggle in Footer as requested */}
            <div className="flex items-center gap-3 mt-4">
              <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Mode Tampilan:</span>
              <ThemeToggle />
            </div>
          </div>

        </div>

        <div className="mt-16 pt-8 border-t border-gray-100 dark:border-gray-800 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            © {new Date().getFullYear()} Fotoinyu Photobooth. All rights reserved.
          </p>
          <div className="flex space-x-6 text-sm text-gray-500 dark:text-gray-400">
            <Link to="/admin" className="hover:text-[var(--color-primary)] transition-colors font-medium">Admin Login</Link>
            <a href="#" className="hover:text-[var(--color-primary)] transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-[var(--color-primary)] transition-colors">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
