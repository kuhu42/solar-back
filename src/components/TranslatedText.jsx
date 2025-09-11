import { useLanguage } from '../context/LanguageContext.js'; // ✅ Fixed path

export default function TranslatedText({ children, className = '' }) {
  const { t } = useLanguage();
  return <span className={className}>{t(children)}</span>;
}
