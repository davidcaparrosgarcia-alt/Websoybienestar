const fs = require('fs');

let content = fs.readFileSync('src/pages/Home.tsx', 'utf8');

// The login section starts at "{/* Main Content Grid */}"
const loginSectionStartMarker = "      {/* Main Content Grid */}";
const loginSectionStartIndex = content.indexOf(loginSectionStartMarker);
const symptomsSectionStartMarker = "      {/* Symptoms Section: Reconociendo tus batallas */}";
const loginSectionEndIndex = content.indexOf(symptomsSectionStartMarker);

if (loginSectionStartIndex === -1 || loginSectionEndIndex === -1) {
    console.log("Could not find boundaries for login section");
    process.exit(1);
}

const loginSection = content.substring(loginSectionStartIndex, loginSectionEndIndex);
content = content.substring(0, loginSectionStartIndex) + content.substring(loginSectionEndIndex);

// Find where to insert the login section
const reassuranceBannerMarker = "      {/* Reassurance Banner */}";
const reassuranceIndex = content.indexOf(reassuranceBannerMarker);

if (reassuranceIndex === -1) {
    console.log("Could not find reassurance banner");
    process.exit(1);
}

// Insert login section
content = content.substring(0, reassuranceIndex) + loginSection + "\n" + content.substring(reassuranceIndex);

// Now for 'Sesiones de Claridad'
const originalSesionesContent = `      {/* Sesiones de Claridad */}
      <section className="max-w-7xl mx-auto px-8 mb-32">
        <div className="relative rounded-[2.5rem] overflow-hidden group min-h-[380px] shadow-xl">
          <img alt="soft morning sunlight" className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" src="/images/fondo-zen.jpg"/>
          <div className="absolute inset-0 bg-primary/35 backdrop-blur-[2px]"></div>
          <div className="relative h-full p-8 md:p-10 flex flex-col justify-end text-on-primary">
            <h3 className="font-headline text-4xl md:text-5xl mb-6">Sesiones de Claridad</h3>
            <p className="font-body opacity-90 font-light text-2xl mb-10 leading-relaxed max-w-xl">Tu primer encuentro hacia la luz. Un espacio dedicado exclusivamente a ti.</p>
            <div onClick={() => {
              if (hasDoneConsultation) {
                setIsNextStepsModalOpen(true);
              } else {
                navigate('/session');
              }
            }} className="bg-surface text-primary px-10 py-5 rounded-full self-start font-bold text-[12px] uppercase tracking-[0.2em] hover:bg-surface-container-high transition-all cursor-pointer shadow-lg active:scale-95 inline-block">
              {hasDoneConsultation ? "Solicitar Cuestionario Espejo" : "Consulta Gratuita"}
            </div>
          </div>
        </div>
      </section>`;

const cleanSesionesContent = `            <div className="md:col-span-8 relative rounded-[2.5rem] overflow-hidden group min-h-[380px] shadow-xl">
              <img alt="soft morning sunlight" className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" src="/images/fondo-zen.jpg"/>
              <div className="absolute inset-0 bg-primary/35 backdrop-blur-[2px]"></div>
              <div className="relative h-full p-8 md:p-10 flex flex-col justify-end text-on-primary">
                <h3 className="font-headline text-4xl md:text-5xl mb-6">Sesiones de Claridad</h3>
                <p className="font-body opacity-90 font-light text-2xl mb-10 leading-relaxed max-w-xl">Tu primer encuentro hacia la luz. Un espacio dedicado exclusivamente a ti.</p>
                <div onClick={() => {
                  if (hasDoneConsultation) {
                    setIsNextStepsModalOpen(true);
                  } else {
                    navigate('/session');
                  }
                }} className="bg-surface text-primary px-10 py-5 rounded-full self-start font-bold text-[12px] uppercase tracking-[0.2em] hover:bg-surface-container-high transition-all cursor-pointer shadow-lg active:scale-95 inline-block">
                  {hasDoneConsultation ? "Solicitar Cuestionario Espejo" : "Consulta Gratuita"}
                </div>
              </div>
            </div>`;

// Delete the external `<section>` of Sesiones de Claridad from `content`
if(content.includes(originalSesionesContent)) {
    content = content.replace(originalSesionesContent, '');
    
    // Insert `cleanSesionesContent` before the end of the grid
    content = content.replace(
        "            />\n\n          </div>",
        "            />\n\n" + cleanSesionesContent + "\n\n          </div>"
    );
} else {
    console.log("Could not find Sesiones de Claridad section to replace.");
}

fs.writeFileSync('src/pages/Home.tsx', content);
console.log("SUCCESS");
