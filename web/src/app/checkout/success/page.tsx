"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, Package, ArrowRight } from "lucide-react";

export default function CheckoutSuccessPage() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 flex items-center justify-center py-12">
        <div className="container max-w-lg">
          <Card className="text-center">
            <CardContent className="pt-12 pb-8 px-8">
              <div className="mb-6">
                <CheckCircle className="h-16 w-16 text-green-500 mx-auto" />
              </div>

              <h1 className="font-heading text-3xl font-bold mb-4">
                Order Confirmed!
              </h1>

              <p className="text-muted-foreground mb-6">
                Thank you for your purchase. We&apos;ve received your order and
                will begin processing it shortly.
              </p>

              {sessionId && (
                <p className="text-sm text-muted-foreground mb-8">
                  Confirmation ID:{" "}
                  <span className="font-mono text-xs">
                    {sessionId.slice(0, 20)}...
                  </span>
                </p>
              )}

              <div className="space-y-4">
                <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                  <Package className="h-4 w-4" />
                  <span>You&apos;ll receive an email confirmation shortly</span>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
                  <Button variant="shimmer" asChild>
                    <Link href="/profile">
                      View Order
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                  <Button variant="outline" asChild>
                    <Link href="/products">Continue Shopping</Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
}
