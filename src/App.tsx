/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Heart, Crown, Play, SkipBack, SkipForward, Volume2, Download } from 'lucide-react';


const message = "Vira meri jaan Me tum ko aj kehna chahti hoo k tum meray liay itni zyada khass ho k tum soch b nhi sukhti Tumhari jesi dost Allah Naseeb walon ko deta hai ❤️ or dekho me kitni zyada lucky hoon k tum mujhe mili 😍 Tum boht hee zyada Achi ho 💓 or Hamesha mujse boht zyada pyar kerti ho ❤️ Or hamesha mujhe apni behn samjha hai tumne or hamesha mera sath deti ho 🤗 Me kabhi bhi tum ko bhool nhi sukhtikbhi b nhi.. I know tum mujse boht distance pe rehti ho per door reh k bhi mery subse zyada kareeb ho 😘 Mujhe esa mehsoos hee nhi hota k hum kabhi mile hee nhi aik dusaray se esa lgta hai jesy hamesha se hee sath hain Tum mery liay hamesha irreplaceable raho gi 💖 koi bhi tumhari jagh nhi le sukta 😍 Meri dua hai k hum hamesha ❤️ BEST FRIENDS ❤️ rahain or Kbhi b hamaray drmiyaan koi glt fehmi na aai Or hamara relation itna strong hai k koi isy tod nhi sukhta kisi me itni himat nhi k koi hamari dosti ko nazar lga sakay Me Allah ka boht shukar kerti hoo k mujhe tum jesi dost mili 💜 🥰 Tum ba sirf meri bestie ho bulke meri soulmate ho 🌏 meri lifeline ❣ meri sister 💕 meri life 💖 my everything ✨ You mean alot to me meri berry 🍓 I am so glad that I found you 💖 I feel so blessed 🤲";

// Split string but preserve some meaning
const words = message.split(' ');

const ImageFrame = ({ src, alt, rotateClass, name }: { src: string; alt: string; rotateClass: string; name?: string }) => {
  return (
    <div
      className={`relative group cursor-pointer w-full rgb-frame transition-all duration-500 hover:scale-[1.03] ${rotateClass} hover:rotate-0 hover:z-20 bg-white p-2 sm:p-3 pb-9 sm:pb-12`}
    >
      <div className="absolute inset-0 bg-[#c28e7e]/0 group-hover:bg-[#c28e7e]/5 transition-colors z-10 duration-500 pointer-events-none"></div>
      <div className="w-full relative bg-[#f2ede7]">
        <img
          src={src}
          className="w-full h-auto block object-cover transition-transform duration-[2000ms] group-hover:scale-105"
          alt={alt}
          referrerPolicy="no-referrer"
        />
        {/* Glow effect on hover */}
        <div className="absolute inset-0 shadow-[inset_0_0_20px_rgba(0,0,0,0.1)] pointer-events-none"></div>
      </div>
      <div className="absolute bottom-1 sm:bottom-2 left-0 w-full text-center flex flex-col items-center justify-center">
        {name && <span className="font-cursive text-lg sm:text-xl text-[#4a4540] font-bold leading-none">{name}</span>}
        <Heart
          className="w-3 h-3 sm:w-4 sm:h-4 text-[#c28e7e] opacity-0 group-hover:opacity-100 group-hover:animate-bounce transition-all duration-300 drop-shadow-sm mt-0.5 sm:mt-1"
          fill="currentColor"
        />
      </div>
    </div>
  );
};

export default function App() {
  const searchParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : new URLSearchParams();
  const name1 = searchParams.get('n1') || searchParams.get('name1') || "murru";
  const img1 = searchParams.get('i1') || searchParams.get('img1') || "https://ik.imagekit.io/19imy4f1u/lite_1777432062255_b4O1TkoKUT.png";
  const name2 = searchParams.get('n2') || searchParams.get('name2') || "sundari";
  const img2 = searchParams.get('i2') || searchParams.get('img2') || "https://ik.imagekit.io/19imy4f1u/lite_1777432145117_9DRz3sAoev.png";

  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstallable, setIsInstallable] = useState(false);

  // Link Generator State
  const [isGeneratorOpen, setIsGeneratorOpen] = useState(false);
  const [genName1, setGenName1] = useState(name1);
  const [genImg1, setGenImg1] = useState(img1);
  const [genName2, setGenName2] = useState(name2);
  const [genImg2, setGenImg2] = useState(img2);
  const [generatedLink, setGeneratedLink] = useState("");
  const [isCopied, setIsCopied] = useState(false);

  const generateLink = () => {
    const url = new URL(window.location.origin + window.location.pathname);
    url.searchParams.set('n1', genName1);
    url.searchParams.set('i1', genImg1);
    url.searchParams.set('n2', genName2);
    url.searchParams.set('i2', genImg2);
    setGeneratedLink(url.toString());
    setIsCopied(false);
  };

  const copyToClipboard = () => {
    if (generatedLink) {
      navigator.clipboard.writeText(generatedLink);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Security Features: Disable right-click & DevTools shortcuts
    const handleContextMenu = (e: MouseEvent) => e.preventDefault();
    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent structural keys: F12, F11 (Fullscreen), ESC, PrintScreen
      if (
        e.key === 'F12' || e.keyCode === 123 ||
        e.key === 'F11' || e.keyCode === 122 ||
        e.key === 'Escape' ||
        e.key === 'PrintScreen' ||
        (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'i')) ||
        (e.ctrlKey && e.shiftKey && (e.key === 'J' || e.key === 'j')) ||
        (e.ctrlKey && e.shiftKey && (e.key === 'C' || e.key === 'c')) ||
        (e.ctrlKey && (e.key === 'U' || e.key === 'u')) || // View Source
        (e.ctrlKey && (e.key === 'S' || e.key === 's')) || // Save Page
        (e.ctrlKey && (e.key === 'P' || e.key === 'p')) || // Print
        (e.ctrlKey && (e.key === 'A' || e.key === 'a')) || // Select All
        (e.metaKey && e.altKey && (e.key === 'I' || e.key === 'i')) || // Mac DevTools
        (e.metaKey && e.altKey && (e.key === 'U' || e.key === 'u')) || // Mac View Source
        (e.metaKey && (e.key === 'S' || e.key === 's')) // Mac Save Page
      ) {
        e.preventDefault();
        e.stopPropagation();
      }
    };

    const handleCopyCutPaste = (e: ClipboardEvent) => e.preventDefault();
    const handleDragStart = (e: DragEvent) => e.preventDefault();

    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('copy', handleCopyCutPaste);
    document.addEventListener('cut', handleCopyCutPaste);
    document.addEventListener('paste', handleCopyCutPaste);
    document.addEventListener('dragstart', handleDragStart);

    // Simple Anti-Debugging Trap
    // (This will pause execution frequently if DevTools is open)
    const antiDebugInterval = setInterval(() => {
       const start = performance.now();
       debugger;
       if (performance.now() - start > 100) {
         // If execution was paused, DevTools is likely open
         console.clear();
         console.log("%cStop!", "color: red; font-size: 50px; font-weight: bold;");
       }
    }, 2000);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('copy', handleCopyCutPaste);
      document.removeEventListener('cut', handleCopyCutPaste);
      document.removeEventListener('paste', handleCopyCutPaste);
      document.removeEventListener('dragstart', handleDragStart);
      clearInterval(antiDebugInterval);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      console.log('User accepted the install prompt');
    }
    setDeferredPrompt(null);
    setIsInstallable(false);
  };

  return (
    <div className="min-h-screen bg-[#fdfaf6] py-8 sm:py-16 px-4 sm:px-8 selection:bg-[#e8e2d9] font-sans text-[#2d2d2d]">
      {/* PWA Install Button */}
      {isInstallable && (
        <button 
          onClick={handleInstallClick} 
          className="fixed bottom-6 right-6 z-[100] bg-[#ff00ff] text-white p-4 rounded-full shadow-[0_4px_15px_rgba(255,0,255,0.5)] flex items-center justify-center animate-bounce hover:bg-pink-600 transition-colors"
          title="Install App"
        >
          <Download className="w-6 h-6" />
        </button>
      )}

      {/* Link Generator Modal */}
      {isGeneratorOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 font-sans">
          <div className="bg-white rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.3)] w-full max-w-md relative flex flex-col max-h-[90vh] overflow-hidden animate-in fade-in zoom-in duration-300">
            {/* Background Decorations */}
            <div className="absolute top-0 right-0 w-24 h-24 sm:w-32 sm:h-32 bg-pink-100 rounded-bl-full opacity-50 mix-blend-multiply pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 sm:w-32 sm:h-32 bg-rose-100 rounded-tr-full opacity-50 mix-blend-multiply pointer-events-none"></div>

            {/* Close Button */}
            <button 
              onClick={() => setIsGeneratorOpen(false)}
              className="absolute top-4 right-4 bg-white/80 backdrop-blur-md rounded-full w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-800 hover:bg-gray-100 text-2xl leading-none z-50 transition-colors shadow-sm"
            >
              &times;
            </button>

            {/* Header Container (Sticky) */}
            <div className="pt-6 sm:pt-8 pb-2 text-center relative z-10 shrink-0">
              <h2 className="text-2xl sm:text-3xl font-serif font-bold text-gray-800 italic">Create Your Bond</h2>
              <p className="text-xs sm:text-sm text-gray-500 mt-1 sm:mt-2 px-4">Upload photos and names to generate a custom link.</p>
            </div>
            
            {/* Scrollable Body Container */}
            <div className="px-5 sm:px-8 py-4 overflow-y-auto scrollbar-hide flex-1 min-h-0 relative z-10">
              <div className="space-y-4 pb-2">
              
              {/* Person 1 */}
              <div className="bg-gray-50 p-3 sm:p-4 rounded-2xl border border-gray-200 shadow-sm relative overflow-hidden group/card transition-colors">
                <div className="absolute top-0 right-0 w-16 h-16 bg-pink-100/50 rounded-bl-full opacity-50 pointer-events-none"></div>
                <div className="flex items-center gap-2 mb-3 relative z-10">
                   <Crown className="w-4 h-4 text-pink-500" />
                   <h3 className="font-bold text-gray-800 text-sm">Person 1</h3>
                </div>
                <div className="flex gap-3 sm:gap-4 relative z-10">
                  <div className="flex-1">
                    <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">Name</label>
                    <input 
                      type="text" 
                      value={genName1} 
                      onChange={(e) => setGenName1(e.target.value)}
                      className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 sm:py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-pink-400 transition-all shadow-sm"
                      placeholder="E.g. Murru"
                    />
                  </div>
                  <div className="w-20 sm:w-24 shrink-0">
                    <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">Photo</label>
                    <div className="relative group">
                        <input 
                          type="file" 
                          id="file1"
                          accept="image/*"
                          className="hidden"
                          onChange={async (e) => {
                             const file = e.target.files?.[0];
                             if (!file) return;
                             
                             const btn = document.getElementById('uploadText1');
                             if(btn) btn.innerHTML = '<span class="animate-pulse">...</span>';
                             
                             const formData = new FormData();
                             formData.append('file', file);
                             formData.append('fileName', `${genName1 || 'person1'}_${Date.now()}`);
                             formData.append('publicKey', 'public_W8pXprjPHYrYwlWMf811dtUm2Og=');

                             try {
                                 const response = await fetch('https://upload.imagekit.io/api/v1/files/upload', {
                                     method: 'POST',
                                     headers: { 'Authorization': 'Basic ' + btoa('private_Wu/w/ZEmydjv/FbRgVKOffRxtNY=' + ':') },
                                     body: formData
                                 });
                                 const data = await response.json();
                                 if (data.url) setGenImg1(data.url);
                             } catch (err) {
                                 alert("Upload failed.");
                             } finally {
                                 if(btn) btn.innerHTML = 'CHANGE';
                             }
                          }}
                        />
                        <label htmlFor="file1" className="cursor-pointer block relative rounded-xl overflow-hidden shadow-sm aspect-square border-2 border-dashed border-gray-300 hover:border-pink-400 transition-all hover:scale-105 bg-white">
                           {genImg1 ? (
                              <>
                                 <img src={genImg1} className="w-full h-full object-cover group-hover:opacity-60 transition-opacity" alt="Preview 1" />
                                 <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40 backdrop-blur-sm">
                                     <span id="uploadText1" className="text-white font-bold text-[9px] uppercase tracking-wider bg-black/40 px-2 py-1 rounded-full">CHANGE</span>
                                 </div>
                              </>
                           ) : (
                              <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 group-hover:text-pink-500 transition-colors">
                                 <span className="text-2xl leading-none mb-1">+</span>
                                 <span id="uploadText1" className="text-[9px] font-bold uppercase tracking-wider">UPLOAD</span>
                              </div>
                           )}
                        </label>
                    </div>
                  </div>
                </div>
              </div>

              {/* Person 2 */}
              <div className="bg-gray-50 p-3 sm:p-4 rounded-2xl border border-gray-200 shadow-sm relative overflow-hidden group/card transition-colors">
                <div className="absolute top-0 right-0 w-16 h-16 bg-rose-100/50 rounded-bl-full opacity-50 pointer-events-none"></div>
                <div className="flex items-center gap-2 mb-3 relative z-10">
                   <Heart className="w-4 h-4 text-rose-500 fill-rose-500" />
                   <h3 className="font-bold text-gray-800 text-sm">Person 2</h3>
                </div>
                <div className="flex gap-3 sm:gap-4 relative z-10">
                  <div className="flex-1">
                    <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">Name</label>
                    <input 
                      type="text" 
                      value={genName2} 
                      onChange={(e) => setGenName2(e.target.value)}
                      className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 sm:py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-rose-400 transition-all shadow-sm"
                      placeholder="E.g. Sundari"
                    />
                  </div>
                  <div className="w-20 sm:w-24 shrink-0">
                    <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">Photo</label>
                    <div className="relative group">
                        <input 
                          type="file" 
                          id="file2"
                          accept="image/*"
                          className="hidden"
                          onChange={async (e) => {
                             const file = e.target.files?.[0];
                             if (!file) return;
                             
                             const btn = document.getElementById('uploadText2');
                             if(btn) btn.innerHTML = '<span class="animate-pulse">...</span>';
                             
                             const formData = new FormData();
                             formData.append('file', file);
                             formData.append('fileName', `${genName2 || 'person2'}_${Date.now()}`);
                             formData.append('publicKey', 'public_W8pXprjPHYrYwlWMf811dtUm2Og=');

                             try {
                                 const response = await fetch('https://upload.imagekit.io/api/v1/files/upload', {
                                     method: 'POST',
                                     headers: { 'Authorization': 'Basic ' + btoa('private_Wu/w/ZEmydjv/FbRgVKOffRxtNY=' + ':') },
                                     body: formData
                                 });
                                 const data = await response.json();
                                 if (data.url) setGenImg2(data.url);
                             } catch (err) {
                                 alert("Upload failed.");
                             } finally {
                                 if(btn) btn.innerHTML = 'CHANGE';
                             }
                          }}
                        />
                        <label htmlFor="file2" className="cursor-pointer block relative rounded-xl overflow-hidden shadow-sm aspect-square border-2 border-dashed border-gray-300 hover:border-rose-400 transition-all hover:scale-105 bg-white">
                           {genImg2 ? (
                              <>
                                 <img src={genImg2} className="w-full h-full object-cover group-hover:opacity-60 transition-opacity" alt="Preview 2" />
                                 <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40 backdrop-blur-sm">
                                     <span id="uploadText2" className="text-white font-bold text-[9px] uppercase tracking-wider bg-black/40 px-2 py-1 rounded-full">CHANGE</span>
                                 </div>
                              </>
                           ) : (
                              <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 group-hover:text-rose-500 transition-colors">
                                 <span className="text-2xl leading-none mb-1">+</span>
                                 <span id="uploadText2" className="text-[9px] font-bold uppercase tracking-wider">UPLOAD</span>
                              </div>
                           )}
                        </label>
                    </div>
                  </div>
                </div>
              </div>

              {/* Generated Link Box - Inside scrollable area */}
              {generatedLink && (
                <div className="mt-2 p-3 sm:p-4 bg-gradient-to-r from-pink-50 to-rose-50 border border-pink-200 rounded-2xl relative animate-in slide-in-from-bottom-4 zoom-in-95 duration-500 shadow-inner">
                  <p className="text-[10px] font-bold text-pink-500 uppercase tracking-wider mb-2">Your Magic Link</p>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <input 
                      type="text" 
                      readOnly 
                      value={generatedLink}
                      className="flex-1 w-full bg-white border border-pink-200 rounded-xl px-3 py-2 text-xs sm:text-sm text-gray-600 outline-none focus:ring-2 focus:ring-pink-400 transition-all"
                    />
                    <button 
                      onClick={copyToClipboard}
                      className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all shrink-0 ${
                        isCopied 
                          ? 'bg-green-500 text-white shadow-[0_0_15px_rgba(34,197,94,0.4)]' 
                          : 'bg-white border border-pink-200 text-pink-600 hover:bg-pink-50 shadow-sm'
                      }`}
                    >
                      {isCopied ? 'Copied!' : 'Copy Link'}
                    </button>
                  </div>
                </div>
              )}

              </div>
            </div>

            {/* Footer Container (Sticky) */}
            <div className="p-4 sm:p-6 pb-6 sm:pb-8 relative z-10 shrink-0 bg-white/95 backdrop-blur-md border-t border-gray-50 shadow-[0_-10px_20px_rgba(255,255,255,0.8)]">
              <button 
                onClick={generateLink}
                className="w-full bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white font-bold py-3.5 px-6 rounded-2xl transition-all shadow-[0_10px_20px_rgba(244,63,94,0.3)] hover:shadow-[0_10px_25px_rgba(244,63,94,0.4)] transform hover:-translate-y-0.5 text-sm sm:text-base flex items-center justify-center gap-2 group"
              >
                <span>Spark Magic</span>
                <span className="text-xl group-hover:animate-bounce">✨</span>
              </button>
            </div>

          </div>
        </div>
      )}
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-sm border border-[#e8e2d9] p-6 sm:p-14 lg:p-20 relative overflow-hidden">
        
        {/* Decorative corner accent */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#e8e2d9] rounded-bl-full opacity-60 mix-blend-multiply blur-xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-[#d4c8bc] rounded-tr-full opacity-30 mix-blend-multiply blur-2xl pointer-events-none"></div>

        {/* Root content flow block */}
        <motion.div
           initial="hidden"
           animate="visible"
           variants={{
             hidden: { opacity: 1 },
             visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
           }}
           className="relative z-10 flow-root"
        >

          {/* Header Title */}
          <motion.div
             variants={{
                hidden: { opacity: 0, y: -20 },
                visible: { opacity: 1, y: 0, transition: { duration: 1.2, ease: "easeOut" } }
             }}
             className="mb-8 sm:mb-12 mt-16 sm:mt-0 relative z-20"
          >
            {/* Tom & Jerry Sticker Header Image */}
            <motion.img
               initial={{ opacity: 0, rotate: 10, scale: 0.8 }}
               animate={{ opacity: 1, rotate: -5, scale: 1 }}
               transition={{ duration: 1.5, delay: 0.5 }}
               src="https://ik.imagekit.io/19imy4f1u/lite_1777281639765_55fR5xSpF.png"
               className="absolute -top-12 sm:-top-24 right-0 sm:right-12 w-[180px] sm:w-[320px] lg:w-[450px] z-20 object-contain drop-shadow-xl pointer-events-none"
               alt="Tom and Jerry"
            />

            <div className="inline-block bg-[#f1ebe4] text-[#8a7e72] px-3 py-1 rounded-full text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.2em] mb-4 text-left shadow-sm relative z-30">Personal Dedication</div>
            <h1 className="font-serif text-[#1a1a1a] select-none text-left block relative z-30" style={{ lineHeight: 0.9 }}>
              <span className="text-5xl sm:text-7xl lg:text-[8rem] font-bold inline-block align-middle tracking-tighter">
                love 
                <motion.span
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                  className="inline-block ml-2 sm:ml-4 align-middle"
                >
                  <Heart className="w-8 h-8 sm:w-12 sm:h-12 lg:w-14 lg:h-14 text-[#c28e7e] fill-[#c28e7e] mb-2 sm:mb-4" />
                </motion.span>
              </span>
              <br/>
              <span className="text-4xl sm:text-6xl lg:text-[7rem] ml-10 sm:ml-24 lg:ml-32 inline-block tracking-tighter italic text-[#c28e7e] relative">
                you
              </span>
            </h1>
          </motion.div>

          {/* First Float Image */}
          <motion.div
             variants={{
                hidden: { opacity: 0, scale: 0.95 },
                visible: { opacity: 1, scale: 1, transition: { duration: 1, ease: "easeOut" } }
             }}
             className="float-right clear-right w-[40%] max-w-[150px] sm:max-w-[260px] ml-4 sm:ml-8 mb-4 sm:mb-8 z-30 relative"
          >
             <ImageFrame 
               src={img1} 
               alt={name1} 
               rotateClass="rotate-[2deg] sm:rotate-[4deg]" 
               name={name1}
             />
          </motion.div>

          {/* Second Float Image (directly below first float on the right) */}
          <motion.div
             variants={{
                hidden: { opacity: 0, scale: 0.95 },
                visible: { opacity: 1, scale: 1, transition: { duration: 1, ease: "easeOut", delay: 0.2 } }
             }}
             className="float-right clear-right w-[42%] max-w-[160px] sm:max-w-[280px] ml-4 sm:ml-8 mb-4 sm:mb-8 z-30 relative"
          >
             <ImageFrame 
               src={img2} 
               alt={name2} 
               rotateClass="-rotate-[2deg] sm:-rotate-[3deg]" 
               name={name2}
             />
          </motion.div>

          {/* Text content wrapping around both floats */}
          <div className="text-[13px] sm:text-[15px] lg:text-[16px] text-[#4a4540] italic leading-[1.6] sm:leading-[1.7] text-left sm:text-justify max-w-none font-medium">
            {words.map((word, i) => (
              <motion.span
                key={i}
                variants={{
                  hidden: { opacity: 0 },
                  visible: { opacity: 1, transition: { duration: 0.01 } },
                }}
                className="inline-block"
                style={{ marginRight: word === '' ? '0' : '0.25em' }}
              >
                {word}
              </motion.span>
            ))}
            
            {/* Added extra text to fill the empty floated space! */}
            <motion.div
               variants={{
                  hidden: { opacity: 0 },
                  visible: { opacity: 1, transition: { duration: 2, delay: 1 } }
               }}
               className="pt-4 sm:pt-16 mt-8 sm:mt-16 font-cursive text-[22px] sm:text-4xl lg:text-5xl text-[#c28e7e] leading-[2] sm:leading-[2.5] text-left drop-shadow-sm opacity-90 pb-8 clear-both w-full block relative"
            >
              Love you best friend ❤️ <br />
              Love you best friend ❤️ <br />
              Love you best friend ❤️ <br />
              Love you best friend ❤️ <br />
              Love you best friend ❤️ <br />
              Love you best friend ❤️ <br />
              Love you best friend ❤️ <br />
              Love you best friend ❤️

              <motion.img 
                 initial={{ opacity: 0, scale: 0.5 }}
                 animate={{ opacity: 0.5, scale: 1 }}
                 transition={{ duration: 2, delay: 1.5 }}
                 src="https://ik.imagekit.io/19imy4f1u/lite_1777281546218_Yle4AWx7QO.png"
                 className="absolute top-1/4 -left-12 sm:-left-32 w-48 sm:w-80 lg:w-[400px] z-0 mix-blend-multiply pointer-events-none transform rotate-12"
                 alt="Butterflies"
              />
            </motion.div>
          </div>
        </motion.div>

        {/* Small footer accent */}
        <motion.div 
           initial={{ opacity: 0 }}
           animate={{ opacity: 1 }}
           transition={{ delay: 3, duration: 2 }}
           className="mt-16 text-center clear-both relative"
        >
           {/* Butterflies Sticker */}
           <motion.img 
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              transition={{ duration: 2, delay: 1 }}
              src="https://ik.imagekit.io/19imy4f1u/lite_1777281546218_Yle4AWx7QO.png"
              className="absolute -bottom-16 -right-12 sm:-bottom-24 sm:-right-20 w-64 sm:w-96 lg:w-[450px] z-0 mix-blend-multiply pointer-events-none transform -rotate-6"
              alt="Butterflies"
           />
           <div className="inline-block w-16 h-[2px] bg-[#c28e7e] opacity-50 relative z-10"></div>
           <motion.p 
             initial={{ opacity: 0, y: 20 }}
             whileInView={{ opacity: 1, y: 0 }}
             viewport={{ once: true }}
             transition={{ duration: 1, delay: 0.2 }}
             className="font-serif italic font-bold text-2xl sm:text-3xl mt-4 text-[#8a7e72] relative z-10"
           >
             forever & always
           </motion.p>
        </motion.div>

        {/* NEW SECTION: Artistic Circular Layout */}
        <motion.div 
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          className="mt-20 pt-16 border-t-2 border-dashed border-[#e8e2d9] relative w-full flex flex-col items-center"
        >
          {/* Top Hearts / Pulse Line */}
          <div className="w-full flex items-center justify-between px-2 sm:px-12 mb-12 text-[#e11d48]">
            <div className="flex-1 h-[2px] bg-[#e11d48] relative">
               <div className="absolute -top-1 right-0 w-3 h-3 rounded-full bg-[#e11d48]"></div>
            </div>
            <Heart 
              className="mx-4 sm:mx-8 animate-pulse w-8 h-8 sm:w-12 sm:h-12 fill-[#e11d48] text-[#e11d48] filter drop-shadow-md cursor-pointer pointer-events-auto" 
              onDoubleClick={() => setIsGeneratorOpen(true)}
            />
            <div className="flex-1 h-[2px] bg-[#e11d48] relative">
               <div className="absolute -top-1 left-0 w-3 h-3 rounded-full bg-[#e11d48]"></div>
            </div>
          </div>

          {/* Circular Frames Container */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 1, delay: 0.2 }}
            className="flex flex-col md:flex-row items-center justify-center gap-10 md:gap-16 w-full px-4"
          >
            
            {/* Left Circular Frame */}
            <div className="relative group">
              <div className="w-48 h-48 sm:w-56 sm:h-56 rounded-full border-[6px] border-[#fb7185] p-1 shadow-[0_0_25px_rgba(251,113,133,0.6)] group-hover:scale-105 transition-transform duration-500 bg-white">
                 <img src={img1} className="w-full h-full object-cover rounded-full" alt={name1} />
              </div>
              <Heart className="absolute -bottom-2 -left-4 w-10 h-10 sm:w-14 sm:h-14 text-red-500 fill-red-500 drop-shadow-lg rotate-[-20deg] animate-bounce" style={{animationDuration: '3s'}} />
              <div className="absolute top-4 -left-6 text-3xl opacity-80 filter drop-shadow hover:scale-125 transition-transform duration-300">🥺</div>
            </div>

            {/* Center Text Area */}
            <div className="flex flex-col items-center justify-center text-center max-w-sm mt-4 md:mt-0">
               <motion.h2 
                 initial={{ opacity: 0, scale: 0.8 }}
                 whileInView={{ opacity: 1, scale: 1 }}
                 viewport={{ once: true }}
                 transition={{ duration: 0.8, delay: 0.4 }}
                 className="font-cursive text-5xl sm:text-6xl font-bold mb-6 text-[#1a1a1a] drop-shadow-sm tracking-wide"
               >
                 Best Friends
               </motion.h2>
               <div className="flex items-center gap-3">
                  <span className="text-3xl filter drop-shadow-sm rotate-[-10deg]">🦋</span>
                  <span className="text-4xl filter drop-shadow-sm animate-pulse">✨</span>
                  <span className="text-3xl filter drop-shadow-sm rotate-[10deg]">🦋</span>
               </div>
            </div>

            {/* Right Circular Frame */}
            <div className="relative group">
              <div className="w-48 h-48 sm:w-56 sm:h-56 rounded-full border-[6px] border-[#fb7185] p-1 shadow-[0_0_25px_rgba(251,113,133,0.6)] group-hover:scale-105 transition-transform duration-500 bg-white">
                 <img src={img2} className="w-full h-full object-cover rounded-full" alt={name2} />
              </div>
              <Heart className="absolute -top-4 -right-4 w-10 h-10 sm:w-14 sm:h-14 text-red-500 fill-red-500 drop-shadow-lg rotate-[20deg] animate-bounce" style={{animationDuration: '2.5s'}} />
              <div className="absolute bottom-4 -right-6 text-3xl opacity-80 filter drop-shadow hover:scale-125 transition-transform duration-300">🥺</div>
            </div>
          </motion.div>

          {/* Bottom Dictionary & Quotes */}
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 1, delay: 0.4 }}
            className="flex flex-col md:flex-row items-start justify-between w-full mt-16 gap-10 md:gap-16 px-2 sm:px-8"
          >
            
            <motion.div 
              initial={{ x: -30, opacity: 0 }}
              whileInView={{ x: 0, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="flex-1 bg-[#fdfaf6] p-6 rounded-2xl border border-[#e8e2d9] shadow-sm"
            >
              <motion.h3 
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="font-serif text-6xl text-[#1a1a1a] mb-2 leading-none tracking-tighter"
              >
                LOVE
              </motion.h3>
              <motion.p 
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="font-cursive text-2xl text-[#8a7e72] mb-6"
              >
                Can't stop loving you!
              </motion.p>
              <div className="relative">
                <div className="absolute -left-2 -top-2 text-4xl text-[#c28e7e] font-serif opacity-30">"</div>
                <motion.p 
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.6 }}
                  className="font-serif italic text-lg sm:text-xl text-[#4a4540] border-l-2 border-[#c28e7e] pl-5 leading-relaxed"
                >
                  I love you not only for what you are, but for what I am when I am with you.
                </motion.p>
              </div>
              <motion.div 
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 1, delay: 0.8 }}
                className="mt-8 font-cursive text-4xl text-center text-[#1a1a1a] transform -rotate-3 hover:rotate-3 transition-transform duration-500"
              >
                Sweet besties
              </motion.div>
            </motion.div>

            <motion.div 
               initial={{ x: 30, opacity: 0 }}
               whileInView={{ x: 0, opacity: 1 }}
               viewport={{ once: true }}
               transition={{ duration: 0.8, delay: 0.8 }}
               className="flex-1 bg-white p-6 rounded-2xl border border-[#e8e2d9] shadow-sm"
            >
               <div className="flex items-end gap-3 mb-6">
                 <motion.h3 
                   initial={{ opacity: 0, y: -10 }}
                   whileInView={{ opacity: 1, y: 0 }}
                   viewport={{ once: true }}
                   transition={{ duration: 0.6, delay: 0.2 }}
                   className="font-serif text-5xl text-[#1a1a1a] leading-none"
                 >
                   love:
                 </motion.h3>
                 <motion.span 
                   initial={{ opacity: 0 }}
                   whileInView={{ opacity: 1 }}
                   viewport={{ once: true }}
                   transition={{ duration: 0.6, delay: 0.4 }}
                   className="text-[#8a7e72] mb-1 font-mono text-sm"
                 >
                   [luv] - n.
                 </motion.span>
               </div>
               <div className="space-y-4">
                 <motion.p 
                   initial={{ opacity: 0, x: 20 }}
                   whileInView={{ opacity: 1, x: 0 }}
                   viewport={{ once: true }}
                   transition={{ duration: 0.6, delay: 0.6 }}
                   className="font-sans text-sm sm:text-base text-[#4a4540] leading-relaxed"
                 >
                   <strong className="text-[#1a1a1a]">1.</strong> an intense affection for another person based on personal or familial ties.
                 </motion.p>
                 <motion.p 
                   initial={{ opacity: 0, x: 20 }}
                   whileInView={{ opacity: 1, x: 0 }}
                   viewport={{ once: true }}
                   transition={{ duration: 0.6, delay: 0.8 }}
                   className="font-sans text-sm sm:text-base text-[#4a4540] leading-relaxed"
                 >
                   <strong className="text-[#1a1a1a]">2.</strong> the deep tenderness, affection, and concern felt for a person with whom one has a relationship.
                 </motion.p>
               </div>
               <motion.div 
                 initial={{ opacity: 0, y: 10 }}
                 whileInView={{ opacity: 1, y: 0 }}
                 viewport={{ once: true }}
                 transition={{ duration: 0.6, delay: 1 }}
                 className="flex justify-center mt-6 gap-6 text-[#c28e7e]"
               >
                  <span className="flex items-center gap-2 font-cursive text-xl"><Heart className="w-5 h-5"/> forever</span>
                  <span className="flex items-center gap-2 font-cursive text-xl">always <Heart className="w-5 h-5"/></span>
               </motion.div>
            </motion.div>

          </motion.div>

          <div className="w-full mt-10 flex items-center justify-between px-2 sm:px-12 text-[#e11d48]">
            <Heart className="w-8 h-8 fill-transparent text-[#e11d48]" />
            <div className="flex-1 h-[1px] bg-[#e11d48] mx-4 opacity-30"></div>
            <Heart className="w-8 h-8 fill-transparent text-[#e11d48]" />
          </div>

          {/* NEW SECTION: Love You Diagonal Photo Frames */}
          <motion.div 
            initial={{ opacity: 0, y: 50, rotateX: 10 }}
            whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 1.2 }}
            className="w-full mt-24 mb-16 bg-gradient-to-br from-[#4a4a4a] via-[#1a1a1a] to-black rounded-3xl p-4 sm:p-8 relative overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.4)]"
          >
              
              {/* Background Glows to simulate the lighting in the image */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-20 blur-3xl pointer-events-none"></div>
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-white opacity-20 blur-3xl pointer-events-none"></div>

              {/* Center Necklace Icon */}
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20 flex flex-col items-center pointer-events-none mt-2 sm:mt-4">
                 {/* Fake V-shaped chain */}
                 <div className="w-[60px] sm:w-[100px] h-[50px] sm:h-[80px] border-b-[1.5px] border-r-[1.5px] border-l-[1.5px] border-gray-300 rounded-b-full opacity-70 -mb-1"></div>
                 <div className="relative flex items-center justify-center">
                   {/* Outer Silver Heart */}
                   <Heart className="w-10 h-10 sm:w-16 sm:h-16 text-gray-400 fill-[#e2e8f0] drop-shadow-[0_5px_15px_rgba(255,255,255,0.4)]" />
                   {/* Inner dark core */}
                   <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-4 h-4 sm:w-6 sm:h-6 bg-black rounded-full flex items-center justify-center shadow-[inset_0_2px_4px_rgba(255,255,255,0.5)]">
                      <Heart className="w-3 h-3 sm:w-4 sm:h-4 text-[#e2e8f0] fill-[#e2e8f0]" />
                   </div>
                 </div>
              </div>

              <div className="grid grid-cols-2 grid-rows-2 gap-4 sm:gap-8 relative z-10 items-center">
                  {/* Top Left: LOVE Text */}
                  <div className="flex items-end justify-center sm:justify-end text-center sm:text-right h-full pb-4 sm:pb-8">
                     <motion.span 
                       initial={{ opacity: 0, scale: 0.8, x: -30 }}
                       whileInView={{ opacity: 1, scale: 1, x: 0 }}
                       viewport={{ once: true }}
                       transition={{ duration: 1, delay: 0.3 }}
                       className="font-serif text-[4.5rem] sm:text-[7rem] lg:text-[9rem] text-transparent bg-clip-text bg-gradient-to-b from-white via-gray-300 to-gray-600 drop-shadow-[0_4px_6px_rgba(0,0,0,0.9)] leading-[0.75] italic font-bold"
                     >
                       L<span className="text-[2.5rem] sm:text-[4.5rem] lg:text-[6rem]">ove</span>
                     </motion.span>
                  </div>

                  {/* Top Right: Image Frame */}
                  <div className="bg-white p-2 pb-8 sm:p-3 sm:pb-10 shadow-[0_10px_25px_rgba(0,0,0,0.8)] transform rotate-3 hover:scale-105 transition-transform duration-300 relative z-10 w-[90%] mx-auto">
                     {/* Blurred inner drop shadow simulation */}
                     <div className="absolute inset-0 shadow-[inset_0_0_20px_rgba(0,0,0,0.3)] pointer-events-none z-20"></div>
                     <div className="w-full aspect-[3/4] bg-gray-100 overflow-hidden relative">
                       <img src={img1} className="w-full h-full object-cover" alt={name1} />
                     </div>
                  </div>

                  {/* Bottom Left: Image Frame */}
                  <div className="bg-white p-2 pb-8 sm:p-3 sm:pb-10 shadow-[0_10px_25px_rgba(0,0,0,0.8)] transform -rotate-2 hover:scale-105 transition-transform duration-300 relative z-10 w-[90%] mx-auto">
                     <div className="absolute inset-0 shadow-[inset_0_0_20px_rgba(0,0,0,0.3)] pointer-events-none z-20"></div>
                     <div className="w-full aspect-[3/4] bg-gray-100 overflow-hidden relative">
                        <img src={img2} className="w-full h-full object-cover" alt={name2} />
                     </div>
                  </div>

                  {/* Bottom Right: YOU Text */}
                  <div className="flex items-start justify-center sm:justify-start text-center sm:text-left h-full pt-4 sm:pt-8">
                     <motion.span 
                       initial={{ opacity: 0, scale: 0.8, x: 30 }}
                       whileInView={{ opacity: 1, scale: 1, x: 0 }}
                       viewport={{ once: true }}
                       transition={{ duration: 1, delay: 0.5 }}
                       className="font-serif text-[4.5rem] sm:text-[7rem] lg:text-[9rem] text-transparent bg-clip-text bg-gradient-to-b from-white via-gray-300 to-gray-600 drop-shadow-[0_4px_6px_rgba(0,0,0,0.9)] leading-[0.75] italic font-bold"
                     >
                       Y<span className="text-[2.5rem] sm:text-[4.5rem] lg:text-[6rem]">ou</span>
                     </motion.span>
                  </div>
              </div>
          </motion.div>

          {/* NEW SECTION: Premium Luxury Circular Friendship Frames */}
          <motion.div 
             initial={{ opacity: 0, scale: 0.95 }}
             whileInView={{ opacity: 1, scale: 1 }}
             viewport={{ once: true, margin: "-100px" }}
             transition={{ duration: 1.5 }}
             className="w-full mt-24 mb-16 bg-[#fffaf5] relative shadow-[0_20px_50px_rgba(0,0,0,0.15)] p-4 sm:p-12 flex items-center justify-center min-h-[500px] sm:min-h-[700px] overflow-hidden"
          >
             {/* Luxury Red Inner Border */}
             <div className="absolute inset-3 sm:inset-6 border-[3px] sm:border-[6px] border-[#d32f2f] pointer-events-none z-10 shadow-[inset_0_0_20px_rgba(211,47,47,0.1)] rounded-sm"></div>
             
             {/* Gold Inner Accent */}
             <div className="absolute inset-5 sm:inset-10 border-[1px] sm:border-[2px] border-[#d4af37] pointer-events-none z-10 opacity-60 rounded-sm"></div>

             {/* Top Left: Best Friend */}
             <motion.div 
               initial={{ opacity: 0, x: -30, rotate: -3 }}
               whileInView={{ opacity: 1, x: 0, rotate: -3 }}
               viewport={{ once: true }}
               transition={{ duration: 1, delay: 0.3 }}
               className="absolute top-10 left-8 sm:top-16 sm:left-16 z-20 flex items-center gap-1 sm:gap-3 opacity-90"
             >
                <span className="font-cursive text-2xl sm:text-5xl text-[#0a2342]">Best</span>
                <span className="text-xl sm:text-4xl filter drop-shadow-md">🧸💞</span>
                <span className="font-cursive text-2xl sm:text-5xl text-[#0a2342]">Friend</span>
             </motion.div>

             {/* Top Right: Floral Accent */}
             <div className="absolute top-8 right-6 sm:top-14 sm:right-14 z-20 text-4xl sm:text-7xl filter drop-shadow-[0_10px_10px_rgba(0,0,0,0.3)]">
                🌹🌿
             </div>

             {/* Center Overlapping Circles */}
             <div className="flex items-center justify-center relative z-20 w-full max-w-4xl pt-16 pb-16">
                {/* Left Profile */}
                <div className="w-[160px] h-[160px] sm:w-[320px] sm:h-[320px] rounded-full p-1 sm:p-2 bg-gradient-to-br from-[#d4af37] via-[#fff] to-[#d4af37] shadow-[0_20px_40px_rgba(0,0,0,0.6)] z-20 transform hover:scale-105 transition-transform duration-500">
                    <div className="w-full h-full rounded-full overflow-hidden border-[3px] sm:border-[6px] border-white bg-gray-100">
                        <img src={img1} className="w-full h-full object-cover" alt={name1} />
                    </div>
                </div>

                {/* Right Profile */}
                <div className="w-[160px] h-[160px] sm:w-[320px] sm:h-[320px] rounded-full p-1 sm:p-2 bg-gradient-to-bl from-[#d32f2f] via-[#fff] to-[#d32f2f] shadow-[0_25px_50px_rgba(0,0,0,0.7)] z-30 transform hover:scale-105 transition-transform duration-500 -ml-10 sm:-ml-20 mt-16 sm:mt-24">
                    <div className="w-full h-full rounded-full overflow-hidden border-[3px] sm:border-[6px] border-white bg-gray-100">
                        <img src={img2} className="w-full h-full object-cover" alt={name2} />
                    </div>
                </div>
             </div>

             {/* Bottom Left: Floral Accent */}
             <div className="absolute bottom-8 left-6 sm:bottom-14 sm:left-14 z-20 text-4xl sm:text-7xl filter drop-shadow-[0_10px_10px_rgba(0,0,0,0.3)] transform -scale-x-100">
                🌹🌿
             </div>

             {/* Bottom Right: Best Friend */}
             <motion.div 
               initial={{ opacity: 0, x: 30, rotate: -3 }}
               whileInView={{ opacity: 1, x: 0, rotate: -3 }}
               viewport={{ once: true }}
               transition={{ duration: 1, delay: 0.8 }}
               className="absolute bottom-10 right-8 sm:bottom-16 sm:right-16 z-20 flex items-center gap-1 sm:gap-3 opacity-90"
             >
                <span className="font-cursive text-2xl sm:text-5xl text-[#0a2342]">Best</span>
                <span className="text-xl sm:text-4xl filter drop-shadow-md">🧸💞</span>
                <span className="font-cursive text-2xl sm:text-5xl text-[#0a2342]">Friend</span>
             </motion.div>
          </motion.div>

          {/* NEW SECTION: Green Border Scrapbook Layout */}
          <motion.div 
             initial={{ opacity: 0, y: 60 }}
             whileInView={{ opacity: 1, y: 0 }}
             viewport={{ once: true, margin: "-100px" }}
             transition={{ duration: 1.2 }}
             className="w-full mt-24 mb-16 bg-[#fdfbf7] relative min-h-[650px] sm:min-h-[1000px] border-[12px] sm:border-[24px] border-[#00c853] shadow-[0_20px_50px_rgba(0,0,0,0.15)] overflow-hidden"
          >
             
             {/* Inner border for premium look */}
             <div className="absolute inset-2 sm:inset-4 border-[2px] sm:border-[4px] border-dashed border-[#00c853] opacity-50 z-0 pointer-events-none"></div>

             {/* Top Left: Quote & Characters */}
             <div className="absolute top-[6%] left-[4%] sm:top-16 sm:left-16 w-[45%] sm:w-[320px] flex flex-col items-center z-20">
                {/* Character Header */}
                <div className="relative mb-2 sm:mb-6 flex justify-center w-full">
                    <img src="https://ik.imagekit.io/19imy4f1u/lite_1777281639765_55fR5xSpF.png" className="w-[120px] sm:w-[180px] object-contain drop-shadow-md z-10" alt="Tom and Jerry" />
                    <Heart className="absolute -top-1 sm:-top-4 -right-2 sm:right-8 w-4 h-4 sm:w-8 sm:h-8 text-[#ff1493] fill-[#ff1493] -rotate-12 z-0" />
                    <Heart className="absolute top-4 sm:top-8 -right-4 sm:-right-4 w-3 h-3 sm:w-6 sm:h-6 text-[#ff1493] fill-[#ff1493] rotate-12 z-0" />
                    <Heart className="absolute top-1 sm:top-2 right-6 sm:right-16 w-3 h-3 sm:w-5 sm:h-5 text-[#ff1493] fill-[#ff1493] -rotate-6 z-0" />
                </div>
                
                <motion.p 
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 1, delay: 0.5 }}
                  className="font-serif italic text-[11px] sm:text-[26px] text-[#1a1a1a] leading-relaxed sm:leading-snug text-center font-bold px-1 sm:px-2 drop-shadow-sm"
                >
                    "I love you not only for what you are, but for what I am when I am with you."
                </motion.p>

                {/* Decorative Nameplate */}
                <div className="mt-4 sm:mt-10 w-[95%] h-6 sm:h-12 border-[1.5px] sm:border-[3px] border-[#1a1a1a] rounded-[50px] relative flex items-center justify-center bg-white shadow-sm">
                    <span className="absolute -left-3 sm:-left-8 text-[#1a1a1a] opacity-80 transform -rotate-45 text-[10px] sm:text-2xl filter grayscale">🌿</span>
                    <span className="font-serif font-black italic text-[10px] sm:text-[20px] text-[#1a1a1a] tracking-[0.15em] sm:tracking-[0.2em] relative z-10 uppercase">{name1.toUpperCase()}</span>
                    {/* Stickers */}
                    <span className="absolute -top-3 sm:-top-6 left-2 sm:left-4 text-[14px] sm:text-[32px] transform -rotate-12 z-20 drop-shadow-sm">👑</span>
                    <span className="absolute -bottom-2 sm:-bottom-4 right-4 sm:right-8 text-[12px] sm:text-[24px] transform rotate-12 z-20 drop-shadow-sm">✨</span>
                    <span className="absolute -right-3 sm:-right-8 text-[#1a1a1a] opacity-80 transform rotate-45 scale-x-[-1] text-[10px] sm:text-2xl filter grayscale">🌿</span>
                </div>
             </div>

             {/* Top Right: Frame 1 */}
             <div className="absolute top-[8%] right-[4%] sm:top-16 sm:right-16 w-[42%] sm:w-[360px] z-10 group">
                <div className="border-[3px] sm:border-[8px] border-[#1a1a1a] p-1 sm:p-2 bg-white shadow-[4px_4px_8px_rgba(0,0,0,0.3)] sm:shadow-[15px_15px_25px_rgba(0,0,0,0.4)] aspect-square sm:aspect-[4/5] relative transform md:group-hover:scale-105 transition-transform duration-300">
                    <div className="w-full h-full overflow-hidden border border-gray-200">
                        <img src={img1} className="w-full h-full object-cover filter grayscale contrast-[1.1] brightness-[1.05]" alt={`${name1} Grayscale`} />
                    </div>
                </div>
             </div>

             {/* Center: Butterfly Trail */}
             <div className="absolute top-0 left-0 w-full h-full pointer-events-none z-0 overflow-hidden mix-blend-multiply opacity-80">
                 <span className="absolute top-[32%] left-[40%] text-xl sm:text-5xl filter grayscale contrast-200 -rotate-12">🦋</span>
                 <span className="absolute top-[38%] left-[48%] text-2xl sm:text-6xl filter grayscale contrast-200 rotate-12">🦋</span>
                 <span className="absolute top-[46%] left-[42%] text-base sm:text-3xl filter grayscale contrast-200 -rotate-45">🦋</span>
                 <span className="absolute top-[52%] left-[50%] text-xl sm:text-5xl filter grayscale contrast-200 rotate-[30deg]">🦋</span>
                 <span className="absolute top-[58%] left-[45%] text-3xl sm:text-[80px] filter grayscale contrast-200 -rotate-12 transform scale-x-[-1]">🦋</span>
                 <span className="absolute top-[68%] left-[52%] text-lg sm:text-4xl filter grayscale contrast-200 rotate-[15deg]">🦋</span>
                 <span className="absolute top-[75%] left-[48%] text-xs sm:text-2xl filter grayscale contrast-200 -rotate-[20deg] opacity-70">🦋</span>
                 <span className="absolute top-[82%] left-[55%] text-[8px] sm:text-xl filter grayscale contrast-200 rotate-[45deg] opacity-50">🦋</span>
             </div>

             {/* Bottom Left: Frame 2 */}
             <div className="absolute bottom-[6%] left-[4%] sm:bottom-16 sm:left-16 w-[45%] sm:w-[400px] z-10 group">
                <div className="border-[3px] sm:border-[8px] border-[#1a1a1a] p-1 sm:p-2 bg-white shadow-[4px_4px_8px_rgba(0,0,0,0.3)] sm:shadow-[15px_15px_25px_rgba(0,0,0,0.4)] aspect-[3/4] sm:aspect-[4/5] relative transform md:group-hover:scale-105 transition-transform duration-300">
                    <div className="w-full h-full overflow-hidden border border-gray-200">
                        <img src={img2} className="w-full h-full object-cover filter grayscale contrast-[1.1] brightness-[1.05]" alt={`${name2} Grayscale`} />
                    </div>
                    <div className="absolute bottom-1 sm:bottom-4 left-0 w-full flex justify-center z-20">
                        <span className="bg-black text-white text-[7px] sm:text-sm font-sans font-bold px-2 sm:px-4 py-0.5 sm:py-1 tracking-[0.2em] bg-opacity-90 shadow-md">FOREVERBESTIE</span>
                    </div>
                </div>
             </div>

             {/* Bottom Right: Cute Cats / Decorations */}
             <div className="absolute bottom-[8%] right-[4%] sm:bottom-20 sm:right-16 w-[42%] sm:w-[320px] flex flex-col items-center justify-end z-20 h-[30%]">
                <div className="flex justify-center items-center mb-2 sm:mb-8 relative w-full h-[60px] sm:h-[160px]">
                    <span className="text-[45px] sm:text-[110px] absolute right-2 sm:right-16 top-0 rotate-12 z-0 drop-shadow-md">🐱</span>
                    <span className="text-[55px] sm:text-[130px] absolute left-0 sm:left-10 bottom-0 -rotate-6 z-10 drop-shadow-lg filter hue-rotate-15">😽</span>
                    <Heart className="absolute top-0 left-0 sm:top-6 sm:left-4 w-4 h-4 sm:w-8 sm:h-8 text-[#ff4081] fill-[#ff4081] -rotate-12 z-20 opacity-90" />
                </div>
                
                {/* Decorative Nameplate */}
                <div className="mt-3 sm:mt-6 w-[90%] h-6 sm:h-12 border-[1.5px] sm:border-[3px] border-[#1a1a1a] rounded-[50px] relative flex items-center justify-center bg-white shadow-sm">
                    <span className="absolute -left-3 sm:-left-8 text-[#1a1a1a] opacity-80 transform -rotate-45 text-[10px] sm:text-2xl filter grayscale">🌿</span>
                    <span className="font-serif font-black italic text-[10px] sm:text-[20px] text-[#1a1a1a] tracking-[0.15em] sm:tracking-[0.2em] relative z-10 uppercase">{name2.toUpperCase()}</span>
                    {/* Stickers */}
                    <span className="absolute -top-3 sm:-top-6 right-1 sm:right-2 text-[14px] sm:text-[30px] transform rotate-[20deg] z-20 drop-shadow-sm">🎀</span>
                    <span className="absolute -bottom-2 sm:-bottom-4 left-2 sm:left-4 text-[12px] sm:text-[24px] transform -rotate-12 z-20 drop-shadow-sm">💫</span>
                    <span className="absolute -right-3 sm:-right-8 text-[#1a1a1a] opacity-80 transform rotate-45 scale-x-[-1] text-[10px] sm:text-2xl filter grayscale">🌿</span>
                </div>
             </div>
          </motion.div>

          {/* NEW SECTION: Dark Neon Crowns Layout */}
          <motion.div 
              initial={{ opacity: 0, rotateX: -10, y: 60 }}
              whileInView={{ opacity: 1, rotateX: 0, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 1.5 }}
              className="w-full mt-24 mb-16 bg-[#050505] relative min-h-[700px] sm:min-h-[1050px] rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.8)] p-6 sm:p-12 overflow-hidden flex flex-col justify-between"
          >
              
              {/* Realistic Rose Decoration */}
              <div className="absolute bottom-16 -left-12 sm:bottom-32 sm:left-10 z-30 transform -rotate-[25deg] hover:rotate-[0deg] transition-transform duration-700 origin-bottom-left">
                  <span className="text-[180px] sm:text-[350px] filter drop-shadow-[0_15px_15px_rgba(0,0,0,0.9)] opacity-90 inline-block">🌹</span>
              </div>
              
              {/* Top Left Circle Box (Ahad) */}
              <div className="absolute top-20 left-10 sm:top-40 sm:left-32 group">
                 {/* Hearts Arc */}
                 <div className="absolute -top-16 sm:-top-24 left-1/2 transform -translate-x-1/2 w-48 sm:w-64 h-20 sm:h-32 -rotate-[15deg] z-30 pointer-events-none transition-transform duration-500 group-hover:scale-110">
                    <span className="absolute top-8 left-2 sm:top-12 sm:left-4 text-2xl sm:text-4xl transform -rotate-45 drop-shadow-[0_0_5px_rgba(255,105,180,0.8)]">💕</span>
                    <span className="absolute top-4 left-10 sm:top-4 sm:left-14 text-3xl sm:text-5xl transform -rotate-12 drop-shadow-[0_0_5px_rgba(255,105,180,0.8)]">💖</span>
                    <span className="absolute -top-1 left-[5.5rem] sm:-top-4 sm:left-[7.5rem] text-4xl sm:text-6xl drop-shadow-[0_0_5px_rgba(255,105,180,0.8)]">💗</span>
                    <span className="absolute top-1 right-10 sm:top-2 sm:right-14 text-3xl sm:text-5xl transform rotate-12 drop-shadow-[0_0_5px_rgba(255,105,180,0.8)]">💓</span>
                    <span className="absolute top-4 right-2 sm:top-8 sm:right-4 text-2xl sm:text-4xl transform rotate-45 drop-shadow-[0_0_5px_rgba(255,105,180,0.8)]">💞</span>
                 </div>
                 
                 {/* Gold Crown */}
                 <div className="absolute -top-12 sm:-top-20 -left-6 sm:-left-12 transform -rotate-[25deg] z-20">
                     <span className="text-[80px] sm:text-[140px] drop-shadow-[0_10px_15px_rgba(255,215,0,0.5)]">👑</span>
                 </div>

                 {/* Neon Frame Profile */}
                 <div className="w-48 h-48 sm:w-[350px] sm:h-[350px] rounded-full border-[3px] border-white shadow-[0_0_20px_#ff00ff,inset_0_0_15px_#ff00ff] relative z-10 bg-transparent flex items-center justify-center group-hover:shadow-[0_0_40px_#ff00ff,inset_0_0_30px_#ff00ff] transition-shadow duration-500">
                    <div className="w-[92%] h-[92%] rounded-full overflow-hidden opacity-95 border-[2px] border-white/20">
                        <img src={img1} className="w-full h-full object-cover grayscale contrast-125 hover:grayscale-0 transition-all duration-700" alt={name1} />
                    </div>
                    {/* Glowing Name Tag */}
                    <div className="absolute -bottom-6 sm:-bottom-12 font-sans font-black italic text-white tracking-[0.3em] uppercase drop-shadow-[0_0_15px_#ff00ff] text-xl sm:text-4xl">
                        {name1.toUpperCase()}
                    </div>
                 </div>
              </div>

              {/* Bottom Right Circle Box (Saqib) */}
              <div className="absolute bottom-32 right-10 sm:bottom-48 sm:right-32 group">
                 {/* Hearts Arc */}
                 <div className="absolute -top-16 sm:-top-24 left-1/2 transform -translate-x-1/2 w-48 sm:w-64 h-20 sm:h-32 rotate-[15deg] z-30 pointer-events-none transition-transform duration-500 group-hover:scale-110 ml-4">
                    <span className="absolute top-2 -left-2 sm:top-2 sm:-left-2 text-xl sm:text-3xl transform -rotate-45 drop-shadow-[0_0_5px_rgba(255,105,180,0.8)]">💕</span>
                    <span className="absolute -top-1 left-6 sm:-top-2 sm:left-10 text-2xl sm:text-4xl transform -rotate-12 drop-shadow-[0_0_5px_rgba(255,105,180,0.8)]">💖</span>
                    <span className="absolute -top-4 left-[4.5rem] sm:-top-8 sm:left-[6.5rem] text-3xl sm:text-5xl drop-shadow-[0_0_5px_rgba(255,105,180,0.8)]">💗</span>
                    <span className="absolute -top-1 right-10 sm:-top-2 sm:right-14 text-2xl sm:text-4xl transform rotate-12 drop-shadow-[0_0_5px_rgba(255,105,180,0.8)]">💓</span>
                    <span className="absolute top-4 right-2 sm:top-8 sm:right-2 text-xl sm:text-3xl transform rotate-[30deg] drop-shadow-[0_0_5px_rgba(255,105,180,0.8)]">💞</span>
                 </div>
                 
                 {/* Gold Crown */}
                 <div className="absolute -top-10 sm:-top-16 -right-6 sm:-right-8 transform rotate-[25deg] z-20">
                     <span className="text-[80px] sm:text-[140px] drop-shadow-[0_10px_15px_rgba(255,215,0,0.5)] inline-block scale-x-[-1]">👑</span>
                 </div>

                 {/* Neon Frame Profile */}
                 <div className="w-48 h-48 sm:w-[350px] sm:h-[350px] rounded-full border-[3px] border-white shadow-[0_0_20px_#ff00ff,inset_0_0_15px_#ff00ff] relative z-10 bg-transparent flex items-center justify-center group-hover:shadow-[0_0_40px_#ff00ff,inset_0_0_30px_#ff00ff] transition-shadow duration-500">
                    <div className="w-[92%] h-[92%] rounded-full overflow-hidden opacity-95 border-[2px] border-white/20">
                        <img src={img2} className="w-full h-full object-cover grayscale contrast-125 hover:grayscale-0 transition-all duration-700" alt={name2} />
                    </div>
                    {/* Glowing Name Tag */}
                    <div className="absolute -bottom-6 sm:-bottom-12 font-sans font-black italic text-white tracking-[0.3em] uppercase drop-shadow-[0_0_15px_#ff00ff] text-xl sm:text-4xl">
                        {name2.toUpperCase()}
                    </div>
                 </div>
              </div>

          </motion.div>

          {/* Decorative Music Player & Quotes Section */}
          <motion.div 
             initial={{ opacity: 0, scale: 0.8 }}
             whileInView={{ opacity: 1, scale: 1 }}
             viewport={{ once: true, margin: "-50px" }}
             transition={{ duration: 1.2, delay: 0.2 }}
             className="w-full mt-24 mb-8 flex flex-col lg:flex-row justify-between items-center lg:items-end relative gap-12 text-[#1a1a1a] px-4"
          >
             
             {/* Left Quote */}
             <motion.div 
               initial={{ opacity: 0, x: -30 }}
               whileInView={{ opacity: 1, x: 0 }}
               viewport={{ once: true }}
               transition={{ duration: 0.8, delay: 0.3 }}
               className="flex flex-col items-center lg:items-start opacity-90 text-center lg:text-left"
             >
               <span className="font-serif font-black tracking-widest text-xl sm:text-2xl">CHOCOLATE BOY</span>
               <p className="text-[11px] sm:text-xs font-bold tracking-tight mt-1">I DON'T HAVE TIME TO HATE PEOPLE</p>
               <p className="text-[10px] sm:text-[11px] font-bold tracking-tight lg:ml-4">BCZ.. I'M BUSY LOVING PEOPLE WHO LOVE ME</p>
               <div className="flex gap-1.5 mt-2 lg:ml-4">
                  {[...Array(8)].map((_, i) => <div key={i} className="w-1.5 h-1.5 bg-[#1a1a1a] rounded-full"></div>)}
               </div>
             </motion.div>

             {/* Center Music Player & Crown */}
             <div className="flex flex-col items-center gap-8 opacity-90">
                <Crown strokeWidth={1.5} className="w-20 h-20 sm:w-28 sm:h-28 stroke-[#1a1a1a] drop-shadow-md" />
                
                <div className="w-[200px] sm:w-[320px] flex flex-col gap-4">
                   <div className="flex items-center gap-3 text-xs font-mono font-medium">
                     <span>0:00</span>
                     <div className="flex-1 h-1 bg-gray-300 rounded-full relative">
                        <div className="absolute top-0 left-0 h-full w-1/3 bg-[#1a1a1a] rounded-full shadow-[0_0_8px_rgba(0,0,0,0.5)]"></div>
                        <div className="absolute top-1/2 left-1/3 transform -translate-y-1/2 w-3.5 h-3.5 bg-[#1a1a1a] rounded-full shadow-md"></div>
                     </div>
                     <span>3:45</span>
                   </div>
                   <div className="flex items-center justify-between px-2">
                     <Heart strokeWidth={2.5} className="w-4 h-4 text-gray-400" />
                     <div className="flex items-center gap-5">
                        <SkipBack className="w-6 h-6 fill-[#1a1a1a] text-[#1a1a1a]" />
                        <Play className="w-10 h-10 fill-[#1a1a1a] text-[#1a1a1a]" />
                        <SkipForward className="w-6 h-6 fill-[#1a1a1a] text-[#1a1a1a]" />
                     </div>
                     <Volume2 strokeWidth={2.5} className="w-4 h-4 text-gray-400" />
                   </div>
                </div>

                <div className="relative mt-4">
                  <Heart fill="currentColor" strokeWidth={0} className="w-24 h-24 text-[#1a1a1a] rotate-12" />
                  <Crown strokeWidth={3} className="w-10 h-10 stroke-[#1a1a1a] fill-white absolute -top-5 -right-3 rotate-[35deg]" />
                </div>
             </div>

             {/* Right Quote */}
             <motion.div 
               initial={{ opacity: 0, x: 30 }}
               whileInView={{ opacity: 1, x: 0 }}
               viewport={{ once: true }}
               transition={{ duration: 0.8, delay: 0.5 }}
               className="flex flex-col items-center lg:items-end opacity-90 text-center lg:text-right"
             >
               <span className="font-serif font-black tracking-widest text-xl sm:text-2xl">FAMOUS BOY</span>
               <p className="text-[11px] sm:text-xs font-bold tracking-tight mt-1">I DON'T HAVE TIME TO HATE PEOPLE</p>
               <p className="text-[10px] sm:text-[11px] font-bold tracking-tight lg:mr-4">BCZ.. I'M BUSY LOVING PEOPLE WHO LOVE ME</p>
               <div className="flex gap-1.5 mt-2 lg:mr-4">
                  {[...Array(8)].map((_, i) => <div key={i} className="w-1.5 h-1.5 bg-[#1a1a1a] rounded-full"></div>)}
               </div>
             </motion.div>
          </motion.div>

        </motion.div>

      </div>
    </div>
  );
}

