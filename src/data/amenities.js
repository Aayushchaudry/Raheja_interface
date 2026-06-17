// Avana amenities — each entry plays a full-quality walkthrough film streamed
// from the Raheja CloudFront CDN, with a poster still (extracted locally) for
// its card. CloudFront serves these with range requests + CORS, so the films
// are also pre-cached in the browser (see hooks/useAssetCache.js) for instant,
// buffer-free playback on the kiosk.

const cdn = "https://d1ovqzmursgzel.cloudfront.net/raheja_avana";
const poster = "assets/images/amenities";

export const avanaAmenities = [
  {
    slug: "reception-lobby",
    name: "Reception Lobby",
    desc: "A double-height arrival that sets the tone for Avana.",
    video: `${cdn}/RL.mp4`,
    poster: `${poster}/reception-lobby.jpg`,
  },
  {
    slug: "swimming-pool",
    name: "Swimming Pool",
    desc: "A resort-style pool framed by landscaped greens.",
    video: `${cdn}/SP.mp4`,
    poster: `${poster}/swimming-pool.jpg`,
  },
  {
    slug: "gym",
    name: "Gymnasium",
    desc: "A fully-equipped fitness studio for everyday wellness.",
    video: `${cdn}/GYM.mp4`,
    poster: `${poster}/gym.jpg`,
  },
  {
    slug: "banquet-hall",
    name: "Banquet Hall",
    desc: "An elegant venue for celebrations and gatherings.",
    video: `${cdn}/GH.mp4`,
    poster: `${poster}/banquet-hall.jpg`,
  },
  {
    slug: "sports-multipurpose-hall",
    name: "Sports & Multipurpose Hall",
    desc: "A grand hall built for sport and events alike.",
    video: `${cdn}/SM.mp4`,
    poster: `${poster}/sports-multipurpose-hall.jpg`,
  },
  {
    slug: "sports-facility",
    name: "Sports Facility",
    desc: "Courts and greens for the active resident.",
    video: `${cdn}/SPT.mp4`,
    poster: `${poster}/sports-facility.jpg`,
  },
  {
    slug: "indoor-games",
    name: "Indoor Games",
    desc: "A dedicated zone for play, leisure and bonding.",
    video: `${cdn}/IG.mp4`,
    poster: `${poster}/indoor-games.jpg`,
  },
  {
    slug: "guest-room",
    name: "Guest Suite",
    desc: "Refined accommodation for visiting family.",
    video: `${cdn}/GR.mp4`,
    poster: `${poster}/guest-room.jpg`,
  },
  {
    slug: "meeting-room",
    name: "Meeting Room",
    desc: "A private space for work and conversation.",
    video: `${cdn}/MR.mp4`,
    poster: `${poster}/meeting-room.jpg`,
  },
  {
    slug: "lift-section",
    name: "Lift Lobby",
    desc: "High-speed elevators with crafted interiors.",
    video: `${cdn}/LIFT.mp4`,
    poster: `${poster}/lift-section.jpg`,
  },
];
