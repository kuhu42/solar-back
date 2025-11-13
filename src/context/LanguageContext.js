// import React, { createContext, useContext, useState, useEffect } from 'react';

// const LanguageContext = createContext();

// export const useLanguage = () => {
//   const context = useContext(LanguageContext);
//   if (!context) {
//     throw new Error('useLanguage must be used within a LanguageProvider');
//   }
//   return context;
// };

// export const LanguageProvider = ({ children }) => {
//   const [currentLanguage, setCurrentLanguage] = useState('en');
//   const [translations, setTranslations] = useState({});
//   const [isLoading, setIsLoading] = useState(false);

//   const languages = {
//     'en': 'English',
//     'hi': 'Hindi', 
//     'te': 'Telugu'
//   };

//   // Map language codes for your API
//   const languageMap = {
//     'en': 'en',
//     'hi': 'hi',
//     'te': 'te' // Make sure your API supports Telugu
//   };

//   const translateText = async (text, targetLang) => {
//     try {
//       const response = await fetch('http://localhost:8000/translate', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({
//           text: text,
//           to: languageMap[targetLang] || targetLang
//         })
//       });

//       if (!response.ok) {
//         throw new Error('Translation failed');
//       }

//       const data = await response.json();
//       return data.translatedText || data.result || text; // Adjust based on your API response
//     } catch (error) {
//       console.error('Translation error:', error);
//       return text; // Fallback to original text
//     }
//   };

//   const changeLanguage = async (newLanguage) => {
//     if (newLanguage === currentLanguage) return;
    
//     setIsLoading(true);
//     setCurrentLanguage(newLanguage);
    
//     // Clear translations when changing language
//     if (newLanguage === 'en') {
//       setTranslations({});
//     }
    
//     setIsLoading(false);
//   };

//   const t = async (text, options = {}) => {
//     if (currentLanguage === 'en') {
//       return text; // Return original English text
//     }

//     // Check if translation already exists
//     const cacheKey = `${text}_${currentLanguage}`;
//     if (translations[cacheKey]) {
//       return translations[cacheKey];
//     }

//     // Translate and cache
//     try {
//       const translatedText = await translateText(text, currentLanguage);
//       setTranslations(prev => ({
//         ...prev,
//         [cacheKey]: translatedText
//       }));
//       return translatedText;
//     } catch (error) {
//       console.error('Translation failed:', error);
//       return text;
//     }
//   };

//   const value = {
//     currentLanguage,
//     languages,
//     changeLanguage,
//     t,
//     isLoading
//   };

//   return (
//     <LanguageContext.Provider value={value}>
//       {children}
//     </LanguageContext.Provider>
//   );
// };


// src/context/LanguageContext.jsx


// import React, { createContext, useContext, useState } from 'react';

// import en from '../locales/en.json';
// import hi from '../locales/hi.json';
// import te from '../locales/te.json';

// const dictionaries = { en, hi, te };

// export const LanguageContext = createContext(null);

// export function LanguageProvider({ children }) {
//   const [currentLanguage, setCurrentLanguage] = useState('en');
//   const [translations, setTranslations] = useState(dictionaries['en']);
//   const [isLoading, setIsLoading] = useState(false);

//   const languages = {
//     en: 'English',
//     hi: 'Hindi',
//     te: 'Telugu',
//   };

//   function changeLanguage(newLanguage) {
//     if (newLanguage === currentLanguage) return;
//     setIsLoading(true);
//     setCurrentLanguage(newLanguage);
//     setTranslations(dictionaries[newLanguage] || dictionaries['en']);
//     setIsLoading(false);
//   }

//   function t(key) {
//     return translations[key] || key;
//   }

//   const value = {
//     currentLanguage,
//     languages,
//     changeLanguage,
//     t,
//     isLoading,
//   };

//   // Use React.createElement instead of JSX
//   return React.createElement(LanguageContext.Provider, { value: value }, children);
// }

// export function useLanguage() {
//   const context = useContext(LanguageContext);
//   if (!context) {
//     throw new Error('useLanguage must be used within a LanguageProvider');
//   }
//   return context;
// }


// export default LanguageProvider;




























import React, { createContext, useContext, useState, useEffect } from 'react';

import en from '../locales/en.json';
import hi from '../locales/hi.json';
import te from '../locales/te.json';

const dictionaries = { en, hi, te };

export const LanguageContext = createContext(null);

export function LanguageProvider({ children }) {
  const [currentLanguage, setCurrentLanguage] = useState('en');
  const [translations, setTranslations] = useState(dictionaries['en']);
  const [isLoading, setIsLoading] = useState(false);

  const languages = {
    en: 'English',
    hi: 'Hindi',
    te: 'Telugu',
  };

  // This effect ensures translations update when language changes
  useEffect(() => {
    console.log('🔄 Loading translations for:', currentLanguage);
    setIsLoading(true);
    
    // Create a NEW object reference to trigger React re-render
    const newTranslations = { ...dictionaries[currentLanguage] };
    setTranslations(newTranslations);
    setIsLoading(false);
    
    console.log('✅ Translations loaded:', Object.keys(newTranslations).length, 'keys');
  }, [currentLanguage]);

  function changeLanguage(newLanguage) {
    if (newLanguage === currentLanguage) return;
    console.log('🔄 Language change triggered:', newLanguage);
    setCurrentLanguage(newLanguage);
  }

  function t(key) {
    const translation = translations[key] || key;
    console.log('🌐 Translating:', key, '→', translation);
    return translation;
  }

  const value = {
    currentLanguage,
    languages,
    changeLanguage,
    t,
    isLoading,
  };

  return React.createElement(LanguageContext.Provider, { value: value }, children);
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}

export default LanguageProvider;
