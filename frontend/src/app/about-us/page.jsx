// "use client";
// import React from 'react'
// import Header from '../componats/Header'
// import Footer from '../componats/Footer'
// import FeaturesBanner from '../componats/FeaturesBanner'
// import Breadcrumb from '../componats/Breadcrumb'
// import AboutSec from '../componats/AboutSec'
// import Testimonial from '../componats/Testimonial'
// import WhyChoose from '../componats/WhyChoose'
// import AboutBanner from '../componats/AboutBanner'
// import AboutOurProductSec from '../componats/AboutOurProductSec'
// import AboutCoreValue from '../componats/AboutCoreValue'

// const page = () => {
//   return (
//     <div>
//       <Header />
//       <Breadcrumb img="Banner/bg2.jpg" />
//       <AboutSec />
//       <WhyChoose />
//       <AboutCoreValue />
//       <AboutBanner />
//       {/* <AboutOurProductSec /> */}
//       <Testimonial />
//       <FeaturesBanner />
//       <Footer />
//     </div>
//   )
// }

// export default page




"use client";
import React from 'react'
import Header from '../componats/Header'
import Footer from '../componats/Footer'
import FeaturesBanner from '../componats/FeaturesBanner'
import Breadcrumb from '../componats/Breadcrumb'
import AboutSec from '../componats/AboutSec'
import Testimonial from '../componats/Testimonial'
import WhyChoose from '../componats/WhyChoose'
import AboutBanner from '../componats/AboutBanner'
import AboutOurProductSec from '../componats/AboutOurProductSec'
import AboutCoreValue from '../componats/AboutCoreValue'

const page = () => {
  return (
    <div>
      <Header />
      {/* <Breadcrumb img="Banner/bg2.jpg" /> */}
      <Breadcrumb pageType="about" />
      <AboutSec />
      <WhyChoose />
      <AboutCoreValue />
      <AboutBanner />
      {/* <AboutOurProductSec /> */}
      <Testimonial />
      {/* <FeaturesBanner /> */}
      <Footer />
    </div>
  )
}

export default page

