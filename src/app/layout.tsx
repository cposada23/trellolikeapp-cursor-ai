import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import Link from "next/link";
import {
  ClerkProvider,
  SignInButton,
  SignUpButton,
  SignedIn,
  SignedOut,
  UserButton,
} from "@clerk/nextjs";
import { shadesOfPurple } from "@clerk/themes";
import { Button } from "@/components/ui/button";
import "./globals.css";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Flashy Card App",
  description: "A flashcard application with Clerk authentication",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider
      appearance={{
        baseTheme: shadesOfPurple,
      }}
    >
      <html lang="en" className="dark">
        <body
          className={`${poppins.variable} antialiased font-sans`}
        >
          <header className="border-b border-purple-800/50 bg-purple-950/30 backdrop-blur">
            <div className="container mx-auto px-4 py-4 flex justify-between items-center">
              <Link href="/" className="text-2xl font-bold text-white hover:text-purple-300 transition-colors">
                Flashy Card App
              </Link>
              <div className="flex items-center gap-4">
                <SignedIn>
                  <Link href="/dashboard">
                    <Button variant="ghost" className="text-purple-300 hover:text-white hover:bg-purple-600/20">
                      Dashboard
                    </Button>
                  </Link>
                </SignedIn>
                <SignedOut>
                  <SignInButton mode="modal" forceRedirectUrl="/dashboard">
                    <Button className="bg-purple-600 hover:bg-purple-700 text-white">
                      Sign In
                    </Button>
                  </SignInButton>
                  <SignUpButton mode="modal" forceRedirectUrl="/dashboard">
                    <Button variant="outline" className="text-purple-300 hover:text-white border-purple-500 hover:border-purple-400 hover:bg-purple-600/20 bg-transparent">
                      Sign Up
                    </Button>
                  </SignUpButton>
                </SignedOut>
                <SignedIn>
                  <UserButton afterSignOutUrl="/" />
                </SignedIn>
              </div>
            </div>
          </header>
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
