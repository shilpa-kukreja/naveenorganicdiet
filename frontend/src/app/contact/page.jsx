// "use client";
// import React from 'react'
// import Header from '../componats/Header';
// import Footer from '../componats/Footer';
// import Breadcrumb from '../componats/Breadcrumb';
// import ContactSec from '../componats/ContactSec';

// function page() {
//   return (
//     <div>
//         <Header />
//         <Breadcrumb img="Banner/bg2.jpg" />
//         <ContactSec />
//         <div className=' '>
//             <iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3503.896330608208!2d77.37941579999999!3d28.5728756!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x390ce527c8c099bb%3A0xbf9711b8bc3f91f8!2sRecreators%20Design%20%26%20Media%20Pvt%20Ltd!5e0!3m2!1sen!2sin!4v1762851409707!5m2!1sen!2sin" width="100%" height="450" style={{border:0}}  loading="lazy" ></iframe>
//         </div>
//         <Footer />
//     </div>
//   )
// }

// export default page



"use client";
import React from 'react'
import Header from '../componats/Header';
import Footer from '../componats/Footer';
import Breadcrumb from '../componats/Breadcrumb';
import ContactSec from '../componats/ContactSec';

function ContactPage() {
  return (
    <div>
        <Header />
        <Breadcrumb pageType="contact" />
        <ContactSec />
        <div className='max-w-8xl  px-4 sm:px-6 mx-auto lg:px-16 pb-5 rounded-lg shadow-md'>
            <iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3503.896330608208!2d77.37941579999999!3d28.5728756!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x390ce527c8c099bb%3A0xbf9711b8bc3f91f8!2sRecreators%20Design%20%26%20Media%20Pvt%20Ltd!5e0!3m2!1sen!2sin!4v1762851409707!5m2!1sen!2sin" width="100%" height="450" style={{border:0}}  loading="lazy" ></iframe>
        </div>
        <Footer />
    </div>
  )
}

export default ContactPage;
