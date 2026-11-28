export const INSTITUTION_MAP: Record<string, string> = {
  "inst-mak": "Makerere University",
  "inst-kyu": "Kyambogo University",
  "inst-must": "Mbarara University of Science & Technology",
  "inst-ucu": "Uganda Christian University",
  "inst-mubs": "Makerere University Business School",
  "inst-kiu": "Kampala International University",
  "inst-uict": "Uganda Institute of ICT (UICT)",
  "inst-bribte": "Buganda Royal Institute (BRIBTE)",
  "inst-kpm": "Kampala Polytechnic Mengo",
  "inst-htti": "Hotel & Tourism Training Institute (HTTI)",
  "inst-ymca": "YMCA Comprehensive Institute",
};

export const PROGRAMME_MAP: Record<string, string> = {
  "prog-bsse": "Software Engineering",
  "prog-bcs": "Computer Science",
  "prog-bit": "Information Technology",
  "prog-bba": "Business Administration",
  "prog-bee": "Electrical Engineering",
  "prog-bce": "Civil Engineering",
  "prog-beng": "Civil & Building Engineering",
  "prog-llb": "Bachelor of Laws",
  "prog-voc-elec": "Electrical Installation",
  "prog-voc-auto": "Automotive & Power Mechanics",
  "prog-other": "Academic Studies",
};

export function getInstitutionName(idOrName?: string): string {
  if (!idOrName) return "Uganda Higher Education";
  return INSTITUTION_MAP[idOrName] || idOrName;
}

export function getProgrammeName(idOrName?: string): string {
  if (!idOrName) return "Academic Programme";
  return PROGRAMME_MAP[idOrName] || idOrName;
}
