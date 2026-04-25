export const metadata = {
  title: 'Search Homes | AI Luxury',
  description: 'Search available luxury properties in Las Vegas and surrounding areas.',
}

export default function SearchPage() {
  return (
    <main className="min-h-screen bg-[#0A0A0A] flex flex-col">
      <div className="px-6 py-10 max-w-7xl mx-auto w-full">
        <h1 className="text-3xl font-light tracking-widest text-[#C9A84C] uppercase mb-2">
          Search Homes
        </h1>
        <p className="text-gray-400 text-sm mb-8">
          Browse available properties in Las Vegas and surrounding areas.
        </p>
      </div>
      <div className="flex-1 w-full px-0">
        <iframe
          src="https://las.mlsmatrix.com/Matrix/public/IDX.aspx?idx=1ac0d97"
          width="100%"
          height="100%"
          frameBorder="0"
          style={{ minHeight: '800px', border: 'none', display: 'block' }}
          title="MLS Property Search"
        />
      </div>
    </main>
  )
}
