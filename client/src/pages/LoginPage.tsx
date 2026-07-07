function LoginPage() {
    return (
        //full screen flexbox with centered content
        <div className="flex flex-col items-center bg-color p-4 justify-center h-screen gap-8">
          <div> maybe this the espanolAi icon thing</div>
            <div>
                <div className="flex flex-col items-center bg-card rounded-2xl p-8 shadow-lg border border-border w-full max-w-md"> 
                
               {/* Wrapper for top of card */}
                   <div className="text-center mb-8">
                     <h1 className="text-2xl font-display"> Welcome back</h1>
                    <p className="text-muted-foreground">Pick up right where you left off.</p>
                     </div>
                {/* Wrapper for form */}

                    <div className="p-2">
                        <label htmlFor="email" className="text-sm font-medium mb-2 block">Email</label>
                        <input id="email" type="email" placeholder="Enter your email" className="w-full bg-input border border-border rounded-lg px-4 py-3 focus:outline-none focus:border-primary"/>
                    </div>
                    <div>
                        <label htmlFor="password" className="text-sm font-medium mb-2 block">Password</label>
                        <input id="password" type="password" placeholder="Enter your password" className="w-full bg-input border border-border rounded-lg px-4 py-3 focus:outline-none focus:border-primary"/>
                    </div>
          


                </div>
            </div>
         
        </div>
    );
}

export default LoginPage;