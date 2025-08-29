"use client"

import Image from "next/image"
import Link from "next/link"
import React from "react"
import { motion } from "framer-motion"

const features = [
  {
    id: 1,
    name: "AI Thumbnails Generator",
    image: "/Feature1.png",
    path: "/ai-thumbnail-generator",
  },
  {
    id: 2,
    name: "AI Thumbnails Search",
    image: "/Feature2.png",
    path: "/thumbnail-search",
  },
  {
    id: 3,
    name: "AI Content Generator",
    image: "/Feature3.png",
    path: "/ai-content-generator",
  },
  {
    id: 4,
    name: "Outliers",
    image: "/Feature4.png",
    path: "/outlier",
  },
  {
    id: 5,
    name: "Optimize Video",
    image: "/Feature5.png",
    path: "#",
  },
  {
    id: 6,
    name: "Trending Keywords",
    image: "/Feature6.jpeg",
    path: "/trending-keywords",
  },
]

function FeatureList() {
  return (
    <div className="mt-7">
      <motion.h2
        className="font-bold text-2xl mb-5"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        AI Tools
      </motion.h2>

      <motion.div
        className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
        initial="hidden"
        animate="show"
        variants={{
          hidden: {},
          show: {
            transition: {
              staggerChildren: 0.15, // delay between items
            },
          },
        }}
      >
        {features.map((feature) => (
          <motion.div
            key={feature.id}
            variants={{
              hidden: { opacity: 0, y: 30 },
              show: { opacity: 1, y: 0 },
            }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            <Link
              href={feature.path}
              className="group relative rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition"
            >
              <div className="relative w-full h-[150px] overflow-hidden">
                {/* background image */}
                <Image
                  src={feature.image}
                  width={400}
                  height={250}
                  alt={feature.name}
                  className="w-full h-full object-cover transform transition-transform duration-300 group-hover:scale-105 group-hover:rotate-2"
                />

                {/* gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent transform transition-transform duration-300 group-hover:scale-105" />

                {/* hover gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-r from-orange-500 via-blue-500 to-black opacity-0 transform transition-all duration-500 group-hover:opacity-100 group-hover:scale-105" />
              </div>

              {/* feature name */}
              <div className="absolute bottom-3 left-3">
                <h3 className="text-white font-semibold text-sm md:text-base">
                  {feature.name}
                </h3>
              </div>
            </Link>

          </motion.div>
        ))}
      </motion.div>
    </div>
  )
}

export default FeatureList
