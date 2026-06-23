# myAuth — Clerk-like Auth for Your Own Backend

> Drop-in authentication boilerplate for React projects. Gives you the Clerk developer experience — `<ProtectedRoute>`, `<UserButton>`, `useLogin()`, `<RoleGuard>` — powered entirely by your own Express + PostgreSQL backend. No third-party auth service. No per-MAU pricing. Full control.

---

## What's Inside

| What you get | What Clerk calls it |
|---|---|
| `<UserButton />` | `<UserButton />` |
| `<ProtectedRoute>` | `<RedirectToSignIn />` |
| `<RoleGuard roles={[...]}>` | `<Protect role="..." />` |
| `useLogin()` | `useSignIn()` |
| `useLogout()` | `useClerk().signOut()` |
| `selectUser` Redux selector | `useUser()` |
| `selectIsAuthenticated` | `useAuth().isSignedIn` |
| Auto token injection on every request | Built into Clerk SDK |
| OTP email verification flow | Built into Clerk |
| Forgot / Reset password flow | Built into Clerk |
| Session manager UI | Clerk dashboard |

---

## Tech Stack

- **React.js** + **Tailwind CSS**
- **Redux Toolkit** + **Redux Persist** — auth state lives here, survives page refresh
- **TanStack Query** — profile, sessions, login history only (NOT auth state)
- **Axios** — single instance, token auto-injected on every request
- **React Router v6** — Outlet-based layout routing
- **react-toastify** — notifications

---

## Folder Structure

```
src/
├── api/
│   ├── axios.js                        ← Single axios instance (token auto-injected)
│   └── user/
│       ├── authApi.js                  ← Raw API calls: login, register, OTP, etc.
│       ├── userApi.js                  ← Raw API calls: profile, sessions, history
│       └── useUser.js                  ← TanStack Query hooks for user data
│
├── store/
│   ├── index.js                        ← Redux store + Redux Persist config
│   └── user.js                         ← Auth slice: user, accessToken, isAuthenticated
│
├── components/
│   ├── layout/
│   │   └── DashBoardOutlet.jsx         ← Your dashboard shell (sidebar + navbar + <Outlet />)
│   └── myAuth/
│       ├── index.js                    ← Single import point for everything
│       ├── AuthProvider.jsx            ← Wrap your app with this
│       ├── AuthLayout.jsx              ← Centered wrapper for auth pages (Outlet-aware)
│       ├── ProtectedRoute.jsx          ← Redirect if not logged in (Outlet-aware)
│       ├── RoleGuard.jsx               ← Redirect if wrong role (Outlet-aware)
│       ├── LoginForm.jsx               ← Ready-to-use login form
│       ├── SignupForm.jsx              ← Ready-to-use register form (with password strength)
│       ├── VerifyOtpForm.jsx           ← Handles both verify email + password reset OTP
│       ├── ForgotPasswordForm.jsx
│       ├── ResetPasswordForm.jsx
│       ├── UserAvatar.jsx              ← Avatar image or initials fallback
│       ├── UserButton.jsx              ← Clerk-style avatar button + dropdown
│       ├── UserDropdown.jsx            ← Profile info, links, sign out
│       ├── SessionManager.jsx          ← View and revoke active sessions
│       ├── LoginHistory.jsx            ← Login history list
│       ├── hooks/
│       │   └── useAuthForms.js         ← All auth mutation hooks
│       └── ui/
│           └── AuthUI.jsx              ← Shared primitives (inputs, buttons, cards)
│
└── utils/
    ├── deviceInfo.js                   ← Collects browser/OS/screen info for login
    └── getToken.js                     ← Read token outside React (non-hook contexts)
```

---

## Quick Start

### Step 1 — Wire up `main.jsx`

```jsx
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { store, persistor } from "@/store";
import AuthProvider from "@/components/myAuth/AuthProvider";
import App from "./App";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

ReactDOM.createRoot(document.getElementById("root")).render(
  <Provider store={store}>
    <PersistGate loading={null} persistor={persistor}>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <AuthProvider>
            <App />
          </AuthProvider>
        </BrowserRouter>
        <ToastContainer limit={3} pauseOnHover />
      </QueryClientProvider>
    </PersistGate>
  </Provider>
);
```

> **Order matters:** Redux → PersistGate → QueryClient → Router → AuthProvider

---

### Step 2 — Set up `App.jsx`

This is the recommended pattern — the real-world usage based on the actual project:

```jsx
import { useEffect } from "react";
import { Route, Routes, useLocation } from "react-router-dom";
import { ToastContainer } from "react-toastify";

import AuthLayout from "./components/myAuth/AuthLayout";
import ProtectedRoute from "./components/myAuth/ProtectedRoute";
import RoleGuard from "./components/myAuth/RoleGuard";
import DashBoardOutlet from "./components/layout/DashBoardOutlet";

// Auth pages — each page wraps the form component
// This lets you set page-level meta titles/descriptions per project
import LoginPage from "./pages/Auth/LoginPage";
import SignUpPage from "./pages/Auth/SignUpPage";
import VerifyOtpPage from "./pages/Auth/VerifyOtpPage";
import ForgotPasswordPage from "./pages/Auth/ForgotPasswordPage";
import ResetPasswordPage from "./pages/Auth/ResetPasswordPage";

// Dashboard pages
import AddBlog from "./pages/Blog/AddBlog";
import ManageBlogs from "./pages/Blog/ManageBlogs";
import EditBlog from "./pages/Blog/EditBlog";
import ManageBlogCategories from "./pages/Blog/ManageBlogCategories";
import Newsletter from "./pages/Newsletter";
import ManageMedia from "./pages/ManageMedia";

import HomePage from "./pages/HomePage";
import PageNotFound from "./pages/PageNotFound";
import PageNotFoundDB from "./pages/PageNotFoundDB";

const App = () => {
  const { pathname } = useLocation();

  // Scroll to top on every route change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return (
    <>
      <Routes>
        {/* Public home page */}
        <Route path="/" element={<HomePage />} />

        {/* Auth pages — AuthLayout provides the centered branded wrapper */}
        <Route element={<AuthLayout />}>
          <Route path="/login"           element={<LoginPage />} />
          <Route path="/register"        element={<SignUpPage />} />
          <Route path="/verify-otp"      element={<VerifyOtpPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password"  element={<ResetPasswordPage />} />
        </Route>

        {/* Dashboard shell — sidebar + navbar layout */}
        <Route element={<DashBoardOutlet />}>

          {/* Protected: any logged-in user */}
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard"                          element={<>Dashboard Home</>} />
            <Route path="/dashboard/add-blog"                element={<AddBlog />} />
            <Route path="/dashboard/manage-blogs"            element={<ManageBlogs />} />
            <Route path="/dashboard/manage-blogs-catgories"  element={<ManageBlogCategories />} />
            <Route path="/dashboard/edit-blog/:id"           element={<EditBlog />} />
            <Route path="/dashboard/newsletter"              element={<Newsletter />} />
            <Route path="/dashboard/manage-media"            element={<ManageMedia />} />
            <Route path="*"                                  element={<PageNotFoundDB />} />
          </Route>

          {/* Protected: Admin + Super Admin only */}
          <Route element={<RoleGuard roles={["ADMIN", "SUPER_ADMIN"]} />}>
            <Route path="/admin"          element={<>Admin Panel</>} />
            <Route path="/admin/users"    element={<>Admin Users</>} />
            <Route path="/admin/settings" element={<>Admin Settings</>} />
          </Route>

        </Route>

        {/* Global 404 */}
        <Route path="*" element={<PageNotFound />} />
      </Routes>

      <ToastContainer limit={3} pauseOnHover />
    </>
  );
};

export default App;
```

That's the full setup. Auth is working, routes are protected, token is injected automatically.

---

## How the Outlet Pattern Works

`AuthLayout`, `ProtectedRoute`, and `RoleGuard` all support two modes. The same component works both ways — it auto-detects which mode to use.

### Mode 1 — Layout Route (recommended, what we use)

```jsx
// AuthLayout wraps multiple routes — renders <Outlet /> inside itself
<Route element={<AuthLayout />}>
  <Route path="/login"    element={<LoginPage />} />
  <Route path="/register" element={<SignUpPage />} />
</Route>

// ProtectedRoute guards multiple routes at once
<Route element={<ProtectedRoute />}>
  <Route path="/dashboard" element={<Dashboard />} />
  <Route path="/profile"   element={<Profile />} />
</Route>
```

### Mode 2 — Direct Wrapper (still works, backward compatible)

```jsx
// Works fine if you only need to protect one specific route
<Route path="/dashboard" element={
  <ProtectedRoute>
    <Dashboard />
  </ProtectedRoute>
} />
```

Both modes work identically. Use Mode 1 when you have multiple routes to protect — it's DRY and scales cleanly.

---

## How Page Files Work

Auth form components (`LoginForm`, `SignupForm`, etc.) are imported inside page files rather than directly in `App.jsx`. This gives you a clean place to add page-level `<title>` or meta tags per project without touching the form components.

```jsx
// src/pages/Auth/LoginPage.jsx
import LoginForm from "../../components/myAuth/LoginForm";

const LoginPage = () => {
  return (
    <>
      {/* Add per-project meta title here if needed */}
      {/* <title>Sign In — My Project Name</title> */}
      <LoginForm />
    </>
  );
};

export default LoginPage;
```

```jsx
// src/pages/Auth/SignUpPage.jsx
import SignupForm from "../../components/myAuth/SignupForm";

const SignUpPage = () => {
  return <SignupForm />;
};

export default SignUpPage;
```

The form components themselves never need to change between projects. Only the page wrapper changes.

---

## How the Dashboard Layout Works

Your `DashBoardOutlet` is the shell — sidebar, navbar, and a main content area. It renders `<Outlet />` in the main content area, and React Router fills that with whichever child route matches.

```jsx
// src/components/layout/DashBoardOutlet.jsx
const DashBoardOutlet = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-[var(--background)]">
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed((p) => !p)}
        mobileOpen={mobileMenuOpen}
        onMobileClose={() => setMobileMenuOpen(false)}
      />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Navbar onMobileMenuClick={() => setMobileMenuOpen(true)} />
        <main className="flex-1 overflow-y-auto p-1 md:p-5">
          <Outlet />  {/* ← matched page renders here */}
        </main>
      </div>
    </div>
  );
};
```

The render chain for a protected dashboard page looks like this:

```
DashBoardOutlet       renders <Outlet />
  └── ProtectedRoute  checks auth, renders <Outlet /> if passed
        └── AddBlog   your actual page component
```

If the user is not logged in, `ProtectedRoute` redirects to `/login` before `AddBlog` ever renders. The `DashBoardOutlet` shell still renders — but the content area shows the redirect, not the page.

---

## Core Concepts

### How auth state works (NOT like Clerk)

Clerk calls a profile API on every page load. **We don't.** Here's our flow:

```
User logs in
    ↓
Backend returns { accessToken, refreshToken, user }
    ↓
useLogin() dispatches setCredentials() to Redux
    ↓
Redux Persist saves it to localStorage automatically
    ↓
User refreshes the page
    ↓
PersistGate rehydrates Redux from localStorage — instant, zero API calls
    ↓
App renders with full auth state already available
```

`selectUser`, `selectIsAuthenticated`, `selectUserRole` are available immediately on every render, even after a hard refresh. No loading spinner. No flicker.

### How the token gets into API requests

You never add `Authorization` headers manually. The axios request interceptor handles it:

```js
// Runs automatically before every api.get() / api.post() / api.put() / api.delete()
api.interceptors.request.use((config) => {
  const token = selectAccessToken(store.getState()); // reads directly from Redux
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
```

So when you write:
```js
const response = await api.get("blogs/");
```

The `Authorization: Bearer eyJ...` header is already there. You never think about it.

---

## Components Reference

### `<AuthLayout>`

Provides the centered, branded page wrapper for all auth routes. Renders `<Outlet />` when used as a layout route, or `{children}` when used as a direct wrapper.

```jsx
// As a layout route (recommended — one wrapper for all auth pages)
<Route element={<AuthLayout />}>
  <Route path="/login"    element={<LoginPage />} />
  <Route path="/register" element={<SignUpPage />} />
</Route>

// As a direct wrapper (also works)
<Route path="/login" element={<AuthLayout><LoginForm /></AuthLayout>} />

// Without the top branding (logo + app name)
<Route element={<AuthLayout showBranding={false} />}>
  <Route path="/login" element={<LoginPage />} />
</Route>
```

> **Customise the logo:** Open `AuthLayout.jsx` and replace the placeholder `A` div with your actual logo component.

---

### `<ProtectedRoute>`

Redirects unauthenticated users to `/login`. Stores `location.state.from` so the user returns to where they were after logging in. Auto-detects Outlet vs wrapper mode.

```jsx
// Layout route mode — protects a group of routes at once (recommended)
<Route element={<ProtectedRoute />}>
  <Route path="/dashboard" element={<Dashboard />} />
  <Route path="/profile"   element={<Profile />} />
</Route>

// Wrapper mode — protects one specific route
<Route path="/dashboard" element={
  <ProtectedRoute>
    <Dashboard />
  </ProtectedRoute>
} />

// Custom redirect destination
<Route element={<ProtectedRoute redirectTo="/signin" />}>
  <Route path="/dashboard" element={<Dashboard />} />
</Route>
```

---

### `<RoleGuard>`

Checks the logged-in user's role against an allowed list. Unauthenticated users go to `/login`. Authenticated users with the wrong role go to `/unauthorized` (or your custom path). Auto-detects Outlet vs wrapper mode.

Available roles: `USER`, `ADMIN`, `SUPER_ADMIN`, `MODERATOR`, `SUPPORT`, `OTHER`

```jsx
// Layout route mode — guards a group of routes (recommended)
<Route element={<RoleGuard roles={["ADMIN", "SUPER_ADMIN"]} />}>
  <Route path="/admin"       element={<AdminPanel />} />
  <Route path="/admin/users" element={<AdminUsers />} />
</Route>

// Wrapper mode with custom redirect
<RoleGuard roles={["SUPER_ADMIN"]} redirectTo="/home">
  <DangerZone />
</RoleGuard>

// Wrapper mode with a fallback element instead of redirecting
<RoleGuard roles={["SUPER_ADMIN"]} fallback={<p>You need Super Admin access.</p>}>
  <DangerZone />
</RoleGuard>
```

> Note: `fallback` only works in wrapper mode. In layout route mode, unauthorized users are always redirected.

---

### `<UserButton />`

Clerk-style avatar button. Drop it anywhere in your navbar. Shows Sign in / Sign up links when the user is logged out.

```jsx
import UserButton from "@/components/myAuth/UserButton";

// In your Navbar component
function Navbar() {
  return (
    <header>
      <Logo />
      <UserButton />
    </header>
  );
}

// With custom dropdown links
<UserButton
  links={[
    { to: "/settings", label: "Settings", icon: <SettingsIcon /> },
    { to: "/billing",  label: "Billing",  icon: <CreditCardIcon /> },
  ]}
/>
```

The dropdown always includes: avatar + name + email + role badge, Manage account, Active sessions, Login history, and Sign out. Your custom links appear between the nav items and Sign out.

---

### `<UserAvatar />`

Shows the user's avatar photo. Falls back to initials if no photo exists.

```jsx
import UserAvatar from "@/components/myAuth/UserAvatar";

// Uses logged-in user from Redux automatically
<UserAvatar />

// Custom size (pixels)
<UserAvatar size={48} />

// Pass a specific user object (e.g. admin panel listing other users)
<UserAvatar user={someOtherUser} size={32} />
```

---

### `<SessionManager />`

Full session management UI — lists all active sessions, lets users revoke individual ones or sign out all devices at once.

```jsx
import SessionManager from "@/components/myAuth/SessionManager";

function SecurityPage() {
  return (
    <div>
      <h1>Security</h1>
      <SessionManager />
    </div>
  );
}
```

---

### `<LoginHistory />`

Shows the user's login history — browser, OS, IP address, device type, time.

```jsx
import LoginHistory from "@/components/myAuth/LoginHistory";

function ActivityPage() {
  return <LoginHistory />;
}
```

---

## Hooks Reference

All hooks can be imported from the component file directly or from the barrel:

```js
import { useLogin, useLogout } from "@/components/myAuth/hooks/useAuthForms";
// or
import { useLogin, useLogout } from "@/components/myAuth";
```

---

### `useLogin()`

```jsx
const login = useLogin();

login.mutate(
  { email: "user@example.com", password: "secret123" },
  {
    onError: (err) => setError(err.response?.data?.message || "Login failed."),
  }
);

// Loading state
<button disabled={login.isPending}>
  {login.isPending ? "Signing in..." : "Sign in"}
</button>
```

On success: stores `user + accessToken + refreshToken` in Redux → redirects to `/dashboard` automatically.

---

### `useRegister()`

```jsx
const register = useRegister();

register.mutate(
  { name: "Jane Smith", email: "jane@example.com", password: "secret123" },
  {
    onError: (err) => setError(err.response?.data?.message),
  }
);
// On success → navigates to /verify-otp with email in router state
```

---

### `useVerifyOtp()`

```jsx
// Default — navigates to /login on success
const verifyOtp = useVerifyOtp();

// Custom — override the success navigation
const verifyOtp = useVerifyOtp({
  onSuccess: (data, variables) => {
    navigate("/reset-password", {
      state: { email: variables.email, otp: variables.otp },
    });
  },
});

verifyOtp.mutate({ email: "jane@example.com", otp: "483920" });
```

---

### `useResendOtp()`

```jsx
const resendOtp = useResendOtp();

resendOtp.mutate({
  email: "jane@example.com",
  purpose: "EMAIL_VERIFICATION", // or "PASSWORD_RESET"
});
```

---

### `useLogout()`

```jsx
const logout = useLogout();

// Call it anywhere — button, menu item, etc.
<button onClick={() => logout.mutate()} disabled={logout.isPending}>
  {logout.isPending ? "Signing out..." : "Sign out"}
</button>
```

Calls backend logout, clears Redux, clears TanStack Query cache, navigates to `/login`. Even if the backend call fails, local state is always cleared.

---

### `useForgotPassword()`

```jsx
const forgotPassword = useForgotPassword();

forgotPassword.mutate({ email: "jane@example.com" });
// On success → navigates to /verify-otp with purpose: "PASSWORD_RESET"
```

---

### `useResetPassword()`

```jsx
const resetPassword = useResetPassword();

resetPassword.mutate({
  email: "jane@example.com",
  otp: "483920",
  newPassword: "newSecret456",
});
// On success → navigates to /login
```

---

## Reading Auth State

These selectors read from Redux Persist — no API call, always instant.

```jsx
import { useSelector } from "react-redux";
import {
  selectUser,
  selectIsAuthenticated,
  selectUserRole,
  selectAccessToken,
} from "@/store/user";

function MyComponent() {
  const user       = useSelector(selectUser);
  const isLoggedIn = useSelector(selectIsAuthenticated);
  const role       = useSelector(selectUserRole);

  if (!isLoggedIn) return <p>Please log in.</p>;

  return <p>Hello {user.name} — {role}</p>;
}
```

**User object shape:**
```js
{
  id:         "clxyz123",
  name:       "Jane Smith",
  email:      "jane@example.com",
  role:       "USER",           // USER | ADMIN | SUPER_ADMIN | MODERATOR | SUPPORT | OTHER
  avatar_url: "https://..."     // or null
}
```

> **Rule of thumb:** Use `selectUser` for displaying name/avatar in your navbar and components. Only call `useGetProfile()` on the profile settings page where you need the freshest data.

---

## TanStack Query Hooks (User Data)

These are for data that needs to be fetched fresh — **not** for auth state.

### `useGetProfile()`

```jsx
import { useGetProfile } from "@/api/user/useUser";

// Only use this on the Profile Settings page
// Everywhere else, use selectUser from Redux
function ProfileSettingsPage() {
  const { data: profile, isLoading } = useGetProfile();

  if (isLoading) return <Spinner />;
  return <p>{profile.name}</p>;
}
```

### `useUpdateProfile()`

```jsx
import { useUpdateProfile } from "@/api/user/useUser";

const updateProfile = useUpdateProfile();

// Text update
updateProfile.mutate({ name: "Jane Updated" });

// With avatar upload
const formData = new FormData();
formData.append("avatar", file);
formData.append("name", "Jane Updated");
updateProfile.mutate(formData);
```

After success: Redux user state is patched automatically (navbar avatar updates instantly), and the profile query cache is refreshed too.

### `useGetLoginHistory()`

```jsx
import { useGetLoginHistory } from "@/api/user/useUser";

const { data: history = [], isLoading } = useGetLoginHistory();
```

### `useGetActiveSessions()` + `useRevokeSession()`

```jsx
import { useGetActiveSessions, useRevokeSession } from "@/api/user/useUser";

const { data: sessions = [] } = useGetActiveSessions();
const revokeSession = useRevokeSession();

// Revoke one session
revokeSession.mutate(session.id);
```

### `useLogoutAllDevices()`

```jsx
import { useLogoutAllDevices } from "@/api/user/useUser";

const logoutAll = useLogoutAllDevices();

<button onClick={() => logoutAll.mutate()}>
  Sign out all devices
</button>
```

Clears Redux locally and the query cache after backend responds.

---

## Building Custom Auth UI

The pre-built forms are ready to use as-is. If you need a fully custom UI, use the hooks with the shared UI primitives:

```jsx
import { useLogin } from "@/components/myAuth/hooks/useAuthForms";
import {
  AuthCard, AuthHeader, AuthBody,
  AuthInput, AuthButton, AuthErrorBanner,
} from "@/components/myAuth/ui/AuthUI";

function MyCustomLoginForm() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const login = useLogin();

  return (
    <AuthCard>
      <AuthHeader title="Sign in" subtitle="Welcome back" />
      <AuthBody>
        <AuthErrorBanner message={error} />
        <form onSubmit={(e) => {
          e.preventDefault();
          login.mutate(form, {
            onError: (err) => setError(err.response?.data?.message || "Login failed."),
          });
        }}>
          <AuthInput
            id="email" label="Email" type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
          <AuthInput
            id="password" label="Password" type="password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />
          <AuthButton type="submit" loading={login.isPending}>
            Sign in
          </AuthButton>
        </form>
      </AuthBody>
    </AuthCard>
  );
}
```

**Available UI primitives:**

| Component | Purpose |
|---|---|
| `<AuthCard>` | Card container with surface background and border |
| `<AuthHeader title subtitle>` | Title + subtitle block at the top of a card |
| `<AuthBody>` | Padded body wrapper inside the card |
| `<AuthInput>` | Input with label, error message, show/hide toggle for passwords |
| `<AuthButton loading variant>` | Primary or outline button with loading spinner |
| `<AuthErrorBanner message>` | Red error box — renders nothing if message is empty |
| `<AuthSuccessBanner message>` | Green success box — renders nothing if message is empty |
| `<AuthDivider label>` | "— or —" horizontal divider |
| `<AuthLink onClick>` | Inline text button styled in brand color |
| `<OtpInputGroup length value onChange>` | Row of individual digit inputs for OTP entry |
| `<Spinner size>` | Animated loading spinner |

---

## Making API Calls

Always import the single axios instance. Never create a new one.

```js
import api from "@/api/axios";

// GET
const getPosts = async () => {
  const response = await api.get("blogs/");
  return response.data;
};

// POST
const createPost = async (data) => {
  const response = await api.post("blogs/", data);
  return response.data;
};

// With URL params
const getPost = async (id) => {
  const response = await api.get(`blogs/${id}`);
  return response.data;
};

// File upload
const uploadMedia = async (file) => {
  const formData = new FormData();
  formData.append("file", file);
  const response = await api.post("media/upload", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
};
```

The `Authorization` header is injected automatically. You never add it manually.

---

## Reading the Token Outside React

For plain JS files (not React components) that need the token:

```js
import { getTokenFromStore, getUserFromStore } from "@/utils/getToken";

const token = getTokenFromStore(); // "eyJ..."
const user  = getUserFromStore();  // { id, name, email, role, ... }
```

Inside React components, always use `useSelector` instead:

```js
const token = useSelector(selectAccessToken);
const user  = useSelector(selectUser);
```

---

## Theming

Every auth component uses CSS variables. No hardcoded colors anywhere. Define these in your global CSS:

```css
:root {
  --brand-primary:            #2563eb;
  --brand-secondary:          #16a34a;
  --background:               #f9fafb;
  --surface:                  #ffffff;
  --surface-hover:            #f3f4f6;
  --border:                   #e5e7eb;
  --text-primary:             #111827;
  --text-secondary:           #6b7280;
  --muted:                    #9ca3af;
  --error:                    #dc2626;
  --success:                  #16a34a;
}

[data-theme="dark"] {
  --brand-primary:            #3b82f6;
  --background:               #0f172a;
  --surface:                  #1e293b;
  --surface-hover:            #334155;
  --border:                   #334155;
  --text-primary:             #f1f5f9;
  --text-secondary:           #94a3b8;
  --muted:                    #64748b;
  --error:                    #f87171;
  --success:                  #4ade80;
}
```

Toggle `data-theme="dark"` on `<html>` to switch themes. Everything updates automatically.

---

## OTP Flows

Both OTP flows use the same `<VerifyOtpForm>` page. The `purpose` value passed through router state controls which flow runs.

### Flow 1 — Email Verification (after registration)

```
User fills SignupForm
    → POST /api/auth/register
    → navigate("/verify-otp", { state: { email, purpose: "EMAIL_VERIFICATION" } })

User fills VerifyOtpForm
    → POST /api/auth/verify-otp { email, otp }
    → navigate("/login")
```

### Flow 2 — Password Reset

```
User fills ForgotPasswordForm
    → POST /api/auth/forgot-password { email }
    → navigate("/verify-otp", { state: { email, purpose: "PASSWORD_RESET" } })

User fills VerifyOtpForm
    → POST /api/auth/verify-otp { email, otp }
    → navigate("/reset-password", { state: { email, otp } })

User fills ResetPasswordForm
    → POST /api/auth/reset-password { email, otp, newPassword }
    → navigate("/login")
```

The email and OTP travel through React Router's `location.state` only — never written to Redux or localStorage. They disappear the moment the user navigates away. That's intentional.

---

## Full Auth Flow Reference

```
REGISTER
  → POST /api/auth/register { name, email, password }
  → Backend creates user, sends OTP email
  → Navigate to /verify-otp

VERIFY EMAIL
  → POST /api/auth/verify-otp { email, otp }
  → Backend marks user verified, sends welcome email
  → Navigate to /login

LOGIN
  → POST /api/auth/login { email, password, browser, os, deviceType, ... }
  → Backend returns { accessToken, refreshToken, user }
  → Redux stores all three (persisted to localStorage)
  → Axios interceptor injects token on every subsequent request
  → Navigate to /dashboard

LOGOUT
  → POST /api/auth/logout { refreshToken }
  → Redux cleared, TanStack Query cache cleared
  → Navigate to /login
  (Local state clears even if the backend call fails)

LOGOUT ALL DEVICES
  → POST /api/auth/logout-all  (requires Authorization header)
  → All sessions deleted on backend
  → Redux cleared locally
  → Navigate to /login

FORGOT PASSWORD
  → POST /api/auth/forgot-password { email }
  → Backend sends OTP email (always returns success to prevent email enumeration)
  → Navigate to /verify-otp (purpose: PASSWORD_RESET)

VERIFY OTP (password reset)
  → POST /api/auth/verify-otp { email, otp }
  → Navigate to /reset-password with { email, otp } in router state

RESET PASSWORD
  → POST /api/auth/reset-password { email, otp, newPassword }
  → Backend resets password, deletes ALL sessions for that user
  → Navigate to /login
```

---

## Checklist: Cloning to a New Project

- [ ] Copy `src/store/user.js` and `src/store/index.js`
- [ ] Copy `src/api/axios.js`
- [ ] Copy `src/api/user/` folder
- [ ] Copy `src/components/myAuth/` folder
- [ ] Copy `src/utils/deviceInfo.js` and `src/utils/getToken.js`
- [ ] Wrap `main.jsx`: Provider → PersistGate → QueryClientProvider → BrowserRouter → AuthProvider
- [ ] Create page wrapper files (`LoginPage.jsx`, `SignUpPage.jsx`, etc.) that import the form components
- [ ] Set up `App.jsx` with `<Route element={<AuthLayout />}>` for auth routes
- [ ] Set up your own dashboard layout component with `<Outlet />` in the main content area
- [ ] Wrap dashboard routes with `<Route element={<ProtectedRoute />}>`
- [ ] Wrap admin routes with `<Route element={<RoleGuard roles={["ADMIN", "SUPER_ADMIN"]} />}>`
- [ ] Define CSS variables in your global stylesheet
- [ ] Replace the logo placeholder in `AuthLayout.jsx`
- [ ] Update the `navigate("/dashboard")` line in `useAuthForms.js → useLogin()` if your dashboard path is different
- [ ] Install dependencies (see below)

---

## Dependencies

```bash
npm install @reduxjs/toolkit react-redux redux-persist
npm install @tanstack/react-query
npm install axios
npm install react-router-dom
npm install react-toastify
npm install ua-parser-js
```

---

## What This Is Not

- **Not an npm package** — it's a boilerplate you clone and own completely
- **Not Clerk** — no hosted dashboard, no per-MAU pricing, no vendor lock-in
- **Not a black box** — every file is in your repo, readable and editable
- **Not opinionated about your UI framework** — the CSS variable system means it adapts to any design system
- **Not opinionated about your backend** — swap Express for anything as long as the API response shapes match