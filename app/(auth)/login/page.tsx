"use client";
import { TextField } from "@/app/components/TextField";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailErr, setEmailErr] = useState("");
  const [passwordErr, setPasswordErr] = useState("");
  const [apiErr, setApiErr] = useState("");
  const [loading, setLoading] = useState(false);

  const isEmailValid = (value: string) => {
    if (value === "") return "Email cannot be empty...";
    if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(value))
      return "Please enter a valid email address.";
    return "";
  };

  const isPasswordValid = (value: string) => {
    if (value === "") return "Password cannot be empty";
    return "";
  };

  const canLogin =
    isEmailValid(email) === "" && isPasswordValid(password) === "";

  const handleLoginSubmit = async () => {
    const emailValidationErr = isEmailValid(email);
    const passwordValidationErr = isPasswordValid(password);

    setEmailErr(emailValidationErr);
    setPasswordErr(passwordValidationErr);
    setApiErr("");

    if (emailValidationErr !== "" || passwordValidationErr !== "") return;

    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setApiErr(data.error || "Login failed");
        return;
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      // Profile бөглөсөн эсэхийг шалгах
      const profileRes = await fetch("/api/profile", {
        headers: { Authorization: `Bearer ${data.token}` },
      });
      const profile = await profileRes.json();

      // name хоосон бол profile бөглөөгүй гэж үзнэ
      if (!profile?.name || profile.name.trim() === "") {
        router.push("/me");
      } else {
        router.push("/home-dashboard");
      }
    } catch {
      setApiErr("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen">
      <div className="w-1/2 bg-[#FBBF24] flex flex-col">
        <div className="flex items-center gap-2 px-6 py-5">
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#09090B"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M17 8h1a4 4 0 0 1 0 8h-1" />
            <path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4Z" />
            <line x1="6" y1="2" x2="6" y2="4" />
            <line x1="10" y1="2" x2="10" y2="4" />
            <line x1="14" y1="2" x2="14" y2="4" />
          </svg>
          <span className="text-sm font-semibold text-[#09090B]">
            Buy Me a Coffee
          </span>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center pb-16 px-8">
          <div className="w-52 h-52 rounded-full bg-[#D97706] bg-opacity-50 flex items-center justify-center mb-8">
            <svg
              width="240"
              height="240"
              viewBox="0 0 240 240"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <mask
                id="mask0_1_4181"
                style={{ maskType: "alpha" }}
                maskUnits="userSpaceOnUse"
                x="0"
                y="0"
                width="240"
                height="240"
              >
                <circle cx="120" cy="120" r="120" fill="white" />
              </mask>
              <g mask="url(#mask0_1_4181)">
                <circle
                  opacity="0.5"
                  cx="120"
                  cy="120"
                  r="120"
                  fill="#D97706"
                />
                <path
                  d="M60.5874 116.025C61.0468 113.78 62.7354 111.987 64.9492 111.394L147.341 89.3173C149.554 88.7241 151.913 89.4326 153.434 91.1473L164.418 103.534L57.2684 132.244L60.5874 116.025Z"
                  fill="white"
                />
                <path
                  d="M51.4952 137.967C50.9186 135.815 52.1956 133.603 54.3475 133.026L167.341 102.75C169.493 102.173 171.705 103.45 172.282 105.602L175.414 117.291C175.99 119.443 174.713 121.655 172.561 122.231L59.5676 152.508C57.4157 153.085 55.2039 151.808 54.6273 149.656L51.4952 137.967Z"
                  fill="white"
                />
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M160.868 125.363L71.2489 149.376L111.463 250.311L176.508 232.882L160.868 125.363ZM69.1609 141.584C64.4955 142.834 61.9666 147.875 63.7543 152.362L103.969 253.297C105.483 257.097 109.601 259.162 113.551 258.104L178.596 240.675C182.547 239.616 185.081 235.769 184.492 231.721L168.851 124.202C168.156 119.422 163.445 116.32 158.78 117.57L69.1609 141.584Z"
                  fill="white"
                />
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M92.6942 63.729C94.0467 65.4993 93.708 68.0308 91.9378 69.3833C91.4237 69.7761 90.5331 70.9778 90.4165 72.1914C90.3693 72.683 90.4432 73.1937 90.7755 73.7669C91.1268 74.3727 91.8929 75.259 93.5683 76.2263C96.0561 77.6627 97.7799 79.5386 98.7115 81.7491C99.6275 83.9227 99.6231 86.0516 99.314 87.7699C99.0081 89.4694 98.3833 90.9015 97.8753 91.8688C97.6152 92.3639 97.3696 92.7678 97.1808 93.0591C97.086 93.2055 97.0042 93.3253 96.9406 93.4162C96.9087 93.4616 96.8812 93.5 96.8588 93.5309L96.829 93.5717L96.817 93.5879L96.8117 93.5949L96.8093 93.5982C96.8081 93.5997 96.807 93.6013 93.5788 91.1826L96.807 93.6013C95.4712 95.3842 92.943 95.7466 91.1601 94.4108C89.3861 93.0817 89.0184 90.5721 90.3306 88.7908C90.3316 88.7894 90.3328 88.7877 90.3343 88.7855C90.3459 88.769 90.3725 88.7303 90.4104 88.6719C90.487 88.5536 90.6041 88.3628 90.7329 88.1175C91.0026 87.604 91.2603 86.9726 91.3739 86.3412C91.4841 85.7285 91.436 85.2591 91.2772 84.8823C91.1339 84.5423 90.7517 83.9158 89.5344 83.2129C86.9456 81.7182 85.0149 79.9152 83.7963 77.8136C82.5587 75.6791 82.1896 73.4639 82.3859 71.4201C82.7563 67.5629 85.0986 64.4558 87.04 62.9726C88.8102 61.6201 91.3417 61.9588 92.6942 63.729Z"
                  fill="white"
                />
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M108.081 48.1314C109.433 49.9016 109.095 52.4331 107.324 53.7856C106.81 54.1784 105.92 55.3801 105.803 56.5937C105.756 57.0854 105.83 57.5961 106.162 58.1692C106.514 58.7751 107.28 59.6613 108.955 60.6286C111.443 62.065 113.167 63.941 114.098 66.1514C115.014 68.325 115.01 70.4539 114.701 72.1722C114.395 73.8718 113.77 75.3039 113.262 76.2711C113.002 76.7662 112.756 77.1701 112.568 77.4615C112.473 77.6078 112.391 77.7277 112.327 77.8185C112.295 77.864 112.268 77.9023 112.246 77.9332L112.216 77.9741L112.204 77.9903L112.198 77.9973L112.196 78.0005C112.195 78.0021 112.194 78.0036 108.966 75.5849L112.194 78.0036C110.858 79.7865 108.33 80.1489 106.547 78.8131C104.773 77.484 104.405 74.9744 105.717 73.1931C105.718 73.1918 105.72 73.19 105.721 73.1879C105.733 73.1713 105.759 73.1327 105.797 73.0742C105.874 72.956 105.991 72.7651 106.12 72.5199C106.389 72.0063 106.647 71.3749 106.761 70.7435C106.871 70.1309 106.823 69.6615 106.664 69.2846C106.521 68.9447 106.138 68.3181 104.921 67.6153C102.332 66.1206 100.402 64.3176 99.183 62.2159C97.9454 60.0815 97.5763 57.8662 97.7726 55.8225C98.1431 51.9653 100.485 48.8581 102.427 47.3749C104.197 46.0224 106.728 46.3611 108.081 48.1314Z"
                  fill="white"
                />
              </g>
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-[#09090B] text-center mb-3">
            Fund your creative work
          </h1>
          <p className="text-sm text-[#78350F] text-center leading-relaxed max-w-60">
            Accept support. Start a membership. Setup a shop. Its easier than
            you think.
          </p>
        </div>
      </div>

      <div className="w-1/2 bg-white flex flex-col">
        <div className="flex justify-end px-6 py-5">
          <Link href="/register">
            <button className="text-sm text-[#374151] border border-[#D1D5DB] rounded-md px-4 py-1.5 hover:bg-gray-50 hover:font-bold transition-all duration-200">
              Sign up
            </button>
          </Link>
        </div>

        <div className="flex-1 flex items-center justify-center px-8">
          <div className="w-full max-w-[320px]">
            <h2 className="text-xl font-semibold text-[#111827] mb-6 text-left">
              Welcome back
            </h2>

            <div className="mb-3">
              <label className="block text-sm font-medium text-black mb-1.5">
                Email
              </label>
              <TextField
                value={email}
                onChange={(e) => {
                  const value = e.target.value;
                  setEmail(value);
                  setEmailErr(isEmailValid(value));
                }}
                error={emailErr !== ""}
                helperText={emailErr}
                placeholder="Enter email here"
                type="email"
              />
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-black mb-1.5">
                Password
              </label>
              <TextField
                value={password}
                onChange={(e) => {
                  const value = e.target.value;
                  setPassword(value);
                  setPasswordErr(isPasswordValid(value));
                }}
                error={passwordErr !== ""}
                helperText={passwordErr}
                placeholder="Enter password here"
                type="password"
              />
            </div>

            {apiErr && (
              <p className="text-sm text-red-500 mb-4 text-center">{apiErr}</p>
            )}

            <button
              onClick={handleLoginSubmit}
              disabled={loading || !canLogin}
              className={`w-full text-sm font-medium rounded-md py-2.5 transition-all duration-200 flex justify-center items-center ${
                loading || !canLogin
                  ? "bg-[#E5E7EB] text-[#9CA3AF] cursor-not-allowed"
                  : "bg-[#18181B] text-white cursor-pointer hover:bg-black hover:font-bold"
              }`}
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-gray-400 border-t-gray-800 rounded-full animate-spin"></div>
              ) : (
                "Continue"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
