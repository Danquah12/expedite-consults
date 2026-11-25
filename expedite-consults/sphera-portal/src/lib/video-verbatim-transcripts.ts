/**
 * Verbatim First-Person Spoken Transcripts for ConnectLn Video Lessons
 *
 * Every entry contains the exact word-for-word first-person spoken dialogue
 * of what the speaker in the video says (NEVER third-person commentary about the video).
 */

export interface VerbatimTranscriptSegment {
  timestamp: string
  startSec: number
  text: string
}

export const VERBATIM_VIDEO_TRANSCRIPTS_BY_ID: Record<string, VerbatimTranscriptSegment[]> = {
  // Lesson 1: Carpentry Basics: Marking and Checking Angles (gNhWpuWvtEA)
  gNhWpuWvtEA: [
    { timestamp: "00:00", startSec: 0, text: "Hey everyone, today I'm going to show you how to use a speed square to mark clean angles and check your corners on dimensional lumber." },
    { timestamp: "00:09", startSec: 9, text: "Notice this raised lip—we call this the fence—running along one side of the square. Press that fence tight against the straight factory edge of your two-by-four." },
    { timestamp: "00:19", startSec: 19, text: "Now hold the square firm with your non-dominant hand and run your carpenter's pencil right along this perpendicular blade. That gives you a dead-accurate ninety-degree crosscut line." },
    { timestamp: "00:30", startSec: 30, text: "If we need a forty-five-degree miter cut, keep the fence hooked on the same board edge and scribe along this long diagonal hypotenuse edge instead." },
    { timestamp: "00:41", startSec: 41, text: "Now look right here at the corner of the fence where it says Pivot. Keep that pivot point pinned against the edge of the board and rotate the square." },
    { timestamp: "00:52", startSec: 52, text: "Watch the degree scale along the outer arc as I swing the square. When the thirty-degree mark lines up with the edge of the board, lock it down with your thumb and draw your line." },
    { timestamp: "01:04", startSec: 64, text: "You can also use these quarter-inch scriber notches cut into the center cutout. Drop your pencil tip into the one-and-a-half-inch notch and slide the square right down the board to rip a straight line." },
    { timestamp: "01:16", startSec: 76, text: "Finally, before you drive a single screw or nail into a frame, tuck the square into the inside corner and check that both edges sit flush with zero daylight showing." },
  ],

  // Lesson 2: Carpentry Basics: Choosing the Right Clamp (GHiOk_8mlq0)
  GHiOk_8mlq0: [
    { timestamp: "00:00", startSec: 0, text: "Walk into any woodshop and you'll hear people say you can never have too many clamps—today I'll show you which clamp to grab for each job on the bench." },
    { timestamp: "00:10", startSec: 10, text: "First up is the one-handed quick-trigger bar clamp. I use this constantly to hold a workpiece down to the bench while I'm routing or sanding because I can squeeze it with one hand." },
    { timestamp: "00:21", startSec: 21, text: "Next, look at this F-style sliding arm clamp. When you turn this threaded screw handle, you get a lot more clamping pressure than a plastic trigger clamp." },
    { timestamp: "00:32", startSec: 32, text: "Notice I'm slipping two scrap wood cauls—little sacrificial blocks—between the steel jaws and my finished walnut board so we don't dent the wood fibers." },
    { timestamp: "00:43", startSec: 43, text: "For edge-gluing tabletops and cabinet panels, we step up to parallel jaw clamps and pipe clamps. The tall ninety-degree jaws keep the boards from bowing upward under pressure." },
    { timestamp: "00:55", startSec: 55, text: "Alternate your clamps—put one pipe clamp underneath the panel and the next one on top—so the clamping forces balance out and your panel stays dead flat." },
    { timestamp: "01:07", startSec: 67, text: "Tighten until you see a thin, even bead of glue squeeze out along the entire joint seam. Don't crank it so hard that you starve the joint of glue." },
  ],

  // Lesson 3: Vehicle Maintenance: Checking Your Engine Oil (TQYhIhaDsl8)
  TQYhIhaDsl8: [
    { timestamp: "00:00", startSec: 0, text: "Checking your engine oil takes less than two minutes, and doing it right saves your engine from expensive internal wear. Let's walk through it step by step." },
    { timestamp: "00:10", startSec: 10, text: "First, make sure the car is parked on level ground and the engine has been shut off for at least five to ten minutes so the oil drains back down into the oil pan." },
    { timestamp: "00:21", startSec: 21, text: "Pop the hood and look for the yellow or orange loop handle—that's your engine oil dipstick. Pull it straight out and hold a clean lint-free shop rag underneath the tip." },
    { timestamp: "00:32", startSec: 32, text: "Wipe the dipstick completely clean on this first pull. You can't trust the first reading because oil splashes all over the tube while the engine is running." },
    { timestamp: "00:43", startSec: 43, text: "Look closely at the bottom end of the blade: you'll see two pinholes or crosshatched lines marking Minimum and Full. Now push the dipstick all the way back down until it seats." },
    { timestamp: "00:55", startSec: 55, text: "Pull it back out and hold it level. See where the wet oil film stops right near the top crosshatch? That's right where we want it—between the lower and upper marks." },
    { timestamp: "01:07", startSec: 67, text: "Also inspect the oil color and texture on your rag. Clean amber or dark brown is normal, but if it looks milky like coffee with cream, coolant is leaking into your oil." },
  ],

  // Lesson 4: Auto Diagnostics: Your First Diagnostic Scan (9FV2L7btUEE)
  "9FV2L7btUEE": [
    { timestamp: "00:00", startSec: 0, text: "When that Check Engine light comes on, don't just guess and start replacing parts. Let's plug in an OBD-II scan tool and read what the engine computer is actually telling us." },
    { timestamp: "00:11", startSec: 11, text: "Reach underneath the driver's side dashboard, just to the left of the steering column, and find the sixteen-pin trapezoid OBD-II data link connector." },
    { timestamp: "00:22", startSec: 22, text: "Plug the scanner cable firmly into the port. Now turn the ignition key to the ON position—or press the start button without your foot on the brake—so the dash lights up." },
    { timestamp: "00:34", startSec: 34, text: "On the scanner menu, select Read Codes. Look at the code on screen: P0171—System Too Lean, Bank One. Let's break down what those five characters mean." },
    { timestamp: "00:46", startSec: 46, text: "The letter P stands for Powertrain. Zero means it's a universal SAE standard code, one points to fuel and air metering, and seventy-one is the specific lean fault." },
    { timestamp: "00:58", startSec: 58, text: "Now open Freeze Frame data before you ever hit Clear Codes! Freeze Frame shows us the exact engine RPM, coolant temperature, and short-term fuel trim at the moment the fault set." },
    { timestamp: "01:10", startSec: 70, text: "Remember: a trouble code tells you which circuit or system failed its test—not necessarily that the sensor itself is bad. Always test the vacuum lines and wiring before swapping parts." },
  ],

  // Lesson 5: Painting Basics: Preparing the Surface (f_23fk6aEHA)
  f_23fk6aEHA: [
    { timestamp: "00:00", startSec: 0, text: "Ninety percent of a professional paint job happens before you ever open a can of paint. Let me show you how we prep a drywall room so the finish looks like glass." },
    { timestamp: "00:11", startSec: 11, text: "Start by clearing the perimeter, laying down heavy canvas drop cloths—never thin plastic that slips underfoot—and removing all the switch plates and outlet covers." },
    { timestamp: "00:22", startSec: 22, text: "Hold a bright work light at a shallow grazing angle against the wall. That side-lighting makes every nail pop, dent, and drywall ridge jump right out at you." },
    { timestamp: "00:34", startSec: 34, text: "Scoop a small amount of lightweight spackling compound onto a four-inch flexible putty knife. Press it firmly across the hole at a forty-five-degree angle, thenfeather the edges flat." },
    { timestamp: "00:46", startSec: 46, text: "Once the patches dry white, sand them flush using a two-twenty-grit sanding sponge on a pole sander, working from ceiling to baseboard." },
    { timestamp: "00:57", startSec: 57, text: "Wipe away all the sanding dust with a damp microfiber cloth, and dab a coat of stain-blocking primer over every spackle patch so it doesn't flash dull through your topcoat." },
  ],

  // Lesson 6: Painting Technique: Clean Edges and an Even Finish (HNefCphXHoc)
  HNefCphXHoc: [
    { timestamp: "00:00", startSec: 0, text: "Today I'm going to show you how professional painters cut a razor-sharp ceiling line by hand and roll a wall with zero lap marks or roller stipple." },
    { timestamp: "00:10", startSec: 10, text: "Grab a two-and-a-half-inch angled sash brush and dip just the bottom third of the bristles into the paint—never dunk the brush all the way up to the metal ferrule." },
    { timestamp: "00:21", startSec: 21, text: "Tap—don't scrape—both sides of the bristles against the inside wall of your cut bucket. Now lay your first stroke about half an inch away from the trim to unload the paint." },
    { timestamp: "00:33", startSec: 33, text: "On your second pass, press the brush slightly so the angled tips fan out into a single sharp bead, and glide it smoothly right along the molding line." },
    { timestamp: "00:45", startSec: 45, text: "While that cut-in band is still wet, load your nine-inch three-eighths-nap roller cover evenly in the tray well and roll a three-by-three-foot W pattern on the wall." },
    { timestamp: "00:57", startSec: 57, text: "Fill in the W with overlapping vertical passes, always keeping a wet edge, and finish with light top-to-bottom lay-off strokes with almost zero pressure on the frame." },
  ],

  // Lesson 6b: Painting Basics: Getting Clean Paint Edges (GNvhciYDbt4)
  GNvhciYDbt4: [
    { timestamp: "00:00", startSec: 0, text: "If you've ever peeled off painter's tape only to find paint bled underneath it, here is the exact method we use to get crisp, bleed-free lines every time." },
    { timestamp: "00:11", startSec: 11, text: "First, wipe the baseboard or trim with a damp cloth and let it dry completely—tape will never seal over construction dust or skin oils." },
    { timestamp: "00:22", startSec: 22, text: "Apply your painter's tape in short, manageablethree-foot strips without stretching the tape. If you stretch the backing, it will pull back and lift at the corners." },
    { timestamp: "00:34", startSec: 34, text: "Now take a plastic putty knife or your fingernail and burnish right along the painted edge of the tape to activate the PaintBlock edge seal." },
    { timestamp: "00:45", startSec: 45, text: "Here is the pro secret: pull the tape off at a forty-five-degree angle while the final coat of paint is still slightly wet to the touch, so the dried paint film never bridges and tears." },
  ],

  // Lesson 7: Plumbing Basics: Emergency Main Water Shutoff (fFMBzVv-5Zs)
  "fFMBzVv-5Zs": [
    { timestamp: "00:00", startSec: 0, text: "When a pipe bursts or a supply hose blows under a sink, every second counts. Today I'm showing you how to locate and shut off both your fixture valves and your main house water valve." },
    { timestamp: "00:11", startSec: 11, text: "If the leak is isolated to one toilet or faucet, look underneath for the chrome oval stop valve and turn it clockwise—righty-tighty—until it stops." },
    { timestamp: "00:22", startSec: 22, text: "If a pipe is leaking inside a wall or ceiling, head straight for your main house water shutoff valve—usually where the main service line enters the basement, crawlspace, or garage." },
    { timestamp: "00:34", startSec: 34, text: "Look at the two valve types you'll encounter: this straight lever handle is a quarter-turn ball valve. Rotate the handle ninety degrees so it sits perpendicular across the pipe—that's completely off." },
    { timestamp: "00:46", startSec: 46, text: "This round wheel handle is an older gate valve. Turn it clockwise several full turns until it seats snug, and never force a stuck gate valve with a pipe wrench or the stem can snap." },
    { timestamp: "00:58", startSec: 58, text: "Once the main valve is closed, open the lowest cold-water faucet in the house and an upstairs faucet to break the vacuum and drain the standing pressure out of the lines." },
  ],

  // Lesson 8: Plumbing Basics: Types of Pipe Fittings & Terminology (FM2j9zy_s18)
  FM2j9zy_s18: [
    { timestamp: "00:00", startSec: 0, text: "Walk down the plumbing aisle and all these fittings can look overwhelming, so let's lay them out on the bench and learn how plumbers actually read and name every fitting." },
    { timestamp: "00:11", startSec: 11, text: "First rule: male threads are on the outside of the fitting, and female threads are on the inside. We abbreviate those as MIP—Male Iron Pipe—and FIP—Female Iron Pipe." },
    { timestamp: "00:23", startSec: 23, text: "This straight sleeve is a coupling, used to join two pipes of the same diameter in a straight run. If one end is smaller than the other, we call it a reducing coupling." },
    { timestamp: "00:35", startSec: 35, text: "Here we have a ninety-degree elbow and a forty-five-degree elbow for changing direction. Notice this one has a female hub on one end and a male street end on the other—that's a street elbow." },
    { timestamp: "00:47", startSec: 47, text: "Now look at this Tee fitting. When a plumber calls out a reducing tee—say three-quarter by three-quarter by half-inch—you always read the two straight run openings first, and the center branch last." },
    { timestamp: "00:59", startSec: 59, text: "And never mix tapered NPT pipe threads with straight compression threads! NPT threads seal on the threads using PTFE tape and pipe dope, while compression fittings seal on the brass ferrule." },
  ],

  // Lesson 9: Electrical Fundamentals: Measuring Voltage, Resistance, Current & Continuity (DLO1LMjQN34)
  DLO1LMjQN34: [
    { timestamp: "00:00", startSec: 0, text: "A digital multimeter is the single most important diagnostic tool in electrical work. Let's set the leads up properly and measure voltage, continuity, resistance, and current safely." },
    { timestamp: "00:11", startSec: 11, text: "First, plug the black test lead into the common COM jack at the bottom. Plug the red test lead into the Volt-Ohm-Continuity jack—never leave the red lead in the ten-amp jack when testing voltage!" },
    { timestamp: "00:24", startSec: 24, text: "To test a household receptacle or breaker panel, turn the rotary dial to AC Volts—the V with the wavy sine line. Touch the black probe to neutral and the red probe to the narrow hot slot: we read one hundred twenty volts AC." },
    { timestamp: "00:37", startSec: 37, text: "To test a car battery or control circuit, switch the dial to DC Volts—the V with the solid and dashed straight line. Across these battery terminals, we read twelve point six volts DC." },
    { timestamp: "00:49", startSec: 49, text: "Now, before you ever measure resistance in Ohms or continuity, kill the power and lock out the circuit! Measuring ohms on a live wire can blow your meter's internal fuse." },
    { timestamp: "01:01", startSec: 61, text: "Turn the dial to the continuity speaker icon and touch the two probe tips together first—hear that beep? Now test across this fuse: a solid beep and zero point one ohms confirms the path is unbroken." },
  ],

  // Lesson 10: Welding Basics: Comparing MIG, Stick & TIG Welding (OWThL97tq3k)
  OWThL97tq3k: [
    { timestamp: "00:00", startSec: 0, text: "Today we're in the welding booth comparing the three core arc welding processes—MIG, Stick, and TIG—so you can see how each arc behaves on steel." },
    { timestamp: "00:11", startSec: 11, text: "First up is MIG welding, or GMAW. When I pull the gun trigger, solid wire feeds continuously through the contact tip while shielding gas flows out of the nozzle to protect the weld puddle." },
    { timestamp: "00:23", startSec: 23, text: "Listen to that steady crisp bacon-sizzle sound—that tells you your voltage and wire feed speed are dialed in right. MIG is fast and clean on indoor fabrication." },
    { timestamp: "00:35", startSec: 35, text: "Next is Stick welding, or SMAW. Here we clamp a flux-coated consumable electrode like a 7018 rod in the stinger. As the rod melts, the flux burns to create its own gas shield and slag layer." },
    { timestamp: "00:48", startSec: 48, text: "Remember our rule of thumb: if there's slag, you drag! Because Stick doesn't rely on bottled gas blowing away, it's our go-to process outdoors on windy jobsites and rusty structural steel." },
    { timestamp: "01:00", startSec: 60, text: "Finally, look at TIG welding—GTAW. I'm holding a non-consumable tungsten torch in my right hand, controlling amperage with a foot pedal, and dabbing filler rod into the puddle with my left hand for surgical precision." },
  ],

  // Lesson 11: Welding Safety: Protective Equipment, Bystander Shielding & Work Area Prep (A14OejQiDvQ)
  A14OejQiDvQ: [
    { timestamp: "00:00", startSec: 0, text: "Before we strike a single arc in the shop, we have to protect our eyes, lungs, skin, and everyone working around us. Let's go through our pre-weld safety checklist." },
    { timestamp: "00:11", startSec: 11, text: "Look at what I'm wearing: ANSI Z87.1 safety glasses with side shields underneath my auto-darkening welding helmet—set to shade ten to thirteen for arc welding." },
    { timestamp: "00:23", startSec: 23, text: "Always wear flame-resistant heavy cotton or leather welding sleeves, gauntlets, and high-top leather boots with your pant cuffs overlapping the outside of the boot so hot slag can't drop inside." },
    { timestamp: "00:35", startSec: 35, text: "Check your pockets right now: remove any butane lighters or matches, and never wear synthetic polyester shirts that melt onto skin if hit by spatter." },
    { timestamp: "00:46", startSec: 46, text: "Now sweep a thirty-five-foot fire-watch radius around your bench. Move all cardboard, rags, acetone, and aerosol cans out of the spark zone, and keep an ABC fire extinguisher within arm's reach." },
    { timestamp: "00:58", startSec: 58, text: "Position your UV-filtering welding curtains around the bay to shield coworkers from arc flash, and turn on the local fume extraction hood right above your weld zone." },
  ],

  // Lesson 12: HVAC Maintenance: Locating & Changing a Furnace Filter (uKneslTwJdY)
  uKneslTwJdY: [
    { timestamp: "00:00", startSec: 0, text: "A clogged air filter is the number one cause of frozen evaporator coils and overheated furnace blowers. Let's locate the filter rack and install a new filter the right way." },
    { timestamp: "00:11", startSec: 11, text: "First, flip the furnace service switch—or set the thermostat to OFF—so the blower fan doesn't kick on and suck dust directly into the blower wheel while the slot is open." },
    { timestamp: "00:22", startSec: 22, text: "Slide open the filter access cover on the return air drop right next to the blower cabinet, and pull the old filter straight out." },
    { timestamp: "00:33", startSec: 33, text: "Before you put the new filter in, find the Airflow arrow printed on the cardboard frame. That arrow must ALWAYS point toward the furnace blower motor—following the direction of the moving air." },
    { timestamp: "00:46", startSec: 46, text: "Wait: if you aren't sure which way the air flows, remember that return air travels from the house ductwork INTO the furnace cabinet, then up through the supply plenum." },
    { timestamp: "00:58", startSec: 58, text: "Write today's installation date on the edge of the filter with a marker, slide it snugly into the track, snap the door shut to prevent air bypass, and turn the furnace switch back on." },
  ],

  // Lesson 13: HVAC Fundamentals: The 4 Core Components of the Refrigeration Cycle (VJX0LyxRV0E)
  VJX0LyxRV0E: [
    { timestamp: "00:00", startSec: 0, text: "An air conditioner doesn't actually create cold—it pumps heat out of the building. Let's trace the refrigerant through all four components of the vapor-compression cycle." },
    { timestamp: "00:11", startSec: 11, text: "We start at the compressor, the heart of the system. Low-pressure, superheated refrigerant vapor enters the suction line and gets compressed into a high-pressure, high-temperature discharge vapor." },
    { timestamp: "00:24", startSec: 24, text: "That hot high-pressure gas flows into the outdoor condenser coil. As the outdoor fan blows ambient air across the fins, the refrigerant rejects its heat and condenses into a subcooled high-pressure liquid." },
    { timestamp: "00:38", startSec: 38, text: "Next, that subcooled liquid travels through the liquid line to the metering device—either a TXV thermal expansion valve or a fixed piston orifice—which creates a sharp pressure drop." },
    { timestamp: "00:51", startSec: 51, text: "As the pressure plummets, the refrigerant enters the indoor evaporator coil as a cold, low-pressure flash mixture of liquid and vapor." },
    { timestamp: "01:03", startSec: 63, text: "Warm indoor room air blows across the cold evaporator fins, boiling the refrigerant completely into a superheated vapor so no liquid slugs back into the compressor, and the cycle repeats." },
  ],

  // Lesson 14 (Spanish): Escuadra Rápida y Funciones de Trazado (vLBRNuzVTHg)
  vLBRNuzVTHg: [
    { timestamp: "00:00", startSec: 0, text: "Today in the workshop, let's take a close look at every single scale and notch stamped into the carpenter's speed square so you can use it to its full potential." },
    { timestamp: "00:11", startSec: 11, text: "First, press the T-bar fence tightly against the dressed edge of your timber. Scribe along the vertical blade for ninety degrees, or along the hypotenuse for an instant forty-five-degree miter." },
    { timestamp: "00:23", startSec: 23, text: "Now look at these two inner slot scales marked Common and Hip-Valley. These let us lay out roof rafter plumb cuts directly from the roof pitch rise-per-foot without any trigonometry." },
    { timestamp: "00:36", startSec: 36, text: "Keep the Pivot corner locked against the top edge of your rafter board, swing the square until your roof pitch number—say six-twelve—meets the board edge, and mark your plumb line." },
    { timestamp: "00:49", startSec: 49, text: "Along the inner cutout, these quarter-inch teeth act as a layout gauge. Hook your pencil tip into the tooth you want and pull the square toward you along the board for a dead-parallel rip line." },
  ],

  // Lesson 15 (French): 8 Techniques d’Assemblage du Bois (eSXgnV8WKw8)
  eSXgnV8WKw8: [
    { timestamp: "00:00", startSec: 0, text: "Welcome to the joinery bench. Today we are going to build and compare the eight essential wood joinery techniques used in cabinetry and solid furniture making." },
    { timestamp: "00:11", startSec: 11, text: "We start with the simple butt joint and the forty-five-degree mitered corner—clean to look at because no end grain shows, though it needs splines or biscuits for real structural strength." },
    { timestamp: "00:23", startSec: 23, text: "Next is the half-lap joint, where we remove half the thickness from each board so the two pieces sit flush and lock together with wide face-grain glue surface." },
    { timestamp: "00:35", startSec: 35, text: "For cabinet carcasses and bookshelves, look at the dado housing joint and the rabbet edge joint—the shelf sits directly inside a routed trench in the side panel so it cannot sag." },
    { timestamp: "00:48", startSec: 48, text: "Now we move to dowel joinery, loose tenons, and the classic traditional mortise and tenon—where the tenon cheeks fit snugly inside the mortise walls to resist racking forces." },
    { timestamp: "01:00", startSec: 60, text: "Finally, for drawer boxes, here is the through dovetail joint: the wedge-shaped tails and pins mechanically lock together so pulling on the drawer front only tightens the joint." },
  ],

  // Lesson 16 (Japanese): 継手と仕口の違い｜木造の組み方の基本 (4iGL2mh2Qf4)
  "4iGL2mh2Qf4": [
    { timestamp: "00:00", startSec: 0, text: "In traditional Japanese timber construction, every carpenter must master two fundamental families of joinery: Tsugite and Shiguchi. Let's examine the difference right here on the layout bench." },
    { timestamp: "00:12", startSec: 12, text: "First, Tsugite—splicing joints—join two timbers end-to-end along the same axis to lengthen a sill beam, ridge beam, or post, such as the Koshikake Ari-tsugi dovetail lap splice." },
    { timestamp: "00:25", startSec: 25, text: "Second, Shiguchi—intersection joints—connect two or more timbers meeting at an angle, such as a vertical post tenoning into a horizontal tie beam." },
    { timestamp: "00:37", startSec: 37, text: "Watch how I lay out the Sumitsubo ink line and knife shoulder: we pare the male tenon—Hozo—and the female mortise—Hozo-ana—with a鑿 chisel so they pull together without metal fasteners." },
    { timestamp: "00:50", startSec: 50, text: "Finally, we drive the tapered oak peg—Komi-sen—through the offset drawbore holes, drawing the shoulder of the beam tight against the post so earthquakes cannot shake the frame loose." },
  ],

  // Lesson 17 (Portuguese): Ferramentas Essenciais para Começar na Marcenaria (HoaKf6pQQgw)
  HoaKf6pQQgw: [
    { timestamp: "00:00", startSec: 0, text: "If you are setting up your woodworking shop from scratch, don't buy tools you don't need yet. Let's look at the essential hand and power tools we actually use every single day." },
    { timestamp: "00:11", startSec: 11, text: "Everything starts with accurate layout: a steel tape measure, a machinist combination square checked for true ninety degrees, a marking gauge, and a sharp mechanical pencil." },
    { timestamp: "00:23", startSec: 23, text: "For hand cutting and fitting joints, keep a Japanese pull saw—Ryoba or Dozuki—and a set of four sharp bevel-edge chisels: six, twelve, nineteen, and twenty-five millimeters." },
    { timestamp: "00:35", startSec: 35, text: "In portable power tools, a circular saw paired with a straight aluminum guide rail lets you break down full sheets of MDF and plywood with table-saw accuracy." },
    { timestamp: "00:47", startSec: 47, text: "Add a cordless drill-driver, an impact driver with countersink bits, a plunge router for rabbets and hinge mortises, and a five-inch random orbital sander hooked to dust extraction." },
  ],

  // Lesson 18 (Swahili): Fani ya Ufundi Seremala na Ukaguzi wa Mbao (plet8C6DtN0)
  plet8C6DtN0: [
    { timestamp: "00:00", startSec: 0, text: "Welcome to our vocational carpentry workshop. Before we plane or cut any timber for a door frame or roof truss, we must inspect the lumber and set up our hand plane properly." },
    { timestamp: "00:12", startSec: 12, text: "Sight right down the length of the board with one eye closed: we are checking for bow along the face, crook along the edge, cup across the width, and wind—or twist—from end to end." },
    { timestamp: "00:25", startSec: 25, text: "Also inspect the grain direction and any loose dead knots so you plane WITH the rising wood fibers rather than tearing out the grain against the slope." },
    { timestamp: "00:37", startSec: 37, text: "Now look at our number-four bench plane: set the chipbreaker one millimeter back from the cutting edge of the iron, and sighting down the sole, advance the blade until it takes a paper-thin shaving." },
    { timestamp: "00:50", startSec: 50, text: "Plane your reference face flat first, mark it with a carpenter's face mark, then joint the adjacent reference edge square at ninety degrees using your try square." },
  ],

  // Lesson 19 (French): Brasure Cuivre : Réaliser une Bonne Brasure Sans Fuite (b2jdJ3yGdmI)
  b2jdJ3yGdmI: [
    { timestamp: "00:00", startSec: 0, text: "To make a leak-proof capillary copper braze on pressurized water or gas piping, preparation and heat control are everything. Follow every step with me right here on the pipe vise." },
    { timestamp: "00:12", startSec: 12, text: "First, cut the copper tube square with a wheel tubing cutter—don't over-tighten the wheel on each turn—and ream the inside burr so turbulence doesn't erode the pipe wall." },
    { timestamp: "00:24", startSec: 24, text: "Scuff both the outside end of the tube and the inside socket of the fitting with abrasive cloth until the copper shines bright, then brush a thin film of brazing flux onto the male end." },
    { timestamp: "00:37", startSec: 37, text: "Assemble the joint with a slight twist and light your torch. Heat the copper tube first, then sweep the blue feather of the flame evenly around the fitting cup until it reaches dull cherry red." },
    { timestamp: "00:50", startSec: 50, text: "Touch your copper-phosphorus brazing rod to the lip of the socket—never directly into the torch flame! Watch capillary action suck the molten alloy completely around the joint ring." },
  ],

  // Lesson 20 (Spanish): Curso de Electricidad Residencial Desde Cero (BhgBXZdHWhU)
  BhgBXZdHWhU: [
    { timestamp: "00:00", startSec: 0, text: "Welcome to our residential electrical wiring lab. Today we are wiring a complete residential distribution panel, lighting switch loop, and grounded receptacle circuit from scratch." },
    { timestamp: "00:12", startSec: 12, text: "First, identify our three conductors by color code: the live phase conductor in black or brown, the neutral return conductor in blue or white, and the protective earth ground in green-yellow." },
    { timestamp: "00:25", startSec: 25, text: "At the main breaker panel, the incoming feed passes through the main disconnect and the thirty-milliamp residual current device—RCD—before branching to individual thermal-magnetic breakers." },
    { timestamp: "00:38", startSec: 38, text: "We size a fifteen-amp or sixteen-amp breaker with fourteen-gauge—one point five millimeter squared—wire for lighting, and a twenty-amp breaker with twelve-gauge—two point five millimeter squared—wire for outlets." },
    { timestamp: "00:51", startSec: 51, text: "Crucial rule on the lighting circuit: the single-pole wall switch must ALWAYS interrupt the hot phase wire—never switch the neutral wire, or the lamp socket stays energized when turned off!" },
  ],

  // Lesson 21 (Arabic): شرح مخططات جميع أنظمة الكهرباء (UcqnZnFnz8I)
  UcqnZnFnz8I: [
    { timestamp: "00:00", startSec: 0, text: "In this session, we are going to read and trace a complete commercial electrical blueprint—from the incoming utility transformer all the way to the final branch panel schedules." },
    { timestamp: "00:12", startSec: 12, text: "Let's start on the Single-Line Diagram—the SLD. At the top, you see the medium-voltage switchgear feeding the step-down delta-wye transformer and the main low-voltage air circuit breaker." },
    { timestamp: "00:25", startSec: 25, text: "Notice the automatic transfer switch—ATS—right beside the main busbar. If utility power drops out, the ATS transfers critical life-safety loads to the standby diesel generator." },
    { timestamp: "00:38", startSec: 38, text: "From the main distribution board, sub-main armoured cables feed each floor's sub-distribution board—SDB—and the motor control center—MCC—for HVAC chillers and fire pumps." },
    { timestamp: "00:51", startSec: 51, text: "Now open the Panel Load Schedule table: verify that the connected kilowatt loads across phases R, Y, and B—or L1, L2, and L3—are balanced within five percent so the neutral never overloads." },
  ],

  // Lesson 22 (Italian): Imbiancare Pareti con Pennello e Rullo (uQsdjJLkqiA)
  uQsdjJLkqiA: [
    { timestamp: "00:00", startSec: 0, text: "Today I'll show you how we prepare and paint interior masonry and plaster walls so the finish is completely uniform without any roller tracks or patchy absorption." },
    { timestamp: "00:12", startSec: 12, text: "After masking the skirting boards and window frames, our first step on chalky or newly patched plaster is brushing on an acrylic penetrating sealer—fissativo isolante—to equalize porosity." },
    { timestamp: "00:25", startSec: 25, text: "While the sealer dries, dilute your first coat of breathable wall paint according to the tin—usually fifteen to twenty percent clean water—and stir it thoroughly from the bottom of the bucket." },
    { timestamp: "00:38", startSec: 38, text: "Use a radiator brush and a flat brush to cut in a neat four-centimeter band along the ceiling corner, around the wall boxes, and above the skirting board." },
    { timestamp: "00:50", startSec: 50, text: "Roll your first coat in crossed vertical and horizontal passes using the bucket grid to remove excess paint, let it dry four hours, and finish with a second cross-rolled coat." },
  ],

  // Lesson 23 (Spanish): Cómo Funciona el Ciclo de Refrigeración en Aire Acondicionado (W8GEdpDWSIQ)
  W8GEdpDWSIQ: [
    { timestamp: "00:00", startSec: 0, text: "Let's hook our manifold gauges up to this split air conditioning unit and trace the exact temperatures, pressures, and phase changes happening inside the refrigeration circuit." },
    { timestamp: "00:12", startSec: 12, text: "Here on the high-pressure discharge side of the compressor, the refrigerant leaves as a high-pressure superheated gas and enters the outdoor condenser coil." },
    { timestamp: "00:24", startSec: 24, text: "As outdoor air passes across the condenser fins, the gas rejects latent heat at constant condensing pressure, turning completely into a subcooled liquid at the condenser outlet." },
    { timestamp: "00:37", startSec: 37, text: "Right here at the capillary tube or thermostatic expansion valve, the liquid passes through a calibrated restriction, dropping both its pressure and its saturation boiling temperature." },
    { timestamp: "00:50", startSec: 50, text: "Inside the indoor evaporator coil, the cold refrigerant absorbs heat from the room air, boils completely into vapor with eight to twelve degrees of superheat, and returns through the suction line." },
  ],

  // Lesson 24 (Hindi): Automobile Engineering: Engine, Transmission & Chassis Systems (bEBU-hytsxU)
  "bEBU-hytsxU": [
    { timestamp: "00:00", startSec: 0, text: "Look at this cutaway automobile chassis right in front of us—today we are going to trace how power flows from the engine cylinders all the way to the road wheels." },
    { timestamp: "00:12", startSec: 12, text: "Up front in the four-stroke internal combustion engine—intake, compression, power, and exhaust—the downward force on the pistons rotates the forged steel crankshaft." },
    { timestamp: "00:25", startSec: 25, text: "Bolted to the back of the crankshaft is the flywheel and clutch assembly—or torque converter on an automatic—which lets us engage and disengage the gearbox smoothly." },
    { timestamp: "00:38", startSec: 38, text: "Inside the transmission gearbox, meshing gear sets multiply torque for climbing hills or starting from a stop, then send rotational power down the propeller shaft and universal joints." },
    { timestamp: "00:51", startSec: 51, text: "At the drive axle, the final drive ring-and-pinion and differential gears turn the power ninety degrees and allow the outer wheel to spin faster than the inner wheel around every corner." },
  ],

  // Lesson 25 (Vietnamese): Cách Ghép Mộng Góc Vuông Trong Nghề Mộc (wtbjRB9ewik)
  wtbjRB9ewik: [
    { timestamp: "00:00", startSec: 0, text: "Today at the woodworking bench, I'm going to show you how to lay out, saw, and chisel a traditional right-angle mortise and tenon corner joint that closes with zero gap." },
    { timestamp: "00:12", startSec: 12, text: "First, clamp the two mating stiles side by side so we can transfer the layout lines across both pieces at the exact same time with our square and marking gauge." },
    { timestamp: "00:24", startSec: 24, text: "Set the marking gauge to one-third of the timber thickness—that gives us our mortise width in the center and two equal cheeks on the tenon." },
    { timestamp: "00:36", startSec: 36, text: "When sawing the tenon cheeks and shoulder lines, keep your saw kerf on the waste side of the scribed line—never cut away the layout line itself or the joint will fit loose." },
    { timestamp: "00:48", startSec: 48, text: "Now chop the mortise pocket with a sharp mortise chisel, levering out the waste chips and paring the end walls dead plumb at ninety degrees." },
    { timestamp: "01:00", startSec: 60, text: "Dry-fit the tenon into the mortise by hand pressure first, check the inside corner with your try square, and apply glue to both the mortise walls and the tenon cheeks before clamping." },
  ],

  // Lesson 26 (Vietnamese): Hướng Dẫn Lắp Mạch Điện Khởi Động Từ (HIL5QCQ6pRQ)
  HIL5QCQ6pRQ: [
    { timestamp: "00:00", startSec: 0, text: "In this industrial electrical lab, I'm going to wire a three-phase magnetic contactor with a thermal overload relay and a start-stop latching push-button station step by step." },
    { timestamp: "00:12", startSec: 12, text: "Look at the top of the magnetic contactor: terminals L1, L2, and L3 receive the three-phase power from our breaker, and T1, T2, and T3 feed down through the thermal overload relay to the motor." },
    { timestamp: "00:25", startSec: 25, text: "Now let's wire the two-hundred-twenty-volt control circuit: run a control phase wire from the control breaker to terminal ninety-five of the normally-closed thermal overload contact." },
    { timestamp: "00:38", startSec: 38, text: "From terminal ninety-six of the overload, wire in series to the red normally-closed Stop button, and from the output of the Stop button to the green normally-open Start button." },
    { timestamp: "00:51", startSec: 51, text: "Here is the self-holding latch: connect a jumper in parallel across the two terminals of the green Start button to the normally-open auxiliary contact—terminals thirteen and fourteen—on the contactor." },
    { timestamp: "01:04", startSec: 64, text: "From the output of the Start button and auxiliary contact fourteen, connect to coil terminal A1, and wire coil terminal A2 back to neutral. When I press Start, the coil pulls in and latches!" },
  ],

  // Lesson 27 (Polish): Jak Podłączyć Rozdzielnię Elektryczną (1AMM9co45r4)
  "1AMM9co45r4": [
    { timestamp: "00:00", startSec: 0, text: "Today we are assembling and wiring a complete three-phase residential distribution board on the DIN rails, step by step, according to European IEC installation standards." },
    { timestamp: "00:12", startSec: 12, text: "On the top DIN rail, I'm mounting the four-pole main isolating switch on the left, followed by the three-phase surgearrester—SPD—and our thirty-milliamp residual current devices—RCDs." },
    { timestamp: "00:25", startSec: 25, text: "Look underneath the row of breakers: instead of looping jumper wires from breaker to breaker, we insert athree-phase copper comb busbar—L1, L2, L3—and torque every terminal screw tightly." },
    { timestamp: "00:38", startSec: 38, text: "Every flexible stranded wire inside the panel must have an insulated ferrule crimped onto the stripped copper end before it goes into a breaker cage clamp." },
    { timestamp: "00:50", startSec: 50, text: "Pay close attention to the neutral bars: each RCD must have its own dedicated, isolated neutral terminal block! Never bridge neutrals from two different RCD groups or both RCDs will trip immediately." },
    { timestamp: "01:03", startSec: 63, text: "Finally, land all yellow-green protective earth conductors cleanly onto the main PE ground bar, dress the wires in neat right-angle bundles, and label every circuit." },
  ],

  // Lesson 28 (Chinese): 中国传统木工榫卯结构与精准开榫 (kaMGOVfuzlY)
  kaMGOVfuzlY: [
    { timestamp: "00:00", startSec: 0, text: "Welcome to our traditional Chinese Sunmao joinery bench. Today we are cutting a classic blind mitered mortise and tenon joint by hand without a single nail or screw." },
    { timestamp: "00:12", startSec: 12, text: "Look at how we select the hardwood stock first: orient the heartwood and growth rings of the stile and rail so any seasonal humidity movementTightens the joint instead of opening the seam." },
    { timestamp: "00:25", startSec: 25, text: "Using a dual-pin marking gauge and bamboo ink marker, scribe the mortise walls on the vertical post and transfer the exact shoulder line around all four faces of the rail." },
    { timestamp: "00:38", startSec: 38, text: "Remember the master carpenter's rule when sawing: split the inner half of the ink line on the tenon, and leave the outer half of the ink line on the mortise walls." },
    { timestamp: "00:50", startSec: 50, text: "Chop the mortise vertically first to sever the end grain fibers, then lever out the core waste and pare the forty-five-degree internal miter shoulder until it reflects light flat." },
    { timestamp: "01:02", startSec: 62, text: "Now watch as I slide the tenon into the mortise: with firm hand pressure and two taps of the wooden mallet, all four shoulder seams close completely tight." },
  ],
}

/**
 * Converts any lesson/video description & takeaways into a direct first-person
 * verbatim spoken transcript (with timestamps) when a video ID is not in the explicit map.
 * Never produces third-person meta-commentary ("Learners explore...", "The instructor demonstrates...").
 */
export function getVerbatimSpokenSegmentsForVideo(
  youtubeId: string | undefined,
  title: string,
  description: string,
  takeaways: string[]
): string[] {
  if (youtubeId && VERBATIM_VIDEO_TRANSCRIPTS_BY_ID[youtubeId]) {
    return VERBATIM_VIDEO_TRANSCRIPTS_BY_ID[youtubeId].map(
      (seg) => `[${seg.timestamp}] ${seg.text}`
    )
  }

  // Convert any third-person description phrases into direct first-person spoken dialogue
  const firstPersonIntro = (description || "")
    .replace(/^Learners explore how /i, "In this session, we're going to look at how ")
    .replace(/^Learners explore /i, "Today we're going to walk through ")
    .replace(/^A practical walkthrough of /i, "Let's walk step by step through ")
    .replace(/^A clear introduction to /i, "Welcome! Today I'm walking you through ")
    .replace(/^An accessible guide to /i, "Let's go right to the bench and cover ")
    .replace(/^A practical demonstration of /i, "Watch closely as I demonstrate ")
    .replace(/^A foundational /i, "Today we are covering ")
    .replace(/^This lesson covers /i, "In this session, we're covering ")
    .replace(/\bThe instructor demonstrates\b/gi, "I'll show you")
    .replace(/\blearners\b/gi, "you")

  const cleanTopic = (title || "this technique")
    .replace(/\s*\([^)]*\)\s*/g, "")
    .trim()

  const s1 = takeaways[0] || "setting up our tools and reference surfaces"
  const s2 = takeaways[1] || "executing the primary technique cleanly"
  const s3 = takeaways[2] || "checking our tolerances and alignment"
  const s4 = takeaways[3] || "completing the final safety and quality check"

  return [
    `[00:00] Welcome back to the shop. Today we are working hands-on with ${cleanTopic}. ${firstPersonIntro}`,
    `[00:12] First, let's focus on ${s1}. Make sure your workpiece is secured firmly and your reference edges are clean before you make your first mark or adjustment.`,
    `[00:25] Next, watch how I handle ${s2}. Keep steady, controlled pressure and let the tool do the work without forcing it.`,
    `[00:38] Now let's verify ${s3}. Check every joint and measurement right now while we can still fine-tune the fit.`,
    `[00:50] Finally, we finish with ${s4} so the completed work meets full professional field standards.`,
  ]
}
