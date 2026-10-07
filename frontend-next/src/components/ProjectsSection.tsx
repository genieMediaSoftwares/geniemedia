"use client";

import meerabasuAsset from "@/assets/meerabasuWebsite.webp";
import AvanttaGemsAsset from "@/assets/AvanttaGems.webp";
import KNSAsset from "@/assets/knsMetals.webp";
import BuildzonAsset from "@/assets/buildzon.webp";
import laserFoldAsset from "@/assets/LaserFold.webp";
import GenieStudioAsset from "@/assets/GenieStudio.webp";
import NuconaerospaceAsset from "@/assets/nuconaerospace.webp";
import SynergeneAsset from "@/assets/synergeneapi.webp";
import VivodyneAsset from "@/assets/vivodyne.webp";
import DecagonAsset from "@/assets/decagon.webp";
import FreenomeAsset from "@/assets/freenome.webp";
import type { PortfolioItem } from "@/types";
import { portfolioOrFallback } from "@/lib/portfolio";
import ProjectCard, { PROJECT_GRID } from "@/components/ProjectCard";
import { useLatestProjects } from "@/lib/liveData";

const meerabasu = meerabasuAsset.src;
const AvanttaGems = AvanttaGemsAsset.src;
const KNS = KNSAsset.src;
const Buildzon = BuildzonAsset.src;
const laserFold = laserFoldAsset.src;
const GenieStudio = GenieStudioAsset.src;
const Nuconaerospace = NuconaerospaceAsset.src;
const Synergene = SynergeneAsset.src;
const Vivodyne = VivodyneAsset.src;
const Decagon = DecagonAsset.src;
const Freenome = FreenomeAsset.src;

const FALLBACK_PROJECTS: PortfolioItem[] = [
  {
    name: "Meera Basu",
    image: meerabasu,
      url: "https://meerabasu.co.in/"
  },
  {
    name: "Avantta Gems",
    image: AvanttaGems,
      url: "https://8z2bgt-68.myshopify.com/"
  },
  {
    name: "KNS Metal Solutions",
    image: KNS,
      url: "https://knsmetalsolutions.com.au/"
  },
  {
    name: "Laserfold",
    image: laserFold,
      url: "https://laserfold.com.au/"
  },
  {
    name: "GenieStudio",
    image: GenieStudio,
      url: "https://geniestudio.in/"
  },
  {
    name: "Buildzone",
    image: Buildzon,
      url: "https://www.buildzonprojects.com/"
  },
  {
    name: "Nucon Aerospace - by Snapbrio",
    image: Nuconaerospace,
    url:"https://www.nuconaerospace.com/"
  },
  {
    name: "Synergene - by Snapbrio",
    image: Synergene,
    url:"https://synergeneapi.com/"
  },
  {
    name: "Vivodyne - by Snapbrio",
    image: Vivodyne,
    url:"https://www.vivodyne.com//"
  },
  {
    name: "Decagon - by Snapbrio",
    image: Decagon,
    url:"https://decagon.ai/"
  },
  {
    name: "Freenome - by Snapbrio",
    image: Freenome,
    url:"https://www.freenome.com/"
  },
];

const ProjectsSection = ({ initialProjects, caseStudyLinks = {} }: { initialProjects: PortfolioItem[] | null; caseStudyLinks?: Record<number, string> }) => {

  const liveProjects = useLatestProjects(initialProjects);
  const projects = portfolioOrFallback(liveProjects, FALLBACK_PROJECTS);

  return (
    <>

     <section className="bg-white py-8 md:py-12" id='projects'>
      <div className="max-w-7xl mx-auto px-4 md:px-2">

        <h2 className="text-center text-4xl md:text-5xl font-bold text-gray-700 mb-10">
          Our Portfolio
        </h2>

        <div className={PROJECT_GRID}>
          {projects.map((project, index) => (
            <ProjectCard key={project.id ?? index} project={project} caseStudyHref={project.id !== undefined ? caseStudyLinks[project.id] : undefined} />
          ))}
        </div>

      </div>
       
    </section>

    </>
  );
};

export default ProjectsSection;