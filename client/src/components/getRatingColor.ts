export const getRatingColor = (rating: number): string => {
  if (rating >= 3000) return "text-[#ff0000]"      // Legendary Grandmaster
  if (rating >= 2600) return "text-[#ff0000]"      // International Grandmaster
  if (rating >= 2400) return "text-[#ff3333]"      // Grandmaster
  if (rating >= 2300) return "text-[#ff8c00]"      // International Master
  if (rating >= 2100) return "text-[#ffa500]"      // Master
  if (rating >= 1900) return "text-[#aa00ff]"      // Candidate Master
  if (rating >= 1600) return "text-[#0000ff]"      // Expert
  if (rating >= 1400) return "text-[#03a89e]"      // Specialist
  if (rating >= 1200) return "text-[#008000]"      // Pupil
  return "text-[#808080]"                          // Newbie
}

