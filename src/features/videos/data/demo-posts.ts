import concert from "@/assets/posts/concert.jpg"
import festival from "@/assets/posts/festival.jpg"
import campus from "@/assets/posts/campus.jpg"
import study from "@/assets/posts/study.jpg"
import camera from "@/assets/posts/camera.jpg"
import cycling from "@/assets/posts/cycling.jpg"
import football from "@/assets/posts/football.jpg"
import coffee from "@/assets/posts/coffee.jpg"
import graduation from "@/assets/posts/graduation.jpg"
import ug from "@/assets/schools/ug.jpg"
import knust from "@/assets/schools/knust.jpg"
import uds from "@/assets/schools/uds.jpg"
import umat from "@/assets/schools/umat.jpg"

import type { PostCollection, VideoPost } from "../types/posts"

// Sample records only. Replace through the API/service/Query flow when the posts API is available.
export const demoCollections: PostCollection[] = [
  { id: "ama", name: "Campus diary", schoolId: "ug", description: "Everyday moments around Legon." },
  { id: "kwame", name: "Creative projects", schoolId: "knust", description: "Ideas taking shape on campus." },
  { id: "lens", name: "Behind the lens", schoolId: "gh-media", description: "A closer look at campus stories." },
  { id: "north", name: "Northern stories", schoolId: "uds", description: "People, places and new perspectives." },
  { id: "tarkwa", name: "Life in Tarkwa", schoolId: "umat", description: "Moments beyond the lecture hall." },
  { id: "afterclass", name: "After class", schoolId: "ug", description: "Good company and shared memories." },
]

export const demoPosts: VideoPost[] = [
  { id: "ama-1", collectionId: "ama", title: "A night to remember", caption: "The lights, the music, the people. A little glimpse of our favourite night this semester. #CampusLife #AfterLectures", cover: concert, mediaType: "video", createdAt: "2026-09-08T14:00:00Z", duration: "0:32" },
  { id: "ama-2", collectionId: "ama", title: "We made it!", caption: "For every late night and early lecture. Here's to the next chapter. #Graduation #ClassOf2026", cover: graduation, mediaType: "photo", createdAt: "2026-09-07T10:00:00Z" },
  { id: "ama-3", collectionId: "ama", title: "Legon, in miniature", caption: "If our campus was a tiny world. A playful 3D take on a place we call home. #Legon #CampusArt", cover: ug, mediaType: "photo", createdAt: "2026-09-06T09:00:00Z" },
  { id: "kwame-1", collectionId: "kwame", title: "Built between lectures", caption: "From an idea on a page to a working project. A peek into our weekend creative session. #StudentProjects #Create", cover: study, mediaType: "video", createdAt: "2026-09-08T12:00:00Z", duration: "0:48" },
  { id: "kwame-2", collectionId: "kwame", title: "Our creative corner", caption: "A miniature world for big ideas. Campus reimagined in 3D. #KNUST #Design", cover: knust, mediaType: "photo", createdAt: "2026-09-06T14:00:00Z" },
  { id: "kwame-3", collectionId: "kwame", title: "Coffee & good ideas", caption: "Our unofficial brainstorming ritual. One table, three coffees and too many ideas. #StudyBreak", cover: coffee, mediaType: "video", createdAt: "2026-09-05T12:00:00Z", duration: "0:21" },
  { id: "lens-1", collectionId: "lens", title: "Behind the lens", caption: "A closer look at the kit behind our stories. What would you shoot first? #Filmmaking #GHMedia", cover: camera, mediaType: "video", createdAt: "2026-09-08T11:00:00Z", duration: "1:04" },
  { id: "lens-2", collectionId: "lens", title: "When the beat drops", caption: "A crowd, a chorus and a moment you wish could last forever. #LiveMusic #CampusNights", cover: festival, mediaType: "video", createdAt: "2026-09-07T20:00:00Z", duration: "0:45" },
  { id: "lens-3", collectionId: "lens", title: "Meet the storytellers", caption: "Sharing ideas with the people who make it all happen. #CreativeCommunity #Storytelling", cover: campus, mediaType: "photo", createdAt: "2026-09-05T08:00:00Z" },
  { id: "north-1", collectionId: "north", title: "A fresh perspective", caption: "New ideas grow when we make room for them. Our campus, imagined as a little green world. #UDS #NorthernStories", cover: uds, mediaType: "photo", createdAt: "2026-09-07T09:00:00Z" },
  { id: "north-2", collectionId: "north", title: "Better, together", caption: "An afternoon of conversations, connections and learning something new. #Community #StudentLife", cover: campus, mediaType: "video", createdAt: "2026-09-06T08:00:00Z", duration: "0:56" },
  { id: "north-3", collectionId: "north", title: "The morning ride", caption: "Fresh air, good company and a road worth taking. #WeekendRide #Outside", cover: cycling, mediaType: "video", createdAt: "2026-09-04T08:00:00Z", duration: "0:39" },
  { id: "tarkwa-1", collectionId: "tarkwa", title: "Small campus, big ideas", caption: "A playful little world inspired by our campus and the things we discover here. #UMaT #CampusArt", cover: umat, mediaType: "photo", createdAt: "2026-09-06T10:00:00Z" },
  { id: "tarkwa-2", collectionId: "tarkwa", title: "Match day energy", caption: "Lace up. Show up. Leave it all on the pitch. #CampusSports #MatchDay", cover: football, mediaType: "video", createdAt: "2026-09-05T15:00:00Z", duration: "0:28" },
  { id: "tarkwa-3", collectionId: "tarkwa", title: "Something in the works", caption: "A new project is taking shape. More soon. #StudentCreators #WorkInProgress", cover: study, mediaType: "video", createdAt: "2026-09-03T12:00:00Z", duration: "0:17" },
  { id: "afterclass-1", collectionId: "afterclass", title: "The weekend starts here", caption: "Close the laptop. Find your people. Make some memories. #AfterClass #Weekend", cover: festival, mediaType: "video", createdAt: "2026-09-05T19:00:00Z", duration: "0:36" },
  { id: "afterclass-2", collectionId: "afterclass", title: "Our kind of catch-up", caption: "Good coffee tastes even better with good company. #CoffeeRun #Friends", cover: coffee, mediaType: "video", createdAt: "2026-09-04T10:00:00Z", duration: "0:24" },
  { id: "afterclass-3", collectionId: "afterclass", title: "One last campus selfie", caption: "The end of one chapter and the start of everything else. #GraduationDay #Memories", cover: graduation, mediaType: "video", createdAt: "2026-09-02T11:00:00Z", duration: "0:42" },
]
