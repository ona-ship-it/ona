export default function NotAuthorizedPage() {
  return (
    <div style={{ padding: 24 }}>
      <h1 style={{ fontSize: 24, fontWeight: 600 }}>Not Authorized</h1>
      <p style={{ marginTop: 12 }}>
        You don’t have permission to view this page.
      </p>
      <p style={{ marginTop: 8 }}>
        If you believe this is a mistake, please sign in with your admin email
        or contact support.
      </p>
      <a href="/signin" style={{ marginTop: 16, display: 'inline-block', color: '#2563eb' }}>
        Go to Sign In
      </a>
    </div>
  );
}