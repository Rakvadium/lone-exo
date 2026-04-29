import { useState } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useAuthActions } from "@convex-dev/auth/react";
import { Button } from "@/components/Button";
import { Input } from "@/components/Input";
import { colors, spacing, fontSizes } from "@/lib/theme";
import { Apple, Globe } from "lucide-react-native";

export default function SignUpScreen() {
  const router = useRouter();
  const { signIn } = useAuthActions();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSignUp = async () => {
    if (!name || !email || !password || !confirmPassword) {
      setError("Please fill in all fields");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords don't match");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      await signIn("password", { email, password, name, flow: "signUp" });
      router.replace("/(tabs)");
    } catch {
      setError("Failed to create account. Email may already be in use.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOAuth = async (provider: "google" | "apple") => {
    setIsLoading(true);
    try {
      await signIn(provider);
    } catch {
      setError("Sign up failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <Text style={styles.logo}>LONE EXO</Text>
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Join us today</Text>
        </View>

        <View style={styles.oauthButtons}>
          <TouchableOpacity
            style={styles.oauthButton}
            onPress={() => handleOAuth("google")}
            disabled={isLoading}
          >
            <Globe size={22} color={colors.secondary} strokeWidth={1.75} />
            <Text style={styles.oauthText}>Continue with Google</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.oauthButton}
            onPress={() => handleOAuth("apple")}
            disabled={isLoading}
          >
            <Apple size={22} color={colors.secondary} strokeWidth={1.75} />
            <Text style={styles.oauthText}>Continue with Apple</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.divider}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>or</Text>
          <View style={styles.dividerLine} />
        </View>

        <View style={styles.form}>
          <Input
            label="Full Name"
            placeholder="Your name"
            value={name}
            onChangeText={setName}
            autoCapitalize="words"
          />
          <Input
            label="Email"
            placeholder="you@example.com"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <Input
            label="Password"
            placeholder="••••••••"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
          <Input
            label="Confirm Password"
            placeholder="••••••••"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
          />

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <Button
            title={isLoading ? "Creating account..." : "Create Account"}
            onPress={handleSignUp}
            disabled={isLoading}
            loading={isLoading}
          />
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Already have an account? </Text>
          <TouchableOpacity onPress={() => router.push("/(auth)/signin")}>
            <Text style={styles.footerLink}>Sign In</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primary,
  },
  content: {
    flexGrow: 1,
    padding: spacing.lg,
    justifyContent: "center",
  },
  header: {
    alignItems: "center",
    marginBottom: spacing.xl,
  },
  logo: {
    fontFamily: "Cormorant-Bold",
    fontSize: fontSizes.xxxl,
    color: colors.secondary,
    letterSpacing: 4,
    marginBottom: spacing.lg,
  },
  title: {
    fontFamily: "Cormorant-SemiBold",
    fontSize: fontSizes.xxl,
    color: colors.secondary,
  },
  subtitle: {
    fontFamily: "DMSans-Regular",
    fontSize: fontSizes.md,
    color: colors.muted,
    marginTop: spacing.xs,
  },
  oauthButtons: {
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  oauthButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.primaryLight,
    borderRadius: 8,
    padding: spacing.md,
  },
  oauthText: {
    fontFamily: "DMSans-Medium",
    fontSize: fontSizes.md,
    color: colors.secondary,
  },
  divider: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.lg,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.primaryLight,
  },
  dividerText: {
    fontFamily: "DMSans-Regular",
    fontSize: fontSizes.sm,
    color: colors.muted,
    marginHorizontal: spacing.md,
  },
  form: {
    marginBottom: spacing.lg,
  },
  error: {
    fontFamily: "DMSans-Regular",
    fontSize: fontSizes.sm,
    color: colors.error,
    marginBottom: spacing.md,
    textAlign: "center",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
  },
  footerText: {
    fontFamily: "DMSans-Regular",
    fontSize: fontSizes.sm,
    color: colors.muted,
  },
  footerLink: {
    fontFamily: "DMSans-SemiBold",
    fontSize: fontSizes.sm,
    color: colors.accent,
  },
});
