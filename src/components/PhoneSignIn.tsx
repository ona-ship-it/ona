"use client"; 
  
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"; 
import { useEffect, useState } from "react";
import { User } from '@supabase/supabase-js';

// Country codes list with Morocco (+212) included
const countryCodes = [
  { name: "Morocco", code: "+212", flag: "🇲🇦" },
  { name: "United States", code: "+1", flag: "🇺🇸" },
  { name: "United Kingdom", code: "+44", flag: "🇬🇧" },
  { name: "France", code: "+33", flag: "🇫🇷" },
  { name: "Spain", code: "+34", flag: "🇪🇸" },
  { name: "Germany", code: "+49", flag: "🇩🇪" },
  { name: "Italy", code: "+39", flag: "🇮🇹" },
  { name: "Canada", code: "+1", flag: "🇨🇦" },
  { name: "Australia", code: "+61", flag: "🇦🇺" },
  { name: "India", code: "+91", flag: "🇮🇳" },
  { name: "China", code: "+86", flag: "🇨🇳" },
  { name: "Japan", code: "+81", flag: "🇯🇵" },
  { name: "Brazil", code: "+55", flag: "🇧🇷" },
  { name: "Russia", code: "+7", flag: "🇷🇺" },
  { name: "South Africa", code: "+27", flag: "🇿🇦" },
];

export default function PhoneSignIn() { 
  const supabase = createClientComponentClient();
  const [visible, setVisible] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [showVerification, setShowVerification] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState(countryCodes[0]);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  
  useEffect(() => {
    // Check if user is already signed in
    const checkAuth = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          throw error;
        }
        
        if (data?.session) {
          setIsAuthenticated(true);
          setUser(data.session.user);
          
          // Set up auth state change listener
          const { data: authListener } = supabase.auth.onAuthStateChange(
            async (event, session) => {
              setUser(session?.user ?? null);
              setIsAuthenticated(!!session);
            }
          );
          
          return () => {
            authListener.subscription.unsubscribe();
          };
        } else {
          setIsAuthenticated(false);
          setUser(null);
        }
      } catch (err) {
        console.error('Error checking auth:', err);
        setError(err instanceof Error ? err.message : 'Authentication error');
      }
    };

    checkAuth();
    
    // Hide after 5 seconds if visible
    if (visible) {
      const timer = setTimeout(() => {
        setVisible(false);
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [visible, supabase.auth]);
  
  const handleSendOTP = async () => { 
    try {
      setLoading(true);
      setError(null);
      
      // Validate phone number
      if (!phoneNumber || phoneNumber.length < 5) {
        throw new Error("Please enter a valid phone number");
      }
      
      const fullPhoneNumber = `${selectedCountry.code}${phoneNumber.startsWith('0') ? phoneNumber.substring(1) : phoneNumber}`;
      
      const { error } = await supabase.auth.signInWithOtp({
        phone: fullPhoneNumber,
        options: {
          shouldCreateUser: true,
        }
      });
      
      if (error) { 
        throw error;
      }
      
      setShowVerification(true);
    } catch (err) {
      console.error("Phone sign-in error:", err);
      setError(err instanceof Error ? err.message : 'Failed to send verification code');
    } finally {
      setLoading(false);
    }
  };
  
  const handleVerifyOTP = async () => {
    try {
      setLoading(true);
      setError(null);
      
      if (!verificationCode || verificationCode.length < 4) {
        throw new Error("Please enter the verification code");
      }
      
      const fullPhoneNumber = `${selectedCountry.code}${phoneNumber.startsWith('0') ? phoneNumber.substring(1) : phoneNumber}`;
      
      const { error } = await supabase.auth.verifyOtp({
        phone: fullPhoneNumber,
        token: verificationCode,
        type: 'sms'
      });
      
      if (error) {
        throw error;
      }
      
      // Redirect to account page on successful verification
      window.location.href = "/account";
    } catch (err) {
      console.error("Verification error:", err);
      setError(err instanceof Error ? err.message : 'Failed to verify code');
    } finally {
      setLoading(false);
    }
  };

  // Don't render if user is already authenticated or component should be hidden
  if (isAuthenticated || !visible) {
    return null;
  }
  
  return (
    <div className="fixed top-4 right-4 z-50">
      <div className="bg-black bg-opacity-90 backdrop-blur-sm text-white rounded-lg shadow-xl max-w-md w-full border border-gray-700 overflow-hidden">
        {/* Header with Phone icon and close button */}
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <div className="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
            <span className="font-medium">Sign in with Phone</span>
          </div>
          <button 
            onClick={() => setVisible(false)}
            className="text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
        
        <div className="p-4">
          {error && (
            <div className="mb-4 p-2 bg-red-500 bg-opacity-20 border border-red-500 rounded text-red-200 text-sm">
              {error}
            </div>
          )}
          
          {!showVerification ? (
            <>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Phone Number</label>
                <div className="flex">
                  {/* Country code dropdown */}
                  <div className="relative">
                    <button
                      type="button"
                      className="flex items-center justify-between w-28 px-3 py-2 border border-gray-600 rounded-l-md bg-gray-800 text-white"
                      onClick={() => setDropdownOpen(!dropdownOpen)}
                    >
                      <span>{selectedCountry.flag} {selectedCountry.code}</span>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    
                    {dropdownOpen && (
                      <div className="absolute z-10 mt-1 w-56 max-h-60 overflow-auto rounded-md bg-gray-800 border border-gray-600 shadow-lg">
                        <ul className="py-1">
                          {countryCodes.map((country) => (
                            <li 
                              key={`${country.name}-${country.code}`}
                              className="px-3 py-2 hover:bg-gray-700 cursor-pointer flex items-center"
                              onClick={() => {
                                setSelectedCountry(country);
                                setDropdownOpen(false);
                              }}
                            >
                              <span className="mr-2">{country.flag}</span>
                              <span>{country.name}</span>
                              <span className="ml-auto text-gray-400">{country.code}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                  
                  {/* Phone number input */}
                  <input
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value.replace(/[^0-9]/g, ''))}
                    placeholder="Phone number"
                    className="flex-1 px-3 py-2 border border-gray-600 rounded-r-md bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <p className="mt-1 text-xs text-gray-400">
                  We&#39;ll send a verification code to this number
                </p>
              </div>
              
              <button
                onClick={handleSendOTP}
                disabled={loading || !phoneNumber}
                className={`w-full py-3 px-4 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 transition-colors ${(loading || !phoneNumber) ? 'opacity-70 cursor-not-allowed' : ''}`}
              >
                {loading ? "Sending..." : "Send Verification Code"}
              </button>
            </>
          ) : (
            <>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-300 mb-1">Verification Code</label>
                <input
                  type="text"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value.replace(/[^0-9]/g, ''))}
                  placeholder="Enter verification code"
                  className="w-full px-3 py-2 border border-gray-600 rounded-md bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  maxLength={6}
                />
                <p className="mt-1 text-xs text-gray-400">
                  Enter the code we sent to {selectedCountry.code}{phoneNumber}
                </p>
              </div>
              
              <button
                onClick={handleVerifyOTP}
                disabled={loading || !verificationCode}
                className={`w-full py-3 px-4 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 transition-colors ${(loading || !verificationCode) ? 'opacity-70 cursor-not-allowed' : ''}`}
              >
                {loading ? 'Verifying...' : 'Verify & Sign In'}
              </button>
              
              <button
                onClick={() => {
                  setShowVerification(false);
                  setVerificationCode('');
                }}
                className="w-full mt-2 py-2 px-4 bg-transparent text-gray-300 text-sm font-medium rounded-md hover:bg-gray-800 transition-colors border border-gray-700"
              >
                Back to Phone Number
              </button>
            </>
          )}
          
          <div className="mt-4 text-xs text-gray-400 text-center">
            By continuing, you agree to our <a href="/privacy" className="text-[#5AFF7F] hover:underline">Privacy Policy</a> and <a href="/terms" className="text-[#5AFF7F] hover:underline">Terms of Service</a>.
          </div>
        </div>
      </div>
    </div>
  );
}