import React from 'react';

async function fetchPromotionalBanners() {
  try {
    // Use relative URL or environment variable for server-side fetching
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/promotionalbanner/all`,
      { cache: 'no-store' } // or revalidate for ISR
    );
    
    if (!response.ok) {
      throw new Error('Failed to fetch banners');
    }
    
    const data = await response.json();
    const activeBanners = data.promotionalbanners?.filter(b => b.status) || [];
    return activeBanners.slice(0, 3);
  } catch (error) {
    console.error('Error fetching promotional banners:', error);
    return [];
  }
}

async function PromotionalBanner() {
  const banners = await fetchPromotionalBanners();

  if (banners.length === 0) {
    return null;
  }

  return (
    <div className='sm:py-12 py-6 mx-auto max-w-8xl  px-4 sm:px-6 lg:px-16'>
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-3 grid-cols-1 gap-3">
          {banners.map((banner, index) => (
            <div key={banner._id} className='pbanner'>
              <img 
                src={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}${banner.image}`} 
                className='w-full rounded-md shadow-md border border-gray-300 h-64 object-cover' 
                alt={`Promotional Banner ${index + 1}`} 
              />
            </div>
          ))}
          
          {banners.length < 3 && Array.from({ length: 3 - banners.length }).map((_, index) => (
            <div key={`placeholder-${index}`} className='pbanner'>
              <div className="w-full h-64 rounded-md border-2 border-dashed border-gray-300 flex items-center justify-center bg-gray-50">
                <span className="text-gray-400">No Banner</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default PromotionalBanner;