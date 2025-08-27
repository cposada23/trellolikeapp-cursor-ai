'use client';

import { Button } from '@/components/ui/button';
import { SignInButton, SignUpButton, useAuth } from '@clerk/nextjs';

export function AuthButtons() {
  const { isSignedIn } = useAuth();
  
  if (isSignedIn) return null;
  
  return (
    <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
      {/* Sign Up Modal using Clerk's modal mode */}
      <SignUpButton mode="modal" forceRedirectUrl="/dashboard">
        <Button size="lg" className="bg-purple-600 hover:bg-purple-700 text-white px-8">
          Get Started Free
        </Button>
      </SignUpButton>
      
      {/* Sign In Modal using Clerk's modal mode */}
      <SignInButton mode="modal" forceRedirectUrl="/dashboard">
        <Button variant="outline" size="lg" className="px-8 text-white border-white/20 hover:bg-white/10">
          Sign In
        </Button>
      </SignInButton>
    </div>
  );
}
