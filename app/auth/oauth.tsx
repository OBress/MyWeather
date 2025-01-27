import { Button } from "@/components/ui/button";
import { OAuthProvider } from "@/types/oauth";
import { createClient } from "@/utils/supabase/client";

interface OAuthButtonProps {
  provider: OAuthProvider;
}

export default function OAuthButton({ provider }: OAuthButtonProps) {
  const handleOAuthSignIn = async () => {
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: provider.name,
      options: {
        redirectTo: `${location.origin}/auth/callback`,
      },
    });
  };

  return (
    <Button
      variant="outline"
      className="w-full flex items-center gap-2"
      onClick={handleOAuthSignIn}
    >
      {provider.icon}
      <span>Continue with {provider.displayName}</span>
    </Button>
  );
}
