/** @type {import('next').NextConfig} */

const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
        port: "5000",
        pathname: "/uploads/blogs/**",   // blogs folder
      },
      {
        protocol: "http",
        hostname: "localhost",
        port: "5000",
        pathname: "/uploads/category/**",  // categories folder
      },
      {
        protocol: "http",
        hostname: "localhost",
        port: "5000",
        pathname: "/uploads/products/**",  // products folder
      },
       {
        protocol: "http",
        hostname: "localhost",
        port: "5000",
        pathname: "/uploads/addmainbanner/**",  // mainbanner folder
      },
        {
        protocol: "http",
        hostname: "localhost",
        port: "5000",
        pathname: "/uploads/additionalbanner/**",  // mainbanner folder
      },
    ],
  },
};

export default nextConfig;
