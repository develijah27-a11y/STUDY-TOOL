import { NextRequest, NextResponse } from "next/server";
import { dbStore } from "@/lib/db/in-memory-store";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const query = (searchParams.get("q") || "").trim().toLowerCase();
  const institutionId = searchParams.get("institutionId") || "";
  const programmeId = searchParams.get("programmeId") || "";
  const courseUnitId = searchParams.get("courseUnitId") || "";
  const documentType = searchParams.get("documentType") || "";
  const maxPriceUGX = searchParams.get("maxPrice") ? Number(searchParams.get("maxPrice")) : null;

  let docs = dbStore.documents.filter((d) => d.status === "published");

  if (institutionId && institutionId !== "all") {
    docs = docs.filter((d) => d.institutionId === institutionId);
  }
  if (programmeId && programmeId !== "all") {
    docs = docs.filter((d) => d.programmeId === programmeId);
  }
  if (courseUnitId && courseUnitId !== "all") {
    docs = docs.filter((d) => d.courseUnitId === courseUnitId);
  }
  if (documentType && documentType !== "all") {
    docs = docs.filter((d) => d.documentType === documentType);
  }
  if (maxPriceUGX !== null && !Number.isNaN(maxPriceUGX)) {
    docs = docs.filter((d) => d.priceUGX <= maxPriceUGX);
  }

  if (query) {
    docs = docs.filter((d) => {
      const course = dbStore.courses.find((c) => c.id === d.courseUnitId);
      const lec = dbStore.lecturerProfiles.find((l) => l.id === d.lecturerId);
      const searchable = [
        d.title,
        d.description,
        ...d.topics,
        course?.code || "",
        course?.name || "",
        lec?.fullName || "",
      ]
        .join(" ")
        .toLowerCase();
      return searchable.includes(query);
    });
  }

  const enrichedDocs = docs.map((d) => {
    const inst = dbStore.institutions.find((i) => i.id === d.institutionId);
    const prog = dbStore.programmes.find((p) => p.id === d.programmeId);
    const course = dbStore.courses.find((c) => c.id === d.courseUnitId);
    const lecturer = dbStore.lecturerProfiles.find((l) => l.id === d.lecturerId);

    return {
      ...d,
      accessCode: d.accessCode || d.id,
      institutionName: inst?.name || "University",
      institutionShortCode: inst?.shortCode || "UNI",
      programmeCode: prog?.code || "",
      courseCode: course?.code || "",
      courseName: course?.name || "",
      lecturerName: lecturer?.fullName || "Verified Lecturer",
      lecturerDepartment: lecturer?.department || "",
      lecturerVerified: lecturer?.verificationStatus === "approved",
    };
  });

  return NextResponse.json({
    documents: enrichedDocs,
    institutions: dbStore.institutions,
    programmes: dbStore.programmes,
    courses: dbStore.courses,
    collections: dbStore.collections.filter((c) => c.isPublished),
  });
}

