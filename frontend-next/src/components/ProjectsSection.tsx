
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
import { portfolioOrFallback, serviceForCategory } from "@/lib/portfolio";

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


// Offline safety net only — rendered if the projects API cannot be reached.
// The live portfolio comes from the database (fetched on the server, see src/lib/api/projects.ts).
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


const ProjectsSection = ({ initialProjects }: { initialProjects: PortfolioItem[] | null }) => {

  const projects = portfolioOrFallback(initialProjects, FALLBACK_PROJECTS);

  return (
    <>



     <section className="bg-white py-8 md:py-12" id='projects'>
      <div className="max-w-7xl mx-auto px-2">

       
        <h2 className="text-center text-4xl md:text-5xl font-bold text-gray-700 mb-10">
          Our Portfolio
        </h2>

        {/* Projects Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-12">

          {projects.map((project, index) => (
            <div key={project.id ?? index} className="text-center group">

             
              <div className="rounded-3xl p-0 md:p-0.5 mb-8 transition-transform duration-300 group-hover:scale-105">
                <div className="overflow-hidden rounded-2xl aspect-[11/5]">
                  <img
                    src={project.image}
                    alt={`${project.name} website`}
                    width="1280"
                    height="582"
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                </div>
              </div>

              {/* Title */}
              <h3 className={`text-xl font-semibold ${serviceForCategory(project.category) ? 'mb-2' : 'mb-6'}`}>
                {project.name}
              </h3>

              {/* The service behind the project, linked to its page. */}
              {serviceForCategory(project.category) && (
                <a
                  href={serviceForCategory(project.category)?.href}
                  className="inline-block mb-5 text-sm font-medium text-orange-700 underline underline-offset-2 hover:text-orange-900"
                >
                  {serviceForCategory(project.category)?.label}
                </a>
              )}

              <div>
              {/* A real link so crawlers see which live sites the portfolio
                  points to; it opens in a new tab as the button used to. */}
              {project.url && (
              <a href={project.url} target="_blank" rel="noopener" className="
                inline-block
                px-8 py-3
                rounded-full
                font-semibold
                border-2 border-orange-400
                text-white
                bg-gray-900
                hover:bg-orange-400
                hover:text-black
                transition-all duration-300
              ">
                VIEW PROJECT
              </a>
              )}
              </div>

            </div>
            
          ))}
        </div>
        
     
     

      </div>
       
    </section>

    

   
    </>
  );
};

export default ProjectsSection;