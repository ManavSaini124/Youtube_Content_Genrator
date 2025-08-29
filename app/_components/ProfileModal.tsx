"use client";

import { useUser, SignOutButton } from "@clerk/nextjs";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogTrigger, DialogTitle, DialogDescription } from "@/components/ui/dialog"; // Import the new Dialog
import { Button } from "@/components/ui/button";

export default function ProfileModal() {
  const { user, isLoaded } = useUser();

  if (!isLoaded || !user) {
    return null; // Don't render if not loaded or no user
  }

  return (
    <Dialog>
      {/* Trigger: Clickable avatar in header/sidebar */}
      <DialogTrigger asChild>
        <Avatar className="cursor-pointer w-10 h-10">
          <AvatarImage src={user.imageUrl} alt={user.fullName || "User"} />
          <AvatarFallback>{user.firstName?.charAt(0).toUpperCase()}</AvatarFallback>
        </Avatar>
      </DialogTrigger>

      {/* Modal Content */}
      <DialogContent className="sm:max-w-md p-0 border-none">
        <Card className="w-full rounded-2xl shadow-xl border border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-900/80 backdrop-blur">
          {/* Header */}
          <CardHeader className="flex flex-col items-center space-y-4">
            <Avatar className="w-24 h-24 border-4 border-white shadow-lg">
              <AvatarImage src={user.imageUrl} alt={user.fullName || "User"} />
              <AvatarFallback className="text-xl">
                {user.firstName?.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>

            <div className="text-center">
              <DialogTitle className="text-2xl font-semibold">{user.fullName}</DialogTitle>
              <DialogDescription className="text-sm text-muted-foreground">
                {user.primaryEmailAddress?.emailAddress}
              </DialogDescription>
            </div>
          </CardHeader>

          {/* Content */}
          <CardContent className="mt-6 space-y-4">
            <div className="flex justify-center">
              <SignOutButton>
                <Button variant="destructive">Sign Out</Button>
              </SignOutButton>
            </div>
          </CardContent>
        </Card>
      </DialogContent>
    </Dialog>
  );
}