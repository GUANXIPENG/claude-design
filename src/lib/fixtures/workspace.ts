export type FixturePage = {
  id: string;
  name: string;
  route: string;
  purpose: string;
  previewTitle: string;
  previewSummary: string;
  highlights: string[];
  filePath: string;
};

export type FixtureProject = {
  id: string;
  name: string;
  description: string;
  updatedAt: string;
  pageCount: number;
  versionCount: number;
  status: string;
  note: string;
  pages: FixturePage[];
  files: Record<string, string>;
};

export const fixtureProjects: FixtureProject[] = [
  {
    id: "internship-platform",
    name: "Internship Match Prototype",
    description:
      "A multi-page prototype for students browsing internships, reviewing details, and tracking applications.",
    updatedAt: "2026-05-08",
    pageCount: 4,
    versionCount: 3,
    status: "Fixture preview",
    note: "Prototype only. Mock data, mock navigation, and mock code views are not connected to real AI, auth, database, or export services.",
    pages: [
      {
        id: "home",
        name: "Home",
        route: "/",
        purpose: "Explain the product and route users into internship discovery.",
        previewTitle: "Find internships that fit your next semester",
        previewSummary:
          "A focused landing page with role filters, recommended companies, and a clear path into the listings flow.",
        highlights: ["Hero CTA", "Role filters", "Featured companies"],
        filePath: "app/page.tsx"
      },
      {
        id: "listings",
        name: "Listings",
        route: "/internships",
        purpose: "Show browseable internship cards with lightweight filter states.",
        previewTitle: "Browse curated internship roles",
        previewSummary:
          "A dense but readable list view for comparing location, work mode, closing date, and match strength.",
        highlights: ["Filter rail", "Role cards", "Saved roles"],
        filePath: "app/internships/page.tsx"
      },
      {
        id: "details",
        name: "Role Detail",
        route: "/internships/product-intern",
        purpose: "Describe a single internship and provide application guidance.",
        previewTitle: "Product Design Intern at Northstar Labs",
        previewSummary:
          "A detail page with responsibilities, eligibility, timeline, and a prototype-only apply action.",
        highlights: ["Company summary", "Timeline", "Apply CTA"],
        filePath: "app/internships/[id]/page.tsx"
      },
      {
        id: "dashboard",
        name: "Application Tracker",
        route: "/dashboard",
        purpose: "Help users understand application status across saved roles.",
        previewTitle: "Application tracker",
        previewSummary:
          "A compact dashboard with status columns, next steps, and reminder-style prototype states.",
        highlights: ["Status columns", "Next action", "Usage note"],
        filePath: "app/dashboard/page.tsx"
      }
    ],
    files: {
      "app/page.tsx": `export default function HomePage() {
  return (
    <main>
      <section>
        <p>Prototype only</p>
        <h1>Find internships that fit your next semester</h1>
        <a href="/internships">Browse roles</a>
      </section>
    </main>
  );
}
`,
      "app/internships/page.tsx": `const roles = ["Product Design Intern", "Frontend Intern", "Research Assistant"];

export default function ListingsPage() {
  return (
    <main>
      <h1>Browse curated internship roles</h1>
      {roles.map((role) => (
        <article key={role}>{role}</article>
      ))}
    </main>
  );
}
`,
      "app/internships/[id]/page.tsx": `export default function RoleDetailPage() {
  return (
    <main>
      <p>Prototype only. This apply button is not connected to a real backend.</p>
      <h1>Product Design Intern at Northstar Labs</h1>
      <button>Start application</button>
    </main>
  );
}
`,
      "app/dashboard/page.tsx": `export default function DashboardPage() {
  return (
    <main>
      <h1>Application tracker</h1>
      <p>Mock statuses are shown for prototype review only.</p>
    </main>
  );
}
`
    }
  }
];

export const primaryFixtureProject = fixtureProjects[0];
