(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push(["chunks/[root-of-the-server]__a748ce81._.js",
"[externals]/node:buffer [external] (node:buffer, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("node:buffer", () => require("node:buffer"));

module.exports = mod;
}),
"[externals]/node:async_hooks [external] (node:async_hooks, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("node:async_hooks", () => require("node:async_hooks"));

module.exports = mod;
}),
"[project]/temp-restore/src/middleware.ts [middleware-edge] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "middleware",
    ()=>middleware
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$temp$2d$restore$2f$node_modules$2f40$supabase$2f$auth$2d$helpers$2d$nextjs$2f$dist$2f$index$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/temp-restore/node_modules/@supabase/auth-helpers-nextjs/dist/index.js [middleware-edge] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$temp$2d$restore$2f$node_modules$2f$next$2f$dist$2f$esm$2f$api$2f$server$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/temp-restore/node_modules/next/dist/esm/api/server.js [middleware-edge] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$temp$2d$restore$2f$node_modules$2f$next$2f$dist$2f$esm$2f$server$2f$web$2f$exports$2f$index$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/temp-restore/node_modules/next/dist/esm/server/web/exports/index.js [middleware-edge] (ecmascript)");
;
;
// Routes that require authentication
const protectedRoutes = [
    '/profile',
    '/account'
];
// Admin routes
const adminRoutes = [
    '/admin'
];
async function middleware(req) {
    const res = __TURBOPACK__imported__module__$5b$project$5d2f$temp$2d$restore$2f$node_modules$2f$next$2f$dist$2f$esm$2f$server$2f$web$2f$exports$2f$index$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["NextResponse"].next();
    const supabase = (0, __TURBOPACK__imported__module__$5b$project$5d2f$temp$2d$restore$2f$node_modules$2f40$supabase$2f$auth$2d$helpers$2d$nextjs$2f$dist$2f$index$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["createMiddlewareClient"])({
        req,
        res
    });
    // Check if the route requires authentication
    const isProtectedRoute = protectedRoutes.some((route)=>req.nextUrl.pathname.startsWith(route));
    // Check if the route is admin-only
    const isAdminRoute = adminRoutes.some((route)=>req.nextUrl.pathname.startsWith(route));
    if (isProtectedRoute || isAdminRoute) {
        const { data: { session } } = await supabase.auth.getSession();
        // If no session and trying to access protected route, redirect to login
        if (!session) {
            const redirectUrl = new URL('/login', req.url);
            redirectUrl.searchParams.set('redirectTo', req.nextUrl.pathname);
            return __TURBOPACK__imported__module__$5b$project$5d2f$temp$2d$restore$2f$node_modules$2f$next$2f$dist$2f$esm$2f$server$2f$web$2f$exports$2f$index$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["NextResponse"].redirect(redirectUrl);
        }
        // For admin routes, check if user is admin
        if (isAdminRoute) {
            const { data: profile } = await supabase.from('onagui_profiles').select('onagui_type').eq('id', session.user.id).single();
            if (!profile || profile.onagui_type !== 'admin') {
                return __TURBOPACK__imported__module__$5b$project$5d2f$temp$2d$restore$2f$node_modules$2f$next$2f$dist$2f$esm$2f$server$2f$web$2f$exports$2f$index$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["NextResponse"].redirect(new URL('/', req.url));
            }
        }
    } else {
        // For non-protected routes, just refresh the session
        await supabase.auth.getSession();
    }
    return res;
}
}),
]);

//# sourceMappingURL=%5Broot-of-the-server%5D__a748ce81._.js.map