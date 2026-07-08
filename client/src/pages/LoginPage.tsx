function LoginPage() {
  return (
    <div className="min-h-screen flex flex-col items-center p-6">

      {/* Top: Logo */}
      <div className="flex items-center gap-3 pt-12">
        <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
          <span className="font-display text-primary-foreground text-xl leading-none">ñ</span>
        </div>
        <span className="font-display text-2xl font-semibold">
          Español<span className="text-primary">AI</span>
        </span>
      </div>

      {/* Middle: Card + Sign up link (grows to fill space) */}
      <div className="flex-1 flex flex-col justify-center items-center w-full gap-6 py-12">

        {/* Card */}
        <div className="bg-card border border-border rounded-2xl p-8 w-full max-w-md shadow-sm">

          {/* Heading */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-display text-foreground mb-2">Welcome back</h1>
            <p className="text-muted-foreground">Pick up right where you left off.</p>
          </div>

          {/* Form */}
          <form>
            {/* Email */}
            <div className="mb-6">
              <label htmlFor="email" className="text-sm font-medium mb-2 block">EMAIL</label>
              <input
                id="email"
                type="email"
                placeholder="Enter your email"
                className="w-full bg-input border border-border rounded-lg px-4 py-3 focus:outline-none focus:border-primary transition"
              />
            </div>

            {/* Password */}
            <div className="mb-6">
              <div className="flex flex-row justify-between items-center mb-2">
                <label htmlFor="password" className="text-sm font-medium">PASSWORD</label>
                <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition">
                  Forgot password?
                </a>
              </div>
              <input
                id="password"
                type="password"
                placeholder="Enter your password"
                className="w-full bg-input border border-border rounded-lg px-4 py-3 focus:outline-none focus:border-primary transition"
              />
            </div>

            {/* Log in button */}
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-primary to-primary-light text-primary-foreground py-3 rounded-xl font-medium hover:opacity-90 transition"
            >
              Log in →
            </button>
          </form>

        </div>

        {/* Sign up link (below card) */}
        <p className="text-muted-foreground">
          Don't have an account?{' '}
          <a href="/signup" className="font-semibold text-foreground hover:text-primary transition">
            Sign up
          </a>
        </p>

      </div>

      {/* Bottom: Footer */}
      <footer className="text-sm text-muted-foreground">
        © 2026 EspañolAI · Aprende sin límites
      </footer>

    </div>
  );
}

export default LoginPage;