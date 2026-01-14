import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-[calc(100dvh-70px)] bg-black text-white flex flex-col items-center justify-center px-6">
      <h2 className="text-7xl md:text-9xl font-black italic uppercase tracking-tighter text-red-600 animate-pulse">404</h2>
      <p className="text-zinc-500 font-black uppercase tracking-[0.3em] mb-8 text-center">La página que buscas no existe o fue eliminada.</p>
      <Link 
        href="/" 
        className="px-8 py-4 bg-white text-black font-black uppercase tracking-widest rounded-2xl hover:bg-red-600 hover:text-white transition-all"
      >
        Volver al Catálogo
      </Link>
    </div>
  )
}