"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { signOut } from "@/lib/logout";
import StepIndicator from "../components/Stepindicator";
import ProfileStep from "../components/Profilestep";
import PaymentStep from "../components/Payementstep";
import SuccessStep from "../components/Successstep";

export type ProfileData = {
  photo: File | null;
  name: string;
  about: string;
  socialUrl: string;
};

export type PaymentData = {
  country: string;
  firstName: string;
  lastName: string;
  cardNumber: string;
  month: string;
  year: string;
  cvc: string;
};

const STEPS = ["Profile", "Payment info", "Finish"];

export default function MePage() {
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);
  const [logoutError, setLogoutError] = useState("");
  const [currentStep, setCurrentStep] = useState(1);
  const [profileData, setProfileData] = useState<ProfileData>({
    photo: null,
    name: "",
    about: "",
    socialUrl: "",
  });
  const [paymentData, setPaymentData] = useState<PaymentData>({
    country: "",
    firstName: "",
    lastName: "",
    cardNumber: "",
    month: "",
    year: "",
    cvc: "",
  });

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
    }
  }, [router]);

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2 font-medium text-gray-800">
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M9 12h.01M12 12h.01M15 12h.01M21 12c0 4.418-4.03 8-9 8a9.86 9.86 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
            />
          </svg>
          Buy Me Coffee
        </div>
        <div className="flex items-center gap-3">
          {logoutError && (
            <p role="alert" className="text-sm text-red-600">
              {logoutError}
            </p>
          )}
          <button
            type="button"
            disabled={loggingOut}
            onClick={async () => {
              setLoggingOut(true);
              setLogoutError("");
              try {
                await signOut();
              } catch (error) {
                setLogoutError(
                  error instanceof Error ? error.message : "Could not log out.",
                );
                setLoggingOut(false);
              }
            }}
            className="text-sm text-gray-500 hover:text-gray-700 border border-gray-200 rounded-lg px-3 py-1.5 transition-colors disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loggingOut ? "Гарч байна…" : "Гарах"}
          </button>
        </div>
      </nav>

      <div className="max-w-lg mx-auto px-4 py-10">
        <StepIndicator steps={STEPS} currentStep={currentStep} />

        <div className="mt-8">
          {currentStep === 1 && (
            <ProfileStep
              data={profileData}
              onChange={setProfileData}
              onNext={() => setCurrentStep(2)}
            />
          )}
          {currentStep === 2 && (
            <PaymentStep
              data={paymentData}
              onChange={setPaymentData}
              onBack={() => setCurrentStep(1)}
              onNext={() => setCurrentStep(3)}
            />
          )}
          {currentStep === 3 && (
            <SuccessStep onFinish={() => router.push("/home-dashboard")} />
          )}
        </div>
      </div>
    </div>
  );
}
