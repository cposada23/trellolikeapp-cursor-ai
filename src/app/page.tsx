import { SignedOut } from "@clerk/nextjs";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function Home() {
  const user = await currentUser();
  
  // Redirect signed-in users to dashboard
  if (user) {
    redirect('/dashboard');
  }

  return (
    <div className="min-h-[calc(100vh-80px)] flex items-center justify-center p-8">
      <div className="max-w-4xl mx-auto text-center">
        <SignedOut>
          <div className="space-y-8">
            <div className="space-y-4">
              <h1 className="text-5xl font-bold text-white">
                Welcome to Flashy Card App
              </h1>
              <p className="text-xl text-gray-400 max-w-2xl mx-auto">
                Master any subject with our smart flashcard system. Create, study, and track your progress with personalized learning experiences.
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8 mt-12">
              <Card className="bg-white/5 backdrop-blur border-white/10">
                <CardHeader className="text-center">
                  <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                  </div>
                  <CardTitle className="text-lg font-semibold text-white">Smart Cards</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-400 text-center">Create interactive flashcards with rich content and multimedia support.</p>
                </CardContent>
              </Card>
              
              <Card className="bg-white/5 backdrop-blur border-white/10">
                <CardHeader className="text-center">
                  <div className="w-12 h-12 bg-indigo-500 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <CardTitle className="text-lg font-semibold text-white">Track Progress</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-400 text-center">Monitor your learning with detailed analytics and performance insights.</p>
                </CardContent>
              </Card>
              
              <Card className="bg-white/5 backdrop-blur border-white/10">
                <CardHeader className="text-center">
                  <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <CardTitle className="text-lg font-semibold text-white">Study Smart</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-400 text-center">Adaptive learning algorithm focuses on cards you need to practice most.</p>
                </CardContent>
              </Card>
            </div>
            
            <div className="mt-12">
              <p className="text-lg text-gray-300 mb-6">
                Ready to boost your learning? Sign up to get started!
              </p>
            </div>
          </div>
        </SignedOut>

        {/* SignedIn users are redirected to dashboard, so this component will never render for signed-in users */}
      </div>
    </div>
  );
}
