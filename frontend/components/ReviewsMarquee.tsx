"use client"

import { cn } from "@/lib/utils"
import { Marquee } from "@/components/ui/marquee"
import { ShieldCheck, Quote } from "lucide-react"

const reviews = [
  {
    name: "Sarah Chen",
    username: "Growth Lead @SaaSFlow",
    body: "Loomin AI feels like having a content strategist running 24/7. It spots trends before our team even notices them.",
    img: "https://avatar.vercel.sh/sarah",
  },
  {
    name: "David Kumar",
    username: "Founder @LaunchLabs",
    body: "The voice matching is insane. The posts it drafts sound exactly like how I write on LinkedIn.",
    img: "https://avatar.vercel.sh/david",
  },
  {
  name: "Emily Rodriguez",
  username: "Content Director @BrandScale",
  body: "The biggest win for us is the optimization loop. It doesn’t just generate content — it improves it after publishing.",
  img: "https://avatar.vercel.sh/emily",
},
  {
    name: "Alex Turner",
    username: "Indie Hacker",
    body: "I scheduled an entire week of posts in 5 minutes. The AI picked the timing and hooks automatically.",
    img: "https://avatar.vercel.sh/alex",
  },
  {
    name: "Michael Park",
    username: "Marketing @CloudForge",
    body: "The sentiment monitoring is wild. Loomin AI suggested edits to posts that were getting negative comments.",
    img: "https://avatar.vercel.sh/michael",
  },
  {
    name: "Priya Nair",
    username: "Startup Advisor",
    body: "This feels less like a tool and more like a marketing co-pilot.",
    img: "https://avatar.vercel.sh/priya",
  },
]

const firstRow = reviews.slice(0, reviews.length / 2)
const secondRow = reviews.slice(reviews.length / 2)

const ReviewCard = ({
  img,
  name,
  username,
  body,
}: {
  img: string
  name: string
  username: string
  body: string
}) => {
  return (
    <figure
      className={cn(
        "relative w-80 cursor-pointer overflow-hidden rounded-[2rem] border p-6 transition-all duration-500",
        "border-white/5 bg-white/[0.02] hover:border-sky-500/30 hover:bg-white/[0.04] group"
      )}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="relative">
            <img
              className="rounded-xl grayscale group-hover:grayscale-0 transition-all duration-500 border border-white/10"
              width="40"
              height="40"
              alt=""
              src={img}
            />
            <div className="absolute -bottom-1 -right-1 rounded-full bg-[#050505] p-0.5">
               <ShieldCheck size={12} className="text-sky-500" />
            </div>
          </div>
          <div className="flex flex-col">
            <figcaption className="text-sm font-bold tracking-tight text-white">
              {name}
            </figcaption>
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">{username}</p>
          </div>
        </div>
        <Quote size={16} className="text-gray-800 group-hover:text-sky-500/20 transition-colors" />
      </div>

      <blockquote className="text-xs leading-relaxed text-gray-400 group-hover:text-gray-300 transition-colors">
        "{body}"
      </blockquote>

      
      <div className="mt-4 flex items-center gap-2 opacity-20 group-hover:opacity-40 transition-opacity">
        <div className="h-[1px] flex-1 bg-white/20" />
        <span className="text-[8px] font-black uppercase tracking-[0.3em] text-white">Verified Transmission</span>
      </div>
    </figure>
  )
}

export function ReviewsMarquee() {
  return (
    <section className="relative mx-auto mt-32 w-full max-w-7xl px-6">
      
      
      <div className="pointer-events-none absolute left-1/2 top-0 h-52 w-52 -translate-x-1/2 bg-sky-500/4 blur-[90px]" />

      <div className="mb-16 text-center relative z-10">
        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-sky-500">
          Neural Proof
        </p>

        <h2 className="mt-4 text-4xl font-serif font-light tracking-tight text-white">
          Network <span className="text-gray-500">Feedback.</span>
        </h2>
      </div>

      <div className="relative flex w-full flex-col items-center justify-center overflow-hidden py-10">
        <Marquee pauseOnHover className="[--duration:35s] gap-6">
          {firstRow.map((review) => (
            <ReviewCard key={review.username} {...review} />
          ))}
        </Marquee>

        <Marquee reverse pauseOnHover className="[--duration:35s] gap-6 mt-6">
          {secondRow.map((review) => (
            <ReviewCard key={review.username} {...review} />
          ))}
        </Marquee>

        
        <div className="pointer-events-none absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-[#050505] via-[#050505]/80 to-transparent z-20" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-1/3 bg-gradient-to-l from-[#050505] via-[#050505]/80 to-transparent z-20" />
      </div>
    </section>
  )
}

