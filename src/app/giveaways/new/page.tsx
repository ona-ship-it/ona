"use client"; 
  
import { useState } from "react"; 
import { useSupabaseClient } from "@/lib/supabaseClient"; 
import { useRouter } from "next/navigation"; 
import Navigation from "@/components/Navigation";
import PageTitle from "@/components/PageTitle";
  
export default function NewGiveawayPage() { 
  const supabase = useSupabaseClient(); 
  const router = useRouter(); 
  const [title, setTitle] = useState(""); 
  const [description, setDescription] = useState(""); 
  const [prize, setPrize] = useState<number>(100); 
  const [mediaUrl, setMediaUrl] = useState(""); 
  const [loading, setLoading] = useState(false);
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string>("");
  const [photoError, setPhotoError] = useState<string>("");
  const [photoLoading, setPhotoLoading] = useState(false);
  
  const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
  const ALLOWED_FILE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  
  function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    // Clear previous errors
    setPhotoError("");
    
    const file = e.target.files?.[0] || null;
    if (!file) return;
    
    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      setPhotoError(`File size exceeds 5MB limit (${(file.size / (1024 * 1024)).toFixed(2)}MB)`);
      e.target.value = "";
      return;
    }
    
    // Validate file type
    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      setPhotoError(`Invalid file type. Please upload JPEG, PNG, GIF, or WebP images only.`);
      e.target.value = "";
      return;
    }
    
    // File is valid, proceed with setting the photo
    setPhoto(file);
    setPhotoLoading(true);
    
    const reader = new FileReader();
    reader.onloadend = () => {
      setPhotoPreview(reader.result as string);
      setPhotoLoading(false);
    };
    reader.onerror = () => {
      setPhotoError("Failed to load image. Please try again.");
      setPhotoLoading(false);
    };
    reader.readAsDataURL(file);
    
    // If we have a direct file upload, we can also set the mediaUrl
    // to be used when no custom URL is provided
    if (!mediaUrl) {
      setMediaUrl("file-upload");
    }
  }
  
  function handleRemovePhoto() {
    setPhoto(null);
    setPhotoPreview("");
    setPhotoError("");
    
    // Only clear mediaUrl if it was set by the file upload
    if (mediaUrl === "file-upload") {
      setMediaUrl("");
    }
    
    // Reset the file input by clearing its value
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = "";
    }
  } 
  
  async function handleCreate(e?: React.FormEvent) { 
    e?.preventDefault(); 
    setLoading(true); 
  
    try { 
      const sessionRes = await supabase.auth.getSession(); 
      const userId = sessionRes.data.session?.user?.id; 
      if (!userId) throw new Error("You must be signed in to create giveaways."); 
      
      // Upload photo if available
      let finalMediaUrl = mediaUrl;
      if (photo) {
        // Set photo loading state
        setPhotoLoading(true);
        
        const fileExt = photo.name.split('.').pop();
        const fileName = `${userId}-${Date.now()}.${fileExt}`;
        const filePath = `giveaway-photos/${fileName}`;
        
        // Show upload progress message
        const uploadStatusEl = document.getElementById('upload-status');
        if (uploadStatusEl) {
          uploadStatusEl.textContent = "Uploading photo...";
        }
        
        const { error: uploadError } = await supabase.storage
          .from('giveaways')
          .upload(filePath, photo);
          
        if (uploadError) {
          setPhotoLoading(false);
          throw new Error(`Error uploading photo: ${uploadError.message}`);
        }
        
        // Update status
        if (uploadStatusEl) {
          uploadStatusEl.textContent = "Processing photo...";
        }
        
        // Get public URL for the uploaded file
        const { data: urlData } = supabase.storage
          .from('giveaways')
          .getPublicUrl(filePath);
          
        finalMediaUrl = urlData.publicUrl;
        setPhotoLoading(false);
      }
  
      // Create giveaway as draft 
      const { data, error } = await supabase.from("giveaways").insert([ 
        { 
          creator_id: userId, 
          title, 
          description, 
          media_url: finalMediaUrl, 
          prize_amount: prize, 
          prize_pool_usdt: prize, 
          ticket_price: 1, 
          status: "draft", 
          ends_at: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7).toISOString(), // default 7 days 
        }, 
      ]); 
  
      if (error) throw error; 
  
      const created = data?.[0];
      alert("Giveaway created as draft. Activate it to lock escrow."); 
      router.push(`/giveaways`); 
    } catch (err: any) { 
      console.error(err); 
      alert(err.message || "Failed to create giveaway."); 
    } finally { 
      setLoading(false); 
    } 
  } 
  
  async function activateGiveaway(giveawayId: string) { 
    // set status to 'active' — DB trigger should escrow the prize if wallet is funded 
    try { 
      setLoading(true); 
      const { error } = await supabase 
        .from("onagui.giveaways") 
        .update({ status: "active" }) 
        .eq("id", giveawayId); 
  
      if (error) throw error; 
      alert("Giveaway activated — prize escrowed if funds available."); 
      router.push("/giveaways"); 
    } catch (err: any) { 
      console.error(err); 
      alert(err.message || "Failed to activate giveaway"); 
    } finally { 
      setLoading(false); 
    } 
  } 
  
  return (
    <main className="min-h-screen bg-gradient-to-b from-[#1f2937] to-[#000000] text-white">
      <Navigation />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <PageTitle className="text-3xl md:text-4xl mb-8" gradient={true}>
          Create New Giveaway
        </PageTitle>
        
        <div className="p-6 max-w-3xl mx-auto bg-gray-800 bg-opacity-30 rounded-xl overflow-hidden shadow-lg border border-green-500/30"> 
          <h1 className="text-2xl font-bold mb-4">Create a Giveaway</h1> 
    
          <form onSubmit={handleCreate} className="space-y-4"> 
            <div> 
              <label className="block text-sm font-medium text-purple-300">Title</label> 
              <input 
                  value={title} 
                  onChange={(e) => setTitle(e.target.value)} 
                  className="w-full bg-white border border-purple-500/30 rounded-lg p-3 text-black focus:outline-none focus:ring-2 focus:ring-onaguiGreen" 
                  placeholder="Short title (e.g. Win $100 USDT)" 
                  required 
                /> 
            </div> 
    
            <div> 
              <label className="block text-sm font-medium text-purple-300">Description</label> 
              <textarea 
                value={description} 
                onChange={(e) => setDescription(e.target.value)} 
                className="w-full bg-white border border-purple-500/30 rounded-lg p-3 text-black focus:outline-none focus:ring-2 focus:ring-onaguiGreen" 
                rows={4} 
                placeholder="Write the giveaway description and rules (follow, like, share...)" 
              /> 
            </div> 
    
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4"> 
              <div> 
                <label className="block text-sm font-medium text-purple-300">Prize (USDT)</label> 
                <input 
                    type="number" 
                    value={prize} 
                    onChange={(e) => setPrize(Number(e.target.value))} 
                    className="w-full bg-white border border-purple-500/30 rounded-lg p-3 text-black focus:outline-none focus:ring-2 focus:ring-onaguiGreen" 
                    min={1} 
                    required 
                  /> 
              </div> 
    
              <div> 
                <label className="block text-sm font-medium text-purple-300">Media URL (optional)</label> 
                <input 
                  value={mediaUrl} 
                  onChange={(e) => setMediaUrl(e.target.value)} 
                  className="w-full bg-white border border-purple-500/30 rounded-lg p-3 text-black focus:outline-none focus:ring-2 focus:ring-onaguiGreen" 
                  placeholder="https://..." 
                /> 
              </div>
              
              <div>
                <label className="block text-sm font-medium text-purple-300">Upload Photo</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoChange}
                  className="w-full bg-white border border-purple-500/30 rounded-lg p-3 text-black focus:outline-none focus:ring-2 focus:ring-onaguiGreen"
                  disabled={photoLoading}
                />
                {photoLoading && (
                  <div className="mt-2 flex items-center space-x-2 text-purple-300">
                    <div className="animate-spin h-5 w-5 border-2 border-purple-500 rounded-full border-t-transparent"></div>
                    <span>Loading image...</span>
                  </div>
                )}
                {photoError && (
                  <div className="mt-2 text-red-400 text-sm bg-red-900 bg-opacity-30 p-2 rounded border border-red-500">
                    <span className="font-bold">Error:</span> {photoError}
                  </div>
                )}
                {photoPreview && (
                  <div className="mt-2 relative">
                    <img 
                      src={photoPreview} 
                      alt="Preview" 
                      className="max-w-full h-auto max-h-40 rounded border border-purple-300" 
                    />
                    <button
                      type="button"
                      onClick={handleRemovePhoto}
                      className="absolute top-2 right-2 bg-red-600 text-white p-1 rounded-full w-8 h-8 flex items-center justify-center hover:bg-red-700 focus:outline-none"
                      aria-label="Remove photo"
                    >
                      ✕
                    </button>
                  </div>
                )}
              </div> 
            </div> 
    
            <div className="flex flex-col gap-3"> 
              {photoLoading && (
                <div id="upload-status" className="text-center text-purple-300 py-2">
                  Processing...
                </div>
              )}
              <button 
                type="submit" 
                disabled={loading || photoLoading} 
                className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-medium py-3 px-4 rounded-lg transition-all duration-300 shadow-lg hover:shadow-purple-500/30"
              > 
                {loading ? "Creating..." : "Create Draft"} 
              </button> 
            </div> 
          </form> 
    
          <div className="mt-6 border-t border-purple-500/30 pt-4"> 
            <p className="text-sm text-purple-300"> 
              After creating a draft you can activate the giveaway (lock escrow) 
              from the admin panel or via the `activateGiveaway` function if you own the giveaway. 
            </p> 
          </div> 
        </div>
      </div>
    </main>
  ); 
}
