export default function AdminPage() {
  return (
    <div style={{ padding: '40px', textAlign: 'center', backgroundColor: '#4CAF50', color: 'white', minHeight: '100vh' }}>
      <h1 style={{ fontSize: '48px' }}>🎯 ADMIN PANEL - NO AUTH</h1>
      <p style={{ fontSize: '24px' }}>All authentication completely disabled</p>
      <div style={{ marginTop: '40px', background: 'rgba(0,0,0,0.3)', padding: '20px', borderRadius: '10px' }}>
        <h3>Authentication Status:</h3>
        <p>✅ NO SERVER-SIDE AUTH</p>
        <p>✅ NO CLIENT-SIDE AUTH</p>
        <p>✅ NO MIDDLEWARE AUTH</p>
        <p>✅ DIRECT ACCESS GUARANTEED</p>
      </div>
    </div>
  );
}