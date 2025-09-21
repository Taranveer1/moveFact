# React Hooks Usage Guide

Your Movie Facts app effectively uses basic React hooks for simple state management. Here's how each hook is used throughout the application:

## 🎣 Hook Patterns Currently Used

### 1. **useState** - Local Component State

**Loading States:**

```typescript
// Dashboard component
const [isLoading, setIsLoading] = useState(true);
const [generatingFactFor, setGeneratingFactFor] = useState<string | null>(null);

// Login component
const [isLoading, setIsLoading] = useState(false);

// API Tester component
const [isSettingMovie, setIsSettingMovie] = useState(false);
const [isGettingFact, setIsGettingFact] = useState(false);
```

**Form Data:**

```typescript
// Add Movie page
const [formData, setFormData] = useState<MovieFormData>({
  title: "",
  year: new Date().getFullYear(),
  genre: "",
  director: "",
  cast: "",
  plot: "",
  facts: "",
  rating: 5,
});

// Fact Generator
const [movie, setMovie] = useState(movieTitle || "");
const [fact, setFact] = useState("");
```

**Error Handling:**

```typescript
// Used across multiple components
const [error, setError] = useState("");

// Pattern for clearing errors
setError("");
setError("Something went wrong");
```

**API Results:**

```typescript
// Movie API Tester
const [setMovieResult, setSetMovieResult] = useState<any>(null);
const [factResult, setFactResult] = useState<any>(null);

// Dashboard movie facts
const [movieFacts, setMovieFacts] = useState<Record<string, string>>({});
```

### 2. **useSession** - Authentication State

```typescript
// Basic usage pattern
const { data: session, status } = useSession();

// Conditional rendering based on auth status
if (status === "loading") {
  return <LoadingSpinner />;
}

if (status === "unauthenticated") {
  return <LoginPrompt />;
}

// Access user data
if (session?.user) {
  console.log(session.user.name, session.user.email);
}
```

### 3. **useRouter** - Navigation

```typescript
import { useRouter } from "next/navigation";

const router = useRouter();

// Redirect patterns
useEffect(() => {
  if (status === "unauthenticated") {
    router.push("/login");
  }
}, [status, router]);

// Programmatic navigation
const handleSuccess = () => {
  router.push("/dashboard");
};
```

### 4. **useEffect** - Side Effects

**Authentication Redirects:**

```typescript
useEffect(() => {
  if (status === "authenticated") {
    router.push("/dashboard");
  }
}, [status, router]);
```

**Data Fetching:**

```typescript
useEffect(() => {
  if (status === "authenticated") {
    // Load movies from localStorage
    const moviesData = localStorage.getItem("movies");
    if (moviesData) {
      setMovies(JSON.parse(moviesData));
    }

    // Fetch user's favorite movie
    fetchUserFavoriteMovie();
    setIsLoading(false);
  }
}, [status, router]);
```

## 📋 Component State Management Patterns

### Simple Form State

```typescript
const [movieTitle, setMovieTitle] = useState("");

const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  setMovieTitle(e.target.value);
};
```

### Complex Form State

```typescript
const [formData, setFormData] = useState<MovieFormData>({
  title: "",
  year: new Date().getFullYear(),
  // ... other fields
});

const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  const { name, value, type } = e.target;
  setFormData((prev) => ({
    ...prev,
    [name]: type === "number" ? Number(value) : value,
  }));
};
```

### Async Operation State

```typescript
const [isLoading, setIsLoading] = useState(false);
const [error, setError] = useState("");
const [result, setResult] = useState(null);

const handleAsyncAction = async () => {
  setIsLoading(true);
  setError("");
  setResult(null);

  try {
    const response = await fetch("/api/endpoint");
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error);
    }

    setResult(data);
  } catch (err) {
    setError(err.message);
  } finally {
    setIsLoading(false);
  }
};
```

## 🎯 Why This Approach Works

### ✅ **Simple & Effective**

- No complex state management libraries needed
- Each component manages its own state
- Easy to understand and debug

### ✅ **Proper Separation**

- Loading states isolated per component
- Form data contained within forms
- API results stored locally where used

### ✅ **Predictable Patterns**

- Consistent error handling across components
- Standard loading state management
- Clear authentication flow with useSession

### ✅ **TypeScript Integration**

- Full type safety with useState<Type>()
- Proper typing for form data and API responses
- Type-safe state updates

## 🚫 What You DON'T Need

Since your app uses simple, focused components:

- ❌ **Redux/Zustand** - No global state complexity
- ❌ **useReducer** - Simple useState is sufficient
- ❌ **Custom Hooks** - Basic hooks handle all needs
- ❌ **State Machines** - Linear flows work fine
- ❌ **Complex Context** - NextAuth provides auth context

## 🔄 Current Hook Flow

```
1. useSession → Check authentication status
2. useRouter → Handle navigation/redirects
3. useState → Manage component state
4. useEffect → Handle side effects (auth redirects, data loading)
```

This pattern is repeated consistently across all components, making the codebase predictable and maintainable.

## 💡 Best Practices You're Following

1. **Single Responsibility** - Each useState handles one piece of state
2. **Proper Dependencies** - useEffect dependencies are correctly specified
3. **Error Boundaries** - Consistent error state management
4. **Loading States** - Visual feedback during async operations
5. **Type Safety** - TypeScript integration with all hooks
6. **Cleanup** - Proper finally blocks for loading states

Your current hook usage is clean, simple, and effective for this application size and complexity!
