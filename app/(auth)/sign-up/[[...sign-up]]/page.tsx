import { SignUp } from "@clerk/nextjs";

export default function Page() {
  return (
    <div className="w-full max-w-md">
      <SignUp 
        appearance={{
          elements: {
            rootBox: "mx-auto",
            card: "shadow-xl border rounded-lg",
          },
        }}
        routing="path"
        path="/sign-up"
        afterSignUpUrl="/dashboard"
      />
    </div>
  );
} 