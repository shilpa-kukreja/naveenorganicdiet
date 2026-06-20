// export default function CategoryCard({ category }) {
//   return (
//     <Link href={`/category/${category.slug}`}>
//       <div className="bg-white rounded-md shadow-sm transition-all duration-300 group cursor-pointer overflow-hidden border border-[#00a63d] h-full hover:shadow-md">
//         <div className="relative h-48 overflow-hidden">
//           <img
//             src={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}${category.image}`}
//             alt={category.name}
//             className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
//             loading="lazy"
//           />
//           <div className={`absolute inset-0 bg-gradient-to-br ${category.color || 'from-blue-500 to-green-500'} opacity-20 group-hover:opacity-30 transition-opacity duration-300`}></div>
//         </div>
//         <div className="px-3 py-2">
//           <h3 className="text-xl font-semibold text-gray-900 group-hover:text-green-600 text-center transition-colors duration-200">
//             {category.name}
//           </h3>
//         </div>
//       </div>
//     </Link>
//   );
// }