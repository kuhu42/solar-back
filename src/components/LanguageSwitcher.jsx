// import React from 'react';
// import { useLanguage } from '../context/LanguageContext.js'; // ✅ Fixed path
// import { Globe } from 'lucide-react';

// const LanguageSwitcher = () => {
//   const { currentLanguage, languages, changeLanguage, isLoading } = useLanguage();

//   return (
//     <div className="relative inline-block text-left">
//       <div>
//         <button
//           type="button"
//           className="inline-flex items-center justify-center w-full rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
//           onClick={(e) => {
//             e.preventDefault();
//             // Toggle dropdown logic here
//             const dropdown = e.currentTarget.nextElementSibling;
//             dropdown.classList.toggle('hidden');
//           }}
//         >
//           <Globe className="w-4 h-4 mr-2" />
//           {languages[currentLanguage]}
//           <svg className="-mr-1 ml-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
//             <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
//           </svg>
//         </button>
//       </div>

//       <div className="hidden origin-top-right absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
//         <div className="py-1">
//           {Object.entries(languages).map(([code, name]) => (
//             <button
//               key={code}
//               className={`${
//                 currentLanguage === code
//                   ? 'bg-gray-100 text-gray-900'
//                   : 'text-gray-700'
//               } block px-4 py-2 text-sm w-full text-left hover:bg-gray-100`}
//               onClick={() => {
//                 changeLanguage(code);
//                 // Close dropdown after selection
//                 document.querySelector('.origin-top-right').classList.add('hidden');
//               }}
//               disabled={isLoading}
//             >
//               {name} {currentLanguage === code && '✓'}
//             </button>
//           ))}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default LanguageSwitcher;


import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext.js';
import { Globe } from 'lucide-react';

const LanguageSwitcher = () => {
  const { currentLanguage, languages, changeLanguage, isLoading } = useLanguage();
  const [isOpen, setIsOpen] = useState(false); // React state instead of classList

  const handleLanguageChange = (newLanguage) => {
    console.log('🔄 Language change triggered:', newLanguage); // Debug log
    changeLanguage(newLanguage);
    setIsOpen(false); // Close dropdown after selection
  };

  return (
    <div className="relative">
      <div className="flex items-center space-x-2">
        <Globe className="w-4 h-4 text-gray-500" />
        <select
          value={currentLanguage}
          onChange={(e) => handleLanguageChange(e.target.value)}
          disabled={isLoading}
          className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
        >
          {Object.entries(languages).map(([code, name]) => (
            <option key={code} value={code}>
              {name}
            </option>
          ))}
        </select>
        {isLoading && (
          <div className="w-4 h-4 animate-spin rounded-full border-2 border-blue-500 border-t-transparent"></div>
        )}
      </div>
    </div>
  );
};

export default LanguageSwitcher;
