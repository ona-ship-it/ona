// src/app/saved/page.tsx
export default function SavedPage() {
  return (
    <div style={{ 
      minHeight: '100vh', 
      background: '#0a1929',
      color: '#fff',
      padding: '2rem',
      textAlign: 'center'
    }}>
      <h1 style={{ 
        fontSize: '2rem', 
        color: '#00D4D4',
        marginBottom: '1rem'
      }}>
        Saved Items
      </h1>
      <p style={{ color: '#94a3b8' }}>
        Your saved giveaways and raffles will appear here.
      </p>
    </div>
  );
}