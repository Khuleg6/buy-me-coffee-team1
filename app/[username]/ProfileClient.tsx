"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import {
  type ProfileDetails,
  ProfileEditModal,
} from "@/app/components/ProfileEditModal";
import { DonationComplete } from "./components/DonationComplete";
import { CoverImageUploader } from "@/app/components/CoverImageUploader";
import { Avatar } from "./components/Avatar";
import { RecentSupporters } from "./components/RecentSupporters";
import { DonationForm } from "./components/DonationForm";
import { PaymentDialog } from "./components/paymentdialog";

type CreatorWithRelations = {
  id: number;
  username: string;
  Profile: {
    name: string;
    about: string;
    avatarImage: string;
    socialMediaURL: string;
    backgroundImage: string;
  };
  Donation_Donation_recipientIdToUser: {
    id: number;
    amount: number;
    specialMessage: string;
    socialURLOrBuyMeCoffee: string;
    createdAt: Date;
    User_Donation_donorIdToUser: {
      username: string;
      Profile: { name: string; avatarImage: string };
    } | null;
  }[];
};

type Supporter = {
  id: string;
  supporterName: string;
  supporterAvatarUrl: string | null;
  amount: number;
  specialMessage: string | null;
  createdAt: Date;
};

interface ProfileClientProps {
  creator: CreatorWithRelations;
  isOwner: boolean;
}

const getSupporterName = (url: string) => {
  try {
    const normalizedUrl = url.includes("://") ? url : `https://${url}`;
    const parsedUrl = new URL(normalizedUrl);
    const pathName = parsedUrl.pathname.split("/").filter(Boolean)[0];
    const name = pathName || parsedUrl.hostname.split(".")[0];
    return name
      .replace(/[-_]/g, " ")
      .replace(/\b\w/g, (letter) => letter.toUpperCase());
  } catch {
    return "Guest";
  }
};

export default function ProfileClient({
  creator,
  isOwner,
}: ProfileClientProps) {
  const [profile, setProfile] = useState<ProfileDetails>({
    name: creator.Profile.name,
    about: creator.Profile.about,
    socialUrl: creator.Profile.socialMediaURL,
    avatarUrl: creator.Profile.avatarImage,
  });
  const [isProfileEditorOpen, setIsProfileEditorOpen] = useState(false);
  const [done, setDone] = useState(false);
  const [pendingDonation, setPendingDonation] = useState<{
    url: string;
    amount: number;
    message: string;
  } | null>(null);

  const supporters: Supporter[] =
    creator.Donation_Donation_recipientIdToUser.map((d) => {
      const donorUser = d.User_Donation_donorIdToUser;
      const donorProfile = donorUser?.Profile;

      const resolvedName =
        donorProfile?.name ||
        donorUser?.username ||
        getSupporterName(d.socialURLOrBuyMeCoffee);

      return {
        id: d.id.toString(),
        supporterName: resolvedName,
        supporterAvatarUrl:
          donorProfile?.avatarImage && donorProfile.avatarImage.trim() !== ""
            ? donorProfile.avatarImage
            : null,
        amount: d.amount,
        specialMessage: d.specialMessage || null,
        createdAt: d.createdAt,
      };
    });

  const handleSupportTrigger = (
    amount: number,
    url: string,
    message: string,
  ) => {
    setPendingDonation({ url, amount, message });
  };

  if (done) {
    return (
      <DonationComplete
        creator={{ name: profile.name, avatarUrl: profile.avatarUrl }}
      />
    );
  }

  return (
    <main className="min-h-screen bg-[#FAFAFA] text-[#09090B]">
      <header className="h-16 border-b border-[#E4E4E7] bg-white">
        <div className="mx-auto flex h-full max-w-300 items-center justify-between px-6">
          <Link href="/home-dashboard">
            <div className="flex items-center gap-2">
              <Image
                src="/coffee.svg"
                alt="Coffee logo"
                width={24}
                height={24}
              />
              <p className="text-base font-semibold">Buy Me Coffee</p>
            </div>
          </Link>
        </div>
      </header>
      {isOwner ? (
        <CoverImageUploader initialCoverUrl={creator.Profile.backgroundImage} />
      ) : (
        <div
          className="h-80 w-full bg-[#F4F4F5] bg-cover bg-center"
          style={
            creator.Profile.backgroundImage
              ? { backgroundImage: `url(${creator.Profile.backgroundImage})` }
              : {}
          }
        />
      )}
      <section className="relative z-10 mx-auto -mt-20 grid max-w-270 grid-cols-1 gap-6 px-6 pb-16 lg:grid-cols-[1fr_520px]">
        <div className="space-y-6">
          <section className="rounded-md border border-[#E4E4E7] bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between gap-4 border-b border-[#E4E4E7] pb-6">
              <div className="flex items-center gap-3">
                <Avatar name={profile.name} url={profile.avatarUrl} size={48} />
                <p className="text-xl font-bold">{profile.name}</p>
              </div>

              {isOwner && (
                <button
                  type="button"
                  onClick={() => setIsProfileEditorOpen(true)}
                  className="rounded-md bg-[#F4F4F5] px-4 py-2 text-sm font-medium hover:bg-[#E4E4E7]"
                >
                  Edit page
                </button>
              )}
            </div>

            <section className="pt-6">
              <h2 className="text-base font-semibold">About {profile.name}</h2>
              <p className="mt-5 text-sm leading-5">{profile.about}</p>
            </section>
          </section>

          <section className="rounded-md border border-[#E4E4E7] bg-white p-6 shadow-sm">
            <h2 className="text-base font-semibold">Social media URL</h2>
            <p className="mt-5 text-sm">{profile.socialUrl}</p>
          </section>

          <RecentSupporters
            supporters={supporters}
            creatorName={profile.name}
          />
        </div>

        <DonationForm
          creatorName={profile.name}
          loading={false}
          disabled={isOwner}
          onSupport={handleSupportTrigger}
        />
      </section>
      {isOwner && isProfileEditorOpen && (
        <ProfileEditModal
          profile={profile}
          onClose={() => setIsProfileEditorOpen(false)}
          onSave={async (updatedProfile) => {
            try {
              const response = await fetch("/api/profile", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  name: updatedProfile.name,
                  about: updatedProfile.about,
                  socialMediaURL: updatedProfile.socialUrl,
                  avatarImage: updatedProfile.avatarUrl,
                  backgroundImage: creator.Profile.backgroundImage,
                }),
              });

              if (!response.ok) {
                const { error } = await response.json();
                throw new Error(error ?? "Failed to save profile");
              }

              const savedProfile = await response.json();
              setProfile({
                name: savedProfile.name,
                about: savedProfile.about,
                socialUrl: savedProfile.socialMediaURL,
                avatarUrl: savedProfile.avatarImage,
              });
              setIsProfileEditorOpen(false);
            } catch (err) {
              console.error(err);
            }
          }}
        />
      )}

      {pendingDonation && <PaymentDialog
        onClose={() => setPendingDonation(null)}
        amount={pendingDonation.amount}
        specialMessage={pendingDonation.message}
        socialURLOrBuyMeCoffee={pendingDonation.url}
        recipientId={creator.id}
        onConfirmQPay={() => {
          setPendingDonation(null);
          setDone(true);
        }}
      />}
    </main>
  );
}
