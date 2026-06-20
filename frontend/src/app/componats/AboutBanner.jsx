import React from 'react'

function AboutBanner() {
  return (
    <div className='py-12 bg-gray-50  max-w-8xl  px-4 sm:px-6 lg:px-16'>
      <div className="container mx-auto">
                <div className='flex gap-5'>
                    <div className='basis-1/2'>
                        <img src="PromotionBanner/banner_box2.jpg" className='w-full  border-gray-200 rounded-lg shadow-md' alt="" />
                    </div>
                    <div className='basis-1/2'>
                        <img src="PromotionBanner/banner_box3.jpg" className='w-full rounded-lg shadow-md' alt="" />
                    </div>
                </div>
      </div>
    </div>
  )
}

export default AboutBanner
