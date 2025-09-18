"use client"
import { Github } from "@medusajs/icons"
import { Button, Heading } from "@medusajs/ui"

const Hero = () => {
  return (
    <div className=" w-full border-b border-ui-border-base relative bg-ui-bg-subtle flex flex-col md:flex-row items-center justify-center">
      {/* Image Section with Heading overlay */}
      <div className="relative md:w-1/2 flex items-center justify-center p-4 md:p-8">
        <img
          src="/cyber-monday-retail-sales.jpg"
          alt="Shopping cart with boxes"
          className="w-full h-auto max-h-[250px] md:max-h-[400px] object-contain rounded-lg shadow-lg"
        />
        <Heading
          level="h1"
          className="absolute left-6 top-6 md:left-12 md:top-12 text-2xl md:text-5xl text-ui-fg-base font-bold animate-fade"
          style={{ maxWidth: "60%", pointerEvents: "none" }}
        >
          Welcome to my Shop
        </Heading>
      </div>
      {/* Fade animation styles */}
      <style jsx global>{`
        @keyframes fadeinout {
          0% { opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { opacity: 0; }
        }
        .animate-fade {
          animation: fadeinout 3s ease-in-out;
        }
      `}</style>
    </div>
  )
}

export default Hero
