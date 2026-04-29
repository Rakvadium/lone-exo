"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShoppingBag, User, Menu, Search, Heart, LogIn } from "lucide-react";
import { useQuery } from "convex/react";
import { useConvexAuth } from "convex/react";
import { api } from "@convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

const navigation = [
  { name: "New Arrivals", href: "/products?category=new-arrivals" },
  { name: "Women", href: "/products?category=women" },
  { name: "Men", href: "/products?category=men" },
  { name: "Accessories", href: "/products?category=accessories" },
];

export function Header() {
  const pathname = usePathname();
  const { isAuthenticated, isLoading } = useConvexAuth();
  const cart = useQuery(api.cart.get);
  const cartCount = cart?.items?.length ?? 0;

  return (
    <TooltipProvider delayDuration={300}>
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <Sheet>
            <SheetTrigger asChild className="lg:hidden">
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-80">
              <nav className="flex flex-col gap-4 mt-8">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className="text-lg font-medium hover:text-rosegold transition-colors"
                  >
                    {item.name}
                  </Link>
                ))}
                <div className="border-t pt-4 mt-4">
                  {isAuthenticated ? (
                    <Link
                      href="/profile"
                      className="text-lg font-medium hover:text-rosegold transition-colors"
                    >
                      My Account
                    </Link>
                  ) : (
                    <Link
                      href="/auth/signin"
                      className="text-lg font-medium hover:text-rosegold transition-colors"
                    >
                      Sign In
                    </Link>
                  )}
                </div>
              </nav>
            </SheetContent>
          </Sheet>

          <Link href="/" className="flex items-center gap-2 group">
            <span className="font-heading text-2xl font-bold tracking-[0.2em]">
              <span className="text-foreground group-hover:text-rosegold/80 transition-colors">LONE</span>
              <span className="text-rosegold ml-1">EXO</span>
            </span>
          </Link>

          <nav className="hidden lg:flex items-center gap-8">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "text-sm font-medium transition-colors hover:text-rosegold",
                  pathname === item.href
                    ? "text-rosegold"
                    : "text-muted-foreground"
                )}
              >
                {item.name}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" asChild>
                  <Link href="/products">
                    <Search className="h-5 w-5" />
                    <span className="sr-only">Search</span>
                  </Link>
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                <p>Search</p>
              </TooltipContent>
            </Tooltip>

            {isAuthenticated && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" asChild>
                    <Link href="/wishlist">
                      <Heart className="h-5 w-5" />
                      <span className="sr-only">Favorites</span>
                    </Link>
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom">
                  <p>Favorites</p>
                </TooltipContent>
              </Tooltip>
            )}

            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="relative" asChild>
                  <Link href="/cart">
                    <ShoppingBag className="h-5 w-5" />
                    {cartCount > 0 && (
                      <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-rosegold text-[10px] font-bold text-white flex items-center justify-center">
                        {cartCount}
                      </span>
                    )}
                    <span className="sr-only">Shopping Cart</span>
                  </Link>
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                <p>Shopping Cart</p>
              </TooltipContent>
            </Tooltip>

            {isLoading ? (
              <Button variant="ghost" size="icon" disabled>
                <User className="h-5 w-5 animate-pulse" />
              </Button>
            ) : isAuthenticated ? (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" asChild className="relative">
                    <Link href="/profile">
                      <User className="h-5 w-5" />
                      <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-green-500" />
                      <span className="sr-only">My Account</span>
                    </Link>
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom">
                  <p>My Account</p>
                </TooltipContent>
              </Tooltip>
            ) : (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" asChild>
                    <Link href="/auth/signin">
                      <User className="h-5 w-5" />
                      <span className="sr-only">Sign In / Sign Up</span>
                    </Link>
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom">
                  <p>Sign In / Sign Up</p>
                </TooltipContent>
              </Tooltip>
            )}
          </div>
        </div>
      </header>
    </TooltipProvider>
  );
}
