"use client";
import { useState } from "react";
import { MessageCircle, X, Phone, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  schoolName: string;
  phone?: string | null;
  email?: string | null;
}

export default function ContactModal({ schoolName, phone, email }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button variant="green" onClick={() => setOpen(true)}>
        <MessageCircle className="mr-2 h-4 w-4" />
        Холбоо барих
      </Button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setOpen(false)} />
          <div className="relative w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
            <button
              onClick={() => setOpen(false)}
              className="absolute right-4 top-4 text-gray-400 hover:text-gray-600"
            >
              <X className="h-5 w-5" />
            </button>

            <h3 className="text-lg font-bold text-[#1a3a5c]">{schoolName}</h3>
            <p className="mt-1 text-sm text-gray-500">Холбоо барих мэдээлэл</p>

            <div className="mt-4 space-y-3">
              {phone && (
                <a
                  href={`tel:${phone}`}
                  className="flex items-center gap-3 rounded-lg bg-blue-50 px-4 py-3 font-medium text-blue-700 hover:bg-blue-100 transition-colors"
                >
                  <Phone className="h-5 w-5" />
                  {phone}
                </a>
              )}
              {email && (
                <a
                  href={`mailto:${email}`}
                  className="flex items-center gap-3 rounded-lg bg-green-50 px-4 py-3 font-medium text-green-700 hover:bg-green-100 transition-colors"
                >
                  <Mail className="h-5 w-5" />
                  {email}
                </a>
              )}
              {!phone && !email && (
                <p className="text-center text-sm text-gray-500 py-4">
                  Холбоо барих мэдээлэл байхгүй байна
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
