import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Santi Learning Hub — Mazos de Estudio',
  description: 'Plataforma de flashcards interactivas para estudiar diferentes cursos.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>
        <nav className="navbar">
          <a href="/" className="navbar-brand">
            <span className="logo-icon">🧠</span>
            Santi Learning Hub
          </a>
          <div className="navbar-links">
            <a href="/">Mazos</a>
            <a href="/admin">Admin</a>
          </div>
        </nav>
        {children}
      </body>
    </html>
  );
}
