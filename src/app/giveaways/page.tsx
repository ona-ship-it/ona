"use client"; 
 
import { useEffect, useState } from "react"; 
import { useSupabaseClient } from "@/lib/supabaseClient"; 
 
type Giveaway = { 
  id: string; 
  creator_id: string; 
  title?: string; 
  description?: string; 
  media_url?: string; 
  prize_amount?: number; 
  prize_pool_usdt?: number; 
  ticket_price?: number; 
  status?: string; 
  ends_at?: string; 
}; 
 
export default function GiveawaysPage() { 
  const supabase = useSupabaseClient(); 
  const [giveaways, setGiveaways] = useState<Giveaway[]>([]); 
  const [loading, setLoading] = useState(true); 
  const [buyingId, setBuyingId] = useState<string | null>(null); 
  const [donationAmounts, setDonationAmounts] = useState<Record<string, string>>( 
    {} 
  ); 

  useEffect(() => { 
    fetchGiveaways(); 
    // Optionally subscribe to realtime changes later 
    // eslint-disable-next-line react-hooks/exhaustive-deps 
  }, []); 

  async function fetchGiveaways() { 
    setLoading(true); 
    const { data, error } = await supabase 
      .from("giveaways") 
      .select("*") 
      .in("status", ["active"]) 
      .order("created_at", { ascending: false }); 

    if (error) { 
      console.error("Failed to load giveaways", error); 
      setGiveaways([]); 
    } else { 
      setGiveaways((data as Giveaway[]) || []); 
    } 
    setLoading(false); 
  } 

  async function joinFree(giveawayId: string) { 
    // Free ticket flow: insert a free ticket row via an RPC or direct insert (RLS allows buyer insert) 
    try { 
      const { data, error } = await supabase.from("tickets").insert([ 
        { 
          giveaway_id: giveawayId, 
          owner_id: (await supabase.auth.getUser()).data.user?.id, 
          type: "free", 
          amount: 0, 
        }, 
      ]); 
      if (error) throw error; 
      alert("Free ticket claimed — good luck!"); 
      fetchGiveaways(); 
    } catch (e: any) { 
      console.error(e); 
      alert(e.message || "Failed to claim free ticket"); 
    } 
  } 

  async function buyTicket(giveawayId: string, qty = 1) { 
    setBuyingId(giveawayId); 
    try { 
      const session = await supabase.auth.getSession(); 
      const token = session.data.session?.access_token; 
      if (!token) throw new Error("You must be signed in to buy tickets."); 

      const res = await fetch( 
        `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/buy-ticket`, 
        { 
          method: "POST", 
          headers: { 
            "Content-Type": "application/json", 
            Authorization: `Bearer ${token}`, 
          }, 
          body: JSON.stringify({ 
            user_id: session.data.session?.user?.id, 
            giveaway_id: giveawayId, 
            quantity: qty, 
          }), 
        } 
      ); 

      const payload = await res.json(); 
      if (!res.ok) { 
        console.error("buy-ticket error", payload); 
        throw new Error(payload?.message || "Ticket purchase failed"); 
      } 

      alert(`Bought ${qty} ticket(s). Good luck!`); 
      await fetchGiveaways(); 
    } catch (err: any) { 
      console.error(err); 
      alert(err.message || "Failed to buy ticket"); 
    } finally { 
      setBuyingId(null); 
    } 
  } 

  async function donate(giveawayId: string) { 
    try { 
      const amount = parseFloat(donationAmounts[giveawayId] || "0"); 
      if (!amount || amount <= 0) { 
        alert("Enter a valid donation amount (USDT)."); 
        return; 
      } 

      const session = await supabase.auth.getSession(); 
      const token = session.data.session?.access_token; 
      if (!token) throw new Error("You must be signed in to donate."); 

      const res = await fetch( 
        `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/donate-to-pool`, 
        { 
          method: "POST", 
          headers: { 
            "Content-Type": "application/json", 
            Authorization: `Bearer ${token}`, 
          }, 
          body: JSON.stringify({ 
            user_id: session.data.session?.user?.id, 
            giveaway_id: giveawayId, 
            amount, 
          }), 
        } 
      ); 

      const payload = await res.json(); 
      if (!res.ok) { 
        console.error("donate error", payload); 
        throw new Error(payload?.message || "Donation failed"); 
      } 

      alert("Thanks for donating — your donation was added to the prize pool."); 
      setDonationAmounts((s) => ({ ...s, [giveawayId]: "" })); 
      await fetchGiveaways(); 
    } catch (err: any) { 
      console.error(err); 
      alert(err.message || "Donation failed"); 
    } 
  } 

  if (loading) { 
    return (
      <div className="p-6 max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-4">Active Giveaways 🎉</h1>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 mt-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="border rounded-xl p-4 bg-white dark:bg-gray-900 shadow-sm">
              <div className="w-full h-44 bg-gray-200 dark:bg-gray-800 rounded-md mb-3 animate-pulse" />
              <div className="h-5 w-2/3 bg-gray-200 dark:bg-gray-800 rounded mb-2 animate-pulse" />
              <div className="h-4 w-full bg-gray-200 dark:bg-gray-800 rounded mb-3 animate-pulse" />
              <div className="mt-3 flex items-center justify-between">
                <div>
                  <div className="h-3 w-20 bg-gray-200 dark:bg-gray-800 rounded mb-1 animate-pulse" />
                  <div className="h-6 w-24 bg-gray-200 dark:bg-gray-800 rounded mb-1 animate-pulse" />
                  <div className="h-3 w-28 bg-gray-200 dark:bg-gray-800 rounded animate-pulse" />
                </div>
                <div className="flex flex-col sm:flex-row gap-2">
                  <div className="h-9 w-28 bg-gray-200 dark:bg-gray-800 rounded animate-pulse" />
                  <div className="h-9 w-40 bg-gray-200 dark:bg-gray-800 rounded animate-pulse" />
                </div>
              </div>
              <div className="mt-3">
                <div className="h-3 w-40 bg-gray-200 dark:bg-gray-800 rounded mb-2 animate-pulse" />
                <div className="flex gap-2 mt-2">
                  <div className="h-8 flex-1 bg-gray-200 dark:bg-gray-800 rounded animate-pulse" />
                  <div className="h-8 w-24 bg-gray-200 dark:bg-gray-800 rounded animate-pulse" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    ); 
  } 

  return ( 
    <div className="p-6 max-w-6xl mx-auto"> 
      <h1 className="text-3xl font-bold mb-4">Active Giveaways 🎉</h1> 
      {giveaways.length === 0 && ( 
        <p className="text-muted-foreground">No active giveaways yet.</p> 
      )} 

      <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 mt-6"> 
        {giveaways.map((g) => ( 
          <div 
            key={g.id} 
            className="group border rounded-xl p-4 bg-white dark:bg-gray-900 shadow-md hover:shadow-lg transition-all duration-300 ease-out hover:-translate-y-0.5" 
          > 
            {g.media_url && ( 
              <img 
                src={g.media_url} 
                alt={g.title || "giveaway media"} 
                className="w-full h-44 object-cover rounded-md mb-3 transition-transform duration-300 ease-out group-hover:scale-[1.02]" 
              /> 
            )} 
            <h2 className="text-lg font-semibold mb-1"> 
              {g.title || "Giveaway"} 
            </h2> 
            <p className="text-sm text-gray-600 dark:text-gray-300"> 
              {g.description} 
            </p> 

            <div className="mt-3 flex items-center justify-between"> 
              <div> 
                <div className="text-sm text-gray-500">Prize pool</div>
                <div className="text-xl font-bold"> 
                  {Number(g.prize_pool_usdt ?? g.prize_amount ?? 0).toFixed(2)}{" "} 
                  USDT 
                </div> 
                <div className="text-xs text-gray-400 mt-1"> 
                  Ticket price: {g.ticket_price ?? 1} USDT 
                </div> 
              </div> 

              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3"> 
                <button
                  onClick={() => joinFree(g.id)}
                  className="relative px-4 py-2 rounded-md bg-transparent text-green-300 font-bold tracking-wide transition-all duration-300 active:scale-95"
                >
                  <span className="relative z-10 drop-shadow-[0_1px_1px_rgba(0,0,0,0.4)]">Claim Free Ticket</span>
                  <span
                    aria-hidden="true"
                    className="absolute inset-0 rounded-md ring-1 ring-green-400/50"
                  />
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute -inset-1 rounded-md opacity-0 group-hover:opacity-100 blur-md bg-green-400/30"
                  />
                </button>
 
                <button 
                  onClick={() => buyTicket(g.id, 1)} 
                  disabled={buyingId === g.id} 
                  className="px-3 py-2 rounded-md bg-onaguiGreen text-white hover:bg-onaguiGreen-dark transition-all duration-200 active:scale-95 shadow-md hover:shadow-lg" 
                > 
                  {buyingId === g.id ? "Processing..." : "Buy 1 Ticket (1 USDT)"} 
                </button> 
              </div> 
            </div> 
 
            <div className="mt-3"> 
              <label className="text-xs text-gray-500">Donate to pool (USDT)</label> 
              <div className="flex gap-2 mt-2"> 
                <input 
                  type="number" 
                  step="0.01" 
                  min="0" 
                  value={donationAmounts[g.id] || ""} 
                  onChange={(e) => 
                    setDonationAmounts((s) => ({ ...s, [g.id]: e.target.value })) 
                  } 
                  className="flex-1 border rounded px-2 py-1 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-purple-500/40" 
                /> 
                <button 
                  onClick={() => donate(g.id)} 
                  className="px-3 py-1 rounded-md bg-amber-500 text-white hover:bg-amber-600 transition-colors duration-200 active:scale-95 shadow-sm hover:shadow-md" 
                > 
                  Donate 
                </button> 
              </div> 
            </div> 
          </div> 
        ))} 
      </div> 
    </div> 
  ); 
}
