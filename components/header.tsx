"use client"

import { motion } from "framer-motion"
import Image from "next/image"
import Link from "next/link"
import ProfileAvatar from "./auth/profile-avatar"

interface HeaderProps {
  title: string
  isProfile?: boolean
}

const Header = ({ title, isProfile }: HeaderProps) => {
  const showProfile = isProfile ?? true;

  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="sticky top-0 z-30 h-14 sm:h-16 flex items-center justify-between bg-background/80 backdrop-blur-md text-foreground px-4 sm:px-6 border-b border-border shadow-sm"
    >
      <div className="w-1/4 sm:w-1/3 flex items-center gap-2">
        <Link href="/" className="lg:hidden">
          <div className="h-9 w-9 shrink-0 flex items-center justify-center relative rounded-xl bg-accent/10 border border-border/50">
            <Image src="/images/logo/light_logo.png" alt="Logo" width={22} height={22} className="dark:hidden" />
            <Image src="/images/logo/dark_logo.png" alt="Logo" width={22} height={22} className="hidden dark:block" />
          </div>
        </Link>
      </div>

      <div className="flex-1 flex justify-center overflow-hidden">
        <h1 className="text-xl font-black tracking-normal sm:text-2xl lg:text-3xl bg-linear-to-br from-foreground to-primary/80 bg-clip-text text-transparent">
          {title}
        </h1>
      </div>

      <div className="w-1/4 sm:w-1/3 flex justify-end items-center gap-2">
        {showProfile && (
          <ProfileAvatar />
        )}
      </div>
    </motion.header>
  )
}

export { Header }

