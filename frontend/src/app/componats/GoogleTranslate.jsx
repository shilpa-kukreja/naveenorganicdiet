// components/GoogleTranslate/GoogleTranslate.jsx
'use client';

import { useEffect, useState, useRef } from 'react';
import styles from './GoogleTranslate.module.css';

const GoogleTranslate = () => {
    const [isInitialized, setIsInitialized] = useState(false);
    const [selectedLanguage, setSelectedLanguage] = useState('en');
    const scriptAdded = useRef(false);

    // Available languages with flags and names
    const languages = [
        { code: 'en', name: 'English', flag: '🇺🇸' },
        { code: 'hi', name: 'हिन्दी', flag: '🇮🇳' },
        { code: 'bn', name: 'বাংলা', flag: '🇧🇩' },
        { code: 'ta', name: 'தமிழ்', flag: '🇮🇳' },
        { code: 'te', name: 'తెలుగు', flag: '🇮🇳' },
        { code: 'mr', name: 'मराठी', flag: '🇮🇳' },
        { code: 'gu', name: 'ગુજરાતી', flag: '🇮🇳' },
        { code: 'pa', name: 'ਪੰਜਾਬੀ', flag: '🇮🇳' },
        { code: 'ur', name: 'اردو', flag: '🇵🇰' },

        { code: 'es', name: 'Español', flag: '🇪🇸' },
        { code: 'fr', name: 'Français', flag: '🇫🇷' },
        { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
        { code: 'it', name: 'Italiano', flag: '🇮🇹' },
        { code: 'pt', name: 'Português', flag: '🇵🇹' },
        { code: 'nl', name: 'Nederlands', flag: '🇳🇱' },
        { code: 'pl', name: 'Polski', flag: '🇵🇱' },
        { code: 'tr', name: 'Türkçe', flag: '🇹🇷' },

        { code: 'ar', name: 'العربية', flag: '🇸🇦' },
        { code: 'fa', name: 'فارسی', flag: '🇮🇷' },
        { code: 'he', name: 'עברית', flag: '🇮🇱' },

        { code: 'zh-CN', name: '中文 (简体)', flag: '🇨🇳' },
        { code: 'zh-TW', name: '中文 (繁體)', flag: '🇹🇼' },
        { code: 'ja', name: '日本語', flag: '🇯🇵' },
        { code: 'ko', name: '한국어', flag: '🇰🇷' },
        { code: 'th', name: 'ไทย', flag: '🇹🇭' },
        { code: 'vi', name: 'Tiếng Việt', flag: '🇻🇳' },
        { code: 'id', name: 'Bahasa Indonesia', flag: '🇮🇩' },

        { code: 'ru', name: 'Русский', flag: '🇷🇺' },
        { code: 'uk', name: 'Українська', flag: '🇺🇦' },

        { code: 'sw', name: 'Kiswahili', flag: '🇰🇪' },
        // Europe (More)
        { code: 'sv', name: 'Svenska', flag: '🇸🇪' },     // Sweden
        { code: 'no', name: 'Norsk', flag: '🇳🇴' },       // Norway
        { code: 'da', name: 'Dansk', flag: '🇩🇰' },       // Denmark
        { code: 'fi', name: 'Suomi', flag: '🇫🇮' },       // Finland
        { code: 'el', name: 'Ελληνικά', flag: '🇬🇷' },   // Greece
        { code: 'cs', name: 'Čeština', flag: '🇨🇿' },    // Czech
        { code: 'hu', name: 'Magyar', flag: '🇭🇺' },     // Hungary
        { code: 'ro', name: 'Română', flag: '🇷🇴' },     // Romania
        { code: 'bg', name: 'Български', flag: '🇧🇬' }, // Bulgaria
        // Asia (More)
        { code: 'ms', name: 'Bahasa Melayu', flag: '🇲🇾' }, // Malaysia
        { code: 'km', name: 'ខ្មែរ', flag: '🇰🇭' },        // Cambodia
        { code: 'lo', name: 'ລາວ', flag: '🇱🇦' },          // Laos
        { code: 'my', name: 'မြန်မာ', flag: '🇲🇲' },       // Myanmar
        { code: 'ne', name: 'नेपाली', flag: '🇳🇵' },       // Nepal
        { code: 'si', name: 'සිංහල', flag: '🇱🇰' },       // Sri Lanka
        // Middle East / Africa
        { code: 'am', name: 'አማርኛ', flag: '🇪🇹' },       // Ethiopia
        { code: 'yo', name: 'Yorùbá', flag: '🇳🇬' },       // Nigeria
        { code: 'zu', name: 'isiZulu', flag: '🇿🇦' },      // South Africa
        // Americas
        { code: 'pt-BR', name: 'Português (Brasil)', flag: '🇧🇷' },
        { code: 'es-MX', name: 'Español (México)', flag: '🇲🇽' },
    ];


    useEffect(() => {
        const initializeGoogleTranslate = () => {
            // Clear previous instance if exists
            const existingWidget = document.querySelector('.goog-te-banner-frame');
            if (existingWidget) {
                existingWidget.remove();
            }

            // Initialize Google Translate
            if (window.google && window.google.translate) {
                new window.google.translate.TranslateElement(
                    {
                        pageLanguage: 'en',
                        includedLanguages: `
                         en,hi,bn,ta,te,mr,gu,pa,ur,
                         es,fr,de,it,pt,pt-BR,es-MX,nl,pl,tr,
                         sv,no,da,fi,el,cs,hu,ro,bg,
                         ar,fa,he,
                         zh-CN,zh-TW,ja,ko,th,vi,id,ms,km,lo,my,ne,si,
                        ru,uk,
                        sw,am,yo,zu,
                        `.replace(/\s+/g, ''),


                        layout: window.google.translate.TranslateElement.InlineLayout.HORIZONTAL,
                        autoDisplay: false,
                        multilanguagePage: true,
                    },
                    'google_translate_element'
                );

                setIsInitialized(true);

                // Hide the Google branding
                setTimeout(() => {
                    const googleBranding = document.querySelector('.goog-logo-link');
                    const googleText = document.querySelector('.goog-te-gadget span');
                    if (googleBranding) googleBranding.style.display = 'none';
                    if (googleText) googleText.style.display = 'none';
                }, 100);
            }
        };

        // Add Google Translate script
        const addScript = () => {
            if (scriptAdded.current) return;

            const script = document.createElement('script');
            script.src = 'https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
            script.async = true;
            document.head.appendChild(script);

            scriptAdded.current = true;
        };

        // Define global callback
        window.googleTranslateElementInit = initializeGoogleTranslate;

        if (!window.google || !window.google.translate) {
            addScript();
        } else {
            initializeGoogleTranslate();
        }

        return () => {
            // Cleanup
            const iframes = document.querySelectorAll('.goog-te-banner-frame, .goog-te-menu-frame');
            iframes.forEach(iframe => iframe.remove());
        };
    }, []);

    // Custom language change handler
    const handleLanguageChange = (langCode) => {
        setSelectedLanguage(langCode);

        // Use Google Translate API
        if (window.google && window.google.translate) {
            const translateInstance = new window.google.translate.TranslateElement({
                pageLanguage: 'en',
                includedLanguages: `
                 en,hi,bn,ta,te,mr,gu,pa,ur,
                 es,fr,de,it,pt,pt-BR,es-MX,nl,pl,tr,
                 sv,no,da,fi,el,cs,hu,ro,bg,
                 ar,fa,he,
                 zh-CN,zh-TW,ja,ko,th,vi,id,ms,km,lo,my,ne,si,
                 ru,uk,
                sw,am,yo,zu,
                `.replace(/\s+/g, ''),


                autoDisplay: false,
            });

            // Programmatically change language
            const select = document.querySelector('.goog-te-combo');
            if (select) {
                select.value = langCode;
                select.dispatchEvent(new Event('change'));
            }
        }
    };

    // Get current language name
    const getCurrentLanguage = () => {
        return languages.find(lang => lang.code === selectedLanguage) || languages[0];
    };

    return (
        <div className={styles.translateContainer}>
            {/* Custom Dropdown (Professional Version) */}
            <div className={styles.customDropdown}>
                <div className={styles.dropdownHeader}>
                    <span className={styles.currentFlag}>{getCurrentLanguage().flag}</span>
                    <span className={styles.currentLanguage}>{getCurrentLanguage().name}</span>
                    <svg className={styles.chevron} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path d="M6 9l6 6 6-6" />
                    </svg>
                </div>

                <div className={styles.dropdownMenu}>
                    {languages.map((language) => (
                        <button
                            key={language.code}
                            className={`${styles.languageOption} ${selectedLanguage === language.code ? styles.active : ''}`}
                            onClick={() => handleLanguageChange(language.code)}
                        >
                            <span className={styles.flag}>{language.flag}</span>
                            <span className={styles.name}>{language.name}</span>
                            {selectedLanguage === language.code && (
                                <svg className={styles.check} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                    <path d="M20 6L9 17l-5-5" />
                                </svg>
                            )}
                        </button>
                    ))}
                </div>
            </div>

            {/* Google Translate Widget (Hidden but functional) */}
            <div id="google_translate_element" style={{ display: 'none' }}></div>
        </div>
    );
};

export default GoogleTranslate;