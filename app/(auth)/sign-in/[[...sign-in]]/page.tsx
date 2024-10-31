import { SignIn } from "@clerk/nextjs";

export default function Page() {
  return (
    <div className="w-full max-w-md">
      <SignIn 
        appearance={{
          elements: {
            rootBox: "mx-auto",
            card: "shadow-xl border rounded-lg",
          },
        }}
        routing="path"
        path="/sign-in"
        afterSignInUrl="/dashboard"
      />
    </div>
  );
} 