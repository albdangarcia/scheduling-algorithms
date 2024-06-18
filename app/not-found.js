import Link from 'next/link'
 
export default function NotFound() {
  return (
    <div className='flex justify-center mt-20'>
      <div className='text-center'>
        <h2 className='text-7xl text-black font-medium'>404</h2>
        <p className='mb-5 font-medium'>Could not find requested resource</p>
        <Link href="/" className='rounded px-4 py-2 bg-black text-white'>Return Home</Link>
      </div>
    </div>
  )
}