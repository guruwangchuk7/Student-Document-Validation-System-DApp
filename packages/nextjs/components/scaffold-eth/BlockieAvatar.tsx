"use client";

import { AvatarComponent } from "@rainbow-me/rainbowkit";

// Custom Avatar for RainbowKit
export const BlockieAvatar: AvatarComponent = ({ address, size }) => (
  // Don't want to use nextJS Image here (and adding remote patterns for the URL)

  <div className="rounded-full bg-gray-200" style={{ width: size, height: size }} aria-label={`${address} avatar`} />
);
