"use client";

import Link from "next/link";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { XCircle, ShoppingBag, ArrowLeft } from "lucide-react";

export default function CheckoutCancelPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 flex items-center justify-center py-12">
        <div className="container max-w-lg">
          <Card className="text-center">
            <CardContent className="pt-12 pb-8 px-8">
              <div className="mb-6">
                <XCircle className="h-16 w-16 text-muted-foreground mx-auto" />
              </div>

              <h1 className="font-heading text-3xl font-bold mb-4">
                Payment Cancelled
              </h1>

              <p className="text-muted-foreground mb-8">
                Your payment was cancelled. Don&apos;t worry, your cart items
                are still saved.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button variant="shimmer" asChild>
                  <Link href="/cart">
                    <ShoppingBag className="mr-2 h-4 w-4" />
                    Return to Cart
                  </Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link href="/">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Home
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
}
