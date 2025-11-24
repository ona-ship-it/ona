export default function AdminSimplePage() {
  return (
    <div style={{ padding: '40px', textAlign: 'center', backgroundColor: 'purple', color: 'white', minHeight: '100vh' }}>
      <h1 style={{ fontSize: '48px' }}>🔄 ALTERNATE ADMIN ROUTE</h1>
      <p style={{ fontSize: '24px' }}>This is a completely new route with no authentication history</p>
      <p>If this works, the issue is with your original admin route configuration</p>
      <div style={{ marginTop: '40px', background: 'rgba(0,0,0,0.3)', padding: '20px', borderRadius: '10px' }}>
        <h3>Route Information:</h3>
        <p>✅ FRESH ROUTE - NO AUTH HISTORY</p>
        <p>✅ NO LAYOUT DEPENDENCIES</p>
        <p>✅ NO MIDDLEWARE CONFLICTS</p>
        <p>✅ COMPLETELY ISOLATED</p>
      </div>
    </div>
  );
}