"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { X, ShoppingBag, Sparkles, Loader2, DollarSign, MapPin, Tag } from "lucide-react";
import type { ListingCategory, ItemCondition } from "@/types";

interface CreateListingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CreateListingModal({ isOpen, onClose }: CreateListingModalProps) {
  const queryClient = useQueryClient();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState<ListingCategory>("ELECTRONICS");
  const [condition, setCondition] = useState<ItemCondition>("USED_LIKE_NEW");
  const [imageUrl, setImageUrl] = useState("");
  const [location, setLocation] = useState("College Park, MD");

  const categories: { label: string; value: ListingCategory }[] = [
    { label: "Tech & Gear", value: "ELECTRONICS" },
    { label: "Vehicles & Transport", value: "VEHICLES" },
    { label: "Housing & Furniture", value: "HOUSING" },
    { label: "Fashion & Apparel", value: "CLOTHING" },
    { label: "Books & Courseware", value: "BOOKS" },
    { label: "Services & Freelance", value: "SERVICES" },
    { label: "Tickets & Events", value: "TICKETS" },
  ];

  const conditions: { label: string; value: ItemCondition }[] = [
    { label: "Brand New (Sealed)", value: "NEW" },
    { label: "Used — Like New / Flawless", value: "USED_LIKE_NEW" },
    { label: "Used — Good Condition", value: "USED_GOOD" },
    { label: "Used — Fair / Minor Wear", value: "USED_FAIR" },
  ];

  const mutation = useMutation({
    mutationFn: async (payload: any) => {
      const res = await fetch("/api/bazaar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      return json.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bazaar"] });
      handleClose();
    },
  });

  const handleClose = () => {
    setTitle("");
    setDescription("");
    setPrice("");
    setImageUrl("");
    onClose();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !price) return;

    mutation.mutate({
      title: title.trim(),
      description: description.trim() || undefined,
      price: parseFloat(price),
      category,
      condition,
      location,
      images: [
        imageUrl ||
          "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600&auto=format&fit=crop&q=80",
      ],
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={handleClose} />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-md bg-[#111827] border border-[#1e2a3a] rounded-3xl overflow-hidden shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#1e2a3a]">
          <button onClick={handleClose} className="text-[#6b7280] hover:text-[#f9fafb] transition-colors">
            <X size={20} />
          </button>
          <div className="flex items-center gap-1.5 font-semibold text-sm text-[#f9fafb]">
            <Sparkles size={16} className="text-amber-400" />
            List an Item on Bazaar
          </div>
          <div className="w-5" />
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-[#9ca3af] mb-1">
              Item Title *
            </label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Apple MacBook Pro 14 M3 Pro Space Black"
              required
              className="w-full h-10 px-3.5 rounded-xl border border-[#1e2a3a] bg-[#161924] text-white text-xs placeholder:text-[#64748b] focus:outline-none focus:border-amber-400"
            />
          </div>

          {/* Price (USD) */}
          <div>
            <label className="block text-xs font-semibold text-[#9ca3af] mb-1">
              Price (USD $) *
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-amber-400 font-black text-sm">$</span>
              <input
                type="number"
                step="0.01"
                min="1"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="450.00"
                required
                className="w-full h-10 pl-8 pr-3.5 rounded-xl border border-[#1e2a3a] bg-[#161924] text-white text-xs placeholder:text-[#64748b] focus:outline-none focus:border-amber-400 font-bold"
              />
            </div>
          </div>

          {/* Category */}
          <div>
            <label className="block text-xs font-semibold text-[#9ca3af] mb-1">
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as ListingCategory)}
              className="w-full h-10 px-3.5 rounded-xl border border-[#1e2a3a] bg-[#161924] text-white text-xs focus:outline-none focus:border-amber-400"
            >
              {categories.map((c) => (
                <option key={c.value} value={c.value} className="bg-[#111827]">
                  {c.label}
                </option>
              ))}
            </select>
          </div>

          {/* Condition */}
          <div>
            <label className="block text-xs font-semibold text-[#9ca3af] mb-1">
              Condition
            </label>
            <select
              value={condition}
              onChange={(e) => setCondition(e.target.value as ItemCondition)}
              className="w-full h-10 px-3.5 rounded-xl border border-[#1e2a3a] bg-[#161924] text-white text-xs focus:outline-none focus:border-amber-400"
            >
              {conditions.map((c) => (
                <option key={c.value} value={c.value} className="bg-[#111827]">
                  {c.label}
                </option>
              ))}
            </select>
          </div>

          {/* Image URL */}
          <div>
            <label className="block text-xs font-semibold text-[#9ca3af] mb-1">
              Photo URL
            </label>
            <input
              type="url"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://images.unsplash.com/..."
              className="w-full h-10 px-3.5 rounded-xl border border-[#1e2a3a] bg-[#161924] text-white text-xs placeholder:text-[#64748b] focus:outline-none focus:border-amber-400"
            />
          </div>

          {/* Location */}
          <div>
            <label className="block text-xs font-semibold text-[#9ca3af] mb-1">
              Meetup / Campus Location
            </label>
            <input
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. College Park, MD (Stamp Student Union)"
              className="w-full h-10 px-3.5 rounded-xl border border-[#1e2a3a] bg-[#161924] text-white text-xs placeholder:text-[#64748b] focus:outline-none focus:border-amber-400"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-[#9ca3af] mb-1">
              Description & Specifications
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Included accessories, battery health, warranty status, receipt..."
              rows={3}
              className="w-full p-3 rounded-xl border border-[#1e2a3a] bg-[#161924] text-white text-xs placeholder:text-[#64748b] focus:outline-none focus:border-amber-400 resize-none"
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={!title.trim() || !price || mutation.isPending}
            className="w-full h-10 mt-2 rounded-xl bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 text-black font-black text-xs flex items-center justify-center gap-1.5 disabled:opacity-40 hover:scale-[1.01] transition-transform shadow-[0_0_15px_rgba(251,191,36,0.3)]"
          >
            {mutation.isPending ? (
              <Loader2 size={15} className="animate-spin text-black" />
            ) : (
              "Publish Listing (0% Fees)"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
