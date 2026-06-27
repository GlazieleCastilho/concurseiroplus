import { SignUp } from "@clerk/nextjs";

export default function SignUpPage(){
    return <SignUp signInUrl="/auth/sign-in" forceRedirectUrl="/billing" fallbackRedirectUrl="/billing" />

}
