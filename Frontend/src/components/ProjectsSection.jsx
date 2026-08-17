
import meerabasu from '../assets/meerabasuWebsite.png'
import AvanttaGems from '../assets/AvanttaGems.png'
import KNS from '../assets/knsMetals.png'
import Buildzon from '../assets/buildzon.png'
import laserFold from '../assets/LaserFold.png'
import GenieStudio from '../assets/GenieStudio.png'
import Nuconaerospace from '../assets/nuconaerospace.png'
import Synergene from '../assets/synergeneapi.png'
import Vivodyne from '../assets/vivodyne.png'
import Decagon from '../assets/decagon.png'
import Freenome from '../assets/freenome.png'
import Wordpress from '../assets/wordpress.png'
import Shopify from '../assets/shopify.webp'
import Code from '../assets/code.png'


import usePublishedProjects from '../hooks/usePublishedProjects'


// Offline safety net only — rendered if the projects API cannot be reached.
// The live portfolio comes from the database (see usePublishedProjects).
const FALLBACK_PROJECTS = [
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


const ProjectsSection = () => {

  const { projects } = usePublishedProjects(FALLBACK_PROJECTS);

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

             
              <div className="bg-orange-400   rounded-3xl p-0 md:p-0.5  mb-8 transition-transform duration-300 group-hover:scale-105">
                <div className="overflow-hidden rounded-2xl aspect-[11/5]">
                  <img
                    src={project.image}
                    alt={project.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110 boder-2 border-orange-500"
                  />
                </div>
              </div>

              {/* Title */}
              <h3 className="text-xl font-semibold mb-6">
                {project.name}
              </h3>

             
              <button className="
                px-8 py-3 
                rounded-full 
                font-semibold 
                border-2 border-orange-400
                text-white 
                bg-gray-900
                hover:bg-orange-400
                hover:text-black
                transition-all duration-300
              " onClick={()=> project.url && window.open(project.url, "_blank")}>
                VIEW PROJECT
              </button>

            </div>
            
          ))}
        </div>
        
     
     

      </div>
       
    </section>

    

   
    </>
  );
};

export default ProjectsSection;