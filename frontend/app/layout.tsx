'use client';

import './globals.css';
import type { Metadata } from 'next';
import { usePathname } from 'next/navigation';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <head>
        <title>Santi Learning Hub — Mazos de Estudio</title>
        <meta name="description" content="Plataforma de flashcards interactivas para estudiar diferentes cursos universitarios." />
      </head>
      <body>
        <NavbarWrapper />
        {children}
      </body>
    </html>
  );
}

function NavbarWrapper() {
  const pathname = usePathname();
  return (
    <nav className="navbar">
      <a href="/" className="navbar-brand">
        <span className="logo-icon">🧠</span>
        Santi Learning Hub
      </a>
      <div className="navbar-links">
        <a href="/" className={pathname === '/' ? 'active' : ''}>
          Mazos
        </a>
        <a href="/admin" className={pathname?.startsWith('/admin') ? 'active' : ''} style={{ position: 'relative' }}>
          Admin
          {!pathname?.startsWith('/admin') && (
            <span className="admin-badge" title="Panel de administración" />
          )}
        </a>
      </div>
    </nav>
  );
}
